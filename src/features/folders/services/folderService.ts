import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, FIRESTORE_COLLECTIONS } from "@/config/firebase";
import type { CreateFolderInput, Folder, FolderColor } from "@/types/folder";

/**
 * Folders are stored as a subcollection of the owning user's document
 * (`users/{uid}/folders/{folderId}`) rather than a top-level collection —
 * this makes ownership implicit in the path, which keeps the Firestore
 * security rules simple (`allow read, write: if request.auth.uid == uid`)
 * and avoids needing a `where("ownerId", "==", uid)` filter + composite
 * index for every query.
 */
function foldersCollection(uid: string) {
  return collection(db, FIRESTORE_COLLECTIONS.users, uid, "folders");
}

function toFolder(id: string, ownerId: string, data: Record<string, unknown>): Folder {
  const toMillis = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : Date.now());
  return {
    id,
    ownerId,
    name: (data.name as string) ?? "Untitled",
    color: (data.color as FolderColor) ?? "purple",
    noteCount: (data.noteCount as number) ?? 0,
    isArchived: (data.isArchived as boolean) ?? false,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

async function listFolders(uid: string): Promise<Folder[]> {
  const q = query(foldersCollection(uid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toFolder(d.id, uid, d.data()));
}

async function createFolder(uid: string, input: CreateFolderInput): Promise<Folder> {
  const ref = doc(foldersCollection(uid));
  const payload = {
    name: input.name.trim(),
    color: input.color,
    noteCount: 0,
    isArchived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload);
  return toFolder(ref.id, uid, { ...payload, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
}

async function renameFolder(uid: string, folderId: string, name: string): Promise<void> {
  const ref = doc(foldersCollection(uid), folderId);
  await updateDoc(ref, { name: name.trim(), updatedAt: serverTimestamp() });
}

async function deleteFolder(uid: string, folderId: string): Promise<void> {
  const ref = doc(foldersCollection(uid), folderId);
  await deleteDoc(ref);
}

export const folderService = {
  listFolders,
  createFolder,
  renameFolder,
  deleteFolder,
};
