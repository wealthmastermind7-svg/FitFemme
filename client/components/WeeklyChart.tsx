import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface WeeklyChartProps {
  data: number[];
  activeDay?: number;
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyChart({ data, activeDay = 3 }: WeeklyChartProps) {
  const chartWidth = 300;
  const chartHeight = 100;
  const padding = 10;

  const maxValue = Math.max(...data, 1);
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);
    return { x, y };
  });

  const createPath = () => {
    if (points.length === 0) return "";

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const createAreaPath = () => {
    const linePath = createPath();
    if (!linePath) return "";
    return `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
  };

  const activePoint = points[activeDay];

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Path d={createAreaPath()} fill="url(#areaGradient)" />

        <Path
          d={createPath()}
          stroke={Colors.primary}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />

        {activePoint ? (
          <Circle
            cx={activePoint.x}
            cy={activePoint.y}
            r={6}
            fill={Colors.white}
            stroke={Colors.primary}
            strokeWidth={2}
          />
        ) : null}
      </Svg>

      <View style={styles.daysContainer}>
        {DAYS.map((day, index) => (
          <ThemedText
            key={index}
            style={[
              styles.dayText,
              index === activeDay && styles.dayTextActive,
            ]}
          >
            {day}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.md,
  },
  dayText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.white40,
    textAlign: "center",
    width: 20,
  },
  dayTextActive: {
    color: Colors.white,
  },
});
