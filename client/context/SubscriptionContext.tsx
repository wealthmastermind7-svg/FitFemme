import React, { createContext, useContext, useEffect, useState } from "react";
import { getSubscriptionStatus } from "@/lib/revenueCat";

interface SubscriptionContextType {
  isProSubscriber: boolean;
  loading: boolean;
  activeSubscriptions: string[];
  nonConsumables: string[];
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isProSubscriber, setIsProSubscriber] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);
  const [nonConsumables, setNonConsumables] = useState<string[]>([]);

  const refreshSubscription = async () => {
    setLoading(true);
    try {
      const result = await getSubscriptionStatus();
      setIsProSubscriber(result.isProSubscriber);
      setActiveSubscriptions(result.activeSubscriptions);
      setNonConsumables(result.nonConsumables);
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        isProSubscriber,
        loading,
        activeSubscriptions,
        nonConsumables,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within SubscriptionProvider"
    );
  }
  return context;
};
