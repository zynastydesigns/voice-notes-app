export type AuthProviderId = "password" | "google.com" | "apple.com";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerIds: AuthProviderId[];
  createdAt: number;
}

export interface UserProfileDoc {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  updatedAt: number;
  totalNotes: number;
  totalRecordingSeconds: number;
  storageUsedBytes: number;
  preferences: {
    theme: "dark" | "light" | "system";
    language: string;
    notificationsEnabled: boolean;
  };
}

export type AuthStatus = "unknown" | "authenticating" | "authenticated" | "unauthenticated";

export interface AuthErrorInfo {
  code: string;
  message: string;
}
