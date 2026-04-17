import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { CircularProgress } from "@/components/CircularProgress";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  storage,
  UserProfile,
  DailyMetrics,
  sampleUserProfile,
  sampleDailyMetrics,
  sampleWorkouts,
  initializeSampleData,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useLanguage } from "@/lib/i18n";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile>(sampleUserProfile);
  const [metrics, setMetrics] = useState<DailyMetrics>(sampleDailyMetrics);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    await initializeSampleData();
    const userProfile = await storage.getUserProfile();
    const dailyMetrics = await storage.getDailyMetrics();

    if (userProfile) setProfile(userProfile);
    if (dailyMetrics) setMetrics(dailyMetrics);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.goodMorning");
    if (hour < 17) return t("home.goodAfternoon");
    return t("home.goodEvening");
  };

  const getFormattedDate = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  };

  const durationProgress = (metrics.durationMinutes / profile.durationGoal) * 100;

  const handleWorkoutPress = (workoutId: string) => {
    navigation.navigate("WorkoutPreview", { workoutId });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroContainer}>
        <ImageBackground
          source={require("../../assets/images/hero-fitness.png")}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.4)",
              "rgba(34,16,25,0.3)",
              "rgba(34,16,25,0.9)",
              Colors.backgroundDark,
            ]}
            locations={[0, 0.4, 0.8, 1]}
            style={styles.heroGradient}
          />

          <View style={[styles.heroHeader, { paddingTop: insets.top + Spacing.lg }]}>
            <View>
              <ThemedText style={styles.dateText}>{getFormattedDate()}</ThemedText>
            </View>
            <Pressable style={styles.notificationButton}>
              <Feather name="bell" size={20} color={Colors.white} />
            </Pressable>
          </View>

          <View style={styles.playButton}>
            <View style={styles.playButtonInner}>
              <Feather name="play" size={32} color={Colors.white} />
            </View>
          </View>

          <View style={styles.heroContent}>
            <ThemedText style={styles.greeting}>
              {getGreeting()},{"\n"}{profile.name}
            </ThemedText>
            <View style={styles.badges}>
              <View style={[styles.badge, styles.badgeSecondary]}>
                <Feather name="clock" size={14} color={Colors.white} />
                <ThemedText style={styles.badgeText}>{profile.durationGoal}m Goal</ThemedText>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.progressSection}>
        <GlassCard>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.sectionTitle}>{t("home.weeklyProgress")}</ThemedText>
            <Pressable>
              <ThemedText style={styles.detailsLink}>{t("common.next")}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.progressRings}>
            <View style={styles.ringContainer}>
              <CircularProgress
                size={96}
                strokeWidth={5}
                progress={durationProgress}
                color={Colors.success}
              >
                <ThemedText style={styles.durationValue}>{metrics.durationMinutes}</ThemedText>
                <ThemedText style={styles.durationUnit}>min</ThemedText>
              </CircularProgress>
              <ThemedText style={styles.ringValue}>Today</ThemedText>
            </View>
          </View>
        </GlassCard>
      </View>

      <View style={styles.scannerSection}>
        <Pressable
          onPress={() => navigation.navigate("FoodScanner")}
          style={({ pressed }) => [styles.scannerCard, pressed && { opacity: 0.92 }]}
        >
          <ImageBackground
            source={require("../../assets/images/food/plate-hero.png")}
            style={styles.scannerImage}
            imageStyle={styles.scannerImageRadius}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(13,10,20,0.35)", "rgba(13,10,20,0.55)", "rgba(13,10,20,0.92)"]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.scannerContent}>
              <View style={styles.scannerIconCircle}>
                <Feather name="camera" size={22} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.scannerTitle}>Scan your meal</ThemedText>
                <ThemedText style={styles.scannerSubtitle}>
                  Get instant calories, macros & health score
                </ThemedText>
              </View>
              <View style={styles.scannerArrow}>
                <Feather name="arrow-right" size={18} color={Colors.white} />
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </View>

      <View style={styles.workoutsSection}>
        <View style={styles.workoutsHeader}>
          <ThemedText style={styles.sectionTitle}>{t("home.todaysWorkout")}</ThemedText>
          <Pressable>
            <ThemedText style={styles.detailsLink}>{t("common.viewAll")}</ThemedText>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.workoutsList}
        >
          {sampleWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onPress={() => handleWorkoutPress(workout.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.quoteSection}>
        <ThemedText style={styles.quote}>
          "Your only competition is who you were yesterday."
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  heroContainer: {
    height: 420,
    borderBottomLeftRadius: BorderRadius["2xl"],
    borderBottomRightRadius: BorderRadius["2xl"],
    overflow: "hidden",
  },
  heroImage: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: Spacing["2xl"],
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.accentPink,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  playButton: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
    opacity: 0.6,
  },
  playButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.white40,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["4xl"],
  },
  greeting: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.white,
    lineHeight: 42,
    marginBottom: Spacing.md,
  },
  badges: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  badgePrimary: {
    backgroundColor: Colors.primary,
  },
  badgeSecondary: {
    backgroundColor: Colors.white10,
    borderWidth: 1,
    borderColor: Colors.white10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  progressSection: {
    paddingHorizontal: Spacing["2xl"],
    marginTop: -Spacing["3xl"],
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  detailsLink: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.accentPink,
  },
  progressRings: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  ringContainer: {
    alignItems: "center",
    flex: 1,
  },
  ringValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.white40,
    textTransform: "uppercase",
  },
  durationValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
  },
  durationUnit: {
    fontSize: 9,
    color: Colors.white40,
  },
  chartSection: {
    paddingHorizontal: Spacing["2xl"],
    marginTop: Spacing["3xl"],
  },
  chartCard: {
    marginTop: Spacing.lg,
  },
  scannerSection: {
    paddingHorizontal: Spacing["2xl"],
    marginTop: Spacing["2xl"],
  },
  scannerCard: {
    height: 130,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.primaryGlow,
  },
  scannerImage: {
    flex: 1,
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  scannerImageRadius: {
    borderRadius: BorderRadius.xl,
  },
  scannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scannerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  scannerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 1,
  },
  scannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  scannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.white,
  },
  scannerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
    marginTop: 2,
  },
  scannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutsSection: {
    marginTop: Spacing["3xl"],
  },
  workoutsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  workoutsList: {
    paddingLeft: Spacing["2xl"],
    paddingRight: Spacing.lg,
  },
  quoteSection: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing["3xl"],
    alignItems: "center",
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.white40,
    textAlign: "center",
  },
});
