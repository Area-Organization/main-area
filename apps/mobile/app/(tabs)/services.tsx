import React, { useCallback, useState } from "react";
import { Alert, View, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices } from "@/hooks/use-services";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSession } from "@/ctx";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/components/ui/toast";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";

type Connection = {
  id: string;
  serviceName: string;
  createdAt: string;
};

// Map known services to their brand colors
const BRAND_COLORS: Record<string, string> = {
  discord: "#5865F2",
  spotify: "#1DB954",
  github: "#181717", // Handle dark mode visibility via border
  twitch: "#9146FF",
  gmail: "#e94538",
  slack: "#4A154B",
  notion: "#000000"
};

const ServiceTile = ({
  item,
  isConnected,
  onPress,
  loading
}: {
  item: any;
  isConnected: boolean;
  onPress: () => void;
  loading: boolean;
}) => {
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");

  const brandColor = BRAND_COLORS[item.name.toLowerCase()] || primaryColor;

  // Dynamic glow/border style based on connection status and brand color
  // We use inline styles here because Tailwind doesn't support dynamic class construction at runtime
  const dynamicStyle = isConnected
    ? {
        borderColor: brandColor,
        shadowColor: brandColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 2
      }
    : {
        borderColor: borderColor,
        borderWidth: 1
      };

  return (
    <Animated.View entering={FadeInDown.springify().damping(15)} className="flex-1">
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.7}
        className="aspect-square rounded-3xl p-4 items-center justify-center relative border"
        style={[{ backgroundColor: cardColor }, dynamicStyle]}
      >
        {/* Connected Badge */}
        {isConnected && (
          <View
            className="absolute top-3 right-3 w-5 h-5 rounded-full items-center justify-center z-10"
            style={{ backgroundColor: brandColor }}
          >
            <IconSymbol name="checkmark.circle.fill" size={12} color="#FFF" />
          </View>
        )}

        {/* Icon */}
        <View className="flex-1 justify-center items-center mb-2">
          {item.icon ? (
            <Image
              source={{ uri: item.icon }}
              style={{ width: 52, height: 52 }}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: isConnected ? brandColor + "20" : "#8881" }}
            >
              <ThemedText className="text-3xl font-black" style={{ color: isConnected ? brandColor : "#888" }}>
                {item.name[0].toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Text Info */}
        <View className="h-10 justify-start items-center">
          <ThemedText type="defaultSemiBold" className="capitalize text-center">
            {item.name}
          </ThemedText>
          <ThemedText className="text-[10px] opacity-60 mt-0.5">
            {isConnected ? "Connected" : "Tap to Connect"}
          </ThemedText>
        </View>

        {/* Loading State Overlay */}
        {loading && (
          <View
            className="absolute inset-0 rounded-3xl items-center justify-center opacity-90"
            style={{ backgroundColor: cardColor }}
          >
            <ThemedText className="text-xs font-bold" style={{ color: primaryColor }}>
              Processing...
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ServicesScreen() {
  const { client } = useSession();
  const { services, refresh: refreshServices, loading: loadingServices } = useServices();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const toast = useToast();
  const insets = useSafeAreaInsets();

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
        toast.error(String(error.value));
        return;
      }
      if (!data) return;

      const result = await WebBrowser.openAuthSessionAsync(data.authUrl, callbackUrl);

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const status = url.searchParams.get("status");
        if (status === "success") {
          toast.success(`Connected to ${serviceName}`);
          fetchData();
        } else {
          toast.error("Connection not established");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (connectionId: string, serviceName: string) => {
    Alert.alert("Disconnect", `Disconnect ${serviceName}? Active AREAs using this service will stop working.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: async () => {
          setActionLoading(serviceName);
          try {
            const { error } = await client.api.connections({ id: connectionId }).delete();
            if (error) {
              toast.error("Failed to disconnect service.");
            } else {
              toast.success(`${serviceName} disconnected`);
              fetchData();
            }
          } catch (e) {
            toast.error("An unexpected error occurred.");
          } finally {
            setActionLoading(null);
          }
        }
      }
    ]);
  };

  const handleTilePress = (item: any, connection: Connection | undefined) => {
    if (connection) {
      handleDisconnect(connection.id, item.name);
    } else {
      handleConnect(item.name);
    }
  };

  const isLoading = loadingServices || loadingConnections;

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="px-5 mb-4">
        <ThemedText type="title">Services</ThemedText>
        <ThemedText className="opacity-60 text-sm">Tap a tile to connect or disconnect.</ThemedText>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
        renderItem={({ item }) => {
          const connection = connections.find((c) => c.serviceName === item.name);
          return (
            <ServiceTile
              item={item}
              isConnected={!!connection}
              loading={actionLoading === item.name}
              onPress={() => handleTilePress(item, connection)}
            />
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="p-10 items-center justify-center">
              <ThemedText className="text-center opacity-60">No services available.</ThemedText>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}
