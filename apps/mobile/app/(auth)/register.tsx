import { useState } from "react";
import { StyleSheet, View, Alert, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) return Alert.alert("Error", "Fill all fields");
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({ email, password, name });
      if (error) {
        Alert.alert("Registration Failed", error.message);
      } else {
        Alert.alert("Success", "Account created!", [{ text: "Login", onPress: () => router.replace("/(auth)/login") }]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Create Account</ThemedText>
        <ThemedText style={{ opacity: 0.6 }}>Start automating your digital life</ThemedText>
      </View>

      <View style={styles.form}>
        <Input placeholder="Full Name" value={name} onChangeText={setName} />
        <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={loading ? "Creating..." : "Sign Up"} onPress={handleRegister} loading={loading} />
      </View>

      <View style={styles.footer}>
        <ThemedText>Already have an account?</ThemedText>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <ThemedText type="link">Sign In</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  header: { marginBottom: 30 },
  form: { gap: 16 },
  footer: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 30 }
});
