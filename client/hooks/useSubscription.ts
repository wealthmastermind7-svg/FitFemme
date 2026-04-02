import { useEffect, useState, useCallback } from "react";
import { getSubscriptionStatus } from "@/lib/revenueCat";
import { useFocusEffect } from "@react-navigation/native";

interface SubscriptionStatus {
  isProSubscriber: boolean;
  activeSubscriptions: string[];
  nonConsumables: string[];
  expirationDates: Record<string, string>;
  loading: boolean;
}

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isProSubscriber: false,
    activeSubscriptions: [],
    nonConsumables: [],
    expirationDates: {},
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    const result = await getSubscriptionStatus();
    setStatus({
      isProSubscriber: result.isProSubscriber,
      activeSubscriptions: result.activeSubscriptions,
      nonConsumables: result.nonConsumables,
      expirationDates: result.expirationDates,
      loading: false,
    });
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkSubscription();
    }, [checkSubscription])
  );

  return { ...status, checkSubscription };
};
