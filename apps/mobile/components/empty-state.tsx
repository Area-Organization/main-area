import React from "react";
import { ViewStyle } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";
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

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="flex-1 items-center justify-center py-10 px-6"
      style={style}
    >
      <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mb-6 shadow-xl shadow-black/10">
        {icon || <IconSymbol name="paperplane.fill" size={60} color={primaryColor} />}
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <ThemedText type="title" className="text-center mb-3">
          {title}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <ThemedText className="text-center opacity-60 px-4 mb-10 leading-6">{description}</ThemedText>
      </Animated.View>

      {actionLabel && onAction && (
        <Animated.View entering={FadeInUp.duration(500).delay(400)} style={{ width: "100%", maxWidth: 280 }}>
          <Button title={actionLabel} onPress={onAction} className="rounded-full h-14 shadow-lg shadow-primary/20" />
        </Animated.View>
      )}
    </Animated.View>
  );
}
