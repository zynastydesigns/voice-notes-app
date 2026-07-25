import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { SearchBar } from "@/components/ui/SearchBar";
import { NoteCard } from "@/components/ui/NoteCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useNoteSearch } from "@/features/notes/hooks/useNoteSearch";
import { useRecentSearches } from "@/features/search/hooks/useRecentSearches";
import { colors } from "@/config/theme";

type SearchMode = "normal" | "ai";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [mode, setMode] = useState<SearchMode>("normal");
  const { results, isLoading } = useNoteSearch(mode === "normal" ? query : "");
  const { recentSearches, addSearch, clearSearches } = useRecentSearches();

  useEffect(() => {
    if (params.q) setQuery(params.q);
  }, [params.q]);

  const handleSubmit = () => {
    if (query.trim()) addSearch(query);
  };

  return (
    <Screen edges={["top"]}>
      <View className="px-5 pt-2 gap-4">
        <Text className="text-xl font-bold" style={{ color: colors.text.primary }}>
          Search
        </Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          autoFocus={!params.q}
        />

        <View className="flex-row gap-2">
          {(
            [
              { key: "normal", label: "Normal Search" },
              { key: "ai", label: "AI Search · BETA" },
            ] as const
          ).map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setMode(tab.key)}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: mode === tab.key ? colors.brand[500] : colors.background.card,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: mode === tab.key ? "#fff" : colors.text.secondary }}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {mode === "ai" ? (
        <View className="px-5 pt-6">
          <EmptyState
            icon="sparkles-outline"
            title="AI Search arrives with your first notes"
            subtitle={
              'Once you\'ve recorded a few notes, ask things like "show meetings about kitchen" or "find payment discussion" and AI Search will find them by meaning, not just keywords.'
            }
          />
        </View>
      ) : query.trim().length === 0 ? (
        <View className="px-5 pt-2">
          {recentSearches.length > 0 && (
            <>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                  Recent Searches
                </Text>
                <Pressable onPress={clearSearches}>
                  <Text className="text-xs font-medium" style={{ color: colors.brand[300] }}>
                    Clear
                  </Text>
                </Pressable>
              </View>
              {recentSearches.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setQuery(term)}
                  className="flex-row items-center gap-3 py-2.5"
                >
                  <Ionicons name="time-outline" size={17} color={colors.text.tertiary} />
                  <Text className="text-sm" style={{ color: colors.text.secondary }}>
                    {term}
                  </Text>
                </Pressable>
              ))}
            </>
          )}
        </View>
      ) : (
        <FlashList
          data={results}
          keyExtractor={(item) => item.id}
          estimatedItemSize={90}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <NoteCard note={item} onPress={() => {}} onMorePress={() => {}} />
          )}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon="search-outline"
                title="No results"
                subtitle={`Nothing matches "${query.trim()}" yet.`}
              />
            ) : null
          }
        />
      )}
    </Screen>
  );
}
