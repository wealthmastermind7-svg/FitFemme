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
  // Returns ONLY a boolean to avoid leaking purchase history / enabling
  // account enumeration. RevenueCat remains the source of truth; this
  // is purely a UX confirmation.
  app.get(
    "/api/web-purchases/lookup",
    async (req: Request, res: Response) => {
      const email = String(req.query.email ?? "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "valid email required" });
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
        const body = req.body as { event?: any };
        const event = body?.event ?? {};
        const appUserId = String(event.app_user_id ?? "").trim();
        const productId = String(event.product_id ?? "").trim();
        if (!appUserId || !productId) {
          return res.status(400).json({ error: "missing app_user_id or product_id" });
        }
        // RevenueCat lets you pass an email via aliases or attributes.
        // We tell the checkout page to set App User ID = email, so we
        // can use it directly here.
        const email = appUserId.includes("@")
          ? appUserId
          : String(event.subscriber_attributes?.$email?.value ?? appUserId);

        await storage.upsertWebPurchase({
          email,
          appUserId,
          productId,
          plan: mapProductToPlan(productId),
          status: mapEventToStatus(String(event.type ?? "")),
          processor: String(event.store ?? "web_billing"),
          country: String(event.country_code ?? "") || null,
          raw: event,
        });
        return res.json({ ok: true });
      } catch (err: any) {
        console.error("revenuecat webhook error:", err);
        return res.status(500).json({ error: err?.message ?? "webhook error" });
      }
    },
  );
}
