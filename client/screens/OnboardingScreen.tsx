import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title1: "DEFINE",
    title2: "YOUR",
    title3: "POWER",
    subtitle: "Fitness designed for your curves and your culture.",
    image: require("../../assets/images/onboarding/slide1.jpg"),
  },
  {
    id: 2,
    title1: "UNLEASH",
    title2: "THE",
    title3: "FYAH",
    subtitle: "High-intensity workouts that push your limits.",
    image: require("../../assets/images/onboarding/slide2.jpg"),
  },
  {
    id: 3,
    title1: "WELCOME",
    title2: "TO FIT",
    title3: "FEMME",
    subtitle: "Join the movement. Transform your body and mind.",
    image: require("../../assets/images/onboarding/slide3.jpg"),
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const buttonScale = useSharedValue(1);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const handleStart = async () => {
    try {
      await AsyncStorage.setItem("@hasOnboarded", "true");
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (error) {
      console.log("Error saving onboarding status:", error);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <ImageBackground
              source={slide.image}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.4)",
                  "rgba(34,16,25,0.2)",
                  "rgba(34,16,25,0.8)",
                  Colors.backgroundDark,
                ]}
                locations={[0, 0.3, 0.7, 1]}
                style={styles.gradient}
              />
              <View style={[styles.content, { paddingBottom: 160 + insets.bottom }]}>
                <View style={styles.titleContainer}>
                  <ThemedText style={styles.title}>{slide.title1}</ThemedText>
                  <ThemedText style={styles.title}>{slide.title2}</ThemedText>
                  <ThemedText style={[styles.title, styles.titleAccent]}>
                    {slide.title3}
                  </ThemedText>
                </View>
                <View style={styles.subtitleContainer}>
                  <View style={styles.subtitleAccent} />
                  <ThemedText style={styles.subtitle}>{slide.subtitle}</ThemedText>
                </View>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      <LinearGradient
        colors={["transparent", Colors.backgroundDark, Colors.backgroundDark]}
        locations={[0, 0.3, 1]}
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex ? styles.indicatorActive : styles.indicatorInactive,
              ]}
            />
          ))}
        </View>

        <AnimatedPressable
          onPress={handleStart}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.button, animatedButtonStyle]}
        >
          <View style={styles.buttonContent}>
            <ThemedText style={styles.buttonText}>Start Your Journey</ThemedText>
          </View>
          <View style={styles.buttonIcon}>
            <Feather name="arrow-right" size={24} color={Colors.white} />
          </View>
        </AnimatedPressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  slide: {
    width,
    height,
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: Spacing["3xl"],
  },
  titleContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 56,
    fontWeight: "900",
    color: Colors.white,
    lineHeight: 56,
    letterSpacing: -2,
  },
  titleAccent: {
    color: Colors.primary,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  subtitleAccent: {
    width: 2,
    height: 48,
    backgroundColor: Colors.primary,
    marginRight: Spacing.lg,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "300",
    color: Colors.white80,
    lineHeight: 26,
    flex: 1,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["4xl"],
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  indicatorInactive: {
    width: 8,
    backgroundColor: Colors.white20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 64,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    ...Shadows.primaryGlow,
  },
  buttonContent: {
    flex: 1,
    alignItems: "center",
    paddingLeft: 56,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  buttonIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
