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
      { id: "1", name: "Jump Squats", duration: 45, sets: 5 },
      { id: "2", name: "Burpees", duration: 45, sets: 5 },
      { id: "3", name: "Mountain Climbers", duration: 45, sets: 5 },
      { id: "4", name: "Push-ups", duration: 45, sets: 5 },
      { id: "5", name: "Plank Jacks", duration: 45, sets: 5 },
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
      { id: "1", name: "Glute Bridges", duration: 45, sets: 4 },
      { id: "2", name: "Donkey Kicks", duration: 45, sets: 4 },
      { id: "3", name: "Fire Hydrants", duration: 45, sets: 4 },
      { id: "4", name: "Sumo Squats", duration: 45, sets: 4 },
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
      { id: "1", name: "Bicycle Crunches", duration: 45, sets: 4 },
      { id: "2", name: "Leg Raises", duration: 45, sets: 4 },
      { id: "3", name: "Russian Twists", duration: 45, sets: 4 },
      { id: "4", name: "Plank Hold", duration: 60, sets: 3 },
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
      { id: "1", name: "High Knees", duration: 45, sets: 5 },
      { id: "2", name: "Jump Rope", duration: 60, sets: 4 },
      { id: "3", name: "Box Jumps", duration: 45, sets: 4 },
      { id: "4", name: "Sprint in Place", duration: 30, sets: 6 },
    ],
  },
];

export const sampleMilestones: Milestone[] = [
  { id: "1", type: "streak", title: "Streak", icon: "flame", achieved: true, dateAchieved: "2024-01-15" },
  { id: "2", type: "steps", title: "Steps", icon: "footprints", achieved: true, dateAchieved: "2024-01-10" },
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
