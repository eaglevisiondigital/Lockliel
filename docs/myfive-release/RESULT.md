# LOCKLIEL MY FIVE CANONICAL RELEASE CANDIDATE RESULT

## Decision

Local canonical candidate, SQL and coordinated API/frontend validation passed. The tooling-provenance defect was corrected and independently reviewed. Hosted readiness remains BLOCKED by existing operator, acceptance and privacy gates. No hosted execution is authorized or performed.

## Candidate migration

`supabase/migrations/20261104142104_lockliel_expand_my_five_relationship_capacity.sql`

SHA256: `cacea34fc29561bc905b61b7eb1f7767405f16cef0761e8e9534e59380c4fb5a`

Corrected SQL source: `90bc61dcf5c4fea8e25a2231f8a3a89303a59ca3` (executed identical bytes at `e97c0d8baea35303eb67349b09cc840bd32a64e5`), branch `codex/myfive-release-sql`, worktree `/private/tmp/lockliel-myfive-release-sql`.

The function/revoke body exactly matches the previously validated proposal; only its header comment differs. It removes the numerical active-contact rejection while retaining the function identity, owner, SECURITY DEFINER/empty search_path, owner advisory locking and execute restrictions. No other production SQL delta, index, RLS or permission expansion.

**Corrected tooling discrepancy:** initial creation mistakenly used cached CLI2.81.3. The approved CLI2.118.0 was recovered from its official public release into a temporary directory, not installed, and its executable SHA256 independently matched repository pin `8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4` before use. Approved tooling generated the final filename above with telemetry disabled. Full SQL bytes retain SHA256cacea34f... and are identical to executed old-filename bytes. The initial error, telemetry-file-write denial and all historical receipts remain recorded in CLI_PROVENANCE_CORRECTION.json; none were rewritten as a new SQL run. Ten offline checks passed. Independent correction review `10313c10a0c6d7cded2637ca685f146c6419d4f4` closed only this local tooling gate. No repeat fixture was needed. 

## Complete local verification

One exclusively owned PostgreSQL17 Unix-socket-only cluster contained two disposable databases. Exact280 baseline replay and retained17 SQL files passed. Upgrade to the candidate passed38 expansion checks, eight query plans at5/25/100/1000, owner RLS, private notes, grants, concurrent additions/removals/CAS, pagination/order/counts, original-inviter/mentor separation and course compatibility. Original-function rollback preserved expanded records. An injected migration transaction failure rolled back. Fresh full281 replay and17 current SQL files passed; final function and normalized security catalogs matched the upgraded database. Counts are separate suites, not a unique total.

Fresh insertion wall samples:5/25/100/1000 rows18.07/18.48/22.73/72.02ms; cursor pages1/1/4/40. Process/trigger-inclusive local samples, not hosted performance/SLA. Plans still scan eligible owner rows and sort using existing indexes; no performance guarantee or index change.

Fixture `/tmp/lockliel-myfive-sql-JhiVip` was stopped/removed; independent review verified absence. Only owned fixture was touched. Evidence in SQL branch `docs/myfive-release-sql/`.

## Coordinated API/frontend and session evidence

Implementation `b19aa0ebfa4a7cf00a7cffc5d5f438cbecda6830` on `codex/myfive-release-package` explicitly composes exact accepted API/frontend files from `eae9997`; no branch merge. Unlimited business goal means no five-person maximum, not unbounded page/storage guarantees. Bounded owner pagination/search, strict DTOs, Unicode limits, exact acknowledgments, generation invalidation, private notes/reminders, consent-aware Share Hope and inviter/mentor/group distinctions preserved. Existing narrower read projections and full reminder-list gaps are not silently widened.

86 network-guarded focused tests passed, including8 new tests exercising actual shared session guard and actual connections handler with synthetic transport. Anonymous, revoked, malformed/unavailable/error active status, expired/rejected refresh, refreshed-but-inactive and revoked mutation all deny before relationship operations. Static build, full TypeScript, targeted lint0warnings and Netlify84module/63handler validation passed. Prior client browser invalidation evidence remains historical exact-source, not fresh hosted acceptance.

Inherited owner-only RLS still accepts bare owner claims after synthetic session deletion (1008 owned rows in fixture). API active-session denial does not establish database-level revocation, provider token behavior or eliminate TOCTOU. Hosted provider row caps/locale/PostgREST/access-path acceptance remain unresolved. No authorization rule was weakened to pass tests.

## Safeguarding decisions

Recommend initial adult-member/adult-contact-only minimal private records, no minor/guardian workflow and no automated messaging, subject to explicit owner approval. Adults-only member direction is accepted; adult eligibility/evidence, third-party age scope, sensitive notes, channel/purpose consent, exact retention periods, withdrawal/suppression/deletion and named safeguarding owner remain unresolved. Public Gospel-resource reading is not permission to store/contact a minor. See SAFEGUARDING_DECISION_PACKAGE.md; no policy was activated.

## Actual parallel work and independent review

continuity_member owns SQL candidate/tests; coordinator owns API/frontend composition, new session tests, policy/release package; continuity_myfive delivered resource-favorite integration `eaf2022e27b8827e0cb921cf5c52acbc0908cbe8` in separate codex/release-ecosystem worktree; continuity_adapter independently reviews all lanes. Applied private favorites now open the exact eligible Share Hope resource, with current permission recheck, explicit consent and reset clearing. Six focused tests, five browser workflows, three responsive/axe scans, build, TypeScript and lint passed. No storage or communication occurred. Fixed synthetic owner composition is not an authenticated real-user identity adapter. Final source/receipt pins are recorded in RELEASE_MANIFEST.json.

Independent SQL review corrected two test-only comparisons before execution (cross-database catalog identity and canonical receipt labeling), verified exact migration body, all historical bytes, RLS/ACL/rollback results and cleanup. API review independently ran eight new denials and verified ten exact composed file hashes. CLI provenance was corrected against the original approved pin, not waived.

## Remaining approvals and preservation

With tooling provenance corrected, next request exact isolated migration/API deployment/synthetic acceptance authority with fresh target/operator/backup/readiness evidence. Existing280-only protected readiness/operator cannot be assumed compatible with281; any correction requires its own review. The pinned application327ba098 is unchanged and must not be silently substituted. Production's historical274 baseline needs a separate release sequence; this is not approval to execute275–280 or mergePR4.

See HOSTED_APPROVAL_REQUIREMENTS.md for target, source, policy, credential, fresh preflight, containment and rollback requirements. Never delete or pause expanded relationships to restore a cap. No reuse of J's consumed allowance or implied use of the unused application reservation.

All280 historical migrations,40 protected operator files,9 original course files,37feature records,120targets and five journeys preserved. Twelve coordination registers updated. No production/provider access, credentials, managed SQL, hosted Auth/accounts, maintenance change, messages, payments, push, merge or deployment. Branches/worktrees retained independently. Exact logo/photography approval and manual zoom/VoiceOver/device checks remain outside this package.
