import { Platform } from "react-native";

const palette = {
  light: {
    background: "#fdfdfd",
    foreground: "#000000",
    card: "#fdfdfd",
    cardForeground: "#000000",
    primary: "#7033ff",
    primaryForeground: "#ffffff",
    secondary: "#edf0f4",
    muted: "#f5f5f5",
    mutedForeground: "#525252",
    destructive: "#e54b4f",
    border: "#e7e7ee",
    input: "#ebebeb"
  },
  dark: {
    background: "#1a1b1e",
    foreground: "#f0f0f0",
    card: "#222327",
    cardForeground: "#f0f0f0",
    primary: "#8c5cff",
    primaryForeground: "#ffffff",
    secondary: "#2a2c33",
    muted: "#2a2c33",
    mutedForeground: "#a0a0a0",
    destructive: "#f87171",
    border: "#33353a",
    input: "#33353a"
  }
};

export const Layout = {
  radius: 22.4, // Matches 1.4rem (~22.4px)
  spacing: 4
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
    secondary: palette.light.secondary,
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
    secondary: palette.dark.secondary,
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
