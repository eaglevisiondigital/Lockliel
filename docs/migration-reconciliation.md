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
remains unchanged and unapplied. **Correction recorded 2026-09-27:** the historical
repository file `20260925153612` contains a double-backslash discrepancy, but live
stored historical SQL and the actual production CHECK use a single backslash and
already accept ordinary email addresses. The earlier production-defect claim was
incorrect. Preserve the applied file byte-for-byte. Pending `[.]` provides canonical
convergence and repository replay consistency, not a verified repair of an active
production signup failure. NULL remains allowed; length <=254 and lowercase/trimmed
storage remain required. This is a shape check, not exhaustive RFC validation,
deliverability or ownership proof.

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

## Current release procedure, separate authorization required

The former unproven linked-CLI outline is superseded by the exact pinned and
locally rehearsed [production migration runbook](production-migration-runbook.md).
Supabase CLI 2.118.0 with `--include-all --skip-vault` and explicit session options
proved separate 272 -> 273 -> 274 execution, atomic SQL/ledger bookkeeping,
5-second lock timeout, 30-second statement timeout and failure rollback. No
production migration was applied. All 274 migration files remain unchanged.

Dave's accepted manual evidence establishes completed scheduled physical backups,
latest observed 2026-09-26 07:28:11 UTC, and available Restore/Restore to new project.
Retention is unverified, PITR disabled, Storage bytes excluded. One visible Owner
has MFA disabled. Engineering recommendation: OWNER MFA REQUIRED BEFORE MIGRATION.
Fresh recoverable backup evidence remains mandatory immediately before release.
PITR and Storage byte recovery are not additional blockers for these two files on
zero profiles; broader launch still needs protected-asset recovery planning.

The runbook supplies exact commands, all expected/STOP results, immutable hashes,
traffic/lock/security gates and the required ambiguous-client decision sequence.
Never blindly retry, bypass the guard, alter historical files, repair the ledger,
relax RLS or change data to force validation. Restore is a separately authorized
last resort, not a per-migration undo. No application deployment is required.

## Historical development push review

Superseded for push assessment by `deployment-safety-review.md`: Work completed
the requested read-only hosting investigation on September 26, and the next
package added code-only preview isolation. The superseding runbook requirements
still apply to any future separately authorized database release.
The assignment below is retained as history, not an outstanding request.

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
