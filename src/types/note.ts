export type NoteProcessingStatus = "processing" | "ready" | "failed";

export interface Note {
  id: string;
  ownerId: string;
  title: string;
  folderId: string | null;
  durationSeconds: number;
  summaryPreview: string | null;
  audioUrl: string | null;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  /**
   * Lifecycle of the AI processing pipeline (transcribe + summarize) that
   * runs after a recording is saved. Defaults to "ready" when reading a doc
   * that predates this field, so older/manually-created notes still render
   * normally instead of appearing stuck "processing".
   */
  status: NoteProcessingStatus;
  transcript: string | null;
  actionItems: string[];
  /** Set when status is "failed" — shown to the user with a retry action. */
  processingError: string | null;
}
