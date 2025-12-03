import React, { useState } from "react";
import { StyleSheet, Alert, Button, View, FlatList } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices } from "@/hooks/use-services";
import * as WebBrowser from "expo-web-browser";

export default function ServicesScreen() {
  const { services } = useServices();
  // Mock state for connected services
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  const handleConnect = async (serviceName: string) => {
    // 1. Open Browser (Simulate OAuth)
    // In real app, this URL comes from backend: /auth/github/login
    // We mock it by opening a generic page for now

    // Using google as a placeholder for the simulation
    const result = await WebBrowser.openBrowserAsync("https://google.com");

    // In a real OAuth flow with Deep Linking (which expo-web-browser handles),
    // the backend would redirect back to the app scheme.
    // For this mock, we just assume if they closed the browser, they might have logged in.

    if (result.type === "cancel" || result.type === "dismiss") {
      // Just for UX flow demonstration, we assume success if they browsed
      // In reality, we'd wait for a deep link callback
    }

    // 2. Simulate success
    setConnected((prev) => ({ ...prev, [serviceName]: true }));
    Alert.alert("Success", `Connected to ${serviceName}`);
  };

  const handleDisconnect = (serviceName: string) => {
    setConnected((prev) => ({ ...prev, [serviceName]: false }));
    Alert.alert("Disconnected", `Disconnected from ${serviceName}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Services
      </ThemedText>
      <ThemedText style={styles.subHeader}>Manage your connected accounts.</ThemedText>

      <FlatList
        data={services}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                {item.name}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: "#666" }}>{item.description}</ThemedText>
              {item.requiresAuth && (
                <View style={styles.authTag}>
                  <ThemedText style={styles.authTagText}>Requires Auth</ThemedText>
                </View>
              )}
            </View>
            <View style={styles.action}>
              {item.requiresAuth ? (
                connected[item.name] ? (
                  <Button title="Disconnect" color="#ff5555" onPress={() => handleDisconnect(item.name)} />
                ) : (
                  <Button title="Connect" onPress={() => handleConnect(item.name)} />
                )
              ) : (
                <ThemedText style={{ fontSize: 12, fontStyle: "italic", color: "#888" }}>No Auth Needed</ThemedText>
              )}
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { marginBottom: 5 },
  subHeader: { marginBottom: 20, color: "#666" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(150,150,150,0.1)",
    borderWidth: 1,
    borderColor: "#ccc"
  },
  info: { flex: 1, gap: 5 },
  action: { minWidth: 100, alignItems: "flex-end" },
  authTag: {
    backgroundColor: "#eee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start"
  },
  authTagText: {
    fontSize: 10,
    color: "#555"
  }
});
