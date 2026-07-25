import { View, ActivityIndicator, Text, Modal } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { colors } from "@/config/theme";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={{ flex: 1 }}>
        <BlurView
          intensity={40}
          tint="dark"
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <View
            className="items-center rounded-2xl px-8 py-7 gap-3"
            style={{ backgroundColor: colors.background.card }}
          >
            <ActivityIndicator size="large" color={colors.brand[400]} />
            {!!message && (
              <Text style={{ color: colors.text.secondary }} className="text-sm">
                {message}
              </Text>
            )}
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}
