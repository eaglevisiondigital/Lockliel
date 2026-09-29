# Production migration release, 2026-09-29: stopped before writes

## Authorization and exact starting state

The assignment authorized bridge migration 273, a verification checkpoint, then
email migration 274. Failure instructions require stopping, determining committed
state and reporting rather than blindly retrying. Starting clean development HEAD
was `94859248f84a9c6396245680427ea011131909de` on `lockliel-backend-v1`.
Remote development remained `48a9e10640ae430638d9921917209a023774bdc2`; main
remained `77d1d1918793bc6a25f38721e882f3d011903bad` before and after.

## Network and manual gates

User-confirmed T-Mobile iPhone hotspot, active Wi-Fi interface en0 only. Direct
`db.bsndfhbemstyrrglajat.supabase.co:5432` IPv6 connection, project database
password authentication and strict certificate/hostname validation succeeded.
Official Supabase CA was explicitly supplied via sslrootcert with verify-full.
Read-only connection returned postgres, on, 5s, 30s and public,extensions.
No pooler, relaxed TLS, changed timeout, settings change or alternate runner used.

Owner MFA with two authenticators was previously confirmed. Authenticated project
Backups dashboard showed PHYSICAL backup `2026-09-29 07:28:10 UTC` with Restore
available, about four hours old. Retention duration and restore execution remain
unverified. Project ACTIVE_HEALTHY; Security Advisor no findings.

Netlify production remained ready main deploy `6ab3f0887cb1200008eb8e9f`, with
both public homepage bodies matching SHA-256
`2960679d8a5548ed57bbfc1a8c4e9daac241c80c450c99e022599758efee754d`.
ChatGPT Site remained active version 25 with update timestamp
`2026-08-27T22:28:57.301945+00:00`. No site write/publish call was made.

## Preflight and pinned dry-run

Read-only captures at 11:31:49.799766 and 11:32:03.980654 UTC passed the unchanged
stage-272 checker. The 14.181-second quiet window had identical public/Auth/Storage
write counters and statistics reset. Ledger exactly 272; both pending versions
expected; review/share and security fingerprints match; zero incompatible emails,
zero profiles/Auth users, all 56 public tables RLS-enabled, no lock waiters or
unexpected target locks, sizes within baseline. All 274 migration hashes match.

Pinned CLI 2.118.0 binary SHA-256:
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.
The actual CLI direct read-only dry-run passed with --include-all, --skip-vault,
--dry-run, --yes, --output-format json, isolated byte-verified workdir, no seeds
or roles. Exact plan:

1. `20260925035350_lockliel_reconstructed_review_share_history.sql`
2. `20260926212002_lockliel_correct_profile_email_pattern.sql`

## Exact stop and recovery

After fresh external health checks, the 273 gate was released. Before any migration
execution, verifyPreparedRelease failed: `STOP: unexpected release configuration
files.` The all-stage supabase directory contained `.temp` in addition to expected
config.toml and migrations. The successful dry-run had left the CLI-generated
`.temp/cli-latest` file (8 bytes, SHA-256
`3b3b77f7ad434415703753cc1442735223279d46048d902f4f1d3b7f9e1e5ded`).

This is a release-workdir compatibility defect, not a failed production migration.
No write CLI invocation ran. The helper caught the failure, obtained fresh
read-only ledger/catalog/security evidence and discarded the password. It was not
retried. No cache was removed and no verifier, runner or migration was modified.

Recovery capture passes stage-272 verification. Ledger remains exactly 272 and
neither pending version is recorded. Old email CHECK MD5 remains
`94e6b49228249e4f9e0c3b0a9e36c4d0`. Ledger, review/share catalog, email compatibility,
security fingerprints and write counters match the pre-release snapshot. No locks
or waiters. Project healthy and Security Advisor empty after stop. Restore is not
required; no ambiguous migration execution occurred.

## Preservation and limits

Before/after aggregate counts and complete-row fingerprints match for courses (1),
lessons (13), lesson_assets (40), feature_flags (5), staff_roles (0),
payment_provider_connections (4), partner_checkout_state (1), share_assets (3),
Storage buckets (2) and Storage objects metadata (13). No object byte writes,
account/staff creation, payment change or Share Library/Getting a Grip activation.
Five Edge Function versions/hashes/metadata match before/after. Netlify production,
both homepage hashes, Sites version 25 and remote branches remain unchanged.
No Auth or SMTP setting was changed. Full independent Auth/SMTP configuration
snapshots were not available; unchanged settings are an action-scope statement,
not a claim that every remote setting was independently hashed.

Password was entered hidden locally, held only in process memory/environment,
never put into URL/history/repository, and cleared on exit. Empty PGPASSFILE was
used. The temporary helper is an orchestration wrapper around the reviewed CLI and
existing SQL/checker, not an alternate migration executor. Only documentation is
changed in the repository; no push or merge.

## Assessment and next package

PRODUCTION MIGRATION RELEASE FAILED

Both migrations remain unapplied. Next: a narrowly scoped local release-tooling
compatibility fix and disposable pinned-CLI rehearsal that accounts for generated
CLI cache without tolerating unexpected config, changed migrations, or broader
workdir contents. Preserve exact version/hash, timeouts, TLS, migration ordering,
all 274 bytes and stop behavior. A separate explicit production retry assignment
must follow that review with fresh backup/network/health/database gates. Do not
start deployment or signup tests.

## Correction to historical pooler diagnosis

The previous temporary pooler helper used form-style plus encoding for spaces.
The direct helper exposed this as an invalid +lock_timeout parameter; changing
only URL encoding to percent-20 restored the direct safeguards. Thus the earlier
pooler result does not establish an intrinsic pooler incompatibility. Pooler
compatibility remains unverified and unapproved. This release used only direct
IPv6 with correct percent-20 encoding; no pooler retest was performed.
