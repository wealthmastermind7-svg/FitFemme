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
import { useSubscription } from "@/lib/revenuecat";
import Paywall from "@/components/Paywall";
import { useLanguage, Language } from "@/lib/i18n";

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

  const { isSubscribed, customerInfo } = useSubscription();
  const { language, setLanguage, t } = useLanguage();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(sampleUserProfile);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [units, setUnits] = useState("Imperial");

  // Modal states
  const [personalInfoModalVisible, setPersonalInfoModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [unitsModalVisible, setUnitsModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalContent, setLegalContent] = useState<"privacy" | "terms">("privacy");

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editDurationGoal, setEditDurationGoal] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await storage.getUserProfile();
    if (data) {
      setProfile(data);
      setEditName(data.name || "");
      setEditAge(data.age ? data.age.toString() : "");
      setEditWeight(data.weight ? data.weight.toString() : "");
      setEditDurationGoal(data.durationGoal ? data.durationGoal.toString() : "");
      if (data.units) {
        setUnits(data.units);
      }
    }
  };

  const handleSavePersonalInfo = async () => {
    const updated = {
      ...profile,
      name: editName,
      age: parseInt(editAge) || profile.age,
      weight: parseFloat(editWeight) || profile.weight,
      units: units, // Preserve units when saving personal info
    };
    setProfile(updated);
    await storage.saveUserProfile(updated);
    setPersonalInfoModalVisible(false);
  };

  const handleSaveGoals = async () => {
    const updated = {
      ...profile,
      durationGoal: parseInt(editDurationGoal) || profile.durationGoal,
      units: units, // Preserve units when saving goals
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
      case "language":
        setLanguageModalVisible(true);
        break;
    }
  };

  const handleSupportPress = (id: string) => {
    switch (id) {
      case "help":
        Alert.alert("Help Center", "Visit our help center for tutorials and FAQs.");
        break;
      case "feedback":
        Alert.alert("Send Feedback", "Thank you for helping us improve Fit Femme!");
        break;
      case "privacy":
        setLegalContent("privacy");
        setLegalModalVisible(true);
        break;
      case "terms":
        setLegalContent("terms");
        setLegalModalVisible(true);
        break;
    }
  };


  const handleToggle = (id: string) => {
    switch (id) {
      case "notifications":
        setNotificationsEnabled(!notificationsEnabled);
        break;
      case "vibration":
        setVibrationEnabled(!vibrationEnabled);
        break;
    }
  };

  const accountSettings: SettingItem[] = [
    { id: "personal", icon: "user", title: t("profile.personalInfo"), type: "link" },
    { id: "goals", icon: "target", title: t("profile.goals"), type: "link" },
    { id: "units", icon: "sliders", title: t("profile.units"), type: "value", value: units },
  ];

  const appSettings: SettingItem[] = [
    { id: "notifications", icon: "bell", title: t("profile.notifications"), type: "toggle", value: notificationsEnabled },
    { id: "vibration", icon: "smartphone", title: t("profile.vibration"), type: "toggle", value: vibrationEnabled },
    { id: "language", icon: "globe", title: t("profile.language"), type: "value", value: language === "en" ? "English" : language === "es" ? "Español" : "Português" },
  ];

  const supportSettings: SettingItem[] = [
    { id: "help", icon: "help-circle", title: t("profile.support"), type: "link" },
    { id: "feedback", icon: "message-square", title: t("profile.contact"), type: "link" },
    { id: "privacy", icon: "shield", title: t("profile.privacyPolicy"), type: "link" },
    { id: "terms", icon: "file-text", title: t("profile.termsOfService"), type: "link" },
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
          } else if (item.id === "language") {
            setLanguageModalVisible(true);
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
        <ThemedText style={styles.profileSubtitle}>{t("profile.title")}</ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{profile.durationGoal}</ThemedText>
            <ThemedText style={styles.statLabel}>Min Goal</ThemedText>
          </View>
        </View>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t("profile.subscription")}</ThemedText>
        {isSubscribed ? (
          <GlassCard style={styles.subscriptionCard}>
            <LinearGradient
              colors={["rgba(212,17,115,0.2)", "transparent"]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.subscriptionActive}>
              <View style={styles.subscriptionActiveBadge}>
                <Feather name="award" size={16} color={Colors.primary} />
                <ThemedText style={styles.subscriptionActiveTitle}>{t("profile.proMember")}</ThemedText>
              </View>
              <ThemedText style={styles.subscriptionActiveText}>
                {t("profile.proAccess")}
              </ThemedText>
              <ThemedText style={styles.subscriptionManageText}>
                {t("profile.manageSubscription")}
              </ThemedText>
            </View>
          </GlassCard>
        ) : (
          <Pressable onPress={() => setPaywallVisible(true)}>
            <GlassCard style={styles.subscriptionCard}>
              <LinearGradient
                colors={["rgba(212,17,115,0.15)", "transparent"]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.subscriptionUpgrade}>
                <View style={styles.subscriptionUpgradeLeft}>
                  <ThemedText style={styles.subscriptionUpgradeTitle}>{t("profile.upgradeToPro")}</ThemedText>
                  <ThemedText style={styles.subscriptionUpgradeText}>
                    {t("profile.unlockFeatures")}
                  </ThemedText>
                </View>
                <View style={styles.subscriptionUpgradeButton}>
                  <ThemedText style={styles.subscriptionUpgradeButtonText}>{t("profile.viewPlans")}</ThemedText>
                </View>
              </View>
            </GlassCard>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t("profile.account")}</ThemedText>
        <GlassCard style={styles.settingsCard}>
          {accountSettings.map((item) => renderSettingItem(item, true, false))}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t("profile.appSettings")}</ThemedText>
        <GlassCard style={styles.settingsCard}>
          {appSettings.map((item) => renderSettingItem({ ...item, value: 
            item.id === "notifications" ? notificationsEnabled :
            item.id === "vibration" ? vibrationEnabled :
            language === "en" ? "English" : language === "es" ? "Español" : "Português"
          }, false, false))}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t("profile.support")}</ThemedText>
        <GlassCard style={styles.settingsCard}>
          {supportSettings.map((item) => renderSettingItem(item, false, true))}
        </GlassCard>
      </View>

      <Paywall isVisible={paywallVisible} onClose={() => setPaywallVisible(false)} />

      {/* Personal Info Modal */}
      <Modal visible={personalInfoModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t("profile.personalInfo")}</ThemedText>
              <Pressable onPress={() => setPersonalInfoModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.white} />
              </Pressable>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>{t("profile.name")}</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={Colors.white40}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>{t("profile.age")}</ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("profile.age")}
                placeholderTextColor={Colors.white40}
                keyboardType="numeric"
                value={editAge}
                onChangeText={setEditAge}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>{t("profile.weight")} ({units === "Metric" ? "kg" : "lbs"})</ThemedText>
              <TextInput
                style={styles.input}
                placeholder={units === "Metric" ? "65" : "140"}
                placeholderTextColor={Colors.white40}
                keyboardType="decimal-pad"
                value={editWeight}
                onChangeText={setEditWeight}
              />
            </View>

            <Pressable style={styles.saveButton} onPress={handleSavePersonalInfo}>
              <ThemedText style={styles.saveButtonText}>{t("common.save")}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Goals Modal */}
      <Modal visible={goalsModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t("profile.fitnessGoals")}</ThemedText>
              <Pressable onPress={() => setGoalsModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.white} />
              </Pressable>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>{t("profile.workoutDuration")}</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="45"
                placeholderTextColor={Colors.white40}
                keyboardType="numeric"
                value={editDurationGoal}
                onChangeText={setEditDurationGoal}
              />
            </View>
            
            <Pressable style={styles.saveButton} onPress={handleSaveGoals}>
              <ThemedText style={styles.saveButtonText}>{t("common.save")}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Units Modal */}
      <Modal visible={unitsModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t("profile.unitsAndMeasurements")}</ThemedText>
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

      {/* Language Modal */}
      <Modal visible={languageModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t("profile.language")}</ThemedText>
              <Pressable onPress={() => setLanguageModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.white} />
              </Pressable>
            </View>
            {(["en", "es", "pt"] as Language[]).map((lang) => (
              <Pressable
                key={lang}
                style={[styles.unitOption, language === lang && styles.unitOptionSelected]}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageModalVisible(false);
                }}
              >
                <ThemedText style={[styles.unitOptionText, language === lang && styles.unitOptionTextSelected]}>
                  {lang === "en" ? "English" : lang === "es" ? "Español" : "Português"}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Legal Modal */}
      <Modal visible={legalModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {legalContent === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </ThemedText>
              <Pressable onPress={() => setLegalModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.white} />
              </Pressable>
            </View>
            <ScrollView style={styles.legalContent} showsVerticalScrollIndicator={false}>
              <ThemedText style={styles.legalText}>
                {legalContent === "privacy" ? t("legal.privacyPolicy") : t("legal.termsOfService")}
              </ThemedText>
            </ScrollView>
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
  legalContent: {
    maxHeight: 400,
    marginBottom: Spacing.lg,
  },
  legalText: {
    fontSize: 13,
    color: Colors.white60,
    lineHeight: 20,
  },
  subscriptionCard: {
    overflow: "hidden",
    padding: Spacing.lg,
  },
  subscriptionActive: {
    gap: Spacing.sm,
  },
  subscriptionActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  subscriptionActiveTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  subscriptionActiveText: {
    fontSize: 14,
    color: Colors.white,
  },
  subscriptionManageText: {
    fontSize: 12,
    color: Colors.white60,
    marginTop: Spacing.xs,
  },
  subscriptionUpgrade: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  subscriptionUpgradeLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  subscriptionUpgradeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
  },
  subscriptionUpgradeText: {
    fontSize: 13,
    color: Colors.white60,
  },
  subscriptionUpgradeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  subscriptionUpgradeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
});
