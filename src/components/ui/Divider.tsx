import { View, Text } from "react-native";
import { colors } from "@/config/theme";

export function Divider({ label }: { label?: string }) {
  if (!label) {
    return <View style={{ height: 1, backgroundColor: colors.border.default }} />;
  }
  return (
    <View className="flex-row items-center gap-3 py-1">
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border.default }} />
      <Text className="text-xs" style={{ color: colors.text.tertiary }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border.default }} />
    </View>
  );
}
