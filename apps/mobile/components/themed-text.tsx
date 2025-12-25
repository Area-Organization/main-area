import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  className,
  ...rest
}: ThemedTextProps & { className?: string }) {
  const getBaseClass = () => {
    switch (type) {
      case "title":
        return "text-4xl font-bold leading-tight";
      case "defaultSemiBold":
        return "text-base leading-6 font-semibold";
      case "subtitle":
        return "text-xl font-bold";
      case "link":
        return "text-base leading-7 text-[#0a7ea4]";
      default:
        return "text-base leading-6";
    }
  };

  return <Text className={`text-foreground ${getBaseClass()} ${className || ""}`} style={style} {...rest} />;
}
