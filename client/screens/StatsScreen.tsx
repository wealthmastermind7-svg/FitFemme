import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Polygon, Text as SvgText } from "react-native-svg";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  storage,
  GOAL_CONFIG,
  type WorkoutSession,
  type ScannedMeal,
  type UserProfile,
  type CompletedExercise,
  type BodyGoal,
} from "@/lib/storage";
import { useSubscription } from "@/lib/revenuecat";
import Paywall from "@/components/Paywall";
import { useLanguage } from "@/lib/i18n";

const DAY_KEYS = [
  "stats.daySun",
  "stats.dayMon",
  "stats.dayTue",
  "stats.dayWed",
  "stats.dayThu",
  "stats.dayFri",
  "stats.daySat",
];

function dateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function safeNum(v: number, fallback = 0): number {
  return Number.isFinite(v) && v >= 0 ? v : fallback;
}

export default function StatsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { isSubscribed } = useSubscription();
  const { t } = useLanguage();
  const [paywallVisible, setPaywallVisible] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [meals, setMeals] = useState<ScannedMeal[]>([]);
  const [completed, setCompleted] = useState<CompletedExercise[]>([]);

  const loadAll = useCallback(async () => {
    try {
      const [p, s, m, c] = await Promise.all([
        storage.getUserProfile(),
        storage.getWorkoutSessions(),
        storage.getScannedMeals(),
        storage.getCompletedExercises(),
      ]);
      setProfile(p);
      setSessions(s || []);
      setMeals(m || []);
      setCompleted(c || []);
    } catch (e) {
      console.log("StatsScreen load error", e);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFocusEffect(
    React.useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  if (!isSubscribed) {
    return (
      <View
        style={[
          styles.container,
          styles.lockedContainer,
          { paddingTop: headerHeight + Spacing.xl, paddingBottom: tabBarHeight + Spacing.xl },
        ]}
      >
        <View style={styles.lockIcon}>
          <Feather name="lock" size={40} color={Colors.primary} />
        </View>
        <ThemedText style={styles.lockTitle}>{t("stats.locked")}</ThemedText>
        <ThemedText style={styles.lockDescription}>{t("stats.lockedDesc")}</ThemedText>
        <Pressable style={styles.unlockButton} onPress={() => setPaywallVisible(true)}>
          <ThemedText style={styles.unlockButtonText}>{t("stats.unlockPro")}</ThemedText>
        </Pressable>
        <Paywall isVisible={paywallVisible} onClose={() => setPaywallVisible(false)} />
      </View>
    );
  }

  // ----- Compute stats -----
  const today = new Date();
  const last7Keys: string[] = [];
  const last7Dates: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last7Dates.push(d);
    last7Keys.push(dateKey(d));
  }
  const last7Set = new Set(last7Keys);

  const sessions7 = sessions.filter((s) => last7Set.has(s.date));
  const meals7 = meals.filter((m) => last7Set.has(m.date));

  // Hero metrics
  const workoutsThisWeek = sessions7.length;
  const minutesThisWeek = sessions7.reduce((s, w) => s + safeNum(w.durationMinutes), 0);
  const burnedThisWeek = sessions7.reduce((s, w) => s + safeNum(w.caloriesBurned), 0);

  // Streak: count consecutive days with at least one session, ending today or yesterday
  const sessionDates = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const probe = new Date(today);
  // If no workout today, streak still counts up to yesterday
  if (!sessionDates.has(dateKey(probe))) {
    probe.setDate(probe.getDate() - 1);
  }
  while (sessionDates.has(dateKey(probe))) {
    streak++;
    probe.setDate(probe.getDate() - 1);
  }

  // Weekly activity bars (minutes per day)
  const minutesByDay = last7Keys.map((k) =>
    sessions.filter((s) => s.date === k).reduce((sum, s) => sum + safeNum(s.durationMinutes), 0),
  );
  const maxMinutes = Math.max(1, ...minutesByDay);
  const totalMinutes7 = minutesByDay.reduce((a, b) => a + b, 0);

  // Calorie balance (7-day avg eaten vs target)
  const goal: BodyGoal | undefined = profile?.bodyGoal;
  const goalCfg = goal ? GOAL_CONFIG[goal] : undefined;
  const mealDays = new Set(meals7.map((m) => m.date)).size;
  const totalCals7 = meals7.reduce((s, m) => s + safeNum(m.calories), 0);
  const avgCalories = mealDays > 0 ? Math.round(totalCals7 / mealDays) : 0;
  const target = goalCfg?.caloriesTarget ?? 0;
  const delta = avgCalories - target;
  const balanceTone: "good" | "warn" =
    target > 0 && Math.abs(delta) <= target * 0.1 ? "good" : "warn";
  const balanceMsgKey =
    avgCalories === 0
      ? "stats.balanceNoData"
      : balanceTone === "good"
        ? "stats.balanceOnTrack"
        : delta > 0
          ? "stats.balanceOver"
          : "stats.balanceUnder";

  // Macro mix (last 7 days)
  const totalProtein = meals7.reduce((s, m) => s + safeNum(m.protein), 0);
  const totalCarbs = meals7.reduce((s, m) => s + safeNum(m.carbs), 0);
  const totalFat = meals7.reduce((s, m) => s + safeNum(m.fat), 0);
  const proteinCal = totalProtein * 4;
  const carbsCal = totalCarbs * 4;
  const fatCal = totalFat * 9;
  const macroTotal = proteinCal + carbsCal + fatCal;
  const macroPct =
    macroTotal > 0
      ? {
          p: Math.round((proteinCal / macroTotal) * 100),
          c: Math.round((carbsCal / macroTotal) * 100),
          f: Math.round((fatCal / macroTotal) * 100),
        }
      : { p: 0, c: 0, f: 0 };

  // Personal records (across all stored sessions / 60-day window)
  const longest = sessions.reduce(
    (best, s) => (safeNum(s.durationMinutes) > best.durationMinutes ? s : best),
    { durationMinutes: 0, workoutTitle: "" } as Pick<WorkoutSession, "durationMinutes" | "workoutTitle">,
  );
  const burnByDay = new Map<string, number>();
  sessions.forEach((s) => {
    burnByDay.set(s.date, (burnByDay.get(s.date) ?? 0) + safeNum(s.caloriesBurned));
  });
  let bestBurn = 0;
  let bestBurnDate = "";
  burnByDay.forEach((v, k) => {
    if (v > bestBurn) {
      bestBurn = v;
      bestBurnDate = k;
    }
  });
  const categoryCounts = new Map<string, number>();
  sessions.forEach((s) => {
    categoryCounts.set(s.category, (categoryCounts.get(s.category) ?? 0) + 1);
  });
  let topCategory = "";
  let topCount = 0;
  categoryCounts.forEach((v, k) => {
    if (v > topCount) {
      topCount = v;
      topCategory = k;
    }
  });

  // Consistency (last 30 days)
  const last30Keys: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last30Keys.push(dateKey(d));
  }
  const set30 = new Set(last30Keys);
  const sessions30 = sessions.filter((s) => set30.has(s.date));
  const activeDays30 = new Set(sessions30.map((s) => s.date)).size;
  const minutes30 = sessions30.reduce((s, w) => s + safeNum(w.durationMinutes), 0);
  const avgPerActiveDay = activeDays30 > 0 ? Math.round(minutes30 / activeDays30) : 0;
  const consistencyPct = Math.round((activeDays30 / 30) * 100);

  // Muscle distribution (existing)
  const muscleData: Record<string, number> = { Back: 0, Chest: 0, Arms: 0, Legs: 0, Core: 0 };
  if (completed.length > 0) {
    const counts: Record<string, number> = {
      Back: 0, Chest: 0, Arms: 0, Legs: 0, Core: 0,
      Glutes: 0, Quads: 0, Hamstrings: 0, Shoulders: 0,
      Obliques: 0, "Lower Abs": 0, Hips: 0, Cardio: 0, Abs: 0,
    };
    const mapping: Record<string, string> = {
      Glutes: "Legs", Quads: "Legs", Hamstrings: "Legs",
      Shoulders: "Arms", Obliques: "Core", "Lower Abs": "Core",
      Abs: "Core", Hips: "Legs", Cardio: "Legs",
    };
    completed.forEach((ex) => {
      ex.muscleGroups.forEach((m) => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });
    Object.keys(counts).forEach((m) => {
      const mapped = mapping[m] || m;
      if (mapped in muscleData) muscleData[mapped] += counts[m];
    });
    const total = Object.values(muscleData).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(muscleData).forEach((m) => {
        muscleData[m] = Math.round((muscleData[m] / total) * 100);
      });
    }
  }

  const labels = Object.keys(muscleData);
  const values = Object.values(muscleData);
  const numSides = 5;
  const center = 150;
  const radius = 100;
  const getPoint = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / numSides - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };
  const polygonPoints = values.map((v, i) => getPoint(i, v)).map((p) => `${p.x},${p.y}`).join(" ");
  const muscleHasData = values.some((v) => v > 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t("stats.headerTitle")}</ThemedText>
        <ThemedText style={styles.subtitle}>{t("stats.headerSubtitle")}</ThemedText>
      </View>

      {/* Hero metric grid */}
      <View style={styles.heroGrid}>
        <HeroTile
          icon="activity"
          color={Colors.primary}
          value={String(workoutsThisWeek)}
          label={t("stats.workouts")}
          sub={t("stats.thisWeek")}
        />
        <HeroTile
          icon="clock"
          color="#4fc3f7"
          value={String(minutesThisWeek)}
          label={t("stats.minutes")}
          sub={t("stats.thisWeek")}
        />
        <HeroTile
          icon="zap"
          color="#ff8a65"
          value={String(burnedThisWeek)}
          label={t("stats.calsBurned")}
          sub={t("stats.thisWeek")}
        />
        <HeroTile
          icon="award"
          color="#f0c93e"
          value={String(streak)}
          label={t("stats.streakDays")}
        />
      </View>

      {/* Weekly activity bars */}
      <Card>
        <CardHeader title={t("stats.activityTitle")} subtitle={t("stats.activitySubtitle")} icon="bar-chart-2" />
        {totalMinutes7 === 0 ? (
          <ThemedText style={styles.emptyText}>{t("stats.activityEmpty")}</ThemedText>
        ) : (
          <View style={styles.barChart}>
            {minutesByDay.map((mins, i) => {
              const pct = (mins / maxMinutes) * 100;
              const isToday = i === minutesByDay.length - 1;
              const dayIdx = last7Dates[i].getDay();
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${pct}%`,
                          backgroundColor: mins > 0 ? Colors.primary : Colors.white10,
                          opacity: isToday ? 1 : 0.85,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText
                    style={[
                      styles.barValue,
                      { color: mins > 0 ? Colors.white : Colors.white40 },
                    ]}
                  >
                    {mins}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.barLabel,
                      isToday && { color: Colors.primary, fontWeight: "700" },
                    ]}
                  >
                    {t(DAY_KEYS[dayIdx])}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* Calorie Balance */}
      {goalCfg && (
        <Card>
          <CardHeader title={t("stats.balanceTitle")} subtitle={t("stats.balanceSubtitle")} icon="pie-chart" />
          {avgCalories === 0 ? (
            <ThemedText style={styles.emptyText}>{t("stats.balanceNoData")}</ThemedText>
          ) : (
            <>
              <View style={styles.balanceRow}>
                <View style={styles.balanceCol}>
                  <ThemedText style={styles.balanceValue}>{avgCalories}</ThemedText>
                  <ThemedText style={styles.balanceLabel}>{t("stats.balanceEaten")}</ThemedText>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceCol}>
                  <ThemedText style={[styles.balanceValue, { color: goalCfg.color }]}>
                    {target}
                  </ThemedText>
                  <ThemedText style={styles.balanceLabel}>{t("stats.balanceTarget")}</ThemedText>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceCol}>
                  <ThemedText
                    style={[
                      styles.balanceValue,
                      { color: balanceTone === "good" ? Colors.success : "#f0a55a" },
                    ]}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </ThemedText>
                  <ThemedText style={styles.balanceLabel}>{t("stats.balanceDelta")}</ThemedText>
                </View>
              </View>
              <View
                style={[
                  styles.balanceMsg,
                  { backgroundColor: balanceTone === "good" ? "rgba(76,175,80,0.12)" : "rgba(240,165,90,0.12)" },
                ]}
              >
                <Feather
                  name={balanceTone === "good" ? "check-circle" : "alert-circle"}
                  size={14}
                  color={balanceTone === "good" ? Colors.success : "#f0a55a"}
                />
                <ThemedText
                  style={[
                    styles.balanceMsgText,
                    { color: balanceTone === "good" ? Colors.success : "#f0a55a" },
                  ]}
                >
                  {t(balanceMsgKey)}
                </ThemedText>
              </View>
            </>
          )}
        </Card>
      )}

      {/* Macro Mix */}
      <Card>
        <CardHeader title={t("stats.macroTitle")} subtitle={t("stats.macroSubtitle")} icon="layers" />
        {macroTotal === 0 ? (
          <ThemedText style={styles.emptyText}>{t("stats.macroEmpty")}</ThemedText>
        ) : (
          <>
            <View style={styles.macroBar}>
              <View style={{ flex: macroPct.p, backgroundColor: "#d41173" }} />
              <View style={{ flex: macroPct.c, backgroundColor: "#f0c93e" }} />
              <View style={{ flex: macroPct.f, backgroundColor: "#4fc3f7" }} />
            </View>
            <View style={styles.macroLegend}>
              <MacroLegendItem color="#d41173" label={t("stats.macroProtein")} pct={macroPct.p} grams={Math.round(totalProtein)} />
              <MacroLegendItem color="#f0c93e" label={t("stats.macroCarbs")} pct={macroPct.c} grams={Math.round(totalCarbs)} />
              <MacroLegendItem color="#4fc3f7" label={t("stats.macroFat")} pct={macroPct.f} grams={Math.round(totalFat)} />
            </View>
          </>
        )}
      </Card>

      {/* Personal Records */}
      <Card>
        <CardHeader title={t("stats.recordsTitle")} subtitle={t("stats.recordsSubtitle")} icon="award" />
        {sessions.length === 0 ? (
          <ThemedText style={styles.emptyText}>{t("stats.recordsEmpty")}</ThemedText>
        ) : (
          <View style={styles.recordsList}>
            <RecordRow
              icon="clock"
              color="#4fc3f7"
              label={t("stats.recordLongest")}
              value={`${longest.durationMinutes} ${t("stats.minShort")}`}
              detail={longest.workoutTitle}
            />
            <RecordRow
              icon="zap"
              color="#ff8a65"
              label={t("stats.recordBiggestBurn")}
              value={`${bestBurn} cal`}
              detail={bestBurnDate}
            />
            <RecordRow
              icon="trending-up"
              color={Colors.primary}
              label={t("stats.recordTopCategory")}
              value={topCategory}
              detail={`${topCount} × `}
            />
          </View>
        )}
      </Card>

      {/* Consistency */}
      <Card>
        <CardHeader title={t("stats.consistencyTitle")} subtitle={t("stats.consistencySubtitle")} icon="calendar" />
        <View style={styles.consistencyRow}>
          <View style={styles.consistencyCol}>
            <ThemedText style={styles.consistencyValue}>{activeDays30}/30</ThemedText>
            <ThemedText style={styles.consistencyLabel}>{t("stats.consistencyActiveDays")}</ThemedText>
          </View>
          <View style={styles.consistencyCol}>
            <ThemedText style={styles.consistencyValue}>{avgPerActiveDay} {t("stats.minShort")}</ThemedText>
            <ThemedText style={styles.consistencyLabel}>{t("stats.consistencyAvgPerDay")}</ThemedText>
          </View>
        </View>
        <View style={styles.consistencyTrack}>
          <View style={[styles.consistencyFill, { width: `${consistencyPct}%` }]} />
        </View>
      </Card>

      {/* Muscle Distribution (kept) */}
      <Card>
        <CardHeader title={t("stats.muscleTitle")} subtitle={t("stats.muscleSubtitle")} icon="target" />
        <View style={{ alignItems: "center" }}>
          <Svg width={300} height={320}>
            {[20, 40, 60, 80, 100].map((level) => {
              const gridPoints = Array.from({ length: numSides }, (_, i) => getPoint(i, level))
                .map((p) => `${p.x},${p.y}`)
                .join(" ");
              return (
                <Polygon
                  key={`grid-${level}`}
                  points={gridPoints}
                  fill="none"
                  stroke={Colors.white10}
                  strokeWidth="1"
                />
              );
            })}
            <Polygon
              points={polygonPoints}
              fill={Colors.primary + "30"}
              stroke={Colors.primary}
              strokeWidth="2.5"
            />
            {labels.map((label, idx) => {
              const point = getPoint(idx, 110);
              const muscleKey = `muscle.${label.toLowerCase()}`;
              const translated = t(muscleKey);
              return (
                <SvgText
                  key={`label-${idx}`}
                  x={point.x}
                  y={point.y}
                  fontSize="14"
                  fill={Colors.white60}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {translated && translated !== muscleKey ? translated : label}
                </SvgText>
              );
            })}
          </Svg>
          {!muscleHasData && (
            <ThemedText style={styles.emptyText}>{t("stats.muscleEmpty")}</ThemedText>
          )}
        </View>
      </Card>
    </ScrollView>
  );
}

function HeroTile({
  icon,
  color,
  value,
  label,
  sub,
}: {
  icon: keyof typeof Feather.glyphMap;
  color: string;
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <View style={styles.heroTile}>
      <View style={[styles.heroIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <ThemedText style={styles.heroValue}>{value}</ThemedText>
      <ThemedText style={styles.heroLabel}>{label}</ThemedText>
      {sub ? <ThemedText style={styles.heroSub}>{sub}</ThemedText> : null}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function CardHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderIcon}>
        <Feather name={icon} size={14} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        {subtitle ? <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText> : null}
      </View>
    </View>
  );
}

function MacroLegendItem({
  color,
  label,
  pct,
  grams,
}: {
  color: string;
  label: string;
  pct: number;
  grams: number;
}) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.macroItemLabel}>{label}</ThemedText>
        <ThemedText style={styles.macroItemSub}>{grams}g</ThemedText>
      </View>
      <ThemedText style={styles.macroItemPct}>{pct}%</ThemedText>
    </View>
  );
}

function RecordRow({
  icon,
  color,
  label,
  value,
  detail,
}: {
  icon: keyof typeof Feather.glyphMap;
  color: string;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <View style={styles.recordRow}>
      <View style={[styles.recordIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.recordLabel}>{label}</ThemedText>
        {detail ? <ThemedText style={styles.recordDetail}>{detail}</ThemedText> : null}
      </View>
      <ThemedText style={styles.recordValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: { paddingHorizontal: Spacing["2xl"], marginBottom: Spacing.xl },
  title: { fontSize: 32, fontWeight: "800", color: Colors.white, marginBottom: Spacing.xs },
  subtitle: { fontSize: 15, color: Colors.white40 },

  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing["2xl"],
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  heroTile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white05,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  heroValue: { fontSize: 26, fontWeight: "800", color: Colors.white },
  heroLabel: { fontSize: 13, color: Colors.white60, marginTop: 2 },
  heroSub: { fontSize: 11, color: Colors.white40, marginTop: 2 },

  card: {
    marginHorizontal: Spacing["2xl"],
    marginBottom: Spacing.xl,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.white05,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.lg, gap: Spacing.sm },
  cardHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(212,17,115,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: Colors.white },
  cardSubtitle: { fontSize: 12, color: Colors.white40, marginTop: 2 },

  emptyText: {
    fontSize: 13,
    color: Colors.white40,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: Spacing.lg,
  },

  // Bar chart
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
    paddingTop: Spacing.sm,
  },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: {
    width: "60%",
    height: 110,
    backgroundColor: Colors.white05,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 6 },
  barValue: { fontSize: 11, color: Colors.white60, marginTop: 6, fontWeight: "600" },
  barLabel: { fontSize: 11, color: Colors.white40, marginTop: 2 },

  // Balance
  balanceRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.lg },
  balanceCol: { flex: 1, alignItems: "center" },
  balanceDivider: { width: 1, height: 36, backgroundColor: Colors.white10 },
  balanceValue: { fontSize: 22, fontWeight: "800", color: Colors.white },
  balanceLabel: { fontSize: 11, color: Colors.white40, marginTop: 4, textAlign: "center" },
  balanceMsg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  balanceMsgText: { fontSize: 13, fontWeight: "600" },

  // Macro
  macroBar: {
    flexDirection: "row",
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white05,
  },
  macroLegend: { gap: Spacing.sm },
  macroItem: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  macroDot: { width: 10, height: 10, borderRadius: 5 },
  macroItemLabel: { fontSize: 14, color: Colors.white, fontWeight: "600" },
  macroItemSub: { fontSize: 11, color: Colors.white40 },
  macroItemPct: { fontSize: 14, color: Colors.white60, fontWeight: "700" },

  // Records
  recordsList: { gap: Spacing.md },
  recordRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  recordIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  recordLabel: { fontSize: 14, color: Colors.white, fontWeight: "600" },
  recordDetail: { fontSize: 11, color: Colors.white40, marginTop: 2 },
  recordValue: { fontSize: 15, color: Colors.primary, fontWeight: "700" },

  // Consistency
  consistencyRow: { flexDirection: "row", marginBottom: Spacing.md },
  consistencyCol: { flex: 1 },
  consistencyValue: { fontSize: 22, fontWeight: "800", color: Colors.white },
  consistencyLabel: { fontSize: 11, color: Colors.white40, marginTop: 2 },
  consistencyTrack: {
    height: 8,
    backgroundColor: Colors.white05,
    borderRadius: 4,
    overflow: "hidden",
  },
  consistencyFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },

  // Locked
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  lockIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(212,17,115,0.15)",
    justifyContent: "center", alignItems: "center",
    marginBottom: Spacing.lg,
  },
  lockTitle: { fontSize: 22, fontWeight: "700", color: Colors.white, textAlign: "center", marginBottom: Spacing.md },
  lockDescription: { fontSize: 15, color: Colors.white60, textAlign: "center", lineHeight: 22, marginBottom: Spacing["2xl"] },
  unlockButton: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, paddingHorizontal: Spacing["2xl"], borderRadius: BorderRadius.md },
  unlockButtonText: { fontSize: 16, fontWeight: "700", color: Colors.white },
});
