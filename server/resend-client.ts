// Replit Resend integration (blueprint id: resend).
// Fetches API credentials from the Replit Connectors service on every
// call — never cache the client because the access token expires.
import { Resend } from "resend";

interface ResendConnectionSettings {
  api_key?: string;
  from_email?: string;
}

interface ResendConnection {
  settings: ResendConnectionSettings;
}

let connectionSettings: ResendConnection | undefined;

async function getCredentials(): Promise<{
  apiKey: string;
  fromEmail: string;
}> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }
  if (!hostname) {
    throw new Error("REPLIT_CONNECTORS_HOSTNAME not set");
  }

  const res = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    },
  );
  const data = (await res.json()) as { items?: ResendConnection[] };
  connectionSettings = data.items?.[0];

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email ?? "",
  };
}

export async function getUncachableResendClient(): Promise<{
  client: Resend;
  fromEmail: string;
}> {
  const { apiKey, fromEmail } = await getCredentials();
  return { client: new Resend(apiKey), fromEmail };
}
