# Course engine reconciliation (development candidate, 2026-09-29)

Assignment baseline: local d915ae1, production main 1599ab2, 274 migrations.
This map is recorded before implementation. Production inspection is read-only.

The approved Champion Life Getting a Grip UX and finished engine behavior are the
reusable course standard for Lockliel, Champion Life, Global Propel and Revitalized
Academy unless explicitly overridden. Each retains branding, identity and permissions.
The supplied assignment and the complete Champion Life specification attached to
Lockliel MAIN CHAT #1 were read. Reference CSS/JS, overview and lessons 1–13 were
inspected. Only lessons 1–4 of that checkout use its newer shared course script;
the finished specification, rather than those older HTML differences, governs this
implementation. Champion Life is a reference checkout, not an edit target.

| Requirement | Existing Lockliel structure | Gap / intended reuse |
| --- | --- | --- |
| Courses/enrollment | courses, lessons, course_enrollments; canonical translations | Reuse, no parallel course tables |
| Worksheets | worksheet_schema and lesson_progress.worksheet_answers | Reuse content; add concurrency/version handling |
| Persistence | journey handler REST upserts | Identity columns included in conflict update despite column ACL; reproduce in disposable SQL, then use narrow writes |
| Media | lesson_assets, media_progress, canonical interval union | Reuse; null-duration percentages currently accept client claims; strengthen trusted evidence |
| Completion | DB validation and durable enrollment completion triggers | Reuse boundaries; distinguish advance and complete, configure rule model |
| Notes | No independent private lesson notes | Small learner-only storage, never staff-visible worksheet answers |
| Autosave | 800ms debounce, ignored HTTP failures | Identity-scoped resilient drafts, honest state, retries, CAS, navigation protection |
| Player | One existing React player for all lessons | Refactor into reusable two-column workspace, sticky/minimized media and worksheet |
| Resources | Protected lesson-resource endpoint and lesson_assets | Retain mappings and protected delivery; do not copy public Champion URLs |
| Overview/dashboard | Existing course projection/widgets | Reuse with advancement-aware continue/status |
| Admin | Explicit staff role/MFA gates, existing people progress | Extend only authorized course detail; notes excluded |
| Preview | Every connected function denies nonproduction | Preserve; hosted persistence acceptance needs isolated backend, never production bypass |

Verified production inventory: 13 lessons/PDF inventory previously recorded;
questions 1–4: 20 each; lessons 5–13: one existing reflection prompt each.
Ten lessons have active video assets (13 assets total); lessons 11–13 have none.
All video durations are null. Current lesson_progress row count is zero.
Live progress primary key is (profile_id, lesson_id); INSERT identity privileges
exist but UPDATE identity privileges do not. No member answers were read.

Getting a Grip: Watch to Advance, Answer to Complete, 95%, no score requirement.
No-video exceptions for lessons 11–13 require an explicit decision. Pending that,
do not silently waive watch requirements. Verified-duration acquisition and safe
preview persistence infrastructure must be identified before release acceptance.

## Implemented development candidate

Existing courses, lessons, enrollments, worksheet JSON, asset/resource delivery,
canonical translations, progress interval union and enrollment completion remain.
One new migration, `20260929215159_lockliel_course_engine_standard.sql`, adds
rule configuration, revision/snapshot fields, server-timed sampling, durable watch
achievement, private notes and private versioned grading keys. All 274 historical
hashes match `supabase/verification/release-migrations.json`. The migration is NOT
applied to production. Production has 274 applied; this branch has one pending
candidate. The old release package still refuses a 275-file working tree.

The reusable React workspace handles every lesson. Pure `course-engine.mjs` owns
presentation of trusted gates and export formatting. `autosave.mjs` centralizes
serialized writes, immediate account/lesson drafts, bounded retries, revision
conflicts, network state and account invalidation. Backend save RPCs use the caller's
Auth JWT and active session, never a service key. Private notes are a separate table
with owner-only SELECT and atomic owner-scoped RPC writes, no staff policy. Own-account
privacy exports include notes through existing bounded pagination; deletion cascades
from the existing lesson-progress lifecycle.

The autosave failure is reproduced by `course_persistence_regression.sql`:
PostgREST-style upsert updates profile_id/lesson_id despite missing UPDATE grants,
raising insufficient_privilege even for the first insert. The previous HTTP client
hid this failure. The new RPC performs a narrow mutable-column upsert and returns a
revision; the client checks HTTP status. CAS stops stale blank forms and completed
answer rewrites. A verbatim lost-response retry acknowledges the existing result.
This is a reproduced mechanism matching live ACLs and the deployed request shape,
not a claim that historical production request logs were recovered.

Model A: watch threshold unlocks subsequent lessons, required answers plus watch
complete the current lesson. Model B: private versioned answer keys plus configured
score and watch; no semantic/AI grading. Model C: worksheet/simple completion with
no video. Model D: completion requires a pre-existing manager approval. Models B–D
have isolated SQL coverage but no newly built manager configuration/review UI and
no production course activated. Future management must use explicit role/MFA gates.
Getting a Grip is A/95%, never an 80% score rule.

Sampling awards bounded intervals only when server elapsed time and playback
movement agree, within the active session. Client percentages/ranges are ignored.
Seeking straight to the end earns zero. Watch gates derive covered duration, with
durable achievement preserving advancement during replay. This is bounded telemetry,
not proof a human watched or DRM. Known trusted duration is needed for this stricter
percentage calculation; this is a disclosed gap against the earlier optional-duration
release policy, not a silently approved new content release requirement.

Questions and media identity/duration are snapshotted on first answer save. Completed
answers remain immutable and notes editable. Configuration changes are audited with
changed field names and hashes, without answer/note text. Existing enrollment and
completion attribution remains idempotent and never grants leadership. Autosave
keystrokes do not create audit events. Full learner activity-event history is not
newly implemented; existing progress timestamps and attribution remain the evidence.

## UI and privacy

Navy/blue/white two-column workspace, sticky media, mobile single column, minimize,
fullscreen request, provider Watch / Cast links, numbered worksheet, separate video
and answer progress, status/retry/conflict UI, optional private notes, protected
resources, completion/review/navigation and own-answer text export are implemented.
Casting support is provider/device-dependent and external playback may not report
progress. No insecure email action or completed-answer clear action was introduced.
Existing PDF/full-workbook assets remain data-driven, with protected delivery.

Overview and dashboard use first incomplete unlocked lesson, progress and latest
activity. Course managers (existing explicit roles/MFA) can see submitted completed
answers in existing person detail. Private notes are never queried by admin endpoints.
Future multi-course selection/catalog and manager configuration are not new modules
in this package. The existing journey selects the member's first enrollment.

Clean local drafts do not retain answer/note content after cloud acknowledgment.
Unsynced drafts are isolated by authenticated account and lesson and survive failure.
They are local browser storage, not encrypted secure storage against a device owner.
A newer cloud revision wins; the old draft remains available for manual recovery.
No anonymous draft replaces authenticated data.

## Validation and release limits

Local full guarded validation: 524 JavaScript tests, 275 fresh migrations and 12
SQL/RLS files; supported Webpack/static export, TypeScript, Netlify validation and
configured lint pass. Additional focused JS-module lint passes. Production dependency
audit: zero vulnerabilities, no dependency or hosting/workflow changes. Production
access was blocked during build/test/SQL validation; SQL uses disposable PostgreSQL17
with fixtures rolled back. Repository-wide lint was not expanded; existing TSX `any`
usage and unrelated React lint debt are not represented as a clean full-lint result.

Synthetic headless Chromium with mocked API and video provider verifies 1365/768/390
layouts without overflow, minimize, save/reload, outage/draft/retry, account A/B
isolation/restoration, 94/95 gate UI, completed review, post-completion notes and
signed-out redirect/synthetic sign-in return. These checks do not prove real provider
playback, physical mobile keyboard/casting or hosted Supabase/PostgREST persistence.
The independent SQL fixtures verify real PostgreSQL authorization and persistence.

Production visual source/assets remain recoverable at main `1599ab2`; development
baseline is `d915ae1`. No public-page redesign, published Sites change or production
frontend update occurred. The two-column member change requires visible review.

Release blockers: establish trusted duration handling compatible with the optional-
duration policy; resolve videos/watch behavior for lessons 11–13 without waiving the
95% rule by inference; provision/authorize an isolated backend for real Auth,
PostgREST, provider and cross-device acceptance. Existing production-only preview
guards must remain fail-closed. A deliberate material-version rewatch/reset operation
is designed as a separately authorized future management operation, not implemented
or silently applied to existing completions. Cosmetic edits do not erase completion.

Remote checkpoint evidence will be recorded after the authorized development push.
Until these gaps are resolved: LOCKLIEL COURSE ENGINE STANDARD NOT READY.
