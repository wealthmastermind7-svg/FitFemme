import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import GoalPicker from "@/components/GoalPicker";
import { storage, BodyGoal, sampleUserProfile, GOAL_CONFIG } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width, height } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Step =
  | "welcome"
  | "goal"
  | "name"
  | "age"
  | "weight"
  | "commitment"
  | "building";

const FORM_STEPS: Step[] = ["goal", "name", "age", "weight", "commitment"];

const COMMITMENTS: { id: number; titleKey: string; descKey: string }[] = [
  { id: 2, titleKey: "onb.commit.casual", descKey: "onb.commit.casualDesc" },
  { id: 3, titleKey: "onb.commit.consistent", descKey: "onb.commit.consistentDesc" },
  { id: 5, titleKey: "onb.commit.dedicated", descKey: "onb.commit.dedicatedDesc" },
  { id: 6, titleKey: "onb.commit.athlete", descKey: "onb.commit.athleteDesc" },
];

export default function OnboardingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("welcome");
  const [goal, setGoal] = useState<BodyGoal | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState(28);
  const [units, setUnits] = useState<"Metric" | "Imperial">("Imperial");
  const [weight, setWeight] = useState("140");
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);

  const tap = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const goNext = () => {
    tap();
    if (step === "welcome") return setStep("goal");
    if (step === "goal") return setStep("name");
    if (step === "name") return setStep("age");
    if (step === "age") return setStep("weight");
    if (step === "weight") return setStep("commitment");
    if (step === "commitment") return setStep("building");
  };

  const goBack = () => {
    tap();
    if (step === "goal") return setStep("welcome");
    if (step === "name") return setStep("goal");
    if (step === "age") return setStep("name");
    if (step === "weight") return setStep("age");
    if (step === "commitment") return setStep("weight");
  };

  const finish = async () => {
    try {
      const weightNum = Math.max(parseFloat(weight) || sampleUserProfile.weight, 1);
      const finalGoal = goal ?? "lean_toned";
      const calories = GOAL_CONFIG[finalGoal].caloriesTarget;
      await storage.saveUserProfile({
        ...sampleUserProfile,
        name: name.trim() || sampleUserProfile.name,
        age,
        weight: weightNum,
        units,
        bodyGoal: finalGoal,
        caloriesGoal: calories,
        daysPerWeek: daysPerWeek ?? 3,
        durationGoal: sampleUserProfile.durationGoal,
        stepsGoal: sampleUserProfile.stepsGoal,
      });
      await AsyncStorage.setItem("@hasOnboarded", "true");
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (e) {
      console.log("Onboarding finish error", e);
    }
  };

  // Welcome step uses full-bleed cinematic poster
  if (step === "welcome") {
    return (
      <WelcomeStep onStart={goNext} insetsTop={insets.top} insetsBottom={insets.bottom} />
    );
  }

  // Building step is a loading screen
  if (step === "building") {
    return (
      <BuildingStep
        goalLabel={goal ? t(GOAL_CONFIG[goal].titleKey) : ""}
        onDone={finish}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
      />
    );
  }

  const stepIndex = FORM_STEPS.indexOf(step);
  const totalSteps = FORM_STEPS.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const canContinue =
    (step === "goal" && goal !== null) ||
    (step === "name" && name.trim().length > 0) ||
    (step === "age" && age > 10 && age < 100) ||
    (step === "weight" && parseFloat(weight) > 0) ||
    (step === "commitment" && daysPerWeek !== null);

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      {/* Header: back + progress */}
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <ThemedText style={styles.stepCount}>
          {stepIndex + 1}/{totalSteps}
        </ThemedText>
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bottomOffset={180}
      >
        <Animated.View
          key={step}
          entering={FadeInDown.duration(280).springify()}
          exiting={FadeOut.duration(120)}
          style={styles.stepContent}
        >
          {step === "goal" && (
            <>
              <StepHeading title={t("onb.goal.title")} subtitle={t("onb.goal.subtitle")} />
              <View style={{ marginTop: Spacing["2xl"] }}>
                <GoalPicker
                  selectedGoal={goal}
                  onSelect={(g) => {
                    setGoal(g);
                    tap(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                />
              </View>
            </>
          )}

          {step === "name" && (
            <>
              <StepHeading title={t("onb.name.title")} subtitle={t("onb.name.subtitle")} />
              <View style={styles.inputBlock}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t("onb.name.placeholder")}
                  placeholderTextColor={Colors.white40}
                  style={styles.textInput}
                  autoFocus
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={() => canContinue && goNext()}
                  maxLength={24}
                />
              </View>
            </>
          )}

          {step === "age" && (
            <>
              <StepHeading title={t("onb.age.title")} subtitle={t("onb.age.subtitle")} />
              <NumberStepper
                value={age}
                onChange={setAge}
                min={13}
                max={90}
                suffix={t("onb.age.suffix")}
              />
            </>
          )}

          {step === "weight" && (
            <>
              <StepHeading title={t("onb.weight.title")} subtitle={t("onb.weight.subtitle")} />
              <View style={styles.unitsToggle}>
                {(["Imperial", "Metric"] as const).map((u) => {
                  const active = units === u;
                  return (
                    <Pressable
                      key={u}
                      onPress={() => {
                        if (units === u) return;
                        tap();
                        // Convert the displayed weight when switching units
                        const n = parseFloat(weight);
                        if (Number.isFinite(n) && n > 0) {
                          const converted =
                            u === "Metric" ? n * 0.45359237 : n / 0.45359237;
                          setWeight(Math.round(converted).toString());
                        }
                        setUnits(u);
                      }}
                      style={[styles.unitsBtn, active && styles.unitsBtnActive]}
                    >
                      <ThemedText
                        style={[styles.unitsLabel, active && styles.unitsLabelActive]}
                      >
                        {u === "Metric" ? t("onb.weight.metric") : t("onb.weight.imperial")}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.weightRow}>
                <TextInput
                  value={weight}
                  onChangeText={(v) => {
                    // Allow only digits and a single decimal separator
                    let cleaned = v.replace(/[^0-9.]/g, "");
                    const firstDot = cleaned.indexOf(".");
                    if (firstDot !== -1) {
                      cleaned =
                        cleaned.slice(0, firstDot + 1) +
                        cleaned.slice(firstDot + 1).replace(/\./g, "");
                    }
                    setWeight(cleaned.slice(0, 5));
                  }}
                  keyboardType="decimal-pad"
                  style={styles.weightInput}
                  placeholderTextColor={Colors.white40}
                  maxLength={5}
                />
                <ThemedText style={styles.weightUnit}>
                  {units === "Metric" ? t("onb.weight.metric") : t("onb.weight.imperial")}
                </ThemedText>
              </View>
            </>
          )}

          {step === "commitment" && (
            <>
              <StepHeading
                title={t("onb.commit.title")}
                subtitle={t("onb.commit.subtitle")}
              />
              <View style={styles.commitList}>
                {COMMITMENTS.map((c) => {
                  const active = daysPerWeek === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        tap(Haptics.ImpactFeedbackStyle.Medium);
                        setDaysPerWeek(c.id);
                      }}
                      style={[styles.commitCard, active && styles.commitCardActive]}
                    >
                      <View style={styles.commitText}>
                        <ThemedText
                          style={[styles.commitTitle, active && { color: Colors.white }]}
                        >
                          {t(c.titleKey)}
                        </ThemedText>
                        <ThemedText style={styles.commitDesc}>{t(c.descKey)}</ThemedText>
                      </View>
                      <View
                        style={[
                          styles.radio,
                          active && {
                            borderColor: Colors.primary,
                            backgroundColor: Colors.primary,
                          },
                        ]}
                      >
                        {active ? (
                          <Feather name="check" size={14} color={Colors.white} />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      {/* Sticky CTA */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            marginBottom: Platform.OS === "ios" ? 0 : 120,
          },
        ]}
      >
        <Pressable
          disabled={!canContinue}
          onPress={goNext}
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
        >
          <ThemedText style={styles.continueText}>{t("onb.continue")}</ThemedText>
          <Feather
            name="arrow-right"
            size={20}
            color={canContinue ? Colors.white : Colors.white40}
          />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- helpers ---------- */

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <ThemedText style={styles.stepTitle}>{title}</ThemedText>
      <ThemedText style={styles.stepSubtitle}>{subtitle}</ThemedText>
    </View>
  );
}

function NumberStepper({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  const tap = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };
  return (
    <View style={styles.stepperRow}>
      <Pressable
        onPress={() => {
          if (value > min) {
            tap();
            onChange(value - 1);
          }
        }}
        style={styles.stepperBtn}
      >
        <Feather name="minus" size={22} color={Colors.white} />
      </Pressable>
      <View style={styles.stepperValueWrap}>
        <ThemedText style={styles.stepperValue}>{value}</ThemedText>
        <ThemedText style={styles.stepperSuffix}>{suffix}</ThemedText>
      </View>
      <Pressable
        onPress={() => {
          if (value < max) {
            tap();
            onChange(value + 1);
          }
        }}
        style={styles.stepperBtn}
      >
        <Feather name="plus" size={22} color={Colors.white} />
      </Pressable>
    </View>
  );
}

/* ---------- Welcome ---------- */

function WelcomeStep({
  onStart,
  insetsTop,
  insetsBottom,
}: {
  onStart: () => void;
  insetsTop: number;
  insetsBottom: number;
}) {
  const { t } = useLanguage();
  const isPt = t("onboarding.title") === "Bem-vinda ao Fit Femme";
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  return (
    <View style={styles.container}>
      <ImageBackground
        source={
          isPt
            ? require("@assets/IMG_4868_1776573583845.png")
            : require("../../assets/images/onboarding/slide3.png")
        }
        style={styles.welcomeBg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.35)",
            "rgba(34,16,25,0.2)",
            "rgba(34,16,25,0.85)",
            Colors.backgroundDark,
          ]}
          locations={[0, 0.35, 0.75, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          style={[
            styles.welcomeContent,
            { paddingTop: insetsTop + Spacing["2xl"], paddingBottom: insetsBottom + 180 },
          ]}
        >
          <Animated.View entering={FadeIn.duration(500)}>
            <ThemedText style={styles.welcomeEyebrow}>{t("onb.welcome.eyebrow")}</ThemedText>
          </Animated.View>
          <View style={{ flex: 1 }} />
          <Animated.View entering={FadeInDown.duration(600).delay(120)}>
            <ThemedText style={styles.welcomeTitle}>{t("onb.welcome.title1")}</ThemedText>
            <ThemedText style={styles.welcomeTitle}>{t("onb.welcome.title2")}</ThemedText>
            <ThemedText style={[styles.welcomeTitle, { color: Colors.primary }]}>
              {t("onb.welcome.title3")}
            </ThemedText>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(600).delay(240)}
            style={styles.welcomeSubRow}
          >
            <View style={styles.welcomeAccent} />
            <ThemedText style={styles.welcomeSubtitle}>
              {t("onb.welcome.subtitle")}
            </ThemedText>
          </Animated.View>
        </View>
      </ImageBackground>

      <LinearGradient
        colors={["transparent", Colors.backgroundDark, Colors.backgroundDark]}
        locations={[0, 0.4, 1]}
        style={[
          styles.welcomeBottom,
          { paddingBottom: insetsBottom + Spacing.lg },
        ]}
      >
        <AnimatedPressable
          onPressIn={() => {
            buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          }}
          onPress={onStart}
          style={[styles.welcomeBtn, animatedButtonStyle]}
        >
          <View style={styles.welcomeBtnTextWrap}>
            <ThemedText style={styles.welcomeBtnText}>
              {t("onb.welcome.cta")}
            </ThemedText>
          </View>
          <View style={styles.welcomeBtnIcon}>
            <Feather name="arrow-right" size={24} color={Colors.white} />
          </View>
        </AnimatedPressable>
      </LinearGradient>
    </View>
  );
}

/* ---------- Building ---------- */

function BuildingStep({
  goalLabel,
  onDone,
  insetsTop,
  insetsBottom,
}: {
  goalLabel: string;
  onDone: () => void;
  insetsTop: number;
  insetsBottom: number;
}) {
  const { t } = useLanguage();
  const [completed, setCompleted] = useState<number>(0);
  const [ready, setReady] = useState(false);
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1,
      false,
    );
    const t1 = setTimeout(() => setCompleted(1), 700);
    const t2 = setTimeout(() => setCompleted(2), 1500);
    const t3 = setTimeout(() => setCompleted(3), 2300);
    const tReady = setTimeout(() => setReady(true), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tReady);
    };
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const lines = [
    `${t("onb.building.line1")}${goalLabel ? ` · ${goalLabel}` : ""}`,
    t("onb.building.line2"),
    t("onb.building.line3"),
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insetsTop + Spacing["3xl"],
          paddingBottom: insetsBottom + Spacing.lg,
          paddingHorizontal: Spacing["2xl"],
        },
      ]}
    >
      <View style={styles.buildHeroWrap}>
        <Animated.View style={[styles.buildSpinnerOuter, spinStyle]}>
          <LinearGradient
            colors={[Colors.primary, "rgba(212,17,115,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
        <View style={styles.buildSpinnerInner}>
          <Feather
            name={ready ? "check" : "activity"}
            size={36}
            color={Colors.white}
          />
        </View>
      </View>

      <ThemedText style={styles.buildTitle}>{t("onb.building.title")}</ThemedText>

      <View style={styles.buildLines}>
        {lines.map((line, i) => {
          const done = i < completed;
          return (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(300).delay(i * 120)}
              style={styles.buildLine}
            >
              <View
                style={[
                  styles.buildBullet,
                  done && { backgroundColor: Colors.success },
                ]}
              >
                {done ? (
                  <Feather name="check" size={12} color={Colors.white} />
                ) : (
                  <View style={styles.buildBulletDot} />
                )}
              </View>
              <ThemedText
                style={[
                  styles.buildLineText,
                  done && { color: Colors.white },
                ]}
              >
                {line}
              </ThemedText>
            </Animated.View>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      {ready ? (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Pressable onPress={onDone} style={[styles.continueBtn, { marginHorizontal: 0 }]}>
            <ThemedText style={styles.continueText}>{t("onb.building.cta")}</ThemedText>
            <Feather name="arrow-right" size={20} color={Colors.white} />
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  stepCount: {
    fontSize: 12,
    color: Colors.white60,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "right",
  },
  scroll: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: 160,
  },
  stepContent: {
    paddingTop: Spacing.lg,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    lineHeight: 34,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.white60,
    lineHeight: 22,
  },
  inputBlock: {
    marginTop: Spacing["3xl"],
  },
  textInput: {
    backgroundColor: Colors.backgroundLight,
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  stepperRow: {
    marginTop: Spacing["3xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  stepperValueWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  stepperValue: {
    fontSize: 56,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -1,
  },
  stepperSuffix: {
    fontSize: 16,
    color: Colors.white60,
    fontWeight: "500",
  },
  unitsToggle: {
    marginTop: Spacing["2xl"],
    flexDirection: "row",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.full,
    padding: 4,
    alignSelf: "flex-start",
  },
  unitsBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  unitsBtnActive: {
    backgroundColor: Colors.primary,
  },
  unitsLabel: {
    fontSize: 13,
    color: Colors.white60,
    fontWeight: "600",
  },
  unitsLabelActive: {
    color: Colors.white,
  },
  weightRow: {
    marginTop: Spacing.xl,
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white10,
    gap: Spacing.md,
  },
  weightInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: -1,
    padding: 0,
  },
  weightUnit: {
    fontSize: 18,
    color: Colors.white60,
    fontWeight: "600",
  },
  commitList: {
    marginTop: Spacing["2xl"],
    gap: Spacing.md,
  },
  commitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.white10,
    gap: Spacing.md,
  },
  commitCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(212,17,115,0.10)",
  },
  commitText: {
    flex: 1,
  },
  commitTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 2,
  },
  commitDesc: {
    fontSize: 13,
    color: Colors.white60,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.white40,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    backgroundColor: Colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: Colors.white10,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: BorderRadius.full,
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

  /* Welcome */
  welcomeBg: {
    width,
    height,
  },
  welcomeContent: {
    flex: 1,
    paddingHorizontal: Spacing["3xl"],
  },
  welcomeEyebrow: {
    color: Colors.white,
    letterSpacing: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  welcomeTitle: {
    fontSize: 52,
    fontWeight: "900",
    color: Colors.white,
    lineHeight: 56,
    letterSpacing: -2,
  },
  welcomeSubRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.lg,
  },
  welcomeAccent: {
    width: 2,
    height: 48,
    backgroundColor: Colors.primary,
    marginRight: Spacing.lg,
  },
  welcomeSubtitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "300",
    color: Colors.white80,
    lineHeight: 25,
  },
  welcomeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["4xl"],
  },
  welcomeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 64,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    ...Shadows.primaryGlow,
  },
  welcomeBtnTextWrap: {
    flex: 1,
    alignItems: "center",
    paddingLeft: 56,
  },
  welcomeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  welcomeBtnIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Building */
  buildHeroWrap: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: Spacing["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  buildSpinnerOuter: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
  },
  buildSpinnerInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  buildTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  buildLines: {
    gap: Spacing.md,
  },
  buildLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.backgroundLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  buildBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
  },
  buildBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white40,
  },
  buildLineText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white60,
    fontWeight: "500",
  },
});
