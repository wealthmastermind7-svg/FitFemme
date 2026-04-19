/**
 * Cal AI–style step components for the Fit Femme onboarding flow.
 * Each step is a small presentation component — the parent flow
 * (`./index.tsx`) owns the state machine and persistence.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as StoreReview from "expo-store-review";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { OptionCard, StepHeading, WheelPicker, tap } from "./shared";
import {
  BodyGoal,
  DietType,
  GOAL_CONFIG,
  WeightDirection,
  computeMacroTargets,
} from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* Step 1 — workouts per week                                          */
/* ------------------------------------------------------------------ */

export const WORKOUT_BUCKETS: { id: number; titleKey: string; descKey: string }[] = [
  { id: 1, titleKey: "onb2.workouts.opt1", descKey: "onb2.workouts.opt1Desc" },
  { id: 4, titleKey: "onb2.workouts.opt2", descKey: "onb2.workouts.opt2Desc" },
  { id: 6, titleKey: "onb2.workouts.opt3", descKey: "onb2.workouts.opt3Desc" },
];

export function WorkoutsStep({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading
        title={t("onb2.workouts.title")}
        subtitle={t("onb2.workouts.subtitle")}
      />
      {WORKOUT_BUCKETS.map((b) => (
        <OptionCard
          key={b.id}
          icon={b.id === 1 ? "circle" : b.id === 4 ? "more-horizontal" : "grid"}
          title={t(b.titleKey)}
          subtitle={t(b.descKey)}
          selected={value === b.id}
          onPress={() => onChange(b.id)}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — source                                                     */
/* ------------------------------------------------------------------ */

const SOURCES = [
  { id: "google", icon: "globe" as const, labelKey: "onb2.source.google" },
  { id: "instagram", icon: "instagram" as const, labelKey: "onb2.source.instagram" },
  { id: "tiktok", icon: "video" as const, labelKey: "onb2.source.tiktok" },
  { id: "friend", icon: "users" as const, labelKey: "onb2.source.friend" },
  { id: "x", icon: "twitter" as const, labelKey: "onb2.source.x" },
  { id: "appstore", icon: "shopping-bag" as const, labelKey: "onb2.source.appstore" },
  { id: "other", icon: "more-horizontal" as const, labelKey: "onb2.source.other" },
];

export function SourceStep({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading title={t("onb2.source.title")} />
      {SOURCES.map((s) => (
        <OptionCard
          key={s.id}
          icon={s.icon}
          title={t(s.labelKey)}
          selected={value === s.id}
          onPress={() => onChange(s.id)}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — tried other apps                                           */
/* ------------------------------------------------------------------ */

export function TriedOthersStep({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading title={t("onb2.tried.title")} />
      <View style={{ flex: 1, minHeight: 200 }} />
      <OptionCard
        icon="thumbs-up"
        title={t("onb2.yes")}
        selected={value === true}
        onPress={() => onChange(true)}
      />
      <OptionCard
        icon="thumbs-down"
        title={t("onb2.no")}
        selected={value === false}
        onPress={() => onChange(false)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — height & weight                                            */
/* ------------------------------------------------------------------ */

export function HeightWeightStep({
  units,
  setUnits,
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
}: {
  units: "Imperial" | "Metric";
  setUnits: (u: "Imperial" | "Metric") => void;
  heightCm: number;
  setHeightCm: (n: number) => void;
  weightKg: number;
  setWeightKg: (n: number) => void;
}) {
  const { t } = useLanguage();

  // Build picker arrays based on units. Imperial uses ft/in pairs; metric is
  // a single column for cm. Weight: lbs or kg.
  const isMetric = units === "Metric";

  // Height ranges
  const cmValues = useMemo(() => Array.from({ length: 101 }, (_, i) => 120 + i), []); // 120..220
  const ftValues = useMemo(() => [3, 4, 5, 6, 7], []);
  const inValues = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  // Weight ranges
  const kgValues = useMemo(() => Array.from({ length: 161 }, (_, i) => 35 + i), []); // 35..195
  const lbValues = useMemo(() => Array.from({ length: 351 }, (_, i) => 80 + i), []); // 80..430

  // Derive imperial pieces from metric height
  const totalIn = Math.round(heightCm / 2.54);
  const ft = Math.max(3, Math.min(7, Math.floor(totalIn / 12)));
  const inch = Math.max(0, Math.min(11, totalIn - ft * 12));

  // Indices for wheels
  const cmIdx = Math.max(0, cmValues.indexOf(Math.round(heightCm)));
  const ftIdx = ftValues.indexOf(ft);
  const inIdx = inValues.indexOf(inch);

  const lbsRounded = Math.round(weightKg / 0.45359237);
  const kgIdx = Math.max(0, kgValues.indexOf(Math.round(weightKg)));
  const lbIdx = Math.max(0, lbValues.indexOf(lbsRounded));

  return (
    <>
      <StepHeading
        title={t("onb2.body.title")}
        subtitle={t("onb2.body.subtitle")}
      />
      <View style={bodyStyles.unitsRow}>
        {(["Imperial", "Metric"] as const).map((u) => {
          const active = units === u;
          return (
            <Pressable
              key={u}
              onPress={() => {
                if (u !== units) {
                  tap();
                  setUnits(u);
                }
              }}
              style={[bodyStyles.unitsBtn, active && bodyStyles.unitsBtnActive]}
            >
              <ThemedText
                style={[
                  bodyStyles.unitsLabel,
                  active && { color: Colors.white },
                ]}
              >
                {u === "Metric" ? t("onb2.body.metric") : t("onb2.body.imperial")}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={bodyStyles.wheelsRow}>
        {isMetric ? (
          <WheelPicker
            label={t("onb2.body.height")}
            values={cmValues}
            selectedIndex={cmIdx}
            onChange={(i) => setHeightCm(cmValues[i])}
            format={(v) => `${v} cm`}
            width={130}
          />
        ) : (
          <View style={bodyStyles.heightImperial}>
            <WheelPicker
              label={t("onb2.body.height")}
              values={ftValues}
              selectedIndex={ftIdx === -1 ? 2 : ftIdx}
              onChange={(i) => {
                const newFt = ftValues[i];
                setHeightCm(Math.round((newFt * 12 + inch) * 2.54));
              }}
              format={(v) => `${v} ft`}
              width={80}
            />
            <WheelPicker
              label=" "
              values={inValues}
              selectedIndex={inIdx === -1 ? 0 : inIdx}
              onChange={(i) => {
                const newIn = inValues[i];
                setHeightCm(Math.round((ft * 12 + newIn) * 2.54));
              }}
              format={(v) => `${v} in`}
              width={80}
            />
          </View>
        )}

        {isMetric ? (
          <WheelPicker
            label={t("onb2.body.weight")}
            values={kgValues}
            selectedIndex={kgIdx}
            onChange={(i) => setWeightKg(kgValues[i])}
            format={(v) => `${v} kg`}
            width={120}
          />
        ) : (
          <WheelPicker
            label={t("onb2.body.weight")}
            values={lbValues}
            selectedIndex={lbIdx}
            onChange={(i) => setWeightKg(Math.round(lbValues[i] * 0.45359237))}
            format={(v) => `${v} lb`}
            width={120}
          />
        )}
      </View>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — birth date                                                 */
/* ------------------------------------------------------------------ */

export function BirthDateStep({
  year,
  month,
  day,
  onChange,
}: {
  year: number;
  month: number; // 1..12
  day: number;
  onChange: (y: number, m: number, d: number) => void;
}) {
  const { t, language } = useLanguage();
  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(
      language === "es" ? "es" : language === "pt" ? "pt-BR" : "en",
      { month: "long" },
    );
    return Array.from({ length: 12 }, (_, i) =>
      fmt.format(new Date(2000, i, 1)),
    );
  }, [language]);
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 73 }, (_, i) => currentYear - 13 - i),
    [currentYear],
  );
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  const yearIdx = Math.max(0, years.indexOf(year));
  const monthIdx = Math.max(0, Math.min(11, month - 1));
  const dayIdx = Math.max(0, Math.min(30, day - 1));

  return (
    <>
      <StepHeading
        title={t("onb2.birth.title")}
        subtitle={t("onb2.birth.subtitle")}
      />
      <View style={bodyStyles.wheelsRow}>
        <WheelPicker
          values={months}
          selectedIndex={monthIdx}
          onChange={(i) => onChange(year, i + 1, day)}
          width={130}
        />
        <WheelPicker
          values={days}
          selectedIndex={dayIdx}
          onChange={(i) => onChange(year, month, days[i])}
          width={70}
        />
        <WheelPicker
          values={years}
          selectedIndex={yearIdx}
          onChange={(i) => onChange(years[i], month, day)}
          width={90}
        />
      </View>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 6 — coach yes/no                                               */
/* ------------------------------------------------------------------ */

export function CoachStep({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading title={t("onb2.coach.title")} />
      <View style={{ flex: 1, minHeight: 200 }} />
      <OptionCard
        icon="check"
        title={t("onb2.yes")}
        selected={value === true}
        onPress={() => onChange(true)}
      />
      <OptionCard
        icon="x"
        title={t("onb2.no")}
        selected={value === false}
        onPress={() => onChange(false)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 7 — weight direction (lose/maintain/gain)                      */
/* ------------------------------------------------------------------ */

export function DirectionStep({
  value,
  onChange,
}: {
  value: WeightDirection | null;
  onChange: (v: WeightDirection) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading
        title={t("onb2.direction.title")}
        subtitle={t("onb2.direction.subtitle")}
      />
      <OptionCard
        icon="trending-down"
        title={t("onb2.direction.lose")}
        selected={value === "lose"}
        onPress={() => onChange("lose")}
      />
      <OptionCard
        icon="minus"
        title={t("onb2.direction.maintain")}
        selected={value === "maintain"}
        onPress={() => onChange("maintain")}
      />
      <OptionCard
        icon="trending-up"
        title={t("onb2.direction.gain")}
        selected={value === "gain"}
        onPress={() => onChange("gain")}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 8 — body goal (Fit Femme specific)                             */
/* ------------------------------------------------------------------ */

const BODY_GOALS: {
  id: BodyGoal;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { id: "lean_toned", icon: "zap" },
  { id: "booty_builder", icon: "trending-up" },
  { id: "flat_stomach", icon: "star" },
];

export function BodyGoalStep({
  value,
  onChange,
}: {
  value: BodyGoal | null;
  onChange: (v: BodyGoal) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading
        title={t("onb2.bodyGoal.title")}
        subtitle={t("onb2.bodyGoal.subtitle")}
      />
      {BODY_GOALS.map((g) => (
        <OptionCard
          key={g.id}
          icon={g.icon}
          iconBg={value === g.id ? "rgba(255,255,255,0.18)" : GOAL_CONFIG[g.id].color + "33"}
          iconColor={value === g.id ? Colors.white : GOAL_CONFIG[g.id].color}
          title={t(GOAL_CONFIG[g.id].titleKey)}
          subtitle={t(`goal.${g.id === "lean_toned" ? "leanToned" : g.id === "booty_builder" ? "bootyBuilder" : "flatStomach"}.short`)}
          selected={value === g.id}
          onPress={() => onChange(g.id)}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 9 — blockers (multi-select)                                    */
/* ------------------------------------------------------------------ */

const BLOCKERS = [
  { id: "consistency", icon: "bar-chart-2" as const, labelKey: "onb2.blockers.consistency" },
  { id: "eating", icon: "coffee" as const, labelKey: "onb2.blockers.eating" },
  { id: "support", icon: "users" as const, labelKey: "onb2.blockers.support" },
  { id: "schedule", icon: "calendar" as const, labelKey: "onb2.blockers.schedule" },
  { id: "inspiration", icon: "feather" as const, labelKey: "onb2.blockers.inspiration" },
];

export function BlockersStep({
  values,
  onToggle,
}: {
  values: string[];
  onToggle: (id: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading title={t("onb2.blockers.title")} />
      {BLOCKERS.map((b) => (
        <OptionCard
          key={b.id}
          icon={b.icon}
          title={t(b.labelKey)}
          selected={values.includes(b.id)}
          onPress={() => onToggle(b.id)}
          multi
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 10 — diet                                                      */
/* ------------------------------------------------------------------ */

const DIETS: { id: DietType; icon: keyof typeof Feather.glyphMap; labelKey: string }[] = [
  { id: "classic", icon: "circle", labelKey: "onb2.diet.classic" },
  { id: "pescatarian", icon: "anchor", labelKey: "onb2.diet.pescatarian" },
  { id: "vegetarian", icon: "feather", labelKey: "onb2.diet.vegetarian" },
  { id: "vegan", icon: "wind", labelKey: "onb2.diet.vegan" },
];

export function DietStep({
  value,
  onChange,
}: {
  value: DietType | null;
  onChange: (v: DietType) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading title={t("onb2.diet.title")} />
      {DIETS.map((d) => (
        <OptionCard
          key={d.id}
          icon={d.icon}
          title={t(d.labelKey)}
          selected={value === d.id}
          onPress={() => onChange(d.id)}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 11 — accomplishments (multi-select)                            */
/* ------------------------------------------------------------------ */

const ACCOMPLISHMENTS = [
  { id: "healthier", icon: "heart" as const, labelKey: "onb2.accomplish.healthier" },
  { id: "energy", icon: "sun" as const, labelKey: "onb2.accomplish.energy" },
  { id: "motivated", icon: "zap" as const, labelKey: "onb2.accomplish.motivated" },
  { id: "body", icon: "smile" as const, labelKey: "onb2.accomplish.body" },
];

export function AccomplishStep({
  values,
  onToggle,
}: {
  values: string[];
  onToggle: (id: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <StepHeading title={t("onb2.accomplish.title")} />
      {ACCOMPLISHMENTS.map((a) => (
        <OptionCard
          key={a.id}
          icon={a.icon}
          title={t(a.labelKey)}
          selected={values.includes(a.id)}
          onPress={() => onToggle(a.id)}
          multi
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 12 — trust                                                     */
/* ------------------------------------------------------------------ */

export function TrustStep() {
  const { t } = useLanguage();
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  return (
    <View style={trustStyles.wrap}>
      <Animated.View style={[trustStyles.circle, pulseStyle]}>
        <LinearGradient
          colors={[
            "rgba(212,17,115,0.35)",
            "rgba(212,17,115,0.05)",
          ]}
          style={[trustStyles.circle, { position: "absolute" }]}
        />
        <Feather name="heart" size={56} color={Colors.primary} />
      </Animated.View>
      <ThemedText style={trustStyles.title}>{t("onb2.trust.title")}</ThemedText>
      <ThemedText style={trustStyles.sub}>{t("onb2.trust.subtitle")}</ThemedText>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 13 — reviews                                                   */
/* ------------------------------------------------------------------ */

const REVIEWS = [
  {
    name: "Sofia M.",
    flag: "🇧🇷",
    quoteKey: "onb2.review.q1",
  },
  {
    name: "Camila R.",
    flag: "🇲🇽",
    quoteKey: "onb2.review.q2",
  },
  {
    name: "Aaliyah J.",
    flag: "🇺🇸",
    quoteKey: "onb2.review.q3",
  },
];

export function ReviewsStep() {
  const { t } = useLanguage();

  // Surface the native App Store / Play Store rating prompt while the user is
  // looking at the social-proof page. The OS throttles this aggressively
  // (max ~3 prompts per 365 days on iOS), so we don't need our own debounce.
  // Web has no notion of a store rating; skip entirely.
  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const available = await StoreReview.isAvailableAsync();
        if (!available || cancelled) return;
        // hasAction guards against environments (e.g. simulators without a
        // signed-in App Store account) where requesting would be a no-op.
        const hasAction = await StoreReview.hasAction();
        if (!hasAction || cancelled) return;
        await StoreReview.requestReview();
      } catch {
        // Never let a rating-prompt failure block onboarding.
      }
    }, 700);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <StepHeading title={t("onb2.reviews.title")} />
      <View style={reviewStyles.statsRow}>
        <View style={reviewStyles.statBlock}>
          <View style={reviewStyles.starsRow}>
            <ThemedText style={reviewStyles.statBig}>4.9</ThemedText>
            <Feather name="star" size={20} color={Colors.primary} />
          </View>
          <ThemedText style={reviewStyles.statSub}>{t("onb2.reviews.avg")}</ThemedText>
        </View>
        <View style={reviewStyles.statBlock}>
          <ThemedText style={reviewStyles.statBig}>250K+</ThemedText>
          <ThemedText style={reviewStyles.statSub}>{t("onb2.reviews.women")}</ThemedText>
        </View>
      </View>

      {REVIEWS.map((r, idx) => (
        <Animated.View
          key={r.name}
          entering={FadeInDown.duration(380).delay(idx * 100)}
          style={reviewStyles.card}
        >
          <View style={reviewStyles.cardHead}>
            <View style={reviewStyles.avatar}>
              <ThemedText style={reviewStyles.avatarTxt}>{r.flag}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={reviewStyles.cardName}>{r.name}</ThemedText>
              <View style={{ flexDirection: "row", gap: 2, marginTop: 2 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Feather key={i} name="star" size={12} color={Colors.primary} />
                ))}
              </View>
            </View>
          </View>
          <ThemedText style={reviewStyles.cardQuote}>{t(r.quoteKey)}</ThemedText>
        </Animated.View>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 14 — building (animated progress)                              */
/* ------------------------------------------------------------------ */

const BUILD_LINES = [
  "onb2.build.l1",
  "onb2.build.l2",
  "onb2.build.l3",
  "onb2.build.l4",
  "onb2.build.l5",
];

export function BuildingStep({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const [percent, setPercent] = useState(0);
  const [completed, setCompleted] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const startedAt = Date.now();
    const duration = 3500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out for a more natural fill curve
      const eased = 1 - Math.pow(1 - progress, 2);
      const pct = Math.round(eased * 100);
      setPercent(pct);
      setCompleted(Math.min(BUILD_LINES.length, Math.floor(pct / 20)));
      if (progress >= 1 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(interval);
        setTimeout(onDone, 400);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <View style={buildStyles.wrap}>
      <ThemedText style={buildStyles.percent}>{percent}%</ThemedText>
      <ThemedText style={buildStyles.title}>{t("onb2.build.title")}</ThemedText>
      <View style={buildStyles.barTrack}>
        <LinearGradient
          colors={[Colors.primary, "#ff7eb6", Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buildStyles.barFill, { width: `${percent}%` }]}
        />
      </View>
      <ThemedText style={buildStyles.stage}>
        {percent < 30
          ? t("onb2.build.stage1")
          : percent < 70
          ? t("onb2.build.stage2")
          : t("onb2.build.stage3")}
      </ThemedText>

      <View style={buildStyles.list}>
        <ThemedText style={buildStyles.listLabel}>{t("onb2.build.daily")}</ThemedText>
        {BUILD_LINES.map((key, idx) => {
          const done = idx < completed;
          return (
            <View key={key} style={buildStyles.listRow}>
              <ThemedText style={buildStyles.listText}>· {t(key)}</ThemedText>
              <View
                style={[
                  buildStyles.checkBubble,
                  done && { backgroundColor: Colors.primary },
                ]}
              >
                {done ? (
                  <Feather name="check" size={12} color={Colors.white} />
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 15 — plan ready                                                */
/* ------------------------------------------------------------------ */

export function PlanReadyStep({
  weightKg,
  heightCm,
  age,
  daysPerWeek,
  direction,
  units,
}: {
  weightKg: number;
  heightCm: number;
  age: number;
  daysPerWeek: number;
  direction: WeightDirection;
  units: "Imperial" | "Metric";
}) {
  const { t } = useLanguage();
  const targets = useMemo(
    () => computeMacroTargets({ weightKg, heightCm, age, daysPerWeek, direction }),
    [weightKg, heightCm, age, daysPerWeek, direction],
  );

  const directionKey =
    direction === "lose"
      ? "onb2.plan.lose"
      : direction === "gain"
      ? "onb2.plan.gain"
      : "onb2.plan.maintain";
  const displayWeight =
    units === "Metric"
      ? `${Math.round(weightKg)} kg`
      : `${Math.round(weightKg / 0.45359237)} lb`;

  return (
    <>
      <View style={planStyles.tickWrap}>
        <View style={planStyles.tickCircle}>
          <Feather name="check" size={22} color={Colors.white} />
        </View>
        <ThemedText style={planStyles.title}>{t("onb2.plan.title")}</ThemedText>
        <ThemedText style={planStyles.directionLabel}>
          {t(directionKey)}
        </ThemedText>
        <View style={planStyles.weightPill}>
          <ThemedText style={planStyles.weightTxt}>{displayWeight}</ThemedText>
        </View>
      </View>

      <View style={planStyles.recCard}>
        <ThemedText style={planStyles.recTitle}>{t("onb2.plan.daily")}</ThemedText>
        <ThemedText style={planStyles.recSub}>{t("onb2.plan.editLater")}</ThemedText>

        <View style={planStyles.macroGrid}>
          <MacroTile
            label={t("onb2.plan.calories")}
            value={String(targets.calories)}
            color={Colors.primary}
            iconName="zap"
          />
          <MacroTile
            label={t("onb2.plan.carbs")}
            value={`${targets.carbs}g`}
            color="#ffa860"
            iconName="droplet"
          />
          <MacroTile
            label={t("onb2.plan.protein")}
            value={`${targets.protein}g`}
            color="#ff5b8a"
            iconName="award"
          />
          <MacroTile
            label={t("onb2.plan.fat")}
            value={`${targets.fat}g`}
            color="#7aa9ff"
            iconName="circle"
          />
        </View>
      </View>
    </>
  );
}

function MacroTile({
  label,
  value,
  color,
  iconName,
}: {
  label: string;
  value: string;
  color: string;
  iconName: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={planStyles.macroTile}>
      <View style={planStyles.macroHead}>
        <View
          style={[planStyles.macroDot, { backgroundColor: color + "30" }]}
        >
          <Feather name={iconName} size={14} color={color} />
        </View>
        <ThemedText style={planStyles.macroLabel}>{label}</ThemedText>
      </View>
      <ThemedText style={[planStyles.macroValue, { color }]}>{value}</ThemedText>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Step 16 — how to reach + sources                                    */
/* ------------------------------------------------------------------ */

const TIPS = [
  { icon: "heart" as const, color: "#ff5b8a", labelKey: "onb2.howto.tip1" },
  { icon: "camera" as const, color: "#7aa9ff", labelKey: "onb2.howto.tip2" },
  { icon: "zap" as const, color: Colors.primary, labelKey: "onb2.howto.tip3" },
  { icon: "pie-chart" as const, color: "#ffa860", labelKey: "onb2.howto.tip4" },
];

export function HowToReachStep() {
  const { t } = useLanguage();
  return (
    <>
      <View style={howStyles.card}>
        <ThemedText style={howStyles.cardTitle}>{t("onb2.howto.title")}</ThemedText>
        {TIPS.map((tip) => (
          <View key={tip.labelKey} style={howStyles.tipRow}>
            <View
              style={[
                howStyles.tipIcon,
                { backgroundColor: tip.color + "26" },
              ]}
            >
              <Feather name={tip.icon} size={18} color={tip.color} />
            </View>
            <ThemedText style={howStyles.tipText}>{t(tip.labelKey)}</ThemedText>
          </View>
        ))}
      </View>

      <ThemedText style={howStyles.sourcesIntro}>
        {t("onb2.howto.sourcesIntro")}
      </ThemedText>
      {[
        "onb2.howto.src1",
        "onb2.howto.src2",
        "onb2.howto.src3",
        "onb2.howto.src4",
      ].map((k) => (
        <ThemedText key={k} style={howStyles.sourceLine}>
          · {t(k)}
        </ThemedText>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const bodyStyles = StyleSheet.create({
  unitsRow: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: Colors.backgroundLight,
    padding: 4,
    borderRadius: 999,
    marginBottom: Spacing["3xl"],
  },
  unitsBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  unitsBtnActive: {
    backgroundColor: Colors.primary,
  },
  unitsLabel: {
    color: Colors.white60,
    fontWeight: "700",
    fontSize: 14,
  },
  wheelsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  heightImperial: {
    flexDirection: "row",
    gap: 4,
  },
});

const trustStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
    backgroundColor: "rgba(212,17,115,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,17,115,0.25)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 15,
    color: Colors.white60,
    textAlign: "center",
    lineHeight: 22,
  },
});

const reviewStyles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statBlock: { flex: 1, alignItems: "flex-start", paddingHorizontal: Spacing.sm },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statBig: { fontSize: 32, fontWeight: "800", color: Colors.white },
  statSub: { fontSize: 12, color: Colors.white60, marginTop: 2 },
  card: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(212,17,115,0.18)",
  },
  cardHead: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm, gap: Spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { fontSize: 22 },
  cardName: { fontSize: 15, fontWeight: "700", color: Colors.white },
  cardQuote: { fontSize: 15, color: Colors.white80, lineHeight: 22 },
});

const buildStyles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: Spacing["3xl"], alignItems: "center" },
  percent: { fontSize: 64, fontWeight: "800", color: Colors.white, letterSpacing: -2 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  barTrack: {
    width: "85%",
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white10,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  stage: { fontSize: 14, color: Colors.white60, marginTop: Spacing.md, marginBottom: Spacing["3xl"] },
  list: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: "100%",
  },
  listLabel: { fontSize: 14, fontWeight: "700", color: Colors.white, marginBottom: Spacing.md },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  listText: { flex: 1, fontSize: 14, color: Colors.white80 },
  checkBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
  },
});

const planStyles = StyleSheet.create({
  tickWrap: { alignItems: "center", marginBottom: Spacing["2xl"], marginTop: Spacing.md },
  tickCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.md,
    letterSpacing: -0.4,
  },
  directionLabel: { fontSize: 15, color: Colors.white80, marginBottom: Spacing.sm },
  weightPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.backgroundLight,
  },
  weightTxt: { fontSize: 16, fontWeight: "700", color: Colors.white },
  recCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  recTitle: { fontSize: 16, fontWeight: "700", color: Colors.white },
  recSub: { fontSize: 13, color: Colors.white60, marginTop: 2, marginBottom: Spacing.lg },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  macroTile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  macroHead: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.sm },
  macroDot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  macroLabel: { fontSize: 13, color: Colors.white80, fontWeight: "600" },
  macroValue: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
});

const howStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.white, marginBottom: Spacing.md },
  tipRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.sm },
  tipIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 14, color: Colors.white90, fontWeight: "500" },
  sourcesIntro: { fontSize: 14, color: Colors.white80, marginBottom: Spacing.sm, lineHeight: 20 },
  sourceLine: { fontSize: 13, color: Colors.white60, lineHeight: 22, paddingLeft: Spacing.sm },
});
