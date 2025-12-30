import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withGradient?: boolean;
}

export function ScreenWrapper({ children, style, withGradient = true }: ScreenWrapperProps) {
  return (
    <View style={styles.container}>
      {withGradient && (
        <LinearGradient
          // Deep Slate 900 to a slightly lighter Slate for depth
          colors={["#0f172a", "#1e293b"]}
          style={StyleSheet.absoluteFill}
        />
      )}

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Animated.View entering={FadeIn.duration(500)} style={[styles.content, style]}>
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a" // Fallback
  },
  safeArea: {
    flex: 1
  },
  content: {
    flex: 1
  }
});
