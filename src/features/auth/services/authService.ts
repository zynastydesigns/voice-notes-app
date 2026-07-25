import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  onIdTokenChanged as firebaseOnIdTokenChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  reload,
  type User as FirebaseUser,
  type Unsubscribe,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import { auth, db, FIRESTORE_COLLECTIONS } from "@/config/firebase";
import type { AppUser, AuthProviderId, UserProfileDoc } from "@/types/user";

/** Maps a raw Firebase `User` into the app's normalized `AppUser` shape. */
export function toAppUser(user: FirebaseUser): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    providerIds: user.providerData
      .map((p) => p.providerId)
      .filter((id): id is AuthProviderId =>
        ["password", "google.com", "apple.com"].includes(id)
      ),
    createdAt: user.metadata.creationTime ? Date.parse(user.metadata.creationTime) : Date.now(),
  };
}

/**
 * Creates the Firestore `users/{uid}` profile document the first time a user
 * signs in (idempotent — safe to call on every login). Every other feature
 * (notes, folders, stats) reads/writes under this same document tree.
 */
async function ensureUserProfileDoc(user: FirebaseUser): Promise<void> {
  const ref = doc(db, FIRESTORE_COLLECTIONS.users, user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  const profile: Omit<UserProfileDoc, "createdAt" | "updatedAt"> & {
    createdAt: unknown;
    updatedAt: unknown;
  } = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    totalNotes: 0,
    totalRecordingSeconds: 0,
    storageUsedBytes: 0,
    preferences: {
      theme: "dark",
      language: "en",
      notificationsEnabled: true,
    },
  };
  await setDoc(ref, profile, { merge: true });
}

export interface EmailSignUpParams {
  email: string;
  password: string;
  displayName: string;
}

async function signUpWithEmail({ email, password, displayName }: EmailSignUpParams): Promise<AppUser> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: displayName.trim() });
  await sendEmailVerification(credential.user);
  await ensureUserProfileDoc(credential.user);
  return toAppUser(credential.user);
}

async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  await ensureUserProfileDoc(credential.user);
  return toAppUser(credential.user);
}

async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) throw new Error("No user is currently signed in.");
  await sendEmailVerification(auth.currentUser);
}

/** Re-fetches the current user from Firebase to pick up e.g. a fresh emailVerified flag. */
async function refreshCurrentUser(): Promise<AppUser | null> {
  if (!auth.currentUser) return null;
  await reload(auth.currentUser);
  return toAppUser(auth.currentUser);
}

/**
 * Google Sign-In via `expo-auth-session`'s AuthSession + the native Google
 * OAuth endpoint, exchanging the returned id_token for a Firebase credential.
 * The actual `promptAsync()` call happens in `useGoogleAuth` (a hook, since
 * it needs `AuthSession.useAuthRequest`); this function only completes the
 * Firebase half once an id_token is available.
 */
async function signInWithGoogleIdToken(idToken: string): Promise<AppUser> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  await ensureUserProfileDoc(result.user);
  return toAppUser(result.user);
}

/**
 * Apple Sign-In (iOS only). Generates a nonce, requests identity from
 * Apple's native dialog, then exchanges the identity token for a Firebase
 * credential via the generic OAuthProvider("apple.com").
 */
async function signInWithApple(): Promise<AppUser> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign-In is only available on iOS.");
  }

  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!appleCredential.identityToken) {
    throw new Error("Apple Sign-In did not return an identity token.");
  }

  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: appleCredential.identityToken,
    rawNonce,
  });

  const result = await signInWithCredential(auth, credential);

  // Apple only returns the user's name on the very first sign-in; persist it
  // to the Firebase profile immediately since it's never sent again.
  const fullName = appleCredential.fullName;
  if (fullName && (fullName.givenName || fullName.familyName) && !result.user.displayName) {
    const displayName = [fullName.givenName, fullName.familyName].filter(Boolean).join(" ");
    if (displayName) await updateProfile(result.user, { displayName });
  }

  await ensureUserProfileDoc(result.user);
  return toAppUser(result.user);
}

function onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

/** Fires on sign-in/out AND on silent token refresh — used to keep session storage warm. */
function onIdTokenChanged(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return firebaseOnIdTokenChanged(auth, callback);
}

export const authService = {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  resetPassword,
  resendVerificationEmail,
  refreshCurrentUser,
  signInWithGoogleIdToken,
  signInWithApple,
  onAuthStateChanged,
  onIdTokenChanged,
  ensureUserProfileDoc,
};
