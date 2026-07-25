import { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

export type RecorderState = "idle" | "requesting-permission" | "recording" | "paused" | "stopped";

export interface RecordingResult {
  uri: string;
  durationSeconds: number;
}

const METERING_INTERVAL_MS = 100;
const WAVEFORM_SAMPLE_COUNT = 40;
/** expo-av reports metering in dBFS, roughly -160 (silence) to 0 (max). */
const MIN_DB = -50;
const MAX_DB = 0;

function normalizeMetering(db: number | undefined): number {
  if (db === undefined || !Number.isFinite(db)) return 0.02;
  const clamped = Math.max(MIN_DB, Math.min(MAX_DB, db));
  return (clamped - MIN_DB) / (MAX_DB - MIN_DB);
}

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(Array(WAVEFORM_SAMPLE_COUNT).fill(0.02));
  const [inputLevel, setInputLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecordingResult | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meteringRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedAtPauseRef = useRef(0);
  const startedAtRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (meteringRef.current) clearInterval(meteringRef.current);
    timerRef.current = null;
    meteringRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const startTimers = useCallback(() => {
    startedAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const secondsSinceResume = (Date.now() - startedAtRef.current) / 1000;
      setElapsedSeconds(elapsedAtPauseRef.current + secondsSinceResume);
    }, 200);

    meteringRef.current = setInterval(async () => {
      const recording = recordingRef.current;
      if (!recording) return;
      try {
        const status = await recording.getStatusAsync();
        if (!status.isRecording) return;
        const level = normalizeMetering(status.metering);
        setInputLevel(level);
        setWaveform((prev) => [...prev.slice(1), level]);
      } catch {
        // Recording may have just been stopped between the interval tick and
        // this call resolving — safe to ignore.
      }
    }, METERING_INTERVAL_MS);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setState("requesting-permission");
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone access is required to record voice notes.");
        setState("idle");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        METERING_INTERVAL_MS
      );
      recordingRef.current = recording;
      elapsedAtPauseRef.current = 0;
      setElapsedSeconds(0);
      setWaveform(Array(WAVEFORM_SAMPLE_COUNT).fill(0.02));
      setResult(null);
      setState("recording");
      startTimers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start recording.");
      setState("idle");
    }
  }, [startTimers]);

  const pauseRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    try {
      await recording.pauseAsync();
      clearTimers();
      elapsedAtPauseRef.current = elapsedSeconds;
      setState("paused");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't pause recording.");
    }
  }, [clearTimers, elapsedSeconds]);

  const resumeRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    try {
      await recording.startAsync();
      setState("recording");
      startTimers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't resume recording.");
    }
  }, [startTimers]);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return null;
    try {
      clearTimers();
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      const finalDuration = elapsedSeconds;
      recordingRef.current = null;
      setState("stopped");
      if (uri) {
        const finalResult = { uri, durationSeconds: finalDuration };
        setResult(finalResult);
        return finalResult;
      }
      return null;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't stop recording.");
      return null;
    }
  }, [clearTimers, elapsedSeconds]);

  const discardRecording = useCallback(() => {
    clearTimers();
    recordingRef.current = null;
    elapsedAtPauseRef.current = 0;
    setElapsedSeconds(0);
    setWaveform(Array(WAVEFORM_SAMPLE_COUNT).fill(0.02));
    setResult(null);
    setState("idle");
  }, [clearTimers]);

  return {
    state,
    elapsedSeconds,
    waveform,
    inputLevel,
    error,
    result,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    discardRecording,
  };
}
