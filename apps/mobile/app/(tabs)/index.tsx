import React, { useCallback, useState } from "react";
import { View, RefreshControl, Alert, ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/ctx";
import { Button } from "@/components/ui/button";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { AreaType, AreaStatsResponseType } from "@area/types";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
  FadeInDown,
  Extrapolation,
  FadeInRight,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { useToast } from "@/components/ui/toast";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EmptyState } from "@/components/empty-state";

// --- Constants & Types ---
const BUTTON_WIDTH = 80;

// --- 1. Custom Switch Component ---
interface CustomSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  primaryColor: string;
}

function CustomSwitch({ value, onValueChange, primaryColor }: CustomSwitchProps) {
  const offset = useSharedValue(value ? 22 : 2);

  const toggleSwitch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onValueChange(!value);
  };

  React.useEffect(() => {
    offset.value = withSpring(value ? 22 : 2, {
      mass: 0.8,
      damping: 15,
      stiffness: 120
    });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(offset.value, [2, 22], ["#3f3f46", primaryColor]);

    const shadowOpacity = interpolate(offset.value, [2, 22], [0, 0.4]);

    return {
      backgroundColor,
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity,
      shadowRadius: 8,
      elevation: value ? 5 : 0
    };
  });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }]
  }));

  return (
    <Pressable onPress={toggleSwitch} hitSlop={10}>
      <Animated.View style={[{ width: 50, height: 30, borderRadius: 15, justifyContent: "center" }, trackStyle]}>
        <Animated.View
          style={[
            {
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2.5,
              elevation: 2
            },
            knobStyle
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

// --- 2. Automation Card Component ---
interface AutomationCardProps {
  item: AreaType;
  index: number;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
  onEdit: (id: string) => void;
  primaryColor: string;
}

function AutomationCard({ item, index, onDelete, onToggle, onEdit, primaryColor }: AutomationCardProps) {
  const translateX = useSharedValue(0);
  const context = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  const getServiceInitial = (name?: string) => (name ? name[0].toUpperCase() : "?");

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onStart(() => {
      context.value = translateX.value;
      isSwiping.value = true;
      runOnJS(Haptics.selectionAsync)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value;
    })
    .onEnd(() => {
      isSwiping.value = false;
      if (translateX.value > BUTTON_WIDTH / 2) {
        translateX.value = withSpring(BUTTON_WIDTH, { velocity: 10, overshootClamping: true });
      } else if (translateX.value < -BUTTON_WIDTH / 2) {
        translateX.value = withSpring(-BUTTON_WIDTH, { velocity: 10, overshootClamping: true });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, BUTTON_WIDTH], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [0, BUTTON_WIDTH], [0.8, 1], Extrapolation.CLAMP) }],
    zIndex: -1
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-BUTTON_WIDTH, 0], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-BUTTON_WIDTH, 0], [1, 0.8], Extrapolation.CLAMP) }],
    zIndex: -1
  }));

  const handleEditPress = () => {
    onEdit(item.id);
    translateX.value = withSpring(0);
  };

  const handleDeletePress = () => {
    onDelete(item.id);
    translateX.value = withSpring(0);
  };

  const cardBackgroundColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} className="mb-4 relative">
      <View style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: "hidden", flexDirection: "row" }]}>
        <Animated.View
          style={[
            { width: BUTTON_WIDTH, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" },
            leftActionStyle
          ]}
        >
          <Pressable
            onPress={handleEditPress}
            style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
          >
            <MaterialIcons name="edit" size={24} color="white" />
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold", marginTop: 4 }}>EDIT</Text>
          </Pressable>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View
          style={[
            { width: BUTTON_WIDTH, backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center" },
            rightActionStyle
          ]}
        >
          <Pressable
            onPress={handleDeletePress}
            style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
          >
            <MaterialIcons name="delete" size={24} color="white" />
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold", marginTop: 4 }}>DELETE</Text>
          </Pressable>
        </Animated.View>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            rStyle,
            {
              backgroundColor: cardBackgroundColor,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: borderColor,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2
            }
          ]}
        >
          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-primary/10">
                <ThemedText className="font-bold text-primary">
                  {getServiceInitial(item.action?.serviceName)}
                </ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={16} color="#999" />
              <View className="w-8 h-8 rounded-lg items-center justify-center bg-primary/10">
                <ThemedText className="font-bold text-primary">
                  {getServiceInitial(item.reaction?.serviceName)}
                </ThemedText>
              </View>
            </View>

            <CustomSwitch
              value={item.enabled}
              onValueChange={(val) => onToggle(item.id, item.enabled)}
              primaryColor={primaryColor}
            />
          </View>

          <ThemedText type="defaultSemiBold" className="text-lg">
            {item.name || "Untitled Area"}
          </ThemedText>
          {item.description ? (
            <ThemedText className="text-sm opacity-60 mt-1" numberOfLines={1}>
              {item.description}
            </ThemedText>
          ) : null}

          <View className="h-[1px] bg-border my-3 opacity-50" />

          <View className="gap-1">
            <ThemedText className="text-sm opacity-80" numberOfLines={1}>
              <ThemedText className="font-bold text-primary">IF </ThemedText>
              {item.action?.actionName}
            </ThemedText>
            <ThemedText className="text-sm opacity-80" numberOfLines={1}>
              <ThemedText className="font-bold text-primary">THEN </ThemedText>
              {item.reaction?.reactionName}
            </ThemedText>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

// --- 3. Glass Stat Card Component ---
function GlassStatCard({
  value,
  label,
  subLabel,
  delay = 0,
  color
}: {
  value: number | string;
  label?: string;
  subLabel: string;
  delay?: number;
  color: string;
}) {
  const isDark = useThemeColor({}, "background") === "#09090B";

  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify().damping(12)}
      style={{
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        borderRadius: 20,
        padding: 16,
        minWidth: 120,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <ThemedText type="title" style={{ color: color, fontSize: 26, marginBottom: 2 }}>
        {value}
      </ThemedText>
      <ThemedText className="text-xs opacity-60 font-bold uppercase tracking-wider">{subLabel}</ThemedText>
    </Animated.View>
  );
}

// --- Main Home Screen ---
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
    toast.success("Edit coming soon!");
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
        {/* Horizontal Stats Section */}
        {stats && areas.length > 0 && (
          <View className="mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              <GlassStatCard value={stats.activeAreas} subLabel="Active" color="#10b981" delay={0} />
              <GlassStatCard value={stats.totalTriggers} subLabel="Triggers" color={primaryColor} delay={100} />
              <GlassStatCard value={stats.totalAreas} subLabel="Total" color="#f59e0b" delay={200} />
            </ScrollView>
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
