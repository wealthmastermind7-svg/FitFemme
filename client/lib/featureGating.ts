export const FREE_TIER_LIMITS = {
  workoutsPerDay: 1,
  dailyWorkouts: ["1"], // Only Full Body Burn for free users
  hasProgressTracking: false,
  hasStreak: false,
  hasWorkoutHistory: false,
  hasCustomWorkoutBuilder: false,
};

export const PRO_TIER_FEATURES = {
  unlimitedWorkouts: true,
  allWorkouts: true,
  progressTracking: true,
  streak: true,
  workoutHistory: true,
  customWorkoutBuilder: true,
  noAds: true,
};

export const shouldShowPaywall = (
  isProSubscriber: boolean,
  triggerType: string
): boolean => {
  if (isProSubscriber) return false;

  const paywallTriggers = [
    "workout_completed", // After workout finishes
    "locked_workout", // When clicking locked workout
    "stats_view", // Viewing stats
    "history_view", // Viewing workout history
    "custom_builder", // Custom workout builder
  ];

  return paywallTriggers.includes(triggerType);
};

export const getAvailableWorkouts = (isProSubscriber: boolean): string[] => {
  if (isProSubscriber) {
    return ["1", "2", "3", "4", "5", "6"]; // All workouts
  }
  return FREE_TIER_LIMITS.dailyWorkouts; // Only Full Body Burn
};

export const isWorkoutLocked = (
  workoutId: string,
  isProSubscriber: boolean
): boolean => {
  const freeWorkouts = FREE_TIER_LIMITS.dailyWorkouts;
  if (isProSubscriber) return false;
  return !freeWorkouts.includes(workoutId);
};
