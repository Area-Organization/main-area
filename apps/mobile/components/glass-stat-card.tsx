import React from "react";
import Animated, { FadeInRight } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface GlassStatCardProps {
  value: number | string;
  subLabel: string;
  delay?: number;
  color: string;
}

export function GlassStatCard({ value, subLabel, delay = 0, color }: GlassStatCardProps) {
  const isDark = useThemeColor({}, "background") === "#09090B";

  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify().damping(12)}
      style={{
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        borderRadius: 20,
        padding: 16,
        minWidth: 120,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <ThemedText type="title" style={{ color: color, fontSize: 26, marginBottom: 2 }}>
        {value}
      </ThemedText>
      <ThemedText className="text-xs opacity-60 font-bold uppercase tracking-wider">{subLabel}</ThemedText>
    </Animated.View>
  );
}
