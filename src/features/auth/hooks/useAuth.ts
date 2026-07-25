import { useCallback, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authService, type EmailSignUpParams } from "@/features/auth/services/authService";
import { mapAuthError } from "@/features/auth/utils/mapAuthError";
import type { AuthErrorInfo } from "@/types/user";

interface AsyncActionState {
  isLoading: boolean;
  error: AuthErrorInfo | null;
}

/**
 * Primary hook for all auth reads/writes across the app. Screens should
 * never import `authService` or `useAuthStore` directly — go through here so
 * loading/error handling stays consistent everywhere (login, signup, forgot
 * password, settings > logout, etc.).
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  const [signInState, setSignInState] = useState<AsyncActionState>({ isLoading: false, error: null });
  const [signUpState, setSignUpState] = useState<AsyncActionState>({ isLoading: false, error: null });
  const [resetState, setResetState] = useState<AsyncActionState>({ isLoading: false, error: null });
  const [appleState, setAppleState] = useState<AsyncActionState>({ isLoading: false, error: null });
  const [signOutError, setSignOutError] = useState<AuthErrorInfo | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    setSignInState({ isLoading: true, error: null });
    try {
      const appUser = await authService.signInWithEmail(email, password);
      setSignInState({ isLoading: false, error: null });
      return appUser;
    } catch (err) {
      const error = mapAuthError(err);
      setSignInState({ isLoading: false, error });
      throw error;
    }
  }, []);

  const signUp = useCallback(async (params: EmailSignUpParams) => {
    setSignUpState({ isLoading: true, error: null });
    try {
      const appUser = await authService.signUpWithEmail(params);
      setSignUpState({ isLoading: false, error: null });
      return appUser;
    } catch (err) {
      const error = mapAuthError(err);
      setSignUpState({ isLoading: false, error });
      throw error;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setAppleState({ isLoading: true, error: null });
    try {
      const appUser = await authService.signInWithApple();
      setAppleState({ isLoading: false, error: null });
      return appUser;
    } catch (err) {
      const error = mapAuthError(err);
      setAppleState({ isLoading: false, error });
      throw error;
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    setResetState({ isLoading: true, error: null });
    try {
      await authService.resetPassword(email);
      setResetState({ isLoading: false, error: null });
    } catch (err) {
      const error = mapAuthError(err);
      setResetState({ isLoading: false, error });
      throw error;
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    await authService.resendVerificationEmail();
  }, []);

  const refreshEmailVerified = useCallback(async () => {
    const refreshed = await authService.refreshCurrentUser();
    if (refreshed) useAuthStore.getState().setUser(refreshed);
    return refreshed;
  }, []);

  const signOut = useCallback(async () => {
    setSignOutError(null);
    try {
      await authService.signOut();
    } catch (err) {
      setSignOutError(mapAuthError(err));
      throw err;
    }
  }, []);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isEmailVerified: !!user?.emailVerified,

    signIn,
    signInState,
    signUp,
    signUpState,
    signInWithApple,
    appleState,
    sendPasswordReset,
    resetState,
    resendVerificationEmail,
    refreshEmailVerified,
    signOut,
    signOutError,
  };
}
