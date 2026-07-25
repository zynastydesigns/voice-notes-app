import { View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors } from "@/config/theme";

interface WaveformProps {
  samples: number[];
  isActive: boolean;
  height?: number;
}

export function Waveform({ samples, isActive, height = 64 }: WaveformProps) {
  return (
    <View
      className="flex-row items-center justify-center gap-[3px]"
      style={{ height, opacity: isActive ? 1 : 0.4 }}
    >
      {samples.map((level, i) => (
        <Bar key={i} level={level} maxHeight={height} />
      ))}
    </View>
  );
}

function Bar({ level, maxHeight }: { level: number; maxHeight: number }) {
  const style = useAnimatedStyle(() => ({
    height: withTiming(Math.max(4, level * maxHeight), { duration: 90 }),
  }));

  return (
    <Animated.View
      style={[
        {
          width: 3,
          borderRadius: 2,
          backgroundColor: colors.brand[400],
        },
        style,
      ]}
    />
  );
}
