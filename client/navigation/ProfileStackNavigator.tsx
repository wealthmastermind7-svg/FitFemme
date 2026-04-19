import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import ProgressScreen from "@/screens/ProgressScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useLanguage } from "@/lib/i18n";

export type ProfileStackParamList = {
  Profile: undefined;
  Progress: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();
  const { t } = useLanguage();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          headerTitle: t("progress.title"),
          headerBackTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}
