import React from "react";
import { Text, ActivityIndicator, ViewStyle, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { feedback } from "@/lib/haptics";

type ButtonProps = {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "destructive" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  className?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ onPress, title, variant = "primary", disabled, loading, style, className }: ButtonProps) {
  const scale = useSharedValue(1);

  let bgClass = "bg-primary shadow-sm";
  let textClass = "text-primary-foreground";
  let borderClass = "";

  if (variant === "secondary") {
    bgClass = "bg-secondary";
    textClass = "text-secondary-foreground";
  } else if (variant === "destructive") {
    bgClass = "bg-destructive";
    textClass = "text-destructive-foreground";
  } else if (variant === "outline") {
    bgClass = "bg-transparent";
    textClass = "text-foreground";
    borderClass = "border border-border";
  }

  if (disabled) {
    bgClass = "bg-muted";
    textClass = "text-muted-foreground";
  }

  const handlePressIn = () => {
    if (disabled || loading) return;
    feedback.impact("light");
    scale.value = withTiming(0.97, { duration: 100, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, style]}
      className={`h-[52px] flex-row items-center justify-center px-6 rounded-lg ${bgClass} ${borderClass} ${
        className || ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "secondary" ? "#000" : "#FFF"} />
      ) : (
        <Text className={`text-[15px] font-sans-semibold ${textClass}`}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}
