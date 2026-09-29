# Exact release-verifier CLI cache fix (2026-09-29)

Local-only assignment on `lockliel-backend-v1`, starting commit
`e7bed92` (stopped-production-release evidence). No production connection was used
in this package. Last verified production state remains 272 with the bridge and
email migrations pending. This is readiness for a separately authorized retry,
not a production release or fresh production preflight.

## Root cause and narrow change

`verifyPreparedRelease` in `scripts/prepare-migration-release.mjs` previously
required exactly config.toml and migrations beneath each staged supabase directory.
The official CLI 2.118.0 successful-command update notifier also creates
`supabase/.temp/cli-latest`. The recorded direct dry-run created an 8-byte version
cache, causing the next offline verification to stop before any write.

Reviewed primary source:
https://github.com/supabase/cli/blob/v2.118.0/apps/cli/src/command-internal/upgrade-notice.ts
The notifier can write a version tag or an empty offline-backoff value. Neither
is migration input. CLI version 2.118.0 and SHA-256 remain pinned to
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.
The cache does not select or authorize any different executable.

The verifier allows only an optional real .temp directory containing exactly one
regular file named cli-latest, independently for all and bridge stages. No other
child, nested directory or symlink is accepted. The cache contents are not used
by the verifier or pinned-runner selection. Empty cache directories fail.

All migration names/bytes and exact config remain verified. The verifier now also
checks exact package/stage root entries and manifest bytes, so a sibling .env,
seed, role or other unexpected file cannot escape verification above the supabase
directory. lstat checks reject file/directory symlink substitutions throughout
the prepared package. These checks are point-in-time verification, not protection
against a malicious concurrent process mutating files after verification. Preserve
single-operator ownership and verify immediately before execution.

## Regression evidence

- Full guarded `npm test`: webpack/static build passed; **501 JS tests passed**,
  zero failures/skips. External IP access denied at OS level, with only loopback
  and private Unix sockets allowed; existing Node network guard stayed enabled.
- Focused migration packaging/preflight suite: **51 tests passed**. Includes clean
  packages, optional cache in either/both stages, extra cache children/directories,
  empty cache directory, directory replacing cache file, unexpected hidden/config/
  seed/role files, modified/extra/missing migrations, modified/missing config,
  extra stage/root paths, changed/missing manifest and byte-preserving symlink
  substitutions. Cache is present during tampering tests so it cannot mask drift.
- Targeted ESLint for verifier, rehearsal and regression tests passed.
- `git diff --check` passed. All **274 migration SHA-256 values unchanged**.
- Offline verification of the prior real dry-run package, including its existing
  8-byte cache, now passes without deleting or modifying its files.

## Actual pinned CLI disposable rehearsal

Used the existing documented PostgreSQL 17 private socket/SCRAM runner under
verified OS outbound IP denial. It discards caller DB credentials, accepts no
connection arguments and creates/removes only its disposable cluster. Local
socket SSL disable is unchanged test behavior; production still requires direct
TLS verify-full and the official CA. No production credentials were supplied.

The fresh package passed verification before CLI execution. The actual pinned
CLI stage-272 dry-run created only the empty .temp/cli-latest offline cache; it was
not synthesized. The verifier passed afterward, rejected an injected extra cache
child, then passed after removal of that test-only child. Exact migration plan:

1. `20260925035350_lockliel_reconstructed_review_share_history.sql`
2. `20260926212002_lockliel_correct_profile_email_pattern.sql`

Seeds and roles were empty; --skip-vault remained set. --include-all behavior,
read-only discovery and unchanged ledger were verified. Full disposable staged
execution reached 273 and 274 with verification after actual CLI operations.
All eight existing failure/discovery protections and 21 rolled-back SQL fixture
executions passed. Lock timeout (5s), statement timeout (30s), connection-loss,
ledger failure, catalog drift and incompatible-email rollback protections remain.
Canonical final CHECK, no pending migrations, original ledger, unchanged
application data/security and prepared migration bytes all passed locally.

Evidence logs (local, no credentials):
`/private/tmp/lockliel-cache-unit.log`,
`/private/tmp/lockliel-cache-npm-test.log`,
`/private/tmp/lockliel-cache-rehearsal.log`.

## Preservation and next action

No production migration, data/schema/settings mutation, Auth/SMTP/payment/staff/
content change, deployment, push, merge or main change. Local disposable migrations
are test execution only. No dependency or historical migration file changed.
Catalog fingerprints, expected stages, backup/MFA gates, direct TLS requirement,
CLI flags, timeout bounds and failure/commit-state decision tree remain unchanged.

VERIFIER FIX READY FOR PRODUCTION MIGRATION RETRY

Next: obtain a separate explicit production retry assignment using this local fix.
Prepare a fresh isolated package from the new commit and refresh direct hotspot
connectivity, hidden-password authentication, startup settings, physical backup,
MFA/health/site/main, stage-272 preflight/quiet window and exact pinned dry-run.
Execute 273 then 274 only under that assignment, preserving the intermediate
checkpoint. Do not reuse a previous helper pinned to the old HEAD or start a
production retry/deployment/signup test automatically.
