import type { Language } from "@/lib/i18n";

const enImages: Record<number, any> = {
  1: require("../../assets/images/workouts/workout1.png"),
  2: require("../../assets/images/workouts/workout2.png"),
  3: require("../../assets/images/workouts/workout3.png"),
  4: require("../../assets/images/workouts/workout4.png"),
};

const esImages: Record<number, any> = {
  1: require("../../assets/images/workouts/workout1-es.png"),
  2: require("../../assets/images/workouts/workout2-es.png"),
  3: require("../../assets/images/workouts/workout3-es.png"),
  4: require("../../assets/images/workouts/workout4-es.png"),
};

const ptImages: Record<number, any> = {
  1: require("../../assets/images/workouts/workout1-pt.png"),
  2: require("../../assets/images/workouts/workout2-pt.png"),
  3: require("../../assets/images/workouts/workout3-pt.png"),
  4: require("../../assets/images/workouts/workout4-pt.png"),
};

export function getWorkoutImage(coverImage: number, language: Language) {
  const set = language === "pt" ? ptImages : language === "es" ? esImages : enImages;
  return set[coverImage] || set[1];
}
