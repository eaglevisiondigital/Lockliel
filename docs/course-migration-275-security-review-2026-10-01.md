# Migration 275 stop review

> Superseded local correction: see `course-migration-279-correction-2026-10-01.md`
> and `course-release-279-runbook.md`. Hosted branch remains275/maintenance ON
> because automatic approval review rejected the first advance command.

**MIGRATION 275 REVIEW REQUIRES CORRECTION**

The missing service_role SELECT/INSERT/UPDATE/DELETE grants are not an application
defect. The disposable reference expected them because of platform compatibility
defaults, not a private-notes requirement. However, investigation found unused
service_role TRUNCATE/REFERENCES/TRIGGER/MAINTAIN grants on hosted private notes.
The migration leaves these inherited grants intact. A disposable exact-275 test
proved service_role can truncate the notes table despite RLS. This does not meet the
requested least-privilege boundary. Do not clear the stop by accepting either ACL.

No hosted changes, migration file changes, new migration, push, merge or deployment
occurred. Project qjksggxorghaxvpyslip remains **275, maintenance ON**.

## Connection and state

- Active IPv6 route en0, user-described T-Mobile iPhone hotspot. SSID was not
  independently identified. Direct AAAA: 2600:1f18:4850:7c01:a8d4:c050:50de:3ade.
- Direct endpoint db.qjksggxorghaxvpyslip.supabase.co:5432 authenticated with
  sslmode=verify-full, trusted CA, TLS1.3/TLS_AES_256_GCM_SHA384, PostgreSQL17.11.
- Every investigation connection used transaction_read_only=on, lock_timeout=5s,
  statement_timeout=30s. No Session Pooler, write RPC or account login was used.
- Branch identity: course-cutover-rehearsal-274;
  7091bfd6-83ce-4c11-ac30-8ce85e09be2d; parent bsndfhbemstyrrglajat;
  with_data=false, ACTIVE_HEALTHY. Existing acceptance branch retained.
- Ledger: 275, exact last version 20260929215159 / lockliel_course_engine_standard.
  The ledger fingerprint matches the reviewed reference. Repository file:
  `20260929215159_lockliel_course_engine_standard.sql`.
- SHA256: `2e03aa8a8346f46e09e701fbb96c29ac8cb11404100fe51c1cdedebdc6ab35f1`.
  All 278 repository migration hashes remain unchanged.
- Final maintenance status: paused=true, protocol=278-v1, schemaReady=false.
  Start/end catalog fingerprints match. 276–278 were not run. 275 was not replayed.

## Actual security boundary

| Object/role | Actual hosted privileges |
| --- | --- |
| lesson_private_notes / postgres | Owner, all table privileges |
| lesson_private_notes / authenticated | SELECT only |
| lesson_private_notes / anon and PUBLIC | None |
| lesson_private_notes / service_role | TRUNCATE, REFERENCES, TRIGGER, MAINTAIN |
| course_answer_keys / postgres | Owner, all table privileges |
| course_answer_keys / anon, authenticated, service_role, PUBLIC | None |

There are no additional per-column ACLs on either table. RLS is enabled on both.
`lesson_private_notes_owner` is the sole notes policy, SELECT to authenticated:
profile_id=auth.uid() AND app_private.current_session_is_active(). There is no
manager policy. Private grading keys have no client policy and are in app_private.

The three public engine RPCs grant EXECUTE only to postgres and authenticated.
Anonymous, PUBLIC and service_role cannot invoke them. Internal watch/unlock helpers
are postgres-only. Relevant functions are postgres-owned SECURITY DEFINER with
an empty search_path. Their definitions, owners, policies and ACLs match the
captured stage275 catalog except for the already-known notes table ACL difference.

The path is:

1. Member sends notes to the authenticated journey handler.
2. `requireSession` supplies the learner identity and access token. Expected-user,
   payload, origin, maintenance and protocol checks precede transport.
3. `courseHeaders(s.access)` sends the learner bearer token and public API key to
   `lockliel_save_lesson`, never a service credential.
4. The RPC validates auth.uid/expected_user, active session, enrollment, published
   lesson and unlock, then revisions, bounds and completion requirements. It writes
   progress and notes atomically as postgres.
5. Reads/export use the learner token and owner/session RLS. Manager summaries do
   not load notes. Foreign-key cascades handle related deletion as the owner path.

RLS governs direct learner reads; the SECURITY DEFINER write function bypasses RLS
as postgres and therefore relies on its explicit authorization checks. Do not claim
RLS itself constrains the function's writes. No legitimate repository notes operation
requires service_role table grants, including self-service export or the save RPC.

TRUNCATE is a table-wide operation outside row policies. The demonstrated risk
requires privileged service-role SQL access; this is not evidence of anonymous
exposure or a public PostgREST TRUNCATE route. It is still an unnecessary capability
under the specified private-notes model. See [PostgreSQL privileges](https://www.postgresql.org/docs/17/ddl-priv.html)
and [Supabase grants and RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Verifier review and correction

`expectedTransition` copies new-object ACLs from the disposable stage reference.
`tests/support/supabase-compat.sql` grants arwdDxt to service_role by default;
historical fail-closed migration20260925155851 revokes anon/authenticated defaults,
but does not remove service_role defaults. Migration275 does not explicitly revoke
service_role on its new public notes table. Hosted defaults instead yield Dxtm.

Consequently `classify` returned UNKNOWN_STOP. The exact mismatch is real, but the
reference grant is NOT intended application access. Broadening hosted grants would
be the wrong repair. Silently accepting hosted defaults would also miss the defect.

The semantic verifier now independently checks all eight table privileges, additive
column privileges and PUBLIC grants for notes and keys. Intended client access is
only authenticated SELECT on notes; no service_role grants are needed. Missing
evidence or excess access fails closed. `verifyPostconditions` calls this gate.
It rejects both the old disposable broad ACL and hosted Dxtm, even if their catalog
fingerprints otherwise match. Exact catalog comparison has not been weakened.

The hosted SELECT-only check returns four service_role excess-privilege findings.
The former statement that all semantic checks pass is historical: the previous
checks omitted service_role and non-DML privileges. Existing stage references are
retained as historical observations, not rewritten to bless the defect. A full
release rehearsal now intentionally cannot pass until the correction is approved.

## Original application autosave 403

The original1599ab2 handler sends profile_id and lesson_id in a PostgREST
merge-upsert. Its generated conflict UPDATE includes those identity columns.
Schema274 grants INSERT, but not UPDATE, on those columns. The focused exact274
fixture reproduced permission denied for table lesson_progress; a plain authenticated
INSERT succeeded with the same learner/enrollment. Engine restrictive policies did
not yet exist. Thus the observed original403 was an existing ACL/upsert mismatch,
not caused by275, new RLS or the maintenance hook.

At275, configured-course restrictive policies separately block the old direct
progress/media write path. The new authenticated RPC avoids the identity-column
upsert shape. No compatibility bridge, grant expansion or old-UI fix was built.
Keep the maintenance/schema/new-app/fresh-client sequence; do not call the original
schema274 autosave success criterion passed or infer a new production test.

## Stale clients

An isolated read-only transaction called the pre-request hook with stale course
request metadata and confirmed PT503. It invoked no write RPC. Maintenance remains
closed. Existing original-browser evidence showed denied writes and continued
periodic sampling. Old JavaScript cannot gain retry handling retroactively.

Focused current-handler tests prove426 occurs before write transport after a
simulated reopening; new saver tests retain drafts and block repeated retries on
503/426. That does not prove the original client stops retrying. Hosted post-cutover
426 was not rerun because reopening/new-app deployment is prohibited. The approved
copy-and-close policy remains necessary; old retry UX remains a recorded limitation.

## Focused validation

- 36 JavaScript tests pass: verifier security/fingerprint rejection, course engine,
  maintenance/stale-client behavior and isolated binding. The handler regression
  explicitly checks use of the learner bearer token.
- `npm run test:sql -- --review-275` passes in a disposable PostgreSQL17 cluster,
  private socket, no TCP, sanitized environment. It replays274 once, reproduces the
  old upsert failure, then applies exact275 inside two rolled-back transactions
  modeling disposable and hosted default grants. No later migration runs.
- Both profiles reproduce the inherited TRUNCATE defect. A **test-only revocation**
  inside each transaction proves own-note saves/reads, A/B isolation, manager and
  anonymous denial, revoked-session denial, private-key protection, constrained
  EXECUTE and forged progress rejection with zero service table privileges.
  These passing reproduction/proposed-boundary tests do not mean deployed grants
  have been fixed. No hosted truncation/revocation was attempted.
- Changed tooling/tests lint and git diff --check pass. All278 migration hashes
  verified. No dependency, build, hosting manifest or application behavior changed.
- Initial sandbox SQL launch lacked macOS shared-memory permission; the authorized
  unsandboxed disposable rerun passed. No full release rehearsal was rerun.

## Production preservation and local checkpoint

Read-only production ledger check:274, latest20260926212002. Remote main remains
1599ab271e0120a5cdc4e38e225ba749dd214721. Development remote stays3a7b7b9; PR4 remains
draft/open/unmerged, auto-merge disabled. Netlify production remains deploy
6abbb27a1cdd6d00081b0e8e and the homepage hash is unchanged. ChatGPT Site remains
active version25, updated2026-08-27T22:28:57.301945Z.

No production DB write, migration, deploy, Auth/SMTP, settings/permissions,
payment/staff/content change or Share Library activation was performed. Settings
were not exhaustively diffed; these statements describe actions taken plus the
explicit preservation checks. No real-data test or isolated-host mutation occurred.
Both isolated environments/sites remain retained. Work is committed locally only.
Sanitized evidence is in `docs/evidence/migration-275-review-2026-10-01/`.

## Smallest next action: review a narrow corrective migration

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Review and authorize a separate correction package for unused service_role table
privileges on public.lesson_private_notes. Proposed scope: a new migration that
revokes all service_role table privileges on this table only, preserving postgres
ownership, authenticated owner/session SELECT, existing RPCs and all historical278
migration bytes. Do not add service_role CRUD grants or modify broad platform
defaults. No migration file has been created or applied in this review.

Recommended option: remove the unused privileges and validate both default-ACL
environments. Alternative: explicitly document and justify retained service-role
capabilities, accepting that this differs from the current least-privilege request.
Retaining TRUNCATE leaves unnecessary deletion authority; merely normalizing ACL
fingerprints does not fix it.

Before any hosted execution, separately approve how the new migration fits the
release set and maintenance readiness check, currently fixed to278. Do not replay275,
advance276–278, deploy a candidate, reopen, push, merge, touch production or delete
resources based on this proposal. The isolated branch stays275/maintenance ON.
