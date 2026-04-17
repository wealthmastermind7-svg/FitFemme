import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import GoalPicker from "@/components/GoalPicker";
import {
  storage,
  BodyGoal,
  UserProfile,
  sampleUserProfile,
} from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GoalSetupScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  // mode = "onboarding" → after pick, navigate to Main; "edit" → go back
  const mode = (route.params as { mode?: "onboarding" | "edit" } | undefined)?.mode ?? "onboarding";

  const [selected, setSelected] = useState<BodyGoal | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    storage.getUserProfile().then((p) => {
      if (p?.bodyGoal) setSelected(p.bodyGoal);
    });
  }, []);

  const handleContinue = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      const existing = (await storage.getUserProfile()) as UserProfile | null;
      const base = existing ?? sampleUserProfile;
      await storage.saveUserProfile({ ...base, bodyGoal: selected });
    } catch (e) {
      console.log("Error saving body goal:", e);
    }
    setSaving(false);

    if (mode === "edit") {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }
  };

  const handleSkip = () => {
    if (mode === "edit") {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      {mode === "edit" && (
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={Colors.white} />
        </Pressable>
      )}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing["2xl"],
          paddingBottom: insets.bottom + Spacing["3xl"] + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.title}>{t("goal.pickerTitle")}</ThemedText>
        <ThemedText style={styles.subtitle}>{t("goal.pickerSubtitle")}</ThemedText>

        <View style={styles.pickerWrap}>
          <GoalPicker selectedGoal={selected} onSelect={setSelected} />
        </View>

        <ThemedText style={styles.note}>{t("goal.changeAnytime")}</ThemedText>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.lg, paddingHorizontal: Spacing["2xl"] },
        ]}
      >
        <Pressable
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected || saving}
        >
          <ThemedText style={styles.continueText}>{t("goal.continue")}</ThemedText>
        </Pressable>
        {mode === "onboarding" && (
          <Pressable style={styles.skipBtn} onPress={handleSkip}>
            <ThemedText style={styles.skipText}>{t("goal.skip")}</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  closeBtn: {
    position: "absolute",
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.white60,
    lineHeight: 22,
    marginBottom: Spacing["2xl"],
  },
  pickerWrap: {
    marginTop: Spacing.md,
  },
  note: {
    fontSize: 12,
    color: Colors.white40,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.md,
    backgroundColor: Colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: Colors.white10,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    ...Shadows.primaryGlow,
  },
  continueBtnDisabled: {
    backgroundColor: Colors.white10,
    shadowOpacity: 0,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  skipText: {
    fontSize: 14,
    color: Colors.white60,
    fontWeight: "500",
  },
});
