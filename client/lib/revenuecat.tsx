import React, { createContext, useContext } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import { useMutation, useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

const REVENUECAT_TEST_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = "pro";

function getRevenueCatApiKey() {
  if (!REVENUECAT_TEST_API_KEY || !REVENUECAT_IOS_API_KEY || !REVENUECAT_ANDROID_API_KEY) {
    throw new Error("RevenueCat Public API Keys not found");
  }

  if (__DEV__ || Platform.OS === "web" || Constants.executionEnvironment === "storeClient") {
    return REVENUECAT_TEST_API_KEY;
  }

  if (Platform.OS === "ios") {
    return REVENUECAT_IOS_API_KEY;
  }

  if (Platform.OS === "android") {
    return REVENUECAT_ANDROID_API_KEY;
  }

  return REVENUECAT_TEST_API_KEY;
}

export function initializeRevenueCat() {
  const apiKey = getRevenueCatApiKey();
  if (!apiKey) throw new Error("RevenueCat Public API Key not found");
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
  console.log("RevenueCat configured");
}

// In Expo Go (and on web) the native RevenueCat module is unavailable, so
// purchases / entitlements can never resolve. To allow previewing Pro features
// during development we treat those environments as subscribed.
export const IS_EXPO_GO =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";
export const IS_PREVIEW_MODE = IS_EXPO_GO || Platform.OS === "web";

function useSubscriptionContext() {
  const customerInfoQuery = useQuery({
    queryKey: ["revenuecat", "customer-info"],
    queryFn: async () => {
      if (IS_PREVIEW_MODE) return null;
      const info = await Purchases.getCustomerInfo();
      return info;
    },
    staleTime: 60 * 1000,
    enabled: !IS_PREVIEW_MODE,
  });

  const offeringsQuery = useQuery({
    queryKey: ["revenuecat", "offerings"],
    queryFn: async () => {
      if (IS_PREVIEW_MODE) return null;
      const offerings = await Purchases.getOfferings();
      return offerings;
    },
    staleTime: 300 * 1000,
    enabled: !IS_PREVIEW_MODE,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: any) => {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      return Purchases.restorePurchases();
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const isSubscribed =
    IS_PREVIEW_MODE ||
    customerInfoQuery.data?.entitlements.active?.[REVENUECAT_ENTITLEMENT_IDENTIFIER] !== undefined;

  return {
    customerInfo: customerInfoQuery.data,
    offerings: offeringsQuery.data,
    isSubscribed,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const Context = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const value = useSubscriptionContext();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSubscription() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
}

// ── Web checkout link (Android / web ONLY) ──────────────────────────────
// Returns a tracked /subscribe URL for surfacing inside the Android
// paywall ("Pay on the web with Pix/OXXO"). Returns `null` on iOS so
// callers cannot accidentally render a web purchase CTA in the iOS
// app — that would violate App Store guideline 3.1.3 (Other Purchasing
// Methods) and is also caught by the boot-time assertion in
// client/lib/compliance.ts.
//
// The URL itself is never embedded in i18n strings (which are scanned
// for forbidden /subscribe references). It is built here from
// EXPO_PUBLIC_DOMAIN so a copy mistake in translations cannot bypass
// the platform gate.
interface WebCheckoutLinkOptions {
  lang?: "en" | "es" | "pt";
  country?: string; // ISO-3166-1 alpha-2
  source?: string;  // utm_source, defaults to "android_app"
  campaign?: string; // utm_campaign, defaults to "android_paywall_web_checkout"
}

export function getAndroidWebCheckoutUrl(
  opts: WebCheckoutLinkOptions = {},
): string | null {
  if (Platform.OS === "ios") return null;
  const host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) return null;
  const base = /^https?:\/\//i.test(host)
    ? host.replace(/\/+$/, "")
    : `https://${host.replace(/\/+$/, "")}`;
  const params = new URLSearchParams();
  if (opts.lang) params.set("lang", opts.lang);
  if (opts.country && /^[A-Za-z]{2}$/.test(opts.country)) {
    params.set("country", opts.country.toUpperCase());
  }
  params.set("utm_source", opts.source ?? "android_app");
  params.set("utm_medium", "in_app");
  params.set("utm_campaign", opts.campaign ?? "android_paywall_web_checkout");
  return `${base}/subscribe?${params.toString()}`;
}
