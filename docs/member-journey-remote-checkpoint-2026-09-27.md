# Member Journey remote checkpoint

Verified September 27, 2026 UTC. **MEMBER JOURNEY REMOTE CHECKPOINT VERIFIED**.
This checkpoint covers a development push, remote CI, representative preview
denial checks and read-only preservation evidence. It is not a production release
or successful authenticated integration test.

## Exact local and remote state

Initial branch was `lockliel-backend-v1`, with a clean tree/index and expected
origin `https://github.com/eaglevisiondigital/Lockliel.git`. Local HEAD and exact
Member Journey implementation commit:
`cc6f430a1e03ba55a44774e8ade8fa05edec4617`.

The remote development branch began at
`b2adf96e988380c36e3b3b0275f7b866067e078c`. Exactly three expected local commits
were ahead and were preserved and pushed in order:

| Commit | Description |
| --- | --- |
| f03fb3207bcd631a315fc2f304eaba9854ec56bd | Record controlled development push and remote verification |
| fc78dcea390df434c7378da58566e35cf88f4bf5 | Prepare and rehearse controlled migration release |
| cc6f430a1e03ba55a44774e8ade8fa05edec4617 | Guide the member journey with private next steps |

Inspected range contained the expected 37 files across documentation, release
preparation and Member Journey implementation. All 274 migration hashes matched
the committed release manifest before and after the push. No unexpected files,
migration edits, dependency changes, hosting-manifest changes, workflow edits or
preview-guard changes were present. The release scripts do not run automatically
as deployment commands in CI/build. The configured SQL tests use a disposable
cluster, never a linked project.

One normal non-force push used the explicit refspec
`refs/heads/lockliel-backend-v1:refs/heads/lockliel-backend-v1`, with automatic tag
following disabled. Remote HEAD now equals the implementation SHA above. No main
push, merge, rebase, history rewrite, manual deploy or second push occurred.

Main remained `77d1d1918793bc6a25f38721e882f3d011903bad`; the two other remote
branches also remained unchanged. [PR #3](https://github.com/eaglevisiondigital/Lockliel/pull/3)
is open, unmerged, from development to main, with head `cc6f430` and auto-merge
disabled. These are inspected ref/PR states, not a claim of branch-protection rules.

## GitHub CI evidence

Both `Lockliel Preview Check` runs identify exact head `cc6f430` and succeeded:

| Trigger | Run | Build job | SQL job |
| --- | --- | --- | --- |
| push | [36315118426](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36315118426) | 108608260742 | 108608260725 |
| pull_request | [36315120777](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36315120777) | 108608266516 | 108608266349 |

Inspected logs confirm, in each run:

- 411 tests, 411 passed, zero failures, with the configured Node network guard.
- Webpack build/static export and TypeScript completed successfully.
- Netlify validation: 68 modules and 61 imported handlers.
- Configured `lint:tooling` passed; no repository-wide lint cleanup was attempted.
- 274 authoritative migrations replayed from zero in disposable PostgreSQL 17,
  TCP disabled; eight SQL/RLS files passed and fixtures rolled back.
- Production dependency audit found zero vulnerabilities. The full installation
  still reports the known 19 findings (1 low, 5 moderate, 13 high). No dependency
  repair was performed or implied by the narrower production audit.

Build setup logs list Contents, Metadata and Packages read permissions. Expected
Actions installation/cache/reporting activity occurred. The workflow has no
production migration or publication step. Netlify redirect/header checks passed;
its pages-changed check is neutral. Only the expected Actions/Netlify checks appeared.

## Netlify preview identity and behavior

[Deploy 6ab8fab5b738c40008b06835](https://app.netlify.com/projects/lockliel/deploys/6ab8fab5b738c40008b06835)
is ready, created `2026-09-27T11:15:01.633Z`:

- Commit: `cc6f430a1e03ba55a44774e8ade8fa05edec4617`.
- Context `deploy-preview`, branch `lockliel-backend-v1`, review 3.
- `published_at` is null; it is not the production publication.
- [PR preview URL](https://deploy-preview-3--lockliel.netlify.app).
- Deployment summary: 60 serverless functions, one edge function, four redirect
  rules and three header rules. All are ready with no reported deployment error.

The preview alias can change on future pushes. The deploy ID and exact commit
were checked before and after the probes; this checkpoint identifies that deploy.

Seventeen requests returned 503 with `production_backend_disabled`, `no-store`,
no Set-Cookie and no redirect. Requests had no cookies, authorization, personal
data, valid referral code or form name. POST bodies were empty. Redirect following
was disabled, with immediate stop on mismatch. No browser JavaScript executed.

| Method | Paths |
| --- | --- |
| GET | `/api/lockliel-auth/session`, `/.netlify/functions/lockliel-session` |
| GET | `/api/lockliel/next-step`, `/.netlify/functions/lockliel-next-step` |
| GET | `/api/lockliel/onboarding` |
| POST | `/api/lockliel/onboarding`, `/.netlify/functions/lockliel-onboarding` |
| GET | `/r/invalid_referral`, `/api/faith-boost/access`, `/who-god-says-you-are/reader/chapter.pdf` |
| POST | `/api/lockliel-auth/signup`, `/api/faith-boost/signup`, `/api/book-release` |
| POST | `/thank-you`, `/__founders50.html`, `/__faith-boost-book.html`, `/__heart-book-release.html` |

Seven static page GETs returned 200: homepage, Founders 50, three detection-form
pages, My Lockliel and onboarding. The five public form pages retained their forms
without Netlify detection attributes. Connected features remain intentionally
blocked. The edge response alone does not prove independent execution of an inner
serverless guard; exact deployed source plus CI's handler-guard tests complement
the HTTP evidence. No guard was disabled or bypassed to test another layer.

## Production preservation

### Netlify and main

Before/after production deploy remains `6ab3f0887cb1200008eb8e9f`, ready,
production/main, source `77d1d1918793bc6a25f38721e882f3d011903bad`, published
`2026-09-23T15:31:06.733Z`. The newest deployment is the expected preview, with
no intervening production deploy in the recent listing.

Both `https://lockliel.com` and `https://lockliel.netlify.app` returned unchanged
129,775-byte homepages, SHA-256
`2960679d8a5548ed57bbfc1a8c4e9daac241c80c450c99e022599758efee754d`.
This is deployment/content-hash preservation, not a complete asset-by-asset audit.

### Supabase

Read-only transactions against `bsndfhbemstyrrglajat` before/after confirm:

- ACTIVE_HEALTHY and the same project/database metadata.
- 272 applied migrations; identical ledger version/name/body fingerprint
  `a15f30ed2e1e323fa63147eea5dbde0f`. Both pending migrations remain unapplied.
- Zero profiles and Auth users in both captures.
- Identical RLS/table ACL, column ACL, policy and public/app_private function
  fingerprints. Policies/table security include public, app_private, Auth and
  Storage; column ACL comparison includes public/app_private.
- Identical insert/update/delete counters for all 93 inspected tables across
  public, app_private, Auth and Storage.
- Identical five Edge Function versions, hashes and update metadata:
  track-referral 4, submit-founders50 11, capture-lead 5, import-grip-pdfs 6,
  process-account-deletion 2. No function was invoked or redeployed.

No database write, schema/ledger mutation, permission change, fixture, user account
operation, payment/SMTP/configuration request or production migration was executed.
These aggregates corroborate preservation during the observation window. They do
not constitute a row-by-row backup, all management-settings audit, or certification
of unrelated third-party activity. Existing Owner MFA/recovery gates are unchanged.

### Original ChatGPT Site

Read-only connector checks show the same active project
`appgprj_6a904a70bcb48191b19a10b74adcf5d0`, saved version 25, source SHA
`bf6dc15ed6c6e86abdbc44a7cf8983de7d8b880f` and original live URL. Source archive
remains 46 files/41,861,120 bytes with hash
`sha256:04a57390915138c4891cb3f77a9f95876c6da344f2254ed78aa526ab50ab0455`.
Publication `appgdep_6a90b9a9b6b88191beacfe0de959b4ba` remains succeeded, last
updated `2026-08-27T22:28:57.199363+00:00`, environment revision 0. Site update
time, access mode and access revision also match. No source archive, access token
or credentials were saved in this report. No site edit, save or publication ran.

## Outcome, limits and next scope

**MEMBER JOURNEY REMOTE CHECKPOINT VERIFIED**: the exact development commit is
remote, both CI runs passed, the exact preview passed representative denial
checks, and the inspected production baselines match. No production deployment,
DB write, migration, settings/permission change, main merge or real-data test ran.

After verification, only continuity/report documentation was updated locally.
That evidence commit is not part of the single push and remains unpushed. No
feature, workflow, dependency, migration or release-runner change occurred here.

Authenticated preview journeys still require an isolated backend. Durable UI
telemetry, dependency findings and broader launch/recovery work remain separate.
The next My Five / Share Center package was not started. Await another assignment.
