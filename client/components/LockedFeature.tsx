import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  BlurView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useSubscriptionContext } from "@/context/SubscriptionContext";

interface LockedFeatureProps {
  children?: React.ReactNode;
  isLocked: boolean;
  onUnlock: () => void;
  title?: string;
  style?: any;
}

export default function LockedFeature({
  children,
  isLocked,
  onUnlock,
  title = "Unlock Pro",
  style,
}: LockedFeatureProps) {
  if (!isLocked) {
    return children || null;
  }

  const BlurComponent = Platform.OS === "ios" ? BlurView : View;

  return (
    <View style={[styles.container, style]}>
      {children}
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} style={styles.blurOverlay}>
          <View style={styles.overlayContent}>
            <Feather
              name="lock"
              size={32}
              color={Colors.accentPink}
              style={styles.lockIcon}
            />
            <ThemedText style={styles.overlayText}>{title}</ThemedText>
            <Pressable style={styles.unlockButton} onPress={onUnlock}>
              <LinearGradient
                colors={[Colors.accentPink, Colors.accentPink]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <ThemedText style={styles.buttonText}>Learn More</ThemedText>
              </LinearGradient>
            </Pressable>
          </View>
        </BlurView>
      ) : (
        <View style={styles.androidOverlay}>
          <View style={styles.overlayContent}>
            <Feather
              name="lock"
              size={32}
              color={Colors.accentPink}
              style={styles.lockIcon}
            />
            <ThemedText style={styles.overlayText}>{title}</ThemedText>
            <Pressable style={styles.unlockButton} onPress={onUnlock}>
              <View style={styles.androidButton}>
                <ThemedText style={styles.buttonText}>Learn More</ThemedText>
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
  },
  androidOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
  },
  overlayContent: {
    alignItems: "center",
  },
  lockIcon: {
    marginBottom: Spacing.md,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  unlockButton: {
    marginTop: Spacing.md,
  },
  gradientButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  androidButton: {
    backgroundColor: Colors.accentPink,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
});
