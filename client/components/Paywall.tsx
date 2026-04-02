import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getAvailablePackages, purchasePackage } from "@/lib/revenueCat";
import { useSubscriptionContext } from "@/context/SubscriptionContext";

interface PaywallProps {
  onClose: () => void;
  isVisible: boolean;
}

export default function Paywall({ onClose, isVisible }: PaywallProps) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { refreshSubscription } = useSubscriptionContext();

  useEffect(() => {
    if (isVisible) {
      loadPackages();
    }
  }, [isVisible]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const availablePackages = await getAvailablePackages();
      setPackages(availablePackages);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: any) => {
    setPurchasing(pkg.identifier);
    try {
      const result = await purchasePackage(pkg);
      if (result.success) {
        Alert.alert("Success", "Welcome to Fit Femme Pro!", [
          {
            text: "OK",
            onPress: async () => {
              await refreshSubscription();
              onClose();
            },
          },
        ]);
      } else if (result.cancelled) {
        // User cancelled, do nothing
      } else {
        Alert.alert("Error", result.error || "Purchase failed");
      }
    } finally {
      setPurchasing(null);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={Colors.white} />
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <ThemedText style={styles.title}>Unlock Your Best Self</ThemedText>
          <ThemedText style={styles.subtitle}>
            Get full access to premium workouts, progress tracking, and
            structured programs designed to keep you consistent.
          </ThemedText>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <View style={styles.benefitItem}>
            <Feather
              name="check-circle"
              size={20}
              color={Colors.accentPink}
              style={styles.benefitIcon}
            />
            <ThemedText style={styles.benefitText}>
              Unlimited workouts & programs
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <Feather
              name="check-circle"
              size={20}
              color={Colors.accentPink}
              style={styles.benefitIcon}
            />
            <ThemedText style={styles.benefitText}>
              Track your progress & stay consistent
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <Feather
              name="check-circle"
              size={20}
              color={Colors.accentPink}
              style={styles.benefitIcon}
            />
            <ThemedText style={styles.benefitText}>
              Build your perfect routine
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <Feather
              name="check-circle"
              size={20}
              color={Colors.accentPink}
              style={styles.benefitIcon}
            />
            <ThemedText style={styles.benefitText}>
              Stay motivated with streaks
            </ThemedText>
          </View>
        </View>

        {/* Pricing Plans */}
        {loading ? (
          <ActivityIndicator color={Colors.accentPink} size="large" />
        ) : (
          <View style={styles.plansSection}>
            {packages.map((pkg: any, index: number) => {
              const planNames: { [key: string]: string } = {
                monthly: "Monthly Pro",
                annual: "Annual Pro",
                lifetime: "Lifetime Pro",
              };

              const planName =
                planNames[pkg.identifier] || pkg.product.title;
              const isAnnual = pkg.identifier === "annual";
              const isLifetime = pkg.identifier === "lifetime";

              return (
                <Pressable
                  key={pkg.identifier}
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchasing === pkg.identifier}
                  style={[
                    styles.planCard,
                    isAnnual && styles.planCardHighlighted,
                  ]}
                >
                  {isAnnual && (
                    <View style={styles.popularBadge}>
                      <ThemedText style={styles.popularBadgeText}>
                        MOST POPULAR
                      </ThemedText>
                    </View>
                  )}

                  <LinearGradient
                    colors={
                      isAnnual
                        ? [
                            "rgba(212, 17, 115, 0.2)",
                            "rgba(255, 0, 110, 0.1)",
                          ]
                        : ["transparent", "transparent"]
                    }
                    style={styles.planGradient}
                  >
                    <ThemedText style={styles.planName}>{planName}</ThemedText>
                    <View style={styles.planPrice}>
                      <ThemedText style={styles.price}>
                        {pkg.product.priceString}
                      </ThemedText>
                      {!isLifetime && (
                        <ThemedText style={styles.period}>
                          {isAnnual ? "/year" : "/month"}
                        </ThemedText>
                      )}
                    </View>

                    {isAnnual && (
                      <ThemedText style={styles.savingsText}>
                        Save 37% vs monthly
                      </ThemedText>
                    )}

                    {isLifetime && (
                      <ThemedText style={styles.savingsText}>
                        One-time unlock, keep forever
                      </ThemedText>
                    )}

                    <Pressable
                      style={styles.buyButton}
                      disabled={purchasing === pkg.identifier}
                    >
                      {purchasing === pkg.identifier ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                      ) : (
                        <ThemedText style={styles.buyButtonText}>
                          {isLifetime ? "Unlock Lifetime" : "Try Free"}
                        </ThemedText>
                      )}
                    </Pressable>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerSection}>
          <ThemedText style={styles.footerText}>
            All subscriptions auto-renew. Cancel anytime.
          </ThemedText>
          <View style={styles.footerLinks}>
            <Pressable onPress={onClose}>
              <ThemedText style={styles.footerLink}>
                Continue Free
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  scrollView: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.md,
    marginRight: -Spacing.md,
  },
  titleSection: {
    marginBottom: Spacing["3xl"],
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: Spacing.md,
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white60,
    lineHeight: 1.6,
  },
  benefitsSection: {
    marginBottom: Spacing["3xl"],
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  benefitIcon: {
    marginRight: Spacing.md,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.white,
    flex: 1,
  },
  plansSection: {
    marginBottom: Spacing["3xl"],
    gap: Spacing.md,
  },
  planCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(212, 17, 115, 0.2)",
    overflow: "hidden",
  },
  planCardHighlighted: {
    borderColor: Colors.accentPink,
    borderWidth: 2,
  },
  popularBadge: {
    backgroundColor: Colors.accentPink,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  planGradient: {
    padding: Spacing.lg,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
    color: Colors.white,
  },
  planPrice: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.accentPink,
  },
  period: {
    fontSize: 14,
    color: Colors.white60,
    marginLeft: Spacing.xs,
  },
  savingsText: {
    fontSize: 12,
    color: Colors.accentPink,
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  buyButton: {
    backgroundColor: Colors.accentPink,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  footerSection: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: Colors.white60,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.accentPink,
    fontWeight: "600",
  },
});
