import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/config/theme";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}

export function StatCard({ icon, iconColor, label, value }: StatCardProps) {
  return (
    <View
      className="flex-1 rounded-2xl px-4 py-3.5 gap-2"
      style={{ backgroundColor: colors.background.card }}
    >
      <View
        className="items-center justify-center rounded-xl"
        style={{ width: 34, height: 34, backgroundColor: `${iconColor}22` }}
      >
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <Text className="text-xl font-bold" style={{ color: colors.text.primary }}>
        {value}
      </Text>
      <Text className="text-xs" style={{ color: colors.text.tertiary }}>
        {label}
      </Text>
    </View>
  );
}
