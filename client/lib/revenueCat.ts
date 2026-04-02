import Purchases from "react-native-purchases";

export const initRevenueCat = async () => {
  try {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    // iOS App Store Connect Key
    const iosApiKey = "appl_YOUR_REVENUECAT_IOS_API_KEY";
    // Google Play API Key
    const androidApiKey = "goog_YOUR_REVENUECAT_ANDROID_API_KEY";

    const apiKey = __DEV__
      ? iosApiKey // Use sandbox keys in development
      : iosApiKey;

    await Purchases.configure({
      apiKey: apiKey,
      appUserID: null, // RevenueCat will handle anonymous user ID
    });

    console.log("RevenueCat initialized");
  } catch (error) {
    console.error("RevenueCat initialization error:", error);
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return {
      isProSubscriber: customerInfo.activeSubscriptions.length > 0,
      activeSubscriptions: customerInfo.activeSubscriptions,
      nonConsumables: customerInfo.nonConsumables,
      expirationDates: customerInfo.expirationDateForActiveEntitlements,
    };
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return {
      isProSubscriber: false,
      activeSubscriptions: [],
      nonConsumables: [],
      expirationDates: {},
    };
  }
};

export const getAvailablePackages = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error) {
    console.error("Error getting packages:", error);
    return [];
  }
};

export const purchasePackage = async (pkg: any) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return {
      success: true,
      customerInfo,
      isProSubscriber: customerInfo.activeSubscriptions.length > 0,
    };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("User cancelled purchase");
      return { success: false, cancelled: true };
    }
    console.error("Purchase error:", error);
    return { success: false, error: error.message };
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restoreTransactions();
    return {
      success: true,
      customerInfo,
      isProSubscriber: customerInfo.activeSubscriptions.length > 0,
    };
  } catch (error) {
    console.error("Restore purchases error:", error);
    return { success: false, error: error };
  }
};
