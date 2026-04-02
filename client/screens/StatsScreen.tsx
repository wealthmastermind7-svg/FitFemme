import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Polygon, Text as SvgText } from "react-native-svg";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { useSubscription } from "@/lib/revenuecat";
import Paywall from "@/components/Paywall";

export default function StatsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { isSubscribed } = useSubscription();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [muscleData, setMuscleData] = useState({ Back: 0, Chest: 0, Arms: 0, Legs: 0, Core: 0 });

  useEffect(() => {
    calculateMuscleProgress();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      calculateMuscleProgress();
    }, [])
  );

  const calculateMuscleProgress = async () => {
    try {
      const completedExercises = await storage.getCompletedExercises();
      
      if (completedExercises && completedExercises.length > 0) {
        const newMuscleData: Record<string, number> = {
          Back: 0,
          Chest: 0,
          Arms: 0,
          Legs: 0,
          Core: 0,
        };
        
        // Count occurrences of each muscle group
        const muscleGroupCounts: Record<string, number> = {
          Back: 0,
          Chest: 0,
          Arms: 0,
          Legs: 0,
          Core: 0,
          Glutes: 0,
          Quads: 0,
          Hamstrings: 0,
          Shoulders: 0,
          Obliques: 0,
          "Lower Abs": 0,
          Hips: 0,
          Cardio: 0,
        };
        
        // Map other muscle groups to the pentagon's primary 5
        const muscleMapping: Record<string, string> = {
          Glutes: "Legs",
          Quads: "Legs",
          Hamstrings: "Legs",
          Shoulders: "Arms",
          Obliques: "Core",
          "Lower Abs": "Core",
          Abs: "Core",
          Hips: "Legs",
          Cardio: "Legs",
        };
        
        completedExercises.forEach((exercise) => {
          exercise.muscleGroups.forEach((muscle) => {
            muscleGroupCounts[muscle] = (muscleGroupCounts[muscle] || 0) + 1;
          });
        });
        
        // Aggregate counts to pentagon muscles
        Object.keys(muscleGroupCounts).forEach((muscle) => {
          const mappedMuscle = muscleMapping[muscle] || muscle;
          if (mappedMuscle in newMuscleData) {
            newMuscleData[mappedMuscle] += muscleGroupCounts[muscle];
          }
        });
        
        // Normalize to percentage scale (0-100)
        const total = Object.values(newMuscleData).reduce((a, b) => a + b, 0);
        if (total > 0) {
          Object.keys(newMuscleData).forEach((muscle) => {
            newMuscleData[muscle] = Math.round((newMuscleData[muscle] / total) * 100);
          });
        }
        
        setMuscleData(newMuscleData);
      } else {
        setMuscleData({ Back: 0, Chest: 0, Arms: 0, Legs: 0, Core: 0 });
      }
    } catch (error) {
      console.log("Error calculating muscle progress:", error);
    }
  };

  const labels = Object.keys(muscleData);
  const values = Object.values(muscleData);
  const numSides = 5;
  const center = 150;
  const radius = 100;

  const getPoint = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / numSides - Math.PI / 2;
    const scaledRadius = (value / 100) * radius;
    const x = center + scaledRadius * Math.cos(angle);
    const y = center + scaledRadius * Math.sin(angle);
    return { x, y };
  };

  const getGridPoint = (index: number, level: number) => {
    const angle = (index * 2 * Math.PI) / numSides - Math.PI / 2;
    const scaledRadius = (level / 100) * radius;
    const x = center + scaledRadius * Math.cos(angle);
    const y = center + scaledRadius * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = values
    .map((val, idx) => getPoint(idx, val))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  if (!isSubscribed) {
    return (
      <View
        style={[
          styles.container,
          styles.lockedContainer,
          { paddingTop: headerHeight + Spacing.xl, paddingBottom: tabBarHeight + Spacing.xl },
        ]}
      >
        <View style={styles.lockIcon}>
          <Feather name="lock" size={40} color={Colors.primary} />
        </View>
        <ThemedText style={styles.lockTitle}>Stats are a Pro Feature</ThemedText>
        <ThemedText style={styles.lockDescription}>
          Track your muscle distribution, progress, and workout streaks with a Pro subscription.
        </ThemedText>
        <Pressable style={styles.unlockButton} onPress={() => setPaywallVisible(true)}>
          <ThemedText style={styles.unlockButtonText}>Unlock Pro</ThemedText>
        </Pressable>
        <Paywall isVisible={paywallVisible} onClose={() => setPaywallVisible(false)} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Muscle Distribution</ThemedText>
        <ThemedText style={styles.subtitle}>Workout focus areas</ThemedText>
      </View>

      <View style={styles.chartCard}>
        <Svg width={300} height={340}>
          {[20, 40, 60, 80, 100].map((level) => {
            const gridPoints = Array.from({ length: numSides }, (_, i) =>
              getGridPoint(i, level)
            )
              .map((p) => `${p.x},${p.y}`)
              .join(" ");
            return (
              <Polygon
                key={`grid-${level}`}
                points={gridPoints}
                fill="none"
                stroke={Colors.white10}
                strokeWidth="1"
              />
            );
          })}

          <Polygon
            points={polygonPoints}
            fill={Colors.primary + "30"}
            stroke={Colors.primary}
            strokeWidth="2.5"
          />

          {labels.map((label, idx) => {
            const point = getPoint(idx, 110);
            return (
              <SvgText
                key={`label-${idx}`}
                x={point.x}
                y={point.y}
                fontSize="16"
                fill={Colors.white60}
                textAnchor="middle"
                fontWeight="600"
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>

        <ThemedText style={styles.emptyState}>
          NO WORKOUTS TRACKED YET THIS MONTH
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
  chartCard: {
    marginHorizontal: Spacing["2xl"],
    backgroundColor: Colors.backgroundLight,
    borderRadius: 24,
    padding: Spacing["2xl"],
    borderWidth: 1,
    borderColor: Colors.white05,
    alignItems: "center",
  },
  emptyState: {
    fontSize: 13,
    color: Colors.white40,
    textAlign: "center",
    marginTop: Spacing.xl,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(212,17,115,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  lockDescription: {
    fontSize: 15,
    color: Colors.white60,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing["2xl"],
  },
  unlockButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.md,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});
