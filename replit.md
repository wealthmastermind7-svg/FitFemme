# Fit Femme

## Overview

Fit Femme is a premium fitness mobile application designed for women, built with React Native and Expo. The app celebrates curves and culture with bold, empowering aesthetics featuring cinematic photography and a sophisticated dark theme. It provides workout tracking, progress monitoring, and personalized fitness experiences with a focus on visual polish and smooth animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54, using the new architecture (`newArchEnabled: true`) and React Compiler experimental features.

**Navigation**: React Navigation v7 with a nested stack/tab structure:
- Root Stack Navigator handles onboarding flow and main app entry
- Main Tab Navigator with 5 tabs (Home, Workouts, Add, Stats, Profile)
- Each tab has its own Stack Navigator for screen hierarchy

**State Management**: 
- TanStack Query for server state management
- Local component state with React hooks
- AsyncStorage for client-side persistence (onboarding status, user profiles, metrics)

**Animation**: React Native Reanimated for smooth, native-driven animations throughout the app (button press effects, card interactions, workout player controls).

**Styling Approach**: StyleSheet API with a centralized theme system in `client/constants/theme.ts`. The design follows a dark-mode-first approach with specific brand colors (primary pink #d41173, dark backgrounds #221019).

### Backend Architecture

**Server**: Express.js with TypeScript, serving as an API backend with CORS support for Replit domains.

**Database**: PostgreSQL with Drizzle ORM for type-safe database operations. Schema definitions live in `shared/schema.ts` with Zod validation via drizzle-zod.

**Storage Pattern**: Interface-based storage abstraction (`IStorage`) with in-memory implementation (`MemStorage`) that can be swapped for database-backed storage.

### Project Structure

```
client/           # React Native frontend
  components/     # Reusable UI components
  screens/        # Screen components
  navigation/     # React Navigation setup
  hooks/          # Custom React hooks
  lib/            # Utilities and API client
  constants/      # Theme and config values

server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer

shared/           # Shared between client/server
  schema.ts       # Drizzle schema and types

scripts/          # Build scripts for Expo web
```

### Key Design Patterns

1. **Path Aliases**: `@/` maps to `client/`, `@shared/` maps to `shared/` for clean imports
2. **Error Boundaries**: Class-based error boundary with development-mode error details
3. **Platform-specific code**: Conditional rendering for iOS blur effects vs Android/web fallbacks
4. **Keyboard handling**: Platform-aware keyboard scroll view component

## External Dependencies

### Core Platform
- **Expo SDK 54**: Managed workflow with native modules
- **React 19.1**: Latest React with concurrent features
- **React Native 0.81**: Core mobile framework

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe SQL query builder
- **drizzle-zod**: Schema validation integration

### UI Libraries
- **expo-blur**: iOS blur effects for glass-morphism
- **expo-linear-gradient**: Gradient backgrounds
- **expo-haptics**: Touch feedback
- **expo-image**: Optimized image loading
- **react-native-reanimated**: Animation library
- **react-native-gesture-handler**: Touch gestures
- **react-native-svg**: Vector graphics

### Data & State
- **@tanstack/react-query**: Server state management
- **@react-native-async-storage/async-storage**: Local persistence
- **zod**: Runtime type validation

### Development
- **tsx**: TypeScript execution for server
- **drizzle-kit**: Database migrations CLI
- **eslint-config-expo**: Linting rules
- **prettier**: Code formatting

## Monetization & Feature Tiers

### Free Plan
Users can access:
- **1 sample workout per day** - Full Body Burn only (for daily commitment without overwhelming)
- **Basic workout experience** - Exercise timers and GIF demonstrations
- **Limited progress** - Basic completion tracking
- **No advanced features** - No custom workouts, no detailed stats
- **Limited history** - Can't review past workouts

### Paid Plans (All Subscription Tiers Unlock the Same Features)
All three payment options unlock:
- **All 6 workouts unlocked** - Full Body Burn, Glute Gains, Core Crusher, Cardio Queen, Flexibility Flow, No-Equipment Abs
- **Unlimited daily workouts** - No daily restrictions
- **Full progress tracking** - Visual muscle distribution pentagon chart, detailed metrics
- **Workout history** - View all completed workouts with dates and performance
- **Streak system** - Track consecutive workout days with calendar visualization
- **Custom workout builder** - Create personalized routines
- **Advanced stats** - Comprehensive progress analytics and insights
- **Premium experience** - Priority feature access in future updates

### Three Subscription Tier Options

All three tier options unlock the **same premium features**. The difference is pricing and commitment:

1. **Monthly Pro - $1.99/month**
   - Recurring monthly charge
   - Best for: Testing the premium experience
   - **Value**: Entry-level price point for users to try
   - Easiest to cancel if unsatisfied

2. **Annual Pro - $14.99/year** ⭐ **Most Popular**
   - Recurring yearly charge
   - ~$3.33/month (saves 37% vs monthly)
   - Best for: Committed users
   - **Value**: Best savings with yearly commitment
   - Most cost-effective option

3. **Lifetime Pro - $49.99 one-time**
   - Non-consumable, permanent unlock
   - No recurring charges
   - Best for: Power users and completionists
   - **Value**: Highest upfront cost but infinite long-term value
   - Preferred by users who commit long-term

All subscriptions can be managed through device settings (iOS: Settings → Subscriptions, Android: Google Play → Manage Subscriptions).

## Recent Changes

### Monetization Implementation (April 2026)
- Full RevenueCat integration with 3 products: monthly_pro ($1.99), annual_pro ($14.99), lifetime_pro ($49.99)
- Entitlement "pro" with offering "default" seeded via scripts/seedRevenueCat.ts
- SubscriptionProvider wraps entire app (client/lib/revenuecat.tsx) with useSubscription hook
- Paywall component (client/components/Paywall.tsx) - gradient modal, 3 plan cards, restore purchases
- WorkoutsScreen: workouts 2-6 locked with lock icon overlay; tapping opens Paywall
- StatsScreen: fully gated behind paywall for non-subscribers, shows "Unlock Pro" locked UI
- ProfileScreen: "Subscription" section shows Pro badge (subscribers) or "Upgrade to Pro" card (free)
- Environment variables: REVENUECAT_PROJECT_ID, EXPO_PUBLIC_REVENUECAT_IOS_API_KEY, EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY, EXPO_PUBLIC_REVENUECAT_TEST_API_KEY

### App Store Readiness - Cleanup (March 2026)
- Simplified StatsScreen to remove hardcoded/non-functional content
- Removed hardcoded charts (Calories Burned with fake data for Week/Month/Year)
- Removed hardcoded Health Metrics section (Heart Rate, Sleep, Hydration alerts)
- Removed period selector (Week/Month/Year buttons)
- Kept only functional Milestones section for tracking achievements
- Screen now shows "Achievements" header with editable milestone tracking
- All fake data and placeholder UI removed for app store submission

### Exercise Media Enhancements (March 2026)
- Integrated 21 exercise demonstration GIFs (720x720) across all workouts
- Updated Exercise interface to support optional `gifUri` field for exercise demonstrations
- GIFs display during active exercise sets, not during rest periods
- Full Body Burn: Burpees, Mountain Climber, Plank Jacks, Push-ups
- Glute Gains: Glute Bridge Walk, Basic to Cross Donkey Kick, Resistance Band Lateral Walk, Bottle Weighted Sumo Squat
- Core Crusher: Bicycle Crunch, Lying Leg Raise, Russian Twist, Plank Jack
- Cardio Queen: High Knee Tap, High Knee Jump Rope, Jump Box, Suspender Sprinter
- Flexibility Flow: Standing Forward Bend Uttanasana, Seated Hamstring Stretch with Chair, Kneeling Hip Flexor Stretch, Double Pigeon Pose, Cow Yoga Pose Bitilasana
- No-Equipment Abs: No GIFs yet (ready for user to add)
- Updated exercise names to match correct terminology from GIF library

### UX Improvements (January 2026)
- Enhanced onboarding flow explaining the app's unique "no-video" guided timer approach
- Created WorkoutPreviewScreen showing exercise lists, equipment requirements, and workout details before starting
- Changed workout card button from "Start Workout" to "Preview" to reduce commitment friction
- Added encouraging feedback messages ("Great form!", "You got this!") to workout player with smooth animations
- Updated navigation flow: Workout Card → Preview Screen → Player Screen
- Fixed memory leak in WorkoutPlayerScreen encouragement timeout cleanup

### App Store Preparation (December 2024)
- Custom pink-themed app icon generated and deployed to all platforms (iOS, Android, web)
- Workout filtering system implemented with category pills (All, HIIT, Strength, Cardio, Core, Stretch)
- Filter pills added (Popular, Short, No Equipment, New)
- Empty state UI with "Clear Filters" button when no workouts match criteria
- 5 sample workouts with unique images: Full Body Burn (HIIT), Glute Gains (Strength), Core Crusher (Core), Cardio Queen (Cardio), Flexibility Flow (Stretch)
- All workout images properly mapped across WorkoutsScreen, WorkoutCard, and WorkoutPlayerScreen
- Invalid Feather icons fixed (flame → trending-up, footprints → activity)