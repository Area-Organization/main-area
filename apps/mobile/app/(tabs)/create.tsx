import React, { useState, useCallback } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices, Service } from "@/hooks/use-services";
import { useRouter, useFocusEffect } from "expo-router";
import { ParamInputs } from "@/components/param-inputs";
import { useSession } from "@/ctx";
import { Layout } from "@/constants/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";

type Step = "SELECT_ACTION_SERVICE" | "SELECT_ACTION" | "SELECT_REACTION_SERVICE" | "SELECT_REACTION" | "CONFIGURE";

export default function CreateAreaScreen() {
  const router = useRouter();
  const { client } = useSession();
  const { services, refresh: refreshServices, loading: loadingServices } = useServices();
  const [step, setStep] = useState<Step>("SELECT_ACTION_SERVICE");

  // Colors
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "primary");
  const mutedColor = useThemeColor({}, "muted");

  // Selection State
  const [actionService, setActionService] = useState<Service | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [reactionService, setReactionService] = useState<Service | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<any>(null);

  // Configuration State
  const [areaName, setAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");
  const [actionParams, setActionParams] = useState<Record<string, any>>({});
  const [reactionParams, setReactionParams] = useState<Record<string, any>>({});

  const [submitting, setSubmitting] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Refresh data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setLoadingConnections(true);
        try {
          // 1. Refresh Services list
          await refreshServices();

          // 2. Refresh Connections
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
            // Navigate back to home
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
    <TouchableOpacity style={[styles.card, { backgroundColor: cardColor, borderColor }]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
        <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>{sub}</ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={20} color={mutedColor} />
    </TouchableOpacity>
  );

  if (loadingConnections || loadingServices) {
    return (
      <ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={{ marginTop: 20 }}>Loading services...</ThemedText>
      </ThemedView>
    );
  }

  // Filter lists safely
  const actionServices = services.filter((s) => s.actions && s.actions.length > 0);
  const reactionServices = services.filter((s) => s.reactions && s.reactions.length > 0);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Create</ThemedText>
        {step !== "SELECT_ACTION_SERVICE" && (
          <Button title="Reset" variant="secondary" onPress={resetForm} style={{ height: 36, paddingHorizontal: 12 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {step === "SELECT_ACTION_SERVICE" && (
          <>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              1. Select Trigger Service
            </ThemedText>
            {actionServices.length === 0 ? (
              <ThemedText style={{ fontStyle: "italic", opacity: 0.6 }}>No services with actions available.</ThemedText>
            ) : (
              actionServices.map((s, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  {renderOption(s.name, s.description, () => handleServiceSelect(s, "action"))}
                </View>
              ))
            )}
          </>
        )}

        {step === "SELECT_ACTION" && actionService && (
          <>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              2. Select Trigger
            </ThemedText>
            {actionService.actions.map((a: any, i: number) => (
              <View key={i} style={{ marginBottom: 8 }}>
                {renderOption(a.name, a.description, () => handleItemSelect(a, "action"))}
              </View>
            ))}
          </>
        )}

        {step === "SELECT_REACTION_SERVICE" && (
          <>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              3. Select Action Service
            </ThemedText>
            {reactionServices.map((s, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                {renderOption(s.name, s.description, () => handleServiceSelect(s, "reaction"))}
              </View>
            ))}
          </>
        )}

        {step === "SELECT_REACTION" && reactionService && (
          <>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              4. Select Action
            </ThemedText>
            {reactionService.reactions.map((r: any, i: number) => (
              <View key={i} style={{ marginBottom: 8 }}>
                {renderOption(r.name, r.description, () => handleItemSelect(r, "reaction"))}
              </View>
            ))}
          </>
        )}

        {step === "CONFIGURE" && selectedAction && selectedReaction && (
          <View style={{ gap: 20 }}>
            <View style={[styles.card, { backgroundColor: cardColor, borderColor, padding: 20 }]}>
              <ThemedText type="defaultSemiBold">Area Details</ThemedText>
              <View style={{ gap: 10, marginTop: 10 }}>
                <Input placeholder="Name" value={areaName} onChangeText={setAreaName} />
                <Input placeholder="Description" value={areaDescription} onChangeText={setAreaDescription} />
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: cardColor, borderColor, padding: 20 }]}>
              <ThemedText type="defaultSemiBold" style={{ color: primaryColor }}>
                IF: {selectedAction.name}
              </ThemedText>
              <ParamInputs
                params={selectedAction.params}
                values={actionParams}
                onChange={(k, v) => setActionParams((prev) => ({ ...prev, [k]: v }))}
              />
            </View>

            <View style={[styles.card, { backgroundColor: cardColor, borderColor, padding: 20 }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  scroll: { padding: 20, paddingBottom: 50 },
  stepTitle: { marginBottom: 15 },
  card: {
    padding: 16,
    borderRadius: Layout.radius,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
