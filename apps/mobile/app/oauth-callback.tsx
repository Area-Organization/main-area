import { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";

export default function OAuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // Dismiss the modal/browser and go to the Services tab
    router.dismissAll();
    router.replace("/(tabs)/services");
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
