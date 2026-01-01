import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch, Modal, TextInput, Alert } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage, UserProfile, sampleUserProfile } from "@/lib/storage";

interface SettingItem {
  id: string;
  icon: string;
  title: string;
  type: "toggle" | "link" | "value";
  value?: string | boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [profile, setProfile] = useState<UserProfile>(sampleUserProfile);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [units, setUnits] = useState("Imperial");

  // Modal states
  const [personalInfoModalVisible, setPersonalInfoModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [unitsModalVisible, setUnitsModalVisible] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editCaloriesGoal, setEditCaloriesGoal] = useState("");
  const [editDurationGoal, setEditDurationGoal] = useState("");
  const [editStepsGoal, setEditStepsGoal] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await storage.getUserProfile();
    if (data) {
      setProfile(data);
      setEditName(data.name);
      setEditAge(data.age.toString());
      setEditWeight(data.weight.toString());
      setEditCaloriesGoal(data.caloriesGoal.toString());
      setEditDurationGoal(data.durationGoal.toString());
      setEditStepsGoal(data.stepsGoal.toString());
    }
  };

  const handleSavePersonalInfo = async () => {
    const updated = {
      ...profile,
      name: editName,
      age: parseInt(editAge) || profile.age,
      weight: parseFloat(editWeight) || profile.weight,
    };
    setProfile(updated);
    await storage.saveUserProfile(updated);
    setPersonalInfoModalVisible(false);
  };

  const handleSaveGoals = async () => {
    const updated = {
      ...profile,
      caloriesGoal: parseInt(editCaloriesGoal) || profile.caloriesGoal,
      durationGoal: parseInt(editDurationGoal) || profile.durationGoal,
      stepsGoal: parseInt(editStepsGoal) || profile.stepsGoal,
    };
    setProfile(updated);
    await storage.saveUserProfile(updated);
    setGoalsModalVisible(false);
  };

  const handleSaveUnits = async (newUnits: string) => {
    const updated = {
      ...profile,
      units: newUnits,
    };
    setUnits(newUnits);
    setProfile(updated);
    await storage.saveUserProfile(updated);
    setUnitsModalVisible(false);
  };

  const handleAccountSettingPress = (id: string) => {
    switch (id) {
      case "personal":
        setPersonalInfoModalVisible(true);
        break;
      case "goals":
        setGoalsModalVisible(true);
        break;
      case "units":
        setUnitsModalVisible(true);
        break;
    }
  };

  const handleSupportPress = async (id: string) => {
    switch (id) {
      case "help":
        await WebBrowser.openBrowserAsync("https://fitfemme.example.com/help");
        break;
      case "feedback":
        Alert.alert("Send Feedback", "Open email client to send feedback", [
          { text: "Cancel", onPress: () => {} },
          { text: "OK", onPress: () => {} },
        ]);
        break;
      case "privacy":
        await WebBrowser.openBrowserAsync("https://fitfemme.example.com/privacy");
        break;
      case "terms":
        await WebBrowser.openBrowserAsync("https://fitfemme.example.com/terms");
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Log Out",
        onPress: async () => {
          // Clear app data
          await storage.clearAllData();
          setProfile(sampleUserProfile);
        },
        style: "destructive",
      },
    ]);
  };

  const handleToggle = (id: string) => {
    switch (id) {
      case "notifications":
        setNotificationsEnabled(!notificationsEnabled);
        break;
      case "sounds":
        setSoundEnabled(!soundEnabled);
        break;
      case "vibration":
        setVibrationEnabled(!vibrationEnabled);
        break;
    }
  };

  const accountSettings: SettingItem[] = [
    { id: "personal", icon: "user", title: "Personal Info", type: "link" },
    { id: "goals", icon: "target", title: "Fitness Goals", type: "link" },
    { id: "units", icon: "sliders", title: "Units & Measurements", type: "value", value: units },
  ];

  const appSettings: SettingItem[] = [
    { id: "notifications", icon: "bell", title: "Notifications", type: "toggle", value: notificationsEnabled },
    { id: "sounds", icon: "volume-2", title: "Workout Sounds", type: "toggle", value: soundEnabled },
    { id: "vibration", icon: "smartphone", title: "Vibration", type: "toggle", value: vibrationEnabled },
  ];

  const supportSettings: SettingItem[] = [
    { id: "help", icon: "help-circle", title: "Help Center", type: "link" },
    { id: "feedback", icon: "message-square", title: "Send Feedback", type: "link" },
    { id: "privacy", icon: "shield", title: "Privacy Policy", type: "link" },
    { id: "terms", icon: "file-text", title: "Terms of Service", type: "link" },
  ];

  const renderSettingItem = (item: SettingItem, isAccountSetting = false, isSupportSetting = false) => (
    <Pressable
      key={item.id}
      style={styles.settingItem}
      onPress={() => {
        if (item.type === "toggle") {
          handleToggle(item.id);
        } else if (item.type === "link" || item.type === "value") {
          if (isAccountSetting) {
            handleAccountSettingPress(item.id);
          } else if (isSupportSetting) {
            handleSupportPress(item.id);
          }
        }
      }}
    >
      <View style={styles.settingIcon}>
        <Feather name={item.icon as any} size={20} color={Colors.white} />
      </View>
      <ThemedText style={styles.settingTitle}>{item.title}</ThemedText>
      {item.type === "toggle" ? (
        <Switch
          value={item.value as boolean}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{ false: Colors.white10, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      ) : item.type === "value" ? (
        <View style={styles.settingValueContainer}>
          <ThemedText style={styles.settingValue}>{item.value}</ThemedText>
          <Feather name="chevron-right" size={20} color={Colors.white40} />
        </View>
      ) : (
        <Feather name="chevron-right" size={20} color={Colors.white40} />
      )}
    </Pressable>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileSection}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.avatarGradient}
        >
          <ThemedText style={styles.avatarText}>
            {profile.name.charAt(0).toUpperCase()}
          </ThemedText>
        </LinearGradient>
        <ThemedText style={styles.profileName}>{profile.name}</ThemedText>
        <ThemedText style={styles.profileSubtitle}>Fit Femme Member</ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{profile.caloriesGoal}</ThemedText>
            <ThemedText style={styles.statLabel}>Cal Goal</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{profile.durationGoal}</ThemedText>
            <ThemedText style={styles.statLabel}>Min Goal</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{profile.stepsGoal / 1000}k</ThemedText>
            <ThemedText style={styles.statLabel}>Steps Goal</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <GlassCard style={styles.settingsCard}>
          {accountSettings.map((item) => renderSettingItem(item, true, false))}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>App Settings</ThemedText>
        <GlassCard style={styles.settingsCard}>
          {appSettings.map((item) => renderSettingItem({ ...item, value: 
            item.id === "notifications" ? notificationsEnabled :
            item.id === "sounds" ? soundEnabled :
            vibrationEnabled
          }, false, false))}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Support</ThemedText>
        <GlassCard style={styles.settingsCard}>
          {supportSettings.map((item) => renderSettingItem(item, false, true))}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={Colors.error} />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </Pressable>
      </View>

      {/* Personal Info Modal */}
      <Modal visible={personalInfoModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Personal Info</ThemedText>
              <Pressable onPress={() => setPersonalInfoModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.white} />
              </Pressable>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={Colors.white40}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Age</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor={Colors.white40}
                keyboardType="numeric"
                value={editAge}
                onChangeText={setEditAge}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Weight (lbs)</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Weight (lbs)"
                placeholderTextColor={Colors.white40}
                keyboardType="decimal-pad"
                value={editWeight}
                onChangeText={setEditWeight}
              />
            </View>

            <Pressable style={styles.saveButton} onPress={handleSavePersonalInfo}>
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Goals Modal */}
      <Modal visible={goalsModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Fitness Goals</ThemedText>
              <Pressable onPress={() => setGoalsModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.white} />
              </Pressable>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Daily Calories Goal</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="2000"
                placeholderTextColor={Colors.white40}
                keyboardType="numeric"
                value={editCaloriesGoal}
                onChangeText={setEditCaloriesGoal}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Daily Duration Goal (mins)</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="45"
                placeholderTextColor={Colors.white40}
                keyboardType="numeric"
                value={editDurationGoal}
                onChangeText={setEditDurationGoal}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Daily Steps Goal</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="10000"
                placeholderTextColor={Colors.white40}
                keyboardType="numeric"
                value={editStepsGoal}
                onChangeText={setEditStepsGoal}
              />
            </View>
            
            <Pressable style={styles.saveButton} onPress={handleSaveGoals}>
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Units Modal */}
      <Modal visible={unitsModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Units & Measurements</ThemedText>
              <Pressable onPress={() => setUnitsModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.white} />
              </Pressable>
            </View>
            {["Imperial", "Metric"].map((unit) => (
              <Pressable
                key={unit}
                style={[styles.unitOption, units === unit && styles.unitOptionSelected]}
                onPress={() => handleSaveUnits(unit)}
              >
                <ThemedText style={[styles.unitOptionText, units === unit && styles.unitOptionTextSelected]}>
                  {unit}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>Fit Femme v1.0.0</ThemedText>
        <ThemedText style={styles.footerText}>Made with love</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing["3xl"],
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryGlow,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "800",
    color: Colors.white,
  },
  profileName: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    marginTop: Spacing.lg,
  },
  profileSubtitle: {
    fontSize: 14,
    color: Colors.accentPink,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginTop: Spacing["2xl"],
    borderWidth: 1,
    borderColor: Colors.white05,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.white,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.white40,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.white10,
  },
  section: {
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white40,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  settingsCard: {
    paddingVertical: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.white,
  },
  settingValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.white40,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    backgroundColor: Colors.error + "10",
    borderWidth: 1,
    borderColor: Colors.error + "40",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: 12,
    color: Colors.white20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.backgroundDark,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
    borderTopWidth: 1,
    borderTopColor: Colors.white10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white60,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.white05,
    borderWidth: 1,
    borderColor: Colors.white10,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.white,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  unitOption: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white10,
  },
  unitOptionSelected: {
    backgroundColor: Colors.primary + "20",
    borderBottomColor: Colors.primary,
  },
  unitOptionText: {
    fontSize: 16,
    color: Colors.white60,
  },
  unitOptionTextSelected: {
    color: Colors.white,
    fontWeight: "600",
  },
});
