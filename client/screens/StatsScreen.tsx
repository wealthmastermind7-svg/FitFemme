import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage, sampleMilestones, Milestone } from "@/lib/storage";

export default function StatsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [milestones, setMilestones] = useState<Milestone[]>(sampleMilestones);
  const [expandedMilestones, setExpandedMilestones] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    const data = await storage.getMilestones();
    if (data.length > 0) setMilestones(data);
  };

  const visibleMilestones = expandedMilestones ? milestones : milestones.slice(0, 4);

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
        <ThemedText style={styles.title}>Achievements</ThemedText>
        <ThemedText style={styles.subtitle}>Track your milestones</ThemedText>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Milestones</ThemedText>
          <Pressable onPress={() => setExpandedMilestones(!expandedMilestones)}>
            <ThemedText style={styles.viewAllLink}>
              {expandedMilestones ? "Show less" : "View all"}
            </ThemedText>
          </Pressable>
        </View>
        <View style={styles.milestonesGrid}>
          {visibleMilestones.map((milestone) => (
            <Pressable
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
            </Pressable>
          ))}
        </View>
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
  section: {
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
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
