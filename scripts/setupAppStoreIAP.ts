import { subtle } from "crypto";
import fetch from "node-fetch";

const APPLE_APP_ID = "6757249898";
const BUNDLE_ID = "com.fitfemme.app";
const BASE_URL = "https://api.appstoreconnect.apple.com/v1";

function extractPkcs8Der(raw: string): Buffer {
  // Normalize newlines (handle literal \n from env vars)
  const pem = raw.replace(/\\n/g, "\n").trim();
  // Strip PEM headers/footers and decode base64
  const base64 = pem
    .replace(/-----BEGIN (?:PRIVATE|EC PRIVATE) KEY-----/g, "")
    .replace(/-----END (?:PRIVATE|EC PRIVATE) KEY-----/g, "")
    .replace(/\s/g, "");
  return Buffer.from(base64, "base64");
}

async function generateJWT(): Promise<string> {
  const issuerId = process.env.ASC_ISSUER_ID;
  const keyId = process.env.ASC_KEY_ID;
  const privateKey = process.env.ASC_PRIVATE_KEY;

  if (!issuerId || !keyId || !privateKey) {
    throw new Error("Missing ASC_ISSUER_ID, ASC_KEY_ID, or ASC_PRIVATE_KEY environment variables");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iss: issuerId, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" })).toString("base64url");
  const signingInput = `${header}.${payload}`;

  const der = extractPkcs8Der(privateKey);
  const cryptoKey = await subtle.importKey(
    "pkcs8",
    der,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const sigBuffer = await subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    Buffer.from(signingInput)
  );
  const signature = Buffer.from(sigBuffer).toString("base64url");

  return `${signingInput}.${signature}`;
}

async function ascRequest(method: string, path: string, body?: object) {
  const token = await generateJWT();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    console.error(`❌ ${method} ${path} → ${res.status}`);
    console.error(JSON.stringify(data, null, 2));
    return null;
  }
  return data;
}

async function createSubscriptionGroup(name: string, existingGroupId?: string): Promise<string | null> {
  // If we already know the group ID, verify it exists and return it
  if (existingGroupId) {
    console.log(`\n🔍 Verifying existing subscription group: ${existingGroupId}...`);
    const check = await ascRequest("GET", `/subscriptionGroups/${existingGroupId}`);
    if (check?.data?.id) {
      console.log(`✅ Found existing group: ${check.data.attributes.referenceName} (${existingGroupId})`);
      return existingGroupId;
    }
  }

  console.log(`\n📦 Creating subscription group: "${name}"...`);
  const res = await fetch(`${BASE_URL}/subscriptionGroups`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await generateJWT()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "subscriptionGroups",
        attributes: { referenceName: name },
        relationships: {
          app: { data: { type: "apps", id: APPLE_APP_ID } },
        },
      },
    }),
  });

  const data: any = await res.json();

  if (res.status === 409) {
    // Group already exists - ask user to provide the ID
    console.error(`⚠️  Group "${name}" already exists. Checking for existing group ID...`);
    // Try to use a well-known fallback
    return null;
  }

  if (!res.ok || !data?.data?.id) {
    console.error(`❌ POST /subscriptionGroups → ${res.status}`);
    console.error(JSON.stringify(data, null, 2));
    return null;
  }

  console.log(`✅ Subscription group created: ${data.data.id}`);
  return data.data.id;
}

async function createSubscription(groupId: string, opts: {
  name: string;
  productId: string;
  subscriptionPeriod: string;
  reviewNote?: string;
}): Promise<string | null> {
  console.log(`\n📋 Creating subscription: "${opts.name}" (${opts.productId})...`);
  const result = await ascRequest("POST", "/subscriptions", {
    data: {
      type: "subscriptions",
      attributes: {
        name: opts.name,
        productId: opts.productId,
        familySharable: false,
        reviewNote: opts.reviewNote ?? "Fitness subscription unlocking all premium workouts and features.",
        subscriptionPeriod: opts.subscriptionPeriod,
        groupLevel: 1,
      },
      relationships: {
        group: { data: { type: "subscriptionGroups", id: groupId } },
      },
    },
  });

  if (!result?.data?.id) return null;
  console.log(`✅ Subscription created: ${result.data.id}`);
  return result.data.id;
}

async function createLifetimeIAP(): Promise<string | null> {
  console.log(`\n💎 Creating lifetime IAP: "lifetime_pro"...`);
  // Non-consumable IAPs require the v2 endpoint
  const token = await generateJWT();
  const res = await fetch("https://api.appstoreconnect.apple.com/v2/inAppPurchases", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "inAppPurchases",
        attributes: {
          name: "Lifetime Pro",
          productId: "lifetime_pro",
          inAppPurchaseType: "NON_CONSUMABLE",
          reviewNote: "One-time purchase unlocking all premium workouts and features forever.",
          familySharable: false,
        },
        relationships: {
          app: { data: { type: "apps", id: APPLE_APP_ID } },
        },
      },
    }),
  });

  const data: any = await res.json();
  if (!res.ok || !data?.data?.id) {
    console.error(`❌ POST /v2/inAppPurchases → ${res.status}`);
    console.error(JSON.stringify(data, null, 2));
    return null;
  }
  console.log(`✅ Lifetime IAP created: ${data.data.id}`);
  return data.data.id;
}

async function addIAPLocalizationV2(iapId: string, name: string, description: string) {
  console.log(`  🌐 Adding English localization for ${name}...`);
  const result = await ascRequest("POST", "/inAppPurchaseLocalizations", {
    data: {
      type: "inAppPurchaseLocalizations",
      attributes: { name, locale: "en-US", description },
      relationships: {
        inAppPurchaseV2: { data: { type: "inAppPurchases", id: iapId } },
      },
    },
  });
  if (result?.data?.id) console.log(`  ✅ Localization added`);
}

async function addSubscriptionLocalization(subscriptionId: string, name: string, description: string) {
  console.log(`  🌐 Adding English localization for ${name}...`);
  const result = await ascRequest("POST", "/subscriptionLocalizations", {
    data: {
      type: "subscriptionLocalizations",
      attributes: { name, locale: "en-US", description },
      relationships: {
        subscription: { data: { type: "subscriptions", id: subscriptionId } },
      },
    },
  });
  if (result?.data?.id) console.log(`  ✅ Localization added`);
}

async function addIAPLocalization(iapId: string, name: string, description: string) {
  console.log(`  🌐 Adding English localization for ${name}...`);
  const result = await ascRequest("POST", "/inAppPurchaseLocalizations", {
    data: {
      type: "inAppPurchaseLocalizations",
      attributes: { name, locale: "en-US", description },
      relationships: {
        inAppPurchaseV2: { data: { type: "inAppPurchases", id: iapId } },
      },
    },
  });
  if (result?.data?.id) console.log(`  ✅ Localization added`);
}

async function listExistingSubscriptionGroups() {
  const result = await ascRequest("GET", `/subscriptionGroups?filter[app]=${APPLE_APP_ID}&limit=50`);
  return result?.data ?? [];
}

async function listExistingSubscriptions(groupId: string): Promise<any[]> {
  const result = await ascRequest("GET", `/subscriptionGroups/${groupId}/subscriptions?limit=50`);
  return result?.data ?? [];
}

// Known IDs from previous API calls (update these if you reset your app)
const KNOWN_GROUP_ID = process.env.ASC_GROUP_ID ?? "22017065";

async function main() {
  console.log("🚀 Setting up App Store in-app purchases for Fit Femme...");
  console.log(`📱 App ID: ${APPLE_APP_ID} | Bundle: ${BUNDLE_ID}\n`);

  // Use known group ID or create a new one
  let groupId: string | null = await createSubscriptionGroup("Fit Femme Pro", KNOWN_GROUP_ID);

  if (!groupId) {
    console.error("❌ Could not create or find subscription group. Aborting.");
    process.exit(1);
  }

  // Check existing subscriptions in the group
  console.log("\n🔍 Checking existing subscriptions in group...");
  const existingSubs = await listExistingSubscriptions(groupId);
  const existingIds: Record<string, string> = {};
  existingSubs.forEach((s: any) => {
    existingIds[s.attributes.productId] = s.id;
    console.log(`  - Found: ${s.attributes.productId} (${s.id})`);
  });

  // Create or reuse Monthly subscription
  let monthlyId = existingIds["monthly_pro"] ?? null;
  if (monthlyId) {
    console.log(`\n✅ Monthly Pro already exists: ${monthlyId}`);
  } else {
    monthlyId = await createSubscription(groupId, {
      name: "Monthly Pro",
      productId: "monthly_pro",
      subscriptionPeriod: "ONE_MONTH",
      reviewNote: "Monthly subscription unlocking all 6 premium workouts, progress tracking, and advanced stats.",
    });
    if (monthlyId) {
      await addSubscriptionLocalization(monthlyId, "Monthly Pro", "All workouts & stats. Billed monthly.");
    }
  }

  // Create or reuse Annual subscription
  let annualId = existingIds["annual_pro"] ?? null;
  if (annualId) {
    console.log(`\n✅ Annual Pro already exists: ${annualId}`);
  } else {
    annualId = await createSubscription(groupId, {
      name: "Annual Pro",
      productId: "annual_pro",
      subscriptionPeriod: "ONE_YEAR",
      reviewNote: "Annual subscription unlocking all 6 premium workouts, progress tracking, and advanced stats.",
    });
    if (annualId) {
      await addSubscriptionLocalization(annualId, "Annual Pro", "All workouts & stats. Best value.");
    }
  }

  // Create Lifetime IAP
  const lifetimeId = await createLifetimeIAP();
  if (lifetimeId) {
    await addIAPLocalizationV2(lifetimeId, "Lifetime Pro", "All workouts forever. One-time purchase.");
  }

  console.log("\n✨ Setup complete! Summary:");
  console.log(`  Subscription Group ID: ${groupId}`);
  console.log(`  Monthly Pro: ${monthlyId ? "✅ Created" : "❌ Failed"}`);
  console.log(`  Annual Pro:  ${annualId ? "✅ Created" : "❌ Failed"}`);
  console.log(`  Lifetime Pro: ${lifetimeId ? "✅ Created" : "❌ Failed"}`);
  console.log("\n⚠️  Next steps in App Store Connect:");
  console.log("  1. Add pricing for each product");
  console.log("  2. Submit screenshots for review");
  console.log("  3. Submit products for review with the app");
}

main().catch(console.error);
