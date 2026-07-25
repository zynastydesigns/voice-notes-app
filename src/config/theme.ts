/**
 * Design tokens for the app's premium dark theme.
 *
 * NativeWind className utilities (see tailwind.config.js) are the primary
 * styling mechanism. This file mirrors the same palette as plain JS values
 * for the handful of places that can't take a className — LinearGradient
 * colors, native Animated values, chart/waveform colors, status bar style,
 * etc. Keep the two in sync when the palette changes.
 */

export const colors = {
  background: {
    default: "#0B0B14",
    elevated: "#13131F",
    card: "#181826",
    input: "#1D1D2C",
  },
  border: {
    default: "#242437",
    subtle: "#1C1C2A",
  },
  brand: {
    50: "#F1EEFF",
    100: "#E1DBFF",
    200: "#C3B7FF",
    300: "#A08CFF",
    400: "#8A6DFF",
    500: "#7C5CFC",
    600: "#6A46F0",
    700: "#5936C9",
    800: "#452A9C",
    900: "#332072",
  },
  accent: {
    teal: "#2DD4BF",
    pink: "#F472B6",
    amber: "#FBBF24",
    red: "#F87171",
    green: "#34D399",
  },
  text: {
    primary: "#F5F5FA",
    secondary: "#A6A6BF",
    tertiary: "#6B6B85",
    inverse: "#0B0B14",
  },
} as const;

export const gradients = {
  brand: [colors.brand[400], colors.brand[600]] as const,
  brandSubtle: ["rgba(124,92,252,0.25)", "rgba(124,92,252,0.02)"] as const,
  recordPulse: ["rgba(248,113,113,0.35)", "rgba(248,113,113,0)"] as const,
  card: ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.01)"] as const,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
};

export const animation = {
  fast: 150,
  base: 250,
  slow: 400,
  spring: {
    damping: 16,
    stiffness: 180,
    mass: 0.9,
  },
};

export const theme = {
  colors,
  gradients,
  radii,
  spacing,
  typography,
  animation,
} as const;

export type Theme = typeof theme;
