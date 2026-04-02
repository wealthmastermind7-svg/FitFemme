import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useSubscriptionContext } from "@/context/SubscriptionContext";
import Paywall from "@/components/Paywall";

interface PaywallTriggerScreenProps {
  children: React.ReactNode;
  triggerType: "workout_completed" | "locked_workout" | "stats_view";
}

export default function PaywallTriggerScreen({
  children,
  triggerType,
}: PaywallTriggerScreenProps) {
  const [paywallVisible, setPaywallVisible] = useState(false);
  const { isProSubscriber } = useSubscriptionContext();

  useFocusEffect(
    React.useCallback(() => {
      // Show paywall when navigating to this screen if user is not pro
      if (!isProSubscriber && triggerType === "stats_view") {
        setPaywallVisible(true);
      }
    }, [isProSubscriber, triggerType])
  );

  const showPaywall = () => {
    if (!isProSubscriber) {
      setPaywallVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {children}
      <Paywall
        isVisible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { showPaywall };
