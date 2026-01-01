import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { sampleWorkouts } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const workoutImages: { [key: number]: any } = {
  1: require("../../assets/images/workouts/workout1.png"),
  2: require("../../assets/images/workouts/workout2.png"),
  3: require("../../assets/images/workouts/workout3.png"),
  4: require("../../assets/images/workouts/workout4.png"),
};

type WorkoutPreviewRouteProp = RouteProp<RootStackParamList, "WorkoutPreview">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WorkoutPreviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<WorkoutPreviewRouteProp>();
  const insets = useSafeAreaInsets();

  const workoutId = route.params?.workoutId || "1";
  const workout = sampleWorkouts.find((w) => w.id === workoutId) || sampleWorkouts[0];

  const buttonScale = useSharedValue(1);

  const handleStartWorkout = () => {
    navigation.replace("WorkoutPlayer", { workoutId });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const imageSource = workoutImages[workout.coverImage] || workoutImages[1];

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const totalExercises = workout.exercises.length;

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "High":
        return Colors.primary;
      case "Medium":
        return Colors.yellow;
      case "Low":
        return Colors.success;
      default:
        return Colors.white40;
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={imageSource}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(34,16,25,0.4)",
            "rgba(34,16,25,0.7)",
            Colors.backgroundDark,
          ]}
          locations={[0, 0.4, 0.7]}
          style={styles.gradient}
        />
      </ImageBackground>

      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color={Colors.white} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Workout Preview</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.workoutHeader}>
          <ThemedText style={styles.workoutTitle}>{workout.title}</ThemedText>
          <ThemedText style={styles.workoutCategory}>{workout.category}</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="clock" size={18} color={Colors.primary} />
            <ThemedText style={styles.statValue}>{workout.duration}</ThemedText>
            <ThemedText style={styles.statLabel}>min</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Feather name="activity" size={18} color={Colors.primary} />
            <ThemedText style={styles.statValue}>{totalExercises}</ThemedText>
            <ThemedText style={styles.statLabel}>exercises</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Feather name="repeat" size={18} color={Colors.primary} />
            <ThemedText style={styles.statValue}>{totalSets}</ThemedText>
            <ThemedText style={styles.statLabel}>sets</ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Intensity</ThemedText>
            <View style={styles.intensityBadge}>
              <View
                style={[
                  styles.intensityDot,
                  { backgroundColor: getIntensityColor(workout.intensity) },
                ]}
              />
              <ThemedText style={styles.infoValue}>{workout.intensity}</ThemedText>
            </View>
          </View>
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Equipment</ThemedText>
            <ThemedText style={styles.infoValue}>
              {workout.equipment.join(", ")}
            </ThemedText>
          </View>
        </View>

        <View style={styles.exercisesSection}>
          <ThemedText style={styles.sectionTitle}>Exercises</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Here is what you will be doing
          </ThemedText>

          {workout.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseNumber}>
                <ThemedText style={styles.exerciseNumberText}>
                  {index + 1}
                </ThemedText>
              </View>
              <View style={styles.exerciseInfo}>
                <ThemedText style={styles.exerciseName}>
                  {exercise.name}
                </ThemedText>
                <ThemedText style={styles.exerciseMeta}>
                  {exercise.sets} sets  {exercise.duration}s each
                </ThemedText>
              </View>
              <Feather name="check-circle" size={20} color={Colors.white20} />
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Feather name="info" size={20} color={Colors.primary} />
          <View style={styles.tipContent}>
            <ThemedText style={styles.tipTitle}>How it works</ThemedText>
            <ThemedText style={styles.tipText}>
              The guided timer will count down each exercise. Focus on your form
              while we track the time. Rest periods are built in between sets.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <AnimatedPressable
          onPress={handleStartWorkout}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.startButton, animatedButtonStyle]}
        >
          <View style={styles.buttonContent}>
            <ThemedText style={styles.buttonText}>Start Workout</ThemedText>
          </View>
          <View style={styles.buttonIcon}>
            <Feather name="play" size={24} color={Colors.white} />
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["2xl"],
  },
  workoutHeader: {
    marginBottom: Spacing["2xl"],
  },
  workoutTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  workoutCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white40,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.white10,
  },
  infoRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  infoItem: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.white40,
    marginBottom: Spacing.sm,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  intensityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exercisesSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.white40,
    marginBottom: Spacing.xl,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  exerciseMeta: {
    fontSize: 12,
    color: Colors.white40,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: Colors.primary + "15",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  tipContent: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: 13,
    color: Colors.white60,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
    backgroundColor: Colors.backgroundDark,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 64,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    ...Shadows.primaryGlow,
  },
  buttonContent: {
    flex: 1,
    alignItems: "center",
    paddingLeft: 56,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  buttonIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
