import React from "react";
import { Text, ActivityIndicator, ViewStyle, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
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

  const springConfig = {
    mass: 0.2,
    damping: 20,
    stiffness: 400
  };

  const handlePressIn = () => {
    if (disabled || loading) return;
    feedback.impact("light");
    scale.value = withSpring(0.97, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
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
      className={`h-[50px] flex-row items-center justify-center px-5 rounded-2xl ${bgClass} ${borderClass} ${
        className || ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "secondary" ? "#000" : "#FFF"} />
      ) : (
        <Text className={`text-base font-semibold ${textClass}`}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}
