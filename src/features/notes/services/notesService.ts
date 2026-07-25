import { collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { db, FIRESTORE_COLLECTIONS } from "@/config/firebase";
import type { Note } from "@/types/note";

/**
 * Notes live under `users/{uid}/notes/{noteId}` for the same ownership-via-
 * path reason as folders (see folderService.ts). Only a `list` is exposed
 * so far — recording a note and writing its Firestore doc happens in the
 * recording/AI-processing feature, not here.
 */
export function notesCollection(uid: string) {
  return collection(db, FIRESTORE_COLLECTIONS.users, uid, "notes");
}

function toNote(id: string, ownerId: string, data: Record<string, unknown>): Note {
  const toMillis = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : Date.now());
  return {
    id,
    ownerId,
    title: (data.title as string) ?? "Untitled Note",
    folderId: (data.folderId as string | null) ?? null,
    durationSeconds: (data.durationSeconds as number) ?? 0,
    summaryPreview: (data.summaryPreview as string | null) ?? null,
    audioUrl: (data.audioUrl as string | null) ?? null,
    isFavorite: (data.isFavorite as boolean) ?? false,
    isArchived: (data.isArchived as boolean) ?? false,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    // Docs written before the AI processing step existed have none of these
    // fields — default to "ready" so they keep rendering as normal, already-
    // finished notes instead of looking stuck mid-pipeline.
    status: (data.status as Note["status"]) ?? "ready",
    transcript: (data.transcript as string | null) ?? null,
    actionItems: Array.isArray(data.actionItems) ? (data.actionItems as string[]) : [],
    processingError: (data.processingError as string | null) ?? null,
  };
}

async function listRecentNotes(uid: string, max = 5): Promise<Note[]> {
  const q = query(notesCollection(uid), orderBy("createdAt", "desc"), limit(max));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toNote(d.id, uid, d.data()));
}

/**
 * Searches by title and summary preview, filtered client-side. This is
 * fine at the note volumes a single user accumulates from voice recordings;
 * if that stops being true, swap this for a hosted search index (e.g.
 * Algolia/Typesense) fed by a Cloud Function without changing the caller.
 */
async function searchNotes(uid: string, searchText: string, max = 50): Promise<Note[]> {
  const q = query(notesCollection(uid), orderBy("createdAt", "desc"), limit(max));
  const snapshot = await getDocs(q);
  const needle = searchText.trim().toLowerCase();
  if (!needle) return [];
  return snapshot.docs
    .map((d) => toNote(d.id, uid, d.data()))
    .filter(
      (note) =>
        note.title.toLowerCase().includes(needle) ||
        (note.summaryPreview ?? "").toLowerCase().includes(needle)
    );
}

export const notesService = {
  listRecentNotes,
  searchNotes,
};
