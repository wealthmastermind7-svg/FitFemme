import React from "react";
import { View, StyleSheet, ImageBackground, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Workout } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";

const WORKOUT_TITLE_KEYS: Record<string, string> = {
  "Full Body Burn": "workout.fullBodyBurn",
  "Glute Gains": "workout.gluteGains",
  "Core Crusher": "workout.coreCrusher",
  "Cardio Queen": "workout.cardioQueen",
  "Flexibility Flow": "workout.flexibilityFlow",
  "No-Equipment Abs": "workout.noEquipmentAbs",
};

const EQUIPMENT_KEYS: Record<string, string> = {
  "No Equipment": "workout.noEquipment",
  "Resistance Band": "workout.equipment.resistanceBand",
  "Mat": "workout.equipment.mat",
  "Dumbbells": "workout.equipment.dumbbells",
};

const INTENSITY_KEYS: Record<string, string> = {
  High: "workout.intensityHigh",
  Medium: "workout.intensityMedium",
  Low: "workout.intensityLow",
};

const workoutImages: { [key: number]: any } = {
  1: require("../../assets/images/workouts/workout1.png"),
  2: require("../../assets/images/workouts/workout2.png"),
  3: require("../../assets/images/workouts/workout3.png"),
  4: require("../../assets/images/workouts/workout4.png"),
};

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
  const { t } = useLanguage();
  const scale = useSharedValue(1);

  const titleKey = WORKOUT_TITLE_KEYS[workout.title];
  const titleText = titleKey ? t(titleKey) : workout.title;
  const intensityKey = INTENSITY_KEYS[workout.intensity];
  const intensityText = intensityKey ? t(intensityKey) : workout.intensity;
  const firstEquipment = workout.equipment[0];
  const equipmentKey = firstEquipment ? EQUIPMENT_KEYS[firstEquipment] : undefined;
  const equipmentText = equipmentKey ? t(equipmentKey) : firstEquipment;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const imageSource = workoutImages[workout.coverImage] || workoutImages[1];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        />
        <View style={styles.duration}>
          <ThemedText style={styles.durationText}>{workout.duration} min</ThemedText>
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {titleText}
          </ThemedText>
          <View style={styles.meta}>
            <ThemedText style={styles.metaText}>
              {intensityText} {t("workout.intensity")}
            </ThemedText>
            <ThemedText style={styles.metaDot}>  </ThemedText>
            <ThemedText style={styles.metaText}>
              {equipmentText}
            </ThemedText>
          </View>
          <Pressable style={styles.startButton}>
            <Feather name="eye" size={14} color={Colors.white} />
            <ThemedText style={styles.startText}>{t("workouts.preview")}</ThemedText>
          </Pressable>
        </View>
      </ImageBackground>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 200,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginRight: Spacing.lg,
    ...Shadows.medium,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  image: {
    borderRadius: BorderRadius.md,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.md,
  },
  duration: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  metaText: {
    fontSize: 12,
    color: Colors.white60,
  },
  metaDot: {
    fontSize: 12,
    color: Colors.white40,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
    gap: Spacing.sm,
  },
  startText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
});
