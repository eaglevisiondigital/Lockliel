# Final course cutover rehearsal result

Preparation only. **COURSE ENGINE CUTOVER REHEARSAL INCOMPLETE**.
The missing requirement is the full hosted old-app/schema274 to candidate/schema278
transition. The retained isolated project is already278 and must not be downgraded.
No production execution is authorized by this report.

## Scope and exact implementation

- Production: main1599ab271e0120a5cdc4e38e225ba749dd214721, project
  bsndfhbemstyrrglajat,274 migrations, latest20260926212002.
- Development: lockliel-backend-v1; prior remote a58626b2f0a46b2fad84e1f79e88dbfb13c81a22.
- Migration278 implementation678f9a962e767dd5127f0bc2a280837214e57c13.
- Cutover client/runner17054a1; stopped media retries3cf0fd9;
  final private hook/read-only RPC fix d604a973cea0f524d5565caeec1db139b8c8c5df.
- Existing isolated Supabase jxtgtfffdiwzxocxoqxk, dedicated Netlify
  60579b8e-d0ca-4ac1-abe5-7128f4243e8b. No acceptance resource deleted.
- PR4 must stay draft/open/unmerged. CI and final preview evidence are appended
  after the explicitly authorized development push.

## Approved stale-tab policy and evidence limits

Dave copies/saves needed unsynced worksheet answers and Personal Notes, closes ALL
old course tabs, and explicitly confirms closure BEFORE maintenance. Use a fresh
tab after release. This is approved, not a pending product decision.

Actual retained old acceptance artifact91611ad was opened with synthetic learnerB.
Cloud-saved answers/notes were observed at revision4. While maintenance was ON,
attempted stale edits were denied503; revision4 stayed unchanged. Old acceptance UI
showed Save Failed / Retry Needed and bounded autosave retries. Synthetic drafts were
copied locally before closing the tab. Candidate fresh reload later recovered that
acceptance client's local-storage draft and saved revision5 AFTER reopening.
This does not establish recovery for original production1599ab2 memory-only drafts.
The full original production app with hosted schema274 was not exercised.

Candidate3cf0fd9 on hosted278 successfully saved fresh worksheet/notes revision6.
During a second pause, a new synthetic question6 draft displayed Course Update
Paused; Draft Saved, disabled edits and exposed View My Unsaved Draft / Reload Course.
Media playback/sampling stopped on503 and showed the polished maintenance text.
Database revision stayed6, question6 remainedNULL. No silent persisted-save claim.
Both the autosaver and player stop on terminal authorization/maintenance/reload
responses; other player failures are bounded at five retries.

## Hosted maintenance mechanism

Temporary operational SQL was installed ONLY on isolated278, outside the migration
ledger. It starts CLOSED. Private lockliel_cutover.control has RLS and no client
policies/table grants. The pre-request hook is lockliel_cutover.request(), outside
exposed public API schema. A safe authenticated status RPC returns pause/protocol/
schemaReady metadata. No public anonymous definer request RPC remains.

Table locks, restrictive reads, row write triggers, and pre-request path guards
block course autosave, private notes, media samples, completion/progression and
relevant direct authenticated table/RPC writes. Actual hosted tests returned503
for worksheet/completion RPCs, media RPC, progress PATCH and private-notes PATCH.
Application GET/new POST/old POST returned503 course_maintenance with the expected
isolated identity. Unrelated profile GET and synthetic Auth login remained200.
After reopening, stale application writes returned426 course_reload_required,
stale direct save RPC426 PT426, and fresh journey GET200 with13 lessons.
The278-v1 compatibility header never replaces Auth, enrollment, permissions or RLS.

The read-only POST RPCs course_gates and grip_readiness remain blocked while paused
but are exempt from post-reopen write-protocol enforcement. An initial read failure
exposed this distinction. Maintenance was immediately reclosed, the fix tested and
reopened explicitly. Fresh eligible media sample200 and worksheet/private-note
save200 revision6 then passed. No business write occurred in the failed read-check
window. Final artifact verification is recorded below.

Security Advisor now has no anonymous definer request-hook warning. The intended
status RPC and existing identity-checked course RPCs remain authenticated-definer
advisories. RLS-with-no-policy on private answer keys and maintenance control is
intentional deny-by-default, not an invitation to expose them. Production's separate
leaked-password warning remains unresolved.

## Drain and failure behavior

The runbook defines COURSE WRITE PATH DRAINED: CLOSED status and verified denials,
bounded locks on the five course/progress/media tables, no unresolved course writer
or idle transaction, exact pre-stage identity/ledger/catalog captured. Do not kill
unrelated sessions or proceed on ambiguity. Hosted inspection found zero unresolved
course writers; the disposable test uses an actual concurrent write and proves the
pause commit waits for it, then rejects later writes.

The final complete disposable runner rehearsal passed after the private hook and
read-only exemption changes. All four stages have injected permission failures that
roll back and leave maintenance ON. SQL errors, actual statement/lock timeout,
server disconnect before commit, actual TCP loss AFTER commit, ledger/catalog
mismatch and both publication-race lock orders pass. Operator result is always
STOP / INVESTIGATE on failure; COMMITTED does not automatically retry or reopen.

A hosted deploy command was rejected before upload because --context and --no-build
are incompatible; maintenance remained ON. The corrected isolated deploy succeeded.
This proves CLI preflight failure handling, not an injected server-side deployment
failure. A post-reopen read-verification failure was detected and immediately
reclosed as documented above. Full hosted mixed-version failure coverage is pending.

## Exact staged runner

CLI2.118.0 SHA256:
8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4.
Exact migration hashes:

| Stage | Repository version | SHA256 |
| --- | --- | --- |
| 275 | 20260929215159 | 2e03aa8a8346f46e09e701fbb96c29ac8cb11404100fe51c1cdedebdc6ab35f1 |
| 276 | 20260930092000 | 83c7ea72d55b518c0ecb3704bc052bbc8be535c9b6b5461a6bf2224f2044b8ed |
| 277 | 20260930092500 | 42ca6baea8c16e599f04f5aa52823362b862761943e9e37e4e7ba19c986bcaf0 |
| 278 | 20260930145334 | 7b86fc4647338537a4da06e363b716ce2f7960cb02fb28ec8acab2f26c926ea0 |

All277 prior migration bytes match remote baseline; original274 manifest preserved.
Four sealed stage workdirs, exactly one pending file each, no seed/roles/Vault,
repository ledger versions only, approved cli-latest cache only, verify-full TLS,
5s lock/30s statement timeout, read-only verification after each stage and every
error. References and results are in supabase/verification/course-release-278 and
docs/evidence/course-release-review-2026-09-30/rehearsal-278.json.

## Hosted sequence coverage

| Step | Result |
| --- | --- |
| Old app + hosted schema274 | NOT RUN: needs a second disposable hosted branch |
| Manual copy/close policy | Approved; synthetic retained278 old-client exercise performed |
| Hosted pause/direct denials | PASS on retained278 |
| In-flight drain | PASS actual concurrency disposable; hosted inspection/denials pass |
| Stages275,276,277,278 | PASS exact runner disposable only; no reapplication to retained278 |
| New app on hosted278 | PASS isolated identity and synthetic client checks |
| Reopen/resumed save/notes/sample | PASS on retained278 after read-only RPC fix |
| Full hosted mixed-state sequence | NOT VERIFIED; cannot combine separate tests into proof |

## Duration, Auth, recovery and network

The complete13-asset production inventory is in
[course-duration-inventory-2026-09-30.md](course-duration-inventory-2026-09-30.md).
Every current duration isNULL; no authoritative value/source has been established.
Inventory completion is PASS, trusted production timing is FAIL. Isolated synthetic
fixture durations are not production evidence. Do not reopen production until ALL
required active videos in Lessons1–10 have trusted timing. Lessons11–13 remain
Media Coming Soon, no unapproved video activation.

The separate exact Auth remediation assignment is in
[course-release-recovery-auth-2026-09-30.md](course-release-recovery-auth-2026-09-30.md).
Production Security Advisor still reports leaked-password protection disabled.

Recovery requires PITR active through pre-cutover instant OR separately approved
equivalent recoverable post-freeze snapshot/RPO, plus verified Owner MFA, restore
permissions and operator access. These are not satisfied by old backup evidence.
Direct production IPv6 must be freshly tested over the known-good T-Mobile iPhone
hotspot, with verify-full, authentication, read-only mode and5s/30s timeouts.
Normal Ethernet/Wi-Fi previously lacked a route. No Session Pooler. Stable provider/
network window must be checked at release; local TLS tests do not pass this gate.

## Validation and preservation

Full guarded npm test:556JS and webpack/static build PASS. PostgreSQL17 fresh278
replay and15 SQL/RLS files PASS. TypeScript, Netlify74 modules/62handlers, configured
lint and targeted runner lint PASS. Production dependency audit:0 vulnerabilities.
No dependency/hosting/workflow changes introduced by this task. Credential-pattern
scan of the local commit chain found no secret patterns. All277 historical bytes
unchanged;278 exactly matches approved SHA.

Fresh read-only production check:274, latest20260926212002. Main1599ab2 unchanged.
Netlify production6abbb27a1cdd6d00081b0e8e unchanged; homepage200/128071bytes/SHA256
 a184c485520cc5fa6bd5cee0b0e47cdaf46575e1e9794f9afa25743466cfbe00.
ChatGPT Site active version25, updated2026-08-27T22:28:57.301945+00:00 unchanged.
No production migrations, DB writes, deployment, Auth/SMTP/settings/permissions,
staff/payment/content or Share Library changes were performed. No real-data tests.
This is action-scope preservation plus observed identities, not an assertion that
an independent third party could not change an uninspected live setting.

## Final production gates

FAIL includes pending or unverified; it does not necessarily mean a defect.

| Gate | Status | Evidence / remaining requirement |
| --- | --- | --- |
| A Exact compatible275–278 | PASS | Exact hashes, fresh replay, staged verifier |
| B Hosted maintenance | PASS | Real retained278 direct/API denials and candidate UI |
| C Stale-tab policy proven | FAIL | Policy approved; original1599ab2/hosted274 sequence untested |
| D Drain procedure | PASS | Actual concurrent disposable drain plus hosted inspection |
| E Four-stage runner | PASS | Complete final rerun, pinned CLI/TLS/catalog checks |
| F Failure/commit state | FAIL | Local cases pass; full hosted transition/deploy-failure scope incomplete |
| G Duration inventory | PASS | All13 assets enumerated with current/authoritative/source status |
| H Production durations | FAIL | All13NULL; trusted values not established/populated |
| I Lessons11–13 pending | PASS | Approved pending state preserved; no content activation |
| J Auth protection | FAIL | Fresh production Advisor warning unresolved |
| K Near-zero-loss recovery | FAIL | PITR/equivalent recovery point not verified |
| L Owner/restore capability | FAIL | Fresh MFA, permissions and recovery access required |
| M Direct IPv6 | FAIL | Fresh production route/TLS/read-only test required |
| N Stability | FAIL | Fresh release-window provider/network verification required |
| O Exact PR4 candidate/CI | FAIL | Pending authorized development push and remote checks below |
| P Rollback plan | PASS | Fail-closed classification/restore plan documented; execution blocked byK/L |
| Q Production preservation | PASS | No production mutation, observed baseline identities unchanged |

## Smallest next action

Identify the Supabase organization for a second disposable hosted branch, obtain
its quoted recurring cost and explicit confirmation, then run the missing exact
hosted274→278 transition there. Supabase's branch tools require the user to identify
the organization and confirm the quoted cost before branch creation. A question is
pending; no branch was created and retained acceptance was not reset. Separately
resolve duration evidence, Auth and recovery/operator/network gates before any
production authorization. Do not merge PR4 or deploy production from this report.

## Final dedicated hosted artifact

Deploy6abd3507530787bcad461764 is ready, branch-deploy context, on the dedicated
acceptance site. Artifact source d604a973cea0f524d5565caeec1db139b8c8c5df,
workingDiffSha256NULL,14 pinned handler hashes, isolated project/site/transport
verification PASS. The CLI exited422 after uploading; authenticated deployment API
confirmed ready with no error. No blind redeploy occurred. This is a CLI/API outcome
discrepancy, not evidence of a failed server-side deployment. Final CLOSED probes
returned503, unrelated profile200; after explicit bounded-lock reopen, fresh
journey200/13lessons, old application426 and old direct RPC426. Current isolated
maintenance flag is OPEN with schemaReady=true. Production remains unaffected.
