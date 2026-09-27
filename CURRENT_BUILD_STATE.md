# Lockliel verified continuity baseline

Inspection date: 2026-09-26 UTC. Repository and Supabase observations below are
separate evidence sources. They are point-in-time findings, not a launch approval.

## Current remote development baseline (2026-09-26 America/Chicago)

**REMOTE DEVELOPMENT BASELINE VERIFIED.** One normal push advanced only
`origin/lockliel-backend-v1` from `47409a2796a5275e12684cb4a182cb008c4d5414` to
`b2adf96e988380c36e3b3b0275f7b866067e078c`. All six reviewed commits were pushed
without rewriting history. Remote main remains
`77d1d1918793bc6a25f38721e882f3d011903bad`; other branches and the empty tag list
are unchanged. PR #3 remains open against main, unmerged, with auto-merge disabled.

- GitHub `Lockliel Preview Check` push run `36288861605` and PR run `36288863602`
  both passed build and SQL jobs. Logs confirm 377 Node tests, 274-migration fresh
  replay, seven SQL files, types, Netlify validation, targeted lint and a clean
  production dependency audit. Job tokens had Contents/Metadata/Packages read
  permissions. Expected Actions cache writes occurred; no release/migration step.
- Netlify deploy `6ab8807f33f3d00009cbf189` is ready, context `deploy-preview`,
  branch `lockliel-backend-v1`, exact commit `b2adf96`, review #3. Its summary lists
  58 serverless functions and one edge function. Created September 27 at
  02:33:35 UTC, still September 26 in America/Chicago.
- Twelve unauthenticated harmless GET/empty-POST probes returned 503 with
  `production_backend_disabled`, no-store and no cookies/redirects. This includes
  direct/API/session/referral/reader/resource routes and native form paths. Five
  served form pages returned 200 with no Netlify form-detection attributes.
- Production Netlify deploy `6ab3f0887cb1200008eb8e9f`, main commit, publication
  time and homepage content hash remained unchanged. No production deploy appeared.
- Supabase still has 272 applied migrations and the same five Edge Function
  versions. Profile/Auth-user/audit/referral counts remain zero; public RLS/ACL,
  policy/function-definition fingerprints and write counters for 91 public/Auth/
  Storage tables match before/after. No production SQL migration or write ran.
- Sites connector confirms saved version 25, its source archive fingerprint and
  August 27 successful publication unchanged. Neither published site was edited.

Full evidence, links, probe list and limitations:
`docs/remote-validation-2026-09-26.md`. Netlify Forms/Blobs administrative audits
were unavailable; no valid submission or personal data was sent. These scoped
checks are not a full production-data or Auth/payment configuration audit.
Older immutable previews remain unsafe. Full dependency installation reports
19 findings (1 low, 5 moderate, 13 high); the production-only audit reports zero.
No dependency repair or repository-wide lint cleanup was attempted.

This documentation is committed locally after the single push and is not pushed.
No second push, main merge, production release, feature work or real-data testing
is authorized by this checkpoint. Next proposed work is a narrow review of the
two pending database migrations and release prerequisites, with a separate Chat
decision before any production execution. Dependency findings need scoped triage.

## Previous deployment safety package (2026-09-26, historical)

Reviewed branch: `lockliel-backend-v1`, remote baseline
`47409a2796a5275e12684cb4a182cb008c4d5414`, five-commit checkpoint
`ce7439fa7ac69887d217f1c7bb4536168b7a02bf`. All five commits are preserved.
The forward security commit containing this section records the implemented guard.
See `docs/deployment-safety-review.md` for the exact per-commit file inventory,
deployment routes, connection trace, evidence sources and remaining limits.

VERIFIED BY WORK, supplied by Dave on September 26: Netlify production tracks
main; standalone branch deploys are disabled; PR previews are enabled and PR #3
targets main. Build is `npm run build`, publish `out`, functions
`netlify/functions`. No enabled build plugins, listed build hooks or dashboard
project environment variables were shown. GitHub webhooks are empty, Pages is
disabled, and installed repository apps are Netlify and ChatGPT Codex Connector.
Dave's Supabase screenshot shows no repository connected and no branches.
These are Work's observations, not a new Codex dashboard inspection. They do not
prove absence of platform-provided credentials or account-level configuration.

VERIFIED IN REPOSITORY: the old preview could write production Supabase, native
Netlify Forms and site-wide Blobs. It was not isolated. The new code requires
trusted production invocation context before any of the 58 serverless handlers
execute. An edge guard also blocks nonproduction form POSTs and connected GETs;
nonproduction builds remove form-registration attributes from exported HTML.
Preview/local static pages remain available, but connected features return 503.
No new environment, credential, migration or dashboard configuration was created.

Checks passed with OS-level outbound access denied: Webpack export, all 377 Node
tests (311 previous plus 66 guard checks), TypeScript, targeted tooling lint, and
63 Netlify modules / 59 imported serverless and edge handlers. The unchanged SQL
chain passed this assignment: 274 migrations replayed from zero and seven SQL
files passed in disposable PostgreSQL 17 with IP egress denied. All existing
handler bodies/configuration are byte-identical after removing the new wrapper
and import. Offline edge bundling also passed. Remote CI and cloud routing have
not been exercised for this package.

ASSESSMENT: SAFE TO PUSH DEVELOPMENT BRANCH for the reviewed code and verified
deployment settings, subject to a separate controlled-push assignment. A push
would run validation and an eligible PR preview. It does not authorize or execute
a main merge, production publish, Supabase release or production-data testing.
No push occurred. The recommendation does not retrofit older immutable previews.
Confirm the new preview's guard before any browser form/account testing.

PRESERVATION: both existing sites remain untouched. Work reports the separate
[ChatGPT Site](https://lockliel-vision.dfowler4200.chatgpt.site) at saved version 25,
last successful publication August 27, 2026, with no custom domains. Its current
source binding was not exposed and no push-trigger connection was established.
Neither its source nor the currently served Netlify source/assets have been
captured as a recoverable visual baseline. That future Chat decision is out of
scope. Frontend source, branding and assets remain unchanged in this package.

Next recommended package: explicitly authorized controlled development push,
remote CI review and verification that the new PR preview serves the guard.
No production migration, feature work or frontend redesign is included.

## Previous reconciliation package (2026-09-26, historical)

Baseline preserved: `c3e9a01`, `33ecdf3`, `0008a43`. Reconciliation and
regression tests committed as `f74e4a6`. Original applied migration
bodies and validated commits remain unchanged. No main change, push, deployment,
live migration, data update or permission/configuration change occurred.

VERIFIED: migration version/name parity concealed uncaptured DDL. Neither Git
history nor the 272 populated live ledger bodies contains the review table
creation or Share Library column additions. Original execution time/actor remain
UNKNOWN. See `docs/migration-reconciliation.md` for source evidence and limits.

- New ordered compatibility migration `20260925035350` reconstructs the missing
  review table/indexes/policies/trigger and six share columns, status constraint,
  ordering index and staff write policies. Its timestamp is an explicitly assigned
  dependency-order version, not an original execution date. Matching existing
  schemas are validated with no DDL/DML; conflicting/partial schemas abort.
- All 274 authoritative migrations replay from zero in disposable PostgreSQL 17
  without the retired historical supplements. Legitimate platform stubs remain.
- Targeted live catalog parity passes: 22 columns, 22 constraints, eight indexes,
  five policies, four user triggers, RLS and anon/authenticated/service-role table
  and column grants. Existing-environment replay passes read-only and no-DDL tests;
  missing column/index and disabled RLS cases are rejected. This is not a claim of
  complete database or hosted Supabase service equivalence.
- Seven SQL files pass, covering the previous five plus email compatibility and
  restored review/share policies. A synthetic incompatible legacy address confirms
  failed migration validation preserves the previous constraint. All 311 JavaScript tests and Webpack build passed again;
  TypeScript, 61 Netlify module checks and targeted tooling lint passed. Full lint
  debt remains separately scoped; no repository-wide lint cleanup was attempted.
- Pending email correction `20260926212002` is unchanged and unapplied. Live
  aggregate preflight found profiles=0 and Auth users=0, with zero incompatible
  values. Current database regex rejects normal addresses. Re-run preflight at
  release; the existing-data result can become stale. External direct Auth imports
  must use normalized compatible input. No live rows were remediated.
- Release/recovery plan is prepared in `docs/migration-reconciliation.md` with
  backup, ordering, lock limits, preflight, verification, abort and forward-repair
  requirements. Production release is NOT approved or executed.

### Historical push status, superseded by deployment safety package above

Local validation is suitable for review. PUSH NOT CLEARED: GitHub workflow is
validation-only; default Actions permission is read and repository webhooks are
empty. PR #3 has a verified Netlify preview status, so branch updates can trigger
preview deployment. Netlify production-branch/build-plugin settings and Supabase
GitHub auto-migration configuration remain unverified. Netlify settings require
sign-in in the available browser. No push will occur on this evidence.

Next proposed package: read-only hosting/integration verification, then a separately
scoped controlled development push/remote CI and migration release review. No new
features, live migration or launch operation started. A complete Work assignment
is included in the release document. Repository-wide lint remains separate.

## Previous local engineering package (historical)

The older sections below preserve the evidence from the prior package. Current
reconciliation results above supersede their references to replay supplements,
273 local migrations, five SQL files and unverified GitHub webhook/token settings.

## Completed local engineering package (2026-09-26)

This section supersedes historical local-tooling limitations recorded below.
Original baseline remains `47409a2796a5275e12684cb4a182cb008c4d5414`.
Continuity checkpoint: `c3e9a01`; CRM transport/network isolation: `33ecdf3`.
Subsequent local commits contain the SQL/build/hygiene package and this record.
No push, deployment or production mutation was performed for this package.

- Resource signup handlers inject Forms and CRM transports independently.
- Fail-closed Node preload covers fetch, HTTP(S), HTTP/2, TCP/TLS, UDP, DNS and
  WebSocket, records violations and fails even when callers catch the error.
  Subprocess probes include the previously unmocked CRM path. This is protection
  against accidental network calls, not an OS sandbox for arbitrary native code.
- Full `npm test`: Webpack export plus 311 tests passed, zero skips/failures.
  Legacy rendering tests now verify actual Next export; component/catalog CSS
  tests remain useful through isolated Vite and PostCSS fixtures.
- `npm run typecheck`, `npm run lint:tooling`, and `npm run validate:netlify`
  passed (61 modules checked, 58 function handlers imported). Production npm
  dependency audit reported zero vulnerabilities. Diff whitespace, representative
  ignore rules, SQL connection-argument rejection and a limited changed-file
  credential-pattern check passed.
- Disposable PostgreSQL 17: all five SQL files passed, including actual anonymous,
  member ownership/isolation, forbidden grants, staff AAL1 denial, staff AAL2
  access, and revoked-session denial. Existing deletion/integrity fixtures pass.
- README.md defines supported validation. Webpack is sufficient; Turbopack is
  not required. Removed unsupported `next start` for static export. CI now runs
  the full guarded suite, typecheck, Netlify validation and isolated SQL tests.
  The edited CI workflow has not yet run remotely.
- `.gitignore` excludes secrets and generated artifacts, preserving source,
  migrations, templates and continuity documents.

### Verified SQL findings and pending change

The original 272 version/name pairs matched the connected project's ledger.
That does not prove complete schema history: unchanged replay requires explicit
TEST-ONLY reconstruction of `founders50_reviews` and six `share_assets` columns.
The supplements are based on read-only live catalog evidence, not guessed
business requirements. They are not deployable repair migrations and do not
claim full schema equivalence. Source-history reconciliation remains open.

Migration `20260926212002_lockliel_correct_profile_email_pattern.sql` is NEW and
UNAPPLIED to production. Existing/live `profiles_email_format` uses an
over-escaped dot and rejects normal email addresses. Read-only evaluation of
its actual expression confirmed the defect; the replacement uses `[.]` and
preserves normalization and length checks. Valid/invalid identity regression
fixtures pass locally. There are now 273 local migrations versus 272 at the
last live inspection. The live defect remains unresolved pending a separately
authorized release and assessment of existing data compatibility.

The local SQL harness supplies minimal Auth/Storage compatibility tables. It
validates real PostgreSQL policies/functions, not full Supabase HTTP services,
Auth configuration, Storage service behavior or production account journeys.

Repository-wide ESLint remains a pre-existing failure (337 errors, 96 warnings).
Changed tooling passes its explicit lint gate; no blanket suppression was added.
Full lint debt and unexecuted remote CI mean this is not an all-checks-green
release. Commits are kept local; development push and deployment-trigger behavior
remain unverified. Main and the connected project remain unchanged.

## Historical baseline evidence

The sections below describe the original inspected commit and live snapshot;
current local changes and outstanding migration are recorded above.

## Repository checkpoint

- Repository: <https://github.com/eaglevisiondigital/Lockliel>
- Branch: `lockliel-backend-v1`
- Inspected commit: `47409a2796a5275e12684cb4a182cb008c4d5414`
- Commit subject: Include owned order details and membership departure history in exports.
- Local folder initially had only `.git`, an unborn `main`, no remotes, no
  tracked files and no existing working changes. Added `origin`, fetched the
  existing development history, and checked out its tracking branch. No
  replacement application was initialized. No local `main` commit/ref was created.
- Remote `main` read during inspection: `77d1d1918793bc6a25f38721e882f3d011903bad`.
  No push, merge, deployment, or remote branch mutation was performed.
- At the inspected commit: 602 tracked files, 90 files under `app`, 58 Netlify
  function modules plus 3 shared modules, 272 migration files, 5 Supabase Edge
  Function entrypoints, 10 Node test files, and 4 SQL fixture files.
- No existing `AGENTS.md` or requested continuity documents were present in the
  remote tree. Existing README files and `docs/` resource notes were read before
  creating the five root continuity documents.

## What exists in the repository

`ARCHITECTURE.md` maps files and boundaries. Code exists for account/session/MFA
flows, profiles and private faith assessment, consent/preferences, My Five and
referrals, groups and reviewed leadership, Founders 50/orientation, courses and
protected resources, notifications/messaging, staff CRM/content/finance/roles,
privacy/export/deletion, and release/integrity monitoring.

Commerce and giving foundations are implemented, but gateway activation and a
working payment journey are not established. The separate Netlify Forms/Blobs
resource funnels also mirror leads to Supabase on a best-effort basis. Current
resource docs omit that later mirroring behavior. A native app and complete
future member-discovery UX are not established by this code inventory.

## Connected Supabase observations

Project: `bsndfhbemstyrrglajat` (Lockliel Platform). All inspection used metadata
reads, aggregate SELECTs, function-definition reads and read-only MCP methods.
No migration, fixture, permission change, staff bootstrap or data mutation ran.

| Check | Observed result | Evidence |
| --- | --- | --- |
| Migration history | 272 repository / 272 live; zero missing or extra version/name pairs | Repository migration filenames compared to `list_migrations` |
| Migration endpoints | First `20260924211046`; last `20260926051230` | Ordered histories |
| Previously reconciled deletion migration | `20260926033358_lockliel_account_deletion_execution_support` present in both | Exact pair comparison |
| Security Advisor | No findings | `get_advisors(type=security)` |
| Public ordinary tables | 56; all have RLS | `pg_class` / `pg_namespace` |
| Public policies | 111 | `pg_policies` |
| Anonymous/public public-table grants | 0 returned | `information_schema.role_table_grants` |
| Public non-invoker views | 0 | `pg_class.reloptions` |
| Unvalidated public/private constraints | 0 in `public` and `app_private` | `pg_constraint` |
| Private functions callable by anon | 0 | `has_function_privilege` |
| Public SECURITY DEFINER functions | 5, none callable by anon/authenticated; empty search paths | `pg_proc`, `proconfig`, effective execute checks |
| Staff bootstrap | No staff-role rows | Aggregate over `staff_roles` |
| Auth URLs and SMTP | Both verification records false, with no verification date | `launch_verifications`; actual management settings not inspected |
| Payment providers | Authorize.Net, Stripe, PayPal and Square all `not_connected`; adapters and webhooks false | Selected fields from `payment_provider_connections` |
| Book products | Physical and digital A Heart for the Lost both draft; neither has a storage path | Selected fields from `products` |
| Book benefit | `heart-for-the-lost-gift-20` is draft | Selected fields from `benefit_rules` |
| Storage | `lesson-assets` and `member-resources` both private | `storage.buckets` |

Migration-history equality is not proof of SQL-body equality or full absence of
manual schema drift. This assignment did not replay migrations into a disposable
database or compare every schema definition. The targeted catalog checks above
found no drift in the inspected security properties.

### Deployed Edge Functions

Read each deployed entrypoint with `get_edge_function` and compare its content
to the corresponding `supabase/functions/<slug>/index.ts` at the inspected SHA.
All five entrypoints matched exactly. Gateway settings also match
`supabase/config.toml`. This does not inspect runtime secret values or dependency
bundle reproducibility.

| Slug | Deployed version | Gateway verify_jwt | Behavior/status |
| --- | --- | --- | --- |
| track-referral | 4 | false | Public intake handler |
| submit-founders50 | 11 | false | Public application handler |
| capture-lead | 5 | false | Public CRM capture handler |
| import-grip-pdfs | 6 | true | Deployed ACTIVE, but unconditionally returns HTTP 410; retired |
| process-account-deletion | 2 | false | Handler validates Auth user, active session, AAL2, admin role and claimed request |

### Current release flags and course evidence

| Flag | Live value |
| --- | --- |
| digital_book_delivery | false |
| founders50_public_recruiting | true |
| heart_book_gift_benefit | false |
| internal_messaging | true |
| partner_checkout | false |

Getting a Grip on the Basics is published. Joins over courses, lessons,
lesson_assets and storage.objects establish 13 lessons, 13 worksheets with
nonempty question arrays, 10 distinct lessons with active YouTube references,
and 13 distinct lessons whose active PDF paths match private PDF objects.
There are 13 active video asset rows, but only 10 distinct lessons meet the
configured video-reference predicate. None has a verified duration.

This matches the data requirements in the live `lockliel_grip_readiness`
definition. It is not browser verification that every referenced video plays.
Verified duration remains optional. No course, asset or flag was changed.

## Validation

Remote evidence for the exact inspected SHA:

- [Preview Check #881](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36240230380): success.
- [Preview Check #882](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36240232266): success.
- #882 job steps confirm locked install, Netlify syntax/import checks, production
  dependency audit, build and the scoped current test suite all succeeded.
  This is CI evidence, not proof that Netlify production serves this commit.

Local checks:

- Node 24.20.0 / npm 11.19.0; CI uses Node 22. Locked dependencies installed with
  `npm ci --ignore-scripts --no-audit --no-fund` and an external temporary cache.
- All 61 Netlify `.mjs` modules passed `node --check`; all 58 handlers imported.
- 277 tests in six non-rendered suites passed using a temporary preloaded
  `fetch` function that rejects network access. The application source was not
  modified to run these checks.
- Initial eight-suite attempt preceded build completion and failed five
  export-dependent tests because `out/` was absent. Those are prerequisite
  failures, not an established application regression.
- Default `npm run build` (Turbopack) made no visible progress during compilation
  for about four minutes and was stopped. The cause was not established.
- `node node_modules/next/dist/bin/next build --webpack` succeeded, including
  TypeScript checking and static export of 34 pages. No configuration was changed.
- After that build, all **289 tests passed, zero failures**, across the eight
  current CI files using the temporary network-denying preload. This establishes
  a local webpack-backed check, not a local default-Turbopack success.
- Logs for this session are in `/private/tmp/lockliel-baseline-webpack.log` and
  `/private/tmp/lockliel-baseline-tests.log`. Temporary logs are not durable repo
  artifacts; the verified results and commands are recorded here.

Safe local rerun used a temporary module containing
`globalThis.fetch = async () => { throw new Error('Baseline test harness denies network access'); };`
and ran the eight CI files with `node --import <temporary-module> --test` after
building. Tests can replace that function with explicit mocks. Keep outbound
network blocked until the permanent isolation fix is implemented.

The current CI suite is the eight explicitly listed test files in
`.github/workflows/lockliel-preview-check.yml`. `npm test` additionally runs
`rendered-html.test.mjs` and `ui-components.test.mjs`, which expect old `dist/`
Vinext artifacts rather than the current `out/` Next export. That broad command
is not the same validation contract as current CI.

The four `supabase/tests/*.sql` files contain fixture mutations. They were read
but not executed on the connected project. Many Node tests assert source text or
mock responses; passing them does not establish live cross-user/RLS correctness.

## Confirmed gaps and priority

1. **Test isolation needs repair before network-enabled test runs.**
   `book-release.mjs:110` and `faith-boost-signup.mjs:95` use global `fetch` for
   CRM mirroring, while their tests inject only the Forms `post` function.
   They can attempt requests to the configured live Supabase project. Baseline
   tests ran in the network-restricted sandbox; the explicit temporary network
   guard was added for the rerun. Do not assume existing tests are fully offline.
2. **Local validation and repository hygiene need alignment.** No tracked
   `.gitignore`; installs/builds create visible untracked output. Legacy README,
   install/build helpers and two tests still describe Vinext/Linux starter
   assumptions. Preserve tests and establish their intended scope before cleanup.
   The default local Turbopack build also needs reproduction/diagnosis; webpack
   passes on this machine and the exact-commit CI default build passed on Linux.
3. **Administrative onboarding and email readiness remain unresolved.** No staff
   roles, Auth URL and SMTP verification records false. A real designated
   account, explicit bootstrap authorization and separate live validation are
   needed. False verification does not prove SMTP is absent or URLs are wrong.
4. **Payment/book launch depends on decisions and assets.** Disconnected gateways,
   draft products without files and a draft benefit rule are verified. Provider,
   offer, shipping and legal decisions are not supplied as approved records.
5. **Public copy violates the new punctuation constraint.** Existing em dashes
   occur in `app/page.tsx`, `app/layout.tsx`, and resource social metadata. Record
   a scoped copy correction; do not redesign approved branding to address it.
6. **Live coverage remains incomplete.** Netlify deployed SHA, Forms/Blobs state,
   actual SMTP/Auth management settings, real browser flows, cross-member/group
   access tests, and privacy coverage across both storage systems are unverified.
   Reader page images also lack a full screen-reader transcript per the existing
   reader README; accessibility work needs a scoped content treatment.

No missing business decision prevented this baseline. Those decisions block
specific activation/implementation packages, not further useful engineering.

## Next recommended implementation package

**High: isolate automated tests and establish a reliable local verification path.**
Inject/mock the CRM mirror transport and make tests fail on unexpected outbound
requests; prove no production calls occur. Align the default test command with
the current build contract while preserving useful legacy coverage. Add suitable
generated-file/secret exclusions and correct setup documentation. Prepare an
isolated migration/RLS fixture workflow with member, group, consent and staff
AAL scenarios. Do not run fixtures on production or change business behavior.

After that, use Work for authenticated launch-flow validation and actual Auth/SMTP
settings inspection, and use Chat to resolve the explicit decisions in
`DECISIONS.md`. Payment activation is not authorized by this recommendation.

## Reverification guide

1. Check `git status --short --branch`, `git rev-parse HEAD`, and remote branch
   head before continuing. Read all five continuity documents.
2. Compare the set of migration filename stems against live `(version,name)`
   pairs, not just total counts. Read Edge Function source and compare entrypoints
   and gateway settings against the same commit.
3. Repeat the read-only advisor and aggregate catalog/data checks described in
   the Supabase table. Read live function definitions before relying on them.
4. Inspect exact-commit CI results. Build before export-dependent tests and deny
   unexpected network access. Use an isolated environment for SQL fixtures.
5. Record current evidence and limitations. Never silently upgrade a historical
   report, draft configuration, or repository file into proof of deployment.

## Changes in this baseline package

Created `AGENTS.md`, `CURRENT_BUILD_STATE.md`, `ARCHITECTURE.md`,
`SECURITY_MODEL.md`, and `DECISIONS.md`. Existing application, migrations,
permissions, branding and release controls remain unchanged. Documentation is
local and uncommitted unless a subsequent explicit checkpoint records otherwise.
Local dependency/build artifacts were excluded through `.git/info/exclude`
(`node_modules`, `.next`, `out`, `next-env.d.ts`, `tsconfig.tsbuildinfo`); no tracked
ignore file or application configuration was changed. No secrets were included
in the five new documents.
