import { useState, useCallback, useEffect } from "react";
import { BackHandler } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSession } from "@/ctx";
import { useData } from "@/ctx-data";
import { Service } from "@/hooks/use-services";
import { useToast } from "@/components/ui/toast";
import { feedback } from "@/lib/haptics";
import { useSharedValue, withTiming, Easing, cancelAnimation } from "react-native-reanimated";

export type WizardStep = 1 | 2 | 3;
export type SubStep = "SERVICE" | "EVENT" | "CONFIG" | "LIST";

export type ConfiguredReaction = {
  id: string;
  service: Service;
  reaction: any;
  params: Record<string, any>;
};

export function useAreaWizard(editAreaId?: string) {
  const router = useRouter();
  const { client } = useSession();
  const toast = useToast();

  const { services, connections, refreshData, isLoading: isGlobalLoading } = useData();

  // Navigation State
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [subStep, setSubStep] = useState<SubStep>("SERVICE");

  // Data State
  const [actionService, setActionService] = useState<Service | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [actionParams, setActionParams] = useState<Record<string, any>>({});

  const [configuredReactions, setConfiguredReactions] = useState<ConfiguredReaction[]>([]);

  // Temp Reaction State
  const [tempReactionService, setTempReactionService] = useState<Service | null>(null);
  const [tempSelectedReaction, setTempSelectedReaction] = useState<any>(null);
  const [tempReactionParams, setTempReactionParams] = useState<Record<string, any>>({});
  const [testingReaction, setTestingReaction] = useState(false);

  // Meta State
  const [areaName, setAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Edit Mode Specific State
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(!!editAreaId);

  const pulseProgress = useSharedValue(0);

  // Optimistically refresh data in background when screen is focused
  useFocusEffect(
    useCallback(() => {
      setShowConfetti(false);
      pulseProgress.value = 0;
      refreshData();
    }, [])
  );

  // Load initial data if editing
  useEffect(() => {
    if (!editAreaId || !services.length) return;

    const fetchAreaDetails = async () => {
      setIsFetchingInitialData(true);
      try {
        const { data, error } = await client.api.areas({ id: editAreaId }).get();

        if (error || !data) {
          toast.error("Failed to load AREA details");
          router.back();
          return;
        }

        const area = data.area;
        setAreaName(area.name);
        setAreaDescription(area.description || "");

        // Reconstruct Action State
        if (area.action) {
          const s = services.find((srv) => srv.name === area.action?.serviceName);
          const a = s?.actions.find((act) => act.name === area.action?.actionName);
          if (s && a) {
            setActionService(s);
            setSelectedAction(a);
            setActionParams(area.action.params);
          }
        }

        // Reconstruct Reactions State
        const reactions: ConfiguredReaction[] = [];
        area.reactions.forEach((r) => {
          const s = services.find((srv) => srv.name === r.serviceName);
          const reactionDef = s?.reactions.find((react) => react.name === r.reactionName);
          if (s && reactionDef) {
            reactions.push({
              id: r.id,
              service: s,
              reaction: reactionDef,
              params: r.params
            });
          }
        });
        setConfiguredReactions(reactions);

        // Jump to summary step for editing so users see everything at once
        setWizardStep(3);
        setSubStep("LIST");
      } catch (e) {
        console.error(e);
        toast.error("Error loading AREA");
        router.back();
      } finally {
        setIsFetchingInitialData(false);
      }
    };

    fetchAreaDetails();
  }, [editAreaId, services, client]);

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

  const handleServiceSelect = (service: Service, type: "action" | "reaction") => {
    const connection = connections.find((c) => c.serviceName === service.name);
    if (!connection) {
      toast.error(`Please connect ${service.name} in Services first.`);
      return;
    }

    feedback.selection();
    if (type === "action") {
      setActionService(service);
    } else {
      setTempReactionService(service);
    }
    setSubStep("EVENT");
  };

  const handleEventSelect = (item: any, type: "action" | "reaction") => {
    feedback.selection();
    if (type === "action") {
      setSelectedAction(item);
    } else {
      setTempSelectedReaction(item);
    }
    setSubStep("CONFIG");
  };

  const handleActionComplete = () => {
    if (!validateParams(selectedAction, actionParams)) return;
    feedback.impact("light");
    setWizardStep(2);
    setSubStep("LIST");
  };

  const handleAddReaction = () => {
    if (!validateParams(tempSelectedReaction, tempReactionParams)) return;
    feedback.impact("light");

    setConfiguredReactions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        service: tempReactionService!,
        reaction: tempSelectedReaction!,
        params: tempReactionParams
      }
    ]);

    setTempReactionService(null);
    setTempSelectedReaction(null);
    setTempReactionParams({});
    setSubStep("LIST");
  };

  const handleDeleteReaction = (id: string) => {
    feedback.impact("medium");
    setConfiguredReactions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleTestReaction = async () => {
    if (!validateParams(tempSelectedReaction, tempReactionParams)) return;
    setTestingReaction(true);

    const connection = connections.find((c) => c.serviceName === tempReactionService!.name);

    if (!connection) {
      toast.error("Service not connected");
      setTestingReaction(false);
      return;
    }

    try {
      const { data, error } = await client.api.areas["test-reaction"].post({
        serviceName: tempReactionService!.name,
        reactionName: tempSelectedReaction!.name,
        connectionId: connection.id,
        params: tempReactionParams
      });

      if (error) {
        toast.error(typeof error.value === "string" ? error.value : (error.value as any).message || "Preview failed");
      } else {
        toast.success("Preview successful!");
      }
    } catch (e: any) {
      toast.error("Network error during test");
    } finally {
      setTestingReaction(false);
    }
  };

  const goBackSubStep = () => {
    if (wizardStep === 3) {
      setWizardStep(2);
      setSubStep("LIST");
      return;
    }
    if (wizardStep === 2) {
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
      const connectionId = connections.find((c) => c.serviceName === actionService!.name)?.id;

      if (!connectionId) {
        throw new Error("Action connection not found. Please reconnect the service.");
      }

      const payload = {
        name: areaName,
        description: areaDescription || undefined,
        action: {
          serviceName: actionService!.name,
          actionName: selectedAction.name,
          params: actionParams,
          connectionId: connectionId
        },
        reactions: configuredReactions.map((r) => ({
          serviceName: r.service.name,
          reactionName: r.reaction.name,
          params: r.params,
          connectionId: connections.find((c) => c.serviceName === r.service.name)?.id || ""
        }))
      };

      let error;
      if (editAreaId) {
        // Update Logic (PATCH)
        const res = await client.api.areas({ id: editAreaId }).patch({
          ...payload,
          enabled: true // keep enabled by default on edit unless handled explicitly
        });
        error = res.error;
      } else {
        // Create Logic (POST)
        const res = await client.api.areas.post(payload);
        error = res.error;
      }

      if (error) throw new Error(typeof error.value === "object" ? (error.value as any).message : String(error.value));

      feedback.notification("success");

      // Only show confetti on create
      if (!editAreaId) {
        setShowConfetti(true);
      }

      setTimeout(
        () => {
          setSubmitting(false);
          if (!editAreaId) resetForm();
          router.navigate("/(tabs)");
          toast.success(editAreaId ? "Area updated!" : "Area created successfully!");
        },
        editAreaId ? 500 : 2000
      );
    } catch (err: any) {
      cancelAnimation(pulseProgress);
      pulseProgress.value = 0;
      toast.error(err.message || (editAreaId ? "Failed to update." : "Failed to create."));
      setSubmitting(false);
    }
  };

  return {
    // State
    wizardStep,
    setWizardStep,
    subStep,
    setSubStep,
    actionService,
    selectedAction,
    actionParams,
    setActionParams,
    configuredReactions,
    tempReactionService,
    tempSelectedReaction,
    tempReactionParams,
    setTempReactionParams,
    areaName,
    setAreaName,
    areaDescription,
    setAreaDescription,
    submitting,
    showConfetti,
    pulseProgress,
    loading: isGlobalLoading,
    isFetchingInitialData,
    services,
    testingReaction,

    // Handlers
    handleServiceSelect,
    handleEventSelect,
    handleActionComplete,
    handleAddReaction,
    handleDeleteReaction,
    handleCreate,
    goBackSubStep,
    resetForm,
    handleTestReaction
  };
}
