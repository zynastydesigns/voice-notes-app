import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, FIRESTORE_COLLECTIONS } from "@/config/firebase";
import type { UserProfileDoc } from "@/types/user";

async function getProfile(uid: string): Promise<UserProfileDoc | null> {
  const ref = doc(db, FIRESTORE_COLLECTIONS.users, uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    uid,
    email: data.email ?? null,
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
    totalNotes: data.totalNotes ?? 0,
    totalRecordingSeconds: data.totalRecordingSeconds ?? 0,
    storageUsedBytes: data.storageUsedBytes ?? 0,
    preferences: {
      theme: data.preferences?.theme ?? "dark",
      language: data.preferences?.language ?? "en",
      notificationsEnabled: data.preferences?.notificationsEnabled ?? true,
    },
  };
}

async function updatePreferences(
  uid: string,
  preferences: Partial<UserProfileDoc["preferences"]>
): Promise<void> {
  const ref = doc(db, FIRESTORE_COLLECTIONS.users, uid);
  const dotUpdates: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(preferences)) {
    dotUpdates[`preferences.${key}`] = value;
  }
  await updateDoc(ref, dotUpdates);
}

export const profileService = {
  getProfile,
  updatePreferences,
};
