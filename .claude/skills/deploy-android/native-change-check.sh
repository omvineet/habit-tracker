#!/usr/bin/env bash
# Decide whether the current branch needs a new Android build or can ship OTA.
# Prints "OTA" or "BUILD" plus the reasons. Usage: native-change-check.sh [base-ref]
set -euo pipefail
BASE="${1:-origin/main}"
reasons=()

# 1. Runtime "dependencies" changed (devDependencies/scripts never affect the binary)
deps=$(node -e "
const {execSync}=require('child_process');
const old=JSON.parse(execSync('git show $BASE:package.json')).dependencies||{};
const cur=require('./package.json').dependencies||{};
const out=[];
for(const k of new Set([...Object.keys(old),...Object.keys(cur)])) if(old[k]!==cur[k]) out.push(k+': '+(old[k]??'(none)')+' -> '+(cur[k]??'(removed)'));
console.log(out.join('\n'));")
[ -n "$deps" ] && reasons+=("dependencies changed:"$'\n'"$deps")

# 2. Native-affecting app config: plugins, android block, version, runtimeVersion, SDK
for key in plugins android version runtimeVersion sdkVersion newArchEnabled; do
  a=$(git show "$BASE:app.json" 2>/dev/null | node -e "const j=JSON.parse(require('fs').readFileSync(0,'utf8')).expo;console.log(JSON.stringify(j['$key']??null))")
  b=$(node -e "const j=require('./app.json').expo;console.log(JSON.stringify(j['$key']??null))")
  [ "$a" != "$b" ] && reasons+=("app.json expo.$key changed")
done

# 3. Tracked native folders or eas.json build profiles
git diff --quiet "$BASE" -- android ios eas.json 2>/dev/null || reasons+=("android/, ios/ or eas.json changed")

if [ ${#reasons[@]} -eq 0 ]; then echo "OTA"; else echo "BUILD"; printf '%s\n' "${reasons[@]}"; fi
