import { Platform } from "react-native";

export const Colors = {
  primary: "#d41173",
  primaryDark: "#a30d58",
  backgroundDark: "#221019",
  backgroundLight: "#331926",
  surfaceDark: "#331926",
  cardDark: "#2d1b24",
  surfaceSecondary: "#3a1d2b",
  accentPink: "#c992ad",
  success: "#0bda8b",
  error: "#ef4444",
  info: "#60a5fa",
  purple: "#8b5cf6",
  blue: "#60a5fa",
  cyan: "#22d3ee",
  red: "#ef4444",
  yellow: "#eab308",
  white: "#FFFFFF",
  white90: "rgba(255,255,255,0.9)",
  white80: "rgba(255,255,255,0.8)",
  white60: "rgba(255,255,255,0.6)",
  white50: "rgba(255,255,255,0.5)",
  white40: "rgba(255,255,255,0.4)",
  white20: "rgba(255,255,255,0.2)",
  white10: "rgba(255,255,255,0.1)",
  white05: "rgba(255,255,255,0.05)",
  light: {
    text: "#FFFFFF",
    buttonText: "#FFFFFF",
    tabIconDefault: "rgba(255,255,255,0.6)",
    tabIconSelected: "#d41173",
    link: "#d41173",
    backgroundRoot: "#221019",
    backgroundDefault: "#331926",
    backgroundSecondary: "#3a1d2b",
    backgroundTertiary: "#482336",
  },
  dark: {
    text: "#FFFFFF",
    buttonText: "#FFFFFF",
    tabIconDefault: "rgba(255,255,255,0.6)",
    tabIconSelected: "#d41173",
    link: "#d41173",
    backgroundRoot: "#221019",
    backgroundDefault: "#331926",
    backgroundSecondary: "#3a1d2b",
    backgroundTertiary: "#482336",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 48,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  displayLarge: {
    fontSize: 96,
    fontWeight: "900" as const,
    letterSpacing: -2,
  },
  display: {
    fontSize: 56,
    fontWeight: "900" as const,
    letterSpacing: -1.5,
  },
  h1: {
    fontSize: 42,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: "300" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  caption: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
};

export const Shadows = {
  soft: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },
  primaryGlow: {
    shadowColor: "#d41173",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 12,
  },
  floatingButton: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 16,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Lexend, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
