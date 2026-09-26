# Migration reconciliation and release plan

Recorded 2026-09-26. Repository baseline: `0008a43` on
`lockliel-backend-v1`. Production project: `bsndfhbemstyrrglajat`.
Reconciliation implementation and tests: `f74e4a6`.
This is an engineering record and an unexecuted release plan, not authorization
to migrate, repair the live ledger, deploy or change account configuration.

## Evidence and root cause

The 272 live migration version/name pairs matched the original repository. All
272 ledger entries had statement bodies. Searching those bodies and the complete,
non-shallow Git history did not find creation of `founders50_reviews`, its
indexes/policies/trigger, or the six missing `share_assets` columns. No deleted or
renamed original migration was recovered. Thus matching filenames concealed
uncaptured DDL, not a simple missing file whose known original can be restored.
The original execution time, actor and mechanism remain unknown. Manual SQL is
plausible, not proven.

- `share_assets` base table is defined by migration `20260924223806`. Commit
  `ef85214` (2026-09-25 02:24:10 UTC) first references the richer Share Library
  fields in backend code. The base migration entered Git in `327147c`, which
  restored 89 applied migrations. The six additions are absent from all ledger
  bodies and Git migration history. Column position places them before the
  later locale fields in the observed live catalog, but is not a creation date.
- `founders50_reviews` first appears in application code in `a27c943`
  (2026-09-25 04:08:29 UTC). That commit adds only a handler. The first ledger
  reference is `20260925120958`, which assumes the table/trigger already exist
  and replaces the decision function. Fresh replay originally failed there.
- `20260925131440` subsequently grants Share Library columns which did not exist
  in fresh replay. It also assumes staff write policies exist. Catalog comparison
  additionally identified the missing status constraint and ordering index.

Read-only catalog evidence is checked in at
`supabase/verification/review-share-live-20260926.json`; the adjacent SQL records
the repeatable query. It contains definitions/grants, no rows or credentials.
It covers 22 columns, 22 constraints, eight indexes, five policies, four user
triggers, RLS flags and table/column grants for anon/authenticated/service_role.
The query's search path must match the normal public catalog context for textual
constraint comparison. A mismatch fails closed, never auto-normalizes drift.

## Correction and ordering exception

`20260925035350_lockliel_reconstructed_review_share_history.sql` is newly authored
reconstruction, not recovered historical SQL. DECISIONS.md recorded the strategy
before implementation. The pinned CLI generated a new file first; it was then
assigned this explicit dependency-order version before `20260925035351`. The
version is not claimed as its original execution timestamp. No original migration
body or validated Git commit was changed or rewritten.

A forward migration alone cannot repair this chain: older migrations fail before
it can run. This one narrow ordered bridge avoids replacing the entire migration
baseline or inserting test-only DDL between historical files.

Fresh path creates the review table with both foreign keys, two supporting
indexes, staff read/insert policies, and decision/audit trigger. The function body
is copied from the existing immutable-review migration, which later replaces it
with the same body and establishes its checks. The bridge adds six share columns,
the status constraint, status/sort index and staff insert/update policies. Later
migrations retain their normal hardening. No member or campaign data is inserted.
Historical migrations already contain their own public catalog seed content;
this package does not replace or expand that seed content.

Existing path requires both objects' final catalog properties to match the
recorded snapshot exactly. It returns without schema/data changes. Partial or
conflicting objects cause an exception. This intentionally supports the verified
272-migration environment, not arbitrary unfinished databases. Future legitimate
schema extensions need an explicitly reviewed reconciliation decision if this
old version remains unapplied; do not bypass the guard.

Native PostgreSQL fixtures supply only Supabase platform surfaces (Auth, Storage,
roles). The old historical schema supplements were removed. Platform default
privileges now enumerate the observed standard privileges rather than granting
PostgreSQL 17's additional MAINTAIN privilege to every test role. Production
privileges are untouched.

## Verified replay and limits

`npm run test:sql` uses a freshly initialized, private, socket-only PostgreSQL 17
cluster. Caller database URLs, PG environment settings and credentials are not
inherited. It accepts no connection arguments and removes only its own cluster.

The complete 274-file authoritative chain replays without historical supplements.
Before the pending email correction, the resulting two-table catalog matches the
live snapshot for all listed properties. The bridge also passes in a read-only
transaction and with an event trigger that rejects any DDL. Three rolled-back
mutations prove it refuses a missing column, missing index and disabled RLS.
A synthetic legacy email admitted by the old rule proves the correction fails
atomically on incompatible rows and retains the old constraint. All seven
authorization/deletion/email/review-share SQL test files pass and run
on that resulting schema, with every test file rolled back.

This is targeted structural parity, not full database equivalence. It does not
compare every other table, function body, owner, extension, publication, comment,
realtime setting or default ACL. Local Auth/Storage compatibility is not the actual
GoTrue/PostgREST/Storage service. Production is PostgreSQL 17.6; local is 17.11.
Security Advisor returned no findings at inspection. That is not a launch audit.

## Email compatibility findings

Pending migration `20260926212002_lockliel_correct_profile_email_pattern.sql`
remains unchanged and unapplied. With standard-conforming strings enabled, the
current double-escaped dot matches a backslash followed by an arbitrary character,
not the intended literal dot. It rejects ordinary addresses and can admit some
malformed backslash addresses. `[.]` corrects the delimiter. NULL remains allowed;
length <=254 and lowercase/trimmed storage remain required. This remains a simple
shape check, not exhaustive RFC validation, deliverability or ownership proof.

Read-only preflight: profiles=0, Auth users=0. All incompatibility categories are
zero: malformed, overlength, unnormalized, would-fail and normalization collision
groups. There is no existing
profile data requiring remediation at this inspection. This is time-sensitive;
repeat `supabase/verification/email-preflight.sql` at release time. No PII was read.

Signup and account-security handlers lowercase/trim input and use the same basic
ASCII email shape and 254-character bound. JavaScript whitespace and PostgreSQL
POSIX character classes can differ for Unicode; complete equivalence is not
claimed. Auth email-update triggers normalize the stored profile value. Initial
Auth bootstrap copies `new.email` directly, so an external import or direct Auth
admin flow must provide normalized, compatible input or the profile constraint
will reject it. No bulk profile-email import/admin write flow was found in the
inspected handlers; external Auth integrations/settings remain unverified.
The SQL regression tests cover ordinary creation, NULL, normalized Auth updates,
raw uppercase/space imports, malformed values and overlength. No normalization
of live rows or weakening of checks was performed.

## Release plan: prepare only, separate authorization required

1. Verify the exact project, branch/SHA, migration file hashes and ledger. Quiesce
   concurrent schema changes. Run both verification SELECT files using a read-only
   session; compare the target catalog and require would-fail=0 and no new unknown
   migration versions. Verify the current email constraint and unique email index.
2. Establish an actual recoverable backup/PITR point, retention window, restore
   owner, access and tested restore procedure. None was verified here. Restoring a
   whole database can lose subsequent writes and must not be represented as a
   harmless per-migration undo. Do not proceed without this recovery evidence.
3. Use a pinned reviewed CLI. Its `db push --help` confirms `--include-all` for
   older missing versions and `--skip-vault` to prevent vault-config updates.
   A FUTURE dry run is `supabase db push --linked --include-all --skip-vault --dry-run`.
   It was not executed here. Its pending list must contain exactly the reconstructed
   `20260925035350` bridge and `20260926212002` email correction. Any extra item,
   skipped version, configuration mutation or surprising plan is an abort.
   Do not use `--include-seed`, `--include-roles`, blanket ledger repair or replay
   applied migrations. Do not mark the bridge applied without verifying its guard.
4. Order: guarded bridge first, email correction second. A matching existing
   database receives no bridge DDL/DML, only normal migration-runner bookkeeping.
   Test the runner transaction boundaries in staging. Run each migration atomically
   with bounded lock_timeout (initially 5s) and statement_timeout (initially 30s),
   verified on the actual migration session. If the runner cannot enforce those
   settings, stop and choose a reviewed mechanism. Never store credentials in commands.
5. Email drop/add is one ALTER TABLE operation: it takes ACCESS EXCLUSIVE and scans
   existing rows for validation. At the observed zero-row size the scan is trivial,
   but concurrent locks can still block. Reassess duration/traffic if counts change.
   If large/incompatible data appears, abort this direct plan. Design an explicit
   staged NOT VALID constraint rollout and reviewed remediation separately.
   NOT VALID skips the historical scan but still checks subsequent writes, including
   updates of old rows. VALIDATE uses SHARE UPDATE EXCLUSIVE and still scans data.
6. Verify only the two intended ledger additions, validated email constraint,
   unchanged unique email index, zero incompatibilities and unchanged target catalog.
   Recheck relevant security advisors. Real signup/email-change smoke tests require
   separately authorized controlled accounts; no production fixture execution.
7. No application deployment is required before this database correction: current
   application validators already expect the corrected email shape. Local tests
   and docs are independent of website deployment. Do not combine this release
   with staff bootstrap, Auth/SMTP settings or new features.

### Abort and recovery

Abort on schema drift, unexpected pending migrations, nonzero incompatible rows,
normalization collisions, missing backup evidence, lock timeout, failing staging
checks, changed target identity, or unexplained authorization/health failures.
Transaction failure should leave that migration unapplied; re-read the ledger and
catalog because a prior migration may already have committed. Do not retry blindly.
The matching-environment bridge has no schema changes to undo; keep its truthful
ledger record after successful bookkeeping. Never drop existing review/share
objects as a supposed rollback.

After the email correction commits, reverting the old regex would reject newly
created valid addresses and may fail validation. Prefer a reviewed forward repair
while retaining normalization, uniqueness and authorization constraints. If data
remediation becomes necessary, preserve an access-controlled original mapping
outside Git, reconcile Auth/profile identity together, and address collisions
without merging identities automatically. Backup restore is a last-resort recovery
with an explicit write-loss assessment, not a casual down migration.

Technical references: [Supabase migration tracking](https://supabase.com/docs/guides/deployment/database-migrations)
and [PostgreSQL 17 ALTER TABLE locking/validation](https://www.postgresql.org/docs/17/sql-altertable.html).

## Development push review

Verified read-only on 2026-09-26:

- The only tracked GitHub workflow runs validation on development pushes, PRs to
  main and manual dispatch. No deploy, database push, secret reference or external
  notification command exists in it. GitHub's repository Actions default is read;
  PR approval permission is false. Repository webhook listing returned an empty array.
- PR #3 is open from `lockliel-backend-v1` to main. The original head `47409a2` has
  a successful `netlify/lockliel/deploy-preview` status pointing to preview #3.
  Therefore a push can trigger a Netlify preview, not merely CI.
- `netlify.toml` specifies static build/output/functions but does not specify the
  production branch or all hosting-side behavior. Netlify account settings in the
  available browser require sign-in; native Chrome inspection stalled and was
  interrupted. No login, hosting configuration or deployment action was performed.
- Supabase reports no development branches. Its GitHub integration's production
  auto-migration setting was not exposed by the available read-only MCP tools.
  An empty branch list does not prove that all integrations are disabled. Likewise,
  empty repository webhooks do not exclude GitHub App installation webhooks.

Recommendation: local code is ready for review after validation, but DO NOT PUSH
until Netlify production-branch selection, preview build plugins/environment
behavior, and Supabase GitHub integration automatic migration behavior are verified.
Current evidence does not establish absence of production mutation on push.

RECOMMENDED THINKING LEVEL: HIGH

WORK TASK NEEDED

Read-only verification for eaglevisiondigital/Lockliel, branch lockliel-backend-v1:
inspect Netlify production branch, deploy contexts, build plugins, build hooks and
preview environment scope without revealing values. Inspect Supabase project
bsndfhbemstyrrglajat GitHub integration/branch mapping and automatic migration or
Edge Function deployment settings. Check other installed deployment integrations.
Return setting names, observed values excluding secrets, evidence timestamp and
whether a development push can mutate production. Do not edit settings, push,
trigger builds, apply migrations or perform live launch testing. If sign-in is
required, have the account owner establish the session. Return a clear safe/unsafe/
unverified push assessment and exact remaining access gap. No task was sent.
