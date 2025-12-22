import { useState } from "react";
import { View, Alert, TouchableOpacity } from "react-native";
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
    <ThemedView className="flex-1 p-6 justify-center">
      <View className="mb-10 items-center">
        <ThemedText type="title" className="text-4xl font-black tracking-tighter">
          AREA
        </ThemedText>
        <ThemedText className="opacity-50 mt-1.5">Automation Platform</ThemedText>
      </View>

      <View className="gap-4">
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

      <View className="flex-row justify-center gap-2 mt-8">
        <ThemedText>Don&apos;t have an account?</ThemedText>
        <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
          <ThemedText type="link">Create account</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
