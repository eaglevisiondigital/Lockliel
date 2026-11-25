# Isolated 279 readiness update result

**ISOLATED 279 READINESS VERIFIED**

## Completed and actual hosted result

Only project `qjksggxorghaxvpyslip`, branch `course-cutover-rehearsal-274`, was
changed. Exact pre-update source: `90d8eddfd5919a9595fed0060475d292d3eb529c` on
`lockliel-backend-v1`. A single guarded operational transaction replaced the body
of `public.lockliel_course_cutover_status()`. No application deployment or new
migration was needed. No migration, including275, was replayed on a hosted project.

Fresh read-only verification returned:

```json
{"paused":true,"protocol":"278-v1","schemaReady":true}
```

Ledger remains279. TLS verify-full connections reported TLS1.3/PostgreSQL17.11,
transaction_read_only=on, lock_timeout5s and statement_timeout30s. The course catalog
and ledger exactly matched the pre-update snapshot. Hook, control row, owner,
function permissions and all other captured operational definitions were unchanged.
No maintenance exit occurred.

## Current readiness contract and correction

The old status function required exactly278 ledger entries plus nine expected
function fingerprints owned by postgres. It reported schemaReady=false at279.
The new definition requires exactly279, the five canonical275–279 version entries,
the same nine fingerprints/owners, and absence of service_role private-note table
and additive column privileges. Missing notes relation resolves through to_regclass
and fails readiness closed. Required-function absence or fingerprint drift fails
closed. The reported paused value remains `paused OR NOT ready`.

This is a correction to the existing temporary operational maintenance layer,
installed separately from repository migrations. It is SQL DDL, not an application
constant change, but adding migration280 would incorrectly make a temporary,
environment-specific hook part of every database replay. The existing architecture
already provides separately authorized installation/update of this layer.
Historical migrations275–279 and the complete279-file manifest remain unchanged.

Files:
- `supabase/verification/course-release-279/maintenance-readiness-update.sql`
- `supabase/verification/course-release-279/maintenance-readiness-snapshot.sql`
- Updated new-install template in the same directory, consistent with the correction.

Operational update SHA256:
`b2d5b59fb6e1114e67f9ca200bf95fdf3488136592e336558ac89607868ab486`.
No new migration number/hash exists. The exact old function-definition MD5 was
`294b9e42f9c0474ef2fb2506f0d1b05a`; new MD5 is
`2ef91068c01546af75616bcc896e1fa6`. These identify pg_get_functiondef snapshots.
The SQL refuses an unexpected old definition/security state and verifies final
readiness inside its transaction before commit. Do not rerun this consumed update.

## Protocol and application compatibility

Keep `278-v1`. `netlify/lib/course-cutover.mjs` exports COURSE_PROTOCOL and sets the
same request header used by the private PostgREST request hook. The client checks
paused=false and protocol equality; it does not use a migration number as a protocol.
Migration279 removes unused notes privileges without changing request/response or
client behavior. Renaming the protocol would break compatible candidates needlessly.

The journey handler requires a session before calling readiness. Learner save/media
RPCs retain identity, active-session and enrollment authorization. The status RPC
itself is a non-personal maintenance signal with authenticated EXECUTE; it has no
additional auth.uid/session predicate. That existing model is preserved, not
misrepresented as a new per-user authentication check.

Backend identity belongs to the existing trusted deployment binding and operator
transport. Wrong site/context/backend/origin/key fails with503 before any connected
handler runs. The status SQL does not identify a Netlify deployment or project by
itself. Exact endpoint pinning and prior279 ledger/catalog parity were verified
before this hosted update. Mocked binding tests verify rejection without contacting
production; they are not live deployment acceptance.

## Security preserved

- Function owner postgres, LANGUAGE sql STABLE SECURITY DEFINER.
- Empty search_path; qualified relations and fixed catalog checks.
- Exact EXECUTE ACL remains postgres and authenticated only. No PUBLIC, anon or
  service_role EXECUTE was added to the status RPC.
- The separate existing private request hook retains its pre-existing caller grants.
  No hook grant or authenticator pre-request binding changed.
- Control remains paused=true, postgres-owned, RLS enabled and inaccessible for
  member/service writes. No role or RLS policy was broadened.
- Course and operational catalog comparisons passed; private-note least-privilege
  postconditions passed. No hosted failure fixture or destructive probe was run.

Supabase security advisors still report the private no-policy tables, intended
SECURITY DEFINER entry points, and disabled leaked-password protection. These are
recorded, not silently fixed or described as a clean Auth audit. No Auth/SMTP action.
See [function security guidance](https://supabase.com/docs/guides/database/functions),
[SECURITY DEFINER advisory](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
[RLS advisory](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy),
and [password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
Current changelog reviewed; the PostgreSQL17.11 advisory does not change this
function replacement contract. No extension/operator/index changes were made.

## Tested

- PASS279 authoritative migration replay,16 SQL/RLS test files.
- PASS additional operational readiness regression in the same socket-only
  disposable PostgreSQL17 cluster, with external-network denial.
- Exact old-to-new function update and preserved hook/control/security.
- Lower ledger, wrong version at equal count, missing notes table, missing required
  function, changed function fingerprint, excessive table grant and column grant
  all return schemaReady=false while paused remains true.
- Actual anon execution denial; authenticated cannot replace readiness or update
  paused; service_role cannot update paused. Authenticated status read succeeds.
- Existing hook still raises PT503 for a course RPC with a current protocol header.
- PASS9 focused JavaScript tests for maintenance, protocol, drafts and exact backend
  binding. A ready279 schema still returns application503 while paused.
- PASS targeted lint and git diff checks. All279 migration hashes match source.

The first disposable run caught a test substitution escaping error before any
hosted execution. After correction the complete SQL run passed. No application
code changed, so build/TypeScript/Netlify validation was not repeated. The full
production-release rehearsal was not repeated. No real user data or accounts tested.

## Production preservation and remaining scope

No command targeted production. No production DB write/migration/deploy, main merge,
Git push, Auth/SMTP/PITR change, payment/staff/content change or Share Library
activation occurred. Neither published site nor either retained acceptance site
was modified. Both isolated projects remain retained; jxtgtfffdiwzxocxoqxk was not
changed. No environment was deleted.

Production was not queried in this isolated assignment. Its last verified baseline
remains274, main1599ab271e0120a5cdc4e38e225ba749dd214721, Netlify production deploy
6abbb27a1cdd6d00081b0e8e and ChatGPT Site25. Local origin/main still matches that
commit. These are prior verified identities plus explicit no-change actions, not a
fresh audit of unrelated external changes.

Continuity, SQL tooling/tests and evidence are saved locally. No push is authorized.
Evidence directory: `docs/evidence/course-release-review-2026-10-01/`, files
`readiness-279-hosted.json`, `readiness-279-advisors.json`, `readiness-279-sql.txt`
and `readiness-279-js.txt`. No credentials or member records are included.

## Next recommended package and Chat handoff

Separately authorize deployment of a pinned, reviewed candidate only to retained
isolated site70b03a42-6329-476e-bf4b-2b1ce30e9567, bound exclusively to
qjksggxorghaxvpyslip. Retain the old deploy/source for recovery. Use existing
synthetic identities and fresh browser sessions to verify login/readiness and
maintenance denials, no course writes, while paused stays true. Verify exact deploy
commit and binding, preserve both other environments and production. Do not reopen,
mergePR4 or release production. Successful paused acceptance will not prove working
post-reopen saves; that remains a separate authorization boundary.

Assessment: **ISOLATED 279 READINESS VERIFIED**. Actual state279, paused=true,
protocol278-v1, schemaReady=true. No new migration, application deploy or production
action. Next is only the separately scoped isolated candidate/closed-maintenance
fresh-client acceptance package.
