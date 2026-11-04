# Wave 281 hosted API and operator decision

Status: **HOSTED ACCEPTANCE STILL BLOCKED**. This is offline source review, not execution authority. The specific implementation blocker is the absence of a separately sealed, trusted 281 hosted composition joining the locally verified catalog/guard/cleanup contracts to actual provider authority, session identities and restricted API dispatch. Do not repeat completed PostgreSQL validation.

## Fingerprint disposition

Evidence source `1863ea90ff09853d740bd390ba07a44ab36dfe8f`, `docs/wave281-concurrency-correction/sql-evidence/evidence.json`, reviewed by `212f040` and summarized at `b6b813d`:

| Claim | Disposition | Evidence/limit |
|---|---|---|
| Two reviewed FK qualification representations describe the same local objects | PASS | Actual structural referenced schemas/tables/columns, ownership, constraints, functions, ACLs and RLS comparison; default/empty search-path comparison passed |
| Local final catalog/course restoration | PASS | 42 recorded checks completed; catalog before/after `f14e6cc8e87f33d6dc7d7d945524f50af96b2e602a6f9bcb9aac84b882ab124f`; course `e10d317e55ba9d04a5696767be2f1f4084e80947860287697801ce40567fe19e` |
| Old raw-hash evaluator accepts that representation | BLOCKED by design | Its `SEPARATE_READINESS_FINGERPRINT_PARITY_UNVERIFIED` and localCandidateCompatible=false are preserved historical implementation output, not a newly discovered material drift |
| Separately reviewed semantic evaluator local comparison | PASS | localFixtureChecksPass/structuralComparisonPass/localRepresentationEquivalent=true; operationalReady/hostedReady/executionAuthorized remain false |
| Current isolated provider catalog equals expected structure/security | UNKNOWN | No fresh hosted catalog/ledger/ACL/trigger receipt in this assignment |
| Material mismatch in captured completed local run | None demonstrated | Do not generalize to provider-specific catalogs, extensions or unobserved RPC exposure |

The representational investigation is resolved locally. Do not overwrite expected fingerprints or silently modify the old 280 verifier. A 281-specific native receipt adapter must independently acquire structural fields and feed the strict semantic comparator; provider mismatch must still deny. The local comparator cannot manufacture operational authority.

## Actual routes and minimum future acceptance surface

Original immutable application `327ba098628f70aa65140862b8b14cd709bfd711` and protected 280 operator approve only `/api/lockliel/member-read` GET, `/api/lockliel-auth/login` POST and `/api/lockliel-auth/logout` POST, plus its static review surface. They do NOT approve My Five APIs.

Existing reusable candidate source at `b6b813d`:

- `netlify/functions/lockliel-connections.mjs`: `/api/lockliel/connections`, GET/POST. Future allowlist only GET `view=reach` with `reachStatus/reachSearch/reachLimit/reachCursor`, POST `addReachContact` and `updateReachContact` as already specified by `lib/acceptance-281/synthetic-plan.mjs`.
- `netlify/functions/lockliel-my-five.mjs`: `/api/lockliel/my-five`, GET owned `id`; POST note with `id/version/note`. No ordinary delete endpoint exists.
- Other connections actions (`requestLeader`, `cancelLeaderRequest`, `updateReachDetails`, `markReachActivity`, `setContactPermission`, `sendMessage`, `completeTask`) are not implicitly authorized. An acceptance-specific trusted dispatcher must reject them before side effects. Inviter/mentor/group tests use read-only evidence; no linking, consent grants or communications to force acceptance.
- Both handlers use `withProductionBackend`; `netlify/lib/deployment-safety.mjs` permits production or its separately pinned **branch-deploy** course-rehearsal mode. Neither is a valid substitute for the future exact-ID **deploy-preview** composition. Do not weaken those wrappers or repoint existing rehearsal aliases.

Required local change is a separately reviewed 281-only composition using existing handler contracts, not a second authentication system. Define exact source manifests, method/action/query/body bounds, isolated binding, route/rate and all alternative direct-function path denials. Extend a *separate* provider receipt/retirement inventory to these additional APIs only after explicit review. No source SHA for that new executable composition exists yet; do not call this proposal executable or consume the unused old reservation.

## Session and hosted coverage matrix

| Area | Exact later acceptance | Current evidence |
|---|---|---|
| More than five / paging | Synthetic A: 60 records traversing 51-row lookahead; B: 6; up to 4 extra concurrent A rows, max70. Default25/max50; literal search, status, owner/query cursor, stable created_at/id ties; no inferred exact total | SQL >5 and local parser/handler tests passed; provider row caps/collation/HTTP behavior UNKNOWN |
| API session | `requireSession` calls `authUser` then `lockliel_current_session_active`, including refreshed access; inactive, unavailable or malformed active-session response denies | Source and mocked tests; actual JWT/session behavior UNKNOWN |
| Stale/revoked/expired | Separately authorize only new test-session creation/revocation; valid owner baseline, then stale JWT/expired/refresh failure denial through each API. Never revoke historical course sessions | Local guard session tests are not general RLS revocation proof |
| Direct data access | Independently enumerate exposed schemas, grants, functions, trigger/definer paths; direct `reach_contacts` REST attempts and every actually callable mutation RPC under approved test credentials | Source/SQL inventory only; JWT/REST dispatcher not exercised |
| RLS/privacy | A/B isolation, foreign IDs/cursors/forged roles, note ownership, no note content in public previews, session-bound clearing and stale reply denial | Local SQL/contract results; hosted browser/API UNKNOWN |
| Concurrency | Bounded <=4 pending requests; distinguish exact SQL lock timeout55P03 from errors; revision note conflict and generic status updated_at predicate tested separately | One same-row SQL lock case passed; generic API is not full client revision/idempotency service |
| Nonparticipants | Independent before/after authorized synthetic nonparticipant sentinels and aggregate course fingerprints, never real-member content inspection; no global write freeze | Actual disposable preservation PASS; hosted proof pending |

The current `synthetic-plan.mjs` contains fixed synthetic UUIDs and always liveEligible=false. They are not hosted identity provenance. Existing `reach_contacts` RLS alone does not verify active sessions. The proposed participant guard checks registered session scope, but its real hosted coverage and installation authority must be established before test sessions/writes. Any bare-owner JWT bypass remains a blocker, not a successful revocation result.

Local callable probes include `lockliel_current_session_active()`, `lockliel_integrity_health()`, `lockliel_save_lesson(...)`, and public/app_private account-deletion preflight/readiness/reclaim helpers. These were SQL probes with expected denials; no claim that all are REST-exposed or that every hosted RPC was exercised. Derive the final network inventory from fresh effective grants/metadata, fail on unknown paths, never run a privileged destructive RPC to prove denial.

## Separate 281 operator and containment prerequisites

Expected target only `qjksggxorghaxvpyslip`, branch `course-cutover-rehearsal-274`; freshly prove child identity/linkage and named operator permissions without production-parent reads or secret-bearing model output. Current supported safe shared-hosted installation is **UNVERIFIED**. If complete participant-only bypass closure cannot be shown, propose a separate disposable acceptance environment for owner decision; do not create one or change existing infrastructure.

Preserve exact migration `20261104142104_lockliel_expand_my_five_relationship_capacity.sql`, SHA256 `cacea34fc29561bc905b61b7eb1f7767405f16cef0761e8e9534e59380c4fb5a`, all280 originals and40 operator files. A separate source-pinned 281 operator must bind:

1. Independent receipts <=five minutes where required, exact source/project/operator/run identity, genuinely verified existing synthetic A/B provenance, grant limits and independently trusted observation time/integrity.
2. New durable one-attempt authorization consumed before dispatch, no restart replay, no automatic retry after ambiguous ACK, bounded request/mutation counts. Existing J allowance stays CONSUMED. Existing application reservation stays UNUSED and is not 281 authority.
3. Fresh direct IPv6/TLS verify-full read-only preflight, same-connection on/5s/30s; ordered baseline280 ledger and candidate absence, full fingerprints/course state, maintenance ON. A separate exact281 migration+ledger transaction grant; rollback before commit, independent readback after lost ACK, no broad db push. Postcommit forward recovery is separately approved, never ledger deletion or restoring old cap by deleting contacts.
4. Independently verified guard installation in closed state and coverage established before separately authorized new participant Auth; then bind the actual new session IDs, seal exact scope and verify it before any participant writes; immutable exact identities/session IDs, bounded permitted rows/actions, preserved nonparticipant operation. No generic service-role write authority handed to test clients.
5. Exact-record cleanup adapter for locally tested `lockliel_acceptance_281_guard.snapshot()` / `cleanup(uuid,jsonb)`: stopped dispatch and removed/revoked **only authorized new test sessions**, dedicated least-privilege cleanup authority, exact run/owner/row/version snapshot and transaction locks, no broad DELETE. The local role `lockliel_fixture_cleanup` and mock executor are NOT existing hosted authority. Hosted factory remains disabled. Lost cleanup ACK means independent observation, not another delete. Independently verify historical/unrelated rows, course and canonical catalog restoration; retain auditable run receipts.
6. Separate deployment retirement result: exact provider-owned new ID only, provider and immutable-route404 proof plus published/alias preservation. Record cleanup cannot substitute for deployment retirement, or vice versa. No old deployment ID reused.

Prior proposed limits (70 created rows,260 execution requests +40 cleanup reserve, <=4 outstanding) are planning ceilings, NOT owner authorization. The guard fixture expires at15 minutes; the durable journal grant is at most300,000ms. These are distinct constraints: the narrow binding must honor the stricter five-minute dispatch grant, not stretch it to15 minutes or silently renew it. A separate cleanup authority must remain available after dispatch expiration; otherwise abort before starting. Exact maximum writes, duration, cleanup reserve, operator cost and new session budget must be approved in the future executable package. Ordinary A/B tests cannot establish managerAAL2/staff authority.

## Exact file-level binding package, proposed only

- Reuse from executed source `232f2e96790b0a70b4511434a0197c2cb64e8505` the unchanged `lib/readiness-281/catalog.sql`, `ledger.sql`, `fingerprint/compare.mjs`, `fingerprint/future-structural-capture.sql`, and reviewed semantic proposal. They reside on that execution branch, not automatically in the coordinator tree. New proposed `scripts/acceptance-281/provider-readiness-adapter.mjs` must bind genuine independently acquired receipts to those exact files. Never replace `local-status-proposal.sql` expected hashes or change the280 verifier.
- Keep `scripts/member-hosted/*`40-file protected operator unchanged. Proposed separate `scripts/acceptance-281/operator.mjs` binds a new source manifest, trusted operator authority and real A/B provenance to existing `lib/durable-281/journal.mjs` semantics without promoting synthetic issuers/UUIDs to authority. Resolve five-minute dispatch expiry versus cleanup custody explicitly.
- Proposed separate `scripts/acceptance-281/api-composition.mjs` reuses canonical connection/note handler logic and `requireSession`, while enforcing the exact action allowlist above. The existing connections default export combines handler and wrapper; any minimal factory extraction requires its own diff/contract regression review. Do not change `deployment-safety.mjs` or the old pinned application to authorize preview writes. Owner must separately approve a new281 deployment/route identity; neither existing production nor branch-deploy rehearsal is a shortcut.
- Proposed separate `scripts/acceptance-281/record-cleanup-adapter.mjs` supplies only the approved native transaction interface to the exact reviewed guard cleanup contract and independent reconciliation; retain `lib/acceptance-281/cleanup-executor.mjs` hosted-disabled factory. No arbitrary callback, service-role DELETE or browser authority.
- Proposed focused tests for those four adapters cover forged/expired receipts, wrong project/owner, route/action bypass, revoked session, five-minute expiry, missing cleanup authority, ambiguous ACK and exact-ID retirement separation. No need for another SQL fixture unless a demonstrated substantive SQL defect/change arises.

These file names are a bounded proposed change list, not existing delivered implementation or authorization to implement a new general framework. Safe shared-hosted feasibility remains UNVERIFIED. Final real-member safeguarding policy does not itself prevent invented-adult synthetic tests; it remains a real-data release hold.

## Smallest next authorization request

Approve **local-only** preparation of one separate 281 trusted operator/receipt/action-dispatch and cleanup composition, reusing the already validated semantic catalog comparator, participant guard and dedicated cleanup SQL unchanged. Require exact manifest, trusted provider projection contracts, verified-identity input schema, single-use controls, action-level allowlist and independent offline adversarial review. Preserve the280 operator and its routes unchanged. Do not create a fixture or repeat SQL absent a demonstrated changed SQL/security defect.

After that exact source exists, request a separately bounded protected **read-only** isolated provider/database evidence preflight (no accounts/Auth/writes/deployment) with a named operator and new grant. Do not request credentials before approved installation. Only its resulting authoritative evidence can support a later separate migration, guard installation, synthetic Auth/write and deployment authorization. Safeguarding policy remains a separate owner decision sheet, not implicit permission to store real/minor contacts.

No provider request, credential, SQL fixture, migration execution, Auth operation, reservation, deployment, push or merge was performed for this document.
