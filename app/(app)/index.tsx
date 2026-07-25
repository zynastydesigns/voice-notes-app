import { useState } from "react";
import { View, Text, Pressable, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/ui/StatCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { NoteCard } from "@/components/ui/NoteCard";
import { FolderCard } from "@/features/folders/components/FolderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import { useRecentNotes } from "@/features/notes/hooks/useRecentNotes";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { aiProcessingService } from "@/features/recording/services/aiProcessingService";
import { formatDurationLong } from "@/utils/format";
import { colors } from "@/config/theme";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useUserProfile();
  const { notes, isLoading: notesLoading, refetch: refetchNotes } = useRecentNotes();
  const { folders, isLoading: foldersLoading, refetch: refetchFolders } = useFolders();
  const [activeTab, setActiveTab] = useState<"notes" | "folders">("notes");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchNotes(), refetchFolders()]);
    setRefreshing(false);
  };

  const displayName = user?.displayName?.split(" ")[0] || "there";

  const Header = (
    <View className="px-5 pt-2 gap-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Avatar photoURL={user?.photoURL} name={user?.displayName} />
          <View>
            <Text className="text-lg font-bold" style={{ color: colors.text.primary }}>
              {getGreeting()} {displayName} 👋
            </Text>
            <Text className="text-xs" style={{ color: colors.text.tertiary }} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>
        <Pressable
          className="items-center justify-center rounded-full"
          style={{ width: 40, height: 40, backgroundColor: colors.background.card }}
        >
          <Ionicons name="notifications-outline" size={19} color={colors.text.primary} />
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        <StatCard
          icon="mic"
          iconColor={colors.brand[400]}
          label="Total Recording Time"
          value={formatDurationLong(profile?.totalRecordingSeconds ?? 0)}
        />
        <StatCard
          icon="document-text"
          iconColor={colors.accent.teal}
          label="Total Notes"
          value={String(profile?.totalNotes ?? 0)}
        />
      </View>

      <View className="flex-row gap-6 border-b" style={{ borderColor: colors.border.subtle }}>
        {(["notes", "folders"] as const).map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} className="pb-2.5">
            <Text
              className="text-[15px] font-semibold capitalize"
              style={{ color: activeTab === tab ? colors.brand[400] : colors.text.tertiary }}
            >
              {tab}
            </Text>
            {activeTab === tab && (
              <View
                className="rounded-full mt-2.5"
                style={{ height: 2.5, backgroundColor: colors.brand[400] }}
              />
            )}
          </Pressable>
        ))}
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        onFilterPress={() => {}}
        onSubmitEditing={() => router.push({ pathname: "/(app)/search", params: { q: search } })}
      />

      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold" style={{ color: colors.text.primary }}>
          {activeTab === "notes" ? "Recent Notes" : "Your Folders"}
        </Text>
        {activeTab === "notes" && notes.length > 0 && (
          <Pressable onPress={() => router.push("/(app)/search")}>
            <Text className="text-sm font-semibold" style={{ color: colors.brand[300] }}>
              See All
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const data = activeTab === "notes" ? notes : folders;
  const isLoading = activeTab === "notes" ? notesLoading : foldersLoading;

  return (
    <Screen edges={["top"]}>
      <FlashList
        data={data}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        estimatedItemSize={90}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand[400]}
          />
        }
        renderItem={({ item }) =>
          activeTab === "notes" ? (
            <NoteCard
              note={item as any}
              onPress={() => {}}
              onMorePress={() => {}}
              onRetryPress={
                user ? () => aiProcessingService.retryProcessing(user.uid, item as any) : undefined
              }
            />
          ) : (
            <FolderCard
              folder={item as any}
              onPress={() => router.push("/(app)/folders")}
              onMorePress={() => {}}
            />
          )
        }
        ListEmptyComponent={
          !isLoading ? (
            activeTab === "notes" ? (
              <EmptyState
                icon="sparkles-outline"
                title="No notes yet"
                subtitle="Start your first AI-powered recording to see summaries and action items appear here."
              />
            ) : (
              <EmptyState
                icon="folder-open-outline"
                title="No folders yet"
                subtitle="Create a folder to start organizing your notes."
              />
            )
          ) : null
        }
      />
    </Screen>
  );
}
