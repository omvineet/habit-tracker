---
name: deploy-android
description: Ship a finished feature of the habit-tracker app to the user's Android phone. Runs checks and tests, handles dependencies and on-device data (AsyncStorage) migrations, decides OTA update vs. new APK build, deploys via EAS, then merges to main. Auto-invoke for this repo whenever a feature is finished and npm run check passes — do not wait for "deploy this". Also use when the user says deploy/ship/release to phone.
---

# deploy-android

End-to-end release for this Expo SDK 57 app (`com.sevalabs.habittracker`, EAS project `seva-labs/habit-tracker`, `runtimeVersion` policy `appVersion`, channel `preview`).

AGENTS.md says Expo has changed: when unsure about a flag or API, check https://docs.expo.dev/versions/v57.0.0/ and `npx eas-cli@latest <cmd> --help` rather than relying on memory.

Invoking this skill is the user's authorization to: publish an OTA update to the **preview** channel, build an APK, push the feature branch, and merge to `main`. It is **not** authorization for a production/store release (none is configured) or for force-pushing, skipping failing tests, or editing signing credentials. Stop and ask in those cases.

Run the phases in order. Stop at the first failure, report the real output, and do not merge.

## Facts about this project

- **There is no backend or server DB.** "Database" = the on-device `AsyncStorage` JSON blob at key `habit-tracker/habits/v1` (`src/storage.ts`, shape in `src/types.ts`). Migrations are therefore *client-side code that runs on app load*, and they ship inside the OTA update.
- Tests: `npm run check` = `tsc --noEmit` + jest (`__tests__/`). `predeploy` and `prebuild:local` already run it.
- Scripts call `eas`, which is not installed globally. Use `npx eas-cli@latest ...` instead.
- OTA updates reach only builds with the **same platform + runtime version** (= `app.json` `version`) and channel `preview`.

## Phase 0 — Preflight

```bash
git status --short; git branch --show-current
npx eas-cli@latest whoami      # must be logged in as the seva-labs owner
gh auth status
```

- On `main` with uncommitted changes: create a branch `feat/<slug>` first (`git switch -c`). On `main` and clean: nothing to deploy, stop.
- Not logged in to EAS or `gh`: tell the user to run `! npx eas-cli@latest login` / `! gh auth login` themselves (interactive), then continue. Never ask for or handle credentials.
- Read the diff against main (`git diff main...HEAD`, plus uncommitted changes) so you know what the feature touches.

## Phase 1 — Dependencies

```bash
npm ci                       # reproducible install from package-lock.json
npx expo install --check     # flags any dep not matching SDK 57; fix with `npx expo install --fix`
npx expo-doctor              # report problems; fix those caused by this feature
```

New packages must be added with `npx expo install <pkg>` (not `npm i`) so the SDK-compatible version is chosen. If a package ships native code or an Expo config plugin, remember to add the plugin to `app.json` `plugins` — this makes Phase 4 a BUILD.

## Phase 2 — Data migration check

Compare the `Habit` type and every read/write of storage against `main`:

```bash
git diff main -- src/types.ts src/storage.ts
```

- **Additive optional field** (like `minutes?`, `notes?`): no migration needed. Code must tolerate it being `undefined`.
- **Rename, removal, type change, or new required field**: a migration is required. Implement it in `src/storage.ts`:
  1. Never silently reseed over real data (current code reseeds on corrupt JSON — don't extend that to "unknown version").
  2. Read the old key, transform, write the new shape. If the key version is bumped (`.../v2`), read `v1` once, migrate, write `v2`, and **keep `v1` untouched** so an OTA rollback or a failed migration cannot lose the user's history.
  3. Make it idempotent and safe to run twice.
  4. Add tests in `__tests__/storage.test.ts`: old-shape fixture -> migrated, already-migrated -> unchanged, corrupt -> existing behaviour.
- Web uses `localStorage` through the same module; the same migration covers it.

## Phase 3 — Tests

1. The feature must have tests. If new logic or UI has none, write them in `__tests__/` following the existing files (`helpers.ts`, `@testing-library/react-native`). Pure logic goes to `utils/` tests; context/UI to component tests.
2. Run `npm run check`. All must pass; fix the code (or the tests if genuinely wrong) — never delete or skip tests to get green.
3. Optional smoke check of the bundle: `npx expo export --platform android --output-dir /tmp/habit-export-check` (use the scratchpad dir if available, and delete after). Catches Metro/import errors that jest misses.

## Phase 4 — Choose OTA or BUILD

```bash
.claude/skills/deploy-android/native-change-check.sh origin/main   # prints OTA or BUILD + reasons
```

(`git fetch origin` first. If local `main` is ahead of `origin/main`, compare against `main` instead.)

- **OTA** — JS/asset/style changes only. Go to Phase 5a.
- **BUILD** — dependencies, config plugins, `android` config, SDK, or `version` changed. A new APK is required; installed apps cannot receive native changes over the air. Go to Phase 5b.

When in doubt, choose BUILD. Never publish an OTA that depends on a native module the installed APK lacks — it will crash on launch.

## Phase 5a — OTA deploy (preview channel)

```bash
npx eas-cli@latest update --channel preview --message "<feature summary, ≤72 chars>" --platform android --environment preview --non-interactive
```

- `--environment` is required for SDK 55+. If `preview` doesn't exist, `npx eas-cli@latest env:list` and pick the matching one; if the app needs no env vars, create it via the EAS dashboard/CLI with the user's say-so.
- Note: `npm run deploy` uses `--branch preview --auto` (message = last commit message). Either is fine; prefer the explicit command above.
- Record the printed update group ID.

## Phase 5b — Native build

Prefer a **cloud build** (no local Android SDK needed); use local only if the user has the toolchain.

1. Bump `app.json` `version` (patch for fixes, minor for features). Under the `appVersion` policy this creates a new runtime version, so existing installs stop receiving OTAs until they install the new APK — that is intended and prevents crashes.
2. Build:
   ```bash
   npx eas-cli@latest build -p android --profile preview --non-interactive --wait
   # local alternative:  npm run build:local   -> build/habit-tracker.apk
   ```
3. Give the user the install URL/QR from the build output (or `build/habit-tracker.apk`). They must enable "install unknown apps" and install it once. Subsequent JS-only features go back to Phase 5a.
4. Keystore/credentials are managed by EAS on first build; if it prompts interactively, tell the user to run the command with `!` themselves.

## Phase 6 — Commit, push, merge to main

Only reached after a successful deploy.

```bash
git add -A && git status --short          # review: no .env, keystores, build/, or dist/ (all gitignored; verify)
git commit -m "<imperative summary of the feature>

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin HEAD
gh pr create --fill --base main --body "<what changed, tests added, migration notes, OTA group id or build URL>

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
gh pr merge --squash --delete-branch
git switch main && git pull --ff-only
```

- If the merge is blocked (required checks/reviews, conflicts): report it; do not use `--admin` or force. For simple conflicts, rebase the branch on `main`, re-run Phase 3, and redeploy if code changed.
- If `main` has moved ahead and files overlap, re-run `npm run check` on the rebased branch before merging.
- If already on a branch that was merged by someone else, skip creating the PR.

## Phase 7 — Verify and report

```bash
npx eas-cli@latest update:list --branch preview --limit 1   # OTA: confirm the new group, platform android, runtime = app.json version
```

Tell the user, concisely:
- what shipped (OTA group ID or build URL, runtime version),
- tests run and result, migration performed or "none needed",
- PR / merge commit,
- how to see it: **fully close the app (swipe away) and reopen — up to two cold launches** (first downloads, second applies). Backgrounding is not enough.
- if nothing changes after that: confirm the installed APK's version equals the update's runtime version (installed before a version bump = won't receive it) and see `eas-update` skill's debug checklist.

## Rollback

- OTA bad: `npx eas-cli@latest update:rollback --branch preview` (or republish the previous commit). Data is safe because Phase 2 keeps the old storage key.
- Bad APK: reinstall the previous build from the EAS dashboard.
- Revert on main with `git revert <merge-sha>` through a new PR; never rewrite main history.

## Replicating this setup on a fresh machine / new project

One-time bootstrap (interactive steps are the user's — suggest `! <cmd>`):

```bash
brew install node gh                                  # Node LTS + GitHub CLI
git clone https://github.com/omvineet/habit-tracker.git && cd habit-tracker
npm ci
gh auth login
npx eas-cli@latest login                              # Expo account that owns seva-labs
npx eas-cli@latest init                               # only if the project isn't linked (app.json extra.eas.projectId)
npx eas-cli@latest update:configure                   # writes updates.url + runtimeVersion; don't hand-edit
npx eas-cli@latest build -p android --profile preview # first APK, install on phone once
```

Optional, for `npm run build:local` only: JDK 17 and Android SDK (`brew install --cask temurin@17 android-commandlinetools`, set `ANDROID_HOME`). Not needed for cloud builds.

`eas.json` profiles: `development` (dev client, channel `development`) and `preview` (internal APK, channel `preview`). `.gitignore` already excludes keystores and env files; credentials live on EAS, never in git.
