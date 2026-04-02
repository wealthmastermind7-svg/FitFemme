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

interface PaywallProps {
  isVisible: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: "unlock", text: "All 6 workouts unlocked" },
  { icon: "trending-up", text: "Full progress tracking & muscle chart" },
  { icon: "calendar", text: "Workout history & streak calendar" },
  { icon: "star", text: "Custom workout builder" },
  { icon: "zap", text: "Unlimited daily workouts" },
];

function getPackageLabel(pkg: PurchasesPackage): string {
  const id = pkg.packageType;
  if (id === "MONTHLY") return "Monthly";
  if (id === "ANNUAL") return "Annual";
  if (id === "LIFETIME") return "Lifetime";
  return pkg.product.title || "Pro";
}

function getPackageBadge(pkg: PurchasesPackage): string | null {
  const id = pkg.packageType;
  if (id === "ANNUAL") return "Most Popular";
  if (id === "LIFETIME") return "Best Value";
  return null;
}

function getPackageSubtitle(pkg: PurchasesPackage): string {
  const id = pkg.packageType;
  if (id === "ANNUAL") return "~$1.25/month, save 37%";
  if (id === "LIFETIME") return "One-time, keep forever";
  if (id === "MONTHLY") return "Cancel anytime";
  return "";
}

export default function Paywall({ isVisible, onClose }: PaywallProps) {
  const { offerings, purchase, restore, isPurchasing, isRestoring } = useSubscription();
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const packages = offerings?.current?.availablePackages ?? [];

  const handlePurchasePress = (pkg: PurchasesPackage) => {
    setSelectedPackage(pkg);
    setConfirmVisible(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;
    setConfirmVisible(false);
    try {
      await purchase(selectedPackage);
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
        <BlurView intensity={30} style={StyleSheet.absoluteFillObject} />
        <View style={styles.container}>
          <LinearGradient
            colors={["#3d0a24", "#221019", "#1a0d14"]}
            style={StyleSheet.absoluteFillObject}
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
          >
            {/* Title */}
            <ThemedText style={styles.title}>Unlock Your Full{"\n"}Potential</ThemedText>
            <ThemedText style={styles.subtitle}>
              Join thousands of women transforming their fitness journey
            </ThemedText>

            {/* Features */}
            <View style={styles.features}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Feather name={f.icon as any} size={16} color={Colors.primary} />
                  </View>
                  <ThemedText style={styles.featureText}>{f.text}</ThemedText>
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
                <ThemedText style={styles.restoreText}>Restore Purchases</ThemedText>
              )}
            </Pressable>

            <ThemedText style={styles.legal}>
              Subscriptions auto-renew unless cancelled. Manage in device settings.
            </ThemedText>
          </ScrollView>
        </View>
      </Modal>

      {/* Purchase Confirmation Modal */}
      <Modal visible={confirmVisible} animationType="fade" transparent presentationStyle="overFullScreen">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <ThemedText style={styles.confirmTitle}>Confirm Purchase</ThemedText>
            <ThemedText style={styles.confirmText}>
              Purchase {selectedPackage ? getPackageLabel(selectedPackage) : ""} for{" "}
              {selectedPackage?.product.priceString}?
            </ThemedText>
            <View style={styles.confirmButtons}>
              <Pressable
                style={[styles.confirmBtn, styles.confirmBtnCancel]}
                onPress={() => setConfirmVisible(false)}
              >
                <ThemedText style={styles.confirmBtnCancelText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, styles.confirmBtnConfirm]}
                onPress={handleConfirmPurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <ThemedText style={styles.confirmBtnConfirmText}>Purchase</ThemedText>
                )}
              </Pressable>
            </View>
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  confirmBox: {
    backgroundColor: "#2d1020",
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.white10,
    gap: Spacing.md,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
  },
  confirmText: {
    fontSize: 15,
    color: Colors.white60,
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  confirmBtnCancel: {
    backgroundColor: Colors.white10,
  },
  confirmBtnCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white60,
  },
  confirmBtnConfirm: {
    backgroundColor: Colors.primary,
  },
  confirmBtnConfirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
  },
});
