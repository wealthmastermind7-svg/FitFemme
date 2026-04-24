import { getUncachableRevenueCatClient } from "./revenueCatClient";

import {
  listProjects,
  createProject,
  listApps,
  createApp,
  listAppPublicApiKeys,
  listProducts,
  createProduct,
  listEntitlements,
  createEntitlement,
  attachProductsToEntitlement,
  listOfferings,
  createOffering,
  updateOffering,
  listPackages,
  createPackages,
  attachProductsToPackage,
  type App,
  type Product,
  type Project,
  type Entitlement,
  type Offering,
  type Package,
  type CreateProductData,
} from "@replit/revenuecat-sdk";

const PROJECT_NAME = "Fit Femme";

const APP_STORE_APP_NAME = "Fit Femme iOS";
const APP_STORE_BUNDLE_ID = "com.fitfemme.app";
const PLAY_STORE_APP_NAME = "Fit Femme Android";
const PLAY_STORE_PACKAGE_NAME = "com.cerolauto.fitfemme";

const ENTITLEMENT_IDENTIFIER = "pro";
const ENTITLEMENT_DISPLAY_NAME = "Pro Access";

const OFFERING_IDENTIFIER = "default";
const OFFERING_DISPLAY_NAME = "Default Offering";

type TestStorePricesResponse = {
  object: string;
  prices: { amount_micros: number; currency: string }[];
};

const PRODUCTS = [
  {
    identifier: "monthly_pro",
    playStoreIdentifier: "monthly_pro:monthly",
    displayName: "Monthly Pro",
    title: "Monthly Pro",
    duration: "P1M" as const,
    packageIdentifier: "$rc_monthly",
    packageDisplayName: "Monthly",
    prices: [
      { amount_micros: 1990000, currency: "USD" },
    ],
    type: "subscription" as const,
  },
  {
    identifier: "annual_pro",
    playStoreIdentifier: "annual_pro:annual",
    displayName: "Annual Pro",
    title: "Annual Pro",
    duration: "P1Y" as const,
    packageIdentifier: "$rc_annual",
    packageDisplayName: "Annual",
    prices: [
      { amount_micros: 14990000, currency: "USD" },
    ],
    type: "subscription" as const,
  },
  {
    identifier: "lifetime_pro",
    playStoreIdentifier: "lifetime_pro",
    displayName: "Lifetime Pro",
    title: "Lifetime Pro",
    duration: undefined,
    packageIdentifier: "$rc_lifetime",
    packageDisplayName: "Lifetime",
    prices: [
      { amount_micros: 49990000, currency: "USD" },
    ],
    type: "non_consumable" as const,
  },
];

async function seedRevenueCat() {
  const client = await getUncachableRevenueCatClient();

  // --- Project ---
  let project: Project;
  const { data: existingProjects, error: listProjectsError } = await listProjects({
    client,
    query: { limit: 20 },
  });
  if (listProjectsError) throw new Error("Failed to list projects");

  const existingProject = existingProjects.items?.find((p) => p.name === PROJECT_NAME);
  if (existingProject) {
    console.log("Project already exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data: newProject, error } = await createProject({
      client,
      body: { name: PROJECT_NAME },
    });
    if (error) throw new Error("Failed to create project");
    console.log("Created project:", newProject.id);
    project = newProject;
  }

  // --- Apps ---
  const { data: apps, error: listAppsError } = await listApps({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listAppsError || !apps || apps.items.length === 0) {
    throw new Error("No apps found");
  }

  let testStoreApp: App | undefined = apps.items.find((a) => a.type === "test_store");
  let appStoreApp: App | undefined = apps.items.find((a) => a.type === "app_store");
  let playStoreApp: App | undefined = apps.items.find((a) => a.type === "play_store");

  if (!testStoreApp) throw new Error("No test store app found");
  console.log("Test store app:", testStoreApp.id);

  if (!appStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: { name: APP_STORE_APP_NAME, type: "app_store", app_store: { bundle_id: APP_STORE_BUNDLE_ID } },
    });
    if (error) throw new Error("Failed to create App Store app");
    appStoreApp = newApp;
    console.log("Created App Store app:", appStoreApp.id);
  } else {
    console.log("App Store app found:", appStoreApp.id);
  }

  if (!playStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: { name: PLAY_STORE_APP_NAME, type: "play_store", play_store: { package_name: PLAY_STORE_PACKAGE_NAME } },
    });
    if (error) throw new Error("Failed to create Play Store app");
    playStoreApp = newApp;
    console.log("Created Play Store app:", playStoreApp.id);
  } else {
    console.log("Play Store app found:", playStoreApp.id);
  }

  // --- Products ---
  const { data: existingProducts, error: listProductsError } = await listProducts({
    client,
    path: { project_id: project.id },
    query: { limit: 100 },
  });
  if (listProductsError) throw new Error("Failed to list products");

  const ensureProduct = async (targetApp: App, label: string, storeIdentifier: string, product: typeof PRODUCTS[0], isTestStore: boolean): Promise<Product> => {
    const existing = existingProducts.items?.find(
      (p) => p.store_identifier === storeIdentifier && p.app_id === targetApp.id
    );
    if (existing) {
      console.log(`${label} product already exists:`, existing.id);
      return existing;
    }

    const body: CreateProductData["body"] = {
      store_identifier: storeIdentifier,
      app_id: targetApp.id,
      type: product.type,
      display_name: product.displayName,
    };

    if (isTestStore && product.type === "subscription" && product.duration) {
      body.subscription = { duration: product.duration };
      body.title = product.title;
    } else if (isTestStore && product.type === "non_consumable") {
      body.title = product.title;
    }

    const { data: created, error } = await createProduct({
      client,
      path: { project_id: project.id },
      body,
    });
    if (error) throw new Error(`Failed to create ${label} product: ${JSON.stringify(error)}`);
    console.log(`Created ${label} product:`, created.id);
    return created;
  };

  const allTestStoreProducts: Product[] = [];
  const allAppStoreProducts: Product[] = [];
  const allPlayStoreProducts: Product[] = [];

  for (const product of PRODUCTS) {
    const testProd = await ensureProduct(testStoreApp, `Test Store ${product.displayName}`, product.identifier, product, true);
    const appProd = await ensureProduct(appStoreApp, `App Store ${product.displayName}`, product.identifier, product, false);
    const playProd = await ensureProduct(playStoreApp, `Play Store ${product.displayName}`, product.playStoreIdentifier, product, false);

    allTestStoreProducts.push(testProd);
    allAppStoreProducts.push(appProd);
    allPlayStoreProducts.push(playProd);

    // Add test store prices
    console.log(`Adding test store prices for ${product.displayName}...`);
    const { error: priceError } = await client.post<TestStorePricesResponse>({
      url: "/projects/{project_id}/products/{product_id}/test_store_prices",
      path: { project_id: project.id, product_id: testProd.id },
      body: { prices: product.prices },
    });
    if (priceError) {
      if (typeof priceError === "object" && "type" in priceError && priceError["type"] === "resource_already_exists") {
        console.log(`Test store prices already exist for ${product.displayName}`);
      } else {
        console.warn(`Warning: Failed to add test store prices for ${product.displayName}:`, priceError);
      }
    } else {
      console.log(`Added test store prices for ${product.displayName}`);
    }
  }

  // --- Entitlement ---
  let entitlement: Entitlement | undefined;
  const { data: existingEntitlements, error: listEntitlementsError } = await listEntitlements({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listEntitlementsError) throw new Error("Failed to list entitlements");

  const existingEntitlement = existingEntitlements.items?.find((e) => e.lookup_key === ENTITLEMENT_IDENTIFIER);
  if (existingEntitlement) {
    console.log("Entitlement already exists:", existingEntitlement.id);
    entitlement = existingEntitlement;
  } else {
    const { data: newEntitlement, error } = await createEntitlement({
      client,
      path: { project_id: project.id },
      body: { lookup_key: ENTITLEMENT_IDENTIFIER, display_name: ENTITLEMENT_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create entitlement");
    console.log("Created entitlement:", newEntitlement.id);
    entitlement = newEntitlement;
  }

  // Attach all products to entitlement
  const allProductIds = [
    ...allTestStoreProducts.map((p) => p.id),
    ...allAppStoreProducts.map((p) => p.id),
    ...allPlayStoreProducts.map((p) => p.id),
  ];

  const { error: attachEntitlementError } = await attachProductsToEntitlement({
    client,
    path: { project_id: project.id, entitlement_id: entitlement.id },
    body: { product_ids: allProductIds },
  });
  if (attachEntitlementError) {
    if (attachEntitlementError.type === "unprocessable_entity_error") {
      console.log("Products already attached to entitlement");
    } else {
      throw new Error("Failed to attach products to entitlement");
    }
  } else {
    console.log("Attached all products to entitlement");
  }

  // --- Offering ---
  let offering: Offering | undefined;
  const { data: existingOfferings, error: listOfferingsError } = await listOfferings({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listOfferingsError) throw new Error("Failed to list offerings");

  const existingOffering = existingOfferings.items?.find((o) => o.lookup_key === OFFERING_IDENTIFIER);
  if (existingOffering) {
    console.log("Offering already exists:", existingOffering.id);
    offering = existingOffering;
  } else {
    const { data: newOffering, error } = await createOffering({
      client,
      path: { project_id: project.id },
      body: { lookup_key: OFFERING_IDENTIFIER, display_name: OFFERING_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create offering");
    console.log("Created offering:", newOffering.id);
    offering = newOffering;
  }

  if (!offering.is_current) {
    const { error } = await updateOffering({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      body: { is_current: true },
    });
    if (error) throw new Error("Failed to set offering as current");
    console.log("Set offering as current");
  }

  // --- Packages (one per product) ---
  const { data: existingPackages, error: listPackagesError } = await listPackages({
    client,
    path: { project_id: project.id, offering_id: offering.id },
    query: { limit: 20 },
  });
  if (listPackagesError) throw new Error("Failed to list packages");

  for (let i = 0; i < PRODUCTS.length; i++) {
    const productDef = PRODUCTS[i];
    const testProd = allTestStoreProducts[i];
    const appProd = allAppStoreProducts[i];
    const playProd = allPlayStoreProducts[i];

    let pkg: Package | undefined;
    const existingPkg = existingPackages.items?.find((p) => p.lookup_key === productDef.packageIdentifier);
    if (existingPkg) {
      console.log(`Package ${productDef.packageIdentifier} already exists:`, existingPkg.id);
      pkg = existingPkg;
    } else {
      const { data: newPkg, error } = await createPackages({
        client,
        path: { project_id: project.id, offering_id: offering.id },
        body: { lookup_key: productDef.packageIdentifier, display_name: productDef.packageDisplayName },
      });
      if (error) throw new Error(`Failed to create package ${productDef.packageIdentifier}: ${JSON.stringify(error)}`);
      console.log(`Created package ${productDef.packageIdentifier}:`, newPkg.id);
      pkg = newPkg;
    }

    const { error: attachPkgError } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkg.id },
      body: {
        products: [
          { product_id: testProd.id, eligibility_criteria: "all" },
          { product_id: appProd.id, eligibility_criteria: "all" },
          { product_id: playProd.id, eligibility_criteria: "all" },
        ],
      },
    });
    if (attachPkgError) {
      if (attachPkgError.type === "unprocessable_entity_error") {
        console.log(`Package ${productDef.packageIdentifier} already has products attached`);
      } else {
        throw new Error(`Failed to attach products to package: ${JSON.stringify(attachPkgError)}`);
      }
    } else {
      console.log(`Attached products to package ${productDef.packageIdentifier}`);
    }
  }

  // --- API Keys ---
  const { data: testApiKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: testStoreApp.id } });
  const { data: appStoreApiKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: appStoreApp.id } });
  const { data: playStoreApiKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: playStoreApp.id } });

  console.log("\n====================");
  console.log("RevenueCat setup complete!");
  console.log("Project ID:", project.id);
  console.log("Test Store App ID:", testStoreApp.id);
  console.log("App Store App ID:", appStoreApp.id);
  console.log("Play Store App ID:", playStoreApp.id);
  console.log("Entitlement Identifier:", ENTITLEMENT_IDENTIFIER);
  console.log("Public API Keys - Test Store:", testApiKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("Public API Keys - App Store:", appStoreApiKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("Public API Keys - Play Store:", playStoreApiKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("====================\n");
  console.log("Next steps:");
  console.log("Set these environment variables:");
  console.log("  REVENUECAT_PROJECT_ID =", project.id);
  console.log("  REVENUECAT_TEST_STORE_APP_ID =", testStoreApp.id);
  console.log("  REVENUECAT_APPLE_APP_STORE_APP_ID =", appStoreApp.id);
  console.log("  REVENUECAT_GOOGLE_PLAY_STORE_APP_ID =", playStoreApp.id);
  console.log("  EXPO_PUBLIC_REVENUECAT_TEST_API_KEY =", testApiKeys?.items[0]?.key ?? "N/A");
  console.log("  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY =", appStoreApiKeys?.items[0]?.key ?? "N/A");
  console.log("  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY =", playStoreApiKeys?.items[0]?.key ?? "N/A");
}

seedRevenueCat().catch(console.error);
