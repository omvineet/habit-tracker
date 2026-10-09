# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Delivery (this project)

The owner verifies changes on their Android phone — not via PR review.

- Do **not** request code reviews, Bugbot reviews, security reviews, or "ready for review" PR status.
- Leave PRs as draft until deploy; deploy merges to `main`.
- **Merging needs no approval** (owner's standing instruction): merge PRs to `main` yourself after a successful deploy; never wait for confirmation. If the PR can't be created/merged via tools, fast-forward `main` per the deploy skill.
- **Auto-deploy (mandatory):** When a feature is finished and `npm run check` passes, immediately follow `.claude/skills/deploy-android/SKILL.md` end-to-end. Do **not** wait for the owner to say "deploy this". Treat feature-complete + green tests as authorization to ship to the phone (OTA or APK per that skill).
- If deploy fails, stop and report the failure; do not claim the feature is shipped.
