# Isolated paused read-only course correction

Scope: the October 1 assignment approves safe reads while paused on isolated
qjksggxorghaxvpyslip and site70b03a42 only. Production is excluded. No maintenance
exit, repository migration, push, main merge, unrelated handler expansion or cleanup.

## Reviewed implementation

The journey GET uses a separate readiness check requiring exact279 readiness,
protocol278-v1 and the pinned isolated binding when paused. POST retains its existing
maintenance denial. The learner loader reads the caller's enrollment, published
canonical/translated course, lesson structure, own progress metadata, active assets,
own media metadata and the existing stable current-user course-gates RPC. It never
loads private notes, saved worksheet answers or saved content snapshots while paused.
Raw protected storage paths stay server-side. Grading keys remain in app_private.

The paused lesson shell never instantiates autosave, reads private local drafts or
mounts telemetry players. It disables worksheet/completion controls, omits private
notes and exports, and labels maintenance clearly. Dashboard fallback uses the same
journey read for a course card, adding no unrelated backend handler. Manager content
reads retain staff/MFA checks; paused mutations are denied and storage locations are
removed. The paused manager view has no content mutation forms.

## Narrow operational correction

Inspection proved the app-only correction insufficient: five temporary restrictive
read policies and the PostgREST maintenance hook also rejected all course reads.
`supabase/verification/course-release-279/maintenance-safe-reads.sql` is an isolated
operational update, not a migration. It pins the prior hook hash and requires the
exact ready279 paused state. It keeps the hook installed and all permanent RLS,
readiness, ledger and write guard definitions unchanged.

Only authenticated active-session GET/HEAD on six exact course tables and GET/HEAD/
POST on the existing stable course-gates RPC receive a read exception. Unknown RPCs,
notes endpoints and every course mutation stay closed. Restrictive table guards
continue to reject unrelated embedded paths. Published-only/active-only checks are
added during pause; enrollment/progress remain caller-only. A new restrictive notes
policy blocks indirect embedded note reads, including the owner during maintenance.
Two additional write triggers close indirect enrollment and private-note mutations.
No permission is added to any course/private-data table. The new invoker-only helper
has no anonymous/service execution grant or authority to change maintenance.

## Local validation and limits

Supported build and guarded JavaScript suite:573 passed. TypeScript, Netlify module
validation and targeted backend/test/tooling lint passed. A disposable279 replay,
16 SQL/RLS files and operational readiness/paused-read fixtures pass. Replaying279
was necessary here because a database maintenance-layer change was introduced; no
hosted migration is involved. Existing migration bytes remain unchanged.

Initial SQL fixture attempts stopped on existing shape, parent-row and save-rate
constraints. Corrected setup now reaches the intended maintenance denials. These
were disposable setup errors, not successful hosted writes. Standalone lint of the
four TSX files exposes existing broad lint debt; this package does not claim those
files or repository-wide lint are clean. No unrelated lint cleanup was performed.

Hosted application/resource/browser acceptance subsequently passed as recorded below.
Maintenance remains ON. This is not post-reopen progression/completion acceptance.

## Protected resource correction

Hosted inspection found that Storage1.77.5 performs object.get_authenticated_info
before storage.object.get_authenticated. The narrow helper now admits exactly these
two read operations under the same active session/readiness requirements. It does
not admit listing, signing, upload, update, delete or public reads. Permanent Storage
policies and grants are untouched. This follows the documented operation helpers:
[Supabase Storage operation helpers](https://supabase.com/docs/guides/storage/schema/helper-functions).

The two hash-guarded operational follow-ups are maintenance-safe-resource-read.sql
and maintenance-safe-resource-info.sql. Both are separately validated in the same
disposable fixture. The initial HTTP502 was a closed Storage metadata preflight,
not a missing resource:13 mappings/objects and an isolated privileged HEAD proved
existence; subsequent learner GETs return200/application/pdf. The HEAD used only the
existing isolated server credential in a local diagnostic; no service credential is
in the application artifact or notes access path. No fixture/file was uploaded.

Fresh A/B resource reads, embedded-note denial and direct save503 passed. A's API
session was explicitly refreshed after browser sign-out invalidated the prior one;
an intermediate401 was not mistaken for a resource regression. An initial invalid
profiles-to-notes embedded relation returned400; the actual progress-to-notes relation
was then checked and returned no notes for either learner. These intermediate probes
are excluded from acceptance pass counts.

The final UI labels the worksheet as structure only, with saved answers hidden,
rather than displaying a misleading zero-answer count during maintenance.


## Exact final deployment and evidence

- Application source: `406c1691aee11311783ef83a7e970c6a4d5acd13` on
  `lockliel-backend-v1`; initial implementation232fa6f, followed by the resource
  operational correction and final worksheet wording in406c169.
- Isolated site: `70b03a42-6329-476e-bf4b-2b1ce30e9567`.
- Deploy: `6abe7a6b1490c08d003640dd`, ready, branch-deploy/rehearsal.
- [Isolated course](https://rehearsal--jade-unicorn-642f40.netlify.app/my-lockliel/journey).
- [Netlify deploy record](https://app.netlify.com/projects/jade-unicorn-642f40/deploys/6abe7a6b1490c08d003640dd).
- Backend: only `qjksggxorghaxvpyslip`, migration ledger279.

Manual Netlify deploy commit_ref is null. Identity is established through the clean
source commit, artifact identity, nine handler hashes, Netlify deployment record and
four served HTML byte matches. The broader HTTP matrix was captured on232fa6f;
all nine final406c169 handler hashes are identical. Final source received a fresh
browser login, all responsive checks and an additional journey/PDF/archived-resource
smoke. Final deployment is not a production deploy and no Git push was performed.

Evidence is retained under `docs/evidence/course-release-review-2026-10-01/paused-read-*`:
HTTP matrix, final smoke, resource checks, security checks, before/after snapshots,
artifact/deploy/static identity, migration comparison, validation logs, responsive
metrics and screenshots. Credentials, sessions and MFA secrets are excluded.

## Hosted acceptance results

| Area | Verified result |
| --- | --- |
| User A | Fresh login, dashboard card, course overview,13 lessons, own in-progress lesson1 and paused lesson shell. One existing progress record. |
| User B | Separate login/browser,13 lessons, lesson1 Available, zero progress. No A profile/progress/media/enrollment rows. |
| Manager | Existing MFA reaches AAL2; AAL1 content request403, AAL2 read200. Read-only course configuration has no mutation form or private notes; mutation503. Learners receive403. |
| Lesson1 | Title/metadata, worksheet structure and maintenance notice visible. Saved answers hidden, notes unavailable, zero enabled answer controls and zero media players. Completion disabled. |
| Lessons11–13 | Overview shows Media Coming Soon and Locked. Required-media rules retained. Their workspaces were not opened through a gate bypass; no invented video or Model C fallback. |
| Protected resources | Existing handler streams synthetic PDF to A and B:200/application/pdf,630 bytes, private/no-store. No raw Storage URL exposed. Anonymous401; archived resource404. |
| Private notes | No owner/other-user/manager note body in paused responses. Direct notes503; actual progress-to-notes embedded reads contain no notes. Service-role table and column privileges remain false. |
| Writes | Worksheet, notes, media, progression, completion, advancement and manager mutation503/course_maintenance. Legacy direct write paths and media/save RPCs503/PT503. Disposable SQL proves enrollment/course and indirect write denials too. |
| Other security | A/B cross-user rows empty; anonymous course/readiness denied; grading keys not readable by authenticated/service roles. Learner cannot update control.36 wrong-site/context handler denials with zero transport calls. |
| Responsive | Final dashboard, overview and lesson1 at1440/768/390: no horizontal overflow, maintenance visible, styling retained. Lesson has zero editable controls/players at each width. Screenshots retained. |
| Unrelated admin | Payments, email, Blobs, staff and unrelated admin handlers remain excluded. Their existing unavailable panels were not expanded. |

## Stale clients and scope limits

A retained232fa6f User B browser remained a safe paused overview after the final406c169
publication, with13 lessons and no editable course fields. Legacy direct writes
remain denied. The new paused view does not instantiate autosave, local private-draft
hydration or a media player, so it does not start their mutation/retry loops.

No original1599ab2 tab existed for this assignment. Its known old media retry UX has
NOT been proven fixed or newly passed. Direct endpoint denials prove server protection,
not that old browser behavior. No complete network trace or memory-only draft recovery
is claimed. Preserve the approved policy: copy unsaved answers/notes, close ALL old
course tabs, confirm closure, then reopen a fresh tab after an authorized cutover.

This pass is scoped to the current isolated paused read-only model. It does not prove
post-reopen autosave,94/95 watch thresholds, Watch to Advance, Answer to Complete or
a full production transition. Synthetic fixtures and PDFs are not production teaching.

## Final preservation and operational record

Final read-only catalog/data snapshot confirms279 with paused=true, schemaReady=true,
protocol278-v1. Before/after full-row digests match for courses, lessons, lesson_assets,
course_enrollments, lesson_progress, media_progress and lesson_private_notes. Permanent
policy definitions, migration ledger, readiness function, write guard and hook binding
match their pre-change values. Storage object rows match digest
`00658ec09acc86a75b9eff715fa587af` after authenticated PDF requests.

Temporary maintenance helper final definition hash:
`6db2a5cea39b88cf56e5aa83e93f8205`. Authorized operational SQL SHA256 values:

- maintenance-safe-reads.sql: `5cb8ba998f27891cfd581073398c1ecb240df9c088a7253f793ed57ce0ce6902`
- maintenance-safe-resource-read.sql: `5d5d0f08a5b0489ff1b93646bb97477fa1140a17310eb458ba2a2ce404c3a84e`
- maintenance-safe-resource-info.sql: `2c8bfbad3b333e11d5f3814d2804ec4f4ef53629dc5617a4f22cf9d9b06579c6`

No course data changed. Synthetic login/MFA necessarily created/refreshed isolated Auth
sessions; the zero-write claim applies to course data, not Auth session bookkeeping.
No repository migration was created/applied; all279 file hashes match4204249. Both
isolated projects and sites, previous deployments and prepared artifacts are retained.

Production was not contacted or changed by this assignment. Prior verified baseline
remains database274, main1599ab271e0120a5cdc4e38e225ba749dd214721, production Netlify
6abbb27a1cdd6d00081b0e8e and ChatGPT Site version25. These are carried-forward evidence,
not a new live production audit. No production DB write/migration/deploy, Auth/SMTP,
PITR, payment/staff/settings, Share Library activation or production content change.
No push, main merge, PR4 merge, maintenance exit or infrastructure deletion.

## Assessment and next assignment

ISOLATED PAUSED READ-ONLY COURSE ACCEPTANCE PASSED

Recommend a separate scoped authorization for isolated maintenance exit followed by
full fresh-client post-reopen acceptance, including autosave/conflict handling,
private-note ownership, actual media thresholds and completion. Recheck exact279
readiness and isolated binding first. Do not infer authority to reopen, push, merge,
deploy production or change production settings from this report.
