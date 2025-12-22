import React, { useState } from "react";
import { Alert, View, FlatList } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices } from "@/hooks/use-services";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSession } from "@/ctx";
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ServicesScreen() {
  const { client } = useSession();
  const { services, refresh } = useServices();
  const [loading, setLoading] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

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
    <ThemedView className="flex-1 px-5" style={{ paddingTop: insets.top }}>
      <ThemedText type="title" className="mb-5">
        Services
      </ThemedText>

      <FlatList
        data={services}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: 40, gap: 15 }}
        renderItem={({ item }) => (
          <View
            className="p-4 rounded-lg border flex-row items-center justify-between"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <View className="flex-1 pr-2.5">
              <ThemedText type="defaultSemiBold" className="text-lg">
                {item.name}
              </ThemedText>
              <ThemedText className="text-sm text-[#888] my-1">{item.description}</ThemedText>

              <View className="flex-row gap-1.5 mt-1.5">
                <View className="bg-primary/10 px-1.5 py-0.5 rounded-sm">
                  <ThemedText className="text-xs text-primary font-semibold">{item.actions.length} Triggers</ThemedText>
                </View>
                <View className="bg-primary/10 px-1.5 py-0.5 rounded-sm">
                  <ThemedText className="text-xs text-primary font-semibold">
                    {item.reactions.length} Actions
                  </ThemedText>
                </View>
              </View>
            </View>
            <View className="w-25">
              <Button
                title={loading === item.name ? "..." : "Connect"}
                onPress={() => handleConnect(item.name)}
                variant="outline"
                loading={loading === item.name}
                className="h-10 rounded-xl"
              />
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}
