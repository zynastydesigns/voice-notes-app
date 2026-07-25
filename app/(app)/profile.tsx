import { useState } from "react";
import { View, Text, Pressable, Switch, Alert } from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import { formatBytes } from "@/utils/format";
import { colors } from "@/config/theme";

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center rounded-2xl px-4 py-3.5 mb-2.5"
      style={{ backgroundColor: colors.background.card }}
    >
      <View
        className="items-center justify-center rounded-xl mr-3"
        style={{ width: 34, height: 34, backgroundColor: "rgba(124,92,252,0.15)" }}
      >
        <Ionicons name={icon} size={17} color={colors.brand[400]} />
      </View>
      <Text className="flex-1 text-[14.5px] font-medium" style={{ color: colors.text.primary }}>
        {label}
      </Text>
      {right ??
        (value !== undefined ? (
          <Text className="text-sm mr-1" style={{ color: colors.text.tertiary }}>
            {value}
          </Text>
        ) : null)}
      {onPress && <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, updatePreferences } = useUserProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    try {
      await updatePreferences({ notificationsEnabled: value });
    } catch {
      Alert.alert("Couldn't update this setting", "Please try again.");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setIsSigningOut(true);
          try {
            await signOut();
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll edges={["top"]} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}>
      <Text className="text-xl font-bold mb-5" style={{ color: colors.text.primary }}>
        Profile
      </Text>

      <View
        className="flex-row items-center rounded-2xl px-4 py-4 mb-6 gap-3.5"
        style={{ backgroundColor: colors.background.card }}
      >
        <Avatar photoURL={user?.photoURL} name={user?.displayName} size={54} />
        <View className="flex-1">
          <Text className="text-base font-bold" style={{ color: colors.text.primary }}>
            {user?.displayName ?? "Unnamed"}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: colors.text.tertiary }} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      <Text className="text-xs font-semibold mb-2.5 uppercase" style={{ color: colors.text.tertiary }}>
        Preferences
      </Text>
      <SettingsRow
        icon="notifications-outline"
        label="Notifications"
        right={
          <Switch
            value={profile?.preferences.notificationsEnabled ?? true}
            onValueChange={handleToggleNotifications}
            trackColor={{ true: colors.brand[500], false: colors.border.default }}
            thumbColor="#fff"
          />
        }
      />
      <SettingsRow icon="moon-outline" label="Appearance" value="Dark" />
      <SettingsRow icon="language-outline" label="Language" value="English" />

      <Text
        className="text-xs font-semibold mb-2.5 mt-4 uppercase"
        style={{ color: colors.text.tertiary }}
      >
        Storage
      </Text>
      <SettingsRow
        icon="cloud-outline"
        label="Storage Usage"
        value={formatBytes(profile?.storageUsedBytes ?? 0)}
      />

      <Text
        className="text-xs font-semibold mb-2.5 mt-4 uppercase"
        style={{ color: colors.text.tertiary }}
      >
        About
      </Text>
      <SettingsRow
        icon="information-circle-outline"
        label="App Version"
        value={Constants.expoConfig?.version ?? "1.0.0"}
      />

      <View className="mt-6 mb-4">
        <Button label="Sign Out" variant="danger" onPress={handleSignOut} isLoading={isSigningOut} />
      </View>
    </Screen>
  );
}
