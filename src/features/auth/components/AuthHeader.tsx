import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { gradients, colors } from "@/config/theme";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function AuthHeader({ title, subtitle, icon = "mic" }: AuthHeaderProps) {
  return (
    <View className="items-center mb-8 gap-4">
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={28} color="#fff" />
      </LinearGradient>
      <View className="items-center gap-1.5">
        <Text className="text-2xl font-bold" style={{ color: colors.text.primary }}>
          {title}
        </Text>
        {!!subtitle && (
          <Text className="text-sm text-center px-6" style={{ color: colors.text.secondary }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
