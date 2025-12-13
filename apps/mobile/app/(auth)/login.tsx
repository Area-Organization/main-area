import { useState } from "react";
import { StyleSheet, View, Alert, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useSession } from "@/ctx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useSession();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        Alert.alert("Login Failed", error.message || "Unknown error");
      } else {
        await signIn();
        router.replace("/(tabs)");
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
        <ThemedText type="title" style={styles.title}>
          AREA
        </ThemedText>
        <ThemedText style={styles.subtitle}>Automation Platform</ThemedText>
      </View>

      <View style={styles.form}>
        <ThemedText type="defaultSemiBold">Welcome Back</ThemedText>
        <Input
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={loading ? "Signing in..." : "Sign In"} onPress={handleLogin} loading={loading} />
      </View>

      <View style={styles.footer}>
        <ThemedText>Don&apos;t have an account?</ThemedText>
        <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
          <ThemedText type="link">Create account</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  header: { marginBottom: 40, alignItems: "center" },
  title: { fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  subtitle: { opacity: 0.5, marginTop: 5 },
  form: { gap: 16 },
  footer: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 30 }
});
