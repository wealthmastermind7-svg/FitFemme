import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Alert,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { sampleWorkouts, Workout } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useSubscription } from "@/lib/revenuecat";
import Paywall from "@/components/Paywall";
import { useLanguage } from "@/lib/i18n";

const FREE_WORKOUT_IDS = ["1"];

const CATEGORY_KEYS: Record<string, string> = {
  "All": "workouts.categories.all",
  "HIIT": "workouts.categories.hiit",
  "Strength": "workouts.categories.strength",
  "Cardio": "workouts.categories.cardio",
  "Core": "workouts.categories.core",
  "Stretch": "workouts.categories.stretch",
};

const FILTER_KEYS: Record<string, string> = {
  "Popular": "workouts.filters.popular",
  "Short": "workouts.filters.short",
  "No Equipment": "workouts.filters.noEquipment",
  "New": "workouts.filters.new",
};

import { getWorkoutImage } from "@/lib/workoutImages";

const CATEGORIES = ["All", "HIIT", "Strength", "Cardio", "Core", "Stretch"];
const FILTERS = ["Popular", "Short", "No Equipment", "New"];

export default function WorkoutsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isSubscribed } = useSubscription();
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("Popular");
  const [paywallVisible, setPaywallVisible] = useState(false);

  const isWorkoutLocked = (workoutId: string) =>
    !isSubscribed && !FREE_WORKOUT_IDS.includes(workoutId);

  const translateIntensity = (intensity: string) => {
    const key = `workout.intensity${intensity}`;
    return t(key) || intensity;
  };

  const handleWorkoutPress = (workoutId: string) => {
    if (isWorkoutLocked(workoutId)) {
      setPaywallVisible(true);
    } else {
      navigation.navigate("WorkoutPreview", { workoutId });
    }
  };

  const getFilteredWorkouts = (): Workout[] => {
    let filtered = [...sampleWorkouts];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((w) => w.category === selectedCategory);
    }

    switch (selectedFilter) {
      case "Short":
        filtered = filtered.filter((w) => w.duration <= 20);
        break;
      case "No Equipment":
        filtered = filtered.filter((w) => w.equipment.includes("No Equipment"));
        break;
      case "New":
        filtered = filtered.filter((w) => w.isNew === true);
        break;
      case "Popular":
      default:
        break;
    }

    return filtered;
  };

  const filteredWorkouts = getFilteredWorkouts();

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t("workouts.title")}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {t("home.continueJourney")}
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
          >
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {t(CATEGORY_KEYS[category]) || category}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {FILTERS.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {t(FILTER_KEYS[filter]) || filter}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.featuredSection}>
        <ThemedText style={styles.sectionTitle}>{t("home.todaysWorkout")}</ThemedText>
        <Pressable
          style={styles.featuredCard}
          onPress={() => handleWorkoutPress("1")}
        >
          <ImageBackground
            source={getWorkoutImage(1, language)}
            style={styles.featuredImage}
            imageStyle={styles.featuredImageStyle}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.featuredGradient}
            />
            <View style={styles.featuredBadge}>
              <Feather name="zap" size={12} color={Colors.white} />
              <ThemedText style={styles.featuredBadgeText}>{t("workouts.featuredBadge")}</ThemedText>
            </View>
            <View style={styles.featuredContent}>
              <ThemedText style={styles.featuredTitle}>{sampleWorkouts[0].title}</ThemedText>
              <ThemedText style={styles.featuredMeta}>
                {sampleWorkouts[0].duration} {t("workout.min")} · {translateIntensity(sampleWorkouts[0].intensity)} · {sampleWorkouts[0].equipment.join(", ") || t("workout.noEquipment")}
              </ThemedText>
              <View style={styles.startButton}>
                <Feather name="play" size={18} color={Colors.white} />
                <ThemedText style={styles.startButtonText}>{t("workouts.startNow")}</ThemedText>
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </View>

      <View style={styles.workoutList}>
        <ThemedText style={styles.sectionTitle}>
          {selectedCategory === "All" ? t("workouts.allWorkouts") : `${selectedCategory} ${t("workouts.title")}`}
        </ThemedText>
        {filteredWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={Colors.white20} />
            <ThemedText style={styles.emptyStateText}>
              {t("workouts.noResults")}
            </ThemedText>
            <Pressable
              style={styles.clearFilterButton}
              onPress={() => {
                setSelectedCategory("All");
                setSelectedFilter("Popular");
              }}
            >
              <ThemedText style={styles.clearFilterText}>{t("workouts.clearFilters")}</ThemedText>
            </Pressable>
          </View>
        ) : (
          filteredWorkouts.map((workout, index) => (
            <WorkoutListItem
              key={workout.id}
              workout={workout}
              onPress={() => handleWorkoutPress(workout.id)}
              index={index}
              locked={isWorkoutLocked(workout.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
    <Paywall isVisible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </>
  );
}

interface WorkoutListItemProps {
  workout: Workout;
  onPress: () => void;
  locked?: boolean;
  index: number;
}

const WORKOUT_TITLE_KEYS: Record<string, string> = {
  "Full Body Burn": "workout.fullBodyBurn",
  "Glute Gains": "workout.gluteGains",
  "Core Crusher": "workout.coreCrusher",
  "Cardio Queen": "workout.cardioQueen",
  "Flexibility Flow": "workout.flexibilityFlow",
  "No-Equipment Abs": "workout.noEquipmentAbs",
};

const INTENSITY_KEYS: Record<string, string> = {
  High: "workout.intensityHigh",
  Medium: "workout.intensityMedium",
  Low: "workout.intensityLow",
};

const MUSCLE_GROUP_KEYS: Record<string, string> = {
  "Full Body": "muscle.fullBody",
  Glutes: "muscle.glutes",
  Legs: "muscle.legs",
  Core: "muscle.core",
  Abs: "muscle.abs",
  Cardio: "muscle.cardio",
  Flexibility: "muscle.flexibility",
  Arms: "muscle.arms",
  Back: "muscle.back",
  Chest: "muscle.chest",
  Shoulders: "muscle.shoulders",
};

function WorkoutListItem({ workout, onPress, index, locked }: WorkoutListItemProps) {
  const { t, language } = useLanguage();
  const imageSource = getWorkoutImage(workout.coverImage, language);
  const titleKey = WORKOUT_TITLE_KEYS[workout.title];
  const titleText = titleKey ? t(titleKey) : workout.title;
  const intensityKey = INTENSITY_KEYS[workout.intensity];
  const intensityText = intensityKey ? t(intensityKey) : workout.intensity;

  return (
    <Pressable style={[styles.listItem, locked && styles.listItemLocked]} onPress={onPress}>
      <ImageBackground
        source={imageSource}
        style={styles.listItemImage}
        imageStyle={styles.listItemImageStyle}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          style={styles.listItemGradient}
        />
        {locked ? (
          <View style={styles.lockOverlay}>
            <Feather name="lock" size={28} color={Colors.primary} />
          </View>
        ) : null}
      </ImageBackground>
      <View style={styles.listItemContent}>
        <ThemedText style={styles.listItemTitle}>{titleText}</ThemedText>
        <View style={styles.listItemMeta}>
          <View style={styles.listItemMetaItem}>
            <Feather name="clock" size={12} color={Colors.white40} />
            <ThemedText style={styles.listItemMetaText}>
              {workout.duration} {t("workout.min")}
            </ThemedText>
          </View>
          <View style={styles.listItemMetaItem}>
            <Feather name="activity" size={12} color={Colors.white40} />
            <ThemedText style={styles.listItemMetaText}>
              {intensityText}
            </ThemedText>
          </View>
        </View>
        <View style={styles.listItemTags}>
          {workout.muscleGroups.slice(0, 2).map((group) => {
            const muscleKey = MUSCLE_GROUP_KEYS[group];
            const muscleText = muscleKey ? t(muscleKey) : group;
            return (
              <View key={group} style={styles.tag}>
                <ThemedText style={styles.tagText}>{muscleText}</ThemedText>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.listItemAction}>
        <Feather name="chevron-right" size={24} color={Colors.white40} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white40,
  },
  categoriesScroll: {
    marginBottom: Spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing["2xl"],
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white05,
    borderWidth: 1,
    borderColor: Colors.white10,
    marginRight: Spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white60,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  filtersContainer: {
    paddingHorizontal: Spacing["2xl"],
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    backgroundColor: "transparent",
    marginRight: Spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.white10,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.white40,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  filterTextActive: {
    color: Colors.white,
  },
  featuredSection: {
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  featuredCard: {
    height: 260,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.medium,
  },
  featuredImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  featuredImageStyle: {
    borderRadius: BorderRadius.lg,
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredBadge: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.white,
  },
  featuredContent: {
    padding: Spacing.xl,
  },
  featuredTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  featuredMeta: {
    fontSize: 13,
    color: Colors.white60,
    marginBottom: Spacing.lg,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
  workoutList: {
    paddingHorizontal: Spacing["2xl"],
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.white05,
  },
  listItemImage: {
    width: 100,
    height: 100,
  },
  listItemImageStyle: {
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  listItemGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  listItemContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  listItemMeta: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  listItemMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  listItemMetaText: {
    fontSize: 12,
    color: Colors.white40,
  },
  listItemTags: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.white05,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.white60,
  },
  listItemAction: {
    paddingHorizontal: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.white40,
    textAlign: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  clearFilterButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  listItemLocked: {
    opacity: 0.7,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
