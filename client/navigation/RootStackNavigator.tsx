import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import WorkoutPreviewScreen from "@/screens/WorkoutPreviewScreen";
import WorkoutPlayerScreen from "@/screens/WorkoutPlayerScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WorkoutPreview: { workoutId?: string } | undefined;
  WorkoutPlayer: { workoutId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem("@hasOnboarded");
      setHasOnboarded(value === "true");
    } catch (error) {
      console.log("Error checking onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator 
      screenOptions={{
        ...screenOptions,
        contentStyle: { backgroundColor: Colors.backgroundDark },
      }}
      initialRouteName={hasOnboarded ? "Main" : "Onboarding"}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkoutPreview"
        component={WorkoutPreviewScreen}
        options={{
          presentation: "modal",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="WorkoutPlayer"
        component={WorkoutPlayerScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}
