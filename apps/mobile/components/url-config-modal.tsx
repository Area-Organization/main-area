import React, { useState, useEffect } from "react";
import { Modal, View, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getApiUrl, setApiUrl } from "@/lib/url-store";

interface UrlConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export function UrlConfigModal({ visible, onClose }: UrlConfigModalProps) {
  const [tempUrl, setTempUrl] = useState("");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const bg = useThemeColor({}, "background");

  // Load current URL when opening
  useEffect(() => {
    if (visible) {
      setTempUrl(getApiUrl());
    }
  }, [visible]);

  const handleSave = async () => {
    let url = tempUrl.trim();
    if (!url) {
      Alert.alert("Invalid URL", "Please enter a valid URL.");
      return;
    }
    // Auto-fix missing http/https
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `http://${url}`;
    }

    await setApiUrl(url);

    onClose();

    Alert.alert("URL Updated", "The backend URL has been updated.", [{ text: "OK" }]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black/60 justify-center items-center p-6"
      >
        <View className="w-full rounded-2xl p-6 gap-4 shadow-xl" style={{ backgroundColor: cardColor }}>
          <ThemedText type="subtitle">Backend Configuration</ThemedText>

          <View className="border rounded-xl px-4 py-3" style={{ backgroundColor: bg, borderColor }}>
            <TextInput
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="e.g. http://192.168.1.5:8080"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              style={{ color: textColor, fontSize: 16 }}
            />
          </View>

          <View className="flex-row gap-3 mt-2">
            <Button title="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Save" onPress={handleSave} style={{ flex: 1 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
