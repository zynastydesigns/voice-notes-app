import { MMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

/**
 * Single shared MMKV instance for the whole app. MMKV is synchronous and
 * dramatically faster than AsyncStorage, which is why it's used for all
 * local persistence (auth session cache, UI prefs, draft recordings index)
 * except for Firebase Auth's own token persistence, which requires the
 * AsyncStorage-shaped API (see src/config/firebase.ts).
 */
export const mmkv = new MMKV({ id: "ai-voice-notes-storage" });

/**
 * Adapts MMKV's synchronous API to the async `StateStorage` shape Zustand's
 * `persist` middleware expects, so stores can call `persist(..., { storage:
 * createJSONStorage(() => mmkvStorage) })`.
 */
export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    mmkv.delete(name);
  },
};
