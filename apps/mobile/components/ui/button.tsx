import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { Layout } from "@/constants/theme";

type ButtonProps = {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "destructive" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  className?: string;
};

export function Button({ onPress, title, variant = "primary", disabled, loading, style, className }: ButtonProps) {
  let bgClass = "bg-primary";
  let textClass = "text-primary-foreground";
  let borderClass = "";

  if (variant === "secondary") {
    bgClass = "bg-muted";
    textClass = "text-foreground";
  } else if (variant === "destructive") {
    bgClass = "bg-destructive";
    textClass = "text-white";
  } else if (variant === "outline") {
    bgClass = "bg-transparent";
    textClass = "text-foreground";
    borderClass = "border border-border";
  }

  if (disabled) {
    bgClass = "bg-muted";
    textClass = "text-muted-foreground";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`h-[50px] flex-row items-center justify-center px-5 rounded-2xl ${bgClass} ${borderClass} ${className || ""}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "secondary" ? "#000" : "#FFF"} />
      ) : (
        <Text className={`text-base font-semibold ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
