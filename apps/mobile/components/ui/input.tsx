import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  FadeInUp,
  FadeOutUp,
  Easing
} from "react-native-reanimated";
import { useThemeColor } from "@/hooks/use-theme-color";

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  error?: string;
  className?: string;
}

export function Input({ className, style, icon, error, ...props }: InputProps) {
  const focusProgress = useSharedValue(0);
  const scale = useSharedValue(1);

  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");
  const errorColor = useThemeColor({}, "notification");
  const inputBg = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  const animatedStyle = useAnimatedStyle(() => {
    if (error) {
      return {
        borderColor: withTiming(errorColor, { duration: 150 }),
        transform: [{ scale: scale.value }]
      };
    }

    return {
      borderColor: interpolateColor(focusProgress.value, [0, 1], [borderColor, primaryColor]),
      transform: [{ scale: scale.value }]
    };
  });

  const handleFocus = (e: any) => {
    focusProgress.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1.01, { duration: 150, easing: Easing.out(Easing.ease) });
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    focusProgress.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(1, { duration: 150 });
    props.onBlur?.(e);
  };

  return (
    <View className="mb-3">
      <Animated.View
        className={`flex-row items-center border rounded-lg px-4 h-[52px] ${className || ""}`}
        style={[{ backgroundColor: inputBg, borderWidth: 1 }, animatedStyle, style]}
      >
        {icon && <View className="mr-3 opacity-50">{icon}</View>}
        <TextInput
          {...props}
          placeholderTextColor={placeholderColor}
          className="flex-1 h-full text-[15px] font-sans-medium"
          style={{ color: textColor }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>

      {error && (
        <Animated.Text
          entering={FadeInUp.duration(200)}
          exiting={FadeOutUp.duration(150)}
          style={{ color: errorColor }}
          className="text-xs ml-4 mt-1 font-sans-medium"
        >
          {error}
        </Animated.Text>
      )}
    </View>
  );
}
