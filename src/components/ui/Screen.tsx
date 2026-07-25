import type { PropsWithChildren } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/config/theme";

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  edges?: Array<"top" | "bottom">;
  className?: string;
  contentContainerStyle?: ViewStyle;
  keyboardAvoiding?: boolean;
}

/**
 * Standard screen shell: dark gradient background + safe-area padding.
 * Use `scroll` for forms/detail screens; leave it off for screens that
 * manage their own scrolling (e.g. lists with FlashList/FlatList).
 */
export function Screen({
  children,
  scroll = false,
  edges = ["top", "bottom"],
  className = "",
  contentContainerStyle,
  keyboardAvoiding = true,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = edges.includes("top") ? insets.top : 0;
  const paddingBottom = edges.includes("bottom") ? insets.bottom : 0;

  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? {
        contentContainerStyle: [{ flexGrow: 1, paddingBottom: 24 }, contentContainerStyle],
        keyboardShouldPersistTaps: "handled" as const,
        showsVerticalScrollIndicator: false,
      }
    : { style: [{ flex: 1 }, contentContainerStyle] };

  const body = (
    <View style={{ flex: 1, paddingTop, paddingBottom }} className={className}>
      {/* @ts-expect-error style/contentContainerStyle union depending on scroll */}
      <Content {...contentProps}>{children}</Content>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.background.default, colors.background.elevated]}
      style={{ flex: 1 }}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </LinearGradient>
  );
}
