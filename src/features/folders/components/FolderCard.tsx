import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "@/config/theme";
import { FOLDER_COLOR_HEX } from "@/features/folders/utils/folderColors";
import type { Folder } from "@/types/folder";

interface FolderCardProps {
  folder: Folder;
  onPress: () => void;
  onMorePress: () => void;
}

export function FolderCard({ folder, onPress, onMorePress }: FolderCardProps) {
  const tint = FOLDER_COLOR_HEX[folder.color];

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      className="flex-row items-center rounded-2xl px-4 py-3.5 mb-3"
      style={{ backgroundColor: colors.background.card }}
    >
      <View
        className="items-center justify-center rounded-xl mr-3.5"
        style={{ width: 46, height: 46, backgroundColor: `${tint}26` }}
      >
        <Ionicons name="folder" size={22} color={tint} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold" style={{ color: colors.text.primary }}>
          {folder.name}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>
          {folder.noteCount} {folder.noteCount === 1 ? "note" : "notes"}
        </Text>
      </View>
      <Pressable hitSlop={10} onPress={onMorePress} className="p-1">
        <Ionicons name="ellipsis-vertical" size={18} color={colors.text.tertiary} />
      </Pressable>
    </Pressable>
  );
}
