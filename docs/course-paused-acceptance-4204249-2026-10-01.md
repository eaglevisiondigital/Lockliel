# Isolated candidate deployment result

**ISOLATED CANDIDATE FAILED PAUSED ACCEPTANCE**

The authorized exact candidate was deployed successfully. Isolation, authentication,
MFA and write denial checks passed. The requested course reads while paused did not:
the existing maintenance gate intentionally blocks those reads. It was not loosened.
No post-reopen behavior or full course functionality is claimed.

## Deployment and exact source

- Application source: `4204249345513d9f871f3abeffb706a3bde3caaa`.
- Development lineage: `lockliel-backend-v1`. The exact source was built in a detached
  checkout at `/private/tmp/lockliel-paused-4204249`; no tracked source edits.
- Local evidence parent before this assignment: `8cf5f5a`. It was NOT substituted as
  the application source. Existing dependencies were supplied through a temporary
  node_modules symlink, outside the uploaded artifact.
- Site: `70b03a42-6329-476e-bf4b-2b1ce30e9567`, jade-unicorn-642f40.
- Deploy: `6abe71ba8466df3ae65d138a`, ready, **branch-deploy**, branch/alias rehearsal.
- [Isolated application](https://rehearsal--jade-unicorn-642f40.netlify.app).
- [Deploy record](https://app.netlify.com/projects/jade-unicorn-642f40/deploys/6abe71ba8466df3ae65d138a).

Manual Netlify deployment returns commit_ref=null. The commit above is verified
through the exact detached source, recorded configuration-only packager identity,
nine bundled-handler hashes and byte-for-byte comparisons of four served HTML pages
against the packaged files. It is not represented as a Git-built Netlify commit.
Old deploy6abd778184898338b60d32b2 and the earlier prepared0cfcf405 artifact are
retained. The prior source mismatch is explicitly resolved by Dave's new assignment.

The first CLI invocation rejected incompatible --context/--no-build flags before
upload. The successful invocation used the existing rehearsal alias without any
production flag; the resulting context was independently verified. A broad local
scanner initially flagged CONTEXT/NODE_ENV references. Inspection confirmed these
only control existing Secure-cookie behavior, not backend selection. The corrected
strict scan passed. No production credential or environment override was used.

## Backend binding

The bundled immutable configuration points exclusively to
`https://qjksggxorghaxvpyslip.supabase.co`, the matching publishable key and the exact
isolated origin/site. Configuration data, not business logic, is replaced by the
reviewed packager. An outbound fetch wrapper allows only that Supabase origin and
rejects redirects, userinfo and other origins. The artifact contains nine scoped
handlers. No production Supabase URL/key, service credential, SMTP/payment/Blobs
transport or production external data service was found. No environment secrets
are consumed by those handlers. Ordinary production-backend guards remain intact.

All nine bundled handlers rejected four wrong-site/context invocations each:
36 denials, zero network calls under OS egress denial. Existing focused tests cover
wrong backend/origin/key bindings and spoofed context headers. These are deterministic
artifact tests, not a claim that clients can change trusted Netlify context.
Actual synthetic auth token issuers all matched the isolated Supabase project and
subjects matched their designated identities; manager reached AAL2.

Public static assets have no production backend/URL references or protected storage
URLs. Generic framework documentation links, social links and player-library URLs
remain code references, not production backend bindings. Protected storage access
exists only in the server resource handler and was not exposed in the static HTML.

## Readiness and authentication

Final independently read status:

```json
{"paused":true,"protocol":"278-v1","schemaReady":true}
```

The database remains279. Direct read-only checks used TLS verify-full/TLS1.3,
PostgreSQL17.11, read-only transactions, lock_timeout5s and statement_timeout30s.
No migration, readiness/control update or maintenance exit occurred.

| Identity | Hosted result |
| --- | --- |
| User A | Fresh Chrome sign-in, session200, My Lockliel and course route resolve |
| User B | Separate in-app browser sign-in, session200, same safe paused view |
| Manager | Browser password login requires existing TOTP; challenge succeeds; admin shell appears |
| Manager security | API AAL1 denied403; existing-factor verification200/AAL2; no new factor/role |
| Anonymous | Journey401 and readiness401 |

Browser A was signed out before the manager browser session. Separate HTTP sessions
were used for controlled API checks. Credentials/cookies/TOTP secrets are kept only
in protected local files and are not in evidence or this report. Only existing
synthetic identities were used; no new account, role or Auth setting was created.

## Paused course acceptance

| Requirement | Actual result |
| --- | --- |
| My Lockliel | Authenticated shell renders; personal guidance is unavailable because its handler is omitted from the narrow artifact |
| Course overview | Static heading/branding and clear maintenance message render; authenticated journey returns503 |
| Lesson1 | Static route200; UI shows Lesson Unavailable plus maintenance message |
| Lesson list/state/cards/resources | Not readable while paused; cannot mark passed |
| Manager course configuration | AAL2 reaches authorized shell, but content endpoint returns503 |
| Other admin panels | Several remain loading/unavailable because their handlers are not included |
| Worksheet/notes/media/progression/completion/advancement | Six bounded requests to the new app endpoint return503/course_maintenance |
| Legacy progress/media/completion and media RPC | Valid direct requests return503/PT503 |
| False Saved / accidental autosave | Fresh paused views have no editable controls and no Saved claim |
| Retry behavior | Fresh paused view remained stable; no course-error storm observed. This is not a full network trace or proof of unavailable old-client retry behavior |

All new application write requests were sent to the deployed journey endpoint with
synthetic identity/payloads and the existing protocol header. They were rejected
before processing. The progression/advancement labels exercise the shared endpoint
gate, not post-reopen progression semantics. Since no editor/player mounts, actual
browser typing/playback/next-button interactions were unavailable. That limitation
is distinct from the HTTP-level denial checks and is not hidden as a UI pass.

Two probe mistakes are retained and explicitly excluded from product failure counts:
a legacy request used a nonexistent notes column and returned400/PGRST204; and a
request to /my-lockliel/admin/content returned404 because that panel lives inside
/my-lockliel/admin. The actual admin HTML was independently verified200 and matched
the artifact. The invalid request made no data change. The real acceptance failure
is blocked reads and incomplete route support, not these invalid probes.

No curriculum changes were made. Watch to Advance / Answer to Complete, lessons
11–13 Media Coming Soon, and missing-duration Lesson Being Prepared were not shown
in a loaded course while paused, so their hosted display was NOT re-verified. The
unchanged course/configuration digests preserve the synthetic baseline.

## No-write and security evidence

Before/after read-only row counts and full-row digests match for all seven tables:
courses1, lessons13, lesson_assets40, course_enrollments2, lesson_progress1,
media_progress0 and lesson_private_notes0. This proves those course/configuration
rows were unchanged through the bounded checks. Isolated authentication naturally
created/refreshed sessions; the no-write claim is scoped to course data, not Auth logs.

User A/B each received zero rows when requesting the other's profile and403 for
admin-person access. Notes queries by A, B and manager all returned maintenance503;
this proves no exposure while paused, not post-reopen owner-note RLS behavior.
Read-only privilege checks confirmed zero service_role notes privileges, zero PUBLIC
private-data grants, no anon readiness EXECUTE, postgres readiness ownership and no
authenticated/service_role control UPDATE privilege. Prior disposable tests prove
replacement/control denials. No hosted destructive privilege probe was attempted.

The maintenance hook/control were not modified. Successful schema readiness does
not confer readiness mutation authority or permission to change paused.

## Stale client and responsive evidence

No deliberately retained isolated old-client tab was present in browser inventory.
Production tabs were left untouched. No old memory-only draft was recreated or
claimed recoverable. Legacy HTTP denial is not old-browser retry proof; the prior
original media retry limitation remains. Preserve the approved copy/save drafts,
close every old course tab, confirm closure, then use a fresh post-release tab policy.

The course maintenance view was visually inspected at1440×1000 desktop,768×1024
tablet and390×844 mobile. Document scrollWidth equaled viewport width at each size;
no horizontal overflow. Lockliel dark styling and readable maintenance text remained.
Course cards and lesson workspace could not be checked because the read gate blocks
them. The browser viewport override was reset after testing.

Screenshots in the evidence directory:
- `paused-4204249-desktop.png`
- `paused-4204249-tablet.png`
- `paused-4204249-mobile.png`
- `paused-4204249-manager.png`

## Validation and preservation

Exact-source supported Webpack/static build passed with external network denied;
9 focused maintenance/binding JS tests passed. Four served pages matched local HTML
SHA256 values, all returned200 with noindex headers and an isolated-only connect-src
CSP. Root302 redirects to the isolated journey. Artifact checks passed36 denials.
No full279 replay was repeated, as requested. No implementation change was made.

PR4 and remote CI checks were not repeated after the completed preliminary package:
last inspected PR4 is draft/open/unmerged at3a7b7b9 with both CI runs successful.
That remote CI does not cover the unpushed4204249 binding/tooling lineage; local
validation and the exact artifact checks above are the applicable newer evidence.
No push or merge occurred in this assignment.

No production command, DB write/migration/deployment, Auth/SMTP/PITR change,
payment/staff/settings/content change or Share Library activation occurred. Neither
published website was modified. Production was not queried: its last verified
baseline remains274/main1599ab2, Netlify6abbb27a1cdd6d00081b0e8e and ChatGPT Site25.
These are prior verified identities plus this assignment's explicit no-change record,
not a fresh external-state audit. Both isolated projects and acceptance sites remain.

All new evidence is under `docs/evidence/course-release-review-2026-10-01/paused-4204249-*`.
The pinned source checkout, previous artifact and existing deploys are retained.

## Smallest corrective package for Primary Chat

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

The deployed exact candidate and current maintenance design block course reads,
contrary to this assignment's read-while-paused acceptance requirement. Approve a
narrow follow-up that defines the permitted paused read model, then implements only
that read path and the required isolated read-only handler coverage. Keep all course
write gates, private-note ownership, manager/MFA boundaries, protocol checks and
production isolation intact. Do not broadly remove restrictive RLS or bypass the
maintenance hook. Package a newly pinned candidate and repeat paused acceptance on
this same retained site/project. Maintain paused=true throughout. No migration,
permission/hook adjustment or new deployment is implicit in this failed acceptance;
include any required change explicitly in the next scoped assignment.

Also decide whether unavailable non-course dashboard/admin panels are outside the
acceptance shell or require their narrowly scoped read handlers. Do not enable
payment, email, production Blobs or unrelated administration to fill the shell.

Do not authorize maintenance exit or post-reopen saves yet. No full course function,
old retry recovery or post-reopen A/B/94–95 behavior has been established here.
