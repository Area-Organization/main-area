import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Network from "expo-network";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";

export function OfflineNotice() {
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(true);

  // Start off-screen (-100)
  const translateY = useSharedValue(-150);

  useEffect(() => {
    // Initial check
    Network.getNetworkStateAsync().then((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    // Polling fallback to ensure we catch network changes
    const interval = setInterval(async () => {
      const state = await Network.getNetworkStateAsync();
      // Only update if changed to avoid unnecessary re-renders
      if (state.isConnected !== undefined) {
        setIsConnected(state.isConnected);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      // Slide Down
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    } else {
      // Slide Up
      translateY.value = withSpring(-150);
    }
  }, [isConnected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 z-[999] items-center justify-center pb-3 bg-red-600/95 border-b border-white/10 shadow-lg shadow-black/20"
      style={[{ paddingTop: insets.top + 8 }, animatedStyle]}
    >
      <View className="flex-row items-center gap-2">
        <IconSymbol name="gear" size={18} color="#FEF2F2" />
        <ThemedText className="text-red-50 font-bold text-sm tracking-wide">OFFLINE MODE</ThemedText>
      </View>
    </Animated.View>
  );
}
