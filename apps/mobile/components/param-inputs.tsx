import React, { useState } from "react";
import { View, TextInput, Switch, Text, TouchableOpacity, Modal, FlatList, Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Variable {
  name: string;
  description: string;
}

interface ParamInputsProps {
  params: Record<string, any>;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  availableVariables?: Variable[];
}

export function ParamInputs({ params, values, onChange, availableVariables }: ParamInputsProps) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [selectionMap, setSelectionMap] = useState<Record<string, number>>({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [targetField, setTargetField] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");
  const inputBg = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const insets = useSafeAreaInsets();

  if (!params || Object.keys(params).length === 0) {
    return <ThemedText className="italic text-gray-500 text-xs">No parameters required.</ThemedText>;
  }

  const handleSelectionChange = (key: string, start: number) => {
    setSelectionMap((prev) => ({ ...prev, [key]: start }));
  };

  const openVariableModal = (key: string) => {
    setTargetField(key);
    setModalVisible(true);
  };

  const insertVariable = (variableName: string) => {
    const token = `{{${variableName}}}`;
    if (targetField) {
      const currentValue = values[targetField] || "";
      const cursor = selectionMap[targetField] ?? currentValue.length;
      const newValue = currentValue.slice(0, cursor) + token + currentValue.slice(cursor);
      onChange(targetField, newValue);
      setSelectionMap((prev) => ({ ...prev, [targetField]: cursor + token.length }));
    }
    setModalVisible(false);
  };

  return (
    <View className="gap-4 mt-1.5">
      {Object.entries(params).map(([key, config]) => {
        const label = config.label || key;
        const value = values[key] !== undefined ? values[key] : "";
        const isFocused = activeField === key;
        const hasVariables = availableVariables && availableVariables.length > 0;

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
              <View
                className="flex-row items-center border rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: inputBg,
                  borderColor: isFocused ? primaryColor : borderColor,
                  borderWidth: isFocused ? 1.5 : 1
                }}
              >
                <TextInput
                  className="flex-1 p-3.5 min-h-[50px] text-base"
                  style={{ color: textColor }}
                  value={value.toString()}
                  onChangeText={(text) => onChange(key, text)}
                  onFocus={() => setActiveField(key)}
                  onBlur={() => setActiveField(null)}
                  onSelectionChange={(e) => handleSelectionChange(key, e.nativeEvent.selection.start)}
                  placeholder={`Enter ${label}`}
                  placeholderTextColor="#A1A1AA"
                  keyboardType={config.type === "number" ? "numeric" : "default"}
                />

                {hasVariables && config.type === "string" && (
                  <TouchableOpacity
                    onPress={() => openVariableModal(key)}
                    className="p-3 mr-1 opacity-80 active:opacity-100"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={primaryColor} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setModalVisible(false)}>
          <Pressable
            className="bg-white dark:bg-zinc-900 rounded-t-3xl overflow-hidden max-h-[60%]"
            style={{ paddingBottom: insets.bottom }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-4 border-b border-gray-100 dark:border-zinc-800 flex-row justify-between items-center bg-gray-50/50 dark:bg-zinc-900">
              <View>
                <ThemedText type="subtitle">Insert Variable</ThemedText>
                <ThemedText className="text-xs opacity-60">Tap to insert at cursor</ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800"
              >
                <IconSymbol name="chevron.right" size={20} color="#666" style={{ transform: [{ rotate: "90deg" }] }} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableVariables}
              keyExtractor={(item) => item.name}
              contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
              ItemSeparatorComponent={() => <View className="h-2" />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => insertVariable(item.name)}
                  className="flex-row items-center p-4 rounded-xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 active:bg-gray-50 dark:active:bg-zinc-700"
                >
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                    <ThemedText className="text-primary font-bold text-sm">{"{ }"}</ThemedText>
                  </View>
                  <View className="flex-1 gap-0.5">
                    <ThemedText type="defaultSemiBold">{`{{${item.name}}}`}</ThemedText>
                    <ThemedText className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={2}>
                      {item.description}
                    </ThemedText>
                  </View>
                  <IconSymbol name="plus.circle.fill" size={20} color={primaryColor} />
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
