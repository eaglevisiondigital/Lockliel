# Lockliel controlled migration runbook

## Course release follow-up blocked (2026-09-30)

This historical 274 runner must not execute the course package. Read
`course-release-transition-preparation-2026-09-30.md`: publication-state authorization
failed disposable verification, and the assignment requires separate migration 278
review before continuing. No new staged runner is implemented. A later authorized
correction must explicitly revise the release set to 275–278, with maintenance,
near-zero-loss recovery, trusted durations before reopen and resolved Auth warning.
No migration, recovery action or production deployment is authorized by this runbook.

Prepared 2026-09-27 UTC. **Preparation only. Production execution requires a new,
explicit assignment from primary Lockliel Chat.** Do not run the write commands
below under the release-preparation assignment. No push or deployment is needed.
Preserve Netlify production and published ChatGPT Sites version 25.

## Release history: completed at 274 (2026-09-29)

The final authorized retry from `ea1a31056813902e4cc2dc75b0773f58e4cf9508` completed both stages: 273 success at 11:55:39 UTC, 274 success at 11:56:34 UTC. Final ledger 274 and empty dry-run plan passed; canonical email CHECK, catalog/security, RLS, content and hosting preservation checks passed. No restore was needed. See `production-migration-release-274-2026-09-29.md`. The stage-272 and write examples below are historical procedure, not commands to rerun on this project. Check current ledger before future work; any new database release requires its own reviewed scope and authorization.

## Exact CLI cache allowance (local fix, 2026-09-29)

The verifier now permits only the optional regular file
`<all|bridge>/supabase/.temp/cli-latest` as ephemeral CLI update-check metadata.
Supabase CLI 2.118.0 creates this path after a successful command. Its contents
can be a release version tag or empty offline-backoff value. They are not migration
input and do not select the executable: the pinned binary version/hash is still
required. The actual pinned CLI generated the empty file during the disposable
network-denied rehearsal; the unchanged two-migration stage-272 plan and subsequent
verification passed. See `release-verifier-cache-fix-2026-09-29.md`.

This is not a `.temp/**` or hidden-file exemption. If `.temp` exists it must be a
real directory containing exactly one regular `cli-latest` file. Empty directories,
extra children, nested directories and symlinks fail. Package root, stage roots,
manifest, config and migration sets remain exact; every migration byte stays
hash-verified. Config/manifest edits, missing or extra files, seed/role files and
symlink substitutions fail even when the approved cache is present. Cache presence
does not authorize deleting unexpected files or ignoring any failed check.

All other release gates, direct verify-full connection, percent-20 option encoding,
CLI flags, 5s/30s timeouts and the 272/273/274 checkpoint/failure sequence are
unchanged. This local fix does not authorize a production retry; obtain another
explicit assignment and refresh network, identity, backup, MFA, health and database
gates first. Production last verified at 272, both migrations pending.

## Execution blocker found by direct rehearsal (2026-09-29)

Historical stop, resolved locally by the exact allowance above; production retry still requires a new assignment. The pinned direct dry-run succeeds but generates `supabase/.temp/cli-latest`; the next unchanged verifyPreparedRelease rejects that extra directory. The attempted release stopped before any write, with ledger still 272. Do not delete cache ad hoc or bypass verification. Use percent-20 encoding for spaces in libpq URL options; plus encoding is not interchangeable. See `production-migration-release-2026-09-29.md`.

## Session Pooler review outcome (2026-09-29)

The separately assigned Session Pooler rehearsal did not qualify this fallback. TLS and authentication passed, but startup read-only and timeout settings were not preserved. Do not substitute the pooler in the commands below or bypass the startup assertion. No preflight or CLI database dry-run ran through it. See `docs/session-pooler-rehearsal-2026-09-29.md`. This note changes no release tooling or safety requirements.

## Scope and immutable inputs

Repository `eaglevisiondigital/Lockliel`, branch `lockliel-backend-v1`.
Reviewed application baseline: `b2adf96e988380c36e3b3b0275f7b866067e078c`.
Preserved local documentation parent: `f03fb3207bcd631a315fc2f304eaba9854ec56bd`.
The future assignment must name the final local release-preparation commit and
confirm a clean checkout of it, with no intervening application/migration changes.
Remote main must remain `77d1d1918793bc6a25f38721e882f3d011903bad`.

Only these versions may be added, independently and in this order:

| Version | File | SHA-256 |
| --- | --- | --- |
| 20260925035350 | `20260925035350_lockliel_reconstructed_review_share_history.sql` | `63edcf4a97c78c11b877c9a80bce4369928454c7d3028a53fc1a28865618336f` |
| 20260926212002 | `20260926212002_lockliel_correct_profile_email_pattern.sql` | `907d52c091cdf5b7cf1b64d17f9b3eb741af4122094d7fc6bb6785d04442d0f7` |

`supabase/verification/release-migrations.json` pins every one of the 274 files.
The bridge's matching-schema path performs no application DDL/DML. It records the
previously reconstructed history version through the runner. The email migration
changes one CHECK to `[.]`, preserving NULL, trim/lowercase and length checks,
the unique partial email index and other constraints. **Current production already
accepts ordinary email addresses.** Its stored historical SQL uses one backslash;
the repository historical file uses two. Preserve both histories. This release
converges definitions and repository replay; it is not evidence of a live signup
outage. Neither migration touches Storage object bytes or requires an app deploy.

## Runner contract and evidence

Use **Supabase CLI 2.118.0**, official darwin-arm64 binary, SHA-256
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.
Source tag commit: `70b42b8bf64b8cf1fd14c02c013d99dd655626e2`.
This is the supported Supabase runner, with an offline copy/preflight helper,
not a custom production SQL executor. Other versions/platforms need a new rehearsal.

- Reads `supabase_migrations.schema_migrations` ordered by version. The existing
  ledger must already expose `version`, `name`, `statements`; provisioning DDL is
  then skipped. File versions are compared with the ledger, not only its maximum.
- `--include-all` is required for the older missing bridge. Without it, discovery
  correctly refuses the older gap. It does not rerun versions already recorded.
- `--skip-vault` is mandatory; default push otherwise has a Vault configuration
  step. Omit `--include-seed`, `--include-roles`, linked-project auto selection and
  all deployment commands. The isolated workdirs contain only minimal config and
  byte-verified migration copies, with seed execution disabled.
- For these two files, SQL statements plus the version/name/parsed-statements
  ledger INSERT share one PostgreSQL extended-query batch and Sync, hence one
  implicit transaction. A ledger INSERT failure rolls back the preceding ALTER.
  This conclusion is specific to these files, which have no explicit top-level
  transaction control or nontransactional commands. It is not a blanket CLI claim.
- URL `options` propagate `lock_timeout=5s` and `statement_timeout=30s` to the actual
  CLI migration connection. A local ledger trigger observed both settings for both
  versions. Real contention and a 31-second injected ledger delay produced the
  intended 5/30-second errors, with no partial schema or false ledger record.
- Pre-commit backend termination was rehearsed and rolled back. Post-commit lost
  acknowledgment was not simulated; the commit-state decision tree below handles
  it without assuming the CLI result is definitive. No blind write retry occurred.

Primary source: [CLI v2.118.0](https://github.com/supabase/cli/tree/v2.118.0),
particularly `apps/cli/src/command-internal/migration-apply.ts`,
`migration-history.ts`, `migration-pending.ts`, `db-connection.sql-pg.layer.ts`,
`db-config.parse.ts` and `db-push-core.ts`. Local behavioral evidence is recorded in
[release preparation](release-preparation-2026-09-27.md).

## Manual release gates: expected result and STOP condition

Complete these immediately before requesting execution. Database checks alone do
not satisfy them. No settings may be changed as an incidental release step.

| Check | Expected result | STOP condition |
| --- | --- | --- |
| Authorization/concurrency | Separate explicit assignment for exactly these two versions; one operator; no concurrent migrations, deploys or schema work | Missing authority, another writer or unknown release activity |
| Identity/status | Supabase Lockliel Platform, `bsndfhbemstyrrglajat`, Eagle Vision Digital; `ACTIVE_HEALTHY` | Wrong project, degraded status, uncertain endpoint |
| Security Advisor | Fresh security response with no findings | Any new/unassessed finding |
| Owner MFA | **OWNER MFA REQUIRED BEFORE MIGRATION**; Owner verifies sign-in and secured recovery-factor access without disclosing codes | Disabled/unverified MFA or recovery access |
| Backup | Current dashboard shows a completed physical backup, its UTC time, Restore availability and Owner recovery access | No visible completed recoverable backup, unclear age/state or inaccessible restore action |
| Backup freshness | Record dashboard observation time and backup age immediately before release; proposed maximum age 24 hours for this zero-profile, no-DML scope | Older backup without a separately accepted recovery-point decision |
| Retention | Record duration if exposed; otherwise explicitly unverified | No currently available backup, rather than retention uncertainty alone |
| Production website | Harmless homepage GET is healthy; Netlify production is still main deploy `6ab3f0887cb1200008eb8e9f`, commit `77d1d1918793bc6a25f38721e882f3d011903bad` | Unexpected deploy, unhealthy response or unexplained content change |
| Preserved Site | Sites version 25 and its August 27 publication remain untouched | Any unrequested publishing/source change |
| Traffic | Two read-only snapshots 10 seconds apart show no writes to public/Auth/Storage tables and the same statistics reset time | Changed counters/reset, current traffic or uncertain observations; review a quiet window |
| Sizes/data | Zero profiles/Auth users; counts and sizes no larger than reviewed baseline | Population/growth or incompatibility requires renewed review, not automatic cleanup |
| Credentials/connectivity | Owner-supplied database password in environment only; direct/session endpoint with `sslmode=verify-full`; read-only connection succeeds | Missing credentials, TLS failure, unexpected pooler/endpoint; do not weaken TLS |

Dave supplied manual dashboard evidence accepted by Chat: completed physical
backups at **2026-09-26 07:28:11**, **2026-09-25 07:26:32** and
**2026-09-24 21:09:11 UTC**; Restore and Restore to new project available; Pro plan;
one visible Owner with MFA disabled. These observations are historical evidence,
not a release-time substitute. Retention duration and restore execution are
unverified. Do not restore or change backup/MFA settings in this package.

**PITR is not a required gate for this specific release**: matching bridge has no
application mutation, email has no DML, and profiles currently contains zero rows.
A recent completed physical backup is required. A changed data/risk profile needs
review. This is not complete disaster recovery readiness. Database backups omit
Storage object bytes; protected assets require a separate recovery strategy before
broader public launch. Storage recovery is not a blocker for these two SQL files.

One Owner with MFA disabled is a control-plane takeover and recovery risk. Requiring
MFA before this release is an engineering security recommendation, not a PostgreSQL
technical dependency or a claim that MFA has been enabled. A secured backup factor
and future additional trusted administrator merit separate account-owner review.
[Supabase MFA](https://supabase.com/docs/guides/platform/multi-factor-authentication),
[production checklist](https://supabase.com/docs/guides/deployment/going-into-prod),
and [backup scope](https://supabase.com/docs/guides/platform/backups) support these
recommendations. No recovery codes, passwords or factor secrets belong in Git.

## Prepare tooling and a read-only session

Use Bash for the following blocks in the reviewed checkout on macOS arm64.
PostgreSQL 17 `psql` and Node >=22.13 must be on PATH. Stop on every nonzero result.
Never use shell tracing, `--debug`, URLs containing passwords, or credential logs.
The preparer refuses an existing output directory and verifies all migration bytes.

If the reviewed cached binary is unavailable, install the pinned CLI into a new
external tools directory, never into this repository. For example:

```bash
LOCKLIEL_TOOLS=$(mktemp -d /private/tmp/lockliel-cli.XXXXXX)
npm install --prefix "$LOCKLIEL_TOOLS" --no-save --package-lock=false supabase@2.118.0
export LOCKLIEL_SUPABASE_BIN="$LOCKLIEL_TOOLS/node_modules/@supabase/cli-darwin-arm64/bin/supabase"
```

A download does not replace verification. Select the actual absolute binary path
and check its hash below. No `npx @latest` or implicit tool update is permitted.

```bash
set -euo pipefail
cd /Users/davesmacbookpro/Documents/ChatGPT/Lockliel
: "${LOCKLIEL_SUPABASE_BIN:?Set the verified absolute CLI binary path}"
test "$(uname -s)" = Darwin
test "$(uname -m)" = arm64
test "$(git branch --show-current)" = lockliel-backend-v1
test -z "$(git status --porcelain)"
git log -2 --format='%H %s'
# Compare HEAD with the new assignment's approved commit. STOP on any difference.
test "$("$LOCKLIEL_SUPABASE_BIN" --version)" = 2.118.0
test "$(shasum -a 256 "$LOCKLIEL_SUPABASE_BIN" | awk '{print $1}')" = 8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4
export SUPABASE_TELEMETRY_DISABLED=1 DO_NOT_TRACK=1
LOCKLIEL_RELEASE_PARENT=$(mktemp -d /private/tmp/lockliel-approved-release.XXXXXX)
export LOCKLIEL_RELEASE_ROOT="$LOCKLIEL_RELEASE_PARENT/package"
node scripts/prepare-migration-release.mjs "$LOCKLIEL_RELEASE_ROOT"
verify_release_files() {
  node --input-type=module -e 'import {verifyPreparedRelease} from "./scripts/prepare-migration-release.mjs"; verifyPreparedRelease(process.env.LOCKLIEL_RELEASE_ROOT);'
}
verify_release_files
printf 'Database password (hidden): ' >&2
read -r -s PGPASSWORD
printf '\n' >&2
export PGPASSWORD
# Use only the explicitly supplied secret, not an old .pgpass entry.
export PGPASSFILE="$LOCKLIEL_RELEASE_PARENT/empty-pgpass"
: > "$PGPASSFILE"
chmod 600 "$PGPASSFILE"
export LOCKLIEL_DB_URL=$(node --input-type=module -e 'const u=new URL("postgresql://postgres@db.bsndfhbemstyrrglajat.supabase.co:5432/postgres"); u.searchParams.set("sslmode","verify-full"); u.searchParams.set("options","-c lock_timeout=5s -c statement_timeout=30s -c search_path=public,extensions"); console.log(u.href);')
export LOCKLIEL_READONLY_DB_URL=$(node --input-type=module -e 'const u=new URL(process.env.LOCKLIEL_DB_URL); u.searchParams.set("options",u.searchParams.get("options")+" -c default_transaction_read_only=on"); console.log(u.href);')
psql "$LOCKLIEL_READONLY_DB_URL" -X -qAt -v ON_ERROR_STOP=1 -c 'show transaction_read_only; show lock_timeout; show statement_timeout;'
# Required output: on, 5s, 30s. This verifies the endpoint accepts startup options;
# the actual pinned runner's propagation was proven in the local rehearsal.
```

Use the connected Supabase read-only `get_project` for `bsndfhbemstyrrglajat` and
`get_advisors` with type `security`, recording timestamp/status and the empty
findings list. Read the current Netlify production deploy metadata and compare it
with the gate table. A harmless homepage check is:

```bash
curl --fail --silent --show-error --location --max-time 30 \
  --dump-header "$LOCKLIEL_RELEASE_PARENT/homepage-headers.txt" \
  --output "$LOCKLIEL_RELEASE_PARENT/homepage.html" https://lockliel.com/
```

Review the final HTTP status, expected homepage content and deploy metadata; an
HTTP 200 alone is not sufficient to establish unchanged application identity.
Do not POST forms, create accounts or invoke connected GET handlers for this gate.

Direct production password/TLS connectivity has NOT been tested by this package.
MCP read-only access is not proof that the operator's direct connection will work.
If direct access is unavailable, stop. A separately reviewed session-pooler URL
needs identity/TLS and actual-runner verification; never silently switch to a
transaction pooler or relax certificate verification.

## Read-only database capture and preflight

Each SQL file emits one JSON object/array without row identities or secrets. The
read-only connection additionally enforces read-only transactions for every query.
Files in the private temporary capture directory remain local. Do not publish raw
CLI output without reviewing it for connection information.

```bash
capture_release() {
  local checkpoint="$1"
  local destination="$2"
  mkdir -m 700 "$destination"
  for name in release-ledger release-security release-preflight email-preflight review-share-catalog; do
    psql "$LOCKLIEL_READONLY_DB_URL" -X -qAt -v ON_ERROR_STOP=1 \
      -f "supabase/verification/$name.sql" > "$destination/$name.json"
  done
  node scripts/check-migration-preflight.mjs "$destination" "$checkpoint"
}
check_plan() {
  node --input-type=module -e 'import assert from "node:assert/strict"; import {readFileSync} from "node:fs"; import {bridgeFile,emailFile} from "./scripts/prepare-migration-release.mjs"; const result=JSON.parse(readFileSync(process.argv[1],"utf8")); const plan=result.data??result; const stage=Number(process.argv[2]); assert.deepEqual(plan.migrations,stage===272?[bridgeFile,emailFile]:stage===273?[emailFile]:[]); assert.deepEqual(plan.seeds,[]); assert.deepEqual(plan.roles,[]);' "$1" "$2"
}
compare_write_counters() {
  node --input-type=module -e 'import assert from "node:assert/strict"; import {readFileSync} from "node:fs"; const get=p=>JSON.parse(readFileSync(p+"/release-preflight.json","utf8")).write_statistics; assert.deepEqual(get(process.argv[1]),get(process.argv[2]),"STOP: write counters/reset changed");' "$1" "$2"
}
export LOCKLIEL_PRE_A="$LOCKLIEL_RELEASE_PARENT/preflight-272-a"
export LOCKLIEL_PRE_B="$LOCKLIEL_RELEASE_PARENT/preflight-272-b"
capture_release 272 "$LOCKLIEL_PRE_A"
sleep 10
capture_release 272 "$LOCKLIEL_PRE_B"
compare_write_counters "$LOCKLIEL_PRE_A" "$LOCKLIEL_PRE_B"
verify_release_files
"$LOCKLIEL_SUPABASE_BIN" db push --db-url "$LOCKLIEL_READONLY_DB_URL" \
  --workdir "$LOCKLIEL_RELEASE_ROOT/all" --include-all --skip-vault --dry-run --yes --output-format json > "$LOCKLIEL_RELEASE_PARENT/plan-272.json"
check_plan "$LOCKLIEL_RELEASE_PARENT/plan-272.json" 272
```

Require exact `migrations` array: bridge filename then email filename from the
scope table; `seeds` and `roles` empty. Any extra/missing item or failure is a STOP.
Do not execute a write until ALL manual gates are freshly satisfied.

The offline checker enforces these expected results and otherwise aborts:

| Check | Expected result / STOP boundary |
| --- | --- |
| Age | Capture at most five minutes old, no future timestamp |
| Ledger | Exact 272 versions, names and stored-statement fingerprints; then only bridge at 273 and only email additionally at 274 |
| Ledger provisioning | Existing version/name/statements columns; no runner setup DDL needed |
| Bridge schema | Exact inspected review/share catalog, including RLS, columns, constraints, indexes, policies, triggers and grants |
| Email | MD5 `94e6b49228249e4f9e0c3b0a9e36c4d0` at 272/273, `091fd4560de7211e3e1c63eb2569d6e0` at 274; validated CHECK; other constraints/indexes unchanged |
| Data | Profiles/Auth users zero; email would-fail, normalization collisions, normalized Auth failures and orphans zero; reviews/applications/staff zero; three active shares with no invalid required fields/status/path/slug/duplicates |
| Index/constraint validity | Related indexes valid/ready, related constraints validated; no changed profile index or foreign-key dependent count |
| Security | Exact public RLS/table/column ACL, policy, public/app_private function and public/Auth trigger fingerprints; all 56 public tables RLS-enabled; event triggers unchanged |
| Platform | Inspected PostgreSQL version 17.6 and standard-conforming strings on; changed version requires renewed assessment |
| Locks | No database lock waiters, other target locks, idle-in-transaction sessions or other transactions older than five seconds |
| Sizes | Every inspected target still present and no larger than reviewed sizes; RLS remains on |

Statistics are corroborating evidence, not an exhaustive audit. The quiet window
and 5/30-second bounds still matter because snapshots cannot prevent later races.
The bridge guard and PostgreSQL CHECK validation provide execution-time protection.
A growing/populated table needs a new lock/scan assessment. Do not automatically
change data, broaden timeouts or substitute a NOT VALID rollout.

## Future authorized migration 273: bridge only

This is a WRITE command. It is included for a future separately authorized task.
Do not run both files together; preserve the independently verified checkpoint.
Immediately refresh the capture if more than five minutes have elapsed.

```bash
verify_release_files
capture_release 272 "$LOCKLIEL_RELEASE_PARENT/just-before-273"
"$LOCKLIEL_SUPABASE_BIN" db push --db-url "$LOCKLIEL_DB_URL" \
  --workdir "$LOCKLIEL_RELEASE_ROOT/bridge" --include-all --skip-vault --yes --output-format json
capture_release 273 "$LOCKLIEL_RELEASE_PARENT/after-273"
compare_write_counters "$LOCKLIEL_PRE_B" "$LOCKLIEL_RELEASE_PARENT/after-273"
```

Require reported migrations exactly `[bridge filename]`, ledger count 273, all
272 prior ledger fingerprints unchanged, review/share schema and all security
fingerprints unchanged, old live email CHECK unchanged, no target row/count or
write-counter change. Only migration bookkeeping is expected. Recheck project,
Security Advisor and homepage health. Any unexpected change stops the release.
The runbook's stop-on-error shell must not be treated as proof of rollback.

## Future authorized migration 274: canonical email definition

Refresh all manual health/traffic gates and the 273 preflight before continuing.
The second stage sees all 274 files, but only the email version remains pending.

```bash
verify_release_files
capture_release 273 "$LOCKLIEL_RELEASE_PARENT/just-before-274"
compare_write_counters "$LOCKLIEL_RELEASE_PARENT/after-273" "$LOCKLIEL_RELEASE_PARENT/just-before-274"
"$LOCKLIEL_SUPABASE_BIN" db push --db-url "$LOCKLIEL_READONLY_DB_URL" \
  --workdir "$LOCKLIEL_RELEASE_ROOT/all" --include-all --skip-vault --dry-run --yes --output-format json > "$LOCKLIEL_RELEASE_PARENT/plan-273.json"
check_plan "$LOCKLIEL_RELEASE_PARENT/plan-273.json" 273
"$LOCKLIEL_SUPABASE_BIN" db push --db-url "$LOCKLIEL_DB_URL" \
  --workdir "$LOCKLIEL_RELEASE_ROOT/all" --include-all --skip-vault --yes --output-format json
capture_release 274 "$LOCKLIEL_RELEASE_PARENT/after-274"
compare_write_counters "$LOCKLIEL_RELEASE_PARENT/just-before-274" "$LOCKLIEL_RELEASE_PARENT/after-274"
"$LOCKLIEL_SUPABASE_BIN" db push --db-url "$LOCKLIEL_READONLY_DB_URL" \
  --workdir "$LOCKLIEL_RELEASE_ROOT/all" --include-all --skip-vault --dry-run --yes --output-format json > "$LOCKLIEL_RELEASE_PARENT/plan-274.json"
check_plan "$LOCKLIEL_RELEASE_PARENT/plan-274.json" 274
```

Require final pending list empty, ledger 274 with exactly the two expected
additions, canonical validated CHECK, unchanged unique email index, other
constraints, security/catalog fingerprints and application counts/write counters.
Recheck ACTIVE_HEALTHY, Security Advisor, locks, harmless homepage GET and unchanged
production deploy identity. No app deploy or real signup is part of this runbook.
Account creation/email-change smoke tests require separate controlled-account
permission. Unset `PGPASSWORD` and connection environment variables when finished;
retain only sanitized evidence and a release report with actual UTC times.

## Failure, interruption and recovery

For error, timeout, frozen terminal, client exit, connection drop, lost network or
ambiguous output: **STOP. READ LEDGER. READ CATALOG. READ HEALTH. DETERMINE COMMIT
STATE. THEN DECIDE.** Use a fresh read-only session, not another write attempt.
If the backend may still be running, inspect `pg_stat_activity` and locks read-only;
do not issue an automatic cancel/terminate or start a second migration.

| Observed state | Required decision |
| --- | --- |
| 272, bridge absent, old catalog/email intact | Bridge not committed; identify failure and obtain explicit retry decision after full preflight |
| 273, bridge present, matching catalog and old email intact | Bridge committed; preserve its truthful record. Review before attempting only email |
| 273 after email error, old CHECK intact | Email rolled back; inspect conflict/locks/health. No automatic row repair or retry |
| 274, both expected ledger entries and canonical catalog | Commit succeeded even if client reported failure; do not rerun |
| Ledger/catalog disagree, unknown version/hash or partial state | Stop all release activity; investigate identity, runner and concurrent changes; no ledger repair |
| Health degradation at any checkpoint | Stop; assess commit state and application impact, escalate a separate recovery decision |

The successful failure rehearsals cover bridge catalog rejection, bridge/email
ledger failures, incompatible legacy input, lock timeout, statement timeout and
pre-commit connection loss. They do not authorize recovery by guessing.

Never bypass the bridge guard, relax RLS, delete existing objects, rerun applied
migrations, blindly retry, raise timeouts indefinitely or change data to make a
CHECK pass. The matching bridge has no application schema to undo. After email
commit, prefer a reviewed forward repair. The historical repository's double-
backslash expression must not be restored as if it were the actual live baseline.
Even returning to live single-backslash semantics would require a separate,
reviewed forward migration and current compatibility checks. Whole-database
restore is a last resort requiring explicit authorization and analysis of lost
writes, Auth/Storage implications and service recovery. It is not a per-migration
undo. No restore has been tested or performed here.
