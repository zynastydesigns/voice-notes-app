import * as FileSystem from "expo-file-system";
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, FIRESTORE_COLLECTIONS } from "@/config/firebase";
import { notesCollection } from "@/features/notes/services/notesService";
import { queryClient, queryKeys } from "@/lib/queryClient";
import { draftsService, type RecordingDraft } from "@/features/recording/services/draftsService";
import { transcribeAndSummarize } from "@/features/recording/services/geminiTranscriptionService";
import type { Note } from "@/types/note";

/**
 * The AI processing step for a recording, end to end:
 *
 *   1. Save the audio locally and write a Firestore note doc immediately
 *      with status "processing" — the note shows up in the list right away
 *      (with a processing badge) instead of the UI blocking on network
 *      calls for however long transcription takes.
 *   2. In the background: upload the audio to Storage, send it to Gemini
 *      for transcript + title + summary + action items, then update the
 *      note doc to status "ready" with the results.
 *   3. On any failure, mark the note "failed" with a message and leave the
 *      local draft file in place so `retryProcessing` can pick it back up
 *      without re-recording.
 *
 * The local draft is kept (id-matched to the Firestore note) until the
 * pipeline succeeds, so a failure never loses the actual recording.
 */

function notesDoc(uid: string, noteId: string) {
  return doc(notesCollection(uid), noteId);
}

async function uploadAudioAndGetUrl(uid: string, noteId: string, draft: RecordingDraft) {
  const info = await FileSystem.getInfoAsync(draft.fileUri, { size: true });
  if (!info.exists) throw new Error("Recording file is missing on this device.");

  // Gemini needs the audio inline as base64.
  const base64Audio = await FileSystem.readAsStringAsync(draft.fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Firebase Storage's uploadBytes wants a Blob/ArrayBuffer/Uint8Array. On
  // Expo/React Native, converting the base64 string ourselves would need
  // atob/Buffer, neither of which is reliably available in the Hermes JS
  // engine without extra polyfills — fetching the local file URI and
  // reading it as a Blob is the standard, polyfill-free way to do this.
  const fileResponse = await fetch(draft.fileUri);
  const blob = await fileResponse.blob();

  const extension = draft.fileUri.split(".").pop() || "m4a";
  const storageRef = ref(storage, `users/${uid}/recordings/${noteId}.${extension}`);
  await uploadBytes(storageRef, blob, { contentType: "audio/mp4" });
  const audioUrl = await getDownloadURL(storageRef);

  return { audioUrl, base64Audio, fileSizeBytes: ("size" in info ? info.size : 0) ?? 0 };
}

async function bumpProfileStats(uid: string, durationSeconds: number, fileSizeBytes: number) {
  const profileRef = doc(db, FIRESTORE_COLLECTIONS.users, uid);
  try {
    await updateDoc(profileRef, {
      totalNotes: increment(1),
      totalRecordingSeconds: increment(Math.round(durationSeconds)),
      storageUsedBytes: increment(fileSizeBytes),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-critical — the note itself already saved successfully. A missing
    // or not-yet-created profile doc shouldn't fail the whole pipeline.
  }
}

async function runPipeline(uid: string, noteId: string, draft: RecordingDraft): Promise<void> {
  try {
    const { audioUrl, base64Audio, fileSizeBytes } = await uploadAudioAndGetUrl(uid, noteId, draft);

    const result = await transcribeAndSummarize({ base64Audio, fileUri: draft.fileUri });

    // Only let the AI's title win if the user didn't type one themselves.
    const isUntitled = draft.title === "Untitled Recording" || !draft.title.trim();

    await updateDoc(notesDoc(uid, noteId), {
      title: isUntitled ? result.title : draft.title,
      transcript: result.transcript,
      summaryPreview: result.summaryPreview || null,
      actionItems: result.actionItems,
      audioUrl,
      status: "ready",
      processingError: null,
      updatedAt: serverTimestamp(),
    });

    await bumpProfileStats(uid, draft.durationSeconds, fileSizeBytes);
    await draftsService.deleteDraft(draft.id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI processing failed.";
    await updateDoc(notesDoc(uid, noteId), {
      status: "failed",
      processingError: message,
      updatedAt: serverTimestamp(),
    }).catch(() => {
      // If even the failure-state write fails (e.g. offline), the note is
      // left "processing" — retryProcessing can still be invoked manually,
      // and a future successful sync will reconcile the doc's real state.
    });
  } finally {
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
  }
}

/**
 * Saves the just-recorded audio as a local draft (keyed to a fresh note id),
 * writes the Firestore note doc with status "processing", and kicks off the
 * upload+AI pipeline in the background. Returns as soon as the doc is
 * created — callers should navigate away immediately rather than waiting.
 */
async function processRecording(
  uid: string,
  params: { sourceUri: string; durationSeconds: number; title: string },
  folderId: string | null = null
): Promise<string> {
  const ref = doc(notesCollection(uid));
  const noteId = ref.id;

  const draft = await draftsService.saveDraft({ ...params, id: noteId });

  await setDoc(ref, {
    title: draft.title,
    folderId,
    durationSeconds: draft.durationSeconds,
    summaryPreview: null,
    audioUrl: null,
    transcript: null,
    actionItems: [],
    isFavorite: false,
    isArchived: false,
    status: "processing",
    processingError: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });

  // Intentionally not awaited by the caller — runs in the background.
  runPipeline(uid, noteId, draft);

  return noteId;
}

/** Re-runs the pipeline for a note stuck in "failed" — the local draft file must still exist. */
async function retryProcessing(uid: string, note: Note): Promise<void> {
  const draft = await draftsService.getDraft(note.id);
  if (!draft) {
    await updateDoc(notesDoc(uid, note.id), {
      status: "failed",
      processingError: "The original recording is no longer available on this device.",
      updatedAt: serverTimestamp(),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    return;
  }
  await updateDoc(notesDoc(uid, note.id), {
    status: "processing",
    processingError: null,
    updatedAt: serverTimestamp(),
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
  await runPipeline(uid, note.id, draft);
}

export const aiProcessingService = {
  processRecording,
  retryProcessing,
};
