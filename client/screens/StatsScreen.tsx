import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Svg, { Polygon, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";
import { storage, sampleWorkouts } from "@/lib/storage";

const muscleGroups = {
  "Full Body Burn": { Back: 15, Chest: 15, Arms: 15, Legs: 15, Core: 15 },
  "Glute Gains": { Back: 10, Chest: 5, Arms: 5, Legs: 40, Core: 10 },
  "Core Crusher": { Back: 10, Chest: 5, Arms: 5, Legs: 5, Core: 35 },
  "Cardio Queen": { Back: 15, Chest: 15, Arms: 15, Legs: 30, Core: 10 },
  "Flexibility Flow": { Back: 20, Chest: 20, Arms: 20, Legs: 20, Core: 20 },
  "No-Equipment Abs": { Back: 5, Chest: 5, Arms: 5, Legs: 5, Core: 40 },
};

export default function StatsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const [muscleData, setMuscleData] = useState({ Back: 0, Chest: 0, Arms: 0, Legs: 0, Core: 0 });

  useEffect(() => {
    calculateMuscleProgress();
  }, []);

  const calculateMuscleProgress = async () => {
    try {
      const dailyMetrics = await storage.getDailyMetrics();
      
      if (dailyMetrics && dailyMetrics.workoutsCompleted) {
        const newMuscleData = { Back: 0, Chest: 0, Arms: 0, Legs: 0, Core: 0 };
        
        dailyMetrics.workoutsCompleted.forEach((workoutId) => {
          const workout = sampleWorkouts.find(w => w.id === workoutId);
          if (workout && muscleGroups[workout.title as keyof typeof muscleGroups]) {
            const muscleContribution = muscleGroups[workout.title as keyof typeof muscleGroups];
            Object.keys(newMuscleData).forEach(muscle => {
              newMuscleData[muscle as keyof typeof newMuscleData] += 
                muscleContribution[muscle as keyof typeof muscleContribution] || 0;
            });
          }
        });
        
        setMuscleData(newMuscleData);
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
});
