import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await storage.getUserProfile();
    if (data) setProfile(data);
  };

  const accountSettings: SettingItem[] = [
    { id: "personal", icon: "user", title: "Personal Info", type: "link" },
    { id: "goals", icon: "target", title: "Fitness Goals", type: "link" },
    { id: "units", icon: "sliders", title: "Units & Measurements", type: "value", value: "Imperial" },
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

  const renderSettingItem = (item: SettingItem) => (
    <Pressable key={item.id} style={styles.settingItem}>
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
          {accountSettings.map(renderSettingItem)}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>App Settings</ThemedText>
        <GlassCard style={styles.settingsCard}>
          {appSettings.map((item) => renderSettingItem({ ...item, value: 
            item.id === "notifications" ? notificationsEnabled :
            item.id === "sounds" ? soundEnabled :
            vibrationEnabled
          }))}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Support</ThemedText>
        <GlassCard style={styles.settingsCard}>
          {supportSettings.map(renderSettingItem)}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.logoutButton}>
          <Feather name="log-out" size={20} color={Colors.error} />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </Pressable>
      </View>

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
});
