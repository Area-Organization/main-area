import React, { useCallback, useState } from "react";
import { Alert, View, FlatList, RefreshControl } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices } from "@/hooks/use-services";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSession } from "@/ctx";
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

// We use the inferred type from the API response for connections
type Connection = {
  id: string;
  serviceName: string;
  createdAt: string;
};

export default function ServicesScreen() {
  const { client } = useSession();
  const { services, refresh: refreshServices, loading: loadingServices } = useServices();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");

  const fetchData = async () => {
    setLoadingConnections(true);
    try {
      await refreshServices();
      const { data } = await client.api.connections.get();
      if (data && data.connections) {
        setConnections(data.connections);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoadingConnections(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleConnect = async (serviceName: string) => {
    setActionLoading(serviceName);
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
          fetchData(); // Refresh list to show "Disconnect" button
        } else {
          Alert.alert("Failed", "Connection not established");
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (connectionId: string, serviceName: string) => {
    Alert.alert("Disconnect", `Are you sure you want to disconnect ${serviceName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: async () => {
          setActionLoading(serviceName);
          try {
            const { error } = await client.api.connections({ id: connectionId }).delete();

            if (error) {
              if (error.status === 409) {
                Alert.alert(
                  "Cannot Disconnect",
                  "This service is currently used by one or more of your AREAs. Please delete those AREAs first."
                );
              } else {
                Alert.alert("Error", "Failed to disconnect service.");
              }
            } else {
              fetchData(); // Refresh list to show "Connect" button
            }
          } catch (e) {
            Alert.alert("Error", "An unexpected error occurred.");
          } finally {
            setActionLoading(null);
          }
        }
      }
    ]);
  };

  const isLoading = loadingServices || loadingConnections;

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="px-5 mb-2">
        <ThemedText type="title">Services</ThemedText>
        <ThemedText className="opacity-60 text-sm">Connect your accounts to enable automations.</ThemedText>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 15 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
        renderItem={({ item }) => {
          const connection = connections.find((c) => c.serviceName === item.name);
          const isConnected = !!connection;
          const isActing = actionLoading === item.name;

          return (
            <View className="p-5 rounded-2xl border" style={{ backgroundColor: cardColor, borderColor }}>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <ThemedText type="defaultSemiBold" className="text-xl capitalize">
                      {item.name}
                    </ThemedText>
                    {isConnected && (
                      <View className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                        <IconSymbol name="checkmark.circle.fill" size={12} color="#15803d" />
                        <ThemedText className="text-[10px] font-bold text-green-700 dark:text-green-300">
                          CONNECTED
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText className="text-sm opacity-60 leading-5">{item.description}</ThemedText>
                </View>

                {/* Service Icon Placeholder - using first letter */}
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: isConnected ? primaryColor : "rgba(150,150,150,0.1)" }}
                >
                  <ThemedText className="font-bold text-lg" style={{ color: isConnected ? "#FFF" : "#888" }}>
                    {item.name[0].toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View className="h-[1px] bg-border opacity-50 my-3" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row gap-3">
                  <View className="flex-row items-center gap-1">
                    <IconSymbol name="bolt.fill" size={14} color={primaryColor} />
                    <ThemedText className="text-xs font-medium opacity-80">{item.actions.length} Triggers</ThemedText>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <IconSymbol name="gear" size={14} color={primaryColor} />
                    <ThemedText className="text-xs font-medium opacity-80">{item.reactions.length} Actions</ThemedText>
                  </View>
                </View>

                <View className="w-28">
                  {isConnected ? (
                    <Button
                      title={isActing ? "..." : "Disconnect"}
                      onPress={() => connection && handleDisconnect(connection.id, item.name)}
                      variant="destructive" // Red button
                      loading={isActing}
                      className="h-9 px-0 rounded-lg"
                    />
                  ) : (
                    <Button
                      title={isActing ? "..." : "Connect"}
                      onPress={() => handleConnect(item.name)}
                      variant="outline"
                      loading={isActing}
                      className="h-9 px-0 rounded-lg"
                    />
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />
    </ThemedView>
  );
}
