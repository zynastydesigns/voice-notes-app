import { useEffect, type PropsWithChildren } from "react";
import { authService, toAppUser } from "@/features/auth/services/authService";
import { useAuthStore } from "@/store/authStore";

/**
 * Subscribes to Firebase's auth state exactly once for the lifetime of the
 * app and mirrors it into `useAuthStore`. Every screen reads auth state
 * through `useAuth()` (backed by that store) rather than subscribing to
 * Firebase directly — this is the only place `onAuthStateChanged` is called.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    setStatus("authenticating");

    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(toAppUser(firebaseUser));
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    return unsubscribe;
  }, [setUser, setStatus]);

  return children;
}
