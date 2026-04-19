/**
 * Shared widgets for the Cal AI–style onboarding flow.
 *
 * StepShell wraps every form step with the same chrome (back arrow,
 * thin progress bar, sticky bottom Continue button) so each step file
 * only has to render the step body.
 *
 * OptionCard is the standard "icon-circle + title + subtitle + radio"
 * row used on most multi-choice steps.
 *
 * WheelPicker is a vertical 3-row iOS-style picker built on FlatList
 * with snapToInterval — used for height/weight/birth date.
 */
import React, { ReactNode, useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

export const tap = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) => {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(style).catch(() => {});
  }
};

/* ------------------------------------------------------------------ */
/* StepShell                                                           */
/* ------------------------------------------------------------------ */

interface StepShellProps {
  progress: number; // 0..1
  onBack?: () => void;
  onContinue: () => void;
  canContinue: boolean;
  continueLabel?: string;
  hideContinue?: boolean;
  children: ReactNode;
  scrollable?: boolean;
}

export function StepShell({
  progress,
  onBack,
  onContinue,
  canContinue,
  continueLabel = "Continue",
  hideContinue,
  children,
  scrollable = true,
}: StepShellProps) {
  const insets = useSafeAreaInsets();

  const Body = scrollable ? (
    <KeyboardAwareScrollViewCompat
      contentContainerStyle={shellStyles.scroll}
      showsVerticalScrollIndicator={false}
      bottomOffset={180}
    >
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        exiting={FadeOut.duration(120)}
      >
        {children}
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  ) : (
    <View style={[shellStyles.scroll, { flex: 1 }]}>
      <Animated.View
        style={{ flex: 1 }}
        entering={FadeInDown.duration(280).springify()}
        exiting={FadeOut.duration(120)}
      >
        {children}
      </Animated.View>
    </View>
  );

  return (
    <View style={[shellStyles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={shellStyles.header}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={[shellStyles.backBtn, !onBack && { opacity: 0 }]}
          disabled={!onBack}
        >
          <Feather name="arrow-left" size={22} color={Colors.white} />
        </Pressable>
        <View style={shellStyles.progressTrack}>
          <View
            style={[
              shellStyles.progressFill,
              { width: `${Math.max(2, Math.min(100, progress * 100))}%` },
            ]}
          />
        </View>
      </View>

      {Body}

      {hideContinue ? null : (
        <View
          style={[
            shellStyles.footer,
            {
              paddingBottom: insets.bottom + Spacing.lg,
              marginBottom: Platform.OS === "ios" ? 0 : 0,
            },
          ]}
        >
          <Pressable
            disabled={!canContinue}
            onPress={onContinue}
            style={[
              shellStyles.continueBtn,
              !canContinue && shellStyles.continueBtnDisabled,
            ]}
          >
            <ThemedText style={shellStyles.continueText}>{continueLabel}</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: Spacing["2xl"] }}>
      <ThemedText style={shellStyles.title}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText style={shellStyles.subtitle}>{subtitle}</ThemedText>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* OptionCard                                                          */
/* ------------------------------------------------------------------ */

export interface OptionCardProps {
  icon?: keyof typeof Feather.glyphMap;
  iconNode?: ReactNode;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
  iconColor?: string;
  iconBg?: string;
}

export function OptionCard({
  icon,
  iconNode,
  title,
  subtitle,
  selected,
  onPress,
  multi,
  iconColor = Colors.white,
  iconBg,
}: OptionCardProps) {
  return (
    <Pressable
      onPress={() => {
        tap(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={[shellStyles.option, selected && shellStyles.optionActive]}
    >
      {(icon || iconNode) && (
        <View
          style={[
            shellStyles.optionIcon,
            iconBg ? { backgroundColor: iconBg } : null,
            selected && !iconBg
              ? { backgroundColor: "rgba(255,255,255,0.18)" }
              : null,
          ]}
        >
          {iconNode ?? (
            <Feather
              name={icon as keyof typeof Feather.glyphMap}
              size={20}
              color={iconColor}
            />
          )}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <ThemedText
          style={[shellStyles.optionTitle, selected && { color: Colors.white }]}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            style={[
              shellStyles.optionSub,
              selected && { color: "rgba(255,255,255,0.82)" },
            ]}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <View
        style={[
          multi ? shellStyles.checkbox : shellStyles.radio,
          selected && {
            borderColor: Colors.primary,
            backgroundColor: Colors.primary,
          },
        ]}
      >
        {selected ? (
          <Feather name="check" size={14} color={Colors.white} />
        ) : null}
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* WheelPicker                                                         */
/* ------------------------------------------------------------------ */

const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VISIBLE = 5; // odd so there's a centered row
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE;

interface WheelPickerProps<T extends string | number> {
  values: T[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
  format?: (v: T) => string;
  label?: string;
  containerStyle?: ViewStyle;
}

export function WheelPicker<T extends string | number>({
  values,
  selectedIndex,
  onChange,
  width = 110,
  format,
  label,
  containerStyle,
}: WheelPickerProps<T>) {
  // Defensively clamp the externally provided index — the parent may pass an
  // index that's no longer in range (e.g. after toggling units which swaps
  // the underlying value array). Without this, FlatList.scrollToOffset and
  // initialScrollIndex can throw "scrollToIndex out of range" or scroll the
  // wheel off-screen.
  const safeSelectedIndex = Math.max(
    0,
    Math.min(values.length - 1, selectedIndex),
  );
  const listRef = useRef<FlatList<T>>(null);
  const lastIndexRef = useRef(safeSelectedIndex);

  useEffect(() => {
    if (lastIndexRef.current !== safeSelectedIndex) {
      lastIndexRef.current = safeSelectedIndex;
      listRef.current?.scrollToOffset({
        offset: safeSelectedIndex * WHEEL_ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [safeSelectedIndex]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.round(y / WHEEL_ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      if (clamped !== lastIndexRef.current) {
        lastIndexRef.current = clamped;
        tap();
        onChange(clamped);
      }
    },
    [onChange, values.length],
  );

  return (
    <View style={[wheelStyles.col, containerStyle]}>
      {label ? <ThemedText style={wheelStyles.label}>{label}</ThemedText> : null}
      <View style={[wheelStyles.wheelWrap, { width }]}>
        <View pointerEvents="none" style={wheelStyles.selectionPill} />
        <FlatList
          ref={listRef}
          data={values}
          keyExtractor={(_, i) => String(i)}
          showsVerticalScrollIndicator={false}
          snapToInterval={WHEEL_ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScrollEnd}
          getItemLayout={(_, index) => ({
            length: WHEEL_ITEM_HEIGHT,
            offset: WHEEL_ITEM_HEIGHT * index,
            index,
          })}
          initialScrollIndex={selectedIndex}
          contentContainerStyle={{
            paddingVertical: WHEEL_ITEM_HEIGHT * Math.floor(WHEEL_VISIBLE / 2),
          }}
          renderItem={({ item, index }) => {
            const distance = Math.abs(index - lastIndexRef.current);
            const opacity = distance === 0 ? 1 : distance === 1 ? 0.55 : 0.25;
            const fontSize = distance === 0 ? 22 : 18;
            return (
              <View style={wheelStyles.row}>
                <ThemedText
                  style={{
                    fontSize,
                    color: Colors.white,
                    opacity,
                    fontWeight: distance === 0 ? "700" : "500",
                  }}
                >
                  {format ? format(item) : String(item)}
                </ThemedText>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const shellStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.white10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  scroll: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: 160,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    lineHeight: 34,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.white60,
    lineHeight: 21,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  optionSub: {
    fontSize: 13,
    color: Colors.white60,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.white40,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white40,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.md,
    backgroundColor: Colors.backgroundDark,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    gap: Spacing.sm,
  },
  continueBtnDisabled: {
    backgroundColor: Colors.white10,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});

const wheelStyles = StyleSheet.create({
  col: { alignItems: "center", justifyContent: "center" },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white80,
    marginBottom: Spacing.sm,
    letterSpacing: 0.4,
  },
  wheelWrap: {
    height: WHEEL_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  selectionPill: {
    position: "absolute",
    left: 4,
    right: 4,
    top: WHEEL_ITEM_HEIGHT * Math.floor(WHEEL_VISIBLE / 2),
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: 14,
    backgroundColor: Colors.white10,
    zIndex: 0,
  },
  row: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const WHEEL_HEIGHT_CONST = WHEEL_HEIGHT;
