import { useState } from "react";
import { View, Alert, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@/ctx";

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useSession();
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
      <View className="mb-8">
        <ThemedText type="title">Create Account</ThemedText>
        <ThemedText className="opacity-60">Start automating your digital life</ThemedText>
      </View>

      <View className="gap-4">
        <Input placeholder="Full Name" value={name} onChangeText={setName} />
        <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={loading ? "Creating..." : "Sign Up"} onPress={handleRegister} loading={loading} />
      </View>

      <View className="flex-row justify-center gap-2 mt-8">
        <ThemedText>Already have an account?</ThemedText>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <ThemedText type="link">Sign In</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
