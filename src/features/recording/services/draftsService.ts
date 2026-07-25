import * as FileSystem from "expo-file-system";
import { mmkv } from "@/lib/mmkv";

export interface RecordingDraft {
  id: string;
  fileUri: string;
  durationSeconds: number;
  title: string;
  createdAt: number;
}

const DRAFTS_INDEX_KEY = "recording-drafts";
const DRAFTS_DIR = `${FileSystem.documentDirectory}recording-drafts/`;

async function ensureDraftsDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DRAFTS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DRAFTS_DIR, { intermediates: true });
  }
}

function readIndex(): RecordingDraft[] {
  const raw = mmkv.getString(DRAFTS_INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(drafts: RecordingDraft[]): void {
  mmkv.set(DRAFTS_INDEX_KEY, JSON.stringify(drafts));
}

/**
 * Copies the just-recorded audio file (which expo-av writes to a transient
 * cache location) into a stable app-owned directory, and records its
 * metadata in the local drafts index. Returns the persisted draft.
 */
async function saveDraft(params: {
  sourceUri: string;
  durationSeconds: number;
  title: string;
  id?: string;
}): Promise<RecordingDraft> {
  await ensureDraftsDir();
  const id = params.id ?? `draft_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const extension = params.sourceUri.split(".").pop() || "m4a";
  const destUri = `${DRAFTS_DIR}${id}.${extension}`;

  await FileSystem.copyAsync({ from: params.sourceUri, to: destUri });

  const draft: RecordingDraft = {
    id,
    fileUri: destUri,
    durationSeconds: Math.round(params.durationSeconds),
    title: params.title.trim() || "Untitled Recording",
    createdAt: Date.now(),
  };

  const drafts = [draft, ...readIndex().filter((d) => d.id !== id)];
  writeIndex(drafts);
  return draft;
}

async function getDraft(id: string): Promise<RecordingDraft | null> {
  return readIndex().find((d) => d.id === id) ?? null;
}

async function listDrafts(): Promise<RecordingDraft[]> {
  return readIndex().sort((a, b) => b.createdAt - a.createdAt);
}

async function deleteDraft(id: string): Promise<void> {
  const drafts = readIndex();
  const target = drafts.find((d) => d.id === id);
  if (target) {
    await FileSystem.deleteAsync(target.fileUri, { idempotent: true });
  }
  writeIndex(drafts.filter((d) => d.id !== id));
}

export const draftsService = {
  saveDraft,
  listDrafts,
  getDraft,
  deleteDraft,
};
