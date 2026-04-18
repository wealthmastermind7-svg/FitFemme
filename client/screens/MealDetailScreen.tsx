import React from "react";
import { View, StyleSheet, ScrollView, Pressable, StatusBar, ImageBackground } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { findMealIdea, GOAL_CONFIG, MEAL_IMAGES } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function MealDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "MealDetail">>();
  const { t } = useLanguage();
  const id = route.params?.id;
  const found = id ? findMealIdea(id) : undefined;

  if (!found) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText style={{ color: Colors.white }}>Meal not found</ThemedText>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtnInline}>
          <ThemedText style={styles.backBtnInlineText}>{t("common.close")}</ThemedText>
        </Pressable>
      </View>
    );
  }

  const { idea, goal } = found;
  const goalCfg = GOAL_CONFIG[goal];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[idea.color, Colors.backgroundDark]}
        locations={[0, 0.55]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing["3xl"] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <ImageBackground source={MEAL_IMAGES[idea.id]} style={styles.heroImage}>
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "transparent", "rgba(20,12,20,0.95)"]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
              <Feather name="x" size={22} color={Colors.white} />
            </Pressable>
            <View style={[styles.goalChip, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
              <View style={[styles.goalDot, { backgroundColor: goalCfg.color }]} />
              <ThemedText style={styles.goalChipText}>{t(goalCfg.titleKey)}</ThemedText>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </ImageBackground>
        <View style={styles.body}>
        <ThemedText style={styles.title}>{t(idea.titleKey)}</ThemedText>
        <ThemedText style={styles.desc}>{t(idea.descKey)}</ThemedText>

        {/* Quick stats row */}
        <View style={styles.quickRow}>
          <View style={styles.quickCell}>
            <Feather name="zap" size={14} color="#f0c93e" />
            <ThemedText style={styles.quickValue}>{idea.calories}</ThemedText>
            <ThemedText style={styles.quickLabel}>{t("mealIdeas.detail.calories")}</ThemedText>
          </View>
          <View style={styles.quickCellDivider} />
          <View style={styles.quickCell}>
            <Feather name="activity" size={14} color="#4fc3f7" />
            <ThemedText style={styles.quickValue}>{idea.protein}g</ThemedText>
            <ThemedText style={styles.quickLabel}>{t("mealIdeas.detail.protein")}</ThemedText>
          </View>
          <View style={styles.quickCellDivider} />
          <View style={styles.quickCell}>
            <Feather name="clock" size={14} color="#a5d6a7" />
            <ThemedText style={styles.quickValue}>{idea.prepMins}</ThemedText>
            <ThemedText style={styles.quickLabel}>{t("mealIdeas.detail.minutes")}</ThemedText>
          </View>
        </View>

        {/* Nutrition */}
        <ThemedText style={styles.sectionTitle}>{t("mealIdeas.detail.nutrition")}</ThemedText>
        <GlassCard style={styles.nutritionCard}>
          <NutRow label={t("mealIdeas.detail.calories")} value={`${idea.calories}`} color="#f0c93e" />
          <NutRow label={t("mealIdeas.detail.protein")} value={`${idea.protein}g`} color="#4fc3f7" />
          <NutRow label={t("mealIdeas.detail.carbs")} value={`${idea.carbs}g`} color="#ff8a65" />
          <NutRow label={t("mealIdeas.detail.fat")} value={`${idea.fat}g`} color="#a5d6a7" last />
        </GlassCard>

        {/* Ingredients */}
        <ThemedText style={styles.sectionTitle}>{t("mealIdeas.detail.ingredients")}</ThemedText>
        <GlassCard style={styles.listCard}>
          {idea.ingredientKeys.map((k, i) => (
            <View key={k} style={[styles.ingredientRow, i === idea.ingredientKeys.length - 1 && styles.lastRow]}>
              <View style={[styles.bullet, { backgroundColor: idea.color }]} />
              <ThemedText style={styles.ingredientText}>{t(k)}</ThemedText>
            </View>
          ))}
        </GlassCard>

        {/* Steps */}
        <ThemedText style={styles.sectionTitle}>{t("mealIdeas.detail.howToPrepare")}</ThemedText>
        <GlassCard style={styles.listCard}>
          {idea.stepKeys.map((k, i) => (
            <View key={k} style={[styles.stepRow, i === idea.stepKeys.length - 1 && styles.lastRow]}>
              <View style={[styles.stepNum, { backgroundColor: idea.color }]}>
                <ThemedText style={styles.stepNumText}>{i + 1}</ThemedText>
              </View>
              <ThemedText style={styles.stepText}>{t(k)}</ThemedText>
            </View>
          ))}
        </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

function NutRow({ label, value, color, last }: { label: string; value: string; color: string; last?: boolean }) {
  return (
    <View style={[styles.nutRow, last && styles.lastRow]}>
      <View style={styles.nutLabelWrap}>
        <View style={[styles.nutDot, { backgroundColor: color }]} />
        <ThemedText style={styles.nutLabel}>{label}</ThemedText>
      </View>
      <ThemedText style={styles.nutValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  centered: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
  },
  backBtnInline: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
  },
  backBtnInlineText: { color: Colors.white, fontWeight: "700" },
  goalChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full,
  },
  goalDot: { width: 8, height: 8, borderRadius: 4 },
  goalChipText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
  scroll: { paddingTop: 0 },
  body: { paddingHorizontal: Spacing["2xl"] },
  heroImage: {
    width: "100%",
    height: 320,
    justifyContent: "flex-start",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26, fontWeight: "800", color: Colors.white,
    textAlign: "center", marginBottom: 6,
    paddingHorizontal: Spacing["2xl"],
  },
  desc: {
    fontSize: 14, color: Colors.white80, textAlign: "center",
    marginBottom: Spacing.lg, lineHeight: 20,
  },
  quickRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BorderRadius.lg, paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickCell: { flex: 1, alignItems: "center", gap: 4 },
  quickCellDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.15)" },
  quickValue: { fontSize: 18, fontWeight: "800", color: Colors.white },
  quickLabel: { fontSize: 11, color: Colors.white60 },
  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: Colors.white,
    marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  nutritionCard: { padding: Spacing.lg, marginBottom: Spacing.xl },
  nutRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  lastRow: { borderBottomWidth: 0 },
  nutLabelWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  nutDot: { width: 8, height: 8, borderRadius: 4 },
  nutLabel: { fontSize: 14, color: Colors.white80 },
  nutValue: { fontSize: 14, color: Colors.white, fontWeight: "700" },
  listCard: { padding: Spacing.lg, marginBottom: Spacing.xl },
  ingredientRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  bullet: { width: 7, height: 7, borderRadius: 4 },
  ingredientText: { flex: 1, fontSize: 14, color: Colors.white80, lineHeight: 20 },
  stepRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  stepNumText: { color: Colors.white, fontWeight: "800", fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, color: Colors.white80, lineHeight: 20 },
});
