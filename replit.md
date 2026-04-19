# Fit Femme

## Overview

Fit Femme is a premium fitness mobile application for women, built with React Native and Expo. It offers workout tracking, progress monitoring, and personalized fitness experiences with a focus on empowering aesthetics, cinematic photography, and a sophisticated dark theme. The app aims to celebrate curves and culture through its visually polished interface and smooth animations, providing an engaging and motivating fitness journey.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

**Framework**: React Native with Expo SDK 54, utilizing the new architecture and React Compiler experimental features.
**Navigation**: React Navigation v7, employing a nested stack/tab navigator structure for a comprehensive user flow (Root Stack, Main Tab Navigator with 5 tabs, each with its own Stack Navigator).
**State Management**: TanStack Query for server state, React hooks for local component state, and AsyncStorage for client-side persistence (onboarding, user profiles, metrics).
**Animation**: React Native Reanimated for smooth, native-driven animations.
**Styling**: StyleSheet API with a centralized theme system (`client/constants/theme.ts`), following a dark-mode-first approach with a primary pink brand color.

### Backend

**Server**: Express.js with TypeScript, providing an API backend with CORS support.
**Database**: PostgreSQL with Drizzle ORM for type-safe operations, utilizing Zod for schema validation.
**Storage**: An interface-based storage abstraction (`IStorage`) with an in-memory implementation (`MemStorage`) designed for swappable persistence layers.

### Project Structure

- `client/`: React Native frontend components, screens, navigation, hooks, utilities, and constants.
- `server/`: Express backend with entry point, route definitions, and data access layer.
- `shared/`: Code shared between client and server, including Drizzle schema and types.
- `scripts/`: Build scripts for Expo web.

### Key Design Patterns

- **Path Aliases**: For clean imports (`@/` for `client/`, `@shared/` for `shared/`).
- **Error Boundaries**: Class-based for robust error handling.
- **Platform-specific code**: Conditional rendering for platform optimization (e.g., iOS blur effects).
- **Keyboard handling**: Platform-aware keyboard scroll view component.

### Feature Specifications

- **Monetization**: Free and Paid plans with three subscription tiers (Monthly $1.99, Annual $14.99, Lifetime $49.99) unlocking all premium features like full workout access, advanced tracking, custom workout builder, and detailed analytics. Integrated with RevenueCat (entitlement: `pro`). The mobile app uses RevenueCat's native paywall (in TestFlight / App Store builds; Expo Go and web show a preview notice).
- **LATAM Web Checkout**: Marketing site exposes `/subscribe` (localized EN/ES/PT plan picker with country-aware Pix/OXXO/card emphasis), `/subscribe/success` (deep-links back to the app), and `/subscribe/restore` (re-syncs entitlement by email). The page sets `app_user_id = email` so RevenueCat ties the web purchase to the same user that signs into the mobile app. A `/api/revenuecat/webhook` endpoint verifies the `Authorization` header against `REVENUECAT_WEBHOOK_AUTH` and records purchase status into the `web_purchases` table for support visibility (RevenueCat remains the source of truth for entitlements). Per Apple guidelines, the iOS app does NOT link to `/subscribe` from inside the app — it is promoted only via website, email, push, and Android. Configure per-plan checkout URLs via `REVENUECAT_WEB_CHECKOUT_MONTHLY_URL`, `_ANNUAL_URL`, and `_LIFETIME_URL`.
- **Goal Personalization**: Allows users to set body goals (`lean_toned`, `booty_builder`, `flat_stomach`) influencing calorie/protein targets, recommended workouts, and meal suggestions.
- **Food Scanner**: AI-powered food scanner via Moonshot vision API for nutrition breakdown, with a free-tier limit and paywall integration.
- **Workout Features**: Includes 6 workout categories with exercise demonstration GIFs, a workout preview screen, and encouraging feedback during sessions. Workout-burn is linked to meal-calorie calculations based on body goals.
- **Multi-Language Support**: i18n system implemented for English, Spanish, and Portuguese, with language persistence and a selector in the Profile screen.
- **UI/UX**: Custom pink-themed app icon, workout filtering, empty state UI, and enhanced onboarding.
- **Onboarding**: Multi-step interactive questionnaire (welcome → goal → name → age → weight + units → weekly commitment → animated "building your plan" → Main). Persists full UserProfile (including `daysPerWeek`) and sets `@hasOnboarded` only on final completion. Fully translated EN/ES/PT.

## External Dependencies

### Core Platform
- **Expo SDK 54**
- **React 19.1**
- **React Native 0.81**

### Database
- **PostgreSQL**
- **Drizzle ORM**
- **drizzle-zod**

### UI Libraries
- **expo-blur**
- **expo-linear-gradient**
- **expo-haptics**
- **expo-image**
- **react-native-reanimated**
- **react-native-gesture-handler**
- **react-native-svg**
- **react-native-purchases-ui** (for RevenueCat paywall UI)

### Data & State
- **@tanstack/react-query**
- **@react-native-async-storage/async-storage**
- **zod**

### Development
- **tsx**
- **drizzle-kit**
- **eslint-config-expo**
- **prettier**

### Third-Party Services
- **RevenueCat**: For subscription management and paywall integration.
- **Moonshot API**: For AI-powered food image analysis.