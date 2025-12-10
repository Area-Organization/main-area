import React, { useCallback, useState } from "react";
import { StyleSheet, View, RefreshControl, Alert, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/ctx";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Layout } from "@/constants/theme";
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

  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await client.api.areas.get();

      if (error) {
        console.error("API Error:", error);
        return;
      }

      // Debug: Log the data to see exactly what the backend returns
      console.log("Fetched Areas Data:", JSON.stringify(data, null, 2));

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
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="subtitle" style={{ color: primaryColor }}>
            Welcome back,
          </ThemedText>
          <ThemedText type="title">{user?.name || "User"}</ThemedText>
        </View>
        <Button title="Log Out" onPress={signOut} variant="outline" style={{ height: 40, borderRadius: 20 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
      >
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">My Automations</ThemedText>
          <ThemedText style={{ color: "#888" }}>{areas.length} active</ThemedText>
        </View>

        {areas.length === 0 && !loading ? (
          <View style={[styles.emptyState, { borderColor, backgroundColor: cardColor }]}>
            <IconSymbol name="plus.circle.fill" size={48} color={primaryColor} />
            <ThemedText style={{ marginTop: 10, textAlign: "center" }}>You haven&apos;t created any AREAs yet.</ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {areas.map((area) => {
              // Safety check: if area is malformed, skip rendering detailed info or render fallback
              if (!area || !area.id) return null;

              const actionService = area.action?.serviceName;
              const reactionService = area.reaction?.serviceName;

              return (
                <View key={area.id} style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconRow}>
                      <View style={[styles.serviceIcon, { backgroundColor: primaryColor + "20" }]}>
                        <ThemedText style={{ fontWeight: "bold", color: primaryColor }}>
                          {getServiceInitial(actionService)}
                        </ThemedText>
                      </View>
                      <IconSymbol name="chevron.right" size={16} color="#999" />
                      <View style={[styles.serviceIcon, { backgroundColor: primaryColor + "20" }]}>
                        <ThemedText style={{ fontWeight: "bold", color: primaryColor }}>
                          {getServiceInitial(reactionService)}
                        </ThemedText>
                      </View>
                    </View>
                    <Button
                      title="Delete"
                      variant="destructive"
                      onPress={() => handleDelete(area.id)}
                      style={{ height: 32, paddingHorizontal: 12, borderRadius: 8 }}
                    />
                  </View>

                  <ThemedText type="defaultSemiBold" style={styles.areaName}>
                    {area.name || "Untitled Area"}
                  </ThemedText>
                  {area.description ? <ThemedText style={styles.areaDesc}>{area.description}</ThemedText> : null}

                  <View style={styles.divider} />

                  <View style={styles.logicRow}>
                    <ThemedText style={styles.logicText}>
                      <ThemedText style={{ fontWeight: "bold" }}>IF </ThemedText>
                      {area.action?.actionName || "Unknown Trigger"}
                    </ThemedText>
                    <ThemedText style={styles.logicText}>
                      <ThemedText style={{ fontWeight: "bold" }}>THEN </ThemedText>
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 15
  },
  list: { gap: 15 },
  emptyState: {
    padding: 40,
    borderRadius: Layout.radius,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed"
  },
  card: {
    padding: 16,
    borderRadius: Layout.radius,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  areaName: { fontSize: 18 },
  areaDesc: { fontSize: 14, color: "#888", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
  logicRow: { gap: 4 },
  logicText: { fontSize: 14, opacity: 0.8 }
});
