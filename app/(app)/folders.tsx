import { useMemo, useState } from "react";
import { View, Text, Pressable, Alert, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionSheet } from "@/components/ui/ActionSheet";
import { FolderCard } from "@/features/folders/components/FolderCard";
import { FolderFormSheet } from "@/features/folders/components/FolderFormSheet";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { colors } from "@/config/theme";
import type { Folder } from "@/types/folder";

export default function FoldersScreen() {
  const { folders, isLoading, refetch, createFolder, isCreating, renameFolder, deleteFolder } =
    useFolders();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [activeSheetFolder, setActiveSheetFolder] = useState<Folder | null>(null);

  const filtered = useMemo(
    () => folders.filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase())),
    [folders, search]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateOrRename = async (input: { name: string; color: Folder["color"] }) => {
    if (editingFolder) {
      await renameFolder({ folderId: editingFolder.id, name: input.name });
    } else {
      await createFolder(input);
    }
    setEditingFolder(null);
  };

  const confirmDelete = (folder: Folder) => {
    Alert.alert(
      "Delete Folder",
      `Delete "${folder.name}"? Notes inside will remain, but ungrouped.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteFolder(folder.id) },
      ]
    );
  };

  return (
    <Screen edges={["top"]}>
      <View className="px-5 pt-2 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold" style={{ color: colors.text.primary }}>
            Folders
          </Text>
          <Pressable
            onPress={() => {
              setEditingFolder(null);
              setIsFormVisible(true);
            }}
            className="items-center justify-center rounded-full"
            style={{ width: 38, height: 38, backgroundColor: colors.background.card }}
          >
            <Ionicons name="add" size={22} color={colors.brand[400]} />
          </Pressable>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search folders..." />
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        estimatedItemSize={78}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand[400]} />
        }
        renderItem={({ item }) => (
          <FolderCard
            folder={item}
            onPress={() => {}}
            onMorePress={() => setActiveSheetFolder(item)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="folder-open-outline"
              title={search ? "No matching folders" : "No folders yet"}
              subtitle={
                search
                  ? "Try a different search term."
                  : "Create your first folder to start organizing your notes."
              }
            />
          ) : null
        }
      />

      <FolderFormSheet
        visible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          setEditingFolder(null);
        }}
        onSubmit={handleCreateOrRename}
        isSubmitting={isCreating}
        initialFolder={editingFolder}
      />

      <ActionSheet
        visible={!!activeSheetFolder}
        onClose={() => setActiveSheetFolder(null)}
        title={activeSheetFolder?.name}
        actions={[
          {
            label: "Rename",
            icon: "pencil-outline",
            onPress: () => {
              setEditingFolder(activeSheetFolder);
              setIsFormVisible(true);
            },
          },
          {
            label: "Delete",
            icon: "trash-outline",
            destructive: true,
            onPress: () => activeSheetFolder && confirmDelete(activeSheetFolder),
          },
        ]}
      />
    </Screen>
  );
}
