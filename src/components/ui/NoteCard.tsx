import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "@/config/theme";
import { formatClock, formatRelativeDate } from "@/utils/format";
import type { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onMorePress: () => void;
  /** Only relevant when note.status === "failed" — re-runs the AI pipeline. */
  onRetryPress?: () => void;
}

export function NoteCard({ note, onPress, onMorePress, onRetryPress }: NoteCardProps) {
  const isProcessing = note.status === "processing";
  const isFailed = note.status === "failed";

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      className="flex-row rounded-2xl px-4 py-3.5 mb-3"
      style={{ backgroundColor: colors.background.card }}
    >
      <View
        className="items-center justify-center rounded-full mr-3"
        style={{
          width: 42,
          height: 42,
          backgroundColor: isFailed ? "rgba(248,113,113,0.15)" : "rgba(124,92,252,0.15)",
        }}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={colors.brand[400]} />
        ) : (
          <Ionicons
            name={isFailed ? "alert-circle" : "mic"}
            size={18}
            color={isFailed ? colors.accent.red : colors.brand[400]}
          />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-start justify-between">
          <Text
            className="text-[15px] font-semibold flex-1 mr-2"
            style={{ color: colors.text.primary }}
            numberOfLines={1}
          >
            {note.title}
          </Text>
          <Text className="text-xs" style={{ color: colors.text.tertiary }}>
            {formatClock(note.durationSeconds)}
          </Text>
        </View>
        <Text className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>
          {formatRelativeDate(note.createdAt)}
        </Text>

        {isProcessing && (
          <View className="flex-row items-center gap-1.5 mt-1.5">
            <View
              className="rounded-full"
              style={{ width: 5, height: 5, backgroundColor: colors.brand[400] }}
            />
            <Text className="text-xs" style={{ color: colors.brand[300] }}>
              Transcribing with AI...
            </Text>
          </View>
        )}

        {isFailed && (
          <View className="flex-row items-center justify-between mt-1.5">
            <Text className="text-xs flex-1 mr-2" style={{ color: colors.accent.red }} numberOfLines={1}>
              {note.processingError || "AI processing failed"}
            </Text>
            {!!onRetryPress && (
              <Pressable
                hitSlop={8}
                onPress={(e) => {
                  e.stopPropagation?.();
                  Haptics.selectionAsync().catch(() => {});
                  onRetryPress();
                }}
                className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                style={{ backgroundColor: "rgba(248,113,113,0.15)" }}
              >
                <Ionicons name="refresh" size={11} color={colors.accent.red} />
                <Text className="text-[11px] font-semibold" style={{ color: colors.accent.red }}>
                  Retry
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {!isProcessing && !isFailed && !!note.summaryPreview && (
          <Text
            className="text-xs mt-1.5"
            style={{ color: colors.text.secondary }}
            numberOfLines={2}
          >
            {note.summaryPreview}
          </Text>
        )}
      </View>

      <Pressable hitSlop={10} onPress={onMorePress} className="pl-2 justify-start">
        <Ionicons name="ellipsis-vertical" size={17} color={colors.text.tertiary} />
      </Pressable>
    </Pressable>
  );
}
