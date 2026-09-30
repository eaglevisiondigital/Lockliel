# Course engine completion result (2026-09-30)

## Completed local package

Started from development `ca5f09b85fee2689329b716b95d07e199746a6a2` plus local
checkpoint-documentation commit `0e89446`. Branch `lockliel-backend-v1`, draft PR #4.
Main baseline `1599ab271e0120a5cdc4e38e225ba749dd214721`. This assignment authorizes
one development checkpoint and preview verification, not production release.

The explicit follow-up resolves the prior policy decisions. Lessons 11–13 stay
media-required, without waiting for video assignments to finish engine architecture.
The same workspace shows Media Coming Soon, preserves worksheet/notes/resources,
permits an unlocked shell, and cannot grant fake completion or unlock the next lesson.
Missing duration uses Lesson Being Prepared; normal members see no configuration jargon.
Course overview keeps availability/progress/completion separate from readiness/locking.
No homepage, published site, branding or existing course content was redesigned.

Read-only production inventory: 13 lessons and protected resource mappings; 13 active
video assets across lessons 1–10, none on 11–13, all durations null. Questions remain
20 each in 1–4 and one existing reflection each in 5–13. No supplied expanded question
set or video IDs were invented. Approved video assignments and authoritative duration
values are external configuration still to be supplied.

## Engine, duration and persistence

Reused the existing shared workspace, save controller, canonical enrollment/content
reader, gates, private notes, protected resources and owner exports. Models A–D retain
SQL coverage. Getting a Grip remains A: Watch to Advance / Answer to Complete, 95%,
no score and optional notes. A database constraint prevents clearing/downgrading these
rules. Other models are reusable configuration paths; no new full model-editor or
manager-approval UI was requested or introduced.

Manual MFA course-manager verification accepts seconds and a descriptive authoritative
source. The database stamps verification time; the API confirms the persisted result.
Changing media identity clears timing. Existing verified timing is explicitly labeled
as existing configuration; trusted direct database setup has a distinct provenance.
No provider API integration or credentials were added. Missing timing, absent/unsupported
media and direct seek-to-end cannot establish watch completion. 94/95 boundaries and
durable achievement are covered in real disposable SQL. Bounded telemetry is not proof
of human attention. Use a new asset identity for material replacements requiring new
credit; do not erase durable progress without a separate reviewed policy.

Admin readiness reports media, duration, worksheet and protected-resource mapping gaps;
notes never enter this projection. The existing PDF importer remains explicitly disabled.
Member DTOs expose mapping booleans rather than storage paths. Historical course
publication inventory thresholds and stricter learner advancement readiness are distinct.

Autosave retains atomic owner/session/enrollment-gated RPCs, revision CAS, idempotent
lost-response retry, local account/lesson drafts, cloud-authoritative restoration,
visible failure/retry/conflict/offline states and unsynced navigation protection.
Malformed save acknowledgements now cannot display Saved. Account switching invalidates
in-memory and pending work; A/B drafts remain separate. Completed answers are immutable;
optional owner-only notes remain editable and exportable through explicit owner action.
Cross-device cloud restoration with real hosted Auth remains an acceptance test, not a
claim established by mocked transport.

## Database and security

Only the existing unapplied candidate `20260929215159_lockliel_course_engine_standard.sql`
was refined. SHA256 `2e03aa8a8346f46e09e701fbb96c29ac8cb11404100fe51c1cdedebdc6ab35f1`.
All 274 historical hashes match `supabase/verification/release-migrations.json`.
No second migration file, production execution or old release-runner reuse.

The new provenance column has only the required column-level INSERT/UPDATE privileges,
under existing active-session/MFA/course-role RLS. No broad table grant. Tests caught the
missing column grant during development and then verified authorized manager success
and member denial. Private grading keys add explicit RLS to existing privilege denial.
Configured course-family translations cannot use legacy media REST writes to forge
coverage. Missing required worksheets fail completion. Notes remain owner-only, absent
from ordinary/admin course views. Existing ownership/stale-save/forged-completion tests
remain in the full suite. The invitation fixture now declares the approved Grip rules.

## Local validation

- 547 JavaScript tests, zero failures.
- 275 authoritative migrations replayed in disposable PostgreSQL 17, TCP disabled.
- 13 SQL/RLS test files passed and rolled back, including the new duration/readiness file.
- Supported Webpack/static export and TypeScript passed.
- Netlify validation: 73 modules and 62 handlers.
- Configured tooling lint plus targeted changed-JavaScript-module lint passed.
- Production dependency audit: zero vulnerabilities; no dependency/lockfile changes.
- Original 274 hashes, diff whitespace and added credential-pattern checks passed.
- Builds/tests ran with production egress denied; no linked credentials or live fixtures.

Synthetic Chromium checks use only local static files, mocked APIs/provider and blocked
external traffic. Desktop 1365px, tablet 768px and mobile 390px pass without overflow;
minimize, keyboard focus, answer/notes save/reload, outage draft recovery/retry, A/B
restoration, 94/95 UI, completion, post-completion notes and sign-in return pass. Overview
and unlocked lesson 11 show pending media without next-lesson or completion access.
These are not hosted Auth, provider, real casting or physical mobile-keyboard acceptance.

## Hosted acceptance readiness and limits

`docs/course-engine-hosted-acceptance.md` contains exact environment prerequisites,
synthetic identity/content requirements, positive site/project identification, production
network denial, migration/hash checks and the complete acceptance matrix. No environment
was provisioned. Current ordinary previews remain intentionally production-backend
blocked. A separate isolated site/backend binding package is required before real hosted
Auth/PostgREST/RLS, cross-device persistence and physical device tests can run.

This is architecture ready for isolated acceptance, not approval to merge, apply 275 or
deploy production. The currently deployed persistence bug remains until a separate
migration/application release. Lessons 11–13 will still await approved media; current
videos await authoritative duration values. Getting a Grip Share Library remains inactive.

## Remote checkpoint and preview verified

One normal non-force development push carried documentation `0e89446` and implementation
`f11a97afb051f9c90b15faca95265698363cfaf1` from previous remote `ca5f09b`.
Remote development HEAD and draft PR #4 head match `f11a97a`; PR remains open against
main, unmerged, auto-merge disabled. No branch/tag other than development was pushed.
Post-checkpoint evidence is local only; no second push.

Both [push CI](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36688660239)
and [PR CI](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36688666885)
passed at this SHA. Their logs confirm 547 JavaScript tests, 275 replayed migrations,
13 SQL/RLS files, build/static export, TypeScript, Netlify validation, configured lint
and zero production dependency vulnerabilities. The unfiltered npm install audit still
reports 19 development-inclusive advisories (1 low, 5 moderate, 13 high); this is not a
claim of zero vulnerabilities across the development toolchain. No dependency cleanup.

[Deploy Preview #4](https://deploy-preview-4--lockliel.netlify.app):
`6abcc54b2ec109000875c2b6`, exact `f11a97afb051f9c90b15faca95265698363cfaf1`,
ready in deploy-preview context, no production publication timestamp. Sixteen static
route checks pass, including Getting a Grip copy/CTAs, overview/lesson shells and admin.
Thirty-six harmless GET/empty-POST checks return 503 `production_backend_disabled`,
no-store, no cookies or redirect. Admin content, journey/export and connected write
paths remain guarded. Nonproduction form detection is absent. No valid form/account,
real member data, payment, email, SMS or production write was tested.

The hosted preview proves static deployment and backend denial, not authenticated
course rendering or persistence. Pending-media/member responsive UX was verified with
local synthetic data only. Real provider playback/fullscreen/casting, physical keyboard
and hosted cross-device Auth remain in the isolated acceptance plan.

## Production preservation

Main remains `1599ab271e0120a5cdc4e38e225ba749dd214721`. Netlify production remains
`6abbb27a1cdd6d00081b0e8e`; both served homepage hashes match the before snapshot
`a184c485520cc5fa6bd5cee0b0e47cdaf46575e1e9794f9afa25743466cfbe00`.
ChatGPT Site is still active at version 25, last updated August 27, 2026.

Supabase remains 274 applied migrations, candidate 275 absent. Before/after staff,
course and lesson-asset fingerprints match. Public table count remains 56, zero public
RLS-disabled tables; policy, table/column ACL, function, trigger and event-trigger
fingerprints match. No production data writes, migration, Auth/SMTP/payment/staff/settings
changes, content activation or Share Library change were performed. Full Auth/SMTP and
payment dashboards were not independently fingerprinted; action scope and the inspected
preservation baselines are the evidence, not a delivery/payment test.

## Assessment and next recommended build

LOCKLIEL COURSE ENGINE COMPLETE AND READY FOR ISOLATED HOSTED ACCEPTANCE

The engine/readiness package and development checkpoint are complete. Production
migration/application release remains unauthorized and unverified. The smallest next
package is authorization and setup of the dedicated isolated acceptance project/site
and reviewed backend binding, followed by the exact synthetic hosted matrix in
`course-engine-hosted-acceptance.md`. Supply authoritative durations and approved
11–13 videos independently; do not waive their media requirements. Do not merge or
apply migration 275 as part of environment preparation.
