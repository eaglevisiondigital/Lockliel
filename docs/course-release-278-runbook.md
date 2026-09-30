# Four-stage course release package

LOCAL/DISPOSABLE preparation. This document is not production execution permission.
Production is 274. Read the current transition report and all FAIL/UNKNOWN gates
before any future execution. Do not use the historical 274-release runner.

## Exact inputs

`supabase/verification/course-release-278/manifest.json` pins source commit
678f9a962e767dd5127f0bc2a280837214e57c13, the original 274 hashes and four candidate
hashes. `prepare.mjs` verifies exactly278 files against the manifest and Git, then
copies prefix274+275, prefix275+276, prefix276+277 and prefix277+278 into four sealed
stage directories. Each destination has exactly ONE pending migration when the
required prior repository ledger prefix is present. It is not a folder containing
four pending files. Seeds are disabled; no roles/Vault options are accepted.
The only allowed CLI cache entry is `.temp/cli-latest`; symlinks and other files fail.

Pinned CLI2.118.0, SHA256
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.
Repository versions only; never import isolated MCP ledger aliases into a release.
The isolated278 alias is20260930145615 and must not be replayed there again.

## Runner and independent verification

`scripts/course-release/runner.mjs` is the shared staged execution library used by
the disposable rehearsal. It takes an explicit authorized flag, exact expected
catalog, sealed directory, pinned binary and approved direct connection. It has no
automatic production entrypoint or caller-default credential. A future reviewed
operator wrapper must bind current human authorization, recovery and preflight
evidence to that invocation; the library flag alone is not release approval.

Each stage: read-only verify-full connection and identity/timeout checks; exact
prior ledger prefix; closed maintenance/protocol check; JSON CLI dry run with
exactly one filename and empty seeds/roles; one apply; fresh read-only reconnection;
ledger/catalog comparison and SELECT-only semantic postconditions. Catalog evidence
covers function bodies/ownership/ACL, columns/defaults, constraints, RLS/policies,
triggers and column grants. Expected deltas preserve prior unrelated production
catalog differences rather than replacing the catalog wholesale. A reviewed fresh
production baseline is still mandatory; catalog-delta calculation does not approve
unknown production drift.

The reference file records the disposable baseline and each stage. Postconditions
cover notes/keys privacy, duration provenance, rules, revision/snapshot integrity,
save conflict encoding and release-trigger privileges. Semantic verification error
is UNKNOWN/STOP even if the CLI says success. Reconnect failure is UNKNOWN/STOP.
No retry, restore, ledger edit, object deletion or reopening is automatic.

## Disposable reproduction on this Mac

Use PostgreSQL17 binaries and the verified CLI path. Run under a sterile environment
with OS outbound denial; localhost TLS is the only TCP allowance. The rehearsal
refuses external-network availability, uses random disposable credentials, and checks
its own data directory before proceeding. No production credentials are accepted.

```sh
/usr/bin/sandbox-exec -p '(version 1)(allow default)(deny network-outbound)(allow network-outbound (remote ip "localhost:*") (subpath "/private/tmp") (subpath "/private/var/folders"))' \
  /usr/bin/env -i PATH='/opt/homebrew/opt/postgresql@17/bin:/opt/homebrew/bin:/usr/bin:/bin' \
  TMPDIR=/private/tmp LOCKLIEL_SUPABASE_BIN='<absolute reviewed binary path>' \
  node scripts/course-release/rehearse.mjs
```

Evidence is written to
`docs/evidence/course-release-review-2026-09-30/rehearsal-278.json` only after all
implemented checks pass. Read its explicit pending field. It is not a hosted
PostgREST or browser cutover certificate.

## Maintenance mechanism and order

`maintenance-install.sql` is **temporary operational DDL outside the migration
ledger**, not a hidden migration279. It is currently disposable-only. Installing it
in production changes schema/permissions and PostgREST role configuration and needs
an explicit production assignment covering those operations as well as275–278.
Never use an apply-migration API to add it as an extra numbered release migration.
Capture prior PostgREST settings; an existing pre-request hook causes an abort and
requires reviewed chaining. It must be tested in the hosted isolated environment
before production use.

It starts closed. Table locks drain in-flight course/progress/media writes before
the installation commits. Private control, restrictive SELECT policies, row write
triggers and the PostgREST pre-request hook cover course routes and direct RPCs.
Native postgres migration sessions without request claims can perform staged DDL;
web requests cannot obtain that bypass. Authenticated writes remain closed if
schema count/final function signatures are incompatible even if the control flag
is accidentally opened. No application environment variable bypass exists.

The candidate journey API reads maintenance status after session validation and
fails closed on missing/incompatible/unavailable status. Thus it cannot be released
alone without the separately installed operational gate. It forwards a compatibility
protocol on new save/sample requests. This header is not authorization; identity,
session, enrollment and RLS still govern every write. New clients preserve private
local drafts and stop retries on503/426. Local-storage failure explicitly asks the
learner to copy the in-memory draft.

Required sequence: confirm old-tab handling and draft preservation; install/pause;
verify drain/direct denials; stage275 and verify;276 and verify;277 and verify;278
and verify; deploy exact reviewed candidate while closed; verify schema/backend/app
identity and new-client recovery; confirm stale clients closed/reloaded; verify
trusted durations and recovery gates; explicitly reopen. Do not reopen on a timer.
`maintenance-reopen.sql` deliberately contains only a gated operator template.
Keep protocol enforcement until old clients are retired and cleanup is authorized.

## Remaining boundary

The production1599ab2 browser ignores autosave response failures and holds drafts
only in memory. No server patch can make already-running JavaScript persist those
drafts or force an honest reload notice. A confirmed copy-and-close gate is proposed
and pending Dave's decision. The current task does not approve losing those drafts.
The hosted maintenance install/hook and complete old-app→new-app browser transition
have not yet been exercised. Keep the release blocked and preserve the acceptance
site and its current artifact while resolving this boundary.
