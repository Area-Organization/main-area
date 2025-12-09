import { Platform } from "react-native";

const palette = {
  light: {
    background: "#FFFFFF", // oklch(1.0 0 0)
    foreground: "#09090B", // oklch(0.1448 0 0)
    card: "#FFFFFF",
    cardForeground: "#09090B",
    primary: "#7C3AED", // Approx for oklch(0.5795 0.2300 280.0547)
    primaryForeground: "#FFFFFF",
    muted: "#F4F4F5",
    mutedForeground: "#71717A",
    destructive: "#EF4444",
    border: "#E4E4E7",
    input: "#E4E4E7"
  },
  dark: {
    background: "#09090B", // oklch(0.1221 0 0)
    foreground: "#FAFAFA", // oklch(0.9851 0 0)
    card: "#18181B", // oklch(0.1684 0 0)
    cardForeground: "#FAFAFA",
    primary: "#8B5CF6", // Approx for oklch(0.5945 0.2325 285.8306)
    primaryForeground: "#FFFFFF",
    muted: "#27272A",
    mutedForeground: "#A1A1AA",
    destructive: "#7F1D1D",
    border: "#27272A",
    input: "#27272A"
  }
};

export const Layout = {
  radius: 16, // 1rem
  spacing: 4 // 0.25rem
};

export const Colors = {
  light: {
    text: palette.light.foreground,
    background: palette.light.background,
    tint: palette.light.primary,
    icon: palette.light.mutedForeground,
    tabIconDefault: palette.light.mutedForeground,
    tabIconSelected: palette.light.primary,
    card: palette.light.card,
    border: palette.light.border,
    notification: palette.light.destructive,
    primary: palette.light.primary,
    primaryForeground: palette.light.primaryForeground,
    muted: palette.light.muted,
    input: palette.light.input
  },
  dark: {
    text: palette.dark.foreground,
    background: palette.dark.background,
    tint: palette.dark.primary,
    icon: palette.dark.mutedForeground,
    tabIconDefault: palette.dark.mutedForeground,
    tabIconSelected: palette.dark.primary,
    card: palette.dark.card,
    border: palette.dark.border,
    notification: palette.dark.destructive,
    primary: palette.dark.primary,
    primaryForeground: palette.dark.primaryForeground,
    muted: palette.dark.muted,
    input: palette.dark.input
  }
};

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Georgia",
    mono: "Menlo"
  },
  default: {
    sans: "sans-serif",
    serif: "serif",
    mono: "monospace"
  }
});
