import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@/ctx";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  SlideInRight,
  FadeIn,
  Easing
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

const { width } = Dimensions.get("window");

const AnimatedLetter = ({ letter, index }: { letter: string; index: number }) => {
  const primary = useThemeColor({}, "primary");
  const startX = (Math.random() - 0.5) * width * 0.5;
  const startY = (Math.random() - 0.5) * 100;

  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 40;
    const duration = 800;
    const easing = Easing.out(Easing.exp);

    translateX.value = withDelay(delay, withTiming(0, { duration, easing }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing }));
    opacity.value = withDelay(delay, withTiming(1, { duration, easing }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value
  }));

  return (
    <Animated.Text style={[style, { color: primary }]} className="text-5xl font-sans-bold tracking-tighter">
      {letter}
    </Animated.Text>
  );
};

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});

  const iconColor = useThemeColor({}, "icon");

  const handleRegister = async () => {
    setErrors({});
    let hasError = false;
    if (!name) {
      setErrors((p) => ({ ...p, name: "Name is required" }));
      hasError = true;
    }
    if (!email) {
      setErrors((p) => ({ ...p, email: "Email is required" }));
      hasError = true;
    }
    if (!password) {
      setErrors((p) => ({ ...p, password: "Password is required" }));
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({ email, password, name });
      if (error) {
        setErrors({ general: error.message || "Registration failed" });
      } else {
        await signIn();
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setErrors({ general: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-8 overflow-hidden">
            <View className="mb-10 items-center z-10">
              <View className="flex-row">
                {["A", "R", "E", "A"].map((l, i) => (
                  <AnimatedLetter key={i} letter={l} index={i} />
                ))}
              </View>
              <Animated.View entering={FadeIn.delay(300).duration(400)}>
                <ThemedText className="opacity-50 mt-2 text-center">Start automating your digital life</ThemedText>
              </Animated.View>
            </View>

            <Animated.View entering={SlideInRight.duration(400)} className="gap-4">
              <ThemedText type="defaultSemiBold" className="mb-2">
                Create Account
              </ThemedText>

              {errors.general && (
                <ThemedText className="text-red-500 mb-2 text-center text-sm">{errors.general}</ThemedText>
              )}

              <Input
                placeholder="Full Name"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setErrors((e) => ({ ...e, name: undefined }));
                }}
                icon={<MaterialIcons name="person" size={20} color={iconColor} />}
                error={errors.name}
              />
              <Input
                placeholder="Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors((e) => ({ ...e, email: undefined }));
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                icon={<MaterialIcons name="email" size={20} color={iconColor} />}
                error={errors.email}
              />
              <Input
                placeholder="Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrors((e) => ({ ...e, password: undefined }));
                }}
                secureTextEntry
                icon={<MaterialIcons name="lock" size={20} color={iconColor} />}
                error={errors.password}
              />

              <Button
                title={loading ? "Creating..." : "Sign Up"}
                onPress={handleRegister}
                loading={loading}
                className="mt-2"
              />
            </Animated.View>

            <Animated.View
              entering={SlideInRight.delay(50).duration(400)}
              className="flex-row justify-center gap-2 mt-10"
            >
              <ThemedText>Already have an account?</ThemedText>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <ThemedText type="link">Sign In</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
