import React, { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View, Button, Alert } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useServices, Service } from "@/hooks/use-services";
import { useRouter } from "expo-router";

type Step = "SELECT_ACTION_SERVICE" | "SELECT_ACTION" | "SELECT_REACTION_SERVICE" | "SELECT_REACTION" | "CONFIGURE";

export default function CreateAreaScreen() {
  const router = useRouter();
  const { services } = useServices();
  const [step, setStep] = useState<Step>("SELECT_ACTION_SERVICE");

  // Selection State
  const [actionService, setActionService] = useState<Service | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [reactionService, setReactionService] = useState<Service | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<any>(null);

  // Configuration State (For params)
  const [actionParams, setActionParams] = useState<Record<string, string>>({});

  const handleServiceSelect = (service: Service, type: "action" | "reaction") => {
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

  const handleSubmit = () => {
    console.log("Creating AREA:", {
      action: `${actionService?.name}.${selectedAction?.name}`,
      reaction: `${reactionService?.name}.${selectedReaction?.name}`,
      params: actionParams
    });
    Alert.alert("Success", "AREA Created successfully (Mock)!", [{ text: "OK", onPress: () => router.back() }]);
  };

  // Helper to render lists
  const renderList = (data: any[], onPress: (item: any) => void, keyProp = "name") => (
    <ScrollView style={styles.list}>
      {data.map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.card} onPress={() => onPress(item)}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={{ fontSize: 12 }}>{item.description}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

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
          <ThemedText type="subtitle">2. Choose an Trigger (Action)</ThemedText>
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
        <ScrollView style={styles.list}>
          <ThemedText type="subtitle">5. Review & Configure</ThemedText>
          <View style={styles.summary}>
            <ThemedText>
              IF: {actionService?.name} - {selectedAction?.name}
            </ThemedText>
            <ThemedText>
              THEN: {reactionService?.name} - {selectedReaction?.name}
            </ThemedText>
          </View>

          <Button title="Create Area" onPress={handleSubmit} />
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
  summary: {
    padding: 20,
    backgroundColor: "#e1f5fe",
    borderRadius: 10,
    marginBottom: 20
  }
});
