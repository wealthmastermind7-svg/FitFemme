import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";

import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import WorkoutsStackNavigator from "@/navigation/WorkoutsStackNavigator";
import StatsStackNavigator from "@/navigation/StatsStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useLanguage } from "@/lib/i18n";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

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

// The center + button lives here so it can use hooks
function CenterButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sheetVisible, setSheetVisible] = useState(false);

  const showOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Start Workout", "Scan Food"],
          cancelButtonIndex: 0,
          tintColor: Colors.primary,
        },
        (idx) => {
          if (idx === 1) navigation.navigate("WorkoutPlayer");
          if (idx === 2) navigation.navigate("FoodScanner");
        }
      );
    } else {
      setSheetVisible(true);
    }
  };

  return (
    <>
      <Pressable style={styles.centerButton} onPress={showOptions}>
        <View style={styles.centerButtonInner}>
          <Feather name="plus" size={28} color={Colors.white} />
        </View>
      </Pressable>

      {/* Android action sheet */}
      {Platform.OS !== "ios" && (
        <Modal
          visible={sheetVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSheetVisible(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setSheetVisible(false)}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <ThemedText style={styles.sheetTitle}>What would you like to do?</ThemedText>

              <Pressable
                style={styles.sheetOption}
                onPress={() => {
                  setSheetVisible(false);
                  navigation.navigate("WorkoutPlayer");
                }}
              >
                <View style={[styles.sheetIcon, { backgroundColor: Colors.primary + "20" }]}>
                  <Feather name="activity" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.sheetOptionTitle}>Start Workout</ThemedText>
                  <ThemedText style={styles.sheetOptionSub}>Begin a guided training session</ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.white60} />
              </Pressable>

              <Pressable
                style={styles.sheetOption}
                onPress={() => {
                  setSheetVisible(false);
                  navigation.navigate("FoodScanner");
                }}
              >
                <View style={[styles.sheetIcon, { backgroundColor: "#4fc3f720" }]}>
                  <Feather name="camera" size={20} color="#4fc3f7" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.sheetOptionTitle}>Scan Food</ThemedText>
                  <ThemedText style={styles.sheetOptionSub}>Analyze nutrition from a photo</ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.white60} />
              </Pressable>

              <Pressable style={styles.cancelBtn} onPress={() => setSheetVisible(false)}>
                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

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
          title: t("nav.home"),
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutsStackNavigator}
        options={{
          title: t("nav.workouts"),
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
          tabBarButton: () => <CenterButton />,
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsStackNavigator}
        options={{
          title: t("nav.stats"),
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: t("nav.profile"),
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          // When the user taps the Profile tab, always send them to the
          // Profile root — never leave them deep inside a sub-screen
          // (e.g. Progress) that was reached via a deep-link from Home.
          tabPress: (e) => {
            const state = navigation.getState();
            const tab = state.routes.find((r: any) => r.name === "ProfileTab");
            if (tab?.state && (tab.state.index ?? 0) > 0) {
              e.preventDefault();
              (navigation as any).navigate("ProfileTab", { screen: "Profile" });
            }
          },
        })}
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
  // Android action sheet
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#2a1320",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 34,
    paddingTop: 14,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.white60,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  sheetIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetOptionTitle: { fontSize: 16, fontWeight: "600", color: Colors.white, marginBottom: 2 },
  sheetOptionSub: { fontSize: 12, color: Colors.white60 },
  cancelBtn: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 14,
  },
  cancelText: { fontSize: 15, color: Colors.white60, fontWeight: "500" },
});
