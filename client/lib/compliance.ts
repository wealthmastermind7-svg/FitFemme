import { Platform } from "react-native";
import { translations } from "./i18n";

// ── iOS App Store guideline 3.1.3 (Other Purchasing Methods) ─────────────
// The native iOS app must NOT contain links, buttons, or copy directing
// users to an external web checkout for digital goods. Our LATAM web
// checkout (/subscribe, /subscribe/success, /subscribe/restore on
// fitfemme.cerolauto.store) is promoted ONLY through the marketing
// site, email, push notifications, and the Android app.
//
// This module enforces that rule with a boot-time assertion: it walks
// every localized string and refuses to start the app if any of them
// reference the forbidden paths or host. Anyone who accidentally adds
// a "Pay on the web" CTA to the app will see the assertion fire on
// the next reload, in dev or in TestFlight, before App Review ever
// sees it.
export const IOS_FORBIDDEN_WEB_PURCHASE_PATTERNS: readonly RegExp[] = [
  /\/subscribe(\?|\/|$|\b)/i,
  /fitfemme\.cerolauto\.store\/subscribe/i,
  /pay\.rev\.cat/i,
  /billing\.revenuecat\.com/i,
];

function scanValue(value: unknown, path: string, hits: string[]): void {
  if (typeof value === "string") {
    for (const pattern of IOS_FORBIDDEN_WEB_PURCHASE_PATTERNS) {
      if (pattern.test(value)) {
        hits.push(`${path} matches ${pattern}: "${value}"`);
        return;
      }
    }
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      scanValue(v, path ? `${path}.${k}` : k, hits);
    }
  }
}

// Returns the list of violating i18n string paths. Empty array == clean.
export function findIosWebCheckoutViolations(): string[] {
  const hits: string[] = [];
  scanValue(translations, "translations", hits);
  return hits;
}

// Call once at app boot. On iOS, throws when any in-app copy points at
// the web checkout. On other platforms it's a noop (web/Android may
// reference the web paths freely).
export function assertNoIosWebCheckoutLinks(): void {
  if (Platform.OS !== "ios") return;
  const hits = findIosWebCheckoutViolations();
  if (hits.length === 0) return;
  const msg =
    "App Store guideline 3.1.3 violation: in-app copy links to the web " +
    "checkout. Remove these strings before shipping to TestFlight:\n" +
    hits.map((h) => `  - ${h}`).join("\n");
  if (__DEV__) throw new Error(msg);
  // In production builds we still log loudly; we don't want to crash a
  // shipped app over a copy mistake, but it must be visible in Sentry.
  console.error(msg);
}
