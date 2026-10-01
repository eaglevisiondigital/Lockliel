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

Hosted application/resource/browser acceptance is pending at this implementation
checkpoint. Do not infer completion from local tests. Maintenance must remain ON.
