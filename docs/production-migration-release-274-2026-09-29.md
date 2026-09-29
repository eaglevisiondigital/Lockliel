# Production migration baseline verified at 274

Release date: 2026-09-29 UTC. Separate explicit final-retry assignment authorized
only the two staged migrations and verification. Executed from clean
`lockliel-backend-v1` commit `ea1a31056813902e4cc2dc75b0773f58e4cf9508`.
Both migrations are now applied. Do not rerun them or reuse the old stage-272
assumption. This report supersedes earlier blocked-at-272 release reports.

## Network, runner and recovery gates

Used the user-confirmed T-Mobile iPhone hotspot via en0 only. Direct endpoint
`db.bsndfhbemstyrrglajat.supabase.co:5432` resolved to IPv6
`2600:1f18:38df:9500::eef4`. The route matched the inspected hotspot gateway at
initial connection and before each write. No Ethernet, pooler or fallback was used.
Direct strict TLS certificate/hostname validation and password authentication
passed with sslmode=verify-full and the official Supabase CA. Read-only sessions
returned database postgres, transaction_read_only on, lock_timeout 5s,
statement_timeout 30s and search_path public,extensions. Options used percent-20
space encoding. No timeouts or safeguards were weakened.

Pinned Supabase CLI 2.118.0, darwin-arm64 SHA-256:
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.
Both writes used --include-all, --skip-vault, --yes, --output-format json,
explicit direct URLs and separate isolated bridge/all workdirs. Read-only dry-runs
also used --dry-run. Every prepared config/manifest/migration byte was checked
before writes and after dry-runs. Only the exact regular cli-latest cache was
allowed. All 274 repository migration hashes remain unchanged.

Owner MFA/two authenticator factors and database password availability were
confirmed by the operator. Refreshed authenticated Backups dashboard showed a
PHYSICAL backup at **2026-09-29 07:28:10 UTC**, with Restore available. Its age was
4.458 hours at the 273 response and 4.474 hours at 274, below the reviewed 24-hour
threshold. Retention duration and actual restore execution were not tested. PITR
was not enabled or required for this reviewed no-profile-data scope.

## Fresh stage-272 preflight

Read-only captures at 11:54:32.901720 and 11:54:46.875434 UTC passed the unchanged
stage-272 checker. The 13.974-second quiet window had identical public/Auth/Storage
write counters and statistics reset. Exact ledger 272, unchanged review/share
catalog/security, zero profiles/Auth users and incompatible emails, reviewed sizes,
no unexpected locks/waiters, all 56 public tables RLS-enabled. Project
ACTIVE_HEALTHY and Security Advisor empty. Website/main preservation gates passed.

Pinned CLI dry-run returned exactly:

1. `20260925035350_lockliel_reconstructed_review_share_history.sql`
2. `20260926212002_lockliel_correct_profile_email_pattern.sql`

No seeds or roles; Vault skipped. Corrected verifier passed after the actual CLI
created its cache. Fresh just-before-273 capture at 11:55:34.746540 UTC also passed.

## Migration 273 and independent checkpoint

CLI success response recorded at **11:55:39.379466 UTC**, applying only
`20260925035350_lockliel_reconstructed_review_share_history.sql`.
Stage-273 capture at **11:55:41.575509 UTC** passed:

- Ledger 273 with the bridge recorded; all original 272 version/name/stored-
  statement fingerprints unchanged.
- founders50_reviews and share_assets catalog, counts, constraints/indexes,
  policies/grants/triggers/RLS unchanged.
- Complete release security fingerprints unchanged; pre-274 email CHECK MD5
  remained `94e6b49228249e4f9e0c3b0a9e36c4d0`.
- Protected content/configuration row fingerprints and public/Auth/Storage write
  counters unchanged; no unexpected locks or active target transactions.
- Fresh Security Advisor empty, project healthy, Edge Functions and Netlify
  production/homepages/main unchanged before permitting the second stage.

## Migration 274 and final database checkpoint

Fresh stage-273 capture at **11:56:29.315391 UTC** passed; only email remained
pending. The stage-273 dry-run returned only
`20260926212002_lockliel_correct_profile_email_pattern.sql`, with no seeds/roles
and Vault skipped. Corrected verifier and direct startup/route checks passed again.

CLI success response recorded at **11:56:34.784102 UTC**, applying only that email
migration. Stage-274 capture at **11:56:37.001395 UTC** passed. Final pinned CLI
dry-run returned upToDate true with empty migrations/seeds/roles arrays.

- Ledger **274**, both expected additions and unchanged historical 272 entries.
- Repository/live migration reconciliation complete; **zero pending**.
- profiles_email_format validated; canonical CHECK includes `[.]`, preserves NULL,
  254-character limit, lower/trim and other regex exclusions. Definition MD5 is
  `091fd4560de7211e3e1c63eb2569d6e0`, matching rehearsed expectation.
- Zero profiles/Auth users; no profile data mutation or incompatible existing row.
  Existing unique email index and unrelated constraints/indexes unchanged.
- All **56 public tables retain RLS**, zero RLS-disabled tables; ACL, policy,
  function, trigger and event-trigger fingerprints unchanged.
- founders50_reviews/share_assets remain correct, no locks/waiters, and counters
  across the entire release show no public/Auth/Storage row writes.

The bridge reconciles already-existing catalog history; email converges the CHECK
definition. This is not evidence that production previously rejected ordinary
emails or that live signup is now tested.

## Final preservation verification

Before/after full-row aggregate fingerprints and counts match for courses (1),
lessons (13), lesson_assets (40), feature_flags (5), staff_roles (0),
payment_provider_connections (4), partner_checkout_state (1), share_assets (3),
Storage buckets (2) and Storage objects metadata (13). No Storage object write
operation was performed; object bytes were not separately downloaded/rehashed.
No Getting a Grip or Share Library activation, staff grant, payment or partner
checkout change. No accounts/signups or real-data fixtures were created.

Project remains ACTIVE_HEALTHY; final Security Advisor has no findings. All five
Edge Function versions/hashes/metadata match the before snapshot; no deployment.
No Auth or SMTP setting change was made. Complete independent Auth/SMTP config
snapshots were unavailable; that statement reports the action scope, not a claim
that every remote setting was independently fingerprinted.

Netlify production remains ready main deploy `6ab3f0887cb1200008eb8e9f` at
`77d1d1918793bc6a25f38721e882f3d011903bad`. Both public homepages returned HTTP 200,
129,775 bytes, SHA-256
`2960679d8a5548ed57bbfc1a8c4e9daac241c80c450c99e022599758efee754d`.
ChatGPT Site remains active version 25, same live URL and
`2026-08-27T22:28:57.301945+00:00` update timestamp. No site write/publish call.
Remote main and development (`48a9e10640ae430638d9921917209a023774bdc2`) unchanged.
No push, merge or application/Netlify production deployment.

## Cleanup, evidence and next action

Hidden local password input was retained only in the helper process/environment.
It was never included in a URL, shell history, repo, report or persistent env file.
An empty mode-600 PGPASSFILE was used. Completion exits the helper through its
finally cleanup, removing PGPASSWORD and clearing the password variable; URLs had
no password. No secret was supplied to the assistant. Sanitized local evidence is
in `/private/tmp/lockliel-production-retry-n5jsd6p9`.

No error, ambiguous commit state, recovery write, blind retry or restore occurred.
Only expected migration ledger additions and the email CHECK change were made.
This task updates continuity documentation locally only. It does not authorize
future migrations, account tests, feature activation or application release.

PRODUCTION MIGRATION BASELINE VERIFIED AT 274

Smallest next action: separately scoped read-only Getting a Grip production
readiness inventory, comparing the existing course/media/worksheet/PDF inventory
with the established release threshold and documenting remaining decisions.
Do not activate content, deploy the application or perform signup testing under
this completed migration assignment.
