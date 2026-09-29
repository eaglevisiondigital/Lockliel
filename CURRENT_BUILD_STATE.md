# Lockliel verified continuity baseline

Inspection date: 2026-09-26 UTC. Repository and Supabase observations below are
separate evidence sources. They are point-in-time findings, not a launch approval.

## Session Pooler rehearsal blocked (2026-09-29)

Project-specific Session Pooler TLS and authentication passed, but requested startup safeguards did not: read-only was off, lock timeout 0 and statement timeout 2min. The helper stopped before release preflight or CLI dry-run. No production mutation or push occurred; all 274 migration hashes remain intact. Session Pooler is NOT approved for this runner. See `docs/session-pooler-rehearsal-2026-09-29.md`. A new execution assignment is required after a compatible connection and fresh gates are verified.

## Migration resume: direct network blocked (2026-09-28 local)

The new handoff confirms Owner MFA with two factors and operator possession of
the database password. Fresh 2026-09-29 03:52 UTC read-only stage-272 preflight
passes, with unchanged catalog/security, zero incompatible emails and no write
activity across 44.501 seconds. Both migrations remain unapplied.

Approved direct endpoint is IPv6-only and this host returns `No route to host`.
No password was collected, no migration was attempted, and no reviewed pooler
fallback exists in the runbook. Resolve direct connectivity or separately review
and rehearse a pooler before secure input and renewed release gates. No production
mutation or push. See `docs/production-migration-release-2026-09-28.md`.

## Production migration attempt: blocked before execution (2026-09-28 local)

The new assignment authorizes exactly the two pending production migrations.
Read-only checks at 2026-09-29 03:27 UTC passed the existing stage-272 checker:
ledger/catalog/security match, zero incompatible emails, normal health, no Security
Advisor findings and unchanged write counters across 51.669 seconds. All 274
migration hashes and pinned CLI 2.118.0 binary hash are intact. User-supplied
September 28 07:23:45 UTC physical backup was about 20 hours old.

No migration was attempted. Execution remains blocked by unconfirmed Owner MFA/
recovery access and unavailable password-authenticated direct TLS connection.
Production remains at 272; both pending versions are unapplied. No push, production
mutation, deployment or activation. See `docs/production-migration-release-2026-09-28.md`.
Resume only after those gates are satisfied and fresh preflight/CLI dry-run checks
pass. The supplied Auth/SMTP changes are user-reported and were not modified here.

## Getting a Grip remote checkpoint (2026-09-27)

**GETTING A GRIP REMOTE CHECKPOINT VERIFIED.** One authorized normal development
push advanced `9eee9ee` through local evidence `559639b` to
`48a9e10640ae430638d9921917209a023774bdc2`. Both push and PR CI passed: 456 JS
checks, 274 replayed migrations, 10 SQL/RLS files, build, types, Netlify validation,
configured lint and zero production dependency vulnerabilities.

Ready preview `6ab928cc144ffe0008903f15` represents the exact implementation.
`/getting-a-grip` returns approved copy and correct account links without protected
resource exposure. All 26 harmless backend probes returned expected denial.
Main and PR status, Netlify production identity/homepage hashes, ChatGPT Site
version 25, Supabase migration/security/content/write fingerprints and Edge
Function metadata are preserved. Production remains at 272 migrations with zero
Getting a Grip Share Library rows. No production write, activation, migration,
settings change or deployment occurred. Post-checkpoint documentation stays local.

See `docs/getting-a-grip-remote-checkpoint-2026-09-27.md` for exact runs, commits,
checks and evidence limits. Next proposal: a separately assigned read-only course
production-readiness inventory. Do not start or activate content automatically.

## Getting a Grip invitation (local, 2026-09-27)

Implemented on `559639baf90aa60e8dac3423d78fa599b135b789`, preserving remote
`9eee9ee50cd6a21e0dde804b00725d17d6d31f93`. Public `/getting-a-grip` uses the
approved copy and exact signup/sign-in CTAs. Passive content manifest is
**APPROVED FOR FUTURE RELEASE / NOT YET ACTIVE IN PRODUCTION**. No library row
was created in production and no runtime fallback exposes the unreleased asset.

Existing referral cookies, signup attribution and published foundational-course
profile enrollment were verified using mocks/disposable SQL. The existing My Five
invitation filter now includes course assets; ten lanes and explicit confirmation
remain intact. 456 JS tests, 274 migration replay, 10 SQL/RLS files, build, types,
Netlify validation, configured/targeted lint and zero-vulnerability production audit
passed. Synthetic browser checks passed at 390/768/1365 widths with local-only
networking. All 274 historical migration hashes remain unchanged.

No push, migration, production write, content activation, settings change, main
change or website publication. No live authenticated course readiness was inferred.
See `docs/getting-a-grip-invitation.md`. Next: separately authorize a controlled
development checkpoint, then inspect its exact preview. Production activation is
separate and requires destination/course readiness verification.

## My Five remote checkpoint (2026-09-27 UTC)

**MY FIVE REMOTE CHECKPOINT VERIFIED.** One authorized normal development push
advanced `cc6f430a1e03ba55a44774e8ade8fa05edec4617` through local evidence
`2b31eafd4ba67489cab4b2ecb8b24dab2ef46fd1` to implementation
`9eee9ee50cd6a21e0dde804b00725d17d6d31f93`. Initial tree was clean; all 274
migration hashes and the release-preparation package remain unchanged.

Both push/PR CI runs passed: 447 JavaScript tests, 274 fresh migrations, nine SQL
files, build, types, 72-module/62-handler validation, configured lint and zero
production dependency vulnerabilities. Ready deploy-preview
`6ab908caa929c30008a61d79` matches the exact implementation. All 26 harmless
GET/empty POST probes were denied safely; ten static pages passed, including the
new person page. Connected preview features remain blocked by design.

Main and other refs are unchanged. PR #3 is open against main with auto-merge off.
Before/after Netlify production identity/homepage hashes, Sites version 25/source/
publication/access metadata, and Supabase ledger/security/function/write-counter
baselines match. Production still has 272 migrations; both pending remain absent.
No production DB write, migration, publication, settings/permission change, merge
or real-data test occurred. No next feature package started.

Full evidence and limits: `docs/my-five-remote-checkpoint-2026-09-27.md`.
Post-verification documentation remains local and is not part of a second push.
Next recommendation: one approved Getting a Grip Share Library invitation, after
Chat supplies the content/destination/readiness decision. Do not start automatically.

## My Five + Share Center, local package (2026-09-27)

Implemented from clean local continuity commit
`2b31eafd4ba67489cab4b2ecb8b24dab2ef46fd1`, preserving the last verified remote
Member Journey baseline `cc6f430a1e03ba55a44774e8ade8fa05edec4617` and release
preparation `fc78dcea390df434c7378da58566e35cf88f4bf5`. This is local implementation
evidence, not deployed evidence. No push or subsequent feature package ran.

- My Five links to a private person page with deterministic guidance, prayer,
  bounded editable notes, reminders, explicit follow-up and share confirmation,
  and a timeline derived from existing records. Existing six statuses are reused.
- Dashboard priority six can name the person needing follow-up. Onboarding and
  course priorities remain above it. Future reminders and absent/revoked linked
  inviter-followup permission suppress outreach prompts.
- Share Center has ten need lanes, normal/person-specific modes, released-resource
  filtering and truthful empty states. Copy/native/app preparation no longer
  automatically records a share as sent. Original attribution is unchanged.
- No schema change. All 274 migration hashes still match the release manifest.
  Disposable fresh replay and nine SQL/RLS files pass. The two pending production
  migrations remain separately controlled and unchanged.
- Local validation: 447 JavaScript tests, Webpack/static build, TypeScript,
  72-module/62-handler Netlify validation, configured and changed-file lint pass.
  Production dependency audit reports zero vulnerabilities. Tests have OS egress
  denial; audit uses a fixed npm-registry proxy with localhost-only npm access.
- Authenticated browser evidence is synthetic, with mocked APIs. See the focused
  implementation record for responsive checks and limits. No real member data or
  live authenticated integration was used.

No production DB write, migration, deployment, settings/permission change, main
merge, or published-site edit occurred. Current remote/production state was not
re-inspected for this local package; previous evidence below is point-in-time.
Next: controlled development checkpoint, then approved Share Library content and
Getting a Grip invitation readiness. Do not start either automatically.
See `docs/my-five-guided-follow-up.md`.

## Current Member Journey remote checkpoint (2026-09-27 UTC)

**MEMBER JOURNEY REMOTE CHECKPOINT VERIFIED.** The single authorized non-force
development push advanced `b2adf96e988380c36e3b3b0275f7b866067e078c` to exact
Member Journey commit `cc6f430a1e03ba55a44774e8ade8fa05edec4617`, preserving both
local evidence/release commits. Initial tree was clean and all 274 migration hashes
matched. Main remains `77d1d1918793bc6a25f38721e882f3d011903bad`; PR #3 is open
against main with auto-merge disabled. No second push or production release ran.

- Push CI `36315118426` and PR CI `36315120777` both passed: 411 JavaScript tests,
  build, types, 68-module/61-handler validation, configured lint, 274 fresh migration
  replay and eight SQL/RLS files. Production dependency audit remains clean;
  known full-install findings remain outside this package.
- Netlify preview `6ab8fab5b738c40008b06835` is ready at exact `cc6f430`, review 3,
  context deploy-preview, with 60 functions and one edge function. Seventeen
  harmless probes, including new onboarding/next-step routes, returned expected
  no-store 503 denial, no cookies/redirects. Seven static pages passed; the five
  public form pages have no Netlify detection attributes. Connected preview
  features remain blocked by design.
- Before/after production deploy/commit/publication and both homepage hashes
  match. Sites version 25/source archive/publication/access metadata match.
  Supabase remains ACTIVE_HEALTHY at 272 migrations, with identical ledger,
  security fingerprints, five function versions and 93-table write counters.
  No production data, schema, settings, permission, site or main change occurred.

Full evidence and limits: `docs/member-journey-remote-checkpoint-2026-09-27.md`.
Post-checkpoint continuity documentation is local only. No new feature development
or My Five / Share Center package started. Production migration gates remain
separate; authenticated browser validation still needs an isolated backend.

## Member Journey local implementation baseline (2026-09-27 UTC, before checkpoint)

At completion this package was **IMPLEMENTED AND VALIDATED LOCALLY**. The later
authorized remote checkpoint above supersedes its original no-push status.
Started from clean
`fc78dcea390df434c7378da58566e35cf88f4bf5` on `lockliel-backend-v1`. Both this
release-preparation commit and its parent `f03fb3207bcd631a315fc2f304eaba9854ec56bd`
are preserved. The recorded remote development/main SHAs below were not refreshed
in this implementation package. No remote ref, production data or setting changed.

- Added four-step onboarding, one prominent deterministic Next Best Step, and
  dashboard course, My Five, resources, community and descriptive progress panels.
  Existing member CSS, tools and operational role checks are retained. The starting
  commit retains the recoverable local source/assets baseline. Neither published
  website was edited, and no broader visual-source selection is implied.
- Reused the protected profile-completion trigger, private faith profile, Grip
  enrollments and canonical translated lesson/media progress, My Five, group and
  orientation state, and active Share Library. No new schema or migration. All
  274 migration files and the separate release-preparation files remain unchanged.
- New caller-scoped `/api/lockliel/next-step` and `/api/lockliel/onboarding` handlers
  use active sessions, existing JWT/RLS and the nonproduction backend guard.
  Recommendations contain navigation and counts, without private answers, contact
  identities/notes, or sensitive reasoning. Journey labels grant no permissions.
- Private onboarding writes do not touch `wants_group` or `wants_host`, whose
  existing trigger would create/close staff-visible requests. Optional answers may
  be skipped. Existing preferences and contact consent are preserved. UI event
  hooks carry names only and are browser-local, not new durable analytics.
- Validation: **411 JavaScript tests passed**, including 26 new focused tests and
  coverage of both new default handlers by the existing preview-isolation suite.
  Webpack export, TypeScript, 68 Netlify modules/61 handlers, tooling and targeted
  lint passed. Fresh replay of 274 migrations and **8 SQL/RLS files passed** in
  disposable PostgreSQL 17. Real RLS tests are local; no live fixtures ran.
- Mocked Chrome validation covered the four onboarding steps, dashboard empty and
  populated states, worksheet navigation, failure recovery, and 390/768/1365 widths.
  All API responses were synthetic; external browser requests numbered zero.
  Build/tests used cleared credentials and OS-level outbound network denial.

No production inspection was repeated here. **272 applied production migrations**
is the last verified release-preparation observation, not a fresh measurement.
Both pending migrations still require the separate release gates below. The new
application introduces no build-time write or publishing command. It is ready for
review and a separately authorized development push; previews remain static-only
for connected features until an isolated backend exists.

Detailed implementation, file map, evidence and limitations:
`docs/member-journey-core.md`. New UI hooks have no collector; Multiplying remains
an aspirational label, and mocked browser checks do not prove hosted Auth/PostgREST
integration. Repository-wide lint debt is unchanged. Recommended next product
package, not started: guided My Five follow-up and resource sharing using existing
statuses, consent, attribution and the deterministic service. Live authenticated
browser testing requires a separately scoped isolated environment.

## Separate release preparation baseline (2026-09-27 UTC)

**CONDITIONALLY READY TO REQUEST PRODUCTION MIGRATION AUTHORIZATION.** This
package prepares a release only. No production migration/write, settings change,
push, merge or deployment occurred. Starting clean local HEAD was `f03fb3207bcd631a315fc2f304eaba9854ec56bd`,
above remote development `b2adf96e988380c36e3b3b0275f7b866067e078c`.
Remote main remains `77d1d1918793bc6a25f38721e882f3d011903bad`.

- Fresh read-only evidence: project ACTIVE_HEALTHY, 272 ledger entries, zero
  profiles/Auth users/reviews/applications/staff, three active shares, unchanged
  target catalog/security fingerprints, all 56 public tables RLS-enabled and no
  Security Advisor findings. The committed aggregate/catalog baseline is
  `supabase/verification/release-live-baseline-20260927.json`; its captures are
  point-in-time evidence, not a future release authorization.
- **Email correction:** production already accepts ordinary addresses. Live
  historical SQL/current CHECK use one backslash; the historical repository file
  uses two. Preserve it unchanged. Pending `20260926212002` standardizes `[.]` and
  repository replay. It is not a verified fix for currently broken production signup.
- Supabase CLI **2.118.0**, checksum-pinned macOS arm64 binary, was rehearsed
  against a disposable production-like **272 -> 273 -> 274** ledger. It discovered
  exactly the older bridge plus email with `--include-all --skip-vault`. Separate
  workdirs enforce bridge-only then email-only execution. Ledger bookkeeping is
  atomic with each file for these exact inputs. No seed/role/Vault/config deploy.
- Actual CLI sessions honored 5-second lock and 30-second statement timeouts.
  Bridge drift, ledger failures, incompatible input, contention, timeout and
  pre-commit connection loss aborted without partial state/false ledger entries.
  Whole-public-table data fingerprints, target catalog and security were unchanged
  except the intended email CHECK and two truthful ledger additions. Seven SQL
  files passed at each of the three checkpoints, 21 executions total.
- Local validation: supported build plus original 377 JavaScript tests passed;
  final guarded suite has **383 passing tests**, including six release gate tests.
  Types, Netlify validation (63 modules, 59 imported handlers), targeted lint,
  all-274 fresh migration replay and seven SQL files passed. Production-only npm
  audit has zero findings. Historical full-install 19 findings/13 high remain
  separate; no dependency updates or broad lint cleanup occurred.
- Chat accepted Dave's manual dashboard evidence: Pro, three completed physical
  backups, latest observed **2026-09-26 07:28:11 UTC**; Restore and Restore to new
  project available. PITR disabled; retention duration unverified; Storage object
  bytes excluded. One visible organization Owner, **MFA disabled**. No restore or
  account-setting operation was performed. This is not full recovery readiness.

Engineering recommendation: **OWNER MFA REQUIRED BEFORE MIGRATION**. PITR and
Storage byte recovery are not additional blockers for these two no-DML files at
zero profiles, provided a recent completed recoverable physical backup is verified
immediately before release. Storage recovery remains a broader launch requirement.

See `docs/production-migration-runbook.md` for exact commands, expected results,
STOP conditions, backup/MFA/traffic/health gates and ambiguous-client recovery.
See `docs/release-preparation-2026-09-27.md` for the complete handoff. Production
password/TLS connectivity through the pinned CLI remains unverified; MCP reads do
not prove it. Local PostgreSQL 17.11/platform stubs are not hosted Supabase 17.6 or
full Auth/Storage integration. Both migration files and all historical files are
byte-identical. Application source, package manifests and workflows are unchanged.

Next smallest step: Owner enables/verifies MFA in a separately authorized account
security step and verifies recovery-factor access, then refresh release-time backup,
health, traffic and read-only preflight evidence. Chat must issue a separate explicit
production assignment naming the approved commit and two versions. Do not run the
migration commands, restore, change settings or push automatically.

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
is authorized by this checkpoint. That checkpoint proposed a review of the two pending database migrations; the
current release-preparation section above now records the completed review and
rehearsal. A separate Chat assignment remains required before production execution. Dependency findings need scoped triage.

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
  values. Correction recorded 2026-09-27: current production already accepts normal
  addresses; the double-backslash discrepancy is in the historical repository
  file, not the live stored SQL/constraint. Re-run preflight at
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

Migration `20260926212002_lockliel_correct_profile_email_pattern.sql` was new and
unapplied at this historical checkpoint. The earlier claim that the live database
rejected ordinary email addresses was incorrect and is superseded by fresh
2026-09-27 inspection: live stored historical SQL and the actual live constraint
use a single backslash and accept ordinary addresses. Only the repository copy
of applied migration `20260925153612` contains the double-backslash discrepancy.
Do not rewrite that immutable historical file. The pending `[.]` migration provides
canonical convergence and repository replay consistency, not a verified repair
of an active production signup failure. There were 273 local files at this earlier
checkpoint; the current set has 274 and production still has 272 applied versions.

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
