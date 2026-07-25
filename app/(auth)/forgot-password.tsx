import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { validateEmail } from "@/features/auth/validation/authValidation";
import { colors } from "@/config/theme";

export default function ForgotPasswordScreen() {
  const { sendPasswordReset, resetState } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const check = validateEmail(email);
    if (!check.valid) {
      setError(check.error ?? "Enter a valid email.");
      return;
    }
    setError(null);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? "Unable to send reset email.");
    }
  };

  if (sent) {
    return (
      <Screen contentContainerStyle={{ paddingHorizontal: 24 }}>
        <View className="flex-1 items-center justify-center gap-5">
          <View
            className="items-center justify-center rounded-full"
            style={{ width: 80, height: 80, backgroundColor: "rgba(52,211,153,0.15)" }}
          >
            <Ionicons name="checkmark-circle" size={44} color={colors.accent.green} />
          </View>
          <Text className="text-xl font-bold text-center" style={{ color: colors.text.primary }}>
            Check your inbox
          </Text>
          <Text className="text-sm text-center px-6" style={{ color: colors.text.secondary }}>
            We sent a password reset link to {"\n"}
            <Text style={{ color: colors.text.primary, fontWeight: "600" }}>{email}</Text>
          </Text>
          <Button label="Back to Sign In" onPress={() => router.replace("/(auth)/login")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 48 }}>
      <Pressable onPress={() => router.back()} hitSlop={12} className="mb-6 self-start">
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </Pressable>

      <AuthHeader
        title="Reset your password"
        subtitle="Enter the email associated with your account and we'll send you a reset link."
        icon="key-outline"
      />

      <View className="gap-4">
        <TextField
          label="Email"
          leftIcon="mail-outline"
          placeholder="you@example.com"
          keyboardType="email-address"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setError(null);
          }}
          error={error}
          returnKeyType="done"
          onSubmitEditing={handleSend}
        />
        <Button label="Send Reset Link" onPress={handleSend} isLoading={resetState.isLoading} />
      </View>
    </Screen>
  );
}
