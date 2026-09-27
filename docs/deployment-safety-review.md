# Lockliel development push and preview safety review

Date: September 26, 2026. Repository: `eaglevisiondigital/Lockliel`.
Branch: `lockliel-backend-v1`. No push or deployment performed.

## Review identity and evidence

The original remote development baseline is
`47409a2796a5275e12684cb4a182cb008c4d5414`. GitHub's read-only branch API confirmed
it still points there during this review. The five original local commits end at
`ce7439fa7ac69887d217f1c7bb4536168b7a02bf`. Their aggregate diff is 29 files,
3,572 insertions and 169 deletions. This report and the forward security changes
are recorded by the new local commit after that checkpoint; history was preserved.
`origin` fetch/push URL is `https://github.com/eaglevisiondigital/Lockliel.git`.
The working tree was clean before this package. Main was not checked out or changed. Its remote SHA was rechecked as
`77d1d1918793bc6a25f38721e882f3d011903bad`, unchanged from the earlier baseline.

Evidence classes used here:

- VERIFIED IN REPOSITORY: local Git history/diffs, configuration, source and tests.
- VERIFIED BY WORK: Dave's supplied September 26 read-only investigation results.
  Codex did not independently reopen those dashboards during this package.
- VERIFIED LOCALLY: executed tests and OS-isolated build results. These do not
  prove live CDN routing, hosted Auth/Storage behavior or a production deployment.
- UNKNOWN: facts not exposed or not tested; listed explicitly below.

## Work's deployment findings

| System | Verified setting or observation | Consequence and limit |
| --- | --- | --- |
| Netlify | Production branch main | A development push does not publish main |
| Netlify | Standalone nonproduction branch deploys disabled; PR previews enabled; PR #3 targets main | An eligible push updates a PR preview |
| Netlify | Build `npm run build`; publish `out`; functions `netlify/functions` | Current repository controls build and function code |
| Netlify | No enabled build plugins, listed build hooks or dashboard project variables | Does not exclude platform-provided credentials, automatic platform behavior or account-level settings |
| GitHub | Repository webhooks empty; Pages disabled | No listed repository-webhook or Pages route |
| GitHub | Netlify and ChatGPT Codex Connector installed | Netlify app can build previews despite empty webhooks; no autonomous publishing route was established for the connector |
| Supabase | Dave's screenshot: no repository connected; no branches | No connected Git integration to auto-apply these migrations or deploy Edge Functions |
| ChatGPT Site | Saved version 25; successful publication August 27, 2026; no custom domains | Separate published experience must be preserved |

The separate [ChatGPT Site](https://lockliel-vision.dfowler4200.chatgpt.site) remains
active. Its current source-repository binding was not exposed by Work's read-only
response. No push-trigger connection was established. Historical Sites/Vinext
files in this repository do not establish that site's present source of truth.

## Five-commit review

All five preserve frontend source/assets. None changes the dependency lockfile,
`netlify.toml`, Next config or Supabase deployment config. None adds a production
deployment/migration command to active build or CI. The two pending SQL files
are release changes only if deliberately applied later. Exact file lists follow
the individual assessments.

### c3e9a014bc27c514c8c1d5e78c7540f44121164c

Changed files (`A` added, `M` modified, `D` deleted):

```text
A	AGENTS.md
A	ARCHITECTURE.md
A	CURRENT_BUILD_STATE.md
A	DECISIONS.md
A	SECURITY_MODEL.md
```

Purpose: checkpoint verified continuity and constraints in five root documents.
No migration, environment, build, frontend or runtime behavior changes. No new
write path and no direct production effect on push or preview use. Low risk.

### 33ecdf35ad5bf6cfce12ddc1078a90aeca3cd86c

Changed files (`A` added, `M` modified, `D` deleted):

```text
M	.github/workflows/lockliel-preview-check.yml
M	CURRENT_BUILD_STATE.md
M	netlify/functions/book-release.mjs
M	netlify/functions/faith-boost-signup.mjs
M	package.json
M	tests/book-release.test.mjs
M	tests/faith-boost-resource.test.mjs
A	tests/network-isolation.test.mjs
A	tests/support/network-guard.mjs
```

Purpose: inject resource-signup CRM transports and make accidental network calls
fail tests. The two handlers default `mirror` to the same fetch behavior they
already used. Tests mock both Forms and CRM. Node preload and subprocess probes
cover swallowed errors. CI uses the preload for tests. No migrations, frontend
changes, new environment secrets or publishing commands. Production behavior is
unchanged; the existing production-connected preview risk remained at this commit.
Low runtime change risk, significant reduction in accidental CI data writes.

### 0008a43b99654366ed25e232eee546937d209c99

Changed files (`A` added, `M` modified, `D` deleted):

```text
M	.github/workflows/lockliel-preview-check.yml
A	.gitignore
M	AGENTS.md
M	ARCHITECTURE.md
M	CURRENT_BUILD_STATE.md
M	DECISIONS.md
M	README.md
M	SECURITY_MODEL.md
M	package.json
A	scripts/test-sql.mjs
A	scripts/validate-netlify.mjs
A	supabase/migrations/20260926212002_lockliel_correct_profile_email_pattern.sql
A	supabase/tests/authorization_boundaries.sql
M	tests/rendered-html.test.mjs
A	tests/support/legacy-founders-review.sql
A	tests/support/legacy-share-columns.sql
A	tests/support/supabase-compat.sql
M	tests/ui-components.test.mjs
```

Purpose: supported Webpack build, complete guarded suite, TypeScript/Netlify checks,
disposable PostgreSQL 17 runner, authorization fixtures, ignored generated/secret
artifacts and continuity. CI adds a disposable SQL job, uses npm ci and installs
PostgreSQL from its official package source. The runner discards inherited
connection credentials, refuses connection arguments, uses its private Unix
socket and no TCP listener. Temporary historical supplements from this commit
are removed by the next commit. No production backend integration or UI change.

New unapplied migration: `20260926212002_lockliel_correct_profile_email_pattern.sql`.
It corrects the over-escaped email constraint and requires separate compatibility,
locking and release review. Build/CI never applies it to Supabase. No production
mutation route on push was added. Moderate tooling/release risk; locally tested,
remote CI not yet run. Existing previews still shared production resources.

### f74e4a6fb3ca935be33938a6811fc84d5543c922

Changed files (`A` added, `M` modified, `D` deleted):

```text
M	DECISIONS.md
M	scripts/test-sql.mjs
A	supabase/migrations/20260925035350_lockliel_reconstructed_review_share_history.sql
A	supabase/tests/email_constraint_compatibility.sql
A	supabase/tests/reconciled_review_share.sql
A	supabase/verification/review-share-catalog.sql
A	supabase/verification/review-share-live-20260926.json
D	tests/support/legacy-founders-review.sql
D	tests/support/legacy-share-columns.sql
M	tests/support/supabase-compat.sql
```

Purpose: reconstruct missing review/share history using targeted live catalog
evidence, remove retired supplements, and add compatibility/drift/policy tests.
New unapplied migration:
`20260925035350_lockliel_reconstructed_review_share_history.sql`. Its earlier
version is a recorded ordering exception, not a recovered timestamp. It creates
missing fresh-environment objects, accepts a matching complete existing schema
without DDL/DML, and rejects partial/conflicting states. All historical migration
bodies remain unchanged. No frontend, environment, hosting route or application
runtime change. Important separately controlled database-release risk, but no
execution on push/preview. Fresh replay, read-only/no-DDL replay and targeted
drift rejection pass. This is not full schema equivalence certification.

### ce7439fa7ac69887d217f1c7bb4536168b7a02bf

Changed files (`A` added, `M` modified, `D` deleted):

```text
M	AGENTS.md
M	ARCHITECTURE.md
M	CURRENT_BUILD_STATE.md
M	README.md
M	SECURITY_MODEL.md
A	docs/migration-reconciliation.md
A	supabase/verification/email-preflight.sql
```

Purpose: release/recovery plan, read-only email preflight and updated continuity.
No new migration, runtime, frontend, environment or active build behavior. Future
release commands are documentation, not executed scripts/workflows. Low push risk.
Its unresolved hosting evidence is now superseded by Work's findings above.

## Production connections before isolation

### Supabase

`netlify/lib/lockliel-core.mjs` contains production `SUPABASE_URL` and public
`SUPABASE_KEY` source constants. No `NEXT_PUBLIC_SUPABASE_*` or server environment
override selects an isolated project. The key value is deliberately omitted here.
Caller Auth cookies supply access/refresh tokens to server handlers. Browser
components call same-origin `/api/...`; no direct browser Supabase client/transport
was found in `app`, `components`, `public` or the bundled reader sources.

Handlers use Auth, REST, RPC, Storage and production Supabase Edge Functions.
Protected table reads remain caller-scoped; mutations include account/session/MFA,
profiles and consent, private assessments, My Five/referrals, groups, messages,
course progress, staff review/CRM/content/finance/roles and privacy/export/deletion.
Some apparent reads have side effects: referral redirects POST `track-referral`,
session GETs can refresh tokens, and GET handlers can invoke RPCs. All connected
reads are blocked too, avoiding disclosure as well as hidden writes in previews.

Public intake proxies call `submit-founders50` and `capture-lead`; the referral
handler calls `track-referral`. Privileged deletion can call
`process-account-deletion`. Hosted functions read `SUPABASE_URL`,
`SUPABASE_SECRET_KEYS`, `SUPABASE_SERVICE_ROLE_KEY` and, for deletion's caller
verification, `SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_ANON_KEY`. Values were not
retrieved or copied. Their deployed configuration was not changed. The retired
`import-grip-pdfs` remains disabled; no importer was invoked.

### Forms and CRM

- Homepage `lockliel-interest` submits natively to `/thank-you`.
- Founders 50 has a native form/detection blueprint and a JavaScript submission
  to `/api/lockliel/founders50`, which reaches the production intake function.
- Faith Boost and book-release clients POST to same-origin serverless handlers.
  Those handlers POST URL-encoded data to production
  `/__faith-boost-book.html` and `/__heart-book-release.html` at lockliel.com, then
  mirror leads to production Supabase `capture-lead` on a best-effort basis.
- Native Netlify Forms and detection metadata belong to the site. They are not
  a preview-only data store. Existing origin logic even recognizes this site's
  same-origin preview host; an Origin check was never backend isolation.
- Netlify form notifications/email destinations were not inspected. Blocking
  submissions also prevents application-triggered submission notifications.

### Netlify Blobs

`getStore` opens site-wide stores `faith-boost-resource` and
`book-release-notifications`, not `getDeployStore` namespaces. Platform context
supplies site identity/credentials, so absent dashboard variables do not isolate
them. Signup paths create leads, form-sync records, sessions and event records;
event handlers write analytics; access/reader handlers read shared sessions and
lead state. No application Blob delete path was found. Preview writes can affect
production deduplication/access records. The fix blocks access before `getStore`.

### Other services

Auth can trigger confirmation/recovery emails. The guard prevents those preview
requests. Protected files use production Supabase Storage; admin source-import
code references GitHub before storage uploads. These handlers are also guarded.
Payments remain disconnected foundations per the earlier live inventory; no
active provider checkout/webhook client was found in this runtime. This review
does not approve a gateway or business policy. Public YouTube embeds/API loading,
social links and research links remain external requests/navigation and may
generate third-party analytics. No separate active email SDK, analytics write
service or custom outgoing webhook was found in the current application path.

## Minimal containment implemented

1. `netlify/lib/deployment-safety.mjs` allows only trusted invocation
   `context.deploy.context === 'production'`. Every one of the 58 default
   serverless exports is wrapped. Missing, local, branch, preview or unfamiliar
   context returns 503 before parsing input, session work, network or Blob calls.
   The response includes `production_backend_disabled`, a clear message, no
   cookies/redirects and `Cache-Control: no-store`. All existing handler bodies
   and route/rate-limit configuration remain unchanged.
2. `netlify/edge-functions/preview-isolation.js` matches `/*` with `onError: fail`.
   Nonproduction native POSTs to any path are blocked, as are other non-GET/HEAD
   methods and all API/direct-function/referral/protected-reader GET/HEAD paths.
   Static GET/HEAD passes through. Production passes through unchanged. No
   request header, hostname or environment variable can authorize the runtime.
3. `scripts/isolate-preview-forms.mjs` follows Webpack in `npm run build`. It
   removes form-detection attributes from nonproduction/unknown exported HTML,
   preventing preview build postprocessing from registering/updating site-wide
   form definitions. Production CONTEXT is byte-preserving. Source templates,
   controls, branding and assets remain untouched. Any processing failure fails
   the build. Runtime POST blocking separately protects existing form names.
4. Netlify validation now includes the edge module. Tests explicitly simulate
   production invocation when verifying existing behavior, while the network
   guard remains active. No test-only bypass was added to application code.

No new service, dependency, secret, preview database, namespace, dashboard setting
or environment override is required. Local `npm run dev` remains a frontend
server; local function emulation intentionally has no production backend. Mocked
handlers/disposable SQL remain the supported way to test backend behavior locally.

The edge guard must actually be included in the new deploy. Offline bundling and
local routing tests pass; the Netlify cloud adapter/request chain has not been
exercised for this commit. After an authorized push, verify the deployed manifest
and harmless blocked routes before browser form/account testing. Existing
immutable preview URLs still run their old unsafe code. Direct production APIs,
intentional cross-origin production calls and navigation away from the preview
are outside this guard's boundary. No live CORS/permissions were changed.

## Push-time effects versus runtime effects

The only tracked GitHub workflow runs on development push, PRs to main and manual
dispatch. It installs dependencies, audits them, builds, runs guarded tests,
checks types/modules/lint and replays SQL in its own disposable PostgreSQL cluster.
There are no deploy, Supabase migration/seed/function-publish, write-token,
production fixture, custom webhook or artifact-publishing steps. Earlier GitHub
inspection found read-only default Actions permissions and PR approvals disabled.
Package install/audit and PostgreSQL installation need package-network access;
this is not a claim that remote CI is an OS-level offline sandbox.

Netlify can build and deploy the eligible PR preview. `npm run build` exports
pages and sanitizes preview form detection on disk. Build/prerender completed with
all outbound networking denied. No root install/build lifecycle hook, live API
call, Blob write, database seed or deploy command is present in that build path.
Module imports also pass the transport-denying preload. No custom local Git
hooks or hooksPath are configured; only sample hooks exist. No schedule/background
or deploy-event function was found. Creating a preview necessarily updates
Netlify deployment metadata and incurs normal build/hosting usage; that is not
publishing the production site or writing Lockliel application records.

`vite.config.ts`, Sites/Vinext build helpers, `worker/index.ts`, D1/Drizzle and
Wrangler dependencies are inactive in the supported Next/Netlify build. Local
`.openai/hosting.json` and `.netlify/state.json` were absent; no tracked alternative
hosting manifest or active publishing script was found. `db:generate` is legacy
D1 generation, not a live Supabase command and not a build dependency. No claim
is made that the separate published ChatGPT Site is bound to this checkout.

Merely pushing these commits does not apply the two pending SQL migrations,
deploy Supabase functions, enable its Git integration, change main, publish either
production website or modify production permissions/configuration. Work's
point-in-time settings and the exact reviewed code support that conclusion.

## Validation and preservation

- Baseline before edits: 311/311 Node tests, Webpack, types, targeted lint and
  Netlify checks passed with OS outbound denial.
- After isolation: `npm test` passed Webpack export and 377/377 Node tests, zero
  failures/skips. The 66 added tests cover all 58 entrypoints across ten blocked
  contexts and seven methods, production pass-through/referral/auth denial,
  spoofed context rejection, native forms, custom/direct/GET routes, static
  local/preview pages and form-export behavior.
- `npm run validate:netlify`: 63 modules checked and 59 handlers imported.
- `npm run lint:tooling` and `npm run typecheck`: pass.
- The preceding four commands ran in an empty credential environment under
  macOS sandbox-exec with all outbound networking denied. A reserved-address
  socket probe confirmed OS denial without contacting a production destination.
- `npm run test:sql`: all 274 authoritative migrations and seven SQL files pass
  in a fresh PostgreSQL 17 cluster, with IP networking denied and only its local
  Unix-socket path permitted. SQL files/harness are unchanged by isolation.
- Offline esbuild bundling of the edge guard passed. This is not a cloud deploy.
- AST-assisted comparison restored the original text after removing the wrapper
  and import from each handler: all 58 match `ce7439f` byte-for-byte.
- Whitespace and a limited added-content credential-pattern check passed.
  No full security certification or repository-wide lint-clean result is claimed.

No migration was added or changed in this package. Pending earlier migrations
remain `20260925035350` and `20260926212002`, both unapplied to production.
No frontend source/assets or dependency lockfile changed. Both published sites,
main, live data, permissions and settings were untouched by this work.

## Assessment, unknowns and next package

**SAFE TO PUSH DEVELOPMENT BRANCH** for the exact reviewed package and Work's
verified deployment settings. This is a technical recommendation, not a push
performed or authorization to merge, release SQL or use production fixtures.

Outstanding: remote CI execution; cloud edge/form routing verification; old
previews remain unsafe; full repository lint debt; pending database release;
Auth/SMTP launch checks and other pre-existing readiness gaps. The exact currently
served Netlify source/assets and ChatGPT Site source binding are not established.
Neither published visual version has a recoverable source/assets baseline from
this package. Before substantial frontend changes, Chat must choose the visual
authority and preserve that baseline. No such frontend work started.

RECOMMENDED THINKING LEVEL: HIGH

NEXT CODEX PACKAGE, PROPOSED ONLY: authorize one controlled push of the reviewed
development HEAD to origin/lockliel-backend-v1 without rewriting history. Recheck
remote SHA and settings for drift, push only that branch, inspect remote CI and
the new PR preview's edge/serverless manifest and harmless denial responses.
Do not merge, publish production, apply SQL or test with real data. Verify native-form paths with empty POST bodies, without a form-name or personal
data, and require the guard's 503 code before considering wider browser testing. Return exact pushed SHA, CI results, preview identity,
guard evidence and any remaining blocker. Do not start this package without a
new assignment.

## Technical references

Netlify's [Functions context API](https://docs.netlify.com/build/functions/api/)
and [Edge context API](https://docs.netlify.com/build/edge-functions/api/) document
the trusted deployment context. [Edge declarations](https://docs.netlify.com/build/edge-functions/declarations/)
and [error handling](https://docs.netlify.com/build/edge-functions/optional-configuration/)
support the catch-all/fail-closed configuration. The documented
[request chain](https://docs.netlify.com/resources/troubleshooting/request-chain/)
places uncached edge handling ahead of functions and redirects. Actual cloud
Forms interception still requires the post-push verification described above.
[Blobs API](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) describes
`getStore` as site-wide across deploy contexts; [Forms setup](https://docs.netlify.com/manage/forms/setup/)
describes deploy-time detection, and [Forms troubleshooting](https://docs.netlify.com/manage/forms/troubleshooting-tips/)
describes form field changes affecting the site's display of prior submissions.
