import React from "react";
import { ScrollView, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { ServiceIcon } from "@/components/service-icon";
import { BRAND_COLORS } from "@/lib/service-utils";

export default function EditAreaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const wizard = useAreaWizard(id); // Initialize in edit mode
  const router = useRouter();

  const primaryColor = useThemeColor({}, "primary");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const iconColor = useThemeColor({}, "icon");
  const destructiveColor = useThemeColor({}, "notification");

  if (wizard.isFetchingInitialData) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText className="mt-4">Loading AREA details...</ThemedText>
      </ThemedView>
    );
  }

  const renderServiceGrid = (servicesList: Service[], type: "action" | "reaction") => (
    <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
      <View className="px-5 py-2 flex-row items-center gap-2">
        {(wizard.wizardStep > 1 || (wizard.wizardStep === 1 && wizard.subStep !== "SERVICE")) && (
          <TouchableOpacity onPress={wizard.goBackSubStep}>
            <IconSymbol
              name="chevron.right"
              size={24}
              color={iconColor}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        )}
        <ThemedText type="subtitle">{type === "reaction" ? "Add Reaction" : "Select Action Service"}</ThemedText>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {servicesList.map((s, i) => {
          const color = BRAND_COLORS[s.name.toLowerCase()] || primaryColor;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => wizard.handleServiceSelect(s, type)}
              className="w-[48%] aspect-square rounded-2xl border items-center justify-center p-4 gap-3"
              style={{ backgroundColor: cardColor, borderColor }}
            >
              <View className="w-12 h-12 items-center justify-center">
                <ServiceIcon serviceName={s.name} size={40} color={color} />
              </View>
              <ThemedText className="font-semibold capitalize text-center">{s.name}</ThemedText>
            </TouchableOpacity>
          );
        })}
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
              color={iconColor}
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
              <IconSymbol name="chevron.right" size={20} color={iconColor} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderConfig = (item: any, params: any, setParams: any, onNext: () => void, availableVars: any[] = []) => {
    const isReaction = wizard.wizardStep === 2 && wizard.subStep === "CONFIG";
    return (
      <Animated.View entering={SlideInRight} exiting={SlideOutRight} className="flex-1 flex flex-col">
        <View className="px-5 py-2 flex-row items-center gap-2">
          <TouchableOpacity onPress={wizard.goBackSubStep}>
            <IconSymbol
              name="chevron.right"
              size={24}
              color={iconColor}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
          <ThemedText type="subtitle">Configure</ThemedText>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
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

          {isReaction && (
            <View className="mb-6">
              <Button
                title={wizard.testingReaction ? "Testing..." : "Preview Action"}
                variant="secondary"
                onPress={wizard.handleTestReaction}
                loading={wizard.testingReaction}
                className="border-dashed border-2 border-primary/30"
              />
              <ThemedText className="text-xs text-center mt-2 opacity-50">
                This will execute the reaction immediately with mock data.
              </ThemedText>
            </View>
          )}
        </ScrollView>
        <View className="p-5 border-t" style={{ borderColor }}>
          <Button title="Continue" onPress={onNext} />
        </View>
      </Animated.View>
    );
  };

  const renderReactionList = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
      <View className="px-5 py-2 flex-row items-center gap-2">
        <TouchableOpacity onPress={wizard.goBackSubStep}>
          <IconSymbol name="chevron.right" size={24} color={iconColor} style={{ transform: [{ rotate: "180deg" }] }} />
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
        {wizard.configuredReactions.map((r) => (
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
          title="Review Changes"
          onPress={() => wizard.setWizardStep(3)}
          disabled={wizard.configuredReactions.length === 0}
        />
      </View>
    </Animated.View>
  );

  const renderConnectionStep = () => (
    <Animated.View entering={FadeIn.delay(200)} className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
        <WiringDiagram
          actionService={wizard.actionService}
          reactions={wizard.configuredReactions}
          pulseProgress={wizard.pulseProgress}
        />
        <View className="px-6 gap-6">
          <View>
            <ThemedText type="subtitle" className="mb-4 text-center">
              Update Area Details
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
            title={wizard.submitting ? "Updating..." : "Save Changes"}
            onPress={wizard.handleCreate}
            loading={wizard.submitting}
            className="mt-2"
          />
          <Button title="Back" variant="secondary" onPress={wizard.goBackSubStep} disabled={wizard.submitting} />
        </View>
      </ScrollView>
    </Animated.View>
  );

  const actionServices = wizard.services.filter((s) => s.actions && s.actions.length > 0);
  const reactionServices = wizard.services.filter((s) => s.reactions && s.reactions.length > 0);

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Custom Header for Edit Mode */}
      <View className="h-16 flex-row items-center px-5 gap-3 border-b border-border/50 z-10">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Edit AREA</ThemedText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
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
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
