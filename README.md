# AI Voice Notes

A premium AI voice-notes / meeting-assistant app built with Expo (React
Native), TypeScript, NativeWind, Firebase, React Query, and Zustand.

## Status

This is being built in phases. **Done so far:**

- ✅ Project foundation (Expo Router, NativeWind, TypeScript paths, design
  system, Firebase/MMKV/React Query wiring)
- ✅ Authentication — email login/signup, Google Sign-In, Apple Sign-In,
  forgot password, email verification
- ✅ App shell — protected tab navigation with the floating record button
- ✅ Home dashboard — stats, Notes/Folders switcher, search bar, recent notes
- ✅ Folders — full create/rename/delete, color picker
- ✅ Search — keyword search over notes, recent-searches history
- ✅ Profile/Settings — profile card, notification preference, storage
  usage, sign out
- ✅ Recording — real one-tap record/pause/resume/stop, live waveform,
  timer, local draft persistence

**Not built yet** (next phases): uploading drafts + speech-to-text + AI
summary/key-points/action-items pipeline, Note Detail screen (transcript /
summary / player tabs), the in-note AI chat assistant, export (PDF/DOCX/
TXT/MD/share), and push notifications.

## Getting started

```bash
npm install
cp .env.example .env
# fill in .env with your Firebase project + Google OAuth client IDs
npx expo start
```

### Firebase setup

1. Create a Firebase project, add an iOS app, Android app, and Web app.
2. Enable **Authentication** providers: Email/Password, Google, Apple.
3. Enable **Cloud Firestore** and **Cloud Storage**.
4. Copy your web app's config values into `.env` (see `.env.example`).
5. Firestore layout used by the app so far:
   - `users/{uid}` — profile doc (stats + preferences)
   - `users/{uid}/folders/{folderId}`
   - `users/{uid}/notes/{noteId}` (schema will expand with the AI pipeline)

You'll also want Firestore security rules restricting every read/write
under `users/{uid}/**` to `request.auth.uid == uid`.

### Google Sign-In setup

Google Sign-In uses `expo-auth-session`. You need an OAuth client ID from
Google Cloud Console (or Firebase's Google provider config) for each
platform you ship — Expo Go/dev-client, iOS, Android, and Web — and to plug
them into the `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` env vars.

### Apple Sign-In setup

Works out of the box on iOS via `expo-apple-authentication` once "Sign In
with Apple" capability is enabled for your bundle ID in your Apple
Developer account, and the same is enabled in your Firebase Auth provider
config.

### Native modules / dev client

`react-native-mmkv` requires a native module and is **not compatible with
Expo Go** — you'll need an EAS development build or a bare workflow build
to run this app:

```bash
npx expo install expo-dev-client
eas build --profile development --platform ios   # or android
```

## Project structure

```
app/                      Expo Router routes
  (auth)/                 Login, signup, forgot-password, verify-email
  (app)/                  Protected tab routes: home, search, folders,
                          profile, plus the record modal
src/
  components/ui/          Reusable design-system primitives
  components/navigation/  Custom tab bar
  components/recording/   Waveform visualization
  config/                 Firebase init + design tokens
  features/               One folder per domain (auth, folders, notes,
                          profile, recording, search) — each with its own
                          services/ (Firebase calls), hooks/ (React Query),
                          and components/ (feature-specific UI)
  lib/                    MMKV + React Query client setup
  providers/              App-wide context providers
  store/                  Zustand stores
  types/                  Shared domain types
  utils/                  Formatting helpers
```

## Tech stack

Expo (Router, AV, Secure Store, Auth Session, Apple Authentication, Blur,
Linear Gradient, Haptics), TypeScript, NativeWind (Tailwind), React Native
Reanimated + Gesture Handler, TanStack React Query, Zustand, Firebase
(Auth, Firestore, Storage), MMKV, FlashList.
