# Habit Tracker

A personal, customizable habit tracker built with [Expo](https://expo.dev) (React Native), running from a single codebase on **Android** and **web**.

First habit tracked: **100 Days of Yoga** 🧘 (seeded automatically on first launch — even 5 minutes a day counts).

## Features

- Add your own habits with a name, emoji, and target number of days
- Daily check-in with streak tracking
- Progress bar + day-by-day grid you can tap to toggle any past day
- Delete habits you no longer want to track
- Data is stored locally on-device (`AsyncStorage` — `localStorage` on web), no backend, no account

## Getting started

```bash
npm install
npm run web       # run in the browser
npm run android   # run on a connected device/emulator (needs Android tooling), or scan the QR with Expo Go
```

## Building a personal Android APK

You don't need to publish to the Play Store to install this on your own phone. Easiest path is [EAS Build](https://docs.expo.dev/build/introduction/) with a free Expo account:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

This produces a downloadable `.apk` you can install directly via `adb install` or by opening the download link on your phone (enable "install unknown apps" for your browser first). Re-run the same command any time you want to ship yourself an updated build.

Alternatively, for local builds without EAS: `npx expo run:android` (needs Android Studio / SDK installed locally).

## Project structure

```
App.tsx                    # navigation (home <-> habit detail)
src/
  types.ts                 # Habit type
  storage.ts                # AsyncStorage load/save + seed data
  HabitsContext.tsx         # global habit state (add/delete/toggle)
  utils/date.ts              # date + streak helpers
  components/
    HabitCard.tsx
    ProgressBar.tsx
    DayGrid.tsx
    AddHabitModal.tsx
  screens/
    HomeScreen.tsx
    HabitDetailScreen.tsx
```

## Notes

- No iOS build target is configured, but the same Expo project can also run in iOS Simulator (`npm run ios`) or be sideloaded to a personal iPhone via Xcode / EAS with a free or paid Apple ID — just more hoops than Android.
- Not intended for App Store / Play Store distribution.
