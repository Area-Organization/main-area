import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { View, Text } from "react-native";
import Animated, { withTiming, useAnimatedStyle, useSharedValue, Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { scheduleOnRN } from "react-native-worklets";

type ToastType = "success" | "error";

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function DynamicIslandToast({ message, type, onHide }: { message: string; type: ToastType; onHide: () => void }) {
  const insets = useSafeAreaInsets();

  // Start off-screen (above the top edge)
  const translateY = useSharedValue(-150);

  useEffect(() => {
    // Slide down with smooth deceleration
    translateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.poly(4))
    });

    // Wait, then slide up
    const timer = setTimeout(() => {
      translateY.value = withTiming(
        -150,
        {
          duration: 300,
          easing: Easing.in(Easing.poly(4))
        },
        (finished) => {
          if (finished) {
            scheduleOnRN(onHide);
          }
        }
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: insets.top + 10,
          left: 20,
          right: 20,
          zIndex: 9999,
          alignItems: "center"
        },
        animatedStyle
      ]}
    >
      <View
        className={`flex-row items-center px-4 py-3 rounded-full shadow-lg border ${
          type === "success"
            ? "bg-white dark:bg-zinc-900 border-green-500/20"
            : "bg-white dark:bg-zinc-900 border-red-500/20"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 6
        }}
      >
        <View
          className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${
            type === "success" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
          }`}
        >
          <MaterialIcons
            name={type === "success" ? "check" : "priority-high"}
            size={16}
            color={type === "success" ? "#15803d" : "#b91c1c"}
          />
        </View>
        <Text
          className={`font-sans-semibold text-sm flex-1 ${
            type === "success" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
          }`}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

  const show = useCallback((message: string, type: ToastType) => {
    // Force a re-mount for new toasts to trigger animation
    setToast(null);
    setTimeout(() => {
      setToast({ message, type, id: Date.now() });
    }, 0);
  }, []);

  const success = useCallback((msg: string) => show(msg, "success"), [show]);
  const error = useCallback((msg: string) => show(msg, "error"), [show]);

  const hide = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      {toast && <DynamicIslandToast key={toast.id} message={toast.message} type={toast.type} onHide={hide} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
