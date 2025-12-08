import { useState } from "react";
import { StyleSheet, TextInput, Button, Alert, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name
      });

      const { data, error } = response;

      if (error) {
        const errorMessage =
          error.message ||
          error.statusText ||
          (error.status ? `Server Error: ${error.status}` : "Unknown error occurred");

        Alert.alert("Registration Failed", errorMessage);
      } else {
        Alert.alert("Success", "Account created!", [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Create Account
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#666"
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />

        <View style={styles.buttonContainer}>
          <Button title={loading ? "Creating..." : "Sign Up"} onPress={handleRegister} disabled={loading} />
        </View>

        <View style={styles.footer}>
          <ThemedText>Already have an account?</ThemedText>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <ThemedText type="link">Sign In</ThemedText>
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
