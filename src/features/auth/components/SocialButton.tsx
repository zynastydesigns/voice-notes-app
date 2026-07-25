import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "@/config/theme";

interface SocialButtonProps {
  provider: "google" | "apple";
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const PROVIDER_META = {
  google: { icon: "logo-google" as const, label: "Continue with Google" },
  apple: { icon: "logo-apple" as const, label: "Continue with Apple" },
};

export function SocialButton({ provider, onPress, isLoading, disabled }: SocialButtonProps) {
  const meta = PROVIDER_META[provider];
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      className="flex-row items-center justify-center rounded-2xl gap-2"
      style={{
        height: 52,
        borderWidth: 1.5,
        borderColor: colors.border.default,
        backgroundColor: colors.background.card,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.text.primary} />
      ) : (
        <>
          <Ionicons name={meta.icon} size={19} color={colors.text.primary} />
          <Text style={{ color: colors.text.primary }} className="text-[15px] font-semibold">
            {meta.label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
