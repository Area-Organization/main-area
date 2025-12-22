import React from "react";
import { View, TextInput, Switch, Text } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface ParamInputsProps {
  params: Record<string, any>;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function ParamInputs({ params, values, onChange }: ParamInputsProps) {
  if (!params || Object.keys(params).length === 0) {
    return <ThemedText className="italic text-gray-500 text-xs">No parameters required.</ThemedText>;
  }

  return (
    <View className="gap-4 mt-1.5">
      {Object.entries(params).map(([key, config]) => {
        const label = config.label || key;
        const value = values[key] !== undefined ? values[key] : "";

        return (
          <View key={key} className="gap-1.5">
            <ThemedText type="defaultSemiBold" className="capitalize">
              {label} {config.required && <Text style={{ color: "red" }}>*</Text>}
            </ThemedText>

            {config.description ? (
              <ThemedText className="text-xs text-gray-500 mb-1.5">{config.description}</ThemedText>
            ) : null}

            {config.type === "boolean" ? (
              <Switch value={!!value} onValueChange={(val) => onChange(key, val)} />
            ) : (
              <TextInput
                className="border border-gray-300 rounded-lg p-2.5 bg-white min-h-[40px] text-black"
                value={value.toString()}
                onChangeText={(text) => onChange(key, text)}
                placeholder={`Enter ${label}`}
                placeholderTextColor="#999"
                keyboardType={config.type === "number" ? "numeric" : "default"}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
