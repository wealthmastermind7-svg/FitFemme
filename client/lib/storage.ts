import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  avatarUri?: string;
  caloriesGoal: number;
  durationGoal: number;
  stepsGoal: number;
}

export interface DailyMetrics {
  date: string;
  caloriesBurned: number;
  durationMinutes: number;
  steps: number;
  hydrationOz: number;
  heartRateAvg: number;
  sleepHours: number;
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
};

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
      { id: "1", name: "Jump Squats", duration: 45, sets: 5, gifUri: 22 },
      { id: "2", name: "Burpees", duration: 45, sets: 5, gifUri: 1 },
      { id: "3", name: "Mountain Climber", duration: 45, sets: 5, gifUri: 2 },
      { id: "4", name: "Push-ups", duration: 45, sets: 5, gifUri: 18 },
      { id: "5", name: "Plank Jacks", duration: 45, sets: 5, gifUri: 3 },
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
      { id: "1", name: "Glute Bridge Walk", duration: 45, sets: 4, gifUri: 4 },
      { id: "2", name: "Basic to Cross Donkey Kick", duration: 45, sets: 4, gifUri: 5 },
      { id: "3", name: "Resistance Band Lateral Walk", duration: 45, sets: 4, gifUri: 19 },
      { id: "4", name: "Bottle Weighted Sumo Squat", duration: 45, sets: 4, gifUri: 6 },
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
      { id: "1", name: "Bicycle Crunch", duration: 45, sets: 4, gifUri: 7 },
      { id: "2", name: "Lying Leg Raise", duration: 45, sets: 4, gifUri: 8 },
      { id: "3", name: "Russian Twist", duration: 45, sets: 4, gifUri: 9 },
      { id: "4", name: "Plank Jack", duration: 60, sets: 3, gifUri: 20 },
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
      { id: "1", name: "High Knee Tap", duration: 45, sets: 5, gifUri: 10 },
      { id: "2", name: "High Knee Jump Rope", duration: 60, sets: 4, gifUri: 21 },
      { id: "3", name: "Jump Box", duration: 45, sets: 4, gifUri: 11 },
      { id: "4", name: "Suspender Sprinter", duration: 30, sets: 6, gifUri: 12 },
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
      { id: "1", name: "Standing Forward Bend Uttanasana", duration: 60, sets: 2, gifUri: 13 },
      { id: "2", name: "Seated Hamstring Stretch with Chair", duration: 45, sets: 3, gifUri: 14 },
      { id: "3", name: "Kneeling Hip Flexor Stretch", duration: 45, sets: 3, gifUri: 15 },
      { id: "4", name: "Double Pigeon Pose", duration: 60, sets: 2, gifUri: 16 },
      { id: "5", name: "Cow Yoga Pose Bitilasana", duration: 45, sets: 3, gifUri: 17 },
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
      { id: "1", name: "Jack Split Crunches", duration: 45, sets: 4, gifUri: 23 },
      { id: "2", name: "Reverse Crunch", duration: 45, sets: 4, gifUri: 24 },
      { id: "3", name: "Bicycle Crunch", duration: 45, sets: 4, gifUri: 25 },
      { id: "4", name: "Dead Bug", duration: 45, sets: 4, gifUri: 26 },
      { id: "5", name: "Hollow Hold", duration: 45, sets: 3, gifUri: 27 },
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
