import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { CircularProgress } from "@/components/CircularProgress";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  storage,
  sampleDailyMetrics,
  sampleMilestones,
  Milestone,
} from "@/lib/storage";

const PERIODS = ["Week", "Month", "Year"];

export default function StatsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [selectedPeriod, setSelectedPeriod] = useState("Week");
  const [milestones, setMilestones] = useState<Milestone[]>(sampleMilestones);
  const metrics = sampleDailyMetrics;

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    const data = await storage.getMilestones();
    if (data.length > 0) setMilestones(data);
  };

  const weeklyCalories = [520, 680, 450, 720, 580, 650, 540];
  const weeklyDurations = [25, 45, 20, 55, 35, 42, 28];
  const avgHeartRate = metrics.heartRateAvg;
  const totalCalories = weeklyCalories.reduce((a, b) => a + b, 0);
  const totalDuration = weeklyDurations.reduce((a, b) => a + b, 0);
  const avgSleep = metrics.sleepHours;

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
        <ThemedText style={styles.title}>My Progress</ThemedText>
        <ThemedText style={styles.subtitle}>Track your fitness journey</ThemedText>
      </View>

      <View style={styles.periodSelector}>
        {PERIODS.map((period) => (
          <Pressable
            key={period}
            onPress={() => setSelectedPeriod(period)}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
          >
            <ThemedText
              style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive,
              ]}
            >
              {period}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.summaryCards}>
        <GlassCard style={styles.summaryCard}>
          <Feather name="zap" size={24} color={Colors.primary} />
          <ThemedText style={styles.summaryValue}>{totalCalories}</ThemedText>
          <ThemedText style={styles.summaryLabel}>Calories Burned</ThemedText>
        </GlassCard>
        <GlassCard style={styles.summaryCard}>
          <Feather name="clock" size={24} color={Colors.success} />
          <ThemedText style={styles.summaryValue}>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</ThemedText>
          <ThemedText style={styles.summaryLabel}>Total Workout</ThemedText>
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Calories Burned</ThemedText>
        <GlassCard>
          <BarChart data={weeklyCalories} color={Colors.primary} />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Health Metrics</ThemedText>
        <View style={styles.metricsRow}>
          <GlassCard style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Feather name="heart" size={20} color={Colors.error} />
              <ThemedText style={styles.metricLabel}>Heart Rate</ThemedText>
            </View>
            <CircularProgress
              size={100}
              strokeWidth={8}
              progress={(avgHeartRate / 180) * 100}
              color={Colors.error}
            >
              <ThemedText style={styles.metricValue}>{avgHeartRate}</ThemedText>
              <ThemedText style={styles.metricUnit}>bpm</ThemedText>
            </CircularProgress>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Feather name="moon" size={20} color={Colors.purple} />
              <ThemedText style={styles.metricLabel}>Sleep</ThemedText>
            </View>
            <CircularProgress
              size={100}
              strokeWidth={8}
              progress={(avgSleep / 8) * 100}
              color={Colors.purple}
            >
              <ThemedText style={styles.metricValue}>{avgSleep.toFixed(1)}</ThemedText>
              <ThemedText style={styles.metricUnit}>hrs</ThemedText>
            </CircularProgress>
          </GlassCard>
        </View>

        <GlassCard style={styles.hydrationCard}>
          <View style={styles.hydrationHeader}>
            <View style={styles.metricHeader}>
              <Feather name="droplet" size={20} color={Colors.info} />
              <ThemedText style={styles.metricLabel}>Hydration</ThemedText>
            </View>
            <ThemedText style={styles.hydrationGoal}>
              {metrics.hydrationOz} / 64 oz
            </ThemedText>
          </View>
          <View style={styles.hydrationBar}>
            <View
              style={[
                styles.hydrationFill,
                { width: `${(metrics.hydrationOz / 64) * 100}%` },
              ]}
            />
          </View>
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Milestones</ThemedText>
        <View style={styles.milestonesGrid}>
          {milestones.map((milestone) => (
            <View
              key={milestone.id}
              style={[
                styles.milestoneCard,
                milestone.achieved && styles.milestoneAchieved,
              ]}
            >
              <View
                style={[
                  styles.milestoneIcon,
                  milestone.achieved && styles.milestoneIconAchieved,
                ]}
              >
                <Feather
                  name={milestone.icon as any}
                  size={24}
                  color={milestone.achieved ? Colors.white : Colors.white40}
                />
              </View>
              <ThemedText
                style={[
                  styles.milestoneTitle,
                  milestone.achieved && styles.milestoneTitleAchieved,
                ]}
              >
                {milestone.title}
              </ThemedText>
              {milestone.achieved && (
                <Feather name="check-circle" size={16} color={Colors.success} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

interface BarChartProps {
  data: number[];
  color: string;
}

function BarChart({ data, color }: BarChartProps) {
  const chartWidth = 280;
  const chartHeight = 120;
  const barWidth = 28;
  const maxValue = Math.max(...data);
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={chartHeight + 30}>
        <Defs>
          <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </LinearGradient>
        </Defs>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * chartHeight;
          const x = (index / data.length) * chartWidth + (chartWidth / data.length - barWidth) / 2;
          const y = chartHeight - barHeight;

          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill="url(#barGradient)"
              />
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + 20}
                fill={Colors.white40}
                fontSize={11}
                fontWeight="600"
                textAnchor="middle"
              >
                {days[index]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
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
  periodSelector: {
    flexDirection: "row",
    marginHorizontal: Spacing["2xl"],
    backgroundColor: Colors.white05,
    borderRadius: BorderRadius.sm,
    padding: 4,
    marginBottom: Spacing["2xl"],
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white40,
  },
  periodTextActive: {
    color: Colors.white,
  },
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: Spacing["2xl"],
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.white,
    marginTop: Spacing.md,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.white40,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.white60,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.white,
  },
  metricUnit: {
    fontSize: 10,
    color: Colors.white40,
  },
  hydrationCard: {
    paddingVertical: Spacing.lg,
  },
  hydrationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  hydrationGoal: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  hydrationBar: {
    height: 12,
    backgroundColor: Colors.white10,
    borderRadius: 6,
    overflow: "hidden",
  },
  hydrationFill: {
    height: "100%",
    backgroundColor: Colors.info,
    borderRadius: 6,
  },
  milestonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  milestoneCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.white05,
  },
  milestoneAchieved: {
    borderColor: Colors.success + "40",
    backgroundColor: Colors.success + "10",
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneIconAchieved: {
    backgroundColor: Colors.primary,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white60,
  },
  milestoneTitleAchieved: {
    color: Colors.white,
  },
});
