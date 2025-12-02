import React from "react";
import { View, TextInput, StyleSheet, Switch, Text } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface ParamInputsProps {
  params: Record<string, any>;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function ParamInputs({ params, values, onChange }: ParamInputsProps) {
  if (!params || Object.keys(params).length === 0) {
    return <ThemedText style={styles.noParams}>No parameters required.</ThemedText>;
  }

  return (
    <View style={styles.container}>
      {Object.entries(params).map(([key, config]) => {
        const label = config.label || key;
        const value = values[key] !== undefined ? values[key] : "";

        return (
          <View key={key} style={styles.field}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              {label} {config.required && <Text style={{ color: "red" }}>*</Text>}
            </ThemedText>

            {config.description ? <ThemedText style={styles.description}>{config.description}</ThemedText> : null}

            {config.type === "boolean" ? (
              <Switch value={!!value} onValueChange={(val) => onChange(key, val)} />
            ) : (
              <TextInput
                style={styles.input}
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

const styles = StyleSheet.create({
  container: { gap: 15, marginTop: 5 },
  field: { gap: 5 },
  label: { textTransform: "capitalize" },
  description: { fontSize: 12, color: "#666", marginBottom: 5 },
  noParams: { fontStyle: "italic", color: "#666", fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    minHeight: 40,
    color: "#000"
  }
});
