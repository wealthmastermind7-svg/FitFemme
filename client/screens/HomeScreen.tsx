import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { CircularProgress } from "@/components/CircularProgress";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  storage,
  UserProfile,
  DailyMetrics,
  ScannedMeal,
  sampleUserProfile,
  sampleDailyMetrics,
  sampleWorkouts,
  initializeSampleData,
  GOAL_CONFIG,
  computeGoalStatus,
  getRecommendedWorkouts,
  computeWeeklyInsights,
  WeeklyInsights,
  WorkoutSession,
  computeNetEnergy,
  getGoalWorkoutExplanation,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useLanguage } from "@/lib/i18n";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile>(sampleUserProfile);
  const [metrics, setMetrics] = useState<DailyMetrics>(sampleDailyMetrics);
  const [todaysMeals, setTodaysMeals] = useState<ScannedMeal[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<WorkoutSession[]>([]);
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsights | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    await initializeSampleData();
    const userProfile = await storage.getUserProfile();
    const dailyMetrics = await storage.getDailyMetrics();
    const meals = await storage.getTodaysMeals();
    const weekMeals = await storage.getMealsLastNDays(7);
    const sessions = await storage.getTodaysWorkoutSessions();

    if (userProfile) setProfile(userProfile);
    if (dailyMetrics) setMetrics(dailyMetrics);
    setTodaysMeals(meals);
    setTodaysSessions(sessions);
    setWeeklyInsights(computeWeeklyInsights(userProfile?.bodyGoal, weekMeals));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.goodMorning");
    if (hour < 17) return t("home.goodAfternoon");
    return t("home.goodEvening");
  };

  const getFormattedDate = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  };

  const durationProgress = (metrics.durationMinutes / profile.durationGoal) * 100;

  const handleWorkoutPress = (workoutId: string) => {
    navigation.navigate("WorkoutPreview", { workoutId });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroContainer}>
        <ImageBackground
          source={require("../../assets/images/hero-fitness.png")}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.4)",
              "rgba(34,16,25,0.3)",
              "rgba(34,16,25,0.9)",
              Colors.backgroundDark,
            ]}
            locations={[0, 0.4, 0.8, 1]}
            style={styles.heroGradient}
          />

          <View style={[styles.heroHeader, { paddingTop: insets.top + Spacing.lg }]}>
            <View>
              <ThemedText style={styles.dateText}>{getFormattedDate()}</ThemedText>
            </View>
            <Pressable style={styles.notificationButton}>
              <Feather name="bell" size={20} color={Colors.white} />
            </Pressable>
          </View>

          <View style={styles.playButton}>
            <View style={styles.playButtonInner}>
              <Feather name="play" size={32} color={Colors.white} />
            </View>
          </View>

          <View style={styles.heroContent}>
            <ThemedText style={styles.greeting}>
              {getGreeting()},{"\n"}{profile.name}
            </ThemedText>
            <View style={styles.badges}>
              <View style={[styles.badge, styles.badgeSecondary]}>
                <Feather name="clock" size={14} color={Colors.white} />
                <ThemedText style={styles.badgeText}>{profile.durationGoal}m Goal</ThemedText>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.progressSection}>
        {profile.bodyGoal ? (() => {
          const cfg = GOAL_CONFIG[profile.bodyGoal];
          const calories = todaysMeals.reduce((s, m) => s + (m.calories || 0), 0);
          const protein = todaysMeals.reduce((s, m) => s + (m.protein || 0), 0);
          const burned = todaysSessions.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
          const energy = computeNetEnergy(profile.bodyGoal, calories, burned);
          const status = computeGoalStatus(profile.bodyGoal, calories);
          const calPct = Math.min(100, Math.round((calories / energy.effectiveTarget) * 100));
          const proPct = Math.min(100, Math.round((protein / cfg.proteinTarget) * 100));
          const statusColor =
            status.tone === "warn" ? "#f0a55a" : status.tone === "good" ? Colors.success : Colors.white60;
          return (
            <GlassCard>
              <View style={styles.goalHeader}>
                <View style={styles.goalHeaderLeft}>
                  <ThemedText style={styles.goalCardTitle}>{t("goalStatus.cardTitle")}</ThemedText>
                  <View style={styles.goalNameRow}>
                    <View style={[styles.goalDot, { backgroundColor: cfg.color }]} />
                    <ThemedText style={styles.goalName}>{t(cfg.titleKey)}</ThemedText>
                  </View>
                </View>
                <Pressable
                  onPress={() => navigation.navigate("GoalSetup", { mode: "edit" })}
                  hitSlop={10}
                  style={styles.goalEditBtn}
                >
                  <Feather name="edit-2" size={14} color={Colors.white60} />
                </Pressable>
              </View>

              <ThemedText style={[styles.goalStatusText, { color: statusColor }]}>
                {t(status.statusKey)}
              </ThemedText>

              <View style={styles.goalBarRow}>
                <View style={styles.goalBarLabelRow}>
                  <ThemedText style={styles.goalBarLabel}>{t("goalStatus.calories")}</ThemedText>
                  <ThemedText style={styles.goalBarValue}>
                    {Math.round(calories)} / {energy.effectiveTarget}
                  </ThemedText>
                </View>
                <View style={styles.goalBarTrack}>
                  <View style={[styles.goalBarFill, { width: `${calPct}%`, backgroundColor: cfg.color }]} />
                </View>
                {burned > 0 && (
                  <View style={styles.energyRow}>
                    <View style={styles.energyChip}>
                      <Feather name="zap" size={11} color="#ff8a65" />
                      <ThemedText style={styles.energyChipText}>
                        {t("home.burned")} {burned}
                      </ThemedText>
                    </View>
                    {energy.burnCreditUsed > 0 && (
                      <ThemedText style={styles.energyHint}>
                        +{energy.burnCreditUsed} {t("home.bonus")}
                      </ThemedText>
                    )}
                    {energy.burnCreditUsed === 0 && profile.bodyGoal === "lean_toned" && (
                      <ThemedText style={styles.energyHint}>{t("home.deficitProtected")}</ThemedText>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.goalBarRow}>
                <View style={styles.goalBarLabelRow}>
                  <ThemedText style={styles.goalBarLabel}>{t("goalStatus.protein")}</ThemedText>
                  <ThemedText style={styles.goalBarValue}>
                    {Math.round(protein)}g / {cfg.proteinTarget}g
                  </ThemedText>
                </View>
                <View style={styles.goalBarTrack}>
                  <View style={[styles.goalBarFill, { width: `${proPct}%`, backgroundColor: "#4fc3f7" }]} />
                </View>
              </View>

              {todaysMeals.length === 0 && (
                <Pressable
                  style={styles.goalScanCta}
                  onPress={() => navigation.navigate("FoodScanner")}
                >
                  <Feather name="camera" size={14} color={Colors.primary} />
                  <ThemedText style={styles.goalScanCtaText}>{t("goalStatus.scanCta")}</ThemedText>
                </Pressable>
              )}
            </GlassCard>
          );
        })() : (
          <Pressable onPress={() => navigation.navigate("GoalSetup", { mode: "edit" })}>
            <GlassCard>
              <View style={styles.goalHeader}>
                <View style={styles.goalHeaderLeft}>
                  <ThemedText style={styles.goalCardTitle}>{t("goalStatus.cardTitle")}</ThemedText>
                  <ThemedText style={styles.goalName}>{t("goal.pickerTitle")}</ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.white60} />
              </View>
              <ThemedText style={styles.goalStatusText}>{t("goal.pickerSubtitle")}</ThemedText>
            </GlassCard>
          </Pressable>
        )}
      </View>

      {profile.bodyGoal ? (
        <View style={styles.flowSection}>
          <GlassCard>
            <View style={styles.flowHeader}>
              <View style={styles.flowHeaderLeft}>
                <ThemedText style={styles.flowTitle}>{t("home.goalFlowTitle")}</ThemedText>
                <ThemedText style={styles.flowSubtitle}>{t("home.goalFlowSubtitle")}</ThemedText>
              </View>
            </View>
            <View style={styles.flowSteps}>
              <FlowStep index={1} label={t("home.goalFlowStep1")} active />
              <FlowConnector />
              <FlowStep
                index={2}
                label={t("home.goalFlowStep2")}
                active={todaysMeals.length > 0}
              />
              <FlowConnector />
              <FlowStep
                index={3}
                label={t("home.goalFlowStep3")}
                active={todaysSessions.length > 0}
              />
              <FlowConnector />
              <FlowStep index={4} label={t("home.goalFlowStep4")} active={todaysMeals.length > 0 || todaysSessions.length > 0} />
            </View>
            <ThemedText style={styles.flowHint}>{t("home.goalFlowHint")}</ThemedText>
          </GlassCard>
        </View>
      ) : null}

      <View style={styles.scannerSection}>
        <Pressable
          onPress={() => navigation.navigate("FoodScanner")}
          style={({ pressed }) => [styles.scannerCard, pressed && { opacity: 0.92 }]}
        >
          <ImageBackground
            source={require("../../assets/images/food/plate-hero.png")}
            style={styles.scannerImage}
            imageStyle={styles.scannerImageRadius}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(13,10,20,0.35)", "rgba(13,10,20,0.55)", "rgba(13,10,20,0.92)"]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.scannerContent}>
              <View style={styles.scannerIconCircle}>
                <Feather name="camera" size={22} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.scannerTitle}>Scan your meal</ThemedText>
                <ThemedText style={styles.scannerSubtitle}>
                  Get instant calories, macros & health score
                </ThemedText>
              </View>
              <View style={styles.scannerArrow}>
                <Feather name="arrow-right" size={18} color={Colors.white} />
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </View>

      {/* Weekly insights */}
      {profile.bodyGoal && (
        <View style={styles.workoutsSection}>
          <View style={styles.workoutsHeader}>
            <ThemedText style={styles.sectionTitle}>{t("home.thisWeek")}</ThemedText>
          </View>
          <GlassCard>
            {weeklyInsights && weeklyInsights.daysLogged > 0 ? (
              <View style={styles.insightsGrid}>
                <View style={styles.insightCell}>
                  <ThemedText style={styles.insightValue}>{weeklyInsights.daysLogged}/7</ThemedText>
                  <ThemedText style={styles.insightLabel}>{t("weeklyInsights.daysLogged")}</ThemedText>
                </View>
                <View style={styles.insightCell}>
                  <ThemedText style={styles.insightValue}>{weeklyInsights.avgCalories}</ThemedText>
                  <ThemedText style={styles.insightLabel}>{t("weeklyInsights.avgCalories")}</ThemedText>
                </View>
                <View style={styles.insightCell}>
                  <ThemedText style={styles.insightValue}>{weeklyInsights.avgProtein}g</ThemedText>
                  <ThemedText style={styles.insightLabel}>{t("weeklyInsights.avgProtein")}</ThemedText>
                </View>
                <View style={styles.insightCell}>
                  <ThemedText style={[styles.insightValue, { color: GOAL_CONFIG[profile.bodyGoal].color }]}>
                    {weeklyInsights.daysOnTrack}/{weeklyInsights.daysLogged}
                  </ThemedText>
                  <ThemedText style={styles.insightLabel}>{t("weeklyInsights.daysOnTrack")}</ThemedText>
                </View>
              </View>
            ) : (
              <ThemedText style={styles.insightsEmpty}>{t("weeklyInsights.empty")}</ThemedText>
            )}
          </GlassCard>

          <Pressable
            style={styles.mealIdeasLink}
            onPress={() => navigation.navigate("MealIdeas")}
          >
            <Feather name="book-open" size={14} color={Colors.primary} />
            <ThemedText style={styles.mealIdeasLinkText}>{t("home.viewMealIdeas")}</ThemedText>
            <Feather name="chevron-right" size={14} color={Colors.primary} />
          </Pressable>
        </View>
      )}

      <View style={styles.workoutsSection}>
        <View style={styles.workoutsHeader}>
          <ThemedText style={styles.sectionTitle}>
            {profile.bodyGoal ? t("home.recommendedForYou") : t("home.todaysWorkout")}
          </ThemedText>
        </View>
        {profile.bodyGoal ? (
          <View style={styles.goalWorkoutKey}>
            <Feather name="target" size={13} color={Colors.primary} />
            <ThemedText style={styles.goalWorkoutKeyText}>
              {t(getGoalWorkoutExplanation(profile.bodyGoal)?.titleKey ?? "goalWorkouts.title")}
            </ThemedText>
          </View>
        ) : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.workoutsList}
        >
          {getRecommendedWorkouts(profile.bodyGoal, sampleWorkouts, profile.bodyGoal ? 3 : sampleWorkouts.length).map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onPress={() => handleWorkoutPress(workout.id)}
            />
          ))}
        </ScrollView>
      </View>

      {profile.bodyGoal ? (
        <View style={styles.goalWorkoutSection}>
          <GlassCard>
            <View style={styles.goalWorkoutHeader}>
              <View style={styles.goalWorkoutHeaderCopy}>
                <ThemedText style={styles.goalWorkoutTitle}>{t("goalWorkouts.title")}</ThemedText>
                <ThemedText style={styles.goalWorkoutSubtitle}>
                  {t(getGoalWorkoutExplanation(profile.bodyGoal)?.titleKey ?? "goalWorkouts.title")}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.goalWorkoutBody}>
              {t(getGoalWorkoutExplanation(profile.bodyGoal)?.bodyKey ?? "goalWorkouts.title")}
            </ThemedText>
            <View style={styles.goalWorkoutTags}>
              {getGoalWorkoutExplanation(profile.bodyGoal)?.tags.map((tagKey) => (
                <View key={tagKey} style={styles.goalWorkoutTag}>
                  <ThemedText style={styles.goalWorkoutTagText}>{t(tagKey)}</ThemedText>
                </View>
              ))}
            </View>
          </GlassCard>
        </View>
      ) : null}

      <View style={styles.quoteSection}>
        <ThemedText style={styles.quote}>
          "Your only competition is who you were yesterday."
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  heroContainer: {
    height: 420,
    borderBottomLeftRadius: BorderRadius["2xl"],
    borderBottomRightRadius: BorderRadius["2xl"],
    overflow: "hidden",
  },
  heroImage: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: Spacing["2xl"],
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.accentPink,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  playButton: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
    opacity: 0.6,
  },
  playButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.white40,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["4xl"],
  },
  greeting: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.white,
    lineHeight: 42,
    marginBottom: Spacing.md,
  },
  badges: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  badgePrimary: {
    backgroundColor: Colors.primary,
  },
  badgeSecondary: {
    backgroundColor: Colors.white10,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  progressSection: {
    paddingHorizontal: Spacing["2xl"],
    marginTop: -Spacing["3xl"],
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  detailsLink: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.accentPink,
  },
  progressRings: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  ringContainer: {
    alignItems: "center",
    flex: 1,
  },
  ringValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.white40,
    textTransform: "uppercase",
  },
  durationValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
  },
  durationUnit: {
    fontSize: 9,
    color: Colors.white40,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  goalHeaderLeft: {
    flex: 1,
  },
  goalCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white60,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  goalNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  goalName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  goalWorkoutSection: {
    paddingHorizontal: Spacing["2xl"],
    marginTop: Spacing["2xl"],
  },
  goalWorkoutHeader: {
    marginBottom: Spacing.sm,
  },
  goalWorkoutHeaderCopy: {
    gap: 4,
  },
  goalWorkoutTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.white,
  },
  goalWorkoutSubtitle: {
    fontSize: 12,
    color: Colors.white40,
  },
  goalWorkoutBody: {
    fontSize: 13,
    color: Colors.white60,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  goalWorkoutTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  goalWorkoutTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(212,17,115,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,17,115,0.22)",
  },
  goalWorkoutTagText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: "600",
  },
  goalEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
  },
  goalStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.success,
    marginBottom: Spacing.lg,
  },
  goalBarRow: {
    marginBottom: Spacing.md,
  },
  goalBarLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  goalBarLabel: {
    fontSize: 12,
    color: Colors.white60,
    textTransform: "capitalize",
  },
  goalBarValue: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: "600",
  },
  goalBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white10,
    overflow: "hidden",
  },
  goalBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  energyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  energyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,138,101,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,138,101,0.3)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  energyChipText: {
    color: "#ff8a65",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  energyHint: {
    color: Colors.white60,
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  goalScanCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(212,17,115,0.15)",
    borderWidth: 1,
    borderColor: "rgba(212,17,115,0.3)",
  },
  goalScanCtaText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  insightCell: {
    width: "50%",
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  insightValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 11,
    color: Colors.white60,
    textAlign: "center",
  },
  insightsEmpty: {
    fontSize: 13,
    color: Colors.white60,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
  mealIdeasLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: 10,
  },
  mealIdeasLinkText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  chartSection: {
    paddingHorizontal: Spacing["2xl"],
    marginTop: Spacing["3xl"],
  },
  chartCard: {
    marginTop: Spacing.lg,
  },
  scannerSection: {
    paddingHorizontal: Spacing["2xl"],
    marginTop: Spacing["2xl"],
  },
  scannerCard: {
    height: 130,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.primaryGlow,
  },
  scannerImage: {
    flex: 1,
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  scannerImageRadius: {
    borderRadius: BorderRadius.xl,
  },
  scannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scannerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  scannerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 1,
  },
  scannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  scannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.white,
  },
  scannerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
    marginTop: 2,
  },
  scannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutsSection: {
    marginTop: Spacing["3xl"],
  },
  workoutsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  workoutsList: {
    paddingLeft: Spacing["2xl"],
    paddingRight: Spacing.lg,
  },
  quoteSection: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing["3xl"],
    alignItems: "center",
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.white40,
    textAlign: "center",
  },
});
