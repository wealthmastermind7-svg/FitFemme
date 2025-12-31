import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Pressable,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { CircularProgress } from "@/components/CircularProgress";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { sampleWorkouts, Exercise } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

const workoutImages: { [key: number]: any } = {
  1: require("../../assets/images/workouts/workout1.jpg"),
  2: require("../../assets/images/workouts/workout2.jpg"),
  3: require("../../assets/images/workouts/workout3.jpg"),
};

type WorkoutPlayerRouteProp = RouteProp<RootStackParamList, "WorkoutPlayer">;

export default function WorkoutPlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute<WorkoutPlayerRouteProp>();
  const insets = useSafeAreaInsets();

  const workoutId = route.params?.workoutId || "1";
  const workout = sampleWorkouts.find((w) => w.id === workoutId) || sampleWorkouts[0];
  const exercises = workout.exercises;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(exercises[0]?.duration || 45);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const buttonScale = useSharedValue(1);

  const currentExercise = exercises[currentExerciseIndex];
  const totalDuration = workout.duration * 60;
  const overallProgress = Math.min((totalElapsed / totalDuration) * 100, 100);
  const exerciseProgress = currentExercise
    ? isResting 
      ? ((15 - timeRemaining) / 15) * 100
      : ((currentExercise.duration - timeRemaining) / currentExercise.duration) * 100
    : 0;

  useEffect(() => {
    if (isPlaying && !workoutComplete) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, workoutComplete]);

  useEffect(() => {
    if (timeRemaining === 0 && isPlaying && !workoutComplete) {
      handleExerciseComplete();
    }
  }, [timeRemaining, isPlaying, workoutComplete]);

  const handleExerciseComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (isResting) {
      setIsResting(false);
      setTimeRemaining(currentExercise.duration);
      return;
    }

    if (currentSet < currentExercise.sets) {
      setIsResting(true);
      setTimeRemaining(15);
      setCurrentSet((prev) => prev + 1);
    } else if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentSet(1);
      setTimeRemaining(exercises[nextIndex].duration);
      setIsResting(false);
    } else {
      setIsPlaying(false);
      setWorkoutComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const togglePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentSet(1);
      setTimeRemaining(exercises[nextIndex].duration);
      setIsResting(false);
    }
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentExerciseIndex > 0) {
      const prevIndex = currentExerciseIndex - 1;
      setCurrentExerciseIndex(prevIndex);
      setCurrentSet(1);
      setTimeRemaining(exercises[prevIndex].duration);
      setIsResting(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const imageSource = workoutImages[workout.coverImage] || workoutImages[1];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={imageSource}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(34,16,25,0.6)",
            "rgba(34,16,25,0.85)",
            Colors.backgroundDark,
          ]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />
      </ImageBackground>

      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color={Colors.white} />
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.workoutTitle}>{workout.title}</ThemedText>
          <ThemedText style={styles.workoutMeta}>
            {currentExerciseIndex + 1} / {exercises.length} exercises
          </ThemedText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.exerciseInfo}>
          {isResting ? (
            <View style={styles.restBadge}>
              <ThemedText style={styles.restText}>REST</ThemedText>
            </View>
          ) : null}
          <ThemedText style={styles.exerciseName}>
            {isResting ? "Get Ready" : currentExercise?.name}
          </ThemedText>
          <ThemedText style={styles.setInfo}>
            Set {currentSet} of {currentExercise?.sets}
          </ThemedText>
        </View>

        <View style={styles.timerContainer}>
          <CircularProgress
            size={240}
            strokeWidth={10}
            progress={exerciseProgress}
            color={isResting ? Colors.success : Colors.primary}
          >
            <ThemedText style={styles.timerText}>
              {formatTime(timeRemaining)}
            </ThemedText>
            <ThemedText style={styles.timerLabel}>
              {isResting ? "REST" : "REMAINING"}
            </ThemedText>
          </CircularProgress>
        </View>

        <View style={styles.controls}>
          <Pressable
            style={styles.controlButton}
            onPress={handlePrevious}
            disabled={currentExerciseIndex === 0}
          >
            <Feather
              name="skip-back"
              size={28}
              color={currentExerciseIndex === 0 ? Colors.white20 : Colors.white}
            />
          </Pressable>

          <Animated.View style={animatedButtonStyle}>
            <Pressable
              style={styles.playButton}
              onPress={togglePlayPause}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Feather
                name={isPlaying ? "pause" : "play"}
                size={40}
                color={Colors.white}
              />
            </Pressable>
          </Animated.View>

          <Pressable
            style={styles.controlButton}
            onPress={handleSkip}
            disabled={currentExerciseIndex === exercises.length - 1}
          >
            <Feather
              name="skip-forward"
              size={28}
              color={
                currentExerciseIndex === exercises.length - 1
                  ? Colors.white20
                  : Colors.white
              }
            />
          </Pressable>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <ThemedText style={styles.footerLabel}>NEXT UP</ThemedText>
        <ThemedText style={styles.footerExercise}>
          {currentExerciseIndex < exercises.length - 1
            ? exercises[currentExerciseIndex + 1].name
            : "Workout Complete!"}
        </ThemedText>
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
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
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
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    width: 44,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  workoutMeta: {
    fontSize: 12,
    color: Colors.white40,
    marginTop: Spacing.xs,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.white10,
    marginHorizontal: Spacing["2xl"],
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  exerciseInfo: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  restBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  restText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  setInfo: {
    fontSize: 16,
    color: Colors.white40,
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
  },
  timerText: {
    fontSize: 56,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white40,
    letterSpacing: 2,
    marginTop: Spacing.xs,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["3xl"],
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryGlow,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.white40,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  footerExercise: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});
