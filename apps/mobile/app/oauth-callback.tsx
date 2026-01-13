import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useSession } from "@/ctx";
import { authClient } from "@/lib/auth";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [status, setStatus] = useState("Processing login...");

  useEffect(() => {
    let isMounted = true;

    const runAuthFlow = async () => {
      // Give the native listener a moment to fire and store the token
      await new Promise((resolve) => setTimeout(resolve, 500));

      for (let i = 0; i < 10; i++) {
        if (!isMounted) return;

        // Update context
        await signIn();

        // Check directly if session exists now
        const { data } = await authClient.getSession();

        if (data?.session) {
          router.dismissAll();
          router.replace("/(tabs)");
          return;
        }

        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (isMounted) {
        setStatus("Could not log in. Redirecting...");
        setTimeout(() => router.replace("/(auth)/login"), 2000);
      }
    };

    runAuthFlow();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ThemedView className="flex-1 justify-center items-center gap-4">
      <ActivityIndicator size="large" />
      <ThemedText>{status}</ThemedText>
    </ThemedView>
  );
}
