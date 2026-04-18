import React from "react";
import {
  View,
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
import { useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useSubscription } from "@/lib/revenuecat";

interface PaywallProps {
  isVisible: boolean;
  onClose: () => void;
}

// RevenueCatUI.Paywall renders the paywall configured in the RevenueCat
// dashboard (single source of truth). It only works in real native builds
// (TestFlight / App Store). Expo Go ("storeClient") and web cannot render it
// because they lack the native module — those environments show a small
// preview notice instead.
function isNativeBuild(): boolean {
  if (Platform.OS === "web") return false;
  return Constants.executionEnvironment !== "storeClient";
}

export default function Paywall({ isVisible, onClose }: PaywallProps) {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { offerings, restore, isRestoring } = useSubscription();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["revenuecat", "customer-info"] });

  // Native build → render the dashboard-configured paywall
  if (isNativeBuild()) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={false}
        presentationStyle="fullScreen"
      >
        <View style={styles.root}>
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

  // Expo Go / web → preview-only notice (no duplicate UI to maintain)
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
      <View style={styles.previewRoot}>
        <LinearGradient
          colors={["#3a1828", "#221019"]}
          style={StyleSheet.absoluteFillObject}
        />

        <Pressable
          onPress={onClose}
          style={[styles.closeBtn, { top: insets.top + 10 }]}
          hitSlop={16}
        >
          <Feather name="x" size={18} color="#fff" />
        </Pressable>

        <View style={styles.previewContent}>
          <View style={styles.previewBadge}>
            <Feather name="award" size={14} color="#fff" />
            <ThemedText style={styles.previewBadgeText}>Fit Femme Pro</ThemedText>
          </View>

          <ThemedText style={styles.previewTitle}>Paywall preview</ThemedText>

          <ThemedText style={styles.previewBody}>
            Your subscription paywall is configured in RevenueCat and appears
            here automatically on iOS and Android in TestFlight and the App
            Store.
          </ThemedText>

          <ThemedText style={styles.previewBodyDim}>
            This preview notice is shown only in Expo Go and on the web because
            those environments don't include the native paywall module.
          </ThemedText>

          <Pressable
            style={styles.previewRestore}
            onPress={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.previewRestoreText}>
                Restore purchases
              </ThemedText>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#221019" },
  paywallView: { flex: 1 },
  closeBtn: {
    position: "absolute",
    left: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  previewRoot: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  previewContent: { alignItems: "center", gap: 18 },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    marginBottom: 6,
  },
  previewBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  previewTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  previewBody: {
    fontSize: 15,
    color: "#e8d5dd",
    textAlign: "center",
    lineHeight: 22,
  },
  previewBodyDim: {
    fontSize: 13,
    color: "#9a7884",
    textAlign: "center",
    lineHeight: 19,
  },
  previewRestore: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  previewRestoreText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
