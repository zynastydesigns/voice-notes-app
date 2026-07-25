import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { colors } from "@/config/theme";

export interface SheetAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: SheetAction[];
}

export function ActionSheet({ visible, onClose, title, actions }: ActionSheetProps) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose} title={title}>
      <View className="gap-1 pb-1">
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => {
              onClose();
              action.onPress();
            }}
            className="flex-row items-center gap-3 py-3.5"
          >
            <Ionicons
              name={action.icon}
              size={20}
              color={action.destructive ? colors.accent.red : colors.text.primary}
            />
            <Text
              className="text-[15px] font-medium"
              style={{ color: action.destructive ? colors.accent.red : colors.text.primary }}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </BottomSheetModal>
  );
}
