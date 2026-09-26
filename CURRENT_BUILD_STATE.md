# Lockliel verified continuity baseline

Inspection date: 2026-09-26 UTC. Repository and Supabase observations below are
separate evidence sources. They are point-in-time findings, not a launch approval.

## Active engineering package

Continuity checkpoint committed as `c3e9a01`. The subsequent user assignment
authorizes local test isolation, build validation, disposable SQL tests and
repository hygiene, with no production changes.

CRM signup transports now have an explicit injectable `mirror` dependency.
The test preload denies fetch, HTTP(S), HTTP/2, TCP/TLS, UDP, DNS and WebSocket
network attempts, records violations and fails even when application code catches
the error. Both the package test entrypoint and CI load it. All 25 targeted
network/resource checks passed, including subprocess probes and the previously
unmocked CRM path. This is accidental-network protection, not a sandbox against
malicious tests spawning arbitrary native programs.

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
