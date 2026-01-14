import React, { useCallback, useState } from "react";
import {
  Alert,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices, Service } from "@/hooks/use-services";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSession } from "@/ctx";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceTile } from "@/components/service-tile";

type Connection = {
  id: string;
  serviceName: string;
  createdAt: string;
};

const ApiKeyModal = ({
  visible,
  service,
  onClose,
  onSubmit,
  loading
}: {
  visible: boolean;
  service: Service | null;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
  loading: boolean;
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const cardColor = useThemeColor({}, "card");

  React.useEffect(() => {
    setValues({});
  }, [service]);

  if (!service) return null;

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="rounded-t-3xl p-6 gap-6" style={{ backgroundColor: cardColor }}>
          <View className="flex-row justify-between items-center">
            <ThemedText type="subtitle">Connect {service.name}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <ThemedText className="opacity-60 text-sm">
            {service.description || "Enter the required credentials to connect this service."}
          </ThemedText>

          <ScrollView className="max-h-[300px]">
            {service.authFields?.map((field) => (
              <View key={field.key} className="mb-4">
                <ThemedText type="defaultSemiBold" className="mb-2">
                  {field.label} {field.required && <ThemedText className="text-red-500">*</ThemedText>}
                </ThemedText>
                <Input
                  placeholder={field.description || `Enter ${field.label}`}
                  value={values[field.key] || ""}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, [field.key]: text }))}
                  secureTextEntry={field.type === "password"}
                  autoCapitalize="none"
                />
              </View>
            ))}
          </ScrollView>

          <Button title={loading ? "Connecting..." : "Connect Service"} onPress={handleSubmit} loading={loading} />
          <View className="h-4" />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function ServicesScreen() {
  const { client } = useSession();
  const { services, refresh: refreshServices, loading: loadingServices } = useServices();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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

  const handleOAuthConnect = async (serviceName: string) => {
    setActionLoading(serviceName);
    try {
      const callbackUrl = Linking.createURL("oauth-callback");
      const { data, error } = await client.api.connections.oauth2({ serviceName })["auth-url"].get({
        query: { callbackUrl }
      });

      if (error) {
        toast.error(typeof error.value === "string" ? error.value : (error.value as any).message || "OAuth Error");
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

  const handleApiKeySubmit = async (values: Record<string, string>) => {
    if (!selectedService) return;

    const missingField = selectedService.authFields?.find((f) => f.required && !values[f.key]);
    if (missingField) {
      toast.error(`${missingField.label} is required`);
      return;
    }

    setActionLoading(selectedService.name);
    try {
      const payload: any = {
        serviceName: selectedService.name,
        accessToken: values["accessToken"],
        metadata: values
      };

      const { error } = await client.api.connections.post(payload);

      if (error) {
        toast.error(typeof error.value === "object" ? (error.value as any).message : "Failed to connect");
      } else {
        toast.success(`Connected to ${selectedService.name}`);
        setModalVisible(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.message || "Connection failed");
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

  const handleTilePress = (item: Service, connection: Connection | undefined) => {
    if (connection) {
      handleDisconnect(connection.id, item.name);
    } else {
      if (item.authType === "oauth2") {
        handleOAuthConnect(item.name);
      } else if (item.authType === "api_key") {
        setSelectedService(item);
        setModalVisible(true);
      } else {
        toast.success("No authentication required for this service");
      }
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

      <ApiKeyModal
        visible={modalVisible}
        service={selectedService}
        onClose={() => setModalVisible(false)}
        onSubmit={handleApiKeySubmit}
        loading={!!actionLoading}
      />
    </ThemedView>
  );
}
