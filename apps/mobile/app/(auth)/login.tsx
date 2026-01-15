import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as Linking from "expo-linking";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useSession } from "@/ctx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  SlideInLeft,
  FadeIn
} from "react-native-reanimated";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { UrlConfigModal } from "@/components/url-config-modal";
import { useToast } from "@/components/ui/toast";

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
    const springConfig = { damping: 50, stiffness: 300 };

    translateX.value = withDelay(delay, withSpring(0, springConfig));
    translateY.value = withDelay(delay, withSpring(0, springConfig));
    opacity.value = withDelay(delay, withSpring(1, springConfig));
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);

  const router = useRouter();
  const { signIn } = useSession();
  const toast = useToast();
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "border");

  const handleLogin = async () => {
    setErrors({});
    let hasError = false;
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      hasError = true;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setErrors({ general: error.message || "Login failed" });
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

  const handleSocialLogin = async (provider: "github" | "google") => {
    try {
      const callbackURL = Linking.createURL("/oauth-callback");

      const { error } = await authClient.signIn.social({
        provider: provider,
        callbackURL: callbackURL
      });

      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Social login failed");
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
            {/* Config Button */}
            <TouchableOpacity
              onPress={() => setConfigVisible(true)}
              className="absolute top-0 right-6 z-50 p-2 rounded-full bg-muted/50"
            >
              <MaterialIcons name="settings" size={24} color={iconColor} />
            </TouchableOpacity>

            <View className="mb-10 items-center z-10">
              <View className="flex-row">
                {["A", "R", "E", "A"].map((l, i) => (
                  <AnimatedLetter key={i} letter={l} index={i} />
                ))}
              </View>
              <Animated.View entering={FadeIn.delay(300).duration(400)}>
                <ThemedText className="opacity-50 mt-2 text-center">Automation Platform</ThemedText>
              </Animated.View>
            </View>

            <Animated.View entering={SlideInLeft.duration(400)} className="gap-4">
              <ThemedText type="defaultSemiBold" className="mb-2">
                Welcome Back
              </ThemedText>
              {errors.general && (
                <ThemedText className="text-red-500 mb-2 text-center text-sm">{errors.general}</ThemedText>
              )}

              <Input
                placeholder="Email address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
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
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((e) => ({ ...e, password: undefined }));
                }}
                secureTextEntry
                icon={<MaterialIcons name="lock" size={20} color={iconColor} />}
                error={errors.password}
              />

              <Button
                title={loading ? "Signing in..." : "Sign In"}
                onPress={handleLogin}
                loading={loading}
                className="mt-2"
              />

              {/* Social Login Section */}
              <View className="flex-row items-center gap-4 my-2">
                <View className="flex-1 h-[1px] bg-border" />
                <ThemedText className="text-xs opacity-50">OR CONTINUE WITH</ThemedText>
                <View className="flex-1 h-[1px] bg-border" />
              </View>

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => handleSocialLogin("github")}
                  className="flex-1 h-[50px] flex-row items-center justify-center rounded-2xl border bg-card"
                  style={{ borderColor }}
                >
                  <FontAwesome name="github" size={24} color={iconColor} />
                  <ThemedText className="ml-2 font-semibold">GitHub</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSocialLogin("google")}
                  className="flex-1 h-[50px] flex-row items-center justify-center rounded-2xl border bg-card"
                  style={{ borderColor }}
                >
                  <FontAwesome name="google" size={22} color={iconColor} />
                  <ThemedText className="ml-2 font-semibold">Google</ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Animated.View
              entering={SlideInLeft.delay(50).duration(400)}
              className="flex-row justify-center gap-2 mt-8"
            >
              <ThemedText>Don&apos;t have an account?</ThemedText>
              <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
                <ThemedText type="link">Create account</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <UrlConfigModal visible={configVisible} onClose={() => setConfigVisible(false)} />
    </ThemedView>
  );
}
