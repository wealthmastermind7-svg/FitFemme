import { listPaywalls, getPaywall, listOfferings } from "@replit/revenuecat-sdk";
import { getUncachableRevenueCatClient } from "./revenueCatClient";

async function main() {
  const client = await getUncachableRevenueCatClient();
  const projectId = process.env.REVENUECAT_PROJECT_ID!;

  const { data: offerings } = await listOfferings({
    client,
    path: { project_id: projectId },
    throwOnError: true,
  });
  console.log("=== OFFERINGS ===");
  console.log(JSON.stringify(offerings?.items?.map((o: any) => ({ id: o.id, lookup_key: o.lookup_key, is_current: o.is_current })), null, 2));

  const { data: paywalls } = await listPaywalls({
    client,
    path: { project_id: projectId },
    throwOnError: true,
  });
  console.log("\n=== PAYWALLS LIST ===");
  console.log(JSON.stringify(paywalls?.items?.map((p: any) => ({ id: p.id, name: p.name, offering_id: p.offering_id, published_at_ms: p.published_at_ms, created_at_ms: p.created_at_ms })), null, 2));

  const targetId = "pwcd369381119142c1";
  const target = paywalls?.items?.find((p: any) => p.id === targetId);
  if (target) {
    const { data: full } = await getPaywall({
      client,
      path: { project_id: projectId, paywall_id: targetId },
      throwOnError: true,
    });
    console.log("\n=== TARGET PAYWALL FULL ===");
    console.log("id:", (full as any)?.id);
    console.log("name:", (full as any)?.name);
    console.log("offering_id:", (full as any)?.offering_id);
    console.log("published_at_ms:", (full as any)?.published_at_ms);
    console.log("has published components:", !!(full as any)?.components?.published);
    console.log("has draft components:", !!(full as any)?.components?.draft);
    const pub = (full as any)?.components?.published;
    if (pub) {
      console.log("published default_locale:", pub.default_locale);
      const data = pub.data;
      console.log("published data keys:", data ? Object.keys(data) : null);
    }
  } else {
    console.log("Target paywall pwcd369381119142c1 NOT FOUND in list.");
  }
}

main().catch((e) => {
  console.error("ERROR:", e?.message || e);
  if (e?.response) console.error("response:", JSON.stringify(e.response, null, 2));
  process.exit(1);
});
