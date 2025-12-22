import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  className,
  ...otherProps
}: ThemedViewProps & { className?: string }) {
  // Note: For complex dynamic colors passed as props, inline styles are still valid.
  // But for the default theme background, we use the class.
  return <View className={`bg-background ${className || ""}`} style={style} {...otherProps} />;
}
