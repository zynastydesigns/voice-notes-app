import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { colors } from "@/config/theme";

export default function Index() {
  const { status, isAuthenticated, isEmailVerified, user } = useAuth();

  if (status === "unknown" || status === "authenticating") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background.default,
        }}
      >
        <ActivityIndicator size="large" color={colors.brand[400]} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Password-based accounts must verify their email before entering the app;
  // social logins (Google/Apple) come back already verified.
  const requiresVerification = user?.providerIds.includes("password") && !isEmailVerified;
  if (requiresVerification) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return <Redirect href="/(app)" />;
}
