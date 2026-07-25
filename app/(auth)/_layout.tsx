import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // Signed-in users shouldn't be able to navigate back to login/signup —
  // send them straight into the app shell.
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0B0B14" },
      }}
    />
  );
}
