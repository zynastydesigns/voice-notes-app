import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Waveform } from "@/components/recording/Waveform";
import { useAudioRecorder } from "@/features/recording/hooks/useAudioRecorder";
import { aiProcessingService } from "@/features/recording/services/aiProcessingService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { colors } from "@/config/theme";

function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function RecordScreen() {
  const {
    state,
    elapsedSeconds,
    waveform,
    error,
    result,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    discardRecording,
  } = useAudioRecorder();

  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hasStartedRef = useRef(false);

  // Auto-start the moment the screen opens — the tab-bar mic button is the
  // single entry point for recording, so there's no reason to make the user
  // tap twice.
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startRecording();
    }
  }, [startRecording]);

  const handleClose = () => {
    if (state === "recording" || state === "paused") {
      discardRecording();
    }
    router.back();
  };

  const handleStop = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await stopRecording();
  };

  const handleTogglePause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (state === "recording") await pauseRecording();
    else if (state === "paused") await resumeRecording();
  };

  const handleDiscard = () => {
    discardRecording();
    router.back();
  };

  const handleSave = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    try {
      // Returns as soon as the note doc is created with status "processing" —
      // the actual upload + transcription + summary run in the background,
      // so this screen doesn't sit blocked on a slow network call.
      await aiProcessingService.processRecording(user.uid, {
        sourceUri: result.uri,
        durationSeconds: result.durationSeconds,
        title,
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Review screen (after Stop) ----
  if (state === "stopped" && result) {
    return (
      <Screen contentContainerStyle={{ paddingHorizontal: 24 }}>
        <View className="flex-1 justify-center gap-6">
          <View className="items-center gap-3">
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 72, height: 72, backgroundColor: "rgba(52,211,153,0.15)" }}
            >
              <Ionicons name="checkmark-circle" size={36} color={colors.accent.green} />
            </View>
            <Text className="text-xl font-bold" style={{ color: colors.text.primary }}>
              Recording complete
            </Text>
            <Text className="text-sm" style={{ color: colors.text.tertiary }}>
              {formatTimer(result.durationSeconds)} recorded
            </Text>
          </View>

          <View>
            <Text className="mb-1.5 text-xs font-medium" style={{ color: colors.text.secondary }}>
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Untitled Recording"
              placeholderTextColor={colors.text.tertiary}
              style={{
                height: 52,
                borderRadius: 16,
                paddingHorizontal: 16,
                backgroundColor: colors.background.input,
                color: colors.text.primary,
                fontSize: 15.5,
              }}
            />
          </View>

          <Text className="text-xs text-center px-2" style={{ color: colors.text.tertiary }}>
            Saving starts AI transcription and summarization in the background — it'll appear in
            your notes list in a few moments.
          </Text>

          <View className="gap-3">
            <Button label="Save Recording" onPress={handleSave} isLoading={isSaving} />
            <Button label="Discard" variant="ghost" onPress={handleDiscard} />
          </View>
        </View>
      </Screen>
    );
  }

  // ---- Live recording / paused screen ----
  const isRecording = state === "recording";
  const isPaused = state === "paused";

  return (
    <Screen contentContainerStyle={{ paddingHorizontal: 24 }}>
      <View className="flex-row items-center justify-between pt-2">
        <Pressable onPress={handleClose} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.text.primary} />
        </Pressable>
        <Text className="text-base font-semibold" style={{ color: colors.text.primary }}>
          {isPaused ? "Paused" : isRecording ? "Recording..." : "Preparing..."}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <View className="flex-1 items-center justify-center gap-8">
        <Text
          className="font-bold"
          style={{ color: colors.text.primary, fontSize: 46, fontVariant: ["tabular-nums"] }}
        >
          {formatTimer(elapsedSeconds)}
        </Text>

        <Waveform samples={waveform} isActive={isRecording} />

        <View
          className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: colors.background.card }}
        >
          <Ionicons name="pulse" size={14} color={colors.brand[400]} />
          <Text className="text-xs font-medium" style={{ color: colors.text.secondary }}>
            High Quality
          </Text>
        </View>

        {!!error && (
          <Text className="text-sm text-center px-4" style={{ color: colors.accent.red }}>
            {error}
          </Text>
        )}
      </View>

      <View className="flex-row items-center justify-center gap-10 mb-6">
        <Pressable
          onPress={handleDiscard}
          className="items-center justify-center rounded-full"
          style={{ width: 56, height: 56, backgroundColor: colors.background.card }}
        >
          <Ionicons name="trash-outline" size={22} color={colors.text.secondary} />
        </Pressable>

        <Pressable
          onPress={handleTogglePause}
          className="items-center justify-center rounded-full"
          style={{
            width: 76,
            height: 76,
            backgroundColor: "rgba(124,92,252,0.15)",
            borderWidth: 2,
            borderColor: colors.brand[400],
          }}
        >
          <Ionicons name={isPaused ? "play" : "pause"} size={30} color={colors.brand[400]} />
        </Pressable>

        <Pressable
          onPress={handleStop}
          className="items-center justify-center rounded-full"
          style={{ width: 56, height: 56, backgroundColor: colors.accent.red }}
        >
          <Ionicons name="stop" size={22} color="#fff" />
        </Pressable>
      </View>

      <Animated.View
        entering={FadeIn.delay(300)}
        className="rounded-2xl px-4 py-3.5 mb-4 flex-row gap-3"
        style={{ backgroundColor: colors.background.card }}
      >
        <Ionicons name="bulb-outline" size={18} color={colors.accent.amber} />
        <Text className="flex-1 text-xs" style={{ color: colors.text.secondary }}>
          Speak clearly and reduce background noise for better transcription accuracy.
        </Text>
      </Animated.View>
    </Screen>
  );
}
