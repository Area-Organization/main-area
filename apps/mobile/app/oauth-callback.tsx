import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";

export default function OAuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    router.dismissAll();
    router.replace("/(tabs)/services");
  }, []);

  return (
    <ThemedView className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </ThemedView>
  );
}
