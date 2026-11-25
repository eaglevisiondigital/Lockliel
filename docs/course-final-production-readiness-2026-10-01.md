# Final production-readiness review, 2026-10-01

## Superseding resumed review, 2026-10-01

See `final-production-readiness-resumed-2026-10-01.md` and
`final-production-operator-sequence-2026-10-01.md`. PR4 is now current, all13 provider
durations are collected, and Owner/MFA/Small/PITR are verified. Production release
remains blocked by unsupported arwdDxtm defaults in the verifier, unresolved provider
incident, incomplete direct authentication/recovery/Storage gates and the documented
duration ordering/history-policy limits. No production action is authorized. Earlier
stale-PR and no-authoritative-duration statements below are historical.

## Recovery configuration completed, 2026-10-01

The later explicit Small-compute/PITR approval was executed and verified. See
`production-pitr-enabled-2026-10-01.md`: production now uses Small with seven-day PITR,
ACTIVE_HEALTHY, unchanged version/region and 274 migrations. Dashboard UTC window
was 2026-09-24 21:06:12 through 2026-10-01 19:11:17. This supersedes the OFF/Micro
blocker below, not the separate release gates. No restore, migration or deploy occurred.
RPO <= 2 minutes and planned course maintenance <= 30 minutes are targets. Before
cutover recheck the usable pre-cutover point, Owner/MFA/restore rights, independent
Storage protection, provider stability and the remaining application/security gates.

## Recovery policy update, 2026-10-01

See `production-pitr-review-2026-10-01.md`. Primary Chat approved 7-day PITR,
RPO <= 2 minutes and planned course maintenance <= 30 minutes. These are targets, not
verified restore duration or proof of a usable recovery point. Actual PITR remains
OFF: current Micro requires a separately authorized Small compute change plus billing
approval; the scoped enablement task explicitly forbade compute changes. No settings
were saved. Supabase PITR replaces separate Daily Backups; independent archival and
Storage-object protection are still future work. Before migration release verify a
usable pre-cutover point and an authorized Owner/operator with MFA/restore capability.
No down migration is assumed; recovery after a commit may require coordinated full
DB and application restoration. Provider incident and other release gates remain.
Earlier missing numeric-policy or no-PITR-authorization statements below are historical;
they do not override this approved target or authorize the required compute upgrade.

**FINAL PRODUCTION READINESS REVIEW NOT READY**

## Accepted legacy decision

**ACCEPTED BY MANUAL CUTOVER POLICY. CONTROLLED BY MANUAL CUTOVER POLICY.**

Primary Chat's explicit decision closes this acceptance gate by operator procedure.
It does not change the original browser result: old autosave hides errors and playing
media continues requests after rejection. Do not describe that behavior as passed,
fixed or compatible. No legacy bridge, old-client modification, weakened426 control,
RLS change or migration change is authorized.

Original main1599ab2 uses legacy identity-column upserts without the new atomic
owner/session/enrollment/revision RPC contract or278-v1 protocol. Schema275 adds the
new private-note/revision/worksheet/watch contract; old-app/new-schema saving is not
compatible. The separately installed operational request hook rejects incompatible
stale writes with426 once reopened. This is not a promise that migration275 alone
installs that hook. In isolated testing, stale writes did not persist or contaminate
other accounts. Production currently has no such maintenance hook installed.

Before maintenance, notify affected learners, allow time to save/copy unsaved answers
and Personal Notes, require ALL existing course/lesson tabs closed, and obtain the
operator's explicit closure confirmation. Maintenance must not begin before that
confirmation. After release require fresh tabs. Memory-only drafts left in an old tab
have no recovery guarantee. The user notice must say this plainly. No notifications
were sent during this review.

## Evidence scope and exact application

Review starts from clean local HEAD `3efe9f10cebddea557f4c81a55ad884912f4283d` on
`lockliel-backend-v1`. Final application candidate is
`21ac4a5172a7dd7082b659d65533385e231892ef`; later commits are evidence documentation.
Its isolated branch deploy is `6abe8f4f75e5a756b7d0cd9a` on site
`70b03a42-6329-476e-bf4b-2b1ce30e9567`, bound to qjksggxorghaxvpyslip. Manual deploy
provenance is the reviewed artifact/hash/served-byte chain, not a provider commit_ref.
Never deploy the isolated adapted artifact or synthetic credentials to production.
The future production build must come from the exact approved normal repository source.

Fresh GitHub reads: PR4 is draft/open/unmerged, targets main1599ab2, auto_merge=null.
Remote development HEAD remains `3a7b7b9e647739e72746f9ff2cb6602b1e06ff8d`, behind the
candidate. Existing push run36743265928 and PR run36743273182 both succeeded for that
OLD head (556JS/278 replay/15SQL recorded). No PR workflow run exists for21ac4a5.
Latest ordinary preview remains6abd366442bf580008d496b6 at3a7b7b9. These results do
not validate the final candidate. A separate controlled development checkpoint and
current CI/preview verification are required. No push or PR change was made here.

## Migrations275–279

All279 local files freshly verify against the pinned manifest and source anchor
`a2254aaa3890e2aff7c51b9c84c45021a7b7ba20`. Original274 bytes are unchanged.

| Stage | Exact file in supabase/migrations | SHA256 |
|---|---|---|
| 275 | `20260929215159_lockliel_course_engine_standard.sql` | `2e03aa8a8346f46e09e701fbb96c29ac8cb11404100fe51c1cdedebdc6ab35f1` |
| 276 | `20260930092000_lockliel_course_release_trigger_execution.sql` | `83c7ea72d55b518c0ecb3704bc052bbc8be535c9b6b5461a6bf2224f2044b8ed` |
| 277 | `20260930092500_lockliel_course_conflict_http_status.sql` | `42ca6baea8c16e599f04f5aa52823362b862761943e9e37e4e7ba19c986bcaf0` |
| 278 | `20260930145334_lockliel_media_publication_authorization.sql` | `7b86fc4647338537a4da06e363b716ce2f7960cb02fb28ec8acab2f26c926ea0` |
| 279 | `20261001133500_lockliel_private_notes_service_privileges.sql` | `5fbcf6d942583ea2e79cb2ae356f6ee712314fe749fb97130e9a21e962c10f71` |

Required order275→276→277→278→279. Pinned CLI2.118.0 binary SHA256:
`8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4`.

Local prior evidence:279 disposable replay/16 SQL files and five-stage CLI rehearsal
including TLS, timeouts, drain/concurrency and failed/ambiguous commit classification.
Latest application validation:573JS,37-page build/static export, TypeScript, Netlify,
configured lint;25 hosted authorization checks and read-only authenticated SQL/RLS.
No new replay or app suite was necessary for this documentation-only review.

Hosted qjks sequence:275 committed once, initially UNKNOWN_STOP because service_role
inherited the hosted Dxtm defaults. Subsequent default-ACL-aware review classified it;
275 was not replayed.276–279 then each committed once in order and passed exact
catalog/postconditions.279 removes every effective table/additive-column service_role
notes privilege; PUBLIC/anon have none, authenticated SELECT is owner-RLS controlled.
Private grading keys remain unavailable to ordinary/manager roles. The current279
operational readiness and paused-read fixes were separately authorized and accepted.
None of this is production execution evidence. Production has all274 expected ledger
versions and no275–279 entries as of18:38 UTC this review.

## Course-engine acceptance

| Capability | Gate | Evidence |
|---|---|---|
| Autosave and private notes | PASS | Hosted A/B save, refresh, logout/login and independent browser restoration |
| A/B isolation; manager/MFA restrictions | PASS | Actual Auth/RLS/API checks, owner-only notes, no manager notes or service-role notes privileges |
| Cross-session restoration | PASS | Hosted browser and independent context reads |
| Revision conflicts and completion idempotency | PASS | Prior post-reopen acceptance, preserved draft/conflict resolution |
| Network outage/reconnect | PASS | Offline draft retained, not false Saved, reconnect/refresh cloud persistence |
| Lost acknowledgment | PASS | Actual hosted persistence with unchanged autosave module and controlled dropped response; one revision increment |
| Mid-flight browser interruption | NOT YET VERIFIED | Optional attempt completed before interruption; not a required replacement for verified outage/retry |
|95% watch boundary | PASS | Actual1344s playback94.30/94.67 locked,95.41 unlocked;97.64 durable after refresh |
| Seek/worksheet/no fake completion | PASS | Seek-to-end only2.11%, empty completion400 with no overwrite; valid worksheet then completed |
| Legacy-client acceptance policy | PASS | Explicit Primary Chat decision; CONTROLLED BY MANUAL CUTOVER POLICY, old UX remains unchanged |
| Actual production operator tab closure/notice | REQUIRES ACTION | Must be performed and recorded immediately before a separately authorized cutover |

Detailed evidence remains in `course-post-reopen-acceptance-2026-10-01.md` and
`course-post-reopen-corrective-acceptance-2026-10-01.md`. Their original test results
are historical facts, not rewritten. The legacy-policy decision supersedes only the
unresolved acceptance decision, not the recorded behavior.

## Exact production video inventory

Fresh read-only production rows:13 active video assets across Lessons1–10. Every
stored duration, verification timestamp and source is NULL. Actual durations are
not known from authoritative evidence in this review. Linked provider references
identify the assets, not timing authority. Do not copy the1344-second synthetic test
video duration into any of these rows.

| Lesson | Asset UUID | Video | Actual duration | Trusted status/source | Ready |
|---|---|---|---|---|---|
| 1: How to Become a Christian | `42b28ff3-03fa-45b9-93e7-4a258b5bd768` | [YouTube SJ5Ee7OXkkM](https://www.youtube.com/watch?v=SJ5Ee7OXkkM) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 2: How to Be Sure You Are a Christian | `0772dfe1-2e03-430f-bdc6-f691e2de7fcb` | [YouTube AEfPf609RgU](https://www.youtube.com/watch?v=AEfPf609RgU) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 3: How to Develop Your Relationship with God | `c8b4ea07-47be-43cd-b07c-35e80cbba6cd` | [YouTube 3CSBKubDefw](https://www.youtube.com/watch?v=3CSBKubDefw) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 4: How to Talk to God | `495191a6-42c1-4c65-9aef-66de0f98583a` | [YouTube _NSjbNFcqQA](https://www.youtube.com/watch?v=_NSjbNFcqQA) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 5: How to Hear from God | `9f91268c-923f-46af-a9aa-e75ddf68b889` | [YouTube nWS8Km2kfKg](https://www.youtube.com/watch?v=nWS8Km2kfKg) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 6: How to Obey God | `6ab8a12a-f13c-48dc-8048-afe5fb26359f` | [YouTube enGySOvV4jg](https://www.youtube.com/watch?v=enGySOvV4jg) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 6: How to Obey God | `754a7b50-3f7b-455e-a147-18bf6ff3cd18` | [YouTube TjuLVCy4gnQ](https://www.youtube.com/watch?v=TjuLVCy4gnQ) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 7: How to Experience God's Love and Forgiveness | `2cacacc1-b174-4d0a-b17b-6db3a56936ed` | [YouTube q_vUBJ8EgaU](https://www.youtube.com/watch?v=q_vUBJ8EgaU) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 8: How to Be Filled with the Holy Spirit | `41595092-d6b9-4ee0-aa61-5b6bf3917ec1` | [YouTube 2VDVveA4RUQ](https://www.youtube.com/watch?v=2VDVveA4RUQ) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 8: How to Be Filled with the Holy Spirit | `8697594b-35e7-42ac-be40-520546fc2181` | [YouTube g8b964SWekE](https://www.youtube.com/watch?v=g8b964SWekE) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 9: How to Be Sure You Are Filled with the Spirit | `793e65ec-6eff-4a86-b650-6d9cb2dcff29` | [YouTube HY1OyDdODL8](https://www.youtube.com/watch?v=HY1OyDdODL8) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 9: How to Be Sure You Are Filled with the Spirit | `dadd7b47-5288-43d2-bd9b-f66d31f3ffd0` | [YouTube vjY2BTUzxGU](https://www.youtube.com/watch?v=vjY2BTUzxGU) | Unknown | Missing: value, verified timestamp and source | NOT READY |
| 10: How to Grow and Develop Your Faith | `3b9819c7-b197-4e2e-af13-06ee5836b6ed` | [YouTube 5-1B6IouUNk](https://www.youtube.com/watch?v=5-1B6IouUNk) | Unknown | Missing: value, verified timestamp and source | NOT READY |

Lessons11 How to Experience the Abundant Life,12 How to Be an Overcomer and13 How
to Serve God have no active videos. Approved videos remain pending. The accepted
Media Coming Soon policy remains, with no silent no-video fallback or worksheet-only
completion. Each of the13 lessons has one active protected PDF row with a matching
Storage object; lesson-assets is private. Object-byte integrity/recovery and a fresh
production authenticated resource test remain separate checks. No protected object
paths or contents were exported here.

Trusted timing for every required active asset1–10 remains a prerequisite to reopening.
Collect exact provider/file-authoritative timing and provenance, then use a separately
authorized configuration assignment compatible with the new source/timestamp fields.
Staff count is currently zero; using the manager configuration workflow would also
require separately authorized existing-role/MFA operator setup. Do not bootstrap staff
or bypass RLS in this review. Missing11–13 videos are an approved pending state, not
an implicit requirement to delay engine release or waive their progression rules.

## Auth and recovery

Security Advisor freshly reports **Leaked Password Protection Disabled**. Remediation:
separately authorize enabling that control for production bsndfhbemstyrrglajat under
Supabase Auth password security, keep unrelated Auth/SMTP settings unchanged, then
verify the setting and refreshed Advisor result. No password reset, account creation,
email test or setting change is part of this review. See
[official password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Visible production Auth: email enabled, signup enabled, email confirmation enabled,
anonymous sign-in/manual linking off. Custom SMTP is enabled, smtp.resend.com:465,
minimum interval60s. Secret SMTP credentials were not read/exported or changed.
This is a selected visible-settings observation, not a full settings hash audit.

Refreshed dashboard lists a PHYSICAL backup at **2026-10-01 07:30:56 UTC**, about11h10m
old at18:41UTC, with a Restore control. This establishes availability in the dashboard,
not successful restore, sufficient permissions, near-zero-loss RPO or release-point
freshness. PITR is currently OFF. A daily backup younger than24h still does not satisfy
near-zero-loss rollback for real members. A course-only pause also does not stop all
unrelated platform writes that a whole-database restore would discard.

Before release, approve a concrete recovery method reaching the drained cutover point,
acceptable RPO/data loss, maximum downtime/RTO and abort deadline. Prior near-zero-loss
intent remains; no numeric allowance or accepted daily-backup exception exists. PITR
purchase/enablement or a provider-assisted recoverable post-freeze snapshot needs
separate approval. Verify Owner MFA, operator identity/restore permissions, provider
restore availability and a nonproduction restore rehearsal with measured timing.
Those gates remain NOT YET VERIFIED. Never click Restore merely to test permissions.

Database backups contain Storage metadata, not the protected PDF bytes. Establish an
independent recoverable object copy/version inventory, integrity checks and restore
mapping; account for objects created/deleted after the database recovery point. Do not
assume existing objects are backed up because matching metadata exists. See
[Supabase backups](https://supabase.com/docs/guides/platform/backups).

## Network and provider

Fresh direct endpoint `db.bsndfhbemstyrrglajat.supabase.co:5432` resolves IPv6
`2600:1f18:38df:9500::eef4`; TCP connects. PostgreSQL TLS handshake verifies CA and
hostname successfully with TLS1.3. No Session Pooler was used. This is not a complete
libpq sslmode=verify-full authenticated session test. No retained production password
was used. Authentication and startup read-only/5s lock/30s statement safeguards on the
actual direct operator connection must be reverified using hidden local input.
MCP transactions did verify read_only=on,lock_timeout=5s,statement_timeout=30s, but are
not evidence for that direct transport.

Project is ACTIVE_HEALTHY in us-east-1. At18:44UTC, Supabase's status reports API
Gateway degraded and unresolved incident `w91bvbjhqf0f`, Intermittent latency in Eastern
US. A healthy project or one successful TCP test does not establish a stable release
window. Require incident resolution plus a freshly observed stable app/DB/provider
window and an available operator. [Incident](https://status.supabase.com/incidents/w91bvbjhqf0f).

## Exact future read-only preflight

`course-production-readonly-preflight-2026-10-01.sql` is a review checklist, not an
execution approval. It contains only read-only transactions and selected aggregates,
fingerprints, ledger versions, catalog digests, lock/activity counters and the requested
public course asset inventory. It has not been executed as a whole. Fresh narrow
subsets were executed this review; do not label the complete production preflight PASS.

1. Pin project ref/host/region and authenticated operator; independently verify the
   direct connection and startup safeguards above. No pooler, TLS downgrade or fixture.
2. Read GitHub main and PR4 head/draft/unmerged/auto_merge, current workflow results,
   ordinary preview identity and production Netlify published deploy. Require the
   approved final candidate actually present with passing exact-head CI. Review main
   auto-publish timing: merging main is a production deployment trigger.
3. Run local `verifySource()` and compare all279 files and CLI binary to manifests.
   Production ledger must match the274 version list exactly. Statement-body digests
   are serialization fingerprints, not substitutes for migration file SHA256.
4. Capture read-only catalog/RLS/default-ACL baseline with the reviewed stage classifier
   and verify expected transitions against the canonical stage-reference. Reject global
   or unreviewed default grants, unexpected object collisions or security drift. Existing
   templates must be bound/sealed to the actual production baseline and assignment.
5. Execute the narrow SQL checklist twice at least10s apart in separate read-only
   transactions; require stable stats_reset, no unexplained course write deltas, no
   target locks/waiters/long transactions. Do not terminate sessions automatically.
   A quiet sample now cannot stand in for post-maintenance drain later.
6. Compare course/member/enrollment/progress counts and protected fingerprints for
   staff/payment/checkout/flags/Share Library before/after. Compare ledger and security
   catalogs. Counts alone cannot prove every row unchanged. No raw private rows.
7. Read Security Advisor; compare selected Auth/SMTP controls without credentials.
   Verify private Storage, exact resource mapping and external object recovery evidence.
   Require trusted-duration provenance and retained11–13 pending policy.
8. Reconfirm recovery point, Owner MFA/restore operator, accepted RPO/RTO, notices/tab
   closure, stable provider/network window, stop conditions and separate release authority.

The initial broad historical snapshot query was rejected by automatic approval review
as potentially exporting sensitive staff/payment/storage metadata. It was not executed.
We used approved narrower counts/version-list/content-inventory checks instead. Full
fresh catalog/protected-row equivalence remains unverified here; no bypass was used.

## Release sequence and operational artifacts

The exact future order is in `course-release-279-runbook.md`. Maintenance installation
is an operational schema/permission/PostgREST change outside the five migrations and
needs explicit production authorization. Current production maintenance_installed=false.
The isolated-safe-read follow-ups are explicitly marked ISOLATED and cannot silently
be treated as already approved production scripts. Require review/sealing of the exact
production operational chain without developing a legacy bridge or altering historical
migrations. Keep writes blocked throughout. Before maintenance OFF, fresh-client
acceptance means identity, login, read-only behavior and correct maintenance denials;
actual autosave/notes writes are tested only after the separately approved reopening.

| Reviewed operational source, not production execution approval | SHA256 |
|---|---|
| `maintenance-install.sql` | `36dcd652209d635c57e75e44cef15640f34d3a7023d0e304ef682c56e6a0cc03` |
| `maintenance-safe-reads.sql` | `5cb8ba998f27891cfd581073398c1ecb240df9c088a7253f793ed57ce0ce6902` |
| `maintenance-safe-resource-read.sql` | `5d5d0f08a5b0489ff1b93646bb97477fa1140a17310eb458ba2a2ce404c3a84e` |
| `maintenance-safe-resource-info.sql` | `2c8bfbad3b333e11d5f3814d2804ec4f4ef53629dc5617a4f22cf9d9b06579c6` |
| `maintenance-reopen.sql` | `9c98e2877f95c0dc19944b22e78f32ee8eefb5032e9194385fb83e1bda955d87` |

For a new installation use the final279 readiness definition, not the consumed
isolated update that expects the old278 fingerprint. Keep protocol278-v1. Final safe
resource reads require existing permanent resource RLS and the exact reviewed helper
chain; no privileged download bypass. Retain426 protection after maintenance exit.

## Final gate table

| Gate | Result | Remaining condition |
|---|---|---|
|275 exact file/hash/local replay/hosted commit | PASS | Recheck sealed production prior state before future execution |
|276 exact file/hash/local replay/hosted commit | PASS | Same; never skip275 |
|277 exact file/hash/local replay/hosted commit | PASS | Same; HTTP conflict status preserved |
|278 exact file/hash/local replay/hosted commit | PASS | Same; publication authorization preserved |
|279 exact file/hash/local replay/hosted security | PASS | Final service_role notes privileges zero; no early reopen |
| Final candidate local validation/isolated acceptance | PASS | With explicitly accepted manual legacy policy and recorded test limits |
| Final candidate on PR4 and remote CI | REQUIRES ACTION | Candidate21ac4a5 absent from remote head3a7b7b9 |
| Production operational maintenance package | REQUIRES ACTION | Exact reviewed production binding/install/follow-ups and execution authority |
| Course autosave/notes/isolation/restore/conflict/completion | PASS | Hosted synthetic evidence; production smoke remains future |
| Legacy policy decision | PASS | CONTROLLED BY MANUAL CUTOVER POLICY |
| Production notices and operator old-tab closure | REQUIRES ACTION | No notices or closure confirmation performed for a release |
| Trusted durations1–10 | REQUIRES ACTION | All13 active assets missing authoritative values/provenance |
|11–13 pending media policy | PASS | Accepted pending state; no-video progression remains blocked |
| Protected PDF mapping/private bucket | PASS |13 matching rows/objects, private bucket; not an object restore test |
| Leaked-password protection | REQUIRES ACTION | Separate Auth remediation then fresh Advisor verification |
| Listed recent physical backup | PASS |07:30:56UTC today; must refresh again at release |
| Near-zero-loss recovery point/RPO/RTO | REQUIRES ACTION | PITR off; post-drain recoverable point and explicit limits not established |
| Owner MFA/operator restore permissions/restore rehearsal | NOT YET VERIFIED | Dashboard controls alone are insufficient |
| Storage object recovery | NOT YET VERIFIED | Recoverable bytes, versions and restore mapping required |
| Direct IPv6 and verified TLS handshake | PASS | Fresh18:41UTC; repeat during release window |
| Authenticated direct verify-full/startup safeguards | NOT YET VERIFIED | Hidden input and bounded read-only identity query required |
| Stable provider/release window | FAIL | Eastern US incident unresolved/API Gateway degraded |
| Production ledger274 and public RLS enabled | PASS | Fresh read-only counts/exact version parity |
| Full fresh catalog/locks/write-counter/preservation preflight | NOT YET VERIFIED | Narrow reads only; full checklist not run or approved as an execution |
| Rollback/recovery procedure documented | PASS | Plan only; no down migration or actual restore implied |
| No production mutation by this review | PASS | Read-only checks only; no release, content/settings change or real-account test |

## Preservation

Fresh production observations:274 migrations,1 profile,1 enrollment,0 lesson progress,
0 media progress,0 staff,3 Share Library rows, all public table RLS enabled, no lock
waiters/other open transactions at the sampled instant. Main remains1599ab2. Netlify
published production remains6abbb27a1cdd6d00081b0e8e. Sites remains active version25,
last update2026-08-27. No production DB write/migration/deployment, Auth/SMTP or
payment/staff/settings change, Share Library activation or production content change
was performed. Selected external state was read; full settings/row equality is not
claimed. No real-member testing, Git push, main/PR4 merge, or cleanup occurred.
Both qjksggxorghaxvpyslip and jxtgtfffdiwzxocxoqxk and isolated sites are retained;
qjks remains279/maintenance OFF from the last verified acceptance.

## Smallest next action for Chat

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Legacy gate is accepted by manual cutover policy. Do not reopen its bridge decision.
The final production review is NOT READY. Decide the concrete near-zero-loss recovery
method, acceptable numeric RPO, downtime limit and named MFA-enabled restore operator.
PITR is off and the11-hour daily backup is not a post-drain recovery point. Approve a
separate recovery-readiness assignment if PITR/cost/settings or restore rehearsal is
needed. No production release follows from that approval.

Then separately assign the minimum prerequisite work: authoritative duration/provenance
collection for the13 listed videos (read-only first), narrow leaked-password protection
remediation, and controlled development checkpoint/CI for the validated candidate.
Production operational-script sealing/preflight and execution authorization remain
separate. Wait for a stable provider window. Do not merge, migrate, deploy, activate
content or delete environments as part of this recommendation.
