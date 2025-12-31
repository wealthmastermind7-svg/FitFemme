import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import WorkoutsStackNavigator from "@/navigation/WorkoutsStackNavigator";
import StatsStackNavigator from "@/navigation/StatsStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { Colors, Spacing, Shadows } from "@/constants/theme";

export type MainTabParamList = {
  HomeTab: undefined;
  WorkoutsTab: undefined;
  AddTab: undefined;
  StatsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function AddPlaceholder() {
  return null;
}

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.white60,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: "rgba(34, 16, 25, 0.95)",
            web: "rgba(34, 16, 25, 0.95)",
          }),
          borderTopWidth: 0,
          borderTopColor: Colors.white05,
          elevation: 0,
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(34, 16, 25, 0.85)" }]}
            />
          ) : null,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: -4,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutsStackNavigator}
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddPlaceholder}
        options={{
          title: "",
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={styles.centerButton}
            >
              <View style={styles.centerButtonInner}>
                <Feather name="plus" size={28} color={Colors.white} />
              </View>
            </Pressable>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("WorkoutPlayer");
          },
        })}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsStackNavigator}
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.primaryGlow,
  },
});
