import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { PurchasesPackage } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useSubscription } from "@/lib/revenuecat";
import { useLanguage } from "@/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";

interface PaywallProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function Paywall({ isVisible, onClose }: PaywallProps) {
  const queryClient = useQueryClient();
  const presenting = useRef(false);

  useEffect(() => {
    if (!isVisible || Platform.OS === "web") return;
    if (presenting.current) return;

    presenting.current = true;

    RevenueCatUI.presentPaywall({ displayCloseButton: true })
      .then((result) => {
        if (
          result === PAYWALL_RESULT.PURCHASED ||
          result === PAYWALL_RESULT.RESTORED
        ) {
          queryClient.invalidateQueries({
            queryKey: ["revenuecat", "customer-info"],
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        presenting.current = false;
        onClose();
      });
  }, [isVisible]);

  if (Platform.OS !== "web") {
    return null;
  }

  return <WebPaywallFallback isVisible={isVisible} onClose={onClose} />;
}

const FEATURES = [
  "All 6 workouts unlocked",
  "Full progress tracking & muscle chart",
  "Workout history & streak calendar",
];

const BACKGROUND_IMAGE = require("../../assets/images/workouts/workout3.png");

function WebPaywallFallback({ isVisible, onClose }: PaywallProps) {
  const { offerings, purchase, restore, isPurchasing, isRestoring } =
    useSubscription();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const packages = offerings?.current?.availablePackages ?? [];
  const annualPkg = packages.find((p) => p.packageType === "ANNUAL");
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(
    null
  );

  const getSelected = (): PurchasesPackage | null =>
    selectedPkg ?? annualPkg ?? packages[0] ?? null;

  const getPackageLabel = (pkg: PurchasesPackage): string => {
    if (pkg.packageType === "MONTHLY") return t("paywall.monthly.label");
    if (pkg.packageType === "ANNUAL") return t("paywall.annual.label");
    if (pkg.packageType === "LIFETIME") return t("paywall.lifetime.label");
    return pkg.product.title || "Pro";
  };

  const getPackagePeriod = (pkg: PurchasesPackage): string => {
    if (pkg.packageType === "LIFETIME") return "once";
    if (pkg.packageType === "ANNUAL") return "/yr";
    return "/mo";
  };

  const getPackageDiscount = (pkg: PurchasesPackage): string | null => {
    if (pkg.packageType === "ANNUAL") return "37% OFF";
    return null;
  };

  const handleContinue = async () => {
    const pkg = getSelected();
    if (!pkg) {
      Alert.alert("No plans available", "Please try again in a moment.");
      return;
    }
    try {
      await purchase(pkg);
      onClose();
    } catch (err: any) {
      if (!err?.userCancelled) {
        Alert.alert(
          "Purchase failed",
          err?.message ?? "Something went wrong. Please try again."
        );
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert("Restored", "Your purchases have been restored.");
      onClose();
    } catch {
      Alert.alert(
        "Restore failed",
        "Could not restore purchases. Please try again."
      );
    }
  };

  const selectedPackage = getSelected();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <ImageBackground
          source={BACKGROUND_IMAGE}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.35)", "rgba(255,255,255,1)"]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { top: insets.top + 12 }]}
            hitSlop={16}
          >
            <Feather name="x" size={18} color="#fff" />
          </Pressable>
        </ImageBackground>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <ThemedText style={styles.title}>Begin your journey</ThemedText>
          <ThemedText style={styles.subtitle}>
            Unlock the full Fit Femme experience
          </ThemedText>

          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
                <ThemedText style={styles.featureText}>{f}</ThemedText>
              </View>
            ))}
          </View>

          {packages.length === 0 ? (
            <ActivityIndicator
              color={Colors.primary}
              size="large"
              style={styles.loader}
            />
          ) : (
            <View style={styles.planRow}>
              {packages.map((pkg) => {
                const isSelected =
                  getSelected()?.identifier === pkg.identifier;
                const discount = getPackageDiscount(pkg);
                return (
                  <Pressable
                    key={pkg.identifier}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                    ]}
                    onPress={() => setSelectedPkg(pkg)}
                    disabled={isPurchasing}
                  >
                    {discount ? (
                      <View style={styles.discountBadgeWrap}>
                        <ThemedText style={styles.discountText}>
                          {discount}
                        </ThemedText>
                      </View>
                    ) : null}

                    <View style={styles.radioRow}>
                      <ThemedText style={styles.planLabel}>
                        {getPackageLabel(pkg)}
                      </ThemedText>
                      <View
                        style={[
                          styles.radio,
                          isSelected && styles.radioSelected,
                        ]}
                      >
                        {isSelected ? (
                          <Feather name="check" size={10} color="#fff" />
                        ) : null}
                      </View>
                    </View>

                    <ThemedText style={styles.planPrice}>
                      {pkg.product.priceString}
                    </ThemedText>
                    <ThemedText style={styles.planPeriod}>
                      {getPackagePeriod(pkg)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            style={[
              styles.continueBtn,
              isPurchasing && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            disabled={isPurchasing || packages.length === 0}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.continueBtnText}>Continue</ThemedText>
            )}
          </Pressable>

          <View style={styles.footerLinks}>
            <Pressable onPress={handleRestore} disabled={isRestoring}>
              {isRestoring ? (
                <ActivityIndicator color={Colors.white40} size="small" />
              ) : (
                <ThemedText style={styles.footerLink}>Restore</ThemedText>
              )}
            </Pressable>
            <ThemedText style={styles.footerDot}>•</ThemedText>
            <ThemedText style={styles.footerLink}>Terms</ThemedText>
            <ThemedText style={styles.footerDot}>•</ThemedText>
            <ThemedText style={styles.footerLink}>Privacy policy</ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "58%",
  },
  closeBtn: {
    position: "absolute",
    left: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: "52%",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 18,
  },
  features: {
    gap: 10,
    marginBottom: 22,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    color: "#222",
    flex: 1,
  },
  loader: {
    marginVertical: 24,
  },
  planRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28,
  },
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 10,
    alignItems: "flex-start",
    backgroundColor: "#fafafa",
    minHeight: 90,
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#fff0f6",
  },
  discountBadgeWrap: {
    backgroundColor: "#f0c040",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  discountText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 4,
  },
  planLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  planPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginTop: 2,
  },
  planPeriod: {
    fontSize: 11,
    color: "#999",
    marginTop: 1,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    minHeight: 52,
  },
  continueBtnDisabled: {
    opacity: 0.6,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
  },
  footerLink: {
    fontSize: 12,
    color: "#999",
  },
  footerDot: {
    fontSize: 12,
    color: "#ccc",
  },
});
