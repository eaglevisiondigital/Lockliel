# Controlled development push and remote validation

Date: September 26, 2026, America/Chicago. Remote execution timestamps are
September 27, 2026 UTC. **REMOTE DEVELOPMENT BASELINE VERIFIED.**

## Scope and exact Git state

Dave authorized one normal push of the already reviewed development HEAD, then
remote CI, preview and production-preservation checks. All preconditions matched:
branch `lockliel-backend-v1`, clean tree/index, expected origin, exact HEAD and six
expected commits. No additional migration/configuration edits were present.

The only push was a non-force explicit refspec:
`refs/heads/lockliel-backend-v1:refs/heads/lockliel-backend-v1`, with followTags
disabled. It advanced origin from `47409a2796a5275e12684cb4a182cb008c4d5414` to
`b2adf96e988380c36e3b3b0275f7b866067e078c`. No history rewrite, squash, rebase,
amend, tag, merge, PR-base change or manual deployment occurred.

| Ref | Verified after push |
| --- | --- |
| lockliel-backend-v1 | b2adf96e988380c36e3b3b0275f7b866067e078c |
| main | 77d1d1918793bc6a25f38721e882f3d011903bad, unchanged |
| feat/faith-boost-resource-20260913 | a6facdc53c8046a07db7b7ec60f69e31ba533c71, unchanged |
| feat/heart-for-lost-20260923 | e31be2846578d97eaf32b8a9f49a99303116e5b5, unchanged |
| Tags | Empty before and after |

[PR #3](https://github.com/eaglevisiondigital/Lockliel/pull/3) remains open from
development to main, unmerged, with auto-merge disabled. The PR head matches the
pushed SHA. These are observed refs/settings, not a claim that main has a GitHub
branch-protection ruleset.

Pushed commits, all preserved:

| Commit | Description |
| --- | --- |
| c3e9a014bc27c514c8c1d5e78c7540f44121164c | Continuity baseline |
| 33ecdf35ad5bf6cfce12ddc1078a90aeca3cd86c | CRM transport/test network isolation |
| 0008a43b99654366ed25e232eee546937d209c99 | Isolated SQL and supported build validation |
| f74e4a6fb3ca935be33938a6811fc84d5543c922 | Missing review/share migration history reconstruction |
| ce7439fa7ac69887d217f1c7bb4536168b7a02bf | Migration compatibility/recovery and push gates |
| b2adf96e988380c36e3b3b0275f7b866067e078c | Preview production-backend isolation |

## GitHub CI

Both `Lockliel Preview Check` runs identify the exact development SHA:

- [Push run 36288861605](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36288861605): success.
- [PR run 36288863602](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36288863602): success.

Both build and SQL jobs passed in both runs. Inspected job IDs:
`108534876386`, `108534876226`, `108534882048`, `108534881825`.
Logs confirm 377/377 Node tests, 63 Netlify module checks/59 imported handlers,
Webpack build, TypeScript, targeted lint, and 274 authoritative migrations
replayed from zero with seven SQL files in disposable PostgreSQL 17. The SQL
listener had TCP disabled; fixtures were rolled back. No linked project was used.

All four setup logs list only Contents: read, Metadata: read and Packages: read
for GITHUB_TOKEN. Normal Actions cache writing is enabled and occurred as
expected. There was no unexpected write-capable repository permission or
production migration/deploy step. The workflow's dependencies/install/cache and
reporting activity should not be described as literally having no side effects.
The commit's checks show only expected GitHub Actions and Netlify integrations;
Netlify redirect/header checks succeeded and its pages-changed check is neutral.

The explicit `npm audit --omit=dev --audit-level=high` step reports zero
vulnerabilities. The broader `npm ci` summary reports 19 findings: 1 low,
5 moderate and 13 high. The unchanged dependency tree needs separately scoped
triage; this package made no dependency or repository-wide lint repairs.

## Netlify preview identity

[Preview deployment](https://app.netlify.com/projects/lockliel/deploys/6ab8807f33f3d00009cbf189)
was created at `2026-09-27T02:33:35.401Z` and reached ready:

- Deploy ID: `6ab8807f33f3d00009cbf189`.
- Context: `deploy-preview`; branch: `lockliel-backend-v1`; review ID: 3.
- Commit: `b2adf96e988380c36e3b3b0275f7b866067e078c`.
- Preview URL: <https://deploy-preview-3--lockliel.netlify.app>.
- `published_at`: null. It is not the production publication.
- Deploy summary: 58 serverless functions, one edge function, four redirect rules
  and three header rules. No reported build failure.

The public read-only Netlify site/deploy API supplied this metadata. Native
browser control remained permission-pending and was unnecessary. No dashboard
settings were changed or bypassed. The PR alias is mutable on future pushes;
the deploy ID and commit, not the alias alone, identify this verified checkpoint.

## Harmless deployed guard probes

Requests were made without cookies, bearer tokens, personal data, valid referral
codes or form names. POST bodies were empty. Redirect following was disabled.
No browser application JavaScript ran, no account was created and no payment or
valid form submission was attempted. Execution would stop on the first mismatch.

Every request below returned HTTP 503, JSON code `production_backend_disabled`,
`Cache-Control: no-store`, no Set-Cookie and no Location header:

| Method | Path | Coverage |
| --- | --- | --- |
| GET | /api/lockliel-auth/session | Connected session route |
| GET | /.netlify/functions/lockliel-session | Direct serverless URL |
| GET | /r/invalid_referral | Referral GET/redirect boundary |
| GET | /api/faith-boost/access | Shared Blob access |
| GET | /who-god-says-you-are/reader/chapter.pdf | Protected reader |
| POST | /api/lockliel-auth/signup | Account mutation |
| POST | /api/faith-boost/signup | Forms/CRM/Blobs funnel |
| POST | /api/book-release | Forms/CRM/Blobs funnel |
| POST | /thank-you | Native homepage form path |
| POST | /__founders50.html | Native detection-form path |
| POST | /__faith-boost-book.html | Native resource-form path |
| POST | /__heart-book-release.html | Native release-form path |

Five GETs to `/`, `/founders-50`, `/__founders50.html`,
`/__faith-boost-book.html` and `/__heart-book-release.html` returned 200. An HTML
parser found the expected form in each and no `data-netlify` or `netlify`
detection attribute. This verifies deployed form-registration removal alongside
runtime denial. Backend success journeys remain intentionally unavailable.

These checks exercise the deployed request boundary. Because the edge guard can
answer before serverless execution, an HTTP denial alone does not independently
prove execution of the inner handler guard. Exact deployed commit/function count
and the 58-entrypoint local/remote test matrix provide the complementary evidence.
No attempt was made to bypass or disable the edge guard to test the inner layer.

## Production preservation evidence

### Netlify production

Before/after public API reads identify the same ready published production deploy:

- ID: `6ab3f0887cb1200008eb8e9f`.
- Context/branch: production/main.
- Commit: `77d1d1918793bc6a25f38721e882f3d011903bad`.
- Publication time: `2026-09-23T15:31:06.733Z`.
- Production URL: <https://lockliel.com>.

The recent-deploy listing contains the new preview and older previews, with no
new production deploy. Both lockliel.com and lockliel.netlify.app returned the
same 129,775-byte homepage before/after, SHA-256
`2960679d8a5548ed57bbfc1a8c4e9daac241c80c450c99e022599758efee754d`.
The ETag changed while the response bytes, published deploy and source commit
remained identical. Do not interpret that cache validator alone as a production
publication or claim all response headers were unchanged. This was not a full
asset-by-asset visual preservation audit.

Netlify's authenticated Forms listing returned 401; administrative submission
counts and shared Blob audit records were not available. No credentials were
requested or extracted. All validation POSTs lacked form names and meaningful
input and received the guard's response. No valid production submission was sent.
The absence of unrelated third-party activity is not independently certified.

### Supabase

Read-only before/after inspection of `bsndfhbemstyrrglajat` found:

- Identical 272 migration version/name pairs; latest `20260926051230`.
- Identical five Edge Function versions, hashes and update metadata:
  track-referral 4, submit-founders50 11, capture-lead 5,
  import-grip-pdfs 6, process-account-deletion 2.
- Profiles, Auth users, audit events and referral events all remain zero.
- Identical public table RLS/ACL fingerprint, public/app_private policy
  fingerprint and function-definition fingerprint.
- Identical insert/update/delete counters for 91 public/Auth/Storage tables.

The two pending local migration versions `20260925035350` and `20260926212002`
remain unapplied. The importer was not invoked and stays disabled. No production
SQL fixture, migration, Edge Function deployment, permission change, Auth or
payment configuration request was executed. Statistics/fingerprints corroborate
no application database mutation during the observed window; they are not a
complete row-by-row data backup or exhaustive management-settings audit.

### Original ChatGPT Site

Read-only Sites connector inspection before/after confirms the same active
project `appgprj_6a904a70bcb48191b19a10b74adcf5d0`, latest saved version 25 and URL
<https://lockliel-vision.dfowler4200.chatgpt.site>.

- Project update time: `2026-08-27T22:28:57.301945+00:00`.
- Saved version source SHA: `bf6dc15ed6c6e86abdbc44a7cf8983de7d8b880f`.
- Existing source archive: 46 files, 41,861,120 bytes, hash
  `sha256:04a57390915138c4891cb3f77a9f95876c6da344f2254ed78aa526ab50ab0455`.
- Publication ID: `appgdep_6a90b9a9b6b88191beacfe0de959b4ba`, succeeded, updated
  `2026-08-27T22:28:57.199363+00:00`, environment revision 0, unchanged.

Unauthenticated public HTML retrieval returned 401, so preservation evidence here
is authenticated connector version/publication metadata, not a fetched page hash.
No source archive was downloaded, no version saved and no publication/configuration
action performed. Current source-repository binding remains unexposed. The archive
metadata does not replace the future requirement to retain recoverable source and
assets before substantial frontend changes or select a visual authority for Dave.

## Changes, limits and next step

The remote development branch and its CI/preview advanced as authorized. Main,
both published sites, Supabase migration/function state and inspected security/data
counters did not change. No production deployment, migration, database write,
permission/configuration change or real-data test was performed or observed.

After the push, only AGENTS.md, CURRENT_BUILD_STATE.md, SECURITY_MODEL.md,
DECISIONS.md and this report were updated and committed locally. No second push
occurred. No implementation repair was needed and no new feature work began.

Remaining limits: older immutable previews are unsafe; no writable isolated
backend exists; full Forms/Blobs administrative audit unavailable; full dependency
audit findings and prior repository lint debt remain; production release/Auth/
SMTP and other launch checks remain separately scoped. The new preview is safe
for static review and denial checks, not evidence of successful backend journeys.

**REMOTE DEVELOPMENT BASELINE VERIFIED** means the exact pushed development
commit, CI results and representative deployed guards are verified with the
preservation evidence above. It is not a production launch or migration approval.

Smallest next proposed package: review the two pending database migrations against
the documented release prerequisites, including current parity/preflight and
recoverable backup evidence, then obtain a separate Chat decision before any
production execution. Separately scope dependency-audit triage. Neither package,
another push, a main merge nor feature work has started.
