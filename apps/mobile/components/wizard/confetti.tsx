import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const ConfettiParticle = ({ index }: { index: number }) => {
  const x = useSharedValue(width / 2);
  const y = useSharedValue(height / 2);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
  const color = colors[index % colors.length];

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 150 + Math.random() * 200;
    const endX = width / 2 + Math.cos(angle) * velocity;
    const endY = height / 2 + Math.sin(angle) * velocity;

    scale.value = withSpring(1);
    x.value = withTiming(endX, { duration: 1200, easing: Easing.out(Easing.quad) });
    y.value = withTiming(endY, { duration: 1200, easing: Easing.out(Easing.quad) });
    rotation.value = withTiming(Math.random() * 720, { duration: 1200 });
    opacity.value = withDelay(600, withTiming(0, { duration: 600 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    top: 0,
    width: 10,
    height: 10,
    backgroundColor: color,
    borderRadius: 5,
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ]
  }));

  return <Animated.View style={style} />;
};

export const SuccessConfetti = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" className="z-50 elevation-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </View>
  );
};
