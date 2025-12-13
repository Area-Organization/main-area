import React, { useState } from "react";
import { StyleSheet, Alert, View, FlatList } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices } from "@/hooks/use-services";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSession } from "@/ctx";
import { Layout } from "@/constants/theme";
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ServicesScreen() {
  const { client } = useSession();
  const { services, refresh } = useServices();
  const [loading, setLoading] = useState<string | null>(null);

  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  const handleConnect = async (serviceName: string) => {
    setLoading(serviceName);
    try {
      const callbackUrl = Linking.createURL("oauth-callback");
      const { data, error } = await client.api.connections.oauth2({ serviceName })["auth-url"].get({
        query: { callbackUrl }
      });

      if (error) {
        Alert.alert("Error", String(error.value));
        return;
      }
      if (!data) return;

      const result = await WebBrowser.openAuthSessionAsync(data.authUrl, callbackUrl);

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const status = url.searchParams.get("status");
        if (status === "success") {
          Alert.alert("Success", `Connected to ${serviceName}`);
          refresh();
        } else {
          Alert.alert("Failed", "Connection not established");
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.cardContent}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                {item.name}
              </ThemedText>
              <ThemedText style={styles.description}>{item.description}</ThemedText>

              <View style={styles.badges}>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{item.actions.length} Triggers</ThemedText>
                </View>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{item.reactions.length} Actions</ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.action}>
              <Button
                title={loading === item.name ? "..." : "Connect"}
                onPress={() => handleConnect(item.name)}
                variant="outline"
                loading={loading === item.name}
                style={{ height: 40, borderRadius: 12 }}
              />
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  title: { marginBottom: 20 },
  list: { paddingBottom: 40, gap: 15 },
  card: {
    padding: 16,
    borderRadius: Layout.radius,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardContent: { flex: 1, paddingRight: 10 },
  description: { fontSize: 13, color: "#888", marginVertical: 4 },
  action: { width: 100 },
  badges: { flexDirection: "row", gap: 5, marginTop: 5 },
  badge: { backgroundColor: "rgba(124, 58, 237, 0.1)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, color: "#7C3AED", fontWeight: "600" }
});
