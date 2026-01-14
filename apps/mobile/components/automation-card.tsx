import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  FadeInDown,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { feedback } from "@/lib/haptics";

import { ThemedText } from "@/components/themed-text";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { AreaType } from "@area/types";
import { BRAND_COLORS, useServiceColor } from "@/lib/service-utils";
import { ServiceIcon } from "@/components/service-icon";

const BUTTON_WIDTH = 80;

interface AutomationCardProps {
  item: AreaType;
  index: number;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
  onEdit: (id: string) => void;
  primaryColor: string;
}

export function AutomationCard({ item, index, onDelete, onToggle, onEdit, primaryColor }: AutomationCardProps) {
  const translateX = useSharedValue(0);
  const context = useSharedValue(0);
  const isSwiping = useSharedValue(false);
  const cardBackgroundColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  const actionColor = useServiceColor(item.action?.serviceName || "");

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onStart(() => {
      context.value = translateX.value;
      isSwiping.value = true;
      runOnJS(feedback.selection)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value;
    })
    .onEnd(() => {
      isSwiping.value = false;
      if (translateX.value > BUTTON_WIDTH / 2) {
        translateX.value = withSpring(BUTTON_WIDTH, { velocity: 10, overshootClamping: true });
      } else if (translateX.value < -BUTTON_WIDTH / 2) {
        translateX.value = withSpring(-BUTTON_WIDTH, { velocity: 10, overshootClamping: true });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, BUTTON_WIDTH], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [0, BUTTON_WIDTH], [0.8, 1], Extrapolation.CLAMP) }],
    zIndex: -1
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-BUTTON_WIDTH, 0], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-BUTTON_WIDTH, 0], [1, 0.8], Extrapolation.CLAMP) }],
    zIndex: -1
  }));

  const handleEditPress = () => {
    onEdit(item.id);
    translateX.value = withSpring(0);
  };

  const handleDeletePress = () => {
    onDelete(item.id);
    translateX.value = withSpring(0);
  };

  const reactions = item.reactions || [];

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} className="mb-4 relative">
      <View style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: "hidden", flexDirection: "row" }]}>
        <Animated.View
          style={[
            { width: BUTTON_WIDTH, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" },
            leftActionStyle
          ]}
        >
          <Pressable
            onPress={handleEditPress}
            style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
          >
            <MaterialIcons name="edit" size={24} color="white" />
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold", marginTop: 4 }}>EDIT</Text>
          </Pressable>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View
          style={[
            { width: BUTTON_WIDTH, backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center" },
            rightActionStyle
          ]}
        >
          <Pressable
            onPress={handleDeletePress}
            style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
          >
            <MaterialIcons name="delete" size={24} color="white" />
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold", marginTop: 4 }}>DELETE</Text>
          </Pressable>
        </Animated.View>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            rStyle,
            {
              backgroundColor: cardBackgroundColor,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: borderColor,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2
            }
          ]}
        >
          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-muted">
                <ServiceIcon serviceName={item.action?.serviceName || ""} size={18} color={actionColor} />
              </View>
              <MaterialIcons name="chevron-right" size={16} color="#999" />

              <View className="flex-row -space-x-2">
                {reactions.slice(0, 3).map((r: any, i: number) => {
                  const rColor = BRAND_COLORS[r.serviceName.toLowerCase()] || primaryColor;
                  return (
                    <View
                      key={i}
                      className="w-8 h-8 rounded-lg items-center justify-center bg-muted border border-card"
                      style={{ zIndex: 10 - i }}
                    >
                      <ServiceIcon serviceName={r.serviceName} size={16} color={rColor} />
                    </View>
                  );
                })}
                {reactions.length > 3 && (
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center bg-muted border border-card"
                    style={{ zIndex: 0 }}
                  >
                    <ThemedText className="text-xs font-bold text-primary">+{reactions.length - 3}</ThemedText>
                  </View>
                )}
                {reactions.length === 0 && (
                  <View className="w-8 h-8 rounded-lg items-center justify-center bg-muted border border-card">
                    <ThemedText className="font-bold text-primary">?</ThemedText>
                  </View>
                )}
              </View>
            </View>

            <CustomSwitch
              value={item.enabled}
              onValueChange={(val) => onToggle(item.id, item.enabled)}
              primaryColor={primaryColor}
            />
          </View>

          <ThemedText type="defaultSemiBold" className="text-lg">
            {item.name || "Untitled Area"}
          </ThemedText>
          {item.description ? (
            <ThemedText className="text-sm opacity-60 mt-1" numberOfLines={1}>
              {item.description}
            </ThemedText>
          ) : null}

          <View className="h-[1px] bg-border my-3 opacity-50" />

          <View className="gap-1">
            <ThemedText className="text-sm opacity-80" numberOfLines={1}>
              <ThemedText className="font-bold text-primary">IF </ThemedText>
              {item.action?.actionName}
            </ThemedText>
            {reactions.map((r: any, i: number) => (
              <ThemedText key={i} className="text-sm opacity-80" numberOfLines={1}>
                <ThemedText className="font-bold text-primary">THEN </ThemedText>
                {r.reactionName}
              </ThemedText>
            ))}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
