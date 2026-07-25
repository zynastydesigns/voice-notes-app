import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SocialButton } from "@/features/auth/components/SocialButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import { validateEmail } from "@/features/auth/validation/authValidation";
import { colors } from "@/config/theme";

export default function LoginScreen() {
  const { signIn, signInState } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { promptGoogleSignIn, isExchangingToken, error: googleError } = useGoogleAuth(() => {
    router.replace("/(app)");
  });

  const isAppleAvailable = Platform.OS === "ios";

  const handleSignIn = async () => {
    setFormError(null);
    const emailCheck = validateEmail(email);
    const nextErrors: typeof fieldErrors = {};
    if (!emailCheck.valid) nextErrors.email = emailCheck.error;
    if (!password) nextErrors.password = "Password is required.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await signIn(email, password);
      router.replace("/(app)");
    } catch (err) {
      const e = err as { message?: string };
      setFormError(e.message ?? "Unable to sign in. Please try again.");
    }
  };

  const handleAppleSignIn = async () => {
    setFormError(null);
    try {
      const { authService } = await import("@/features/auth/services/authService");
      await authService.signInWithApple();
      router.replace("/(app)");
    } catch (err) {
      const e = err as { message?: string };
      if (e?.message?.includes("canceled")) return;
      setFormError(e.message ?? "Apple Sign-In failed.");
    }
  };

  return (
    <Screen scroll contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 48 }}>
      <AuthHeader title="Welcome back" subtitle="Sign in to pick up right where you left off." />

      <View className="gap-4">
        <TextField
          label="Email"
          leftIcon="mail-outline"
          placeholder="you@example.com"
          keyboardType="email-address"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={fieldErrors.email}
          returnKeyType="next"
        />
        <TextField
          label="Password"
          leftIcon="lock-closed-outline"
          placeholder="••••••••"
          isPassword
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={fieldErrors.password}
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
        />

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable className="self-end">
            <Text className="text-sm font-medium" style={{ color: colors.brand[300] }}>
              Forgot password?
            </Text>
          </Pressable>
        </Link>

        {!!formError && (
          <Text className="text-sm text-center" style={{ color: colors.accent.red }}>
            {formError}
          </Text>
        )}
        {!!googleError && (
          <Text className="text-sm text-center" style={{ color: colors.accent.red }}>
            {googleError.message}
          </Text>
        )}

        <Button label="Sign In" onPress={handleSignIn} isLoading={signInState.isLoading} />

        <Divider label="or continue with" />

        <View className="gap-3">
          <SocialButton
            provider="google"
            onPress={promptGoogleSignIn}
            isLoading={isExchangingToken}
          />
          {isAppleAvailable && (
            <SocialButton provider="apple" onPress={handleAppleSignIn} />
          )}
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-1.5 mt-8">
        <Text style={{ color: colors.text.secondary }} className="text-sm">
          Don&apos;t have an account?
        </Text>
        <Link href="/(auth)/signup" asChild>
          <Pressable>
            <Text className="text-sm font-semibold" style={{ color: colors.brand[300] }}>
              Sign up
            </Text>
          </Pressable>
        </Link>
      </View>

      <LoadingOverlay visible={signInState.isLoading} message="Signing you in..." />
    </Screen>
  );
}
