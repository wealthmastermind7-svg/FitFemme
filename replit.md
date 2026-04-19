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
- **LATAM Web Checkout**: Marketing site exposes `/subscribe` (localized EN/ES/PT plan picker with country-aware Pix/OXXO/card emphasis), `/subscribe/success` (deep-links back to the app), and `/subscribe/restore` (re-syncs entitlement by email).
  - **Architecture decision — hosted redirect, not embedded widget**: `/subscribe` is a server-rendered plan picker that redirects the user to per-plan RevenueCat-hosted checkout URLs (`REVENUECAT_WEB_CHECKOUT_MONTHLY_URL`, `_ANNUAL_URL`, `_LIFETIME_URL`). RevenueCat's hosted page handles PCI scope, Pix/OXXO/card UI, 3DS, and tax — embedding the JS widget would duplicate that surface area without changing what the user sees. If the product later requires staying on the Fit Femme domain end-to-end, swap the redirect for `<script src="…revenuecat web billing…">` in `subscribe.html` — the rest of the flow (account linking, webhook, restore) is independent of which surface collects the card.
  - **Account linking**: the page sets `app_user_id = email` so RevenueCat ties the web purchase to the same user that signs into the mobile app.
  - **Webhook**: `/api/revenuecat/webhook` verifies the `Authorization` header against `REVENUECAT_WEBHOOK_AUTH` and upserts purchase status into the `web_purchases` table (idempotent on `(app_user_id, product_id)`, gated by `event_timestamp_ms` so out-of-order retries can't overwrite newer state). RevenueCat remains the source of truth for entitlements; this table is for support visibility only.
  - **Schema bootstrap**: `server/db.ts` exports `ensureWebCheckoutSchema()` (idempotent `CREATE TABLE IF NOT EXISTS` + unique index) and `server/index.ts` calls it at boot, so a fresh deploy works without an out-of-band `drizzle-kit push`.
  - **Restore lookup**: `/api/web-purchases/lookup` returns only `{ hasActive: boolean }` (no purchase history) and is rate-limited per IP (5/min). When the limit is hit, the response is the same neutral `{ hasActive: false }` shape an unknown email returns, so attackers cannot enumerate paid accounts.
  - **iOS App Store compliance (guideline 3.1.3)**: the iOS app does NOT link to `/subscribe` or any web-billing URL from inside the app — it is promoted only via website, email, push, and Android. `client/lib/compliance.ts` walks every i18n string at boot and throws in dev (logs in prod) if any in-app copy references `/subscribe`, `fitfemme.cerolauto.store/subscribe`, `pay.rev.cat`, or `billing.revenuecat.com`.
- **Goal Personalization**: Allows users to set body goals (`lean_toned`, `booty_builder`, `flat_stomach`) influencing calorie/protein targets, recommended workouts, and meal suggestions.
- **Food Scanner**: AI-powered food scanner via Moonshot vision API for nutrition breakdown, with a free-tier limit and paywall integration.
- **Workout Features**: Includes 6 workout categories with exercise demonstration GIFs, a workout preview screen, and encouraging feedback during sessions. Workout-burn is linked to meal-calorie calculations based on body goals.
- **Multi-Language Support**: i18n system implemented for English, Spanish, and Portuguese, with language persistence and a selector in the Profile screen.
- **UI/UX**: Custom pink-themed app icon, workout filtering, empty state UI, and enhanced onboarding.
- **Onboarding** (Cal AI–style flow, lives under `client/screens/onboarding/`): cinematic welcome → workouts/week → referral source → tried other apps → height + weight (Imperial/Metric, iOS-style wheel pickers) → birthdate (month/day/year wheels) → has coach? → goal direction (lose/maintain/gain) → Fit Femme body goal (lean_toned/booty_builder/flat_stomach) → blockers (multi) → diet (classic/pescatarian/vegetarian/vegan) → accomplishments (multi) → trust → social-proof reviews → animated 0→100% building screen → custom plan (calories/carbs/protein/fats from `computeMacroTargets`) → how-to-reach goals + sources → Main. The legacy `OnboardingScreen.tsx` is now a thin re-export so existing navigation imports keep working. Persists the full extended UserProfile (heightCm, birth date, dietType, weightDirection, source, blockers, accomplishments, computed macro goals, healthScore) and sets `@hasOnboarded` only on final completion. **Weight unit contract**: `profile.weight` is stored in the unit declared by `profile.units` (lb when Imperial, kg when Metric) — onboarding converts kg→lb on save when needed so downstream `toKilograms(profile.weight, profile.units)` callers don't double-convert. Fully translated EN/ES/PT (`onb2.*` key namespace).
  - **Macro computation** (`computeMacroTargets` in `client/lib/storage.ts`): female Mifflin–St Jeor BMR × activity factor (derived from `daysPerWeek`, sedentary→very active) with a direction nudge (lose −20%, maintain 0%, gain +15%), split 30/40/30 protein/carbs/fat. Uses `??` (not `||`) for `daysPerWeek` so a legitimate 0 is preserved.

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