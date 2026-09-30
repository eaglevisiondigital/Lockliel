# Full hosted cutover rehearsal: stopped after 275

Assessment: **FULL HOSTED COURSE CUTOVER REHEARSAL FAILED**.

This report supersedes the network/auth blocker in
`course-hosted-274-rehearsal-2026-09-30.md`. The latest continuation explicitly
requires stopping on ambiguity. Migration 275 committed on the isolated branch,
but its exact catalog verification returned `UNKNOWN_STOP`. Maintenance remains
ON. Do not replay 275, advance to 276, deploy the candidate, or reopen writes.
No development push was performed after this stop.

Sanitized supporting records are in `docs/evidence/hosted-275-stop-2026-09-30/`:
the one-row catalog difference, exact CLI plan, semantic postconditions, old and
prepared-candidate artifact identities, old deploy identity and production snapshot.
Connection credentials, account passwords, cookies and MFA material are excluded.

## Environment and identity

- User-confirmed T-Mobile iPhone hotspot; active IPv6 route used en0. The interface
  check establishes the route, not an independently verified hotspot SSID.
- Direct endpoint `db.qjksggxorghaxvpyslip.supabase.co:5432` resolved IPv6 and
  accepted TCP, TLS 1.3 with `sslmode=verify-full`, and database authentication.
  Read-only preflight observed transaction_read_only=on, lock_timeout=5s,
  statement_timeout=30s. No Session Pooler was used.
- Branch `course-cutover-rehearsal-274`, ID
  `7091bfd6-83ce-4c11-ac30-8ce85e09be2d`, project `qjksggxorghaxvpyslip`,
  parent `bsndfhbemstyrrglajat`, with_data=false. Starting ledger exactly 274,
  with zero accounts/progress and repository version parity.
- Pinned Supabase CLI 2.118.0 authenticated; reviewed binary SHA verified.
- Dedicated Netlify site `70b03a42-6329-476e-bf4b-2b1ce30e9567`,
  `jade-unicorn-642f40`, has no repository binding. Old-app branch deploy
  `6abd778184898338b60d32b2` is at
  https://rehearsal--jade-unicorn-642f40.netlify.app . No production publish.

## Changes and old-app baseline

Local implementation `0cfcf405be16f43fa1ac7fbe0ee0ad2c3b764158` introduces an
immutable backend configuration module and an isolated binding requiring the exact
trusted Netlify site/context and isolated backend/origin. Ordinary previews remain
blocked. A dedicated packager replaces only candidate configuration data and adds
an outbound transport allowlist. It includes nine required handlers, not signup,
email, payments or Blobs. The reviewed runner accepts this exact isolated direct
endpoint; arbitrary hosts and poolers remain denied.

Old source is production commit `1599ab271e0120a5cdc4e38e225ba749dd214721`.
Only isolated backend configuration, trusted site guard and secure cookie adapters
were added. Original course logic was retained. Its deploy identity also records
the packaging working-diff hash; this is not the production artifact byte-for-byte.

Three synthetic accounts were created directly through the isolated Auth Admin API:
two learners and one content manager. No confirmation email, SMTP test, real person
or production credential was used. Synthetic course worksheets and protected PDFs
were installed; demo video durations are synthetic fixtures, not trusted production
duration evidence. Learner login/course/lesson reads passed. Manager access was
denied at AAL1 and succeeded after actual MFA/AAL2.

**Old autosave failed with 403.** Its PostgREST merge-upsert attempts to UPDATE
profile_id/lesson_id, which schema 274 does not permit. The same direct authenticated
upsert reproduced permission denied. A plain authenticated INSERT succeeded and
provided the synthetic cloud baseline. That seeded baseline does not prove old-app
autosave worked. No grants or original app behavior were changed to mask the defect.

## Maintenance, draining and stale client

The reviewed operational maintenance SQL was installed outside the ledger, still
at 274. Memory-only drafts were copied locally, ordinary course tabs closed, and
one deliberately stale tab retained for negative checks.

Old application save, completion and media requests returned 503. Direct progress
PATCH and media INSERT returned 503/PT503; unrelated profile read remained 200.
Bounded course table locks were acquired, with zero other course transactions and
zero waiting target locks. The saved baseline remained unchanged; media rows stayed
zero. The course write path was drained before running 275.

The old UI nevertheless displayed local watch progress and its source continues
periodic sampling while playing without handling HTTP failure. Therefore the
requested old-client no-retry/reload UX is NOT passed. Copy-and-close remains
necessary. The final stale tab was closed after copying its remaining draft.
Post-cutover 426 behavior was not tested because cutover did not complete.

## Migration outcomes

| Stage | Execution | Verification |
| --- | --- | --- |
| 275 | Applied once, exact repository version 20260929215159 | UNKNOWN_STOP: table ACL mismatch |
| 276 | Not run | Not verified |
| 277 | Not run | Not verified |
| 278 | Not run | Not verified |

The pinned CLI plan contained exactly the 275 file, no seeds or roles. CLI reported
success. Read-only reconnect confirmed 275 ledger entries and the exact new version.
The one catalog difference is `public.lesson_private_notes`:

| ACL | Disposable-derived expectation | Hosted observation |
| --- | --- | --- |
| postgres | arwdDxtm/postgres | arwdDxtm/postgres |
| authenticated | r/postgres | r/postgres |
| service_role | arwdDxt/postgres | Dxtm/postgres |

All other compared catalog rows match. Hosted postgres default table privileges
give service_role Dxtm, with no SELECT/INSERT/UPDATE/DELETE. The disposable
`tests/support/supabase-compat.sql` grants those privileges by default. Migration
275 creates the notes table without an explicit service_role grant, so it inherits
this environmental difference. No hosted grant, expected reference, migration
byte or ledger record was modified to make the check pass.

Independent read-only stage-275 semantic postconditions passed, including owner
read policy/RLS, no anonymous access, no authenticated direct notes write,
valid snapshots/revisions/durations and expected RPC permissions. These checks
do not override exact catalog failure. This is an applied-but-not-fully-verified
stage, not a rollback or authorization to replay.

Final read-only state: ledger 275; paused=true; protocol=278-v1; schemaReady=false;
media rows=0; synthetic saved answer preserved. The actual ambiguous-state failure
path preserved maintenance. Separate hosted SQL-failure and deployment-failure
injections were not reached.

## Candidate and functionality

Candidate artifact was prepared from clean implementation commit `0cfcf405` with
configuration-only binding and recorded handler hashes. It was NOT deployed to
this branch. Fresh-client autosave/notes, refresh/login restore, A/B isolation,
94/95%, seeking, advancement/completion, pending media, protected resource access
and responsive acceptance were not rerun here. Prior acceptance evidence on the
separate 278 branch does not establish this interrupted transition. Maintenance
was not exited and resumed writes are not verified. No tested paused write succeeded.

## Validation and security

- 558 JavaScript tests passed under the fail-closed network guard.
- 278 exact migration hashes and sealed staged copies verified unchanged.
- 278 fresh disposable PostgreSQL 17 migrations and 15 SQL/RLS files passed.
- Webpack/static build, TypeScript, Netlify validation (75 modules/62 handlers),
  configured lint and targeted changed-tooling lint passed.
- Production dependency audit: zero vulnerabilities. No dependency changes.
- Isolated security advisor: two private RLS-without-policy informational findings,
  four authenticated SECURITY DEFINER RPC warnings, and leaked-password protection
  disabled. No settings/grants were changed. These are not a clean security bill.
  References: [RLS](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy),
  [RPC review](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
  [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Production preservation

Read-only inspection reconfirmed production ledger 274, latest 20260926212002.
Remote main remains 1599ab271e0120a5cdc4e38e225ba749dd214721. PR4 is draft/open,
unmerged, auto-merge disabled; development remote remains 3a7b7b9. No new CI or
PR preview was triggered by this stopped task.

Production Netlify published deploy remains 6abbb27a1cdd6d00081b0e8e. Both public
homepage checks returned 200 with the unchanged SHA256
a184c485520cc5fa6bd5cee0b0e47cdaf46575e1e9794f9afa25743466cfbe00.
ChatGPT Site active version remains 25, last saved 2026-08-27T22:28:57.301945Z.
No production DB write, migration, deploy, Auth/SMTP, permission, staff/payment,
content or Share Library change was performed. Settings were not independently
diffed in full; preservation means no such mutations were issued in this task.
No real-data testing. Both isolated branches and their sites are retained.

## Final release gates

FAIL includes incomplete or unverified evidence; PASS is limited to stated scope.

| Gate | Status | Evidence/limit |
| --- | --- | --- |
| A Exact migration files | PASS | All 278 hashes unchanged, disposable replay passed |
| B Hosted maintenance | PASS | New isolated app/direct course writes denied |
| C Original stale-client transition | FAIL | 503 safe; old retry UX fails; 426 not reached |
| D Hosted 274 drain | PASS | Locks and zero in-flight/waiting course transactions |
| E Staged hosted runner | FAIL | 275 committed, exact ACL verification UNKNOWN_STOP |
| F Hosted failure coverage | FAIL | Ambiguity stop proven; other scenarios not reached |
| G Duration inventory | PASS | Prior 13-asset inventory retained |
| H Trusted production durations | FAIL | Prior 13 NULL, no production values supplied |
| I Lessons 11–13 pending | PASS | Approved/prior pending state preserved; no new acceptance |
| J Leaked-password protection | FAIL | Warning unresolved |
| K Recovery/PITR | FAIL | No fresh verified recovery point |
| L Owner MFA/restore access | FAIL | Synthetic manager MFA does not prove owner recovery |
| M Direct IPv6 | PASS | New isolated endpoint verify-full passed; production not retested |
| N Release-window network stability | FAIL | One successful isolated session is insufficient |
| O Exact candidate/CI | FAIL | Local candidate passes; not deployed here or pushed |
| P Rollback plan | PASS | Documented, recovery prerequisites remain blocked |
| Q Preservation | PASS | Production identities unchanged; isolated resources retained |

## Smallest next assignment

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Authorize a narrow verifier follow-up on lockliel-backend-v1. Keep isolated project
qjksggxorghaxvpyslip at 275 with maintenance ON. Review the verified hosted default
ACLs against disposable compatibility assumptions. Prefer deriving expected ACLs
for newly created objects from the captured pre-stage defaults, while retaining
exact detection of unexpected grant changes. Add focused regression coverage for
both hosted and disposable defaults. Do not ignore ACL comparisons or add broader
service_role grants simply to match the fixture. Do not edit/replay migration275.

Then perform an independent read-only classification of the already-applied275.
If it is exactly verified, report readiness for a separately authorized276–278
continuation and candidate acceptance. Also explicitly decide how old-app autosave
403 and non-stopping media requests affect the approved copy-and-close policy;
neither should be silently marked passed. No production mutation, push, deployment,
maintenance exit, new migration or resource cleanup follows from this proposal.
