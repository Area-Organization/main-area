import React, { useState } from "react";
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authClient } from "@/lib/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "@/ctx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useToast } from "@/components/ui/toast";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useSession();
  const toast = useToast();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const iconColor = useThemeColor({}, "icon");

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid code");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: email,
        otp: otp,
        type: "email-verification"
      });

      if (error) {
        toast.error(error.message || "Invalid code");
      } else {
        toast.success("Email verified!");
        // Refresh session to actually log the user in
        await signIn();
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "email-verification"
      });

      if (error) {
        toast.error(error.message || "Failed to resend code");
      } else {
        toast.success("Code sent!");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setResending(false);
    }
  };

  return (
    <ThemedView className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-8">
            <Animated.View entering={FadeIn.delay(300).duration(400)} className="items-center mb-8">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="mark-email-read" size={32} color={useThemeColor({}, "primary")} />
              </View>
              <ThemedText type="title" className="text-center">
                Check your email
              </ThemedText>
              <ThemedText className="text-center opacity-60 mt-2">
                We sent a verification code to{"\n"}
                <ThemedText type="defaultSemiBold">{email}</ThemedText>
              </ThemedText>
            </Animated.View>

            <Animated.View entering={SlideInRight.duration(400)} className="gap-4">
              <Input
                placeholder="Enter 6-digit code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={8}
                icon={<MaterialIcons name="vpn-key" size={20} color={iconColor} />}
                style={{ textAlign: "center", letterSpacing: 5, fontSize: 20 }}
              />

              <Button
                title={loading ? "Verifying..." : "Verify Email"}
                onPress={handleVerify}
                loading={loading}
                className="mt-2"
              />

              <TouchableOpacity onPress={handleResend} disabled={resending} className="mt-4">
                <ThemedText className="text-center opacity-60">
                  {resending ? "Sending..." : "Didn't receive code? Resend"}
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={() => router.back()} className="mt-10">
              <ThemedText type="link" className="text-center">
                Back to Login
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
