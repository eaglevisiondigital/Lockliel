# Isolated course engine acceptance result

## Outcome

LOCKLIEL COURSE ENGINE FAILED ISOLATED HOSTED ACCEPTANCE

Acceptance is blocked before authenticated tests, not a demonstrated course-engine
failure. The newly created branch inherited enabled custom Resend SMTP and requires
email confirmation. No signup, email send, synthetic user or authenticated test was
attempted. A confirmation request is pending to disable custom SMTP and email
confirmation on this temporary branch only. Browser automation requires confirmation
at action time before reducing an authentication protection. No response is approval.
Alternatively, supply a separate test-mail sink and preserve email confirmation.

## Environment and database completed

- Branch: `course-engine-acceptance`, branch ID `fe1a83bb-02a8-4113-b93a-973b307d4621`.
- Project: `jxtgtfffdiwzxocxoqxk`; parent: `bsndfhbemstyrrglajat`.
- Branch API: `ACTIVE_HEALTHY`, `FUNCTIONS_DEPLOYED`, `with_data=false`, non-default.
- Initial Auth users/profiles: zero. Thirteen migrated lessons and one course existed;
  storage objects were empty. No production member data was copied or imported.
- Initial 274 migration versions exactly matched the repository historical manifest.
  All 274 file SHA256 values remain unchanged.
- Applied only the exact candidate SQL from
  `20260929215159_lockliel_course_engine_standard.sql` to the isolated project.
  Candidate SHA256: `2e03aa8a8346f46e09e701fbb96c29ac8cb11404100fe51c1cdedebdc6ab35f1`.
- The Supabase migration tool assigned isolated ledger version **20260930083553**,
  name `lockliel_course_engine_standard`. This corresponds to repository candidate
  **20260929215159**, not a new repository migration. Count is now 275. Do not rerun it
  or rename/rewrite historical files to conceal the isolated ledger mapping.
- Public RLS-disabled table count: zero. Owner-only notes SELECT policy verified;
  private grading RLS enabled and no authenticated SELECT grant. No direct member
  note INSERT/UPDATE, no broad asset UPDATE grant. The duration-source column has
  the intended narrow privilege under existing staff/MFA RLS.
- Save/sample/gates RPCs have empty search paths, deny anonymous EXECUTE and permit
  authenticated invocation through their identity/enrollment/session checks.
- Real anonymous PostgREST probes: notes and gates denied with 401/42501; grading-key
  relation unavailable through public API (404). This does not substitute for A/B tests.
- Final isolated counts: Auth users 0; lesson_progress 0; media_progress 0; notes 0.

## Dedicated runtime prepared

[Temporary acceptance site](https://acceptance--lockliel-course-acceptance-jxtgtfff.netlify.app)
uses new Netlify site `60579b8e-d0ca-4ac1-abe5-7128f4243e8b`.
Current deploy `6abccc4fb3d7af33941fefbb` is a nonproduction branch-deploy, ready,
with no publication timestamp. It is a manual artifact based on implementation
`f11a97afb051f9c90b15faca95265698363cfaf1`, not a Git-bound deployment with commit_ref.

`scripts/acceptance/prepare-runtime.mjs` bundles a small allowlisted set of existing
handlers with a separate compiled acceptance-only binding. The application source,
production core and ordinary preview guards are unchanged. The artifact pins both
site and isolated backend identity; rejects production context and all other sites;
uses only the isolated publishable key; rejects redirects and every outbound fetch
origin except the isolated project. It contains no production Supabase URL/key,
service credential, live Blobs dependency, payment or email-service transport.
Only member static pages and compiled assets are served, with noindex and an explicit
isolated-environment header. No production site variables or repository hosting
manifest were modified.

The artifact verifier proves site/context checks, forged-header denial, production,
email and other-origin network rejection. Hosted anonymous session and journey return
401 with the isolated identifier; the static journey loads. Signup is absent (404)
until email isolation is approved and verified. A superseded initial test deploy with
signup was removed; no signup was invoked. The Supabase branch and current acceptance
site remain available. No Git push or main merge occurred.

## Acceptance matrix still pending

| Area | Result |
| --- | --- |
| User A/B/manager signup, login, MFA, signout, session/return flow | Not run; no test users created |
| Cloud autosave, refresh, navigation, logout/login, retry/offline/conflict | Not run against hosted authenticated runtime |
| A/B answers, notes, progress, local drafts, stale delayed writes | Not run hosted |
| Notes owner/admin privacy, export, post-completion edit | Schema/ACL inspected; hosted tests pending |
| 94/95 watch, seek-to-end, durable threshold and intervals | Local SQL passes; hosted authenticated telemetry pending |
| Advancement versus completion and optional notes/no score | Local tests pass; hosted acceptance pending |
| Lessons 11–13 pending media, shells/resources and no fallback | Prior local coverage retained; hosted authenticated UX pending |
| Overview statuses/progress/Continue Course | Hosted check pending; new requested last-active fallback must be verified explicitly |
| Manager learner/enrollment/progress and MFA boundaries | Hosted check pending |
| Real A/B RLS, forged writes/completion and protected storage | Anonymous denial verified; authenticated checks pending |
| Desktop/tablet/390px/minimize/fullscreen/keyboard | No new authenticated hosted visual pass claimed |
| AirPlay/Chromecast/physical keyboard | Manual device acceptance pending |
| Independent second-context cloud restoration | Not run |
| Database rows/revisions/idempotency/contamination | No synthetic rows yet; no success claim |

## Validation and preservation

Required local validation rerun: 547 JavaScript tests, 275 fresh migration replay,
13 SQL/RLS files, TypeScript, supported build/static export, Netlify validation and
configured lint passed with production egress denied. Isolated artifact security
checks and targeted script lint passed. Production dependency audit found zero
vulnerabilities. No dependency or historical migration changes.

Production remains 274, candidate absent. Main remains
`1599ab271e0120a5cdc4e38e225ba749dd214721`; remote development remains `f11a97a`.
Netlify production remains `6abbb27a1cdd6d00081b0e8e` with preserved homepage hashes.
ChatGPT Site remains active version 25. No production database write, Auth/SMTP,
payment, staff, permissions/settings change, Share Library activation, merge or
production deployment was performed. Full provider settings were not independently
fingerprinted; absence of our changes is distinct from proving no third-party activity.

## Smallest next action

Resolve the branch-only email isolation confirmation, then verify that branch signup
cannot use inherited production SMTP. Re-enable only the isolated signup handler,
seed synthetic A/B/MFA-manager identities and private test resources, and run the
existing hosted matrix. Do not apply the candidate again, merge the Supabase branch,
merge PR4, push Git, or deploy production. Keep the temporary branch for follow-up.
