import { View, Pressable, Text } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { colors, gradients } from "@/config/theme";

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { active: "home", inactive: "home-outline", label: "Home" },
  search: { active: "search", inactive: "search-outline", label: "Search" },
  folders: { active: "folder", inactive: "folder-outline", label: "Folders" },
  profile: { active: "person", inactive: "person-outline", label: "Profile" },
};

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // The record button lives visually in the middle of the four real tabs
  // but isn't a tab itself — tapping it pushes a full-screen recording
  // modal instead of switching tab content (matching the reference, where
  // the mic always opens the same live-recording experience).
  const routes = state.routes.filter((r) => r.name !== "record");
  const leftRoutes = routes.slice(0, 2);
  const rightRoutes = routes.slice(2);

  const renderTab = (route: (typeof routes)[number]) => {
    const routeIndex = state.routes.findIndex((r) => r.key === route.key);
    const isFocused = state.index === routeIndex;
    const meta = TAB_ICONS[route.name] ?? { active: "ellipse", inactive: "ellipse-outline", label: route.name };

    const onPress = () => {
      Haptics.selectionAsync().catch(() => {});
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable key={route.key} onPress={onPress} className="flex-1 items-center justify-center gap-1 py-1">
        <Ionicons
          name={isFocused ? meta.active : meta.inactive}
          size={23}
          color={isFocused ? colors.brand[400] : colors.text.tertiary}
        />
        <Text
          className="text-[10.5px] font-medium"
          style={{ color: isFocused ? colors.brand[400] : colors.text.tertiary }}
        >
          {meta.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: insets.bottom || 10,
        paddingTop: 8,
        backgroundColor: colors.background.elevated,
        borderTopWidth: 1,
        borderTopColor: colors.border.subtle,
      }}
    >
      {leftRoutes.map(renderTab)}

      <View className="items-center" style={{ width: 76 }}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push("/(app)/record");
          }}
          style={{ marginTop: -30 }}
        >
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.brand[500],
              shadowOpacity: 0.5,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
              borderWidth: 4,
              borderColor: colors.background.elevated,
            }}
          >
            <Ionicons name="mic" size={26} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      {rightRoutes.map(renderTab)}
    </View>
  );
}
