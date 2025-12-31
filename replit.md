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

## Recent Changes

### App Store Preparation (December 2024)
- Custom pink-themed app icon generated and deployed to all platforms (iOS, Android, web)
- Workout filtering system implemented with category pills (All, HIIT, Strength, Cardio, Core, Stretch)
- Filter pills added (Popular, Short, No Equipment, New)
- Empty state UI with "Clear Filters" button when no workouts match criteria
- 5 sample workouts with unique images: Full Body Burn (HIIT), Glute Gains (Strength), Core Crusher (Core), Cardio Queen (Cardio), Flexibility Flow (Stretch)
- All workout images properly mapped across WorkoutsScreen, WorkoutCard, and WorkoutPlayerScreen
- Invalid Feather icons fixed (flame → trending-up, footprints → activity)