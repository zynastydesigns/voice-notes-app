import { FirebaseError } from "firebase/app";
import type { AuthErrorInfo } from "@/types/user";

const FRIENDLY_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account already exists with this email.",
  "auth/weak-password": "Please choose a stronger password (at least 8 characters).",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/requires-recent-login": "Please sign in again to complete this action.",
  "auth/invalid-verification-code": "That verification code is invalid or expired.",
  "auth/missing-password": "Please enter a password.",
};

export function mapAuthError(error: unknown): AuthErrorInfo {
  if (error instanceof FirebaseError) {
    const code = error.code.replace("auth/", "auth/");
    return {
      code: error.code,
      message: FRIENDLY_MESSAGES[error.code] ?? "Something went wrong. Please try again.",
    };
  }
  if (error instanceof Error) {
    return { code: "unknown", message: error.message };
  }
  return { code: "unknown", message: "Something went wrong. Please try again." };
}
