# Lockliel release-preparation completion report

Date: 2026-09-27 UTC. Reasoning recommendation: HIGH. Primary Chat assignment:
release preparation only. **CONDITIONALLY READY TO REQUEST PRODUCTION MIGRATION
AUTHORIZATION.** Production execution remains separately authorized.

## Completed

Selected and checksum-pinned the actual Supabase CLI 2.118.0, inspected its source
and rehearsed independent 272 -> bridge 273 -> email 274 execution in disposable
PostgreSQL 17. Added offline immutable-file packaging, read-only preflight queries,
an offline capture checker, regression tests and the complete production runbook.
Corrected continuity documents. No application feature or migration SQL was edited.

## Continuity corrections

Production already accepts ordinary email addresses. Live stored historical SQL
and the current live CHECK use one backslash, while repository historical migration
`20260925153612` contains two. Historical files remain immutable. Pending
`20260926212002` converges to canonical `[.]` and supports consistent repository
replay. It must not be called a verified fix for an active production signup outage.

Manual dashboard evidence supplied by Dave and accepted by Chat establishes Pro,
Lockliel Platform `bsndfhbemstyrrglajat`, Eagle Vision Digital, ACTIVE_HEALTHY,
three completed physical backups at 2026-09-26 07:28:11, 2026-09-25 07:26:32 and
2026-09-24 21:09:11 UTC, Restore/Restore to new project availability, PITR disabled,
Storage bytes excluded, one visible organization Owner and Owner MFA disabled.
Retention duration and successful restore are unverified. This is not complete
recovery readiness and does not replace release-time dashboard evidence.

## Files changed and commits

Continuity: `AGENTS.md`, `CURRENT_BUILD_STATE.md`, `ARCHITECTURE.md`,
`SECURITY_MODEL.md`, `DECISIONS.md`, `README.md`, `docs/migration-reconciliation.md`.
New reports: this file and `docs/production-migration-runbook.md`.
Tooling: `scripts/prepare-migration-release.mjs`,
`scripts/check-migration-preflight.mjs`, `scripts/rehearse-migration-release.mjs`,
`tests/migration-release-preflight.test.mjs`.
Evidence/queries: six `supabase/verification/release-*` files, including all-274
SHA-256 manifest, live aggregate/catalog fingerprints, expected CLI ledger hashes,
ledger/security/preflight read-only queries.

Starting clean branch: `lockliel-backend-v1`, local
`f03fb3207bcd631a315fc2f304eaba9854ec56bd`. Remote development verified at
`b2adf96e988380c36e3b3b0275f7b866067e078c`, main at
`77d1d1918793bc6a25f38721e882f3d011903bad`.
One logical local preparation commit follows f03fb32; its final hash is in the
completion handoff and `git log -1`. Both local commits remain unpushed.
No unexpected prior commit, history rewrite or main change was made.
All 274 migration filenames/bytes are preserved, including both expected hashes:

- Bridge: `63edcf4a97c78c11b877c9a80bce4369928454c7d3028a53fc1a28865618336f`.
- Email: `907d52c091cdf5b7cf1b64d17f9b3eb741af4122094d7fc6bb6785d04442d0f7`.

## Migration runner

Official Supabase CLI **2.118.0**, macOS arm64 binary SHA-256
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.
Selected because supported `db push --include-all --skip-vault` preserves versions,
handles the older missing bridge and can exclude seed/role/Vault work. Two external
minimal workdirs expose bridge only, then the complete reviewed file set. No
custom production migration executor, linked auto-selection or deployment step.

Reads ordered ledger versions; discovers exactly bridge then email. Default mode
without `--include-all` rejects the old gap. Existing applied versions do not rerun.
For these files the runner batches SQL and the ledger INSERT into one PostgreSQL
implicit transaction. Failing bookkeeping rolls back the email ALTER. Transaction
control/nontransactional SQL would require a new review; this finding is scoped.
Runtime URL options reach the actual CLI session. PGPASSWORD fallback was proven
locally with generated SCRAM credentials. No production credential was supplied.

## Local release rehearsal and limits

Initial cluster: PostgreSQL 17.11, private Unix socket, no TCP, OS IP egress denied.
Reconstructed 272 versions from repository SQL with the bridge's fresh DDL used
only to represent already-existing uncaptured live objects, without its ledger
entry. Historical email SQL was adjusted in memory only to match the live single-
backslash semantics and exact CHECK fingerprint. No migration file changed.

This is targeted production-like equivalence, not a production clone. Auth/Storage
are minimal platform stubs; production runs PostgreSQL 17.6. Historical local
ledger statements use one source string rather than every live parsed-array body;
version/name discovery is exact, and original local rows remain unchanged. The
production preflight independently checks every actual live ledger body fingerprint.
Earlier live comparison found 187 of 188 app_private function definitions exact,
with one whitespace-only difference; platform grants differ for MAINTAIN and three
service-role deletion-helper grants. No ordinary-user authorization difference was
identified in that comparison. Hosted Auth/Storage/HTTP services are not emulated.

| Checkpoint | Actual result |
| --- | --- |
| 272 | Exact two-version pending plan; target catalog and old live email fingerprint match; seven SQL files pass |
| 273 | Bridge matching path only; DDL rejection instrumentation proves no fresh creation; 273 ledger entries; old email and catalog/security unchanged; seven SQL files pass |
| 274 | Sole email version applied; 274 ledger entries; canonical validated CHECK; unique index, other constraints, heap identity and security unchanged; seven SQL files pass; no pending versions |

Whole-public-table data fingerprints remain unchanged across both successful
transitions. Application DML traps provide an additional check on profiles,
applications and audit events. Review/share tables retain their exact catalog,
without test triggers that would invalidate the bridge guard. No application DML
or production fixture execution occurred.

## Failure tests and timeout verification

All passed using the actual CLI:

- Bridge ledger-insert failure leaves 272, no false entry or catalog change.
- Missing bridge index causes guard rejection and no migration entry.
- Email ledger-insert failure rolls back ALTER and entry, retaining 273.
- Deliberately incompatible legacy row in an isolated negative fixture fails CHECK
  validation, preserving the old rule and 273 entries. This fixture intentionally
  uses the repository historical rule; it is not claimed to exist in production.
- Actual lock contention aborts at approximately 5.33 seconds, no partial state.
- Injected 31-second ledger delay hits actual 30-second statement timeout after
  ALTER, rolling back both schema and bookkeeping.
- Pre-commit connection termination rolls back, without blind write retry.
- Default discovery refuses the older gap without `--include-all`.

The ledger observation hook recorded **lock_timeout=5s** and
**statement_timeout=30s** in both actual CLI migration sessions. Seven SQL files
ran at each of three checkpoints, 21 rolled-back executions. Post-commit lost
acknowledgment was not experimentally simulated. The mandatory recovery procedure
is STOP, READ LEDGER, READ CATALOG, READ HEALTH, DETERMINE COMMIT STATE, THEN DECIDE.
A committed version must not be blindly rerun because a client reports failure.

## Backup / recovery gate

At release time, re-open the correct project's dashboard and record the completed
physical backup's UTC timestamp, completion state, Restore availability, evidence
observation time and verified Owner recovery access. Proposed maximum backup age
is 24 hours unless Chat explicitly accepts a different recovery-point decision.
Retention duration can remain separately unverified if a current completed
recoverable backup is available. No restore or settings operation is authorized.

**PITR is not a required gate for these two migrations** on the current zero-profile
state: bridge expects no application change and email has no DML. A fresh completed
recoverable physical backup remains mandatory. Reassess if data/risk changes.

## Owner MFA assessment

**OWNER MFA REQUIRED BEFORE MIGRATION.** This is an engineering security
recommendation: the sole visible Owner controls database/recovery operations, so
an unprotected account creates takeover and recovery risk. MFA is not a PostgreSQL
technical prerequisite. Owner MFA remains disabled in supplied evidence; setup and
verification of secured backup-factor access require a separate account-owner step.
No MFA or organization setting was changed in this package.

## Storage recovery assessment

Neither pending migration touches or endangers Storage object bytes. Database
backups exclude those bytes, so a protected-asset backup/restore strategy is still
required before broader public launch. It is not a blocker for these two SQL files.
No Storage recovery system was built and no object was modified.

## Production runbook and fresh read-only evidence

[Production migration runbook](production-migration-runbook.md) gives exact pinned
setup, immutable copy verification, credential-safe direct TLS connection, two
read-only traffic snapshots, 272 checks, guarded pending discovery, bridge-only
execution, immediate 273 verification, refreshed preflight, email-only execution,
274 verification and failure/recovery decisions. Each database/manual check has
an expected result and STOP condition. Production write blocks are future-only.

Fresh MCP reads confirm ACTIVE_HEALTHY and no Security Advisor findings; production
remains 272 with zero users/profiles, three active shares, no target lock contention
and unchanged target catalog/security. The committed baseline contains no PII or
secrets. Its component timestamps are inspection evidence, not an atomic ongoing
snapshot. Supabase dashboard backup/MFA findings are supplied manual evidence,
not claims of a new Codex dashboard inspection. Direct production CLI password/TLS
access has not been verified; complete a read-only connection check before release.

## Tests performed

| Command/check | Result |
| --- | --- |
| `npm test` with clean environment and OS outbound denial | Supported Webpack export and original 377 tests pass |
| `npm run test:unit` after adding release tests, same guards | 383 pass, zero failures/skips |
| `npm run typecheck` | Pass |
| `npm run validate:netlify` | Pass, 63 modules / 59 imported handlers |
| `npm run lint:tooling` and explicit ESLint for all new scripts/tests | Pass |
| `npm run test:sql`, private disposable PG17 with IP egress denied | 274 fresh migrations and seven SQL files pass |
| `node scripts/rehearse-migration-release.mjs`, pinned binary under documented OS sandbox | 272 -> 273 -> 274; exact discovery; eight failure/discovery protections; 21 fixture executions pass |
| `npm audit --omit=dev --audit-level=high --json` | Zero findings; no installs or updates |
| Migration manifest and diff checks | All 274 files unchanged; no application/package/workflow edits |

Full-install audit's historical 19 findings, 13 high, remain separate. That broader
audit was not rerun or remediated. Repository-wide lint debt was not suppressed or
cleaned up. Local release checks do not prove hosted Auth/Storage browser journeys.

## Production and repository impact

No production migration, migration-ledger write, database write/data mutation,
backup/restore action, project creation, settings change, permission change,
Edge Function deployment, Netlify publication or Sites publication occurred.
Both existing sites remain preserved. One local preparation commit only, no push,
merge, branch replacement or main modification. No credentials in the report.

## Final release preparation assessment and recommended next step

**CONDITIONALLY READY TO REQUEST PRODUCTION MIGRATION AUTHORIZATION.**
Remaining gates: Owner MFA plus secured recovery access; fresh completed recoverable
backup evidence; explicit release commit approval; verified direct TLS/password
connectivity read-only; fresh healthy project/Advisor/site/deploy identity;
unchanged exact ledger/catalog/security/files; zero conflicting/new data; reviewed
sizes and quiet traffic/locks; no concurrent schema/deployment work; separate
explicit authorization for the two staged production commands. Drift requires
renewed review, not automatic correction.

Smallest next action: have the Owner complete and verify MFA/recovery access in a
separate account-security step. Then refresh release-time evidence and ask primary
Chat for the exact scoped production assignment. Do not execute, push, restore,
enable PITR or change configuration as an automatic continuation of this report.
