import React, { useCallback, useState } from "react";
import { View, RefreshControl, Alert, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/ctx";
import { Button } from "@/components/ui/button";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { AreaType, AreaStatsResponseType } from "@area/types";
import { useToast } from "@/components/ui/toast";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EmptyState } from "@/components/empty-state";
import { AutomationCard } from "@/components/automation-card";
import { GlassStatCard } from "@/components/glass-stat-card";

export default function HomeScreen() {
  const { client, signOut, user } = useSession();
  const [areas, setAreas] = useState<AreaType[]>([]);
  const [stats, setStats] = useState<AreaStatsResponseType | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const router = useRouter();

  const primaryColor = useThemeColor({}, "primary");

  const fetchData = async () => {
    setLoading(true);
    try {
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
    setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !currentStatus } : a)));

    try {
      const { error } = await client.api.areas({ id }).toggle.post();
      if (error) throw new Error("Failed to toggle");

      const statsReq = await client.api.areas.stats.overview.get();
      if (statsReq.data) setStats(statsReq.data);
    } catch (e) {
      setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: currentStatus } : a)));
      toast.error("Failed to update status");
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
            toast.success("Area deleted");
            fetchData();
          } catch (e) {
            toast.error("Failed to delete area");
          }
        }
      }
    ]);
  };

  const handleEdit = (id: string) => {
    router.push(`/edit-area/${id}`);
  };

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 pb-5 flex-row justify-between items-center z-10">
        <View>
          <ThemedText type="subtitle" className="text-primary">
            Welcome back,
          </ThemedText>
          <ThemedText type="title">{user?.name || "User"}</ThemedText>
        </View>
        <Button title="Log Out" onPress={signOut} variant="outline" className="h-10 rounded-full" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid Section */}
        {stats && areas.length > 0 && (
          <View className="flex-row px-5 mb-6 gap-3">
            <GlassStatCard value={stats.activeAreas} subLabel="Active" color="#10b981" delay={0} />
            <GlassStatCard value={stats.totalTriggers} subLabel="Triggers" color={primaryColor} delay={100} />
            <GlassStatCard value={stats.totalAreas} subLabel="Total" color="#f59e0b" delay={200} />
          </View>
        )}

        {/* List Section */}
        <View className="px-5 flex-1">
          <ThemedText type="subtitle" className="mb-4">
            My Automations
          </ThemedText>

          {areas.length === 0 && !loading ? (
            <EmptyState
              title="No AREAs Created Yet"
              description="Connect your services and create your first automation to see the magic happen."
              icon={<IconSymbol name="plus.circle.fill" size={80} color={primaryColor} />}
              actionLabel="Create your first AREA"
              onAction={() => router.push("/(tabs)/create")}
            />
          ) : (
            areas.map((area, index) => (
              <AutomationCard
                key={area.id}
                item={area}
                index={index}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onEdit={handleEdit}
                primaryColor={primaryColor}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
