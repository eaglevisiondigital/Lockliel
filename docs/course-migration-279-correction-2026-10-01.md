# Migration 275 security correction result

**MIGRATION 279 SECURITY CORRECTION READY FOR HOSTED REHEARSAL**

Local correction, full validation and disposable five-stage rehearsal are complete.
Hosted execution has NOT started: automatic approval review rejected the first276
command as ambiguous authorization for advancing the retained branch. The command
was not executed. Request explicit confirmation for276→277→278→279 on
qjksggxorghaxvpyslip. Keep it275/maintenance ON until then. No production action.

## Current275 and intended security

Read-only direct IPv6/TLS verify-full checks confirmed exactly275, schemaReady=false,
paused=true and unchanged notes ACLs. Connections were authenticated, read-only,
lock_timeout5s and statement_timeout30s. No Session Pooler. Notes owner is postgres;
authenticated has owner/current-active-session SELECT; PUBLIC/anon have no grants;
service_role retains only the known Dxtm table privileges. No extra column grants
or other-role table grants were present. RLS and the sole owner SELECT policy remain
unchanged. Manager access is not an exception to owner privacy.

Notes saves use the learner bearer token through the journey handler, then the
postgres-owned SECURITY DEFINER RPC with explicit identity/session/enrollment,
lesson access and revision checks. Direct learner reads use RLS. No service-role
privilege is required for application saves, reads, export or related owner-executed
cascades. The privileged RPC's explicit authorization, not RLS on its owner writes,
enforces the save boundary. Private grading keys remain protected.

## Verifier correction

The original broader service_role expectation came from disposable platform
defaults, not an application requirement. Hosted Dxtm still contained unnecessary
TRUNCATE authority, demonstrated in disposable tests. The new catalog records
creator defaults and derives the new notes ACL exactly; it rejects unknown global
defaults or extra grants instead of accepting any observed ACL. Read-only
reclassification of the retained275 succeeded as
INTERMEDIATE_VERIFIED_CLOSED_PENDING279. It did not grant final security approval.

Known inherited service grants are allowed only during closed275–278 stages in
this expressly ordered correction package. The final279 semantic check forbids
all service_role notes table/column privileges and continues to reject extra
PUBLIC/anon/member-write/grading-key grants. Catalog/policy/owner/function drift
still yields UNKNOWN_STOP. No RLS policy or application guard was weakened.

## Migration279

File: `20261001133500_lockliel_private_notes_service_privileges.sql`.

SHA256: `5fbcf6d942583ea2e79cb2ae356f6ee712314fe749fb97130e9a21e962c10f71`.

Created with pinned Supabase CLI migration-new and committed at
a2254aaa3890e2aff7c51b9c84c45021a7b7ba20. The only SQL operation is:

```sql
revoke select, insert, update, delete, truncate, references, trigger, maintain
on table public.lesson_private_notes
from service_role;
```

TRUNCATE removes unnecessary table-wide deletion authority. REFERENCES, TRIGGER
and MAINTAIN remove unused relationship/trigger/maintenance capabilities. CRUD
revocations also remove broader inherited grants where present; they are harmless
where already absent. None is required by the approved RPC path. No other role,
object, data, RLS, policy, index, column, function or course/media behavior changes.

## Tests and integrity

| Check | Result |
| --- | --- |
| Full JavaScript suite | PASS,564 tests |
| Fresh disposable replay | PASS,279 migrations |
| All SQL/RLS tests | PASS,16 files |
| Original1–278 hashes | PASS,unchanged |
| All279 source hashes | PASS,pinned manifest and Git source |
| Own learner notes/RPC | PASS after279 |
| Other learner/manager/anonymous | PASS,private notes denied |
| Active session/identity/enrollment | Existing suite plus focused denial tests pass |
| Service-role TRUNCATE | Pre279 defect reproduced; post279 operation denied |
| Other service privileges | Zero effective table/column privileges required |
| Policies/RLS/function integrity | Preserved; exact disposable279 catalog delta only notes ACL |
| Missing-grant revocation | Repeating actual279 in a rolled-back fixture is harmless |
| Webpack/static build,TypeScript,Netlify | PASS |
| Configured and changed-tooling lint | PASS |
| Production dependency audit | PASS,zero vulnerabilities |
| Five-stage pinned CLI/TLS/failure rehearsal | PASS,disposable only |

The full local validation ran with OS network egress blocked; SQL uses sanitized
environment and disposable socket-only PostgreSQL17. Separate staged CLI rehearsal
permits only localhost TLS and verifies OS external-network denial. No production
fixtures or real-data tests. Focused correction tests model both hosted Dxtm and
broader disposable defaults, applying275,276,277,278 then actual279 in order.

The first staged test exposed PostgreSQL's additive per-schema ACL representation,
which may omit the owner entry. The derivation was corrected without accepting
unreviewed grants, and the full five-stage rehearsal passed afterward. Initial
and final tests never changed a hosted database.

## Release package and hosted boundary

The current manifest, catalog/reference snapshots and maintenance SQL are in
`supabase/verification/course-release-279/`. Canonical versions only, no aliases.
The historical278 package remains for evidence. Read `course-release-279-runbook.md`.

Sealed stages are prepared at `/private/tmp/lockliel-hosted279-stages`.
The retained branch has already applied275; the prepared next stage is276.
CLI plan must have exactly one pending file, no seeds/roles/Vault, and read-only
verification after each stage. Maintenance remains ON on every failure or ambiguity.
No candidate deployment or maintenance exit has occurred or is implied.

The new installation template requires279 and clean notes privileges before
schemaReady. Existing retained hosted maintenance still uses the older278 status
definition, kept unchanged here. A reviewed isolated readiness-function update is
needed before a later candidate/reopen acceptance package. Full old-app→new-app
hosted acceptance remains unverified. Both isolated branches/sites are retained.

## Old autosave

The original schema274 upsert403 requires UPDATE on protected profile_id/lesson_id.
It is not caused by275. Existing tests retain the reproduction. No identity-column
grant, compatibility bridge or legacy frontend change was made. Release remains
old app→pause/drain→275–279→new candidate→fresh client→explicit maintenance exit.
The approved copy-and-close rule and original-client retry limitation remain.

## Production and remote preservation

Production remains274;279 is not applied there. Main remains1599ab2, production
Netlify remains6abbb27a1cdd6d00081b0e8e, and ChatGPT Site remainsv25. No production
DB write/migration/deploy, Auth/SMTP, settings/permissions, payment/staff/content
change or Share Library activation occurred. Settings were not exhaustively diffed;
these claims describe actions taken and the recorded identity checks.

No development push was needed for local/schema-package validation. PR4 stays draft,
open and unmerged; remote development remains3a7b7b9. Local commits preserve the
correction and validated tooling. No cleanup was performed.

## Exact approval needed next

Confirm: Apply only repository migrations276,277,278 and279, in that order, to
isolated project qjksggxorghaxvpyslip using the validated pinned five-stage runner.
Do not replay275. Verify each stage read-only and stop on ambiguity. Keep maintenance
ON. Do not deploy a candidate, reopen, alter the other isolated branch, touch
production, merge, push or delete resources in that execution.

Automatic approval review rejected migration276 because it interpreted the latest
assignment as authorizing correction creation/testing without sufficiently explicit
permission to advance the retained hosted branch, which is costly to reverse.
No workaround or indirect execution was attempted.
