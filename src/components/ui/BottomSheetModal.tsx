import type { PropsWithChildren } from "react";
import { Modal, Pressable, View, Text } from "react-native";
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/config/theme";

interface BottomSheetModalProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export function BottomSheetModal({ visible, onClose, title, children }: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View
          entering={SlideInDown.duration(260).springify().damping(18)}
          exiting={SlideOutDown.duration(200)}
          style={{
            backgroundColor: colors.background.elevated,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingBottom: insets.bottom + 20,
            paddingTop: 12,
            paddingHorizontal: 20,
          }}
        >
          <View
            className="self-center rounded-full mb-4"
            style={{ width: 40, height: 5, backgroundColor: colors.border.default }}
          />
          {!!title && (
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
              {title}
            </Text>
          )}
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
