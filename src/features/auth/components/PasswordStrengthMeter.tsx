import { View, Text } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors } from "@/config/theme";
import { passwordStrength } from "@/features/auth/validation/authValidation";

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const BAR_COLORS = [
  colors.accent.red,
  colors.accent.red,
  colors.accent.amber,
  colors.accent.teal,
  colors.accent.green,
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password);

  if (!password) return null;

  return (
    <View className="gap-1.5 mt-1">
      <View className="flex-row gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <Bar key={i} active={i < score} color={BAR_COLORS[score]} />
        ))}
      </View>
      <Text className="text-xs" style={{ color: BAR_COLORS[score] }}>
        {LABELS[score]}
      </Text>
    </View>
  );
}

function Bar({ active, color }: { active: boolean; color: string }) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: withTiming(active ? color : colors.border.default, { duration: 200 }),
  }));

  return <Animated.View style={[{ flex: 1, height: 4, borderRadius: 2 }, style]} />;
}
