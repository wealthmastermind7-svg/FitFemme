import React, { useState } from "react";
import {
  View,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import RevenueCatUI from "react-native-purchases-ui";
import { PurchasesPackage } from "react-native-purchases";
import { useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useSubscription } from "@/lib/revenuecat";
import { useLanguage } from "@/lib/i18n";

interface PaywallProps {
  isVisible: boolean;
  onClose: () => void;
}

// RevenueCatUI.Paywall only works in real native builds (TestFlight / App Store).
// In Expo Go ("storeClient") or web it falls back to our branded paywall.
function isNativeBuild(): boolean {
  if (Platform.OS === "web") return false;
  return Constants.executionEnvironment !== "storeClient";
}

export default function Paywall({ isVisible, onClose }: PaywallProps) {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { offerings } = useSubscription();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["revenuecat", "customer-info"] });

  // Expo Go + web → show our branded fallback paywall
  if (!isNativeBuild()) {
    return <BrandedPaywall isVisible={isVisible} onClose={onClose} />;
  }

  // TestFlight / App Store → show the real RevenueCat hosted paywall
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
    >
      <View style={styles.root}>
        {/* Close button layered over the RevenueCat paywall */}
        <Pressable
          onPress={onClose}
          style={[styles.closeBtn, { top: insets.top + 10 }]}
          hitSlop={16}
        >
          <Feather name="x" size={18} color="#fff" />
        </Pressable>

        <RevenueCatUI.Paywall
          style={styles.paywallView}
          options={{
            offering: offerings?.current ?? undefined,
            displayCloseButton: false,
          }}
          onPurchaseCompleted={() => { invalidate(); onClose(); }}
          onRestoreCompleted={() => { invalidate(); onClose(); }}
          onPurchaseCancelled={() => {}}
          onPurchaseError={({ error }) =>
            Alert.alert("Purchase failed", error?.message ?? "Something went wrong. Please try again.")
          }
          onRestoreError={() =>
            Alert.alert("Restore failed", "Could not restore purchases. Please try again.")
          }
          onDismiss={onClose}
        />
      </View>
    </Modal>
  );
}

// ─── Branded fallback (Expo Go + web) ─────────────────────────────────────

const FEATURES = [
  "All 6 workouts unlocked",
  "Full progress tracking & stats",
  "Workout history & streak calendar",
];

const WORKOUT_BG = require("../../assets/images/workouts/workout3.png");

function BrandedPaywall({ isVisible, onClose }: PaywallProps) {
  const { offerings, purchase, restore, isPurchasing, isRestoring } = useSubscription();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const packages = offerings?.current?.availablePackages ?? [];
  const annualPkg = packages.find((p) => p.packageType === "ANNUAL");
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);

  const getSelected = (): PurchasesPackage | null =>
    selectedPkg ?? annualPkg ?? packages[0] ?? null;

  const label = (pkg: PurchasesPackage) => {
    if (pkg.packageType === "MONTHLY") return t("paywall.monthly.label");
    if (pkg.packageType === "ANNUAL") return t("paywall.annual.label");
    if (pkg.packageType === "LIFETIME") return t("paywall.lifetime.label");
    return pkg.product.title;
  };

  const period = (pkg: PurchasesPackage) => {
    if (pkg.packageType === "LIFETIME") return "once";
    if (pkg.packageType === "ANNUAL") return "/yr";
    return "/mo";
  };

  const handleContinue = async () => {
    const pkg = getSelected();
    if (!pkg) {
      Alert.alert("No plans available", "Please try again in a moment.");
      return;
    }
    try {
      await purchase(pkg);
      queryClient.invalidateQueries({ queryKey: ["revenuecat", "customer-info"] });
      onClose();
    } catch (err: any) {
      if (!err?.userCancelled) {
        Alert.alert("Purchase failed", err?.message ?? "Something went wrong.");
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert("Restored", "Your purchases have been restored.");
      onClose();
    } catch {
      Alert.alert("Restore failed", "Could not restore purchases.");
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
    >
      <View style={styles.root}>
        {/* Hero image */}
        <ImageBackground source={WORKOUT_BG} style={styles.hero} resizeMode="cover">
          <LinearGradient
            colors={["transparent", "rgba(34,16,25,0.6)", "#221019"]}
            locations={[0.3, 0.72, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable onPress={onClose} style={[styles.closeBtn, { top: insets.top + 10 }]} hitSlop={16}>
            <Feather name="x" size={18} color="#fff" />
          </Pressable>
          <View style={styles.heroBadge}>
            <Feather name="award" size={13} color="#fff" />
            <ThemedText style={styles.heroBadgeText}>Fit Femme Pro</ThemedText>
          </View>
        </ImageBackground>

        {/* White card */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={[styles.cardContent, { paddingBottom: insets.bottom + 12 }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <ThemedText style={styles.title}>Begin your journey</ThemedText>
          <ThemedText style={styles.subtitle}>Unlock the full Fit Femme experience</ThemedText>

          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Feather name="check" size={11} color="#fff" />
                </View>
                <ThemedText style={styles.featureText}>{f}</ThemedText>
              </View>
            ))}
          </View>

          {packages.length === 0 ? (
            <ActivityIndicator color={Colors.primary} size="large" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.planRow}>
              {packages.map((pkg) => {
                const isSelected = getSelected()?.identifier === pkg.identifier;
                const isAnnual = pkg.packageType === "ANNUAL";
                return (
                  <Pressable
                    key={pkg.identifier}
                    style={[styles.plan, isSelected && styles.planSelected]}
                    onPress={() => setSelectedPkg(pkg)}
                    disabled={isPurchasing}
                  >
                    {isAnnual ? (
                      <View style={styles.offBadge}>
                        <ThemedText style={styles.offBadgeText}>37% OFF</ThemedText>
                      </View>
                    ) : null}
                    <View style={styles.planTopRow}>
                      <ThemedText style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                        {label(pkg)}
                      </ThemedText>
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected ? <Feather name="check" size={9} color="#fff" /> : null}
                      </View>
                    </View>
                    <ThemedText style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                      {pkg.product.priceString}
                    </ThemedText>
                    <ThemedText style={styles.planPeriod}>{period(pkg)}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            style={[styles.cta, isPurchasing && styles.ctaDisabled]}
            onPress={handleContinue}
            disabled={isPurchasing || packages.length === 0}
          >
            {isPurchasing
              ? <ActivityIndicator color="#fff" size="small" />
              : <ThemedText style={styles.ctaText}>Continue</ThemedText>
            }
          </Pressable>

          <View style={styles.footer}>
            <Pressable onPress={handleRestore} disabled={isRestoring}>
              {isRestoring
                ? <ActivityIndicator color="#999" size="small" />
                : <ThemedText style={styles.footerLink}>Restore</ThemedText>
              }
            </Pressable>
            <ThemedText style={styles.footerDot}>•</ThemedText>
            <ThemedText style={styles.footerLink}>Terms</ThemedText>
            <ThemedText style={styles.footerDot}>•</ThemedText>
            <ThemedText style={styles.footerLink}>Privacy policy</ThemedText>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#221019" },
  paywallView: { flex: 1 },
  hero: { height: "50%", justifyContent: "flex-end" },
  closeBtn: {
    position: "absolute",
    left: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primary,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 20,
  },
  heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -22,
  },
  cardContent: { paddingHorizontal: 22, paddingTop: 26 },
  title: { fontSize: 22, fontWeight: "700", color: "#111", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  features: { gap: 11, marginBottom: 22 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  featureText: { fontSize: 14, color: "#222", flex: 1, fontWeight: "500" },
  planRow: { flexDirection: "row", gap: 8, marginBottom: 22 },
  plan: {
    flex: 1,
    borderWidth: 1.5, borderColor: "#e0e0e0",
    borderRadius: 14, padding: 10,
    backgroundColor: "#fafafa", minHeight: 96,
  },
  planSelected: { borderColor: Colors.primary, backgroundColor: "#fff5f9" },
  offBadge: {
    backgroundColor: "#f0c93e", borderRadius: 5,
    paddingHorizontal: 5, paddingVertical: 2,
    alignSelf: "flex-start", marginBottom: 5,
  },
  offBadgeText: { color: "#333", fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  planTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  planLabel: { fontSize: 13, fontWeight: "700", color: "#444" },
  planLabelSelected: { color: Colors.primary },
  radio: {
    width: 17, height: 17, borderRadius: 8.5,
    borderWidth: 1.5, borderColor: "#ccc",
    justifyContent: "center", alignItems: "center",
  },
  radioSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  planPrice: { fontSize: 15, fontWeight: "800", color: "#222" },
  planPriceSelected: { color: Colors.primary },
  planPeriod: { fontSize: 11, color: "#aaa", marginTop: 1 },
  cta: {
    backgroundColor: Colors.primary, borderRadius: 50,
    paddingVertical: 15, alignItems: "center",
    justifyContent: "center", marginBottom: 14, minHeight: 52,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 4 },
  footerLink: { fontSize: 12, color: "#aaa" },
  footerDot: { fontSize: 12, color: "#ccc" },
});
