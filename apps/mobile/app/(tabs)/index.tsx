import React, { useCallback, useState } from "react";
import { View, RefreshControl, Alert, ScrollView, Switch } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/ctx";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/button";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { AreaType, AreaStatsResponseType } from "@area/types";

export default function HomeScreen() {
  const { client, signOut, user } = useSession();
  const [areas, setAreas] = useState<AreaType[]>([]);
  const [stats, setStats] = useState<AreaStatsResponseType | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const cardBackgroundColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for speed
      const [areasReq, statsReq] = await Promise.all([client.api.areas.get(), client.api.areas.stats.overview.get()]);

      if (areasReq.data) {
        setAreas(areasReq.data.areas);
      }
      if (statsReq.data) {
        setStats(statsReq.data);
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

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic UI Update
    setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !currentStatus } : a)));

    try {
      const { error } = await client.api.areas({ id }).toggle.post();
      if (error) {
        throw new Error("Failed to toggle");
      }
      // Refresh stats to update "Active" count
      const statsReq = await client.api.areas.stats.overview.get();
      if (statsReq.data) setStats(statsReq.data);
    } catch (e) {
      // Revert on failure
      setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: currentStatus } : a)));
      Alert.alert("Error", "Failed to update area status");
    }
  };

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
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
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
        {/* Stats Section */}
        {stats && (
          <View className="flex-row gap-3 mb-6">
            <View
              className="flex-1 p-4 rounded-2xl border items-center"
              style={{ backgroundColor: cardBackgroundColor, borderColor }}
            >
              <ThemedText type="title" style={{ color: primaryColor }}>
                {stats.activeAreas}
              </ThemedText>
              <ThemedText className="text-xs opacity-60">Active</ThemedText>
            </View>
            <View
              className="flex-1 p-4 rounded-2xl border items-center"
              style={{ backgroundColor: cardBackgroundColor, borderColor }}
            >
              <ThemedText type="title" style={{ color: primaryColor }}>
                {stats.totalTriggers}
              </ThemedText>
              <ThemedText className="text-xs opacity-60">Triggers</ThemedText>
            </View>
            <View
              className="flex-1 p-4 rounded-2xl border items-center"
              style={{ backgroundColor: cardBackgroundColor, borderColor }}
            >
              <ThemedText type="title" style={{ color: primaryColor }}>
                {stats.totalAreas}
              </ThemedText>
              <ThemedText className="text-xs opacity-60">Total</ThemedText>
            </View>
          </View>
        )}

        <View className="flex-row justify-between items-baseline mb-4">
          <ThemedText type="subtitle">My Automations</ThemedText>
        </View>

        {areas.length === 0 && !loading ? (
          <View
            className="p-10 rounded-2xl border border-dashed items-center justify-center"
            style={{ borderColor, backgroundColor: cardBackgroundColor }}
          >
            <IconSymbol name="plus.circle.fill" size={48} color={primaryColor} />
            <ThemedText className="mt-2.5 text-center">You haven&apos;t created any AREAs yet.</ThemedText>
          </View>
        ) : (
          <View className="gap-4">
            {areas.map((area) => {
              const actionService = area.action?.serviceName;
              const reactionService = area.reaction?.serviceName;
              const isEnabled = area.enabled;

              return (
                <View
                  key={area.id}
                  className="p-4 rounded-2xl border shadow-sm"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderColor,
                    opacity: isEnabled ? 1 : 0.6
                  }}
                >
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

                    <Switch
                      value={isEnabled}
                      onValueChange={() => handleToggle(area.id, isEnabled)}
                      trackColor={{ true: primaryColor, false: "#767577" }}
                    />
                  </View>

                  <ThemedText type="defaultSemiBold" className="text-lg">
                    {area.name || "Untitled Area"}
                  </ThemedText>
                  {area.description ? (
                    <ThemedText className="text-sm text-[#888] mt-1">{area.description}</ThemedText>
                  ) : null}

                  <View className="h-[1px] bg-[#eee] my-3" />

                  <View className="flex-row justify-between items-end">
                    <View className="gap-1 flex-1">
                      <ThemedText className="text-sm opacity-80" numberOfLines={1}>
                        <ThemedText className="font-bold">IF </ThemedText>
                        {area.action?.actionName}
                      </ThemedText>
                      <ThemedText className="text-sm opacity-80" numberOfLines={1}>
                        <ThemedText className="font-bold">THEN </ThemedText>
                        {area.reaction?.reactionName}
                      </ThemedText>
                    </View>
                    <Button
                      title="Delete"
                      variant="destructive"
                      onPress={() => handleDelete(area.id)}
                      className="h-8 px-3 rounded-lg ml-2"
                    />
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
