# Trusted-duration correction, 2026-10-01

**Local authoritative package PASS. Hosted regression BLOCKED by the Mac's direct IPv6 path.**

## Completed and decision

The current assignment explicitly promotes the earlier duration proposal. Migration280
is required because direct authenticated database RPCs must enforce the policy without
relying on the browser. The two-function proposal was reviewed and strengthened: checking
metadata before trusting a cached timestamp was insufficient when replacement media
received newly verified metadata. Current asset coverage must be recomputed, and watched
asset identities must not be reassigned.

Starting branch was clean `lockliel-backend-v1` at
`153a71c616ffeedc10b528184b807e8855617735`. Migration-only local commit:
`a09280eede4fd12391a6aa97e91eac65ef638e3f`. No history rewrite, push or application
change occurred. Remote development/PR4 remain at
`eaff3fea36d4ce489009ebf2070071311619f9c2`.

## Changed

Migration: `20261001211009_lockliel_current_trusted_duration_progression.sql`.
SHA256: `bb8af646303725c9c29ddc7119c5d8aefe2bf0afb91c206ffa8baa1a08e1b1c3`.
All279 earlier files remain byte-for-byte unchanged. All280 hashes and their pinned
source commit are verified by `scripts/course-release/prepare.mjs`.

- `course_watch_met` requires published canonical/resolved content, current active
  YouTube identity, finite positive trusted duration, verification timestamp and trimmed
  provenance of10–500 characters. Every active video must satisfy current coverage.
  The historical threshold timestamp is never an authorization shortcut.
- A watched asset's lesson/type/provider/reference/URL/storage identity cannot be
  changed in place. Archive the original and create a replacement using the existing
  manager workflow. Historical telemetry remains attached to the original asset ID;
  the replacement has no inherited coverage. Existing normalizers still reject
  lesson reassignment and active non-YouTube videos first.
- New sequential advancement in both watch-based models requires current trust.
  Completed target lessons stay accessible. Historical completion and timestamps
  remain unchanged, even when current media trust is unavailable.
- Already-completed lesson saves use UPDATE, preserving immutable answers and allowing
  the existing owner-only notes path. Revision/CAS, active-session checks, enrollment,
  publication, idempotency, answer snapshots and all authorization checks remain.
- Restoring valid trusted duration for the same identity allows legitimate coverage
  to authorize progression again. No telemetry erasure or completion reset occurs.

The new identity trigger function is private, SECURITY DEFINER with empty search_path,
postgres-owned and postgres-only EXECUTE. No table, column, backfill, content activation,
maintenance artifact, public privilege or environment binding is added by280.

## Tested and security

| Validation | Result |
|---|---|
| Full guarded JavaScript suite | 578 passed |
| Authoritative fresh replay | 280 migrations |
| SQL/RLS suite | 17 files passed, each rolled back |
| Duration policy | All8 cases passed |
| Webpack/static export | PASS,37 pages |
| TypeScript | PASS |
| Netlify validation | PASS,75 modules /62 guarded handlers |
| Configured lint and release-tooling lint | PASS |
| Production dependency audit | 0 vulnerabilities; no dependency changes |
| Historical279 hashes / complete280 manifest | PASS |
| Six-stage pinned CLI rehearsal | PASS |

OS outbound-network denial protected local validation; disposable rehearsal permitted
only loopback/local sockets. No linked-project credentials were supplied to tests.
The final SQL rerun includes additional completed-note persistence/idempotency, Model B
current-trust, cached timestamp without coverage, and six identity-field denial checks.
Full validation preceded these test-only strengthenings; the complete17-file SQL suite
then passed again. No application or migration changed after full validation.

The eight policy cases cover missing duration/no history, partial history, historical
threshold without current trust, historical completion with editable notes, restored
trust, forged percentages, seek-to-end, and replacement identity/missing/blank provenance.
The last case deliberately removes a duration constraint/trigger only inside the
rolled-back disposable transaction to verify defense in depth. Invalid duration writes
are rejected. A/B isolation, private notes, RLS, publication, CAS and completion
idempotency remain covered by the complete suite.

Production-like `service_role=arwdDxtm` creation defaults and restricted defaults pass
exact stage verification. Defaults are not confused with effective privileges.
Final280 still requires ZERO service_role notes table and additive-column privileges.
The regression matrix rejects13 actual-grant defects per profile. No relaxation of279.

## Release manifest, readiness and runner

The new package is `supabase/verification/course-release-280/`, with exact manifests,
274–280 catalog references, strict private-note checks and operational readiness files.
Existing279 package files remain historical. The shared runner now requires six stages:
275,276,277,278,279,280. Each stage checks one exact pending filename, source hash,
TLS verify-full, lock_timeout5s, statement_timeout30s, read-only reconnect, exact catalog
and semantic checks. Seeds/roles/Vault/alias substitution are excluded; ambiguous or
failed commit states stop without blind retry.

Disposable rehearsal passes both ACL profiles, SQL/permission/statement/lock failures,
every stage's rollback, ledger-only/object-only UNKNOWN_STOP, actual TCP loss after
commit, CA/hostname rejection, publication concurrency, maintenance drain and protocol
checks. Evidence is local, not hosted acceptance.

Readiness expects schema280 and protocol `278-v1`. Only the existing temporary
operational mechanism changes the isolated readiness function after exact280 verification.
No permanent migration installs an environment-specific maintenance hook. Wrong ledger,
missing functions, fingerprint/ACL drift and unauthorized callers fail closed in tests.
Read the [280 runbook](course-release-280-runbook.md) before any future execution.

## Hosted disposable result and unresolved work

The direct preflight targeted only `db.qjksggxorghaxvpyslip.supabase.co:5432`, using
existing hidden credentials and TLS verify-full. Libpq could not resolve the hostname;
a separate AAAA lookup succeeded, but routing and TCP returned **No route to host**.
Authentication/TLS were not reached. No maintenance change, migration, readiness update,
fixture, account or hosted mutation occurred. The prepared operator wrapper is local
at `/private/tmp/lockliel-hosted280.mjs`; re-review it before resuming.

Read-only SQL connector inspection confirmed isolated279, schemaReady=true,
paused=false, protocol278-v1. The metadata `get_project` endpoint returned not-found,
but SQL inspection worked. Do not describe the isolated branch as280, closed or tested.
Dave was asked to restore the previously working hotspot path. The remaining authorized
work is direct preflight, close isolated maintenance, exact280 once, temporary readiness
update, then synthetic rollback-only hosted regressions. Leave maintenance closed for
final isolated release rehearsal. Never replay275–279 or substitute an MCP alias.

## Application and trusted inventory

Validated application remains `21ac4a5172a7dd7082b659d65533385e231892ef`.
No RPC signature, payload or protocol change is required. Existing manager createAsset
supports replacement identities. Tests preserve `Lesson Being Prepared` when trusted
duration is missing and `Media Coming Soon` for lessons11–13. No new frontend, deployment
or browser acceptance claim is made. Conditional push authorization was not triggered.

Preserved13-entry [verified inventory](getting-a-grip-duration-inventory-2026-10-01.md):

| Lesson | Seconds |
|---|---|
| 1 | 1480 |
| 2 | 1437 |
| 3 | 1458 |
| 4 | 1350 |
| 5 | 1302 |
| 6 | 1456,1457 |
| 7 | 1501 |
| 8 | 1317,1408 |
| 9 | 1338,1472 |
| 10 | 1441 |

No values were populated. Fresh read-only production inspection at21:22:08UTC confirms
274 migrations,13 video assets and0 non-NULL durations.

## Production preservation and limitations

Fresh GitHub inspection confirms main `1599ab271e0120a5cdc4e38e225ba749dd214721`,
PR4 draft/open/unmerged against main, auto-merge disabled and unchanged remote development.
Production received only the harmless read-only aggregate queries described above.
No production DB write, migration, duration write, deployment, push/merge, account test,
settings/permissions, Auth/SMTP, PITR/compute, payment/staff or Share Library action occurred.
Neither isolated environment was deleted or changed.

Netlify production6abbb27a1cdd6d00081b0e8e, ChatGPT Site25, Small compute,7-day PITR
and other settings are retained prior verified observations and untouched by this
assignment. They were not freshly audited as complete live configurations. Aggregate
checks do not prove full row, Storage-byte or settings equivalence.

## Documentation and next recommended build

Updated AGENTS, CURRENT_BUILD_STATE, ARCHITECTURE, SECURITY_MODEL, DECISIONS, README,
release280 package/runbook and the historical proposal notice. Evidence is in
`docs/evidence/trusted-duration-280-2026-10-01/`, including full validation, final SQL,
staged CLI, audit, hashes, remote refs and preservation/network observations.

**TRUSTED-DURATION CORRECTION NOT READY**

Local preparation is complete, but required hosted duration regression is unexecuted.
Smallest next action: restore the existing direct IPv6 path and finish only the already
authorized isolated280 regression. Then perform final isolated application/release
rehearsal under a separate scoped assignment. No production release is authorized.
