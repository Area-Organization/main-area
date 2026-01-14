import React from "react";
import { ScrollView, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Service } from "@/hooks/use-services";
import { ParamInputs } from "@/components/param-inputs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { useAreaWizard } from "@/hooks/use-area-wizard";
import { WiringDiagram } from "@/components/wizard/wiring-diagram";
import { SuccessConfetti } from "@/components/wizard/confetti";

export default function CreateAreaWizard() {
  const insets = useSafeAreaInsets();
  const wizard = useAreaWizard();

  const primaryColor = useThemeColor({}, "primary");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");
  const destructiveColor = useThemeColor({}, "notification");

  // --- Render Functions ---

  const renderServiceGrid = (servicesList: Service[], type: "action" | "reaction") => (
    <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
      <View className="px-5 py-2 flex-row items-center gap-2">
        {(wizard.wizardStep > 1 || (wizard.wizardStep === 1 && wizard.subStep !== "SERVICE")) && (
          <TouchableOpacity onPress={wizard.goBackSubStep}>
            <IconSymbol
              name="chevron.right"
              size={24}
              color={mutedColor}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        )}
        <ThemedText type="subtitle">{type === "reaction" ? "Add Reaction" : "Select Action Service"}</ThemedText>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {servicesList.length === 0 ? (
          <ThemedText className="opacity-60 mt-10 w-full text-center">No matching services found.</ThemedText>
        ) : (
          servicesList.map((s, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => wizard.handleServiceSelect(s, type)}
              className="w-[48%] aspect-square rounded-2xl border items-center justify-center p-4 gap-3"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                <ThemedText className="text-2xl font-bold text-primary">{s.name[0].toUpperCase()}</ThemedText>
              </View>
              <ThemedText className="font-semibold capitalize text-center">{s.name}</ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Animated.View>
  );

  const renderEventList = (service: Service, type: "action" | "reaction") => {
    const events = type === "action" ? service.actions : service.reactions;
    return (
      <Animated.View entering={SlideInRight} exiting={SlideOutRight} className="flex-1">
        <View className="px-5 py-2 flex-row items-center gap-2 mb-2">
          <TouchableOpacity onPress={wizard.goBackSubStep}>
            <IconSymbol
              name="chevron.right"
              size={24}
              color={mutedColor}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
          <ThemedText type="subtitle" className="capitalize">
            {service.name} {type}s
          </ThemedText>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
          {events.map((item: any, i: number) => (
            <TouchableOpacity
              key={i}
              onPress={() => wizard.handleEventSelect(item, type)}
              className="p-4 rounded-xl border flex-row items-center justify-between"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <View className="flex-1 mr-2">
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText className="text-xs opacity-60 mt-1">{item.description}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={mutedColor} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderConfig = (item: any, params: any, setParams: any, onNext: () => void, availableVars: any[] = []) => (
    <Animated.View entering={SlideInRight} exiting={SlideOutRight} className="flex-1 flex flex-col">
      <View className="px-5 py-2 flex-row items-center gap-2">
        <TouchableOpacity onPress={wizard.goBackSubStep}>
          <IconSymbol name="chevron.right" size={24} color={mutedColor} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Configure</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="p-5 rounded-xl border mb-6" style={{ backgroundColor: cardColor, borderColor }}>
          <ThemedText type="defaultSemiBold" className="text-primary mb-2">
            Selected: {item.name}
          </ThemedText>
          <ParamInputs
            params={item.params}
            values={params}
            onChange={(k, v) => setParams((prev: any) => ({ ...prev, [k]: v }))}
            availableVariables={availableVars}
          />
        </View>
      </ScrollView>

      <View className="p-5 border-t" style={{ borderColor }}>
        <Button title="Continue" onPress={onNext} />
      </View>
    </Animated.View>
  );

  const renderReactionList = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
      <View className="px-5 py-2 flex-row items-center gap-2">
        <TouchableOpacity onPress={wizard.goBackSubStep}>
          <IconSymbol name="chevron.right" size={24} color={mutedColor} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Reactions</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <TouchableOpacity
          onPress={() => wizard.setSubStep("SERVICE")}
          className="p-4 rounded-xl border border-dashed flex-row items-center justify-center gap-2"
          style={{ borderColor: primaryColor, backgroundColor: primaryColor + "10" }}
        >
          <IconSymbol name="plus.circle.fill" size={24} color={primaryColor} />
          <ThemedText className="text-primary font-bold">Add Reaction</ThemedText>
        </TouchableOpacity>

        {wizard.configuredReactions.map((r, i) => (
          <View
            key={r.id}
            className="p-4 rounded-xl border flex-row items-center justify-between"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <View className="flex-1">
              <ThemedText type="defaultSemiBold" className="capitalize">
                {r.service.name}
              </ThemedText>
              <ThemedText className="text-sm opacity-60">{r.reaction.name}</ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => wizard.handleDeleteReaction(r.id)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${destructiveColor}15` }}
            >
              <MaterialIcons name="delete" size={22} color={destructiveColor} />
            </TouchableOpacity>
          </View>
        ))}

        {wizard.configuredReactions.length === 0 && (
          <ThemedText className="text-center opacity-40 mt-10">Add at least one reaction to proceed.</ThemedText>
        )}
      </ScrollView>

      <View className="p-5 border-t" style={{ borderColor }}>
        <Button
          title="Next Step"
          onPress={() => wizard.setWizardStep(3)}
          disabled={wizard.configuredReactions.length === 0}
        />
      </View>
    </Animated.View>
  );

  const renderConnectionStep = () => (
    <Animated.View entering={FadeIn.delay(200)} className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <WiringDiagram
          actionService={wizard.actionService}
          reactions={wizard.configuredReactions}
          pulseProgress={wizard.pulseProgress}
        />

        <View className="px-6 gap-6">
          <View>
            <ThemedText type="subtitle" className="mb-4 text-center">
              Finalize Connection
            </ThemedText>
            <View className="bg-card border border-border rounded-xl p-4 gap-4">
              <View className="gap-1.5">
                <ThemedText type="defaultSemiBold">
                  Name your Area <ThemedText className="text-red-500">*</ThemedText>
                </ThemedText>
                <Input
                  placeholder="e.g. Sync Tweets to Discord"
                  value={wizard.areaName}
                  onChangeText={wizard.setAreaName}
                  style={{ backgroundColor: "transparent" }}
                />
              </View>
              <View className="gap-1.5">
                <ThemedText type="defaultSemiBold">Description</ThemedText>
                <Input
                  placeholder="Optional"
                  value={wizard.areaDescription}
                  onChangeText={wizard.setAreaDescription}
                  style={{ backgroundColor: "transparent" }}
                />
              </View>
            </View>
          </View>

          <Button
            title={wizard.submitting ? "Wiring it up..." : "Create AREA"}
            onPress={wizard.handleCreate}
            loading={wizard.submitting}
            className="mt-2"
          />
          <Button title="Back" variant="secondary" onPress={wizard.goBackSubStep} disabled={wizard.submitting} />
        </View>
      </ScrollView>
    </Animated.View>
  );

  // --- Main Logic ---

  const actionServices = wizard.services.filter((s) => s.actions && s.actions.length > 0);
  const reactionServices = wizard.services.filter((s) => s.reactions && s.reactions.length > 0);

  if (wizard.loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText className="mt-4">Loading magic...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      <SuccessConfetti active={wizard.showConfetti} />

      <View className="h-16 flex-row items-center px-5 justify-between border-b border-border/50">
        <View>
          <ThemedText type="subtitle">
            {wizard.wizardStep === 1
              ? "Step 1: The Trigger"
              : wizard.wizardStep === 2
                ? "Step 2: Reactions"
                : "Step 3: Connect"}
          </ThemedText>
          <View className="flex-row gap-1 mt-1">
            <View className={`h-1 rounded-full ${wizard.wizardStep >= 1 ? "bg-primary w-8" : "bg-muted w-2"}`} />
            <View className={`h-1 rounded-full ${wizard.wizardStep >= 2 ? "bg-primary w-8" : "bg-muted w-2"}`} />
            <View className={`h-1 rounded-full ${wizard.wizardStep >= 3 ? "bg-primary w-8" : "bg-muted w-2"}`} />
          </View>
        </View>
        {wizard.wizardStep === 1 && wizard.subStep === "SERVICE" && (
          <Button title="Reset" variant="outline" onPress={wizard.resetForm} className="h-8 px-3 text-xs" />
        )}
      </View>

      <View className="flex-1">
        {wizard.wizardStep === 1 && (
          <>
            {wizard.subStep === "SERVICE" && renderServiceGrid(actionServices, "action")}
            {wizard.subStep === "EVENT" && wizard.actionService && renderEventList(wizard.actionService, "action")}
            {wizard.subStep === "CONFIG" &&
              wizard.selectedAction &&
              renderConfig(
                wizard.selectedAction,
                wizard.actionParams,
                wizard.setActionParams,
                wizard.handleActionComplete
              )}
          </>
        )}

        {wizard.wizardStep === 2 && (
          <>
            {wizard.subStep === "LIST" && renderReactionList()}
            {wizard.subStep === "SERVICE" && renderServiceGrid(reactionServices, "reaction")}
            {wizard.subStep === "EVENT" &&
              wizard.tempReactionService &&
              renderEventList(wizard.tempReactionService, "reaction")}
            {wizard.subStep === "CONFIG" &&
              wizard.tempSelectedReaction &&
              renderConfig(
                wizard.tempSelectedReaction,
                wizard.tempReactionParams,
                wizard.setTempReactionParams,
                wizard.handleAddReaction,
                wizard.selectedAction?.variables
              )}
          </>
        )}

        {wizard.wizardStep === 3 && renderConnectionStep()}
      </View>
    </ThemedView>
  );
}
