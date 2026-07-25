import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import {
  getReactNativePersistence,
  initializeAuth,
  getAuth,
  type Auth,
} from "firebase/auth";
// @ts-expect-error - getReactNativePersistence is not in the public firebase/auth types yet
// but is exported at runtime by the firebase SDK for React Native environments.
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeFirestore, getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";
import { Platform } from "react-native";

/**
 * All values are public client identifiers, not secrets — Firebase security
 * is enforced with Firestore/Storage security rules, not by hiding these.
 * They're still pulled from env so different builds (dev/staging/prod) can
 * point at different Firebase projects without code changes.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function assertConfigured() {
  const missing = Object.entries(firebaseConfig)
    .filter(([key, value]) => key !== "measurementId" && !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(
      `[firebase] Missing config values: ${missing.join(
        ", "
      )}. Set them in your .env file (see .env.example) before running the app.`
    );
  }
}
assertConfigured();

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Auth must be initialized once, with a persistence layer, or every reload
 * will drop the user's session. On native we use AsyncStorage-backed
 * persistence; on web the default browser persistence is used automatically.
 */
function createAuth(): Auth {
  if (Platform.OS === "web") {
    return getAuth(firebaseApp);
  }
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (e) {
    // initializeAuth throws if it was already called (e.g. Fast Refresh) —
    // fall back to the existing instance instead of crashing.
    return getAuth(firebaseApp);
  }
}
export const auth: Auth = createAuth();

/**
 * `initializeFirestore` with `experimentalForceLongPolling` avoids a class of
 * flaky-connection issues seen with the default WebChannel transport on some
 * Android devices/emulators and corporate networks. Falls back gracefully if
 * Firestore was already initialized elsewhere (Fast Refresh).
 */
function createFirestore(): Firestore {
  try {
    return initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: Platform.OS === "android",
      ignoreUndefinedProperties: true,
    });
  } catch (e) {
    return getFirestore(firebaseApp);
  }
}
export const db: Firestore = createFirestore();

export const storage: FirebaseStorage = getStorage(firebaseApp);

/**
 * Messaging (FCM) is web-API-shaped and not fully supported on native via
 * the JS SDK — on native, push tokens are obtained through
 * `expo-notifications` instead (see src/features/notifications). This
 * export exists for the web target and is resolved lazily and safely.
 */
export async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (Platform.OS !== "web") return null;
  const supported = await isSupported().catch(() => false);
  return supported ? getMessaging(firebaseApp) : null;
}

export const FIRESTORE_COLLECTIONS = {
  users: "users",
  notes: "notes",
  recordings: "recordings",
  summaries: "summaries",
  folders: "folders",
  settings: "settings",
  notifications: "notifications",
} as const;
