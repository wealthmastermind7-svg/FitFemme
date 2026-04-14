import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { PurchasesPackage } from "react-native-purchases";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useSubscription } from "@/lib/revenuecat";
import { useLanguage } from "@/lib/i18n";

interface PaywallProps {
  isVisible: boolean;
  onClose: () => void;
}

const FEATURE_KEYS = [
  { icon: "unlock", key: "paywall.feature.workouts" },
  { icon: "trending-up", key: "paywall.feature.tracking" },
  { icon: "calendar", key: "paywall.feature.history" },
  { icon: "zap", key: "paywall.feature.unlimited" },
];

export default function Paywall({ isVisible, onClose }: PaywallProps) {
  const { offerings, purchase, restore, isPurchasing, isRestoring } = useSubscription();
  const { t } = useLanguage();
  const getPackageLabel = (pkg: PurchasesPackage): string => {
    const id = pkg.packageType;
    if (id === "MONTHLY") return t("paywall.monthly.label");
    if (id === "ANNUAL") return t("paywall.annual.label");
    if (id === "LIFETIME") return t("paywall.lifetime.label");
    return pkg.product.title || "Pro";
  };

  const getPackageBadge = (pkg: PurchasesPackage): string | null => {
    const id = pkg.packageType;
    if (id === "ANNUAL") return t("paywall.badge.popular");
    if (id === "LIFETIME") return t("paywall.badge.value");
    return null;
  };

  const getPackageSubtitle = (pkg: PurchasesPackage): string => {
    const id = pkg.packageType;
    if (id === "ANNUAL") return t("paywall.sub.annual");
    if (id === "LIFETIME") return t("paywall.sub.lifetime");
    if (id === "MONTHLY") return t("paywall.sub.monthly");
    return "";
  };

  const packages = offerings?.current?.availablePackages ?? [];

  const handlePurchasePress = async (pkg: PurchasesPackage) => {
    try {
      await purchase(pkg);
      onClose();
    } catch (err: any) {
      if (!err?.userCancelled) {
        Alert.alert("Purchase failed", err?.message ?? "Something went wrong. Please try again.");
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert("Restored", "Your purchases have been restored.");
      onClose();
    } catch {
      Alert.alert("Restore failed", "Could not restore purchases. Please try again.");
    }
  };

  return (
    <>
      <Modal visible={isVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <BlurView pointerEvents="none" intensity={30} style={StyleSheet.absoluteFillObject} />
        <View style={styles.container}>
          <LinearGradient
            colors={["#3d0a24", "#221019", "#1a0d14"]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
              <Feather name="x" size={22} color={Colors.white60} />
            </Pressable>
            <View style={styles.badge}>
              <Feather name="award" size={14} color={Colors.white} />
              <ThemedText style={styles.badgeText}>Fit Femme Pro</ThemedText>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <ThemedText style={styles.title}>{t("paywall.headline")}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("paywall.joinThousands")}
            </ThemedText>

            {/* Features */}
            <View style={styles.features}>
              {FEATURE_KEYS.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Feather name={f.icon as any} size={16} color={Colors.primary} />
                  </View>
                  <ThemedText style={styles.featureText}>{t(f.key)}</ThemedText>
                </View>
              ))}
            </View>

            {/* Packages */}
            <View style={styles.packages}>
              {packages.length === 0 ? (
                <ActivityIndicator color={Colors.primary} size="large" />
              ) : (
                packages.map((pkg) => {
                  const badge = getPackageBadge(pkg);
                  const isAnnual = pkg.packageType === "ANNUAL";
                  return (
                    <Pressable
                      key={pkg.identifier}
                      style={[styles.packageCard, isAnnual && styles.packageCardHighlighted]}
                      onPress={() => handlePurchasePress(pkg)}
                      disabled={isPurchasing}
                      accessibilityRole="button"
                    >
                      {isAnnual && (
                        <LinearGradient
                          colors={[Colors.primary, "#9c0d54"]}
                          style={StyleSheet.absoluteFillObject}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                      )}
                      {badge ? (
                        <View style={styles.packageBadge}>
                          <ThemedText style={styles.packageBadgeText}>{badge}</ThemedText>
                        </View>
                      ) : null}
                      <View style={styles.packageInfo}>
                        <ThemedText style={styles.packageLabel}>
                          {getPackageLabel(pkg)}
                        </ThemedText>
                        <ThemedText style={styles.packageSubtitle}>
                          {getPackageSubtitle(pkg)}
                        </ThemedText>
                      </View>
                      <View style={styles.packagePriceBox}>
                        <ThemedText style={styles.packagePrice}>
                          {pkg.product.priceString}
                        </ThemedText>
                        <ThemedText style={styles.packagePeriod}>
                          {pkg.packageType === "LIFETIME" ? "once" :
                           pkg.packageType === "ANNUAL" ? "/yr" : "/mo"}
                        </ThemedText>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* Restore */}
            <Pressable onPress={handleRestore} style={styles.restoreButton} disabled={isRestoring}>
              {isRestoring ? (
                <ActivityIndicator color={Colors.white40} size="small" />
              ) : (
                <ThemedText style={styles.restoreText}>{t("paywall.restore")}</ThemedText>
              )}
            </Pressable>

            <ThemedText style={styles.legal}>
              {t("paywall.legal")}
            </ThemedText>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={styles.primaryCta}
              onPress={() => {
                if (packages[0]) {
                  handlePurchasePress(packages[0]);
                } else {
                  Alert.alert("No plans available", "Please try again in a moment.");
                }
              }}
              disabled={isPurchasing}
              accessibilityRole="button"
            >
              {isPurchasing ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <ThemedText style={styles.primaryCtaText}>
                  {t("paywall.subscribe")}
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#221019",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["3xl"] + 20,
    paddingBottom: Spacing.lg,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white10,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  content: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.white,
    lineHeight: 40,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.white60,
    marginBottom: Spacing["2xl"],
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(212, 17, 115, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: "500",
    flex: 1,
  },
  packages: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.white10,
    minHeight: 72,
  },
  packageCardHighlighted: {
    borderColor: Colors.primary,
    ...Shadows.medium,
  },
  packageBadge: {
    position: "absolute",
    top: 0,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  packageBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  packageInfo: {
    flex: 1,
    paddingTop: 4,
  },
  packageLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 2,
  },
  packageSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  packagePriceBox: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.white,
  },
  packagePeriod: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  primaryCta: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    minHeight: 52,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.white,
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  restoreText: {
    fontSize: 14,
    color: Colors.white40,
    textDecorationLine: "underline",
  },
  legal: {
    fontSize: 11,
    color: Colors.white40,
    textAlign: "center",
    lineHeight: 16,
  },
});
