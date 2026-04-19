// Sends a localized welcome email after a successful web checkout.
// Triggered from the RevenueCat webhook handler on INITIAL_PURCHASE.
// Copy mirrors server/templates/subscribe-success.html so users see a
// consistent message between the success page and their inbox.
import { getUncachableResendClient } from "./resend-client";

export type WelcomeLang = "en" | "es" | "pt";

// LATAM Portuguese-speaking countries → pt. Spanish-speaking LATAM
// countries (and Spain) → es. Everything else → en. Country codes are
// ISO-3166-1 alpha-2, matching what RevenueCat sends in country_code.
const PT_COUNTRIES = new Set(["BR", "PT"]);
const ES_COUNTRIES = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GT", "HN",
  "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

export function langForCountry(country: string | null | undefined): WelcomeLang {
  const c = (country ?? "").toUpperCase();
  if (PT_COUNTRIES.has(c)) return "pt";
  if (ES_COUNTRIES.has(c)) return "es";
  return "en";
}

interface Copy {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  openCta: string;
  restoreLine: string; // contains {LINK} placeholder
  helpLine: string;
  signature: string;
  restoreLabel: string;
  restorePathLang: string;
}

const DEEP_LINK = "fitfemme://";

function copyFor(lang: WelcomeLang, restoreUrl: string): Copy {
  if (lang === "pt") {
    return {
      subject: "Bem-vinda ao Fit Femme Pro",
      preheader: "Sua assinatura está ativa. Abra o app para começar.",
      heading: "Tudo certo!",
      intro:
        "Obrigada por assinar o Fit Femme Pro. Sua conta já está ativa e pronta para uso.",
      openCta: "Abrir Fit Femme",
      restoreLine:
        "Se o Pro não desbloquear sozinho em um minuto, abra o app e toque em <b>Restaurar compras</b> ou use este link para re-sincronizar:<br><a href=\"{LINK}\">{LINK}</a>",
      helpLine:
        "Precisa de ajuda? Basta responder a este e-mail e nossa equipe te atenderá.",
      signature: "Equipe Fit Femme",
      restoreLabel: "Re-sincronizar minha conta",
      restorePathLang: "pt",
    };
  }
  if (lang === "es") {
    return {
      subject: "Bienvenida a Fit Femme Pro",
      preheader: "Tu suscripción está activa. Abre la app para empezar.",
      heading: "¡Listo!",
      intro:
        "Gracias por suscribirte a Fit Femme Pro. Tu cuenta ya está activa y lista para usar.",
      openCta: "Abrir Fit Femme",
      restoreLine:
        "Si Pro no se activa solo en un minuto, abre la app y toca <b>Restaurar compras</b> o usa este enlace para volver a sincronizar:<br><a href=\"{LINK}\">{LINK}</a>",
      helpLine:
        "¿Necesitas ayuda? Responde a este correo y nuestro equipo te atenderá.",
      signature: "Equipo Fit Femme",
      restoreLabel: "Re-sincronizar mi cuenta",
      restorePathLang: "es",
    };
  }
  return {
    subject: "Welcome to Fit Femme Pro",
    preheader: "Your subscription is active. Open the app to get started.",
    heading: "You're in.",
    intro:
      "Thanks for subscribing to Fit Femme Pro. Your account is now active and ready to use.",
    openCta: "Open Fit Femme",
    restoreLine:
      "If Pro doesn't unlock automatically within a minute, open the app and tap <b>Restore purchases</b>, or use this link to re-sync:<br><a href=\"{LINK}\">{LINK}</a>",
    helpLine:
      "Need help? Just reply to this email and our team will take care of it.",
    signature: "The Fit Femme Team",
    restoreLabel: "Re-sync my account",
    restorePathLang: "en",
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(c: Copy): string {
  // c.restoreLine has already had its {LINK} placeholder replaced with
  // a real URL by the caller (sendWelcomeEmail).
  const restoreLine = c.restoreLine;
  return `<!doctype html>
<html lang="${c.restorePathLang}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(c.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#221019;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;">
    <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(c.preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#221019;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#2d1420;border-radius:16px;padding:32px;">
            <tr><td align="center" style="padding-bottom:16px;">
              <div style="width:64px;height:64px;border-radius:50%;background:#d41173;color:#ffffff;font-size:34px;font-weight:800;line-height:64px;text-align:center;">&#10003;</div>
            </td></tr>
            <tr><td align="center" style="font-size:24px;font-weight:800;color:#ffffff;padding-bottom:12px;">${escapeHtml(c.heading)}</td></tr>
            <tr><td style="font-size:15px;line-height:1.55;color:#e8d5dd;padding-bottom:20px;text-align:center;">${escapeHtml(c.intro)}</td></tr>
            <tr><td align="center" style="padding-bottom:24px;">
              <a href="${DEEP_LINK}" style="display:inline-block;padding:14px 28px;background:#d41173;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;font-size:16px;">${escapeHtml(c.openCta)}</a>
            </td></tr>
            <tr><td style="font-size:14px;line-height:1.55;color:#e8d5dd;padding-bottom:16px;">${restoreLine}</td></tr>
            <tr><td style="font-size:13px;line-height:1.55;color:#9a7884;padding-bottom:16px;">${escapeHtml(c.helpLine)}</td></tr>
            <tr><td style="font-size:13px;color:#9a7884;">— ${escapeHtml(c.signature)}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(c: Copy, restoreUrl: string): string {
  return [
    c.heading,
    "",
    c.intro,
    "",
    `${c.openCta}: ${DEEP_LINK}`,
    "",
    c.restoreLine.replace(/<[^>]+>/g, "").split("{LINK}").join(restoreUrl),
    "",
    c.helpLine,
    "",
    `— ${c.signature}`,
  ].join("\n");
}

function publicBase(): string {
  const fromEnv =
    process.env.PUBLIC_BASE_URL ??
    process.env.EXPO_PUBLIC_DOMAIN ??
    process.env.REPLIT_DEV_DOMAIN ??
    "";
  if (!fromEnv) return "";
  if (/^https?:\/\//i.test(fromEnv)) return fromEnv.replace(/\/+$/, "");
  return `https://${fromEnv.replace(/\/+$/, "")}`;
}

export interface SendWelcomeEmailArgs {
  to: string;
  country: string | null | undefined;
}

// Sends the welcome email. Returns true on success, false on any
// failure (logged). The webhook handler must NOT fail because of
// email delivery — RevenueCat would retry the entire event.
export async function sendWelcomeEmail(
  args: SendWelcomeEmailArgs,
): Promise<boolean> {
  const to = (args.to ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.warn("welcome email skipped: invalid recipient", { to });
    return false;
  }
  const lang = langForCountry(args.country);
  const base = publicBase();
  const restoreUrl = `${base}/subscribe/restore?lang=${lang}`;
  const c = copyFor(lang, restoreUrl);
  // Inject the resolved restore URL into the template line.
  c.restoreLine = c.restoreLine.split("{LINK}").join(restoreUrl);

  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const from =
      process.env.RESEND_FROM_EMAIL ||
      fromEmail ||
      "Fit Femme <onboarding@resend.dev>";
    const result = await client.emails.send({
      from,
      to,
      subject: c.subject,
      html: renderHtml(c),
      text: renderText(c, restoreUrl),
    });
    if (result.error) {
      console.error("welcome email send error:", result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("welcome email exception:", err);
    return false;
  }
}
