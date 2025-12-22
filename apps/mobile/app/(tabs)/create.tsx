import React, { useState, useCallback } from "react";
import { ScrollView, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices, Service } from "@/hooks/use-services";
import { useRouter, useFocusEffect } from "expo-router";
import { ParamInputs } from "@/components/param-inputs";
import { useSession } from "@/ctx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = "SELECT_ACTION_SERVICE" | "SELECT_ACTION" | "SELECT_REACTION_SERVICE" | "SELECT_REACTION" | "CONFIGURE";

export default function CreateAreaScreen() {
  const router = useRouter();
  const { client } = useSession();
  const { services, refresh: refreshServices, loading: loadingServices } = useServices();
  const [step, setStep] = useState<Step>("SELECT_ACTION_SERVICE");
  const insets = useSafeAreaInsets();

  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  const mutedColor = useThemeColor({}, "muted");

  const [actionService, setActionService] = useState<Service | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [reactionService, setReactionService] = useState<Service | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<any>(null);

  const [areaName, setAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");
  const [actionParams, setActionParams] = useState<Record<string, any>>({});
  const [reactionParams, setReactionParams] = useState<Record<string, any>>({});

  const [submitting, setSubmitting] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setLoadingConnections(true);
        try {
          await refreshServices();
          const { data } = await client.api.connections.get();
          if (isActive && data?.connections) {
            setConnections(data.connections);
          }
        } catch (e) {
          console.error("Failed to refresh create screen data", e);
        } finally {
          if (isActive) setLoadingConnections(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [client])
  );

  const resetForm = () => {
    setStep("SELECT_ACTION_SERVICE");
    setActionService(null);
    setSelectedAction(null);
    setReactionService(null);
    setSelectedReaction(null);
    setAreaName("");
    setAreaDescription("");
    setActionParams({});
    setReactionParams({});
  };

  const handleServiceSelect = (service: Service, type: "action" | "reaction") => {
    const connection = connections.find((c) => c.serviceName === service.name);

    if (!connection) {
      Alert.alert("Connection Required", `Connect to ${service.name} in Services tab first.`, [
        { text: "Cancel", style: "cancel" },
        { text: "Go to Services", onPress: () => router.navigate("/(tabs)/services") }
      ]);
      return;
    }

    if (type === "action") {
      setActionService(service);
      setStep("SELECT_ACTION");
    } else {
      setReactionService(service);
      setStep("SELECT_REACTION");
    }
  };

  const handleItemSelect = (item: any, type: "action" | "reaction") => {
    if (type === "action") {
      setSelectedAction(item);
      setStep("SELECT_REACTION_SERVICE");
    } else {
      setSelectedReaction(item);
      setStep("CONFIGURE");
    }
  };

  const handleSubmit = async () => {
    if (!areaName.trim()) return Alert.alert("Error", "Name required");

    setSubmitting(true);
    try {
      const payload = {
        name: areaName,
        description: areaDescription || undefined,
        action: {
          serviceName: actionService!.name,
          actionName: selectedAction.name,
          params: actionParams,
          connectionId: connections.find((c) => c.serviceName === actionService!.name).id
        },
        reaction: {
          serviceName: reactionService!.name,
          reactionName: selectedReaction.name,
          params: reactionParams,
          connectionId: connections.find((c) => c.serviceName === reactionService!.name).id
        }
      };

      const { error } = await client.api.areas.post(payload);

      if (error) {
        throw new Error(typeof error.value === "object" ? (error.value as any).message : String(error.value));
      }

      Alert.alert("Success", "AREA created!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            router.navigate("/(tabs)");
          }
        }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create AREA");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOption = (label: string, sub: string, onPress: () => void) => (
    <TouchableOpacity
      className="p-4 rounded-lg border flex-row items-center justify-between"
      style={{ backgroundColor: cardColor, borderColor }}
      onPress={onPress}
    >
      <View className="flex-1">
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
        <ThemedText className="text-xs opacity-60">{sub}</ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={20} color={mutedColor} />
    </TouchableOpacity>
  );

  if (loadingConnections || loadingServices) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText className="mt-5">Loading services...</ThemedText>
      </ThemedView>
    );
  }

  const actionServices = services.filter((s) => s.actions && s.actions.length > 0);
  const reactionServices = services.filter((s) => s.reactions && s.reactions.length > 0);

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="px-5 flex-row justify-between items-center mb-2.5">
        <ThemedText type="title">Create</ThemedText>
        {step !== "SELECT_ACTION_SERVICE" && (
          <Button title="Reset" variant="secondary" onPress={resetForm} className="h-9 px-3" />
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        {step === "SELECT_ACTION_SERVICE" && (
          <>
            <ThemedText type="subtitle" className="mb-4">
              1. Select Trigger Service
            </ThemedText>
            {actionServices.length === 0 ? (
              <ThemedText className="italic opacity-60">No services with actions available.</ThemedText>
            ) : (
              actionServices.map((s, i) => (
                <View key={i} className="mb-2">
                  {renderOption(s.name, s.description, () => handleServiceSelect(s, "action"))}
                </View>
              ))
            )}
          </>
        )}

        {step === "SELECT_ACTION" && actionService && (
          <>
            <ThemedText type="subtitle" className="mb-4">
              2. Select Trigger
            </ThemedText>
            {actionService.actions.map((a: any, i: number) => (
              <View key={i} className="mb-2">
                {renderOption(a.name, a.description, () => handleItemSelect(a, "action"))}
              </View>
            ))}
          </>
        )}

        {step === "SELECT_REACTION_SERVICE" && (
          <>
            <ThemedText type="subtitle" className="mb-4">
              3. Select Action Service
            </ThemedText>
            {reactionServices.map((s, i) => (
              <View key={i} className="mb-2">
                {renderOption(s.name, s.description, () => handleServiceSelect(s, "reaction"))}
              </View>
            ))}
          </>
        )}

        {step === "SELECT_REACTION" && reactionService && (
          <>
            <ThemedText type="subtitle" className="mb-4">
              4. Select Action
            </ThemedText>
            {reactionService.reactions.map((r: any, i: number) => (
              <View key={i} className="mb-2">
                {renderOption(r.name, r.description, () => handleItemSelect(r, "reaction"))}
              </View>
            ))}
          </>
        )}

        {step === "CONFIGURE" && selectedAction && selectedReaction && (
          <View className="gap-5">
            <View className="p-5 rounded-lg border" style={{ backgroundColor: cardColor, borderColor }}>
              <ThemedText type="defaultSemiBold">Area Details</ThemedText>
              <View className="gap-2.5 mt-2.5">
                <Input placeholder="Name" value={areaName} onChangeText={setAreaName} />
                <Input placeholder="Description" value={areaDescription} onChangeText={setAreaDescription} />
              </View>
            </View>

            <View className="p-5 rounded-lg border" style={{ backgroundColor: cardColor, borderColor }}>
              <ThemedText type="defaultSemiBold" style={{ color: primaryColor }}>
                IF: {selectedAction.name}
              </ThemedText>
              <ParamInputs
                params={selectedAction.params}
                values={actionParams}
                onChange={(k, v) => setActionParams((prev) => ({ ...prev, [k]: v }))}
              />
            </View>

            <View className="p-5 rounded-lg border" style={{ backgroundColor: cardColor, borderColor }}>
              <ThemedText type="defaultSemiBold" style={{ color: primaryColor }}>
                THEN: {selectedReaction.name}
              </ThemedText>
              <ParamInputs
                params={selectedReaction.params}
                values={reactionParams}
                onChange={(k, v) => setReactionParams((prev) => ({ ...prev, [k]: v }))}
              />
            </View>

            <Button title={submitting ? "Creating..." : "Create Area"} onPress={handleSubmit} loading={submitting} />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
