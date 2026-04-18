import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage, BodyGoal, GOAL_CONFIG, MEAL_IDEAS, MEAL_IMAGES, MealIdea } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function MealIdeasScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [goal, setGoal] = useState<BodyGoal | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  const handleIdeaPress = (idea: MealIdea) => {
    navigation.navigate("MealDetail", { id: idea.id });
  };

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
              <Pressable
                key={idea.id}
                onPress={() => handleIdeaPress(idea)}
                style={({ pressed }) => [
                  styles.ideaCard,
                  { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
                ]}
              >
                <ImageBackground
                  source={MEAL_IMAGES[idea.id]}
                  style={styles.ideaImage}
                  imageStyle={styles.ideaImageInner}
                >
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.85)"]}
                    locations={[0.35, 0.6, 1]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.ideaCalBadge}>
                    <Feather name="zap" size={10} color="#f0c93e" />
                    <ThemedText style={styles.ideaCalText}>
                      {idea.calories} {t("mealIdeas.cal")}
                    </ThemedText>
                  </View>
                  <View style={styles.ideaImageOverlay}>
                    <ThemedText style={styles.ideaTitle} numberOfLines={1}>
                      {t(idea.titleKey)}
                    </ThemedText>
                    <ThemedText style={styles.ideaDesc} numberOfLines={2}>
                      {t(idea.descKey)}
                    </ThemedText>
                  </View>
                </ImageBackground>

                <View style={styles.ideaFooter}>
                  <View style={styles.ideaStats}>
                    <View style={styles.ideaStatPill}>
                      <Feather name="activity" size={11} color="#4fc3f7" />
                      <ThemedText style={styles.ideaStatText}>
                        {idea.protein}g {t("mealIdeas.protein")}
                      </ThemedText>
                    </View>
                    <View style={styles.ideaStatPill}>
                      <Feather name="clock" size={11} color="#a5d6a7" />
                      <ThemedText style={styles.ideaStatText}>
                        {idea.prepMins} {t("mealIdeas.detail.minutes")}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.viewRecipeRow}>
                    <ThemedText style={[styles.viewRecipeText, { color: idea.color }]}>
                      {t("mealIdeas.viewRecipe")}
                    </ThemedText>
                    <Feather name="arrow-right" size={13} color={idea.color} />
                  </View>
                </View>
              </Pressable>
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
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: Spacing.sm,
  },
  ideaImage: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
  },
  ideaImageInner: {
    resizeMode: "cover",
  },
  ideaImageOverlay: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  ideaCalBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  ideaCalText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  ideaTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: 3,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
  },
  ideaFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: 12,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  proBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  proBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 2,
  },
  proBannerSub: {
    fontSize: 11,
    color: Colors.white60,
    lineHeight: 15,
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
  viewRecipeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  viewRecipeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
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
