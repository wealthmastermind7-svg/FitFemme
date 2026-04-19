import type { Express, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { storage } from "./storage";

// ── Plans ────────────────────────────────────────────────────────────────
// The three tiers Fit Femme sells. Prices match the App Store / Google
// Play offering so users see a consistent price across stores.
export const PLANS = ["monthly", "annual", "lifetime"] as const;
export type PlanId = (typeof PLANS)[number];

export const PLAN_PRICES: Record<PlanId, string> = {
  monthly: "$1.99",
  annual: "$14.99",
  lifetime: "$49.99",
};

// Hosted-checkout URLs. When configured in RevenueCat Web Billing
// (or Stripe Payment Links), paste the per-plan URL into these env
// vars. The page appends the App User ID and email as query params.
function getCheckoutUrls(): Record<PlanId, string> {
  return {
    monthly: process.env.REVENUECAT_WEB_CHECKOUT_MONTHLY_URL ?? "",
    annual: process.env.REVENUECAT_WEB_CHECKOUT_ANNUAL_URL ?? "",
    lifetime: process.env.REVENUECAT_WEB_CHECKOUT_LIFETIME_URL ?? "",
  };
}

// ── Locale + country detection ───────────────────────────────────────────
const SUPPORTED_LANGS = ["en", "es", "pt"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function pickLang(req: Request): Lang {
  const q = String(req.query.lang ?? "").toLowerCase();
  if ((SUPPORTED_LANGS as readonly string[]).includes(q)) return q as Lang;
  const accept = (req.header("accept-language") ?? "").toLowerCase();
  if (accept.startsWith("pt")) return "pt";
  if (accept.startsWith("es")) return "es";
  return "en";
}

function pickCountry(req: Request): string {
  const q = String(req.query.country ?? "").toUpperCase();
  if (/^[A-Z]{2}$/.test(q)) return q;
  // Cloudflare / common reverse-proxy headers
  const cf = req.header("cf-ipcountry");
  if (cf && /^[A-Z]{2}$/i.test(cf)) return cf.toUpperCase();
  const xc = req.header("x-vercel-ip-country");
  if (xc && /^[A-Z]{2}$/i.test(xc)) return xc.toUpperCase();
  // Best-effort fallback from language
  const lang = pickLang(req);
  if (lang === "pt") return "BR";
  if (lang === "es") return "MX";
  return "US";
}

function loadTemplate(name: string): string {
  return fs.readFileSync(
    path.resolve(process.cwd(), "server", "templates", name),
    "utf-8",
  );
}

// Escape arbitrary user input for safe embedding inside an HTML body OR
// inside an inline JS string literal. We strip everything outside a
// strict whitelist (alphanumerics + punctuation that's harmless in both
// HTML and JS string contexts), so the value cannot break out into
// markup or script regardless of where the placeholder lives.
function escapeForTemplate(value: string): string {
  return String(value ?? "").replace(/[^A-Za-z0-9 _.@+\-]/g, "");
}

// `untrusted` values are scrubbed (used for query-string inputs);
// `trusted` values are server-controlled (lang, country, JSON config)
// and inserted as-is.
function renderTemplate(
  name: string,
  trusted: Record<string, string>,
  untrusted: Record<string, string> = {},
): string {
  let html = loadTemplate(name);
  for (const [k, v] of Object.entries(trusted)) {
    html = html.split(`{{${k}}}`).join(v);
  }
  for (const [k, v] of Object.entries(untrusted)) {
    html = html.split(`{{${k}}}`).join(escapeForTemplate(v));
  }
  return html;
}

// ── Rate limiting (anti-enumeration) ─────────────────────────────────────
// In-memory token bucket per IP. Restore lookups are intentionally
// rare (a user clicking "I already paid"); aggressive limits make
// brute-forcing email addresses infeasible without locking real
// users out. RevenueCat is the entitlement source of truth, so this
// endpoint is purely a UX hint — failing closed costs nothing.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  const fwd = (req.header("x-forwarded-for") ?? "").split(",")[0].trim();
  return fwd || req.ip || "unknown";
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_MAX;
}

// Periodic GC so the map cannot grow without bound.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateBuckets) if (v.resetAt < now) rateBuckets.delete(k);
}, RATE_WINDOW_MS).unref?.();

// ── Webhook payload types ────────────────────────────────────────────────
// Subset of the RevenueCat webhook event we rely on. Extra fields are
// preserved verbatim in `raw` for support / forensics.
// See https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
interface RevenueCatSubscriberAttribute {
  value?: string;
  updated_at_ms?: number;
}

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  product_id?: string;
  store?: string;
  country_code?: string;
  event_timestamp_ms?: number;
  subscriber_attributes?: Record<string, RevenueCatSubscriberAttribute>;
  [key: string]: unknown;
}

interface RevenueCatWebhookBody {
  event?: RevenueCatEvent;
}

// ── Webhook signature verification ───────────────────────────────────────
// RevenueCat webhooks include an Authorization header that must equal
// REVENUECAT_WEBHOOK_AUTH (set in both the dashboard and this env).
function verifyWebhook(req: Request): boolean {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected) return false;
  const got = req.header("authorization") ?? "";
  return got === expected;
}

// Map a RevenueCat event type to our internal status. Note: per
// RevenueCat docs CANCELLATION fires when auto-renew is turned off but
// the user still has access until EXPIRATION. We keep the row "active"
// on cancellation and only flip to "expired" when EXPIRATION fires, so
// `hasActive` lookups stay accurate during the wind-down window.
function mapEventToStatus(eventType: string): string {
  const t = (eventType ?? "").toUpperCase();
  if (
    t === "INITIAL_PURCHASE" ||
    t === "RENEWAL" ||
    t === "UNCANCELLATION" ||
    t === "CANCELLATION" ||
    t === "BILLING_ISSUE"
  )
    return "active";
  if (t === "EXPIRATION") return "expired";
  if (t === "REFUND") return "refunded";
  return t.toLowerCase() || "unknown";
}

// Map a known product id to one of our plan slugs.
function mapProductToPlan(productId: string): string {
  const id = (productId ?? "").toLowerCase();
  if (id.includes("lifetime")) return "lifetime";
  if (id.includes("annual") || id.includes("yearly") || id.includes("year"))
    return "annual";
  if (id.includes("month")) return "monthly";
  return "unknown";
}

// ── Routes ───────────────────────────────────────────────────────────────
export function registerWebCheckoutRoutes(app: Express) {
  // GET /subscribe — localized plan picker + email capture
  app.get("/subscribe", (req: Request, res: Response) => {
    const lang = pickLang(req);
    const country = pickCountry(req);
    const checkoutUrls = getCheckoutUrls();
    const configured = Object.values(checkoutUrls).some((u) => u.length > 0);
    const html = renderTemplate("subscribe.html", {
      LANG: lang,
      COUNTRY: country,
      CHECKOUT_URLS_JSON: JSON.stringify(checkoutUrls),
      CONFIGURED: configured ? "true" : "false",
      PRICES_JSON: JSON.stringify(PLAN_PRICES),
    }, {});
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  // GET /subscribe/success — confirmation + deep link back to the app
  app.get("/subscribe/success", (req: Request, res: Response) => {
    const lang = pickLang(req);
    const html = renderTemplate(
      "subscribe-success.html",
      { LANG: lang },
      {
        EMAIL: String(req.query.email ?? ""),
        PLAN: String(req.query.plan ?? ""),
      },
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  // GET /subscribe/restore — re-sync entitlement by email
  app.get("/subscribe/restore", (req: Request, res: Response) => {
    const lang = pickLang(req);
    const html = renderTemplate("subscribe-restore.html", { LANG: lang });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  // GET /api/web-purchases/lookup?email=... — used by the restore page.
  // Returns ONLY a boolean to avoid leaking purchase history. To
  // prevent paid-account enumeration we (a) rate-limit by IP and
  // (b) on rate-limit hit return the same neutral 200 shape an
  // unknown email would, so an attacker cannot tell whether they
  // tripped the limit on a real address. RevenueCat remains the
  // source of truth; this endpoint is purely a UX hint.
  app.get(
    "/api/web-purchases/lookup",
    async (req: Request, res: Response) => {
      const email = String(req.query.email ?? "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "valid email required" });
      }
      if (!rateLimitOk(clientIp(req))) {
        // Constant-shape "no active sub" reply. The restore page
        // tells the user to check their email either way, so a
        // false negative here just nudges them to support — never
        // exposes whether the address has an account.
        return res.json({ hasActive: false });
      }
      const rows = await storage.listWebPurchasesByEmail(email);
      const hasActive = rows.some((r) => r.status === "active");
      return res.json({ hasActive });
    },
  );

  // POST /api/revenuecat/webhook — receive purchase / renewal / cancel
  app.post(
    "/api/revenuecat/webhook",
    async (req: Request, res: Response) => {
      if (!verifyWebhook(req)) {
        return res.status(401).json({ error: "unauthorized" });
      }
      try {
        const body = (req.body ?? {}) as RevenueCatWebhookBody;
        const event: RevenueCatEvent = body.event ?? {};
        const appUserId = String(event.app_user_id ?? "").trim();
        const productId = String(event.product_id ?? "").trim();
        if (!appUserId || !productId) {
          return res
            .status(400)
            .json({ error: "missing app_user_id or product_id" });
        }
        // RevenueCat lets you pass an email via aliases or attributes.
        // We tell the checkout page to set App User ID = email, so we
        // can use it directly here.
        const emailAttr = event.subscriber_attributes?.["$email"]?.value;
        const email = appUserId.includes("@")
          ? appUserId
          : (emailAttr ?? appUserId);

        await storage.upsertWebPurchase({
          email,
          appUserId,
          productId,
          plan: mapProductToPlan(productId),
          status: mapEventToStatus(event.type ?? ""),
          processor: event.store ?? "web_billing",
          country: event.country_code ?? null,
          eventTimestampMs: event.event_timestamp_ms ?? null,
          raw: event,
        });
        return res.json({ ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "webhook error";
        console.error("revenuecat webhook error:", err);
        return res.status(500).json({ error: message });
      }
    },
  );
}
