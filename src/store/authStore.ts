import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "@/lib/mmkv";
import type { AppUser, AuthStatus } from "@/types/user";

interface AuthState {
  user: AppUser | null;
  status: AuthStatus;
  /** Set by the AuthProvider's Firebase listener — the single source of truth. */
  setUser: (user: AppUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

/**
 * Only `user` is persisted (as a lightweight cache so the app can render an
 * optimistic "already logged in" UI instantly on cold start, before Firebase
 * has finished re-hydrating its own session). `status` always starts at
 * "unknown" on boot and is recomputed for real by AuthProvider.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "unknown",
      setUser: (user) => set({ user }),
      setStatus: (status) => set({ status }),
      clear: () => set({ user: null, status: "unauthenticated" }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
