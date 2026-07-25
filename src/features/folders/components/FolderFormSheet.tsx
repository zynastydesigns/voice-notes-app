import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { colors } from "@/config/theme";
import { FOLDER_COLOR_HEX, FOLDER_COLORS } from "@/features/folders/utils/folderColors";
import type { CreateFolderInput, Folder, FolderColor } from "@/types/folder";

interface FolderFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateFolderInput) => Promise<void>;
  isSubmitting: boolean;
  initialFolder?: Folder | null;
}

export function FolderFormSheet({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  initialFolder,
}: FolderFormSheetProps) {
  const [name, setName] = useState(initialFolder?.name ?? "");
  const [color, setColor] = useState<FolderColor>(initialFolder?.color ?? "purple");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(initialFolder?.name ?? "");
      setColor(initialFolder?.color ?? "purple");
      setError(null);
    }
  }, [visible, initialFolder]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Give your folder a name.");
      return;
    }
    await onSubmit({ name, color });
    onClose();
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={initialFolder ? "Rename Folder" : "New Folder"}
    >
      <View className="gap-4">
        <TextField
          label="Folder name"
          placeholder="e.g. Client Meetings"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError(null);
          }}
          error={error}
          autoFocus
        />

        <View>
          <Text className="mb-2 text-xs font-medium" style={{ color: colors.text.secondary }}>
            Color
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {FOLDER_COLORS.map((c) => {
              const isSelected = c === color;
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: FOLDER_COLOR_HEX[c],
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isSelected ? 2.5 : 0,
                    borderColor: colors.text.primary,
                  }}
                />
              );
            })}
          </View>
        </View>

        <Button
          label={initialFolder ? "Save Changes" : "Create Folder"}
          onPress={handleSubmit}
          isLoading={isSubmitting}
        />
      </View>
    </BottomSheetModal>
  );
}
