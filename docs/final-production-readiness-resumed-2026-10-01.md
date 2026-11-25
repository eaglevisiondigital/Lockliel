# Final production readiness review resumed, 2026-10-01

**Local follow-up, 2026-10-01:** See [verifier/duration report](verifier-duration-policy-2026-10-01.md).
The default-ACL verifier mismatch is corrected and rehearsed locally. The approved
strict duration policy fails on authoritative279. Its additive correction is only a
local disposable-tested proposal, so this five-stage release sequence remains BLOCKED.
Inventory PASS is separate from production population, which requires authorization.
Do not execute this historical279 plan as though the duration correction is included.

**FINAL PRODUCTION READINESS PACKAGE NOT READY**

Review only. No migration, push, merge, deployment, setting change, maintenance
activation, restore or content activation was performed. This report supersedes the
stale-PR portion of earlier reviews, not their original acceptance observations.

## Final candidate

- Remote development/PR4 HEAD: `eaff3fea36d4ce489009ebf2070071311619f9c2`.
- Application source included: `21ac4a5172a7dd7082b659d65533385e231892ef`.
- PR4 remains draft/open/unmerged; auto-merge disabled; main remains
  `1599ab271e0120a5cdc4e38e225ba749dd214721`.
- [Push CI36918693383](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36918693383)
  and [PR CI36918700481](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36918700481)
  still show success for the exact head. The preceding checkpoint records573JS,
  279 replay,16SQL,build/type/Netlify/configured lint and zero production dependency
  vulnerabilities. Those full totals were not rerun in this review.
- Local starting HEAD `ce21644cccd1776667503b24a5c9edc6a7aa992f` adds only the reviewed
  checkpoint documentation/evidence. Tree was clean. No unreviewed application
  commits follow the checkpoint; application21ac4a5 to eaff3fe is documentation only.
- No tracked generated acceptance artifact or environment/credential file was found.
  Isolated packaging/test tools and synthetic evidence are intentionally in the repo.
  Normal backend configuration remains production-bound with a public publishable key
  behind trusted deployment-context guards. This does not constitute a secret key or
  authorization to deploy an adapted isolated bundle.
- All279 file hashes freshly match the pinned manifest/source. Original274 are intact.
  [Exact preview](https://6abebc5dc0b59000076c25a5--lockliel.netlify.app) remains the
  checkpoint preview; its36 denials/16 static checks are retained checkpoint evidence,
  not newly repeated authenticated testing.

## Trusted durations: all13 provider values established, production not updated

See the complete [authoritative inventory](getting-a-grip-duration-inventory-2026-10-01.md),
including lesson/title,asset UUID,provider ID,current stored value,proposed seconds,
source/method and readiness. Every active video was independently fetched from its
official HTTPS YouTube watch page. The primary authority is YouTube's published
structured `meta itemprop=duration`, bound to the matching canonical video URL.
No browser playback timing or client getDuration value was used as sole authority.
No YouTube API key was requested. These are provider-published integer durations,
not a claim of frame-accurate source-file measurement.

All13 production durations and verification timestamps are NULL. The provenance
column is introduced by275 and is absent at274. Values remain proposals for a
separately authorized production configuration step. Dave does not need to supply
missing duration numbers for these IDs. If videos are replaced, repeat metadata
verification for each replacement. Five pages also contain player length fields one
second shorter than the published duration; retain the published value and do not
silently substitute a shorter threshold. Raw extracted values are retained.

Lessons11–13 still have no active video, each retains its protected PDF mapping, and
remain **Media Coming Soon**. No media was invented or assigned.

## Missing-duration behavior and its exact limit

At application21ac4a5, `netlify/lib/course-engine.mjs` requires positive duration,
verification timestamp and source. Missing any produces duration_pending and
**Lesson Being Prepared**. `lesson-player-client.tsx` disables Complete Lesson while
readiness is false. Missing videos produce Media Coming Soon, not a simple-model
fallback. Fresh focused guarded tests passed23/23 with OS outbound networking denied.

Migration275 `course_watch_met` rejects untrusted assets before new watch credit;
278 sampling returns zero percent when duration is missing. Sequential unlock checks
earlier watch gates, and save/completion rejects unmet watch/worksheet requirements.
The existing disposable `course_readiness_duration.sql` proves zero unknown-duration
percent, denied completion, denied member duration edits and the95% boundary. It
passed in the exact checkpoint's16SQL suite. Production has zero progress rows.

**The unconditional requirement cannot be marked PASS for every historical state.**
`course_watch_met` returns true early for an already persisted
watch_requirement_met_at. Completed lessons likewise retain prior unlock/history.
Thus a learner who earned credit before trusted metadata is removed can retain
advancement; the server save RPC relies on that watch result. The UI still blocks
completion while unready. This is a code-observed exception, not a live production
probe or new SQL reproduction. No new credit/false completion occurs in the tested
fresh-learner path, but the blanket no-advancement assertion needs a narrow regression
and decision about preserved earned history. Do not waive or silently change it.

## Auth remediation

**AUTH REMEDIATION: REQUIRES ACTION.** Fresh Security Advisor returns only the known
leaked-password warning. Dashboard Auth > Sign In / Providers > Email shows
**Prevent use of leaked passwords OFF**. Exact future action: separately authorize
turning only that switch ON and Save, then refresh the switch and Security Advisor.
This configuration can be enabled independently of course migrations.

Supabase rejects known compromised passwords on signup/password change. Existing
users can still sign in with their current password; weak-password information may
be returned. Enabling this control does not itself rewrite passwords or mandate a
mass reset. Existing sessions are expected to continue: this is a password-validation
control, separate from session revocation, not a production-tested toggle outcome.
No mandatory outage/reset notice is indicated; a brief password-safety explanation
and clear validation errors are useful. No member message was sent.
[Password guidance](https://supabase.com/docs/guides/auth/password-security),
[upstream sign-in behavior](https://github.com/supabase/auth/blob/master/internal/api/token.go).

Selected preserved controls: email/signup/confirmation ON; anonymous/manual linking
OFF; SMTP ON,smtp.resend.com:465,minimum interval60s. Credentials were not read,
requested, exported or changed. This is not a whole-settings fingerprint audit.

## Recovery, operator and direct network

Fresh project: Lockliel Platform,bsndfhbemstyrrglajat,us-east-1,ACTIVE_HEALTHY,
PostgreSQL17.6.1.166. Dashboard shows Small/t3a.small and enabled seven-day PITR.
Refreshed UTC recovery bounds: **2026-09-24 21:06:12 through2026-10-01 19:15:17**.
This does not reach a future cutover point. A lagging latest point can reflect an idle
database; it is not proof of failure or proof that a later release point is protected.
Reconfirm a new usable point immediately before freeze and after drain before275.
RPO <=2 minutes and planned maintenance <=30 minutes remain targets, not demonstrated
restore duration or a guaranteed recovery result. No restore or PITR/compute edit.
[Backup/PITR behavior](https://supabase.com/docs/guides/platform/backups).

- **OWNER MFA = PASS:** authenticated organization Team page shows Dave as YOU,
  Owner,MFA Enabled; Account Security lists two enrolled factors. No codes inspected.
- **RESTORE OPERATOR = REQUIRES ACTION:** Owner role has platform authority, but
  explicit designation/current factor availability and release-window availability
  have not yet been confirmed for this review. No restore was attempted.
- **RECOVERY ACCESS = PASS, read-only scope:** same Owner session can view PITR bounds
  and an enabled Start a restore control. Owner permissions are documented by
  [Supabase access control](https://supabase.com/docs/guides/platform/access-control).
  This verifies access, not a successful restore or measured recovery time.

Direct endpoint only: db.bsndfhbemstyrrglajat.supabase.co:5432. AAAA resolves
2600:1f18:38df:9500::eef4; route uses en0. TCP and CA/hostname-verified PostgreSQL TLS
handshake pass,TLS1.2,ECDHE-RSA-AES256-GCM-SHA384. No Session Pooler was used.
Mac did not expose the Wi-Fi name; hotspot identity remains awaiting confirmation.

Noninteractive libpq sslmode=verify-full reached authentication and stopped with
`fe_sendauth: no password supplied`. No password was requested, exposed or guessed.
Authentication,current_database/version,pg_stat_ssl and actual startup safeguards
on this direct session are **NOT VERIFIED**. The options requested read-only ON,
lock5s and statement30s. MCP separately observed postgres/PostgreSQL17.6/read-only
ON/5s/30s; that does not substitute for direct libpq proof. A qualified operator must
complete the approved direct check through private local input before release.

## Provider gate

**PROVIDER GATE = FAIL.** Official incident w91bvbjhqf0f remains identified,
resolved_at=NULL,API Gateway degraded. Latest update **2026-10-01 20:23:18 UTC**
reports significant improvement following a mitigation but continued investigation.
Checked20:36:57UTC. This is not resolved/stable authorization. Do not recommend
migration while it remains materially unresolved.
[Official incident](https://status.supabase.com/incidents/w91bvbjhqf0f).

## Fresh production preflight and new hard stop

Read-only transactions used BEGIN READ ONLY,5s lock/30s statement limits and rollback.
Production ledger versions exactly match the original274 prefix;275–279 are absent.
Selected columns,constraints,function definitions and column grants exactly match
the274 reference. All public tables have RLS enabled. The three targeted existing
functions are postgres-owned with empty search_path and postgres-only execution ACL.
Private notes and grading-key tables are not yet present, as expected before275.
Their final279 protections remain isolated/test evidence, not production assertions.

Two fresh activity samples at20:33:32 and20:34:30UTC show unchanged stats_reset and
course write counters,zero target locks/waiters/other transactions/transactions over
30s. This quiet interval does not substitute for the future maintenance drain.

**Current verifier refuses production's actual default ACL.**

- Captured postgres/public table defaults include service_role=`arwdDxtm`, with
  owner=`arwdDxtm`; no global table defaults. Six existing target tables also carry
  service_role=`arwdDxtm`.
- `notesCreationACL()` accepts only no service privileges,`Dxtm`,or`arwdDxt`.
  Evaluating it against the actual production catalog fails **Unreviewed default
  privileges**. A local hypothetical intermediate eight-privilege report also fails
  `assertPrivateNotesPrivileges()` with **Unknown intermediate service grants**.
- The difference includes PostgreSQL17 MAINTAIN (`m`), not an ignorable string.
  [PostgreSQL privilege definitions](https://www.postgresql.org/docs/17/ddl-priv.html).
- Policy/trigger differences from the disposable reference are exactly the five
  cutover_read_guard policies/five cutover_write_guard triggers not installed in
  production. Remaining policy/trigger rows match after explicitly excluding those
  operational objects for comparison only. No production normalization occurred.
- Migration279 already revokes all eight privileges from notes. That does not make
  unsupported intermediate verification safe. No migration edits are proposed.

The expected transition package cannot be sealed as production-ready with the
current verifier. Separate local review/rehearsal must cover the exact captured
default,maintain fail-closed handling for unknown grants and retain zero effective
service_role notes privileges at279. Do not alter production defaults to fit a test.
No new object collision is evident in the captured targeted baseline, but full
five-stage expected-state construction stops at the ACL gate and is not verified.

Before/after aggregate preservation:1 member/enrollment,1 course,13 lessons,
0 lesson/media progress,0 staff,3 Share Library assets,4 payment connections,
13 protected objects. Every lesson maps one active PDF to an existing object in
private lesson-assets. No private answers,notes,contact/payment data or protected
paths were exported. Full protected-row equality and every object byte remain
unverified; selected catalog/aggregate equality is not a full backup or data audit.

## Storage recovery

Database recovery restores Storage metadata, not object bytes. All13 PDF mappings
currently match, but independent object/version copies and an integrity/recovery
mapping remain future work. No Storage changes/downloads/restores were performed.
The recovery gate cannot be PASS merely because metadata exists.

## Final gate table

| Gate | Result | Evidence | Remaining action |
|---|---|---|---|
| A. Exact migrations275–279 | PASS | All279 hashes;274 exact live ledger | Rerun hashes at execution; verifier blocker below |
| B. PR4 candidate/CI | PASS | eaff3fe;both exact runs pass | Pin future approved release SHA |
| C. Isolated engine acceptance | PASS | Retained21ac4a5 hosted acceptance | Preserve limits; address missing-duration history exception |
| D. Trusted durations1–10 | REQUIRES ACTION |13 official provider values;all stored NULL | Approve compatible provenance-population order;strict gate regression |
| E. Lessons11–13 | PASS | No active video;approved Media Coming Soon | Keep pending;do not invent media |
| F. Leaked-password protection | REQUIRES ACTION | Switch OFF;Advisor warning | Separately enable/read back |
| G. Seven-day PITR | PASS | Enabled,Small,UTC bounds visible | Preserve configuration |
| H. Cutover recovery point | REQUIRES ACTION | Latest listed19:15:17UTC | Fresh usable point before freeze/after drain |
| I. Owner MFA | PASS | Owner,MFA Enabled,two factors | Confirm factor availability at release |
| J. Restore operator | REQUIRES ACTION | Owner authority established | Named operator/availability confirmation;recovery rehearsal |
| K. Direct IPv6 | PASS | DNS/route/TCP work | Confirm hotspot identity;repeat in window |
| L. TLS/auth/startup safeguards | NOT VERIFIED | TLS/hostname pass;no password supplied | Authenticated verify-full,pg_stat_ssl,read-only/5s/30s |
| M. Provider stability | FAIL | Incident identified/API Gateway degraded | Resolved plus stable window |
| N. Storage recovery | NOT VERIFIED |13 mappings;bytes not independently protected | Approved independent backup/recovery evidence |
| O. Maintenance/cutover | REQUIRES ACTION | Isolated procedure tested;production absent | Seal production operational chain and sequence adjustment |
| P. Legacy manual policy | REQUIRES ACTION | Policy accepted;old UX unchanged | Notify,save/copy,confirm ALL old tabs closed |
| Q. Rollback | REQUIRES ACTION | Strategy documented;PITR visible | Compatible pair/operator/point/object protection;no restore tested |
| R. Fresh production preflight | FAIL | Catalog read exposes unsupported arwdDxtm | Correct/rehearse local verification;repeat final direct preflight |
| S. Production preservation | PASS |274/main/Netlify/Sites25;read-only checks | Scoped evidence,not full-row checksum |

## Documentation and next recommended package

Only local evidence/continuity/report files changed. No application,SQL migration,
permission,release verifier or generated deployment artifact was modified. No push.
The companion [operator sequence](final-production-operator-sequence-2026-10-01.md)
records39 steps and rollback, with blockers explicitly preventing execution.

Smallest engineering action: a separately assigned local-only verifier correction
and disposable rehearsal for the captured production arwdDxtm default. Preserve all
279 migration bytes and the final zero-service-access requirement. Also resolve the
strict missing-duration/earned-history rule and approve the provenance ordering
before calling the production package complete. Provider resolution remains a hard
external gate; no production execution is authorized by these recommendations.

### Copy-and-paste follow-up

RECOMMENDED THINKING LEVEL: HIGH

CODEX TASK NEEDED

Review and minimally correct the local275–279 release verifier for production's
captured postgres/public service_role=arwdDxtm default. Reproduce the current two
fail-closed errors; derive exact intermediate expectations without dropping MAINTAIN
or allowing unrelated grants. Rehearse275–279 only in disposable PostgreSQL with
production egress blocked. Require final279 zero service_role table/column notes
privileges and unchanged279 migration hashes. Review the missing-duration cached
earned-credit exception with a targeted local regression and report the exact policy
decision needed; do not change earned-history policy by inference. No production
SQL/settings,hosted migrations,Auth/content writes,push,merge,deploy or cleanup.

CHAT DECISION NEEDED

The supplied release step8 populates complete trusted durations before275, but275
creates the provenance column. Recommended: approve/seal the13 provider values before
cutover, then populate complete duration/source records after verified279 while
maintenance remains ON and before release acceptance/reopening. Alternative: a
separately reviewed274-compatible prepopulation plus explicit post275 provenance
reconciliation. Neither action is authorized by this review. Also decide whether
already earned watch credit must remain usable after trusted metadata is withdrawn,
or whether advancement/completion must pause until configuration is restored. Keep
completed records and private data intact whichever policy is selected.

## Production preservation

Production remains274. Main1599ab2,Netlify published6abbb27a1cdd6d00081b0e8e and
ChatGPT Site active version25/August27 timestamp are unchanged. No production DB
write,migration,deployment,Auth/SMTP,payment/staff/settings change,Share Library
activation,production content change,PITR/compute edit,maintenance toggle or restore.
No real-member testing. Both isolated environments retained.
