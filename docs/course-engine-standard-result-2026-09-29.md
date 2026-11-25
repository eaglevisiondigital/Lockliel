# Course engine standard rebuild result

## Completed and remote state

Development implementation: `ca5f09b85fee2689329b716b95d07e199746a6a2` on
`lockliel-backend-v1`. One normal non-force push carried `c2ad20a` and `d915ae1`
(previous checkpoint/release documentation) plus the implementation from previous
remote `9a4129aeaafeaf43e15fc6df9f8d262b8a63ec3f`.

[Draft PR #4](https://github.com/eaglevisiondigital/Lockliel/pull/4) targets main,
remains unmerged, and has auto-merge disabled. PR #3 was already merged by the
separate earlier production-release assignment. No new main merge occurred here.
Remote development HEAD matches the implementation SHA. Post-checkpoint evidence
is local only; no second push was performed.

## Architecture reconciliation and Champion Life reference

Reused courses, lessons, enrollments, canonical/localized content, worksheet JSON,
asset mappings, protected resource delivery, interval union, progress, completion,
attribution and existing admin authorization. No duplicate course/enrollment system.
One new private-notes table and a private versioned grading-key table fill actual gaps.

Read the complete Champion Life finished specification from Lockliel MAIN CHAT #1,
its shared CSS/JS, overview and lessons 1–13. Older reference lessons differ from the
finished standard. Lockliel retains navy/blue/white branding, existing Auth/RLS and
protected resources. Champion Life source was not changed or copied wholesale.
See [reconciliation](course-engine-reconciliation.md) for the complete gap map.

## Persistence bug and fix

The old REST upsert attempted UPDATE of profile_id/lesson_id despite absent identity
column UPDATE grants. A PostgREST-equivalent SQL regression reproduced the failure
before the first row could be inserted. The UI swallowed HTTP/save failures.

The replacement RPC performs an atomic narrow upsert, checks authenticated identity,
active session, enrollment and progression, returns a revision, and stores notes
atomically. The client checks the response and shows failures. CAS prevents stale
blank overwrites; a lost-response retry with identical content acknowledges the same
result. Completed answers cannot be changed. This matches the deployed request shape
and observed live ACLs; historical production request logs were not recovered.
**The production bug is not fixed live until a separate migration/application release.**

## Engine, watch, autosave and notes

One shared workspace renders all lessons, with pure gate/export logic and a shared
save controller. Model A separates watch-based advancement from watch-plus-required-
answers completion. Getting a Grip is 95%, no scoring. Model B adds private configured
score checks; C supports no-video completion; D requires existing manager approval.
All four paths have SQL tests. No new admin rule-editor or approval UI was introduced.

Server elapsed time, active-session identity, bounded playback movement and existing
interval union govern credit. Browser percentages and intervals are ignored. 94% fails;
95% unlocks the next lesson even with an unfinished worksheet. Seeking to the end
fails; durable achievement survives replay/provider changes without erasing completion.
This bounds telemetry, not human attention. Current null durations are a release gap.

Cloud data is authoritative. Account/lesson drafts preserve unsynced work; clean local
copies omit answer/note content after acknowledgment. Debounced serialized saves,
visible Saved/Last Saved/offline/retry/conflict states and unload/navigation protection
are implemented. A newer cloud revision wins without silently deleting a conflict draft.
Identity changes clear rendered/in-memory state; server identity checks reject stale
account writes. Synthetic A/B and SQL ownership tests pass. Real hosted cross-device
Auth/PostgREST restore has not been tested.

Personal Notes are separate, optional, owner-only, autosaved and editable after lesson
completion. Staff/admin endpoints never query them. Own-account privacy exports include
notes; deletion follows the existing cascading progress lifecycle. Unsynced drafts use
browser storage, not encryption against a person controlling the device.

## UX, overview and admin

Implemented desktop sticky media plus worksheet, mobile collapse/minimize, fullscreen
request, provider Watch / Cast link, protected PDF/workbook/resources, numbered prompts,
Scripture fields where configured, separate video/answer progress, notes, completion,
review, navigation and owner-verified text export. Email My Answers and destructive
completed-answer clearing are absent. Real casting/fullscreen/provider behavior and
physical mobile keyboards remain device acceptance work, not synthetic-test claims.

Overview shows availability, locking and completion. Continue chooses the first
incomplete unlocked lesson; the dashboard shows progress, current lesson and activity.
Existing authorized course-manager person detail shows submitted completed answers.
Notes remain private. Participation/completion grants no staff or leadership authority.

Question/configuration/media identity snapshots preserve answered content. Configuration
changes produce audit events without responses or notes. Existing enrollment/completion
attribution remains idempotent. Full new activity history and an explicit material-version
rewatch/reset management action are not implemented. Cosmetic edits do not reset learners.

## Database and validation

New migration: `20260929215159_lockliel_course_engine_standard.sql`, generated by the
pinned local CLI, NOT applied to production. It adds rule/revision/snapshot/telemetry
fields, owner-only notes, private grading keys, guarded RPCs, restrictive configured-
course write policies and configuration audit triggers. All 274 original hashes match.
The historical 274-migration release runner remains fail-closed; its tests use a
separate verified historical source copy. Do not reuse it to release migration 275.

Both [push CI](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36639495780)
and [PR CI](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36639522262) passed:

- 524 JavaScript tests.
- 275 fresh migration replay; 12 SQL/RLS files, disposable PostgreSQL 17, rolled back.
- Supported Webpack/static export, TypeScript, Netlify validation and configured lint.
- Production dependency audit: zero vulnerabilities; no dependency changes.

Local checks match, with additional focused JS-module lint. No claim of clean full-repo
TSX lint; pre-existing any/React lint debt was not expanded into repository cleanup.
Build/tests had production network access blocked. Synthetic Chromium checks passed
1365/768/390 layouts without overflow, minimize, answer/note persistence, outage/retry,
A/B isolation/restoration, 94/95 UI, completion, editable notes and safe sign-in return.
API/video were mocked and external requests blocked. SQL independently tests real RLS.

## Deploy Preview

[Preview #4](https://deploy-preview-4--lockliel.netlify.app), deploy
`6abc3af1948f010008be427f`, is ready in **deploy-preview** context at exact
`ca5f09b85fee2689329b716b95d07e199746a6a2`, with no production publication timestamp.

Fourteen static routes passed, including Getting a Grip, overview, lesson and admin
shells. Approved invitation copy and signup/sign-in CTAs remain intact with no protected
storage exposure. Thirty-two unauthenticated GET/empty-POST probes returned 503
`production_backend_disabled`, no cookie/redirect, no-store. These include journey,
resource/export paths, account and form routes. Nonproduction form detection is absent.

Hosted authenticated persistence and complete workspace visual acceptance are **not
verified** because the preview intentionally cannot access production Supabase. No
bypass, real account, member data, valid form, payment, email or SMS test was used.
Local synthetic screenshots are review evidence only, not hosted integration proof.

## Production preservation and documentation

Main remains `1599ab271e0120a5cdc4e38e225ba749dd214721`. Netlify production remains
`6abbb27a1cdd6d00081b0e8e`; both public homepage hashes match the pre-task baseline.
ChatGPT Site remains active at latest version 25. Production Supabase remains 274
applied migrations with unchanged ledger/security and protected-content/configuration
fingerprints. The branch now contains one unapplied candidate, not a production migration.
No production DB write, deployment, main merge, Auth/SMTP/payment/settings change,
staff grant or Share Library activation was performed. Full Auth/SMTP settings were
not independently fingerprinted; no claim of testing delivery is made.

Updated AGENTS.md, CURRENT_BUILD_STATE.md, ARCHITECTURE.md, SECURITY_MODEL.md,
DECISIONS.md and the reconciliation document. The approved cross-platform course
standard and all current evidence/limits are recorded. Production source/assets remain
recoverable at main; neither published website was redesigned or overwritten.

## Assessment and next action

**LOCKLIEL COURSE ENGINE STANDARD NOT READY**

The development implementation and checkpoint pass. Production review is blocked by
missing trusted duration handling, missing videos for lessons 11–13, and absent isolated
hosted acceptance. Existing worksheets are preserved: lessons 1–4 have 20 prompts,
lessons 5–13 currently have one reflection prompt each. This is not a claim that all
thirteen worksheets match a newly supplied expanded question set.

Smallest next action: Primary Chat decides the content/telemetry policy and authorizes
an isolated acceptance environment. Do not merge or deploy this draft as-is.

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

Continue Lockliel from development commit ca5f09b and draft PR #4. The shared course
engine passes local/remote checks but remains undeployed. Decide these exact gaps:

1. All active videos currently have null stored duration. The stricter trusted
   percentage calculation needs authoritative timing. Prefer provider-verified timing
   while retaining 95%; alternatively specify an acceptable trusted approach compatible
   with the earlier optional-duration policy. Do not approve arbitrary client percent.
2. Lessons 11–13 have no video. Prefer supplying approved videos to preserve the
   permanent Watch to Advance rule. Any lesson-specific no-video exception must be
   explicit and requires reviewed per-lesson configuration; it is not implemented by
   silently changing the whole course to Model C.
3. Authorize a genuinely isolated nonproduction backend and synthetic Auth/PostgREST
   acceptance package, with no production credentials/data and no preview-guard bypass.

Return authoritative choices/content sources and the bounded next implementation or
Work validation assignment. Until then keep PR #4 draft, main and both published
sites unchanged, migration 275 unapplied, and production permissions/content unchanged.
