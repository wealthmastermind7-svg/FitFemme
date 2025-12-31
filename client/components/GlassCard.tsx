import React from "react";
import { StyleSheet, ViewStyle, View } from "react-native";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GlassCard({ children, style }: GlassCardProps) {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={30}
        tint="dark"
        style={[styles.card, style]}
      >
        <View style={styles.overlay}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.cardFallback, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.white05,
  },
  overlay: {
    backgroundColor: "rgba(51, 25, 38, 0.6)",
    padding: Spacing.xl,
  },
  cardFallback: {
    backgroundColor: "rgba(51, 25, 38, 0.8)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.white05,
  },
});
