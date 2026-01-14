import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, { useAnimatedProps, interpolate, SharedValue } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Service } from "@/hooks/use-services";
import { ServiceIcon } from "@/components/service-icon";
import { BRAND_COLORS } from "@/lib/service-utils";

const { width } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface WiringDiagramProps {
  actionService: Service | null;
  reactions: Array<{ id: string; service: Service }>;
  pulseProgress: SharedValue<number>;
}

export function WiringDiagram({ actionService, reactions, pulseProgress }: WiringDiagramProps) {
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");

  // FIX: Use BRAND_COLORS dictionary lookup instead of hook
  const actionColor = BRAND_COLORS[actionService?.name?.toLowerCase() || ""] || primaryColor;

  const cableHeight = 150;
  const padding = 60;
  const cablePath = `M ${padding} ${cableHeight / 2} C ${width / 2} ${cableHeight / 2}, ${width / 2} ${cableHeight / 2}, ${width - padding} ${cableHeight / 2}`;
  const pathLength = width - padding * 2;

  const animatedCircleProps = useAnimatedProps(() => ({
    cx: interpolate(pulseProgress.value, [0, 1], [padding, width - padding]),
    opacity: interpolate(pulseProgress.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
  }));

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(pulseProgress.value, [0, 1], [0, -pathLength]),
    strokeOpacity: interpolate(pulseProgress.value, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])
  }));

  return (
    <View className="items-center justify-center my-8">
      <View style={{ width: width, height: cableHeight }}>
        <Svg height={cableHeight} width={width} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={primaryColor} stopOpacity="0.4" />
              <Stop offset="0.5" stopColor={primaryColor} stopOpacity="1" />
              <Stop offset="1" stopColor={primaryColor} stopOpacity="0.4" />
            </LinearGradient>
          </Defs>

          <Path d={cablePath} stroke={borderColor} strokeWidth="4" fill="none" />
          <AnimatedPath
            d={cablePath}
            stroke="url(#grad)"
            strokeWidth="4"
            fill="none"
            strokeDasharray={[10, 10]}
            animatedProps={animatedPathProps}
          />
          <AnimatedCircle r="8" cy={cableHeight / 2} fill={primaryColor} animatedProps={animatedCircleProps} />
        </Svg>

        <View className="absolute left-[30px] top-[45px] w-16 h-16 rounded-2xl bg-card border border-border items-center justify-center z-10 shadow-sm">
          <ServiceIcon serviceName={actionService?.name || ""} size={32} color={actionColor} />
          <View className="absolute -bottom-6 w-24 items-center">
            <ThemedText className="text-xs font-bold opacity-60">IF THIS</ThemedText>
          </View>
        </View>

        <View className="absolute right-[30px] top-[45px] z-10">
          <View className="flex-row -space-x-8">
            {reactions.slice(0, 3).map((r, i) => {
              const rColor = BRAND_COLORS[r.service.name.toLowerCase()] || primaryColor;
              return (
                <View
                  key={r.id}
                  className="w-16 h-16 rounded-2xl bg-card border border-border items-center justify-center shadow-sm"
                  style={{ zIndex: 10 - i }}
                >
                  <ServiceIcon serviceName={r.service.name} size={32} color={rColor} />
                </View>
              );
            })}
            {reactions.length > 3 && (
              <View
                className="w-16 h-16 rounded-2xl bg-card border border-border items-center justify-center shadow-sm"
                style={{ zIndex: 0 }}
              >
                <ThemedText className="font-bold text-muted-foreground">+{reactions.length - 3}</ThemedText>
              </View>
            )}
          </View>
          <View className="absolute -bottom-6 w-full items-center">
            <ThemedText className="text-xs font-bold opacity-60">THEN THAT</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}
