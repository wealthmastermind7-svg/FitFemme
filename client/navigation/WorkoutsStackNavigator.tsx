import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WorkoutsScreen from "@/screens/WorkoutsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type WorkoutsStackParamList = {
  Workouts: undefined;
};

const Stack = createNativeStackNavigator<WorkoutsStackParamList>();

export default function WorkoutsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{
          headerTitle: "Workouts",
        }}
      />
    </Stack.Navigator>
  );
}
