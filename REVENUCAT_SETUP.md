# RevenueCat Integration Setup Guide

This guide explains how to set up and configure RevenueCat for in-app purchases in Fit Femme.

## Overview

Fit Femme uses RevenueCat to manage three subscription tiers:

1. **Monthly Pro** - $1.99/month (recurring)
2. **Annual Pro** - $14.99/year (~$3.33/month, saves 37%)
3. **Lifetime Pro** - $49.99 one-time purchase

## Installation

First, install the RevenueCat React Native package:

```bash
npm install react-native-purchases
```

## Setup Steps

### Step 1: Create RevenueCat Account

1. Go to [revenuecatsettings.com](https://www.revenuecat.com/)
2. Sign up for a free account
3. Create a new app project

### Step 2: Get Your API Keys

After creating your app:

1. Go to **Project Settings** → **API Keys**
2. Copy your:
   - **iOS API Key** (App Store Connect API key)
   - **Android API Key** (Google Play API key)

### Step 3: Add API Keys to Code

Update `client/lib/revenueCat.ts`:

```typescript
// In the initRevenueCat function, replace:
const iosApiKey = "appl_YOUR_REVENUECAT_IOS_API_KEY";
const androidApiKey = "goog_YOUR_REVENUECAT_ANDROID_API_KEY";

// With your actual keys:
const iosApiKey = "appl_abc123xyz...";
const androidApiKey = "goog_def456uvw...";
```

### Step 4: Configure App Store Connect

#### iOS Setup:

1. In RevenueCat dashboard, go to **App Store** settings
2. Add your App Store Connect credentials:
   - **Bundle ID**: `com.fitfemme.app`
   - **Shared Secret**: Get from App Store Connect → Keys → Shared Secret
3. Create three entitlements:
   - `pro_monthly` - Monthly subscription
   - `pro_annual` - Annual subscription
   - `pro_lifetime` - Lifetime purchase

#### Android Setup:

1. In RevenueCat dashboard, go to **Google Play** settings
2. Add your Google Play service account JSON
3. Create three in-app products:
   - `pro_monthly` - Monthly subscription ($1.99)
   - `pro_annual` - Annual subscription ($14.99)
   - `pro_lifetime` - Lifetime purchase ($49.99)

### Step 5: Create Offerings

In RevenueCat Dashboard:

1. Go to **Offerings**
2. Create a new offering called "default"
3. Add three packages:
   - Monthly (link to `pro_monthly`)
   - Annual (link to `pro_annual`)
   - Lifetime (link to `pro_lifetime`)

## Feature Implementation

### Current Features Included

✅ Subscription context provider
✅ RevenueCat integration hooks
✅ Paywall component with pricing display
✅ Feature gating for locked content
✅ Automatic subscription status checking
✅ Purchase flow with error handling

### How Feature Gating Works

#### Free Users Get:
- Access to 1 workout per day (Full Body Burn only)
- No progress tracking
- No workout history
- No streak system
- No custom workout builder

#### Pro Users Get:
- Unlimited workouts
- Full workout library (all 6 workouts unlocked)
- Full progress tracking (Stats screen)
- Workout history
- Streak system and calendar
- Custom workout builder
- No ads

### Paywall Trigger Points

The paywall automatically shows when users:

1. **Try to start a locked workout** - Shows paywall from WorkoutsScreen
2. **View Stats** - Partially locked stats with upgrade prompt
3. **Attempt custom workout builder** - Locked feature
4. **Completes workout** - Optional completion paywall (can be added)

## Code Integration Points

### Using Subscription Status

```typescript
import { useSubscriptionContext } from "@/context/SubscriptionContext";

function MyComponent() {
  const { isProSubscriber, loading } = useSubscriptionContext();
  
  if (loading) return <LoadingSpinner />;
  
  if (isProSubscriber) {
    return <ProFeature />;
  }
  
  return <FreeFeature />;
}
```

### Feature Gating

```typescript
import { isWorkoutLocked, isWorkoutLocked } from "@/lib/featureGating";

const handleWorkoutPress = (workoutId: string) => {
  if (isWorkoutLocked(workoutId, isProSubscriber)) {
    showPaywall();
  } else {
    startWorkout();
  }
};
```

### Triggering Purchase Flow

```typescript
import { purchasePackage } from "@/lib/revenueCat";

const handlePurchase = async (package: any) => {
  const result = await purchasePackage(package);
  if (result.success) {
    await refreshSubscription();
  }
};
```

## Testing

### iOS Testing

1. Use Xcode's local testing environment
2. Set up TestFlight for beta testing
3. Add test users in App Store Connect

### Android Testing

1. Use Google Play Console's internal testing track
2. Add test devices in Google Play
3. Test with real Google Play account

## Common Issues & Solutions

### Issue: Paywall showing empty packages

**Solution:**
- Ensure offerings are created in RevenueCat dashboard
- Verify API keys are correct
- Check that entitlements are linked to offerings

### Issue: Purchases not being recognized

**Solution:**
- Verify in-app product IDs match exactly
- Check that receipt validation is working
- Review RevenueCat logs for errors

### Issue: User remains free after purchase

**Solution:**
- Call `refreshSubscription()` after purchase
- Verify entitlement is assigned in RevenueCat
- Check app's entitlement configuration

## Pricing Strategy Explained

### Monthly ($1.99)
- **Purpose**: Low-friction entry point
- **Psychology**: Impulse buy, easy to try
- **Messaging**: "Try Pro"

### Annual ($14.99)
- **Purpose**: Best value, highest conversion
- **Psychology**: Locks in user commitment
- **Savings**: 37% vs monthly (~$3.33/month)
- **Messaging**: "Most Popular"

### Lifetime ($49.99)
- **Purpose**: High LTV, permanent unlock
- **Psychology**: One-time big purchase
- **Messaging**: "Best Value"

## Conversion Optimization

To maximize conversions:

1. **Show locked content prominently** - Users see what they're missing
2. **Use value messaging** - Highlight benefits, not just price
3. **Test paywall variants** - Try different messaging/designs
4. **Time paywall triggers** - Show after positive experience
5. **Respect user journey** - Don't show too early

## Analytics

RevenueCat automatically tracks:

- Conversion rates
- Churn rates
- Revenue per user
- Refund rates
- Platform breakdown (iOS vs Android)

Access analytics in RevenueCat dashboard under **Analytics**.

## Deployment Checklist

Before submitting to App Store:

- [ ] API keys configured correctly
- [ ] Offerings created and linked
- [ ] In-app products created and priced
- [ ] TestFlight testing completed
- [ ] Paywall copy reviewed and approved
- [ ] Feature gating logic tested
- [ ] Purchase flow tested end-to-end
- [ ] Restore purchases working
- [ ] Error handling in place
- [ ] Analytics events firing

## Support

For RevenueCat support:
- Documentation: https://docs.revenuecat.com/
- Dashboard: https://app.revenuecat.com/
- Community: Discord channel in RevenueCat

## Next Steps

1. Create RevenueCat account
2. Get iOS and Android API keys
3. Update `client/lib/revenueCat.ts` with your keys
4. Create in-app products in App Store Connect & Google Play
5. Create offerings in RevenueCat
6. Test with TestFlight / Google Play Console
7. Deploy to production
