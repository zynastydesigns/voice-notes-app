import { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Link, router } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SocialButton } from "@/features/auth/components/SocialButton";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/features/auth/validation/authValidation";
import { colors } from "@/config/theme";

interface FieldErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupScreen() {
  const { signUp, signUpState } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { promptGoogleSignIn, isExchangingToken, error: googleError } = useGoogleAuth(() => {
    router.replace("/(app)");
  });

  const handleSignUp = async () => {
    setFormError(null);
    const nameCheck = validateDisplayName(displayName);
    const emailCheck = validateEmail(email);
    const passwordCheck = validatePassword(password);
    const confirmCheck = validateConfirmPassword(password, confirmPassword);

    const nextErrors: FieldErrors = {};
    if (!nameCheck.valid) nextErrors.displayName = nameCheck.error;
    if (!emailCheck.valid) nextErrors.email = emailCheck.error;
    if (!passwordCheck.valid) nextErrors.password = passwordCheck.error;
    if (!confirmCheck.valid) nextErrors.confirmPassword = confirmCheck.error;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await signUp({ email, password, displayName });
      router.replace("/(auth)/verify-email");
    } catch (err) {
      const e = err as { message?: string };
      setFormError(e.message ?? "Unable to create your account. Please try again.");
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
    <Screen scroll contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40 }}>
      <AuthHeader
        title="Create your account"
        subtitle="Capture, transcribe, and summarize every conversation."
        icon="sparkles"
      />

      <View className="gap-4">
        <TextField
          label="Full name"
          leftIcon="person-outline"
          placeholder="Jordan Lee"
          autoCapitalize="words"
          value={displayName}
          onChangeText={(t) => {
            setDisplayName(t);
            setFieldErrors((prev) => ({ ...prev, displayName: undefined }));
          }}
          error={fieldErrors.displayName}
          returnKeyType="next"
        />
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
        <View>
          <TextField
            label="Password"
            leftIcon="lock-closed-outline"
            placeholder="At least 8 characters"
            isPassword
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={fieldErrors.password}
            returnKeyType="next"
          />
          <PasswordStrengthMeter password={password} />
        </View>
        <TextField
          label="Confirm password"
          leftIcon="lock-closed-outline"
          placeholder="Re-enter your password"
          isPassword
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          error={fieldErrors.confirmPassword}
          returnKeyType="done"
          onSubmitEditing={handleSignUp}
        />

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

        <Button label="Create Account" onPress={handleSignUp} isLoading={signUpState.isLoading} />

        <Text className="text-xs text-center px-4" style={{ color: colors.text.tertiary }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>

        <Divider label="or sign up with" />

        <View className="gap-3">
          <SocialButton
            provider="google"
            onPress={promptGoogleSignIn}
            isLoading={isExchangingToken}
          />
          {Platform.OS === "ios" && (
            <SocialButton provider="apple" onPress={handleAppleSignIn} />
          )}
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-1.5 mt-8">
        <Text style={{ color: colors.text.secondary }} className="text-sm">
          Already have an account?
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text className="text-sm font-semibold" style={{ color: colors.brand[300] }}>
              Sign in
            </Text>
          </Pressable>
        </Link>
      </View>

      <LoadingOverlay visible={signUpState.isLoading} message="Creating your account..." />
    </Screen>
  );
}
