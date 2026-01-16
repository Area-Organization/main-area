import React from "react";
import { View, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
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

export function ServiceTile({ item, isConnected, onPress, loading }: ServiceTileProps) {
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");

  const brandColor = useServiceColor(item.name);

  const dynamicStyle = isConnected
    ? {
        borderColor: brandColor,
        borderWidth: 2,
        backgroundColor: cardColor
      }
    : {
        borderColor: borderColor,
        borderWidth: 1,
        backgroundColor: cardColor
      };

  const iconColor = isConnected ? brandColor : "#888";

  return (
    <Animated.View entering={FadeInDown.duration(400)} className="flex-1">
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.7}
        className="aspect-square rounded-xl p-5 items-center justify-center relative shadow-card"
        style={dynamicStyle}
      >
        {isConnected && (
          <View
            className="absolute top-3 right-3 w-6 h-6 rounded-full items-center justify-center z-10"
            style={{ backgroundColor: brandColor }}
          >
            <IconSymbol name="checkmark.circle.fill" size={14} color="#FFF" />
          </View>
        )}

        <View className="flex-1 justify-center items-center mb-2">
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
      </TouchableOpacity>
    </Animated.View>
  );
}
