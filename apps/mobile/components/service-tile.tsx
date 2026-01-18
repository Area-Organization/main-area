import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Service } from "@/hooks/use-services";
import { useServiceColor } from "@/lib/service-utils";
import { ServiceIcon } from "@/components/service-icon";

interface ServiceTileProps {
  item: Service;
  isConnected: boolean;
  onPress: () => void;
  loading: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function ServiceTile({ item, isConnected, onPress, loading }: ServiceTileProps) {
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");

  const brandColor = useServiceColor(item.name);

  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isConnected) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite loop
        true // Reverse direction on loop
      );
    } else {
      glowOpacity.value = 0;
    }
  }, [glowOpacity, isConnected]);

  const animatedStyle = useAnimatedStyle(() => {
    if (isConnected) {
      return {
        borderColor: brandColor,
        borderWidth: 2,
        backgroundColor: cardColor,
        shadowColor: brandColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowOpacity.value,
        shadowRadius: 12,
        elevation: 10
      };
    }

    return {
      borderColor: borderColor,
      borderWidth: 1,
      backgroundColor: cardColor,
      shadowOpacity: 0,
      elevation: 0
    };
  });

  const iconColor = isConnected ? brandColor : "#888";

  return (
    <Animated.View entering={FadeInDown.duration(400)} className="flex-1">
      <AnimatedTouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.7}
        className={`aspect-square rounded-xl p-5 items-center justify-center relative ${
          !isConnected ? "shadow-card" : ""
        }`}
        style={animatedStyle}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} service`}
        accessibilityState={{ checked: isConnected, busy: loading }}
        accessibilityHint={isConnected ? "Double tap to disconnect" : "Double tap to connect"}
      >
        {isConnected && (
          <View
            className="absolute top-3 right-3 w-6 h-6 rounded-full items-center justify-center z-10"
            style={{ backgroundColor: brandColor }}
            accessibilityElementsHidden={true}
          >
            <IconSymbol name="checkmark.circle.fill" size={14} color="#FFF" />
          </View>
        )}

        <View className="flex-1 justify-center items-center mb-2" accessibilityElementsHidden={true}>
          <ServiceIcon serviceName={item.name} size={48} color={iconColor} />
        </View>

        <View className="h-10 justify-start items-center">
          <ThemedText type="defaultSemiBold" className="capitalize text-center">
            {item.name}
          </ThemedText>
          <ThemedText className="text-[11px] opacity-50 mt-1 font-medium">
            {isConnected ? "Connected" : "Connect"}
          </ThemedText>
        </View>

        {loading && (
          <View
            className="absolute inset-0 rounded-xl items-center justify-center opacity-95"
            style={{ backgroundColor: cardColor }}
          >
            <ThemedText className="text-xs font-bold" style={{ color: primaryColor }}>
              ...
            </ThemedText>
          </View>
        )}
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
}
