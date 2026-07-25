import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-10 gap-3">
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 64, height: 64, backgroundColor: "rgba(124,92,252,0.12)" }}
      >
        <Ionicons name={icon} size={28} color={colors.brand[400]} />
      </View>
      <Text className="text-[15px] font-semibold text-center" style={{ color: colors.text.primary }}>
        {title}
      </Text>
      {!!subtitle && (
        <Text className="text-sm text-center" style={{ color: colors.text.tertiary }}>
          {subtitle}
        </Text>
      )}
      {action}
    </View>
  );
}
