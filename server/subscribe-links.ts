// Single source of truth for building tracked links to the web checkout.
// Used by the marketing landing page, transactional emails, and any
// future push / email campaign that drives users to /subscribe.
//
// Reminder (App Store guideline 3.1.3): the iOS app must NEVER link to
// any of these URLs. They are intended for the marketing site, email,
// push notifications, and the Android app.

export type SubscribeLang = "en" | "es" | "pt";
export type SubscribePath = "/subscribe" | "/subscribe/restore" | "/subscribe/success";

export interface SubscribeLinkOptions {
  lang?: SubscribeLang;
  country?: string; // ISO-3166-1 alpha-2, e.g. BR, MX
  source: string;  // utm_source, e.g. "landing", "email", "push", "android_app"
  campaign: string; // utm_campaign, e.g. "latam_web_checkout"
  medium?: string;  // utm_medium, e.g. "web", "email", "push"
  path?: SubscribePath; // defaults to "/subscribe"
  baseUrl?: string;     // overrides the env-derived base
}

export function publicBaseUrl(): string {
  const fromEnv =
    process.env.PUBLIC_BASE_URL ??
    process.env.EXPO_PUBLIC_DOMAIN ??
    process.env.REPLIT_DEV_DOMAIN ??
    "";
  if (!fromEnv) return "";
  if (/^https?:\/\//i.test(fromEnv)) return fromEnv.replace(/\/+$/, "");
  return `https://${fromEnv.replace(/\/+$/, "")}`;
}

// Reject anything that could break out of a query value or look like an
// open redirect. utm values are reflected nowhere except the URL itself,
// but we still keep them strict so analytics dashboards stay clean.
function safeParam(value: string): string {
  return String(value ?? "").replace(/[^A-Za-z0-9_\-.]/g, "").slice(0, 64);
}

export function buildSubscribeUrl(opts: SubscribeLinkOptions): string {
  const base = (opts.baseUrl ?? publicBaseUrl()).replace(/\/+$/, "");
  const path = opts.path ?? "/subscribe";
  const params = new URLSearchParams();
  if (opts.lang) params.set("lang", opts.lang);
  if (opts.country) {
    const c = opts.country.toUpperCase();
    if (/^[A-Z]{2}$/.test(c)) params.set("country", c);
  }
  params.set("utm_source", safeParam(opts.source));
  params.set("utm_campaign", safeParam(opts.campaign));
  if (opts.medium) params.set("utm_medium", safeParam(opts.medium));
  const qs = params.toString();
  return `${base}${path}${qs ? `?${qs}` : ""}`;
}
