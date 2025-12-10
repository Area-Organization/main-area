import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Layout } from "@/constants/theme";

type ButtonProps = {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "destructive" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ onPress, title, variant = "primary", disabled, loading, style }: ButtonProps) {
  const primaryColor = useThemeColor({}, "primary");
  const primaryFg = useThemeColor({}, "primaryForeground");
  const destructive = "#EF4444";
  const muted = useThemeColor({}, "muted");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");

  let bg = primaryColor;
  let fg = primaryFg;
  let borderColor = "transparent";
  let borderWidth = 0;

  if (variant === "secondary") {
    bg = muted;
    fg = text;
  } else if (variant === "destructive") {
    bg = destructive;
    fg = "#FFF";
  } else if (variant === "outline") {
    bg = "transparent";
    fg = text;
    borderColor = border;
    borderWidth = 1;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: disabled ? muted : bg, borderColor, borderWidth, borderRadius: Layout.radius },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.text, { color: disabled ? "#999" : fg }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  text: {
    fontSize: 16,
    fontWeight: "600"
  }
});
