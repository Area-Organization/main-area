import React, { useState } from "react";
import { StyleSheet, Alert, Button, View, FlatList, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices } from "@/hooks/use-services";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSession } from "@/ctx";

export default function ServicesScreen() {
  const { client } = useSession();
  const { services, refresh } = useServices();
  const [loading, setLoading] = useState<string | null>(null);

  const handleConnect = async (serviceName: string) => {
    setLoading(serviceName);
    try {
      const callbackUrl = Linking.createURL("oauth-callback");
      const { data, error } = await client.api.connections.oauth2({ serviceName })["auth-url"].get({
        query: { callbackUrl }
      });

      if (error) {
        Alert.alert("Error", String(error.value) || "Failed to get auth URL");
        return;
      }

      if (!data) {
        Alert.alert("Error", "No data received");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.authUrl, callbackUrl);

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const status = url.searchParams.get("status");
        const message = url.searchParams.get("message");

        if (status === "error") {
          Alert.alert("Connection Failed", message || "Unknown error");
        } else if (status === "success") {
          Alert.alert("Success", `Connected to ${serviceName}`);
          refresh();
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setLoading(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Services
      </ThemedText>

      <FlatList
        data={services}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            </View>
            <ThemedText style={styles.description}>{item.description}</ThemedText>

            <View style={styles.buttonContainer}>
              {loading === item.name ? (
                <ActivityIndicator color="#0a7ea4" />
              ) : (
                <Button title="Connect" onPress={() => handleConnect(item.name)} />
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
  title: { marginBottom: 20 },
  list: { paddingBottom: 40 },
  card: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(150,150,150,0.1)",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    color: "#666"
  },
  buttonContainer: {
    alignItems: "flex-start"
  }
});
