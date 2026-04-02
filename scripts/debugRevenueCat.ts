import { createClient } from "@replit/revenuecat-sdk/client";
import { listProjects } from "@replit/revenuecat-sdk";

async function main() {
  const apiKey = process.env.REVENUECAT_API_KEY;
  console.log("API key exists:", !!apiKey);
  console.log("API key prefix:", apiKey?.substring(0, 8));

  const client = createClient({
    baseUrl: "https://api.revenuecat.com/v2",
    headers: { Authorization: "Bearer " + apiKey },
  });

  const result = await listProjects({ client, query: { limit: 20 } });
  console.log("error:", JSON.stringify(result.error, null, 2));
  console.log("data:", JSON.stringify(result.data, null, 2));
}

main().catch(console.error);
