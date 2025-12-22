import React, { useCallback, useState } from "react";
import { View, RefreshControl, Alert, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/ctx";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/button";
import { useFocusEffect } from "expo-router";

type Area = {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  action?: { serviceName?: string; actionName?: string };
  reaction?: { serviceName?: string; reactionName?: string };
};

export default function HomeScreen() {
  const { client, signOut, user } = useSession();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.api.areas.get();
      if (error) {
        console.error("API Error:", error);
        return;
      }
      if (data && Array.isArray(data)) {
        setAreas(data);
      } else if (data && (data as any).areas) {
        setAreas((data as any).areas);
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Area", "Are you sure you want to delete this automation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await client.api.areas({ id }).delete();
            fetchData();
          } catch (e) {
            Alert.alert("Error", "Failed to delete area");
          }
        }
      }
    ]);
  };

  const getServiceInitial = (serviceName?: string) => {
    return serviceName ? serviceName[0].toUpperCase() : "?";
  };

  return (
    <ThemedView className="flex-1 pt-[60px]">
      <View className="px-5 pb-5 flex-row justify-between items-center">
        <View>
          <ThemedText type="subtitle" className="text-primary">
            Welcome back,
          </ThemedText>
          <ThemedText type="title">{user?.name || "User"}</ThemedText>
        </View>
        <Button title="Log Out" onPress={signOut} variant="outline" className="h-10 rounded-full" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
      >
        <View className="flex-row justify-between items-baseline mb-4">
          <ThemedText type="subtitle">My Automations</ThemedText>
          <ThemedText className="text-[#888]">{areas.length} active</ThemedText>
        </View>

        {areas.length === 0 && !loading ? (
          <View className="p-10 rounded-2xl border border-dashed border-border items-center justify-center bg-card">
            <IconSymbol name="plus.circle.fill" size={48} color="#7C3AED" />
            <ThemedText className="mt-2.5 text-center">You haven&apos;t created any AREAs yet.</ThemedText>
          </View>
        ) : (
          <View className="gap-4">
            {areas.map((area) => {
              if (!area || !area.id) return null;
              const actionService = area.action?.serviceName;
              const reactionService = area.reaction?.serviceName;

              return (
                <View key={area.id} className="p-4 rounded-2xl border border-border bg-card shadow-sm">
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View className="w-8 h-8 rounded-lg items-center justify-center bg-primary/20">
                        <ThemedText className="font-bold text-primary">{getServiceInitial(actionService)}</ThemedText>
                      </View>
                      <IconSymbol name="chevron.right" size={16} color="#999" />
                      <View className="w-8 h-8 rounded-lg items-center justify-center bg-primary/20">
                        <ThemedText className="font-bold text-primary">{getServiceInitial(reactionService)}</ThemedText>
                      </View>
                    </View>
                    <Button
                      title="Delete"
                      variant="destructive"
                      onPress={() => handleDelete(area.id)}
                      className="h-8 px-3 rounded-lg"
                    />
                  </View>

                  <ThemedText type="defaultSemiBold" className="text-lg">
                    {area.name || "Untitled Area"}
                  </ThemedText>
                  {area.description ? (
                    <ThemedText className="text-sm text-[#888] mt-1">{area.description}</ThemedText>
                  ) : null}

                  <View className="h-[1px] bg-[#eee] my-3" />

                  <View className="gap-1">
                    <ThemedText className="text-sm opacity-80">
                      <ThemedText className="font-bold">IF </ThemedText>
                      {area.action?.actionName || "Unknown Trigger"}
                    </ThemedText>
                    <ThemedText className="text-sm opacity-80">
                      <ThemedText className="font-bold">THEN </ThemedText>
                      {area.reaction?.reactionName || "Unknown Effect"}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
