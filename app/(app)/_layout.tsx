import { Redirect } from "expo-router";
import { Tabs } from "expo-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AppTabBar } from "@/components/navigation/AppTabBar";

export default function AppLayout() {
  const { isAuthenticated, isEmailVerified, user, status } = useAuth();

  if (status === "unknown" || status === "authenticating") {
    return null; // root index screen owns the boot spinner
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const requiresVerification = user?.providerIds.includes("password") && !isEmailVerified;
  if (requiresVerification) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="record" options={{ title: "Record", href: null }} />
      <Tabs.Screen name="folders" options={{ title: "Folders" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
