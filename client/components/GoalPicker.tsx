import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { BodyGoal, GOAL_CONFIG } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";

interface GoalPickerProps {
  selectedGoal: BodyGoal | null;
  onSelect: (goal: BodyGoal) => void;
}

const GOAL_ORDER: BodyGoal[] = ["lean_toned", "booty_builder", "flat_stomach"];

const ICONS: Record<BodyGoal, keyof typeof Feather.glyphMap> = {
  lean_toned: "trending-down",
  booty_builder: "trending-up",
  flat_stomach: "minimize-2",
};

const DESC_KEYS: Record<BodyGoal, string> = {
  lean_toned: "goal.leanToned.desc",
  booty_builder: "goal.bootyBuilder.desc",
  flat_stomach: "goal.flatStomach.desc",
};

export default function GoalPicker({ selectedGoal, onSelect }: GoalPickerProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {GOAL_ORDER.map((goal) => {
        const cfg = GOAL_CONFIG[goal];
        const selected = selectedGoal === goal;
        return (
          <Pressable
            key={goal}
            onPress={() => onSelect(goal)}
            style={({ pressed }) => [
              styles.card,
              selected && { borderColor: cfg.color, borderWidth: 2 },
              pressed && { opacity: 0.85 },
            ]}
          >
            {selected && (
              <LinearGradient
                colors={[`${cfg.color}33`, "transparent"]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <View style={[styles.iconWrap, { backgroundColor: `${cfg.color}22` }]}>
              <Feather name={ICONS[goal]} size={22} color={cfg.color} />
            </View>
            <View style={styles.textWrap}>
              <ThemedText style={styles.title}>{t(cfg.titleKey)}</ThemedText>
              <ThemedText style={styles.desc}>{t(DESC_KEYS[goal])}</ThemedText>
            </View>
            <View
              style={[
                styles.radio,
                selected && { borderColor: cfg.color, backgroundColor: cfg.color },
              ]}
            >
              {selected ? <Feather name="check" size={14} color={Colors.white} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.white10,
    gap: Spacing.md,
    overflow: "hidden",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    color: Colors.white60,
    lineHeight: 18,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.white40,
    alignItems: "center",
    justifyContent: "center",
  },
});
