import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Button,
  Alert,
  TextInput,
  ActivityIndicator
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices, Service } from "@/hooks/use-services";
import { useRouter } from "expo-router";
import { ParamInputs } from "@/components/param-inputs";
import { useSession } from "@/ctx";

type Step = "SELECT_ACTION_SERVICE" | "SELECT_ACTION" | "SELECT_REACTION_SERVICE" | "SELECT_REACTION" | "CONFIGURE";

export default function CreateAreaScreen() {
  const router = useRouter();
  const { client } = useSession();
  const { services } = useServices();
  const [step, setStep] = useState<Step>("SELECT_ACTION_SERVICE");

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

  // Loading & Data State
  const [submitting, setSubmitting] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Fetch connections on mount to ensure user is connected to services
  useEffect(() => {
    let mounted = true;
    const fetchConnections = async () => {
      try {
        const { data } = await client.api.connections.get();
        if (mounted && data?.connections) {
          setConnections(data.connections);
        }
      } catch (e) {
        console.error("Failed to fetch connections", e);
      } finally {
        if (mounted) setLoadingConnections(false);
      }
    };
    fetchConnections();
    return () => {
      mounted = false;
    };
  }, [client]);

  const handleServiceSelect = (service: Service, type: "action" | "reaction") => {
    const connection = connections.find((c) => c.serviceName === service.name);

    if (!connection) {
      Alert.alert(
        "Connection Required",
        `You are not connected to ${service.name}. Please connect in the Services tab first.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Services", onPress: () => router.navigate("/(tabs)/services") }
        ]
      );
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
    if (!areaName.trim()) {
      Alert.alert("Validation Error", "Please provide a name for your automation.");
      return;
    }

    if (!actionService || !selectedAction || !reactionService || !selectedReaction) {
      Alert.alert("Error", "Incomplete selection.");
      return;
    }

    const actionConnection = connections.find((c) => c.serviceName === actionService.name);
    const reactionConnection = connections.find((c) => c.serviceName === reactionService.name);

    if (!actionConnection || !reactionConnection) {
      Alert.alert("Error", "Missing required service connections.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: areaName,
        description: areaDescription || undefined,
        action: {
          serviceName: actionService.name,
          actionName: selectedAction.name,
          params: actionParams,
          connectionId: actionConnection.id
        },
        reaction: {
          serviceName: reactionService.name,
          reactionName: selectedReaction.name,
          params: reactionParams,
          connectionId: reactionConnection.id
        }
      };

      const { data, error } = await client.api.areas.post(payload);

      if (error) {
        const msg = typeof error.value === "object" && error.value ? (error.value as any).message : String(error.value);
        Alert.alert("Failed to create AREA", msg || "Unknown error occurred");
      } else {
        Alert.alert("Success", "AREA created successfully!", [
          { text: "OK", onPress: () => router.replace("/(tabs)") }
        ]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const renderList = (data: any[], onPress: (item: any) => void) => (
    <ScrollView style={styles.list}>
      {data.map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.card} onPress={() => onPress(item)}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={{ fontSize: 12 }}>{item.description}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loadingConnections) {
    return (
      <ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading connections...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        New Automation
      </ThemedText>

      {step === "SELECT_ACTION_SERVICE" && (
        <>
          <ThemedText type="subtitle">1. Choose a Service (If)</ThemedText>
          {renderList(
            services.filter((s) => s.actions.length > 0),
            (s) => handleServiceSelect(s, "action")
          )}
        </>
      )}

      {step === "SELECT_ACTION" && actionService && (
        <>
          <ThemedText type="subtitle">2. Choose a Trigger (Action)</ThemedText>
          {renderList(actionService.actions, (a) => handleItemSelect(a, "action"))}
        </>
      )}

      {step === "SELECT_REACTION_SERVICE" && (
        <>
          <ThemedText type="subtitle">3. Choose a Service (Then)</ThemedText>
          {renderList(
            services.filter((s) => s.reactions.length > 0),
            (s) => handleServiceSelect(s, "reaction")
          )}
        </>
      )}

      {step === "SELECT_REACTION" && reactionService && (
        <>
          <ThemedText type="subtitle">4. Choose an Effect (Reaction)</ThemedText>
          {renderList(reactionService.reactions, (r) => handleItemSelect(r, "reaction"))}
        </>
      )}

      {step === "CONFIGURE" && (
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }}>
          <ThemedText type="subtitle" style={{ marginBottom: 15 }}>
            5. Finalize Configuration
          </ThemedText>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
                General Info
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              <ThemedText type="defaultSemiBold">Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sync GitHub Issues to Email"
                placeholderTextColor="#999"
                value={areaName}
                onChangeText={setAreaName}
              />
              <ThemedText type="defaultSemiBold" style={{ marginTop: 10 }}>
                Description
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Optional description"
                placeholderTextColor="#999"
                value={areaDescription}
                onChangeText={setAreaDescription}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
                IF: {selectedAction?.name}
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              <ParamInputs
                params={selectedAction?.params}
                values={actionParams}
                onChange={(k, v) => setActionParams((prev) => ({ ...prev, [k]: v }))}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: "#e67e22" }]}>
              <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
                THEN: {selectedReaction?.name}
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              <ParamInputs
                params={selectedReaction?.params}
                values={reactionParams}
                onChange={(k, v) => setReactionParams((prev) => ({ ...prev, [k]: v }))}
              />
            </View>
          </View>

          <Button title={submitting ? "Creating..." : "Create Area"} onPress={handleSubmit} disabled={submitting} />
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  list: { flex: 1, marginTop: 10 },
  card: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(150,150,150,0.1)",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd"
  },
  sectionHeader: {
    backgroundColor: "#0a7ea4",
    padding: 10
  },
  sectionContent: {
    padding: 15,
    backgroundColor: "rgba(150,150,150,0.05)"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    minHeight: 40,
    color: "#000",
    marginTop: 5
  }
});
