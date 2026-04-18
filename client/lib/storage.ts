import AsyncStorage from "@react-native-async-storage/async-storage";

export type BodyGoal = "lean_toned" | "booty_builder" | "flat_stomach";

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  avatarUri?: string;
  caloriesGoal: number;
  durationGoal: number;
  stepsGoal: number;
  bodyGoal?: BodyGoal;
  units?: string;
}

export interface ScannedMeal {
  id: string;
  date: string; // YYYY-MM-DD
  loggedAt: string; // ISO timestamp
  dish: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: number;
}

export interface GoalConfig {
  caloriesTarget: number;
  proteinTarget: number;
  titleKey: string;
  shortKey: string;
  emoji: string;
  color: string;
}

export const GOAL_CONFIG: Record<BodyGoal, GoalConfig> = {
  lean_toned: {
    caloriesTarget: 1500,
    proteinTarget: 120,
    titleKey: "goal.leanToned.title",
    shortKey: "goal.leanToned.short",
    emoji: "🔥",
    color: "#ff8a65",
  },
  booty_builder: {
    caloriesTarget: 2200,
    proteinTarget: 140,
    titleKey: "goal.bootyBuilder.title",
    shortKey: "goal.bootyBuilder.short",
    emoji: "🍑",
    color: "#d41173",
  },
  flat_stomach: {
    caloriesTarget: 1700,
    proteinTarget: 100,
    titleKey: "goal.flatStomach.title",
    shortKey: "goal.flatStomach.short",
    emoji: "✨",
    color: "#4fc3f7",
  },
};

/**
 * Compute today's status text key for a goal based on calories consumed.
 * Returns a translation key + computed percent.
 */
export function computeGoalStatus(
  goal: BodyGoal,
  caloriesConsumed: number,
): { statusKey: string; percent: number; tone: "good" | "warn" | "neutral" } {
  const cfg = GOAL_CONFIG[goal];
  const percent = cfg.caloriesTarget > 0 ? (caloriesConsumed / cfg.caloriesTarget) * 100 : 0;

  if (caloriesConsumed === 0) {
    return { statusKey: "goalStatus.empty", percent: 0, tone: "neutral" };
  }

  if (goal === "lean_toned") {
    if (percent < 60) return { statusKey: "goalStatus.leanToned.light", percent, tone: "good" };
    if (percent <= 95) return { statusKey: "goalStatus.leanToned.onTrack", percent, tone: "good" };
    if (percent <= 110) return { statusKey: "goalStatus.leanToned.atTarget", percent, tone: "good" };
    return { statusKey: "goalStatus.leanToned.over", percent, tone: "warn" };
  }
  if (goal === "booty_builder") {
    if (percent < 70) return { statusKey: "goalStatus.bootyBuilder.needMore", percent, tone: "warn" };
    if (percent <= 110) return { statusKey: "goalStatus.bootyBuilder.fueling", percent, tone: "good" };
    return { statusKey: "goalStatus.bootyBuilder.plenty", percent, tone: "good" };
  }
  // flat_stomach
  if (percent < 60) return { statusKey: "goalStatus.flatStomach.clean", percent, tone: "good" };
  if (percent <= 95) return { statusKey: "goalStatus.flatStomach.onTrack", percent, tone: "good" };
  if (percent <= 110) return { statusKey: "goalStatus.flatStomach.atTarget", percent, tone: "good" };
  return { statusKey: "goalStatus.flatStomach.over", percent, tone: "warn" };
}

/**
 * Per-workout relevance for each body goal (0-1 score).
 * Higher = better match. Used to rank "Recommended for You" on Home.
 */
export const WORKOUT_GOAL_WEIGHTS: Record<BodyGoal, Record<string, number>> = {
  lean_toned: { "1": 1.0, "2": 0.5, "3": 0.7, "4": 1.0, "5": 0.4, "6": 0.6 },
  booty_builder: { "1": 0.4, "2": 1.0, "3": 0.4, "4": 0.3, "5": 0.5, "6": 0.3 },
  flat_stomach: { "1": 0.7, "2": 0.3, "3": 1.0, "4": 0.8, "5": 0.6, "6": 1.0 },
};

export function getRecommendedWorkouts<T extends { id: string }>(
  goal: BodyGoal | undefined,
  workouts: T[],
  n = 3,
): T[] {
  if (!goal) return workouts.slice(0, n);
  const weights = WORKOUT_GOAL_WEIGHTS[goal];
  return [...workouts]
    .sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0))
    .slice(0, n);
}

export interface MealIdea {
  id: string;
  titleKey: string;
  descKey: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepMins: number;
  icon: string; // Feather icon name
  color: string;
  image?: any; // require()'d image source (or look up via MEAL_IMAGES[id])
  ingredientKeys: string[];
  stepKeys: string[];
}

export const MEAL_IMAGES: Record<string, any> = {
  lt1: require("../../assets/images/meals/lt1.png"),
  lt2: require("../../assets/images/meals/lt2.png"),
  lt3: require("../../assets/images/meals/lt3.png"),
  lt4: require("../../assets/images/meals/lt4.png"),
  bb1: require("../../assets/images/meals/bb1.png"),
  bb2: require("../../assets/images/meals/bb2.png"),
  bb3: require("../../assets/images/meals/bb3.png"),
  bb4: require("../../assets/images/meals/bb4.png"),
  fs1: require("../../assets/images/meals/fs1.png"),
  fs2: require("../../assets/images/meals/fs2.png"),
  fs3: require("../../assets/images/meals/fs3.png"),
  fs4: require("../../assets/images/meals/fs4.png"),
};

export const MEAL_IDEAS: Record<BodyGoal, MealIdea[]> = {
  lean_toned: [
    { id: "lt1", titleKey: "mealIdeas.lt1.title", descKey: "mealIdeas.lt1.desc", calories: 380, protein: 42, carbs: 18, fat: 14, prepMins: 15, icon: "leaf", color: "#81c784",
      ingredientKeys: ["mealIdeas.lt1.ing1","mealIdeas.lt1.ing2","mealIdeas.lt1.ing3","mealIdeas.lt1.ing4","mealIdeas.lt1.ing5"],
      stepKeys: ["mealIdeas.lt1.step1","mealIdeas.lt1.step2","mealIdeas.lt1.step3"] },
    { id: "lt2", titleKey: "mealIdeas.lt2.title", descKey: "mealIdeas.lt2.desc", calories: 420, protein: 38, carbs: 24, fat: 20, prepMins: 25, icon: "wind", color: "#4fc3f7",
      ingredientKeys: ["mealIdeas.lt2.ing1","mealIdeas.lt2.ing2","mealIdeas.lt2.ing3","mealIdeas.lt2.ing4","mealIdeas.lt2.ing5"],
      stepKeys: ["mealIdeas.lt2.step1","mealIdeas.lt2.step2","mealIdeas.lt2.step3"] },
    { id: "lt3", titleKey: "mealIdeas.lt3.title", descKey: "mealIdeas.lt3.desc", calories: 280, protein: 28, carbs: 22, fat: 8, prepMins: 5, icon: "circle", color: "#f0c93e",
      ingredientKeys: ["mealIdeas.lt3.ing1","mealIdeas.lt3.ing2","mealIdeas.lt3.ing3","mealIdeas.lt3.ing4"],
      stepKeys: ["mealIdeas.lt3.step1","mealIdeas.lt3.step2"] },
    { id: "lt4", titleKey: "mealIdeas.lt4.title", descKey: "mealIdeas.lt4.desc", calories: 220, protein: 24, carbs: 8, fat: 9, prepMins: 10, icon: "sunrise", color: "#ff8a65",
      ingredientKeys: ["mealIdeas.lt4.ing1","mealIdeas.lt4.ing2","mealIdeas.lt4.ing3","mealIdeas.lt4.ing4"],
      stepKeys: ["mealIdeas.lt4.step1","mealIdeas.lt4.step2","mealIdeas.lt4.step3"] },
  ],
  booty_builder: [
    { id: "bb1", titleKey: "mealIdeas.bb1.title", descKey: "mealIdeas.bb1.desc", calories: 620, protein: 48, carbs: 65, fat: 16, prepMins: 20, icon: "zap", color: "#d41173",
      ingredientKeys: ["mealIdeas.bb1.ing1","mealIdeas.bb1.ing2","mealIdeas.bb1.ing3","mealIdeas.bb1.ing4","mealIdeas.bb1.ing5"],
      stepKeys: ["mealIdeas.bb1.step1","mealIdeas.bb1.step2","mealIdeas.bb1.step3"] },
    { id: "bb2", titleKey: "mealIdeas.bb2.title", descKey: "mealIdeas.bb2.desc", calories: 720, protein: 52, carbs: 60, fat: 28, prepMins: 30, icon: "trending-up", color: "#ff8a65",
      ingredientKeys: ["mealIdeas.bb2.ing1","mealIdeas.bb2.ing2","mealIdeas.bb2.ing3","mealIdeas.bb2.ing4","mealIdeas.bb2.ing5"],
      stepKeys: ["mealIdeas.bb2.step1","mealIdeas.bb2.step2","mealIdeas.bb2.step3"] },
    { id: "bb3", titleKey: "mealIdeas.bb3.title", descKey: "mealIdeas.bb3.desc", calories: 480, protein: 35, carbs: 58, fat: 12, prepMins: 8, icon: "sunrise", color: "#f0c93e",
      ingredientKeys: ["mealIdeas.bb3.ing1","mealIdeas.bb3.ing2","mealIdeas.bb3.ing3","mealIdeas.bb3.ing4"],
      stepKeys: ["mealIdeas.bb3.step1","mealIdeas.bb3.step2"] },
    { id: "bb4", titleKey: "mealIdeas.bb4.title", descKey: "mealIdeas.bb4.desc", calories: 580, protein: 42, carbs: 55, fat: 18, prepMins: 15, icon: "wind", color: "#4fc3f7",
      ingredientKeys: ["mealIdeas.bb4.ing1","mealIdeas.bb4.ing2","mealIdeas.bb4.ing3","mealIdeas.bb4.ing4","mealIdeas.bb4.ing5"],
      stepKeys: ["mealIdeas.bb4.step1","mealIdeas.bb4.step2","mealIdeas.bb4.step3"] },
  ],
  flat_stomach: [
    { id: "fs1", titleKey: "mealIdeas.fs1.title", descKey: "mealIdeas.fs1.desc", calories: 360, protein: 38, carbs: 18, fat: 12, prepMins: 20, icon: "wind", color: "#4fc3f7",
      ingredientKeys: ["mealIdeas.fs1.ing1","mealIdeas.fs1.ing2","mealIdeas.fs1.ing3","mealIdeas.fs1.ing4"],
      stepKeys: ["mealIdeas.fs1.step1","mealIdeas.fs1.step2","mealIdeas.fs1.step3"] },
    { id: "fs2", titleKey: "mealIdeas.fs2.title", descKey: "mealIdeas.fs2.desc", calories: 240, protein: 18, carbs: 28, fat: 6, prepMins: 25, icon: "droplet", color: "#81c784",
      ingredientKeys: ["mealIdeas.fs2.ing1","mealIdeas.fs2.ing2","mealIdeas.fs2.ing3","mealIdeas.fs2.ing4","mealIdeas.fs2.ing5"],
      stepKeys: ["mealIdeas.fs2.step1","mealIdeas.fs2.step2","mealIdeas.fs2.step3"] },
    { id: "fs3", titleKey: "mealIdeas.fs3.title", descKey: "mealIdeas.fs3.desc", calories: 180, protein: 12, carbs: 14, fat: 10, prepMins: 8, icon: "leaf", color: "#a5d6a7",
      ingredientKeys: ["mealIdeas.fs3.ing1","mealIdeas.fs3.ing2","mealIdeas.fs3.ing3","mealIdeas.fs3.ing4"],
      stepKeys: ["mealIdeas.fs3.step1","mealIdeas.fs3.step2"] },
    { id: "fs4", titleKey: "mealIdeas.fs4.title", descKey: "mealIdeas.fs4.desc", calories: 320, protein: 32, carbs: 16, fat: 10, prepMins: 18, icon: "circle", color: "#4fc3f7",
      ingredientKeys: ["mealIdeas.fs4.ing1","mealIdeas.fs4.ing2","mealIdeas.fs4.ing3","mealIdeas.fs4.ing4"],
      stepKeys: ["mealIdeas.fs4.step1","mealIdeas.fs4.step2","mealIdeas.fs4.step3"] },
  ],
};

export function findMealIdea(id: string): { idea: MealIdea; goal: BodyGoal } | undefined {
  for (const g of Object.keys(MEAL_IDEAS) as BodyGoal[]) {
    const idea = MEAL_IDEAS[g].find((m) => m.id === id);
    if (idea) return { idea, goal: g };
  }
  return undefined;
}

export interface WeeklyInsights {
  daysLogged: number;
  totalMeals: number;
  avgCalories: number;
  avgProtein: number;
  daysOnTrack: number;
}

export function computeWeeklyInsights(
  goal: BodyGoal | undefined,
  meals: ScannedMeal[],
): WeeklyInsights {
  const byDay = new Map<string, ScannedMeal[]>();
  meals.forEach((m) => {
    const arr = byDay.get(m.date) ?? [];
    arr.push(m);
    byDay.set(m.date, arr);
  });
  const daysLogged = byDay.size;
  const totalMeals = meals.length;
  const totalCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProt = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const avgCalories = daysLogged > 0 ? Math.round(totalCal / daysLogged) : 0;
  const avgProtein = daysLogged > 0 ? Math.round(totalProt / daysLogged) : 0;
  let daysOnTrack = 0;
  if (goal) {
    const target = GOAL_CONFIG[goal].caloriesTarget;
    byDay.forEach((dayMeals) => {
      const dayCal = dayMeals.reduce((s, m) => s + (m.calories || 0), 0);
      const pct = target > 0 ? (dayCal / target) * 100 : 0;
      if (pct >= 60 && pct <= 110) daysOnTrack++;
    });
  }
  return { daysLogged, totalMeals, avgCalories, avgProtein, daysOnTrack };
}

/**
 * Goal-aware feedback for a single scanned meal.
 * Returns a translation key.
 */
export function computeMealFeedback(
  goal: BodyGoal | undefined,
  meal: { calories: number; protein: number; carbs: number; fat: number; fiber: number },
): string {
  const g = goal ?? "lean_toned";
  if (g === "booty_builder" && meal.protein < 20) return "mealFeedback.addProtein";
  if (g === "flat_stomach" && meal.calories >= 700) return "mealFeedback.heavyBloat";
  if (g === "lean_toned" && meal.calories >= 700) return "mealFeedback.heavyLean";
  if (meal.protein >= 25) return "mealFeedback.highProtein";
  if (meal.protein < 10) return "mealFeedback.lowProtein";
  if (meal.fiber >= 8) return "mealFeedback.highFiber";
  return "mealFeedback.balanced";
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutTitle: string;
  category: "HIIT" | "Strength" | "Cardio" | "Core" | "Stretch";
  durationMinutes: number;
  caloriesBurned: number;
  completedAt: string;
  date: string;
}

const MET_BY_CATEGORY: Record<WorkoutSession["category"], number> = {
  HIIT: 9,
  Cardio: 8,
  Strength: 6,
  Core: 5,
  Stretch: 3,
};

export function toKilograms(weight: number, units: string | undefined): number {
  if (!Number.isFinite(weight) || weight <= 0) return 65;
  return units === "Imperial" ? weight * 0.45359237 : weight;
}

export function estimateCaloriesBurned(
  category: WorkoutSession["category"],
  durationMinutes: number,
  weightKg = 65,
): number {
  const met = MET_BY_CATEGORY[category] ?? 6;
  const safeWeight = Number.isFinite(weightKg) && weightKg > 0 ? weightKg : 65;
  const safeMinutes = Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 0;
  return Math.round(met * safeWeight * (safeMinutes / 60));
}

const BURN_CREDIT_BY_GOAL: Record<BodyGoal, number> = {
  lean_toned: 0,
  booty_builder: 1.0,
  flat_stomach: 0.5,
};

export interface NetEnergy {
  baseTarget: number;
  effectiveTarget: number;
  eaten: number;
  burned: number;
  burnCreditUsed: number;
  netConsumed: number;
  netRemaining: number;
}

export function computeNetEnergy(
  goal: BodyGoal | undefined,
  eaten: number,
  burned: number,
): NetEnergy {
  const g = goal ?? "lean_toned";
  const baseTarget = GOAL_CONFIG[g].caloriesTarget;
  const factor = BURN_CREDIT_BY_GOAL[g];
  const safeEaten = Number.isFinite(eaten) && eaten > 0 ? eaten : 0;
  const safeBurned = Number.isFinite(burned) && burned > 0 ? burned : 0;
  const burnCreditUsed = Math.round(safeBurned * factor);
  const effectiveTarget = baseTarget + burnCreditUsed;
  const netConsumed = safeEaten;
  const netRemaining = effectiveTarget - netConsumed;
  return {
    baseTarget,
    effectiveTarget,
    eaten,
    burned,
    burnCreditUsed,
    netConsumed,
    netRemaining,
  };
}

export interface DailyMetrics {
  date: string;
  caloriesBurned: number;
  durationMinutes: number;
  steps: number;
  hydrationOz: number;
  heartRateAvg: number;
  sleepHours: number;
  completedExercises?: CompletedExercise[];
  workoutsCompleted?: string[];
}

export interface Workout {
  id: string;
  title: string;
  duration: number;
  intensity: "Low" | "Medium" | "High";
  coverImage: number;
  muscleGroups: string[];
  equipment: string[];
  category: "HIIT" | "Strength" | "Cardio" | "Core" | "Stretch";
  isNew?: boolean;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  sets: number;
  gifUri?: number;
  muscleGroups?: string[];
}

export interface CompletedExercise {
  workoutId: string;
  workoutTitle: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroups: string[];
  completedAt: string;
}

export interface Milestone {
  id: string;
  type: string;
  title: string;
  icon: string;
  achieved: boolean;
  dateAchieved?: string;
}

const KEYS = {
  USER_PROFILE: "@userProfile",
  DAILY_METRICS: "@dailyMetrics",
  WORKOUTS: "@workouts",
  MILESTONES: "@milestones",
  STREAK: "@streak",
  WEEKLY_ACTIVITY: "@weeklyActivity",
  COMPLETED_EXERCISES: "@completedExercises",
  SCANNED_MEALS: "@scannedMeals",
  SCAN_COUNT: "@scanCount",
  WORKOUT_SESSIONS: "@workoutSessions",
};

export const FREE_SCAN_LIMIT = 3;

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export const storage = {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async setUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },

  async getDailyMetrics(): Promise<DailyMetrics | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.DAILY_METRICS);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async setDailyMetrics(metrics: DailyMetrics): Promise<void> {
    await AsyncStorage.setItem(KEYS.DAILY_METRICS, JSON.stringify(metrics));
  },

  async getStreak(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(KEYS.STREAK);
      return value ? parseInt(value, 10) : 0;
    } catch {
      return 0;
    }
  },

  async setStreak(streak: number): Promise<void> {
    await AsyncStorage.setItem(KEYS.STREAK, streak.toString());
  },

  async getWeeklyActivity(): Promise<number[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.WEEKLY_ACTIVITY);
      return json ? JSON.parse(json) : [0, 0, 0, 0, 0, 0, 0];
    } catch {
      return [0, 0, 0, 0, 0, 0, 0];
    }
  },

  async setWeeklyActivity(activity: number[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.WEEKLY_ACTIVITY, JSON.stringify(activity));
  },

  async getMilestones(): Promise<Milestone[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.MILESTONES);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async setMilestones(milestones: Milestone[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.MILESTONES, JSON.stringify(milestones));
  },

  async addCompletedExercise(exercise: CompletedExercise): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(KEYS.COMPLETED_EXERCISES);
      const completed: CompletedExercise[] = json ? JSON.parse(json) : [];
      completed.push(exercise);
      await AsyncStorage.setItem(KEYS.COMPLETED_EXERCISES, JSON.stringify(completed));
    } catch (error) {
      console.log("Error adding completed exercise:", error);
    }
  },

  async getCompletedExercises(): Promise<CompletedExercise[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.COMPLETED_EXERCISES);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async addScannedMeal(meal: Omit<ScannedMeal, "id" | "date" | "loggedAt">): Promise<ScannedMeal> {
    try {
      const json = await AsyncStorage.getItem(KEYS.SCANNED_MEALS);
      const meals: ScannedMeal[] = json ? JSON.parse(json) : [];
      const now = new Date();
      const newMeal: ScannedMeal = {
        ...meal,
        id: `${now.getTime()}`,
        date: todayKey(),
        loggedAt: now.toISOString(),
      };
      meals.push(newMeal);
      // Keep only the last 60 days of meals to avoid unbounded growth
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 60);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      const trimmed = meals.filter((m) => m.date >= cutoffStr);
      await AsyncStorage.setItem(KEYS.SCANNED_MEALS, JSON.stringify(trimmed));
      return newMeal;
    } catch (error) {
      console.log("Error adding scanned meal:", error);
      throw error;
    }
  },

  async getScannedMeals(): Promise<ScannedMeal[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.SCANNED_MEALS);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async getTodaysMeals(): Promise<ScannedMeal[]> {
    const meals = await this.getScannedMeals();
    const today = todayKey();
    return meals.filter((m) => m.date === today);
  },

  async getMealsLastNDays(n: number): Promise<ScannedMeal[]> {
    const meals = await this.getScannedMeals();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (n - 1));
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return meals.filter((m) => m.date >= cutoffStr);
  },

  async getScanCount(): Promise<number> {
    try {
      const v = await AsyncStorage.getItem(KEYS.SCAN_COUNT);
      return v ? parseInt(v, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  async incrementScanCount(): Promise<number> {
    const current = await this.getScanCount();
    const next = current + 1;
    await AsyncStorage.setItem(KEYS.SCAN_COUNT, next.toString());
    return next;
  },

  async addWorkoutSession(
    session: Omit<WorkoutSession, "id" | "date" | "completedAt">,
  ): Promise<WorkoutSession> {
    try {
      const json = await AsyncStorage.getItem(KEYS.WORKOUT_SESSIONS);
      const sessions: WorkoutSession[] = json ? JSON.parse(json) : [];
      const now = new Date();
      const newSession: WorkoutSession = {
        ...session,
        id: `${now.getTime()}`,
        date: todayKey(),
        completedAt: now.toISOString(),
      };
      sessions.push(newSession);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 60);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      const trimmed = sessions.filter((s) => s.date >= cutoffStr);
      await AsyncStorage.setItem(KEYS.WORKOUT_SESSIONS, JSON.stringify(trimmed));
      return newSession;
    } catch (error) {
      console.log("Error adding workout session:", error);
      throw error;
    }
  },

  async getWorkoutSessions(): Promise<WorkoutSession[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.WORKOUT_SESSIONS);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async getTodaysWorkoutSessions(): Promise<WorkoutSession[]> {
    const sessions = await this.getWorkoutSessions();
    const today = todayKey();
    return sessions.filter((s) => s.date === today);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};

export const sampleUserProfile: UserProfile = {
  name: "Keisha",
  age: 28,
  weight: 140,
  caloriesGoal: 2000,
  durationGoal: 45,
  stepsGoal: 10000,
};

export const sampleDailyMetrics: DailyMetrics = {
  date: new Date().toISOString().split("T")[0],
  caloriesBurned: 540,
  durationMinutes: 28,
  steps: 3200,
  hydrationOz: 48,
  heartRateAvg: 72,
  sleepHours: 6.75,
};

export const sampleWeeklyActivity = [65, 80, 45, 90, 30, 70, 55];

export const sampleWorkouts: Workout[] = [
  {
    id: "1",
    title: "Full Body Burn",
    duration: 30,
    intensity: "High",
    coverImage: 1,
    muscleGroups: ["Full Body"],
    equipment: ["No Equipment"],
    category: "HIIT",
    isNew: false,
    exercises: [
      { id: "1", name: "Jump Squats", duration: 45, sets: 5, gifUri: 22, muscleGroups: ["Legs", "Glutes", "Quads"] },
      { id: "2", name: "Burpees", duration: 45, sets: 5, gifUri: 1, muscleGroups: ["Chest", "Arms", "Core", "Legs"] },
      { id: "3", name: "Mountain Climber", duration: 45, sets: 5, gifUri: 2, muscleGroups: ["Core", "Chest", "Shoulders"] },
      { id: "4", name: "Push-ups", duration: 45, sets: 5, gifUri: 18, muscleGroups: ["Chest", "Arms", "Shoulders"] },
      { id: "5", name: "Plank Jacks", duration: 45, sets: 5, gifUri: 3, muscleGroups: ["Core", "Shoulders"] },
    ],
  },
  {
    id: "2",
    title: "Glute Gains",
    duration: 15,
    intensity: "Medium",
    coverImage: 2,
    muscleGroups: ["Glutes", "Legs"],
    equipment: ["Resistance Band"],
    category: "Strength",
    isNew: true,
    exercises: [
      { id: "1", name: "Glute Bridge Walk", duration: 45, sets: 4, gifUri: 4, muscleGroups: ["Glutes", "Legs", "Back"] },
      { id: "2", name: "Basic to Cross Donkey Kick", duration: 45, sets: 4, gifUri: 5, muscleGroups: ["Glutes", "Legs"] },
      { id: "3", name: "Resistance Band Lateral Walk", duration: 45, sets: 4, gifUri: 19, muscleGroups: ["Glutes", "Legs", "Core"] },
      { id: "4", name: "Bottle Weighted Sumo Squat", duration: 45, sets: 4, gifUri: 6, muscleGroups: ["Legs", "Glutes", "Core"] },
    ],
  },
  {
    id: "3",
    title: "Core Crusher",
    duration: 20,
    intensity: "High",
    coverImage: 3,
    muscleGroups: ["Core", "Abs"],
    equipment: ["Mat"],
    category: "Core",
    isNew: false,
    exercises: [
      { id: "1", name: "Bicycle Crunch", duration: 45, sets: 4, gifUri: 7, muscleGroups: ["Core", "Abs"] },
      { id: "2", name: "Lying Leg Raise", duration: 45, sets: 4, gifUri: 8, muscleGroups: ["Core", "Abs", "Legs"] },
      { id: "3", name: "Russian Twist", duration: 45, sets: 4, gifUri: 9, muscleGroups: ["Core", "Obliques"] },
      { id: "4", name: "Plank Jack", duration: 60, sets: 3, gifUri: 20, muscleGroups: ["Core", "Shoulders"] },
    ],
  },
  {
    id: "4",
    title: "Cardio Queen",
    duration: 25,
    intensity: "High",
    coverImage: 4,
    muscleGroups: ["Full Body", "Cardio"],
    equipment: ["No Equipment"],
    category: "Cardio",
    isNew: true,
    exercises: [
      { id: "1", name: "High Knee Tap", duration: 45, sets: 5, gifUri: 10, muscleGroups: ["Legs", "Cardio"] },
      { id: "2", name: "High Knee Jump Rope", duration: 60, sets: 4, gifUri: 21, muscleGroups: ["Legs", "Cardio", "Core"] },
      { id: "3", name: "Jump Box", duration: 45, sets: 4, gifUri: 11, muscleGroups: ["Legs", "Glutes", "Cardio"] },
      { id: "4", name: "Suspender Sprinter", duration: 30, sets: 6, gifUri: 12, muscleGroups: ["Legs", "Core", "Cardio"] },
    ],
  },
  {
    id: "5",
    title: "Flexibility Flow",
    duration: 20,
    intensity: "Low",
    coverImage: 1,
    muscleGroups: ["Full Body", "Flexibility"],
    equipment: ["Mat"],
    category: "Stretch",
    isNew: false,
    exercises: [
      { id: "1", name: "Standing Forward Bend Uttanasana", duration: 60, sets: 2, gifUri: 13, muscleGroups: ["Back", "Legs", "Hamstrings"] },
      { id: "2", name: "Seated Hamstring Stretch with Chair", duration: 45, sets: 3, gifUri: 14, muscleGroups: ["Legs", "Hamstrings"] },
      { id: "3", name: "Kneeling Hip Flexor Stretch", duration: 45, sets: 3, gifUri: 15, muscleGroups: ["Legs", "Hips"] },
      { id: "4", name: "Double Pigeon Pose", duration: 60, sets: 2, gifUri: 16, muscleGroups: ["Legs", "Hips", "Glutes"] },
      { id: "5", name: "Cow Yoga Pose Bitilasana", duration: 45, sets: 3, gifUri: 17, muscleGroups: ["Back", "Chest", "Core"] },
    ],
  },
  {
    id: "6",
    title: "No-Equipment Abs",
    duration: 15,
    intensity: "High",
    coverImage: 3,
    muscleGroups: ["Abs", "Core"],
    equipment: ["No Equipment"],
    category: "Core",
    isNew: true,
    exercises: [
      { id: "1", name: "Jack Split Crunches", duration: 45, sets: 4, gifUri: 23, muscleGroups: ["Core", "Abs"] },
      { id: "2", name: "Reverse Crunch", duration: 45, sets: 4, gifUri: 24, muscleGroups: ["Core", "Abs", "Lower Abs"] },
      { id: "3", name: "Bicycle Crunch", duration: 45, sets: 4, gifUri: 25, muscleGroups: ["Core", "Abs", "Obliques"] },
      { id: "4", name: "Dead Bug", duration: 45, sets: 4, gifUri: 26, muscleGroups: ["Core", "Abs"] },
      { id: "5", name: "Hollow Hold", duration: 45, sets: 3, gifUri: 27, muscleGroups: ["Core", "Abs", "Shoulders"] },
    ],
  },
];

export const sampleMilestones: Milestone[] = [
  { id: "1", type: "streak", title: "Streak", icon: "trending-up", achieved: true, dateAchieved: "2024-01-15" },
  { id: "2", type: "steps", title: "Steps", icon: "activity", achieved: true, dateAchieved: "2024-01-10" },
  { id: "3", type: "hydration", title: "Hydrated", icon: "droplet", achieved: false },
  { id: "4", type: "power", title: "Power", icon: "zap", achieved: false },
];

export async function initializeSampleData(): Promise<void> {
  const profile = await storage.getUserProfile();
  if (!profile) {
    await storage.setUserProfile(sampleUserProfile);
    await storage.setDailyMetrics(sampleDailyMetrics);
    await storage.setStreak(5);
    await storage.setWeeklyActivity(sampleWeeklyActivity);
    await storage.setMilestones(sampleMilestones);
  }
}
