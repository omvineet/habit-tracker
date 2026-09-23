# Habit Tracker

A personal, customizable habit tracker built with [Expo](https://expo.dev) (React Native), running from a single codebase on **Android** and **web**.

First habit tracked: **100 Days of Yoga** 🧘 (seeded automatically on first launch — even 5 minutes a day counts).

## Features

- Add your own habits with a name, emoji, and target number of days
- Daily check-in with streak tracking
- Progress bar + day-by-day grid you can tap to toggle any past day
- **Quick Log**: tap the mic button and say (or type) something like *"15 mins of yoga done, felt great"* — it's parsed locally (duration, matched habit, and note) and logged with a short auto-confirm countdown so you can cancel a bad match
- Delete habits you no longer want to track
- Data is stored locally on-device (`AsyncStorage` — `localStorage` on web), no backend, no account

## Getting started

```bash
npm install
npm run web       # run in the browser
npm run android   # run on a connected device/emulator (needs Android tooling), or scan the QR with Expo Go
```

### Connecting your phone

The fastest way to try the app on your Android phone, no build required:

1. Install **Expo Go** from the Play Store.
2. On your computer, run `npx expo start` from this folder.
3. Scan the QR code shown in the terminal with the Expo Go app (phone and computer must be on the same Wi-Fi).

Every time you save a file, the app reloads on your phone automatically — this is the normal day-to-day workflow, no deploy step. The one thing it can't do is **Quick Log's voice input**, since Expo Go doesn't include the speech-recognition native module (the typed fallback still works fully).

### One-time setup: install the app on your phone (for voice input)

To get voice input working, or to have the app live as its own icon on your phone (no Expo Go needed), build it once with [EAS](https://docs.expo.dev/build/introduction/) (free account):

```bash
npm install -g eas-cli
eas login                     # one-time, run this yourself — needs your Expo account
eas build:configure           # one-time, links this project to your EAS account
eas update:configure          # one-time, wires up OTA updates (see below)
eas build -p android --profile development   # installs a dev client you keep reloading into via `npm run dev`
```

Download the resulting `.apk` link on your phone (enable "install unknown apps" for your browser first) and install it. Then run `npm run dev` on your computer and open the app on your phone — it connects the same way Expo Go does, but with the native mic module included.

### Shipping updates to your phone automatically (no rebuild)

Once the dev client (or a `preview` build) is installed, you don't need to rebuild the APK for ordinary code changes — push them over the air:

```bash
npm run deploy
```

This runs `eas update`, which uploads your latest JS/TS changes to the `preview` channel. The app on your phone picks them up automatically the next time you open it (or resumes from background). Use this whenever you want to "ship yourself" the latest version without reinstalling anything.

A full rebuild (`eas build -p android --profile preview`) is only needed again if you add a new native module (like a different native library) — everyday feature/UI changes just need `npm run deploy`.

## Project structure

```
App.tsx                    # navigation (home <-> habit detail <-> quick log)
src/
  types.ts                 # Habit + ParsedLogEntry types
  storage.ts                # AsyncStorage load/save + seed data
  HabitsContext.tsx         # global habit state (add/delete/toggle/logEntry)
  utils/
    date.ts                  # date + streak helpers
    parseLogEntry.ts          # free-text -> {habit, minutes, note} parser
  components/
    HabitCard.tsx
    ProgressBar.tsx
    DayGrid.tsx
    AddHabitModal.tsx
  screens/
    HomeScreen.tsx
    HabitDetailScreen.tsx
    QuickLogScreen.tsx        # voice/typed logging entry point
```

## Notes

- No iOS build target is configured, but the same Expo project can also run in iOS Simulator (`npm run ios`) or be sideloaded to a personal iPhone via Xcode / EAS with a free or paid Apple ID — just more hoops than Android.
- Not intended for App Store / Play Store distribution.
