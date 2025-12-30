import React, { useEffect } from "react";
import { ViewStyle } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn
} from "react-native-reanimated";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ title, description, icon, actionLabel, onAction, style }: EmptyStateProps) {
  const primaryColor = useThemeColor({}, "primary");

  // Animation Values
  const translateY = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // 1. Floating/Bobbing Effect for the Icon
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // 2. Gentle Pulse for the Button
    if (actionLabel) {
      buttonScale.value = withRepeat(
        withSequence(withTiming(1.03, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        true
      );
    }
  }, [actionLabel]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      className="flex-1 items-center justify-center py-10 px-6"
      style={style}
    >
      <Animated.View style={animatedIconStyle} className="mb-6 shadow-xl shadow-black/10">
        {icon || <IconSymbol name="paperplane.fill" size={60} color={primaryColor} />}
      </Animated.View>

      <ThemedText type="title" className="text-center mb-3">
        {title}
      </ThemedText>

      <ThemedText className="text-center opacity-60 px-4 mb-10 leading-6">{description}</ThemedText>

      {actionLabel && onAction && (
        <Animated.View style={[{ width: "100%", maxWidth: 280 }, animatedButtonStyle]}>
          <Button title={actionLabel} onPress={onAction} className="rounded-full h-14 shadow-lg shadow-primary/20" />
        </Animated.View>
      )}
    </Animated.View>
  );
}
