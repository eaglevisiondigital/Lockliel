#!/bin/sh
# SOURCE-PINNED OFFLINE READINESS ONLY. No installation, token, request or grant.
set -eu
[ "$#" -eq 0 ] || exit 1
ROOT='/Users/davesmacbookpro/.codex/worktrees/lockliel-wave10-hosted-composition/Lockliel'
NODE='/opt/homebrew/Cellar/node@24/24.20.0/bin/node'
fail() { printf '%s\n' '{"ok":false,"category":"SOURCE_MISMATCH","inputRequested":false,"requestAttempted":false}'; exit 1; }
[ ! -L "$ROOT/scripts/provider-evidence-collector/launcher.mjs" ] || fail
[ ! -L "$ROOT/scripts/provider-evidence-collector/source-manifest.json" ] || fail
[ "$(/usr/bin/shasum -a 256 "$ROOT/scripts/provider-evidence-collector/launcher.mjs" | /usr/bin/cut -d ' ' -f 1)" = 'b3db74a7014c81e09c6952f327fdb49ccfa51bb7a68962a6d98d30a5e9b235b3' ] || fail
[ "$(/usr/bin/shasum -a 256 "$ROOT/scripts/provider-evidence-collector/source-manifest.json" | /usr/bin/cut -d ' ' -f 1)" = '198578421c5eb2895d8395c3cb963b3f62cee37b9e97d24f2a0d7d2ac226f12c' ] || fail
[ "$(/usr/bin/shasum -a 256 "$NODE" | /usr/bin/cut -d ' ' -f 1)" = 'c8eedc7651a438fb7d2ceb36fd70032676c855586a36c950ba5a662f0b7853bd' ] || fail
exec /usr/bin/env -i PATH=/usr/bin:/bin "$NODE" "$ROOT/scripts/provider-evidence-collector/launcher.mjs"
