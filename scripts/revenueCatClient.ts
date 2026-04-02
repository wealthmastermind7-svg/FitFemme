import { createClient } from "@replit/revenuecat-sdk/client";

let connectionSettings: any;

async function getApiKey() {
  if (
    connectionSettings &&
    connectionSettings.settings?.oauth?.credentials?.expires_at &&
    new Date(connectionSettings.settings.oauth.credentials.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.oauth.credentials.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }

  // Query all connections and find the RevenueCat one
  const data = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  ).then((res) => res.json());

  connectionSettings = data.items?.find(
    (item: any) => item.connector_name === "revenuecat"
  );

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("RevenueCat not connected");
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableRevenueCatClient() {
  const apiKey = await getApiKey();
  return createClient({
    baseUrl: "https://api.revenuecat.com/v2",
    headers: { Authorization: "Bearer " + apiKey },
  });
}
