import React from "react";
import { TextInput, TextInputProps } from "react-native";

export function Input({ className, style, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#A1A1AA"
      className={`h-[50px] border border-input rounded-2xl px-4 text-base bg-background text-foreground ${className || ""}`}
      style={style}
    />
  );
}
