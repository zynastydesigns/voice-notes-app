import { useEffect, useRef, useState } from "react";
import { View, Text, AppState } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { colors } from "@/config/theme";

const POLL_INTERVAL_MS = 5000;

export default function VerifyEmailScreen() {
  const { user, isEmailVerified, resendVerificationEmail, refreshEmailVerified, signOut } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isEmailVerified) {
      router.replace("/(app)");
    }
  }, [isEmailVerified]);

  // Poll periodically, and also immediately whenever the app returns to the
  // foreground (the common path: user leaves to check their email inbox).
  useEffect(() => {
    const interval = setInterval(() => {
      refreshEmailVerified().catch(() => {});
    }, POLL_INTERVAL_MS);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshEmailVerified().catch(() => {});
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [refreshEmailVerified]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    setResendMessage(null);
    setIsResending(true);
    try {
      await resendVerificationEmail();
      setResendMessage("Verification email sent.");
      setResendCooldown(45);
    } catch (err) {
      const e = err as { message?: string };
      setResendMessage(e.message ?? "Couldn't resend the email. Please try again shortly.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      const refreshed = await refreshEmailVerified();
      if (!refreshed?.emailVerified) {
        setResendMessage("Still not verified — check your inbox (and spam folder).");
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Screen contentContainerStyle={{ paddingHorizontal: 24 }}>
      <View className="flex-1 items-center justify-center gap-6">
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 88, height: 88, backgroundColor: "rgba(124,92,252,0.15)" }}
        >
          <Ionicons name="mail-unread-outline" size={40} color={colors.brand[400]} />
        </View>

        <View className="gap-2 items-center">
          <Text className="text-xl font-bold text-center" style={{ color: colors.text.primary }}>
            Verify your email
          </Text>
          <Text className="text-sm text-center px-4" style={{ color: colors.text.secondary }}>
            We sent a verification link to{"\n"}
            <Text style={{ color: colors.text.primary, fontWeight: "600" }}>
              {user?.email ?? "your email"}
            </Text>
          </Text>
        </View>

        {!!resendMessage && (
          <Text className="text-sm text-center" style={{ color: colors.brand[300] }}>
            {resendMessage}
          </Text>
        )}

        <View className="w-full gap-3">
          <Button label="I've verified — Continue" onPress={handleCheckNow} isLoading={isChecking} />
          <Button
            label={resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
            variant="outline"
            onPress={handleResend}
            isLoading={isResending}
            disabled={resendCooldown > 0}
          />
          <Button label="Sign out" variant="ghost" onPress={() => signOut()} />
        </View>
      </View>
    </Screen>
  );
}
