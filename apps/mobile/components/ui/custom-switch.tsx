import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor
} from "react-native-reanimated";
import { feedback } from "@/lib/haptics";

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  primaryColor: string;
}

export function CustomSwitch({ value, onValueChange, primaryColor }: CustomSwitchProps) {
  const offset = useSharedValue(value ? 22 : 2);

  const toggleSwitch = () => {
    feedback.impact("medium");
    onValueChange(!value);
  };

  useEffect(() => {
    offset.value = withSpring(value ? 22 : 2, {
      mass: 0.8,
      damping: 15,
      stiffness: 120
    });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(offset.value, [2, 22], ["#3f3f46", primaryColor]);
    const shadowOpacity = interpolate(offset.value, [2, 22], [0, 0.4]);

    return {
      backgroundColor,
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity,
      shadowRadius: 8,
      elevation: value ? 5 : 0
    };
  });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }]
  }));

  return (
    <Pressable onPress={toggleSwitch} hitSlop={10}>
      <Animated.View style={[{ width: 50, height: 30, borderRadius: 15, justifyContent: "center" }, trackStyle]}>
        <Animated.View
          style={[
            {
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2.5,
              elevation: 2
            },
            knobStyle
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
