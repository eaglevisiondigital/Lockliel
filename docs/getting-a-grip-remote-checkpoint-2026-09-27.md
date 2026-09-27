# Getting a Grip remote checkpoint

Verified 2026-09-27 UTC. **GETTING A GRIP REMOTE CHECKPOINT VERIFIED**.
Development checkpoint only. Production content activation is not authorized.

## Controlled push and remote state

Initial branch `lockliel-backend-v1` was clean at implementation
`48a9e10640ae430638d9921917209a023774bdc2`. Live remote was
`9eee9ee50cd6a21e0dde804b00725d17d6d31f93`. The two expected commits ahead were:

- `559639baf90aa60e8dac3423d78fa599b135b789`: prior My Five checkpoint evidence.
- `48a9e10640ae430638d9921917209a023774bdc2`: approved Getting a Grip invitation.

Reviewed range: 17 files, 618 additions, eight deletions. No unexpected worktree or
index changes. All 274 migration hashes verified unchanged; dependencies,
workflows, hosting manifest and release-preparation files were unchanged.

One normal non-force push used the explicit development-to-development refspec
with tag following disabled. Remote HEAD equals the implementation SHA above.
Before/after/final remote refs show only that branch changed. Main remains
`77d1d1918793bc6a25f38721e882f3d011903bad`; other branches and tags are unchanged.
PR #3 remains open, unmerged, targeting main, at the expected head; auto-merge is
disabled. No second push, history rewrite, merge or production deployment ran.

## GitHub CI

Both `Lockliel Preview Check` workflows passed at exact head `48a9e106`:

| Trigger | Run | Build job | SQL job |
| --- | --- | --- | --- |
| push | [36326233510](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36326233510) | 108639420066 | 108639419949 |
| pull_request | [36326236139](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36326236139) | 108639428222 | 108639428307 |

Inspected logs in both runs confirm 456 JS tests passed, zero failures, 274
migration fresh replay, 10 SQL/RLS files passed and rolled back, webpack/static
export including `/getting-a-grip`, TypeScript, configured lint, and Netlify
validation of 72 modules/62 handlers. Production dependency audits returned zero
vulnerabilities. CI uses the existing Node network guard and disposable PostgreSQL
17 with TCP disabled. No workflow production migration or publishing command exists.
Targeted lint and responsive synthetic browser checks were part of the preceding
local implementation validation, not additional remote CI jobs.

## Exact preview

[Deploy 6ab928cc144ffe0008903f15](https://app.netlify.com/projects/lockliel/deploys/6ab928cc144ffe0008903f15)
is ready, context `deploy-preview`, review 3, branch `lockliel-backend-v1`, commit
`48a9e10640ae430638d9921917209a023774bdc2`, created
`2026-09-27T14:31:40.944Z`, `published_at` null. Deployment identity was checked
before and after probes. This contains 61 serverless functions and one edge function.

[Invitation preview](https://deploy-preview-3--lockliel.netlify.app/getting-a-grip)
returned 200. Exact manifest title/description appear. Parsed links confirm:

- Start Getting a Grip -> `/my-lockliel/sign-up`.
- Already have an account? Sign in -> `/my-lockliel/sign-in`.

No public form, embedded course reader/video, PDF, lesson-storage path, private
notes, linked profile ID, original inviter ID or access token appeared in the
invitation HTML. Ten other existing static pages passed; public detection forms
retain removal of Netlify detection attributes. The preview alias can change on
future pushes; this evidence applies to the exact deploy ID above.

All 26 harmless connected-route probes returned 503 `production_backend_disabled`,
`Cache-Control: no-store`, no redirect and no Set-Cookie. Coverage includes My Five,
Share Library/link, Connections, session, next-step, onboarding, signup, invalid
referral, protected-resource access, public signup handlers and detection forms.
Only unauthenticated GETs and empty POSTs were sent. No cookies, authorization,
personal data, valid signup/form payloads or valid referral code were supplied.
Redirect following was disabled. No browser script or live authenticated session
ran. Edge denial is complemented by source/default-handler guard tests in CI;
it does not independently prove execution of each inner handler.

## Production preservation

Netlify published production before/after remains deploy
`6ab3f0887cb1200008eb8e9f`, production/main at `77d1d1918793bc6a25f38721e882f3d011903bad`,
published `2026-09-23T15:31:06.733Z`. Both lockliel.com and lockliel.netlify.app
homepages remain 129,775 bytes, SHA-256
`2960679d8a5548ed57bbfc1a8c4e9daac241c80c450c99e022599758efee754d`.
Only the expected new PR preview appeared. No production deploy occurred.

Read-only transactions on Supabase before/after show:

- 272 migrations; neither `20260925035350` nor `20260926212002` applied.
- Zero Share Library rows matching the foundational translation key or destination.
- Full Share Library aggregate fingerprint unchanged.
- Migration ledger, table RLS/ACL, RLS policy, function definition/ACL and table
  write-counter fingerprints unchanged.
- Project ACTIVE_HEALTHY and five Edge Function versions/hashes/metadata unchanged.

Capture fingerprints (same before/after): migration `34fbfa8134ba123cb5152a7d0468977d`,
Share Library `76f16c632f8947a440d0ef217ec96461`, table security
`1e8a8f666ca2644e782159b7f79950bc`, policies `52548d8188c4ac7795a8d17acb5a6a2f`,
functions `a898e896e8be63de7b8545b503948883`, write counters
`7f53ec42902822b830d7c0754e708590`. Fingerprints depend on this capture's query;
compare before/after within it, not differently constructed historical hashes.

ChatGPT Site remains active at version 25 with unchanged live URL, source commit
`bf6dc15ed6c6e86abdbc44a7cf8983de7d8b880f`, 46-file/41,861,120-byte archive hash
`sha256:04a57390915138c4891cb3f77a9f95876c6da344f2254ed78aa526ab50ab0455`, access
revision and update timestamp. Publication `appgdep_6a90b9a9b6b88191beacfe0de959b4ba`
remains succeeded at `2026-08-27T22:28:57.199363+00:00`, environment revision 0.
No save, publish or settings call was used.

These observations corroborate preservation within inspected surfaces, not a
full management-settings audit, row backup or asset-by-asset website audit.
No production DB write, Share Library insertion/activation, production migration,
settings/permission change, real-data test, payment, message or main merge was
performed. Both published sites and production Supabase remain unchanged within
this evidence. The approved item remains NOT ACTIVE IN PRODUCTION.

## Local documentation and next scope

Checkpoint documentation is committed locally after verification and is not
pushed. Remote remains at `48a9e10640ae430638d9921917209a023774bdc2`.
Temporary detailed evidence: `/private/tmp/lockliel-grip-checkpoint/`, including
CI logs/job JSON, sanitized preservation evidence, remote refs and HTTP results.
No credentials or signed URLs are recorded in repository documentation.

Smallest next package: a read-only Getting a Grip production-readiness inventory
covering 13 lessons, 13 worksheets, at least 10 playable video lessons, 13 protected
PDFs, enrollment prerequisites and destination release sequencing. Return exact
content/configuration gaps to Chat. Do not activate the asset, apply migrations,
publish, or begin that package without its separate assignment.
