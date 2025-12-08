import { useState } from "react";
import { StyleSheet, TextInput, Button, Alert, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useSession } from "@/ctx";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useSession();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password
      });

      if (error) {
        const errorMessage =
          error.message ||
          error.statusText ||
          (error.status ? `Server Error: ${error.status}` : "Unknown error occurred");

        Alert.alert("Login Failed", errorMessage);
      } else {
        // Refresh the session state manually before navigating
        await signIn();
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome Back
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#666"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />

        <View style={styles.buttonContainer}>
          <Button title={loading ? "Signing in..." : "Sign In"} onPress={handleLogin} disabled={loading} />
        </View>

        <View style={styles.footer}>
          <ThemedText>Don&apos;t have an account?</ThemedText>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <ThemedText type="link">Sign Up</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  content: { gap: 16 },
  title: { textAlign: "center", marginBottom: 20 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    color: "#000"
  },
  buttonContainer: { marginTop: 10 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 20
  }
});
