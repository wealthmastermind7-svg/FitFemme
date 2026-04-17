import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage, BodyGoal, GOAL_CONFIG, MEAL_IDEAS, MealIdea } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function MealIdeasScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [goal, setGoal] = useState<BodyGoal | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const profile = await storage.getUserProfile();
      setGoal(profile?.bodyGoal);
      setLoaded(true);
    })();
  }, []);

  if (!loaded) return <View style={styles.container} />;

  const goalCfg = goal ? GOAL_CONFIG[goal] : null;
  const ideas: MealIdea[] = goal ? MEAL_IDEAS[goal] : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[goalCfg?.color ?? Colors.primary, Colors.backgroundDark]}
        locations={[0, 0.45]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <Feather name="x" size={22} color={Colors.white} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>{t("mealIdeas.screenTitle")}</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {goal && goalCfg ? (
          <>
            <View style={styles.headerRow}>
              <View style={[styles.goalDot, { backgroundColor: goalCfg.color }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.goalLabel}>{t(goalCfg.titleKey)}</ThemedText>
                <ThemedText style={styles.subtitle}>{t("mealIdeas.headerSubtitle")}</ThemedText>
              </View>
            </View>

            {ideas.map((idea) => (
              <GlassCard key={idea.id} style={styles.ideaCard}>
                <View style={[styles.ideaIcon, { backgroundColor: idea.color + "25" }]}>
                  <Feather name={idea.icon as any} size={22} color={idea.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.ideaTitle}>{t(idea.titleKey)}</ThemedText>
                  <ThemedText style={styles.ideaDesc}>{t(idea.descKey)}</ThemedText>
                  <View style={styles.ideaStats}>
                    <View style={styles.ideaStatPill}>
                      <Feather name="zap" size={11} color="#f0c93e" />
                      <ThemedText style={styles.ideaStatText}>
                        {idea.calories} {t("mealIdeas.cal")}
                      </ThemedText>
                    </View>
                    <View style={styles.ideaStatPill}>
                      <Feather name="activity" size={11} color="#4fc3f7" />
                      <ThemedText style={styles.ideaStatText}>
                        {idea.protein}g {t("mealIdeas.protein")}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </GlassCard>
            ))}
          </>
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Feather name="target" size={32} color={Colors.white60} style={{ marginBottom: 12 }} />
            <ThemedText style={styles.emptyTitle}>{t("mealIdeas.noGoalTitle")}</ThemedText>
            <ThemedText style={styles.emptySub}>{t("mealIdeas.noGoalSubtitle")}</ThemedText>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => {
                navigation.goBack();
                navigation.navigate("GoalSetup", { mode: "edit" });
              }}
            >
              <ThemedText style={styles.emptyBtnText}>{t("mealIdeas.setGoal")}</ThemedText>
            </Pressable>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
  },
  scroll: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: Spacing.lg,
  },
  goalDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.white60,
    marginTop: 2,
  },
  ideaCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: Spacing.lg,
  },
  ideaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ideaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 3,
  },
  ideaDesc: {
    fontSize: 12,
    color: Colors.white60,
    lineHeight: 17,
    marginBottom: 10,
  },
  ideaStats: {
    flexDirection: "row",
    gap: 8,
  },
  ideaStatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  ideaStatText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: "600",
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing["2xl"],
    marginTop: Spacing["3xl"],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: Colors.white60,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 19,
  },
  emptyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
});
