import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Layout } from "@/constants/theme";

export function Input(props: TextInputProps) {
  const bg = useThemeColor({}, "background");
  const border = useThemeColor({}, "input");
  const text = useThemeColor({}, "text");
  const placeholderColor = "#A1A1AA";

  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderColor}
      style={[
        styles.input,
        { backgroundColor: bg, borderColor: border, color: text, borderRadius: Layout.radius },
        props.style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16
  }
});
