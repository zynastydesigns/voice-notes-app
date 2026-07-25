import { useEffect, useState, useCallback } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { authService } from "@/features/auth/services/authService";
import { mapAuthError } from "@/features/auth/utils/mapAuthError";
import type { AppUser, AuthErrorInfo } from "@/types/user";

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthResult {
  /** Call this to open the Google account picker. */
  promptGoogleSignIn: () => Promise<void>;
  /** True while the Google->Firebase exchange is in flight (after the picker closes). */
  isExchangingToken: boolean;
  isRequestReady: boolean;
  error: AuthErrorInfo | null;
}

/**
 * Wraps Google Sign-In end to end:
 *  1. `promptAsync()` opens the native/browser account picker.
 *  2. On success, the returned `id_token` is exchanged for a Firebase
 *     credential via `authService.signInWithGoogleIdToken`.
 *  3. `onSuccess` fires with the resulting AppUser so the caller (login/
 *     signup screen) can navigate — auth state also updates globally via
 *     the `useAuth` store subscription, so navigation isn't strictly
 *     required here, but the callback keeps UX snappy.
 */
export function useGoogleAuth(onSuccess: (user: AppUser) => void): UseGoogleAuthResult {
  const [isExchangingToken, setIsExchangingToken] = useState(false);
  const [error, setError] = useState<AuthErrorInfo | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    const idToken = response.params?.id_token;
    if (!idToken) {
      setError({ code: "auth/no-id-token", message: "Google did not return an ID token." });
      return;
    }

    let cancelled = false;
    setIsExchangingToken(true);
    setError(null);

    authService
      .signInWithGoogleIdToken(idToken)
      .then((user) => {
        if (!cancelled) onSuccess(user);
      })
      .catch((err) => {
        if (!cancelled) setError(mapAuthError(err));
      })
      .finally(() => {
        if (!cancelled) setIsExchangingToken(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const promptGoogleSignIn = useCallback(async () => {
    setError(null);
    const result = await promptAsync();
    if (result.type === "error") {
      setError({ code: "auth/google-prompt-failed", message: "Google Sign-In failed to open." });
    } else if (result.type === "dismiss" || result.type === "cancel") {
      // User closed the picker — not an error worth surfacing.
    }
  }, [promptAsync]);

  return {
    promptGoogleSignIn,
    isExchangingToken,
    isRequestReady: !!request,
    error,
  };
}
