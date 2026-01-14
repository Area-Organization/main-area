import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  BackHandler
} from "react-native";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  Easing,
  interpolate,
  SharedValue,
  useAnimatedProps,
  cancelAnimation
} from "react-native-reanimated";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useToast } from "@/components/ui/toast";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Create Animated components for SVG
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- Types ---
type WizardStep = 1 | 2 | 3;
type SubStep = "SERVICE" | "EVENT" | "CONFIG" | "LIST";

type ConfiguredReaction = {
  id: string;
  service: Service;
  reaction: any;
  params: Record<string, any>;
};

// --- Components ---

const ConfettiParticle = ({ index }: { index: number }) => {
  const x = useSharedValue(width / 2);
  const y = useSharedValue(Dimensions.get("window").height / 2);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
  const color = colors[index % colors.length];

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 150 + Math.random() * 200;
    const endX = width / 2 + Math.cos(angle) * velocity;
    const endY = Dimensions.get("window").height / 2 + Math.sin(angle) * velocity;

    scale.value = withSpring(1);

    x.value = withTiming(endX, { duration: 1200, easing: Easing.out(Easing.quad) });
    y.value = withTiming(endY, { duration: 1200, easing: Easing.out(Easing.quad) });
    rotation.value = withTiming(Math.random() * 720, { duration: 1200 });
    opacity.value = withDelay(600, withTiming(0, { duration: 600 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    top: 0,
    width: 10,
    height: 10,
    backgroundColor: color,
    borderRadius: 5,
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ]
  }));

  return <Animated.View style={style} />;
};

const SuccessConfetti = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" className="z-50 elevation-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </View>
  );
};

interface ConnectionStepProps {
  actionService: Service | null;
  reactions: ConfiguredReaction[];
  selectedAction: any;
  areaName: string;
  setAreaName: (val: string) => void;
  areaDescription: string;
  setAreaDescription: (val: string) => void;
  submitting: boolean;
  handleCreate: () => void;
  onBack: () => void;
  pulseProgress: SharedValue<number>;
}

function ConnectionStep({
  actionService,
  reactions,
  selectedAction,
  areaName,
  setAreaName,
  areaDescription,
  setAreaDescription,
  submitting,
  handleCreate,
  onBack,
  pulseProgress
}: ConnectionStepProps) {
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");

  const getServiceInitial = (name?: string) => (name ? name[0].toUpperCase() : "?");

  // Dimensions
  const cableHeight = 150;
  const padding = 60;
  // Simple cubic bezier curve
  const cablePath = `M ${padding} ${cableHeight / 2} C ${width / 2} ${cableHeight / 2}, ${width / 2} ${cableHeight / 2}, ${width - padding} ${cableHeight / 2}`;

  // Estimated path length for dash animation
  const pathLength = width - padding * 2;

  // 1. Animate the Circle moving along X
  const animatedCircleProps = useAnimatedProps(() => {
    const translateX = interpolate(pulseProgress.value, [0, 1], [padding, width - padding]);
    const opacity = interpolate(pulseProgress.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return {
      cx: translateX,
      opacity
    };
  });

  // 2. Animate the Line "Flowing" (Stroke Dash Offset)
  const animatedPathProps = useAnimatedProps(() => {
    // Dash array is [10, 10] -> 20 units total pattern
    const offset = interpolate(pulseProgress.value, [0, 1], [0, -pathLength]);
    const opacity = interpolate(pulseProgress.value, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

    return {
      strokeDashoffset: offset,
      strokeOpacity: opacity
    };
  });

  return (
    <Animated.View entering={FadeIn.delay(200)} className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View className="items-center justify-center my-8">
          <View style={{ width: width, height: cableHeight }}>
            <Svg height={cableHeight} width={width} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={primaryColor} stopOpacity="0.4" />
                  <Stop offset="0.5" stopColor={primaryColor} stopOpacity="1" />
                  <Stop offset="1" stopColor={primaryColor} stopOpacity="0.4" />
                </LinearGradient>
              </Defs>

              <Path d={cablePath} stroke={borderColor} strokeWidth="4" fill="none" />
              <AnimatedPath
                d={cablePath}
                stroke="url(#grad)"
                strokeWidth="4"
                fill="none"
                strokeDasharray={[10, 10]}
                animatedProps={animatedPathProps}
              />
              <AnimatedCircle r="8" cy={cableHeight / 2} fill={primaryColor} animatedProps={animatedCircleProps} />
            </Svg>

            {/* Left Icon (Trigger) */}
            <View className="absolute left-[30px] top-[45px] w-16 h-16 rounded-2xl bg-card border border-border items-center justify-center z-10 shadow-sm">
              <ThemedText className="text-3xl font-bold text-primary">
                {getServiceInitial(actionService?.name)}
              </ThemedText>
              <View className="absolute -bottom-6 w-24 items-center">
                <ThemedText className="text-xs font-bold opacity-60">IF THIS</ThemedText>
              </View>
            </View>

            {/* Right Icons (Reactions) */}
            <View className="absolute right-[30px] top-[45px] z-10">
              <View className="flex-row -space-x-8">
                {reactions.slice(0, 3).map((r, i) => (
                  <View
                    key={r.id}
                    className="w-16 h-16 rounded-2xl bg-card border border-border items-center justify-center shadow-sm"
                    style={{ zIndex: 10 - i }}
                  >
                    <ThemedText className="text-3xl font-bold text-primary">
                      {getServiceInitial(r.service.name)}
                    </ThemedText>
                  </View>
                ))}
                {reactions.length > 3 && (
                  <View
                    className="w-16 h-16 rounded-2xl bg-card border border-border items-center justify-center shadow-sm"
                    style={{ zIndex: 0 }}
                  >
                    <ThemedText className="font-bold text-muted-foreground">+{reactions.length - 3}</ThemedText>
                  </View>
                )}
              </View>
              <View className="absolute -bottom-6 w-full items-center">
                <ThemedText className="text-xs font-bold opacity-60">THEN THAT</ThemedText>
              </View>
            </View>
          </View>
        </View>

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
                  value={areaName}
                  onChangeText={setAreaName}
                  style={{ backgroundColor: "transparent" }}
                />
              </View>

              <View className="gap-1.5">
                <ThemedText type="defaultSemiBold">Description</ThemedText>
                <Input
                  placeholder="Optional"
                  value={areaDescription}
                  onChangeText={setAreaDescription}
                  style={{ backgroundColor: "transparent" }}
                />
              </View>
            </View>
          </View>

          <View className="bg-muted/50 p-4 rounded-xl gap-2">
            <ThemedText className="text-xs font-mono opacity-70">TRIGGER: {selectedAction?.name}</ThemedText>
            <ThemedText className="text-xs font-mono opacity-70">REACTIONS: {reactions.length}</ThemedText>
            {reactions.map((r) => (
              <ThemedText key={r.id} className="text-xs font-mono opacity-50 ml-2">
                - {r.service.name}: {r.reaction.name}
              </ThemedText>
            ))}
          </View>

          <Button
            title={submitting ? "Wiring it up..." : "Create AREA"}
            onPress={handleCreate}
            loading={submitting}
            className="mt-2"
          />
          <Button title="Back" variant="secondary" onPress={onBack} disabled={submitting} />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// --- Main Screen ---

export default function CreateAreaWizard() {
  const router = useRouter();
  const { client } = useSession();
  const { services, refresh: refreshServices, loading: loadingServices } = useServices();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const primaryColor = useThemeColor({}, "primary");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");
  const destructiveColor = useThemeColor({}, "notification");

  // State: Wizard Flow
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [subStep, setSubStep] = useState<SubStep>("SERVICE");

  // State: Action (Single)
  const [actionService, setActionService] = useState<Service | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [actionParams, setActionParams] = useState<Record<string, any>>({});

  // State: Reactions (Multiple)
  const [configuredReactions, setConfiguredReactions] = useState<ConfiguredReaction[]>([]);

  // State: Temp Reaction (Currently being added)
  const [tempReactionService, setTempReactionService] = useState<Service | null>(null);
  const [tempSelectedReaction, setTempSelectedReaction] = useState<any>(null);
  const [tempReactionParams, setTempReactionParams] = useState<Record<string, any>>({});

  const [areaName, setAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");

  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const pulseProgress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      setShowConfetti(false);
      pulseProgress.value = 0;

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
          console.error("Failed to load connections", e);
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
    setWizardStep(1);
    setSubStep("SERVICE");
    setActionService(null);
    setSelectedAction(null);
    setConfiguredReactions([]);
    setTempReactionService(null);
    setTempSelectedReaction(null);
    setAreaName("");
    setAreaDescription("");
    setActionParams({});
    setTempReactionParams({});
    setShowConfetti(false);
    pulseProgress.value = 0;
  };

  // Select Service
  const handleServiceSelect = (service: Service, type: "action" | "reaction") => {
    const connection = connections.find((c) => c.serviceName === service.name);
    if (!connection) {
      toast.error(`Please connect ${service.name} in Services first.`);
      return;
    }

    Haptics.selectionAsync();
    if (type === "action") {
      setActionService(service);
    } else {
      setTempReactionService(service);
    }
    setSubStep("EVENT");
  };

  // Select Event
  const handleEventSelect = (item: any, type: "action" | "reaction") => {
    Haptics.selectionAsync();
    if (type === "action") {
      setSelectedAction(item);
    } else {
      setTempSelectedReaction(item);
    }
    setSubStep("CONFIG");
  };

  // Validate Params
  const validateParams = (item: any, params: any) => {
    if (!item || !item.params) return true;
    for (const [key, config] of Object.entries(item.params as Record<string, any>)) {
      if (config.required) {
        const value = params[key];
        const isEmptyString = typeof value === "string" && value.trim().length === 0;
        if (value === undefined || value === null || isEmptyString) {
          toast.error(`The "${config.label || key}" field is required.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleActionComplete = () => {
    if (!validateParams(selectedAction, actionParams)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWizardStep(2);
    setSubStep("LIST");
  };

  const handleAddReaction = () => {
    if (!validateParams(tempSelectedReaction, tempReactionParams)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add to list
    setConfiguredReactions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        service: tempReactionService!,
        reaction: tempSelectedReaction!,
        params: tempReactionParams
      }
    ]);

    // Reset temp
    setTempReactionService(null);
    setTempSelectedReaction(null);
    setTempReactionParams({});

    // Go back to list
    setSubStep("LIST");
  };

  const handleDeleteReaction = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfiguredReactions((prev) => prev.filter((r) => r.id !== id));
  };

  const goBackSubStep = () => {
    if (wizardStep === 3) {
      setWizardStep(2);
      setSubStep("LIST");
      return;
    }

    if (wizardStep === 2) {
      // In Step 2 (Reactions)
      if (subStep === "LIST") {
        setWizardStep(1);
        setSubStep("CONFIG");
        return;
      }
      if (subStep === "CONFIG") {
        setSubStep("EVENT");
        return;
      }
      if (subStep === "EVENT") {
        setSubStep("SERVICE");
        return;
      }
      if (subStep === "SERVICE") {
        setSubStep("LIST");
        return;
      }
    }

    // Step 1
    if (subStep === "CONFIG") setSubStep("EVENT");
    else if (subStep === "EVENT") {
      setSubStep("SERVICE");
      setActionService(null);
    }
  };

  // Hardware Back Button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (wizardStep > 1 || subStep !== "SERVICE") {
          goBackSubStep();
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [wizardStep, subStep])
  );

  const handleCreate = async () => {
    if (!areaName.trim()) {
      toast.error("Please name your Area.");
      return;
    }

    setSubmitting(true);
    pulseProgress.value = 0;
    pulseProgress.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) });

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
        reactions: configuredReactions.map((r) => ({
          serviceName: r.service.name,
          reactionName: r.reaction.name,
          params: r.params,
          connectionId: connections.find((c) => c.serviceName === r.service.name).id
        }))
      };

      const { error } = await client.api.areas.post(payload);
      if (error) throw new Error(typeof error.value === "object" ? (error.value as any).message : String(error.value));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfetti(true);

      setTimeout(() => {
        setSubmitting(false);
        resetForm();
        router.navigate("/(tabs)");
        toast.success("Area created successfully!");
      }, 2000);
    } catch (err: any) {
      cancelAnimation(pulseProgress);
      pulseProgress.value = 0;
      toast.error(err.message || "Failed to create.");
      setSubmitting(false);
    }
  };

  // --- Render Sections ---

  const renderServiceGrid = (servicesList: Service[], type: "action" | "reaction") => (
    <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
      <View className="px-5 py-2 flex-row items-center gap-2">
        {(wizardStep > 1 || (wizardStep === 1 && subStep !== "SERVICE")) && (
          <TouchableOpacity onPress={goBackSubStep}>
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
              onPress={() => handleServiceSelect(s, type)}
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
          <TouchableOpacity onPress={goBackSubStep}>
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
              onPress={() => handleEventSelect(item, type)}
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
        <TouchableOpacity onPress={goBackSubStep}>
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
        <TouchableOpacity onPress={goBackSubStep}>
          <IconSymbol name="chevron.right" size={24} color={mutedColor} style={{ transform: [{ rotate: "180deg" }] }} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Reactions</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <TouchableOpacity
          onPress={() => setSubStep("SERVICE")}
          className="p-4 rounded-xl border border-dashed flex-row items-center justify-center gap-2"
          style={{ borderColor: primaryColor, backgroundColor: primaryColor + "10" }}
        >
          <IconSymbol name="plus.circle.fill" size={24} color={primaryColor} />
          <ThemedText className="text-primary font-bold">Add Reaction</ThemedText>
        </TouchableOpacity>

        {configuredReactions.map((r, i) => (
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
              onPress={() => handleDeleteReaction(r.id)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${destructiveColor}15` }}
            >
              <MaterialIcons name="delete" size={22} color={destructiveColor} />
            </TouchableOpacity>
          </View>
        ))}

        {configuredReactions.length === 0 && (
          <ThemedText className="text-center opacity-40 mt-10">Add at least one reaction to proceed.</ThemedText>
        )}
      </ScrollView>

      <View className="p-5 border-t" style={{ borderColor }}>
        <Button title="Next Step" onPress={() => setWizardStep(3)} disabled={configuredReactions.length === 0} />
      </View>
    </Animated.View>
  );

  // --- Main Render ---

  const actionServices = services.filter((s) => s.actions && s.actions.length > 0);
  const reactionServices = services.filter((s) => s.reactions && s.reactions.length > 0);

  if (loadingServices || loadingConnections) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText className="mt-4">Loading magic...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      <SuccessConfetti active={showConfetti} />

      <View className="h-16 flex-row items-center px-5 justify-between border-b border-border/50">
        <View>
          <ThemedText type="subtitle">
            {wizardStep === 1 ? "Step 1: The Trigger" : wizardStep === 2 ? "Step 2: Reactions" : "Step 3: Connect"}
          </ThemedText>
          <View className="flex-row gap-1 mt-1">
            <View className={`h-1 rounded-full ${wizardStep >= 1 ? "bg-primary w-8" : "bg-muted w-2"}`} />
            <View className={`h-1 rounded-full ${wizardStep >= 2 ? "bg-primary w-8" : "bg-muted w-2"}`} />
            <View className={`h-1 rounded-full ${wizardStep >= 3 ? "bg-primary w-8" : "bg-muted w-2"}`} />
          </View>
        </View>
        {wizardStep === 1 && subStep === "SERVICE" && (
          <Button title="Reset" variant="outline" onPress={resetForm} className="h-8 px-3 text-xs" />
        )}
      </View>

      <View className="flex-1">
        {wizardStep === 1 && (
          <>
            {subStep === "SERVICE" && renderServiceGrid(actionServices, "action")}
            {subStep === "EVENT" && actionService && renderEventList(actionService, "action")}
            {subStep === "CONFIG" &&
              selectedAction &&
              renderConfig(selectedAction, actionParams, setActionParams, handleActionComplete)}
          </>
        )}

        {wizardStep === 2 && (
          <>
            {subStep === "LIST" && renderReactionList()}
            {subStep === "SERVICE" && renderServiceGrid(reactionServices, "reaction")}
            {subStep === "EVENT" && tempReactionService && renderEventList(tempReactionService, "reaction")}
            {subStep === "CONFIG" &&
              tempSelectedReaction &&
              renderConfig(
                tempSelectedReaction,
                tempReactionParams,
                setTempReactionParams,
                handleAddReaction,
                selectedAction?.variables
              )}
          </>
        )}

        {wizardStep === 3 && (
          <ConnectionStep
            actionService={actionService}
            reactions={configuredReactions}
            selectedAction={selectedAction}
            areaName={areaName}
            setAreaName={setAreaName}
            areaDescription={areaDescription}
            setAreaDescription={setAreaDescription}
            submitting={submitting}
            handleCreate={handleCreate}
            onBack={goBackSubStep}
            pulseProgress={pulseProgress}
          />
        )}
      </View>
    </ThemedView>
  );
}
