# Isolated post-reopen course acceptance, October 1, 2026

## Result and authorization

ISOLATED POST-REOPEN COURSE ACCEPTANCE FAILED

Maintenance exit succeeded. Substantial course functionality passes, but the full
requested acceptance has fixture, visual and coverage gaps described below. No new
candidate or schema correction was substituted during this assignment.

The original assignment named4204249 while identifying the paused-read deploy from
406c169. Execution stopped before mutation. Dave then explicitly authorized exact
`406c1691aee11311783ef83a7e970c6a4d5acd13` with all original restrictions retained.
Local starting HEAD was documentation commit `ef4ca45ae4136ba40b81aba30a4bd62b6332fd31`.
The application source was unchanged throughout this assignment.

- Supabase: `qjksggxorghaxvpyslip`, branch `course-cutover-rehearsal-274`.
- Site: `70b03a42-6329-476e-bf4b-2b1ce30e9567`.
- Existing deploy: `6abe7a6b1490c08d003640dd`, ready, branch-deploy/rehearsal.
- [Isolated course](https://rehearsal--jade-unicorn-642f40.netlify.app/my-lockliel/journey).
- No new deployment, Git push or merge.

## Pre-exit checks

Direct DNS returned IPv6; actual server connection was IPv6 and TLS1.3 with
sslmode=verify-full using the retained trusted CA. Authentication succeeded.
Read-only checks observed transaction_read_only=on, lock_timeout=5s and
statement_timeout=30s, PostgreSQL17.11. No Session Pooler was used.

Management branch inspection confirmed the exact non-default isolated branch healthy.
The279-entry ledger, including statement digests, matches the recorded applied279
catalog. All279 local migration file hashes match the authoritative release manifest;
275–279 exact SHA256 values are included in post-reopen-preflight.json.
Readiness was paused=true/schemaReady=true/protocol278-v1. Private-note effective
service_role privileges remained zero, including column grants; grading-key privileges
and postconditions passed. Permanent policies, course catalog/data and maintenance
helper hash matched the prior verified paused snapshot. All three expected synthetic
Auth users and profiles existed. No new account was created.

Netlify returned the expected ready deploy and source-labelled title. Manual
commit_ref remains null; exact source evidence combines the retained clean artifact
identity, nine handler hashes, pinned isolated binding, and fresh byte equality for
four served HTML pages. The existing artifact's outbound guard and CSP remain pinned
to the isolated backend. Production source/configuration was not substituted.

## Maintenance exit and final control state

At2026-10-01T15:55:37.955Z the direct isolated operator transaction changed only
`lockliel_cutover.control.paused` from true to false. It locked the control table,
required the exact ready279 state, and verified readiness before commit. An immediate
separate read confirmed:

```json
{"paused": false, "protocol": "278-v1", "schemaReady": true}
```

No RLS, grants, migration ledger, course configuration, staff role, Auth/SMTP setting,
payment or Share Library setting changed. Maintenance remains OFF as instructed.
Keep this isolated environment open for follow-up; do not reclose or delete it
implicitly. This is not permission to open or release production.

## Fresh clients, workspace and persistence

Fresh sign-ins used only retained synthetic accounts. Chrome's prior session was
signed out and its prior acceptance tab closed; a new Chrome tab was opened. The
in-app browser used a separate cookie/storage context. These were fresh application
sessions in separate browser profiles, not a claimed new pristine Chrome profile.
No direct localStorage manipulation or browser script transport was used.

| Check | Result |
| --- | --- |
| A and B overview |13 lessons, separate progress, proper Continue Course targets, no maintenance notice. A initially in progress; B initially had no progress. |
| Lesson workspace | Desktop media left/worksheet right, sticky media computed style, question/watch progress, notes, save state, resources and navigation present. |
| Responsive |1440/768/390 widths have no horizontal overflow and two editable text areas before completion. Mobile minimize changes to Expand Video and restores successfully. |
| Initial autosave | Both learners' synthetic answer and note reached cloud Saved. Fixture contains one worksheet question, so multiple distinct questions were not available; answer revisions were exercised. |
| Navigation/refresh | A navigation away/back and reload restored answer/note. B reload restored its separate work. |
| Logout/login | A signed out, B signed into the same Chrome browser, then A returned. B never displayed A's answers/notes/drafts; A's work remained intact. |
| Cross-context | A first signed into the independent in-app browser after Chrome work. Answer, note and95% watch state restored from cloud. Final completed answer/note also restored there after refresh. |
| Completion | B completed through the actual browser after watch achievement. Answer became review-only, notes remained editable and saved afterward. A completed after95% and recovered saving. |
| Idempotency | Two further authenticated B completion requests kept the original completed_at timestamp. Final database has one progress row per learner/lesson, not duplicate completions. |

The dashboard's separate next-step guidance remains unavailable because that handler
is intentionally excluded from this acceptance artifact. The My Journey navigation
works. The paused-only course-card fallback is absent once open. No unrelated
administration handlers were enabled to hide this limitation.

Visual limitation: worksheet footer explanatory text/headings are white on a pale
background in saved screenshots and have poor contrast. Earlier Chrome captures
showed an incomplete embedded YouTube thumbnail; the final in-app browser capture
renders the player normally. Actual B playback was separately observed and recorded
progress. Do not describe the visual acceptance as flawless.
No redesign or CSS correction was applied under this exact-candidate assignment.

## Save failure, conflict recovery and retry limits

A controlled hosted stale-revision failure was tested in two independent contexts:

1. Both A contexts loaded the same cloud revision.
2. The second context saved a new private note.
3. The stale first context tried another note save.
4. The UI showed Cloud Sync Needed and a newer-cloud-work message, retained the
   local draft, disabled Retry and editing, and did not falsely claim cloud Saved.
5. Reload preserved the rejected draft. The expanded View Unsynced Draft displayed
   it while the current cloud fields showed the newer second-context note.
6. Read-only cloud inspection confirmed the stale note had not overwritten cloud.
7. Keep Draft and Use Cloud Work restored editing while archiving the draft.
8. A subsequent answer/note edit saved successfully; completion then succeeded.

This proves real hosted conflict handling and recovery, not network-loss recovery.
No tab-scoped offline control was available through the supported browser API. Native
Chrome discovery did not expose the isolated automation tab as a safe target for a
network override; no device-wide connectivity change was attempted. A controlled
hosted disconnect/reconnect, bounded retry timing and recovery after connectivity
returns remain UNVERIFIED. Local injected failure/offline/retry tests passed, but
are explicitly not substituted for the missing hosted test.

## Watch, progression and media-pending lessons

Two distinct evidence paths were exercised:

- B: actual embedded YouTube playback recorded continuous intervals from0 to99.72,
  established a durable watch achievement, enabled next lesson and permitted browser
  completion after the worksheet was answered.
- A: authenticated synthetic media samples used actual elapsed wall-clock waits,
  unchanged server clocks and the existing100s fixture. No direct progress seeding.
  Exact90% and94% left lesson2 locked. Exact95% unlocked lesson2 while lesson1 and
  its empty worksheet remained in progress. Empty-worksheet completion was rejected.
  A shorter replay kept95% and the durable unlock. The earlier synthetic answer was
  restored afterward, before browser completion.

An initial seek directly to100 seconds with forged percent fields earned0 credit.
The handler ignores supplied percentages; the server accepted only interval evidence.
No score was required. Completion remained separate from watch-based advancement.

Fixture limitation: the server's pre-existing trusted synthetic duration is100 seconds,
while the actual demo YouTube video displays22:24. Continuing beyond101 seconds causes
media samples to fail with a save error. The current client eventually showed Reload
Course after its bounded failures; there was no claim of a clean full-video run.
These100-second threshold tests do not establish the accuracy of real teaching
video durations. No duration/course configuration was changed during this assignment.

Lessons11–13 remain Media Coming Soon/locked in learner overview and explicitly
configuration-pending in manager content. Forged completion attempts for all three
returned403. No fake video, fallback model or successful unavailable-lesson completion.

## Manager, security and stale client

The synthetic manager completed fresh browser MFA and reached AAL2. Content reads
return200 and the course-management shell renders. No management form was submitted.
Before MFA, content access returned403. Ordinary learners receive403 on manager routes.

The existing synthetic manager has only `content_admin`. The learner-detail handler
requires a ministry role such as `discipleship_admin` and returns403 Person record
access required. Therefore learner enrollment/current lesson/watch/worksheet/last
activity visibility is NOT verified for an authorized course manager. This is an
acceptance identity mismatch, not authorization to broaden content_admin permissions.
No staff role was added or changed. Manager direct private-note reads return no rows.

Hosted A/B cross-user reads for progress, notes, media and enrollment return zero rows.
Anonymous course access returns401. Wrong-owner application writes return409.
Effective service-role note table/column privileges remain zero; grading keys stay
protected. Learners have no control-table UPDATE and anonymous has no readiness
EXECUTE. Final catalog equals pre-exit catalog, including RLS and grants.

Legacy application writes without the current protocol return426/course_reload_required.
Direct old save/media RPC and direct progress PATCH return426/PT426. No incompatible
old write succeeded. No original1599ab2 browser tab was retained in the isolated
context, so its actual retry UX is NOT passed. Same-version cross-context stale
revision handling was tested as described above and is a separate result.

Retain the production copy-and-close policy: copy unsaved answers/notes, close ALL
old course tabs and confirm closure before cutover, then reopen fresh tabs. No
recovery of original memory-only drafts is promised.

## Validation, database evidence and preservation

Fresh local validation:71 focused JavaScript tests pass with OS network denial and
the repository network guard. Hosted authenticated RLS checks and direct read-only
SQL catalog/privilege/postcondition/data checks pass except the stated manager test.
No migration/schema/code changed, so the entire279 replay and build/type/lint were
not rerun. Previous573 JS/279 replay/16 SQL/build/type/Netlify/configured lint evidence
remains historical validation of this unchanged candidate, not fresh totals.

Final279 catalog/ledger and course/lesson/asset hashes match pre-exit; Storage digest
is unchanged. Synthetic learner progress, answer revisions, private notes, watch
intervals and completion were intentionally written through the course application.
Synthetic Auth sessions/MFA were used. This assignment does NOT claim zero isolated
writes. No direct fixture SQL writes, destructive probes, migrations or schema updates.

Production remains the carried-forward verified baseline: database274,
main1599ab271e0120a5cdc4e38e225ba749dd214721, Netlify production
6abbb27a1cdd6d00081b0e8e and ChatGPT Site v25. No fresh production audit was performed.
No production DB write/migration/deploy, Auth/SMTP/PITR/payment/staff/settings change,
Share Library activation, or production content configuration change occurred.
No main or PR4 merge, push, new deploy or isolated infrastructure cleanup occurred.
Both qjksggxorghaxvpyslip and jxtgtfffdiwzxocxoqxk and their sites are retained.

Evidence: `docs/evidence/course-release-review-2026-10-01/post-reopen-*`.
The manager test's false result is retained; it is not filtered out of the evidence.
Credentials, cookies, MFA secrets and the client's IPv6 address are excluded.

## Smallest recommended corrective package

Authorize only an isolated acceptance-fixture and verification follow-up:

1. Explicitly approve an existing/new synthetic course-manager identity with the
   minimum appropriate existing role, or supply an already authorized identity.
   Do not weaken handler/RLS boundaries or change production staff.
2. Align the isolated synthetic video and trusted duration so normal playback does
   not exceed the fixture's declared length. Preserve production content.
3. Correct only the worksheet footer contrast, with visible review. Any application
   change needs a newly identified/approved candidate before replacing406c169.
4. Run hosted tab-scoped network failure/recovery and rerun affected manager/media/UI
   checks. Retain the actual-old-tab limitation unless it can genuinely be tested.

Keep maintenance open on this isolated project for follow-up. Do not proceed to
production release readiness or broaden into other features before closing these gaps.
