/**
 * Cal AI–style onboarding flow controller.
 * Owns the step state machine, all collected answers, persistence to the
 * UserProfile, and translates between presentation steps and final values.
 *
 * Welcome (cinematic poster) is the first screen and re-uses the existing
 * `WelcomeStep` from the original OnboardingScreen for visual continuity.
 * After the welcome CTA we drop into the multi-step shell.
 */
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";
import { useLanguage } from "@/lib/i18n";
import {
  BodyGoal,
  DietType,
  WeightDirection,
  computeMacroTargets,
  sampleUserProfile,
  storage,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

import { StepShell, tap } from "./shared";
import {
  AccomplishStep,
  BirthDateStep,
  BlockersStep,
  BodyGoalStep,
  BuildingStep,
  CoachStep,
  DietStep,
  DirectionStep,
  HeightWeightStep,
  HowToReachStep,
  PlanReadyStep,
  ReviewsStep,
  SourceStep,
  TriedOthersStep,
  TrustStep,
  WorkoutsStep,
} from "./steps";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Ordered list of step IDs (post-welcome). */
const STEPS = [
  "workouts",
  "source",
  "tried",
  "body",
  "birth",
  "coach",
  "direction",
  "goal",
  "blockers",
  "diet",
  "accomplish",
  "trust",
  "reviews",
  "building",
  "plan",
  "howto",
] as const;
type StepId = (typeof STEPS)[number] | "welcome";

export default function OnboardingFlow() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [step, setStep] = useState<StepId>("welcome");

  // Collected answers
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [triedOthers, setTriedOthers] = useState<boolean | null>(null);
  const [units, setUnits] = useState<"Imperial" | "Metric">("Imperial");
  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(64);
  const today = new Date();
  const [birthYear, setBirthYear] = useState<number>(today.getFullYear() - 28);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  const [hasCoach, setHasCoach] = useState<boolean | null>(null);
  const [direction, setDirection] = useState<WeightDirection | null>(null);
  const [bodyGoal, setBodyGoal] = useState<BodyGoal | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [diet, setDiet] = useState<DietType | null>(null);
  const [accomplishments, setAccomplishments] = useState<string[]>([]);

  const stepIndex = step === "welcome" ? -1 : STEPS.indexOf(step as any);
  const totalForm = STEPS.length;

  const advance = () => {
    tap();
    if (step === "welcome") return setStep(STEPS[0]);
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    tap();
    if (stepIndex <= 0) {
      setStep("welcome");
      return;
    }
    setStep(STEPS[stepIndex - 1]);
  };

  const toggle = (
    list: string[],
    setter: (l: string[]) => void,
    id: string,
  ) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const computeAge = () => {
    const birth = new Date(birthYear, birthMonth - 1, birthDay);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
    return Math.max(13, Math.min(90, age));
  };

  const finish = async () => {
    try {
      const age = computeAge();
      const dir: WeightDirection = direction ?? "maintain";
      const targets = computeMacroTargets({
        weightKg,
        heightCm,
        age,
        daysPerWeek: daysPerWeek ?? 3,
        direction: dir,
      });
      // Honor the legacy contract: `profile.weight` is stored in the unit
      // declared by `profile.units`. Downstream helpers (e.g. WorkoutPlayer)
      // call `toKilograms(profile.weight, profile.units)` and would
      // double-convert if we always stored kg under an Imperial label.
      const weightForProfile =
        units === "Imperial"
          ? Math.round(weightKg / 0.45359237)
          : Math.round(weightKg);
      await storage.saveUserProfile({
        ...sampleUserProfile,
        name: sampleUserProfile.name,
        age,
        weight: weightForProfile,
        units,
        bodyGoal: bodyGoal ?? "lean_toned",
        caloriesGoal: targets.calories,
        proteinGoal: targets.protein,
        carbsGoal: targets.carbs,
        fatGoal: targets.fat,
        healthScore: targets.healthScore,
        daysPerWeek: daysPerWeek ?? 3,
        durationGoal: sampleUserProfile.durationGoal,
        stepsGoal: sampleUserProfile.stepsGoal,
        heightCm,
        birthYear,
        birthMonth,
        birthDay,
        dietType: diet ?? "classic",
        weightDirection: dir,
        source: source ?? undefined,
        triedOthers: triedOthers ?? undefined,
        hasCoach: hasCoach ?? undefined,
        blockers,
        accomplishments,
      });
      await AsyncStorage.setItem("@hasOnboarded", "true");
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (e) {
      console.log("Onboarding finish error", e);
    }
  };

  /* ---------- Welcome poster ---------- */
  if (step === "welcome") {
    return (
      <WelcomeStep
        onStart={advance}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
      />
    );
  }

  /* ---------- Animated building screen drives its own progression ---------- */
  if (step === "building") {
    return (
      <View
        style={[
          styles.buildContainer,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing.lg,
            paddingHorizontal: Spacing["2xl"],
          },
        ]}
      >
        <BuildingStep onDone={advance} />
      </View>
    );
  }

  const progress = (stepIndex + 1) / totalForm;

  // Per-step validation + body
  let body: React.ReactNode = null;
  let canContinue = true;
  let continueLabel = t("onb.continue");
  let scrollable = true;

  switch (step) {
    case "workouts":
      body = <WorkoutsStep value={daysPerWeek} onChange={setDaysPerWeek} />;
      canContinue = daysPerWeek !== null;
      break;
    case "source":
      body = <SourceStep value={source} onChange={setSource} />;
      canContinue = source !== null;
      break;
    case "tried":
      body = <TriedOthersStep value={triedOthers} onChange={setTriedOthers} />;
      canContinue = triedOthers !== null;
      break;
    case "body":
      body = (
        <HeightWeightStep
          units={units}
          setUnits={setUnits}
          heightCm={heightCm}
          setHeightCm={setHeightCm}
          weightKg={weightKg}
          setWeightKg={setWeightKg}
        />
      );
      break;
    case "birth":
      body = (
        <BirthDateStep
          year={birthYear}
          month={birthMonth}
          day={birthDay}
          onChange={(y, m, d) => {
            setBirthYear(y);
            setBirthMonth(m);
            setBirthDay(d);
          }}
        />
      );
      break;
    case "coach":
      body = <CoachStep value={hasCoach} onChange={setHasCoach} />;
      canContinue = hasCoach !== null;
      break;
    case "direction":
      body = <DirectionStep value={direction} onChange={setDirection} />;
      canContinue = direction !== null;
      break;
    case "goal":
      body = <BodyGoalStep value={bodyGoal} onChange={setBodyGoal} />;
      canContinue = bodyGoal !== null;
      break;
    case "blockers":
      body = (
        <BlockersStep
          values={blockers}
          onToggle={(id) => toggle(blockers, setBlockers, id)}
        />
      );
      canContinue = blockers.length > 0;
      break;
    case "diet":
      body = <DietStep value={diet} onChange={setDiet} />;
      canContinue = diet !== null;
      break;
    case "accomplish":
      body = (
        <AccomplishStep
          values={accomplishments}
          onToggle={(id) => toggle(accomplishments, setAccomplishments, id)}
        />
      );
      canContinue = accomplishments.length > 0;
      break;
    case "trust":
      body = <TrustStep />;
      continueLabel = t("onb2.trust.cta");
      scrollable = false;
      break;
    case "reviews":
      body = <ReviewsStep />;
      continueLabel = t("onb2.reviews.cta");
      break;
    case "plan":
      body = (
        <PlanReadyStep
          weightKg={weightKg}
          heightCm={heightCm}
          age={computeAge()}
          daysPerWeek={daysPerWeek ?? 3}
          direction={direction ?? "maintain"}
          units={units}
        />
      );
      continueLabel = t("onb2.plan.cta");
      break;
    case "howto":
      body = <HowToReachStep />;
      continueLabel = t("onb2.howto.cta");
      break;
  }

  const isFinalStep = step === "howto";

  return (
    <StepShell
      progress={progress}
      onBack={goBack}
      onContinue={isFinalStep ? finish : advance}
      canContinue={canContinue}
      continueLabel={continueLabel}
      scrollable={scrollable}
    >
      {body}
    </StepShell>
  );
}

/* ----------------------------------------------------------------- */
/* Welcome step (cinematic poster)                                    */
/* ----------------------------------------------------------------- */

function WelcomeStep({
  onStart,
  insetsTop,
  insetsBottom,
}: {
  onStart: () => void;
  insetsTop: number;
  insetsBottom: number;
}) {
  const { t, language } = useLanguage();
  const welcomeBgSource =
    language === "pt"
      ? require("../../../assets/images/onboarding/welcome-pt.png")
      : language === "es"
      ? require("../../../assets/images/onboarding/welcome-es.png")
      : require("../../../assets/images/onboarding/slide3.png");
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  return (
    <View style={styles.container}>
      <ImageBackground
        source={welcomeBgSource}
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
            {
              paddingTop: insetsTop + Spacing["2xl"],
              paddingBottom: insetsBottom + 180,
            },
          ]}
        >
          <Animated.View entering={FadeIn.duration(500)}>
            <ThemedText style={styles.welcomeEyebrow}>
              {t("onb.welcome.eyebrow")}
            </ThemedText>
          </Animated.View>
          <View style={{ flex: 1 }} />
          <Animated.View entering={FadeInDown.duration(600).delay(120)}>
            <ThemedText style={styles.welcomeTitle}>
              {t("onb.welcome.title1")}
            </ThemedText>
            <ThemedText style={styles.welcomeTitle}>
              {t("onb.welcome.title2")}
            </ThemedText>
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

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  buildContainer: { flex: 1, backgroundColor: Colors.backgroundDark },
  welcomeBg: { flex: 1, width: "100%", height: "100%", justifyContent: "flex-start" },
  welcomeContent: {
    flex: 1,
    paddingHorizontal: Spacing["3xl"],
    justifyContent: "flex-end",
    minHeight: height * 0.7,
  },
  welcomeEyebrow: {
    fontSize: 12,
    color: Colors.white80,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  welcomeTitle: {
    fontSize: 60,
    fontWeight: "800",
    color: Colors.white,
    lineHeight: 64,
    letterSpacing: -2,
  },
  welcomeSubRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  welcomeAccent: {
    width: 3,
    height: 36,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  welcomeSubtitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.white80,
  },
  welcomeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing["3xl"],
    paddingTop: Spacing["3xl"],
  },
  welcomeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingLeft: Spacing["2xl"],
    paddingRight: 6,
    paddingVertical: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === "ios" ? 0.4 : 0,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeBtnTextWrap: { flex: 1 },
  welcomeBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.white,
  },
  welcomeBtnIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
