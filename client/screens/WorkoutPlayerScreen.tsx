import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Pressable,
  Dimensions,
  Image,
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
import { sampleWorkouts, Exercise, storage } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

const workoutImages: { [key: number]: any } = {
  1: require("../../assets/images/workouts/workout1.png"),
  2: require("../../assets/images/workouts/workout2.png"),
  3: require("../../assets/images/workouts/workout3.png"),
  4: require("../../assets/images/workouts/workout4.png"),
};

const exerciseGifs: { [key: number]: any } = {
  1: require("../../assets/gifs/burpee-demo.gif"),
  2: require("../../assets/gifs/mountain-climber.gif"),
  3: require("../../assets/gifs/plank-jack.gif"),
  4: require("../../assets/gifs/glute-bridge-walk.gif"),
  5: require("../../assets/gifs/donkey-kick.gif"),
  6: require("../../assets/gifs/sumo-squat.gif"),
  7: require("../../assets/gifs/bicycle-crunch.gif"),
  8: require("../../assets/gifs/lying-leg-raise.gif"),
  9: require("../../assets/gifs/russian-twist.gif"),
  10: require("../../assets/gifs/high-knees.gif"),
  11: require("../../assets/gifs/box-jumps.gif"),
  12: require("../../assets/gifs/sprint-in-place.gif"),
  13: require("../../assets/gifs/standing-forward-fold.gif"),
  14: require("../../assets/gifs/hamstring-stretch.gif"),
  15: require("../../assets/gifs/hip-flexor-stretch.gif"),
  16: require("../../assets/gifs/pigeon-pose.gif"),
  17: require("../../assets/gifs/cat-cow-stretch.gif"),
  18: require("../../assets/gifs/push-ups.gif"),
  19: require("../../assets/gifs/resistance-band-lateral-walk.gif"),
  20: require("../../assets/gifs/plank-jack-core.gif"),
  21: require("../../assets/gifs/high-knee-jump-rope.gif"),
  22: require("../../assets/gifs/jump-squat.gif"),
  23: require("../../assets/gifs/jack-split-crunches.gif"),
  24: require("../../assets/gifs/reverse-crunch.gif"),
  25: require("../../assets/gifs/bicycle-crunch-ab.gif"),
  26: require("../../assets/gifs/dead-bug.gif"),
  27: require("../../assets/gifs/hollow-hold.gif"),
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
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const encouragementTimeout = useRef<NodeJS.Timeout | null>(null);
  const buttonScale = useSharedValue(1);
  const encouragementOpacity = useSharedValue(0);
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const profile = await storage.getUserProfile();
      if (profile) {
        setSoundEnabled(true);
        setVibrationEnabled(true);
      }
    } catch (error) {
      console.log("Error loading settings");
    }
  };

  const encouragingMessages = [
    "Great form!",
    "You got this!",
    "Keep pushing!",
    "Halfway there!",
    "Almost done!",
    "Strong finish!",
    "Crushing it!",
    "Feel the burn!",
    "Power through!",
    "Yes, queen!",
  ];

  const showEncouragement = () => {
    const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
    setEncouragement(encouragingMessages[randomIndex]);
    encouragementOpacity.value = withSpring(1, { damping: 15, stiffness: 150 });

    if (encouragementTimeout.current) {
      clearTimeout(encouragementTimeout.current);
    }
    encouragementTimeout.current = setTimeout(() => {
      encouragementOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });
      setTimeout(() => setEncouragement(null), 300);
    }, 2000);
  };

  const encouragementStyle = useAnimatedStyle(() => ({
    opacity: encouragementOpacity.value,
    transform: [{ scale: 0.9 + encouragementOpacity.value * 0.1 }],
  }));

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
    return () => {
      if (encouragementTimeout.current) {
        clearTimeout(encouragementTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeRemaining === 0 && isPlaying && !workoutComplete) {
      handleExerciseComplete();
    }
  }, [timeRemaining, isPlaying, workoutComplete]);

  const handleExerciseComplete = () => {
    if (vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    if (isResting) {
      setIsResting(false);
      setTimeRemaining(currentExercise.duration);
      showEncouragement();
      return;
    }

    if (currentSet < currentExercise.sets) {
      setIsResting(true);
      setTimeRemaining(15);
      setCurrentSet((prev) => prev + 1);
      showEncouragement();
    } else if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentSet(1);
      setTimeRemaining(exercises[nextIndex].duration);
      setIsResting(false);
      showEncouragement();
    } else {
      setIsPlaying(false);
      setWorkoutComplete(true);
      if (vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const togglePlayPause = () => {
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentSet(1);
      setTimeRemaining(exercises[nextIndex].duration);
      setIsResting(false);
    }
  };

  const handlePrevious = () => {
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
          {!isResting && currentExercise?.gifUri && exerciseGifs[currentExercise.gifUri] ? (
            <View style={styles.gifContainer}>
              <Image
                source={exerciseGifs[currentExercise.gifUri]}
                style={styles.exerciseGif}
                resizeMode="contain"
              />
            </View>
          ) : null}
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

        {encouragement ? (
          <Animated.View style={[styles.encouragementBadge, encouragementStyle]}>
            <Feather name="star" size={16} color={Colors.yellow} />
            <ThemedText style={styles.encouragementText}>{encouragement}</ThemedText>
          </Animated.View>
        ) : null}

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
    width: "100%",
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
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  setInfo: {
    fontSize: 16,
    color: Colors.white40,
  },
  gifContainer: {
    width: 240,
    height: 240,
    marginBottom: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseGif: {
    width: "100%",
    height: "100%",
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
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
  encouragementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.yellow + "20",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.yellow + "40",
  },
  encouragementText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.yellow,
  },
});
