# Lockliel architecture

## Migration275 security review requires correction (2026-10-01)

Read `docs/course-migration-275-security-review-2026-10-01.md`. Direct isolated
IPv6/verify-full read-only inspection reconfirmed275 and maintenance ON. Missing
service_role CRUD grants are not required by the learner-token/postgres-owned RPC.
However, hosted notes inherit unused Dxtm grants; exact275 disposable tests proved
service_role TRUNCATE bypasses row policies. No hosted grants were changed.

The semantic verifier now rejects excessive service/PUBLIC/column privileges,
including both hosted Dxtm and disposable broad defaults. Catalog mismatch remains
UNKNOWN_STOP; do not normalize it away. A new narrow corrective migration removing
unused notes service grants is PROPOSED, not created/approved/applied. Historical278
migration hashes are unchanged. Focused JS/SQL tests prove the intended RPC works
with zero service table grants after test-only revocation. Read-only final catalog
matches the start. Old schema274 autosave403 is independently reproduced as an
identity-column UPDATE ACL conflict, not a275 regression. Old retry UX still fails.

Keep qjksggxorghaxvpyslip at275/maintenance ON. No replay275,276–278, deploy/reopen,
push, production change or cleanup. Preserve both isolated environments. Before
continuing, Primary Chat must approve correction scope and revised release ordering/
maintenance readiness. Earlier semantic-pass statements are superseded by this gate.

## Hosted cutover stopped at applied 275 (2026-09-30)

Read `docs/course-hosted-275-stop-2026-09-30.md`. Hotspot direct IPv6/TLS verify-full
and CLI authentication now work. New isolated qjksggxorghaxvpyslip started274,
received synthetic fixtures and maintenance, then exact CLI migration275 committed.
Catalog verification returned UNKNOWN_STOP: new lesson_private_notes inherits hosted
service_role Dxtm instead of disposable arwdDxt. All other catalog rows and separate
semantic checks match, but exact verification is NOT passed. Maintenance remains ON,
schemaReady=false. Do not replay275, apply276–278, deploy candidate or reopen.

Original1599ab2 app reads/login/MFA worked in dedicated isolated site70b03a42;
autosave403 exposed an existing identity-column upsert grant conflict. Original
media scripts continued requests while paused; no course write succeeded. Do not
mark old retry UX or full transition passed. Candidate0cfcf405 has exact isolated
configuration binding and is prepared only. Full local558JS/278replay/15SQL,
build/type/Netlify/lint/audit pass; all278 hashes unchanged. No push this task.
Production remains274/main1599ab2 and both published sites unchanged. Preserve both
isolated branches/sites. Next: default-ACL-aware expected catalog review and read-only
classification of already-applied275, with separate authorization before resuming.
Earlier clean274/network-blocked statements below are historical.

## Final hosted maintenance rehearsal, full hosted transition still blocked (2026-09-30)

Read `docs/course-cutover-final-rehearsal-2026-09-30.md` and the updated release
runbook. The manual copy-and-close policy is APPROVED: Dave copies unsaved answers
and notes, confirms ALL old course tabs closed before maintenance, and uses a fresh
post-release tab. No recovery of old memory-only drafts is promised.

Actual private PostgREST maintenance hook is installed ONLY in isolated project
jxtgtfffdiwzxocxoqxk, still278. Hosted synthetic stale writes, direct RPC denials,
new-client maintenance UX, and fresh saves after reopening pass. Implementation
3cf0fd9 and d604a97 stop media retries and preserve read-only course checks.
The complete HOSTED old1599ab2/schema274 to new-app/schema278 sequence is NOT proven:
a second disposable branch is needed; organization/cost confirmation is pending.
Never downgrade or replay migrations in the retained acceptance branch.

Full local validation passes556JS /278 replay /15SQL, including the rerun staged
CLI rehearsal. All historical277 migration bytes unchanged. This assignment permits
development push/CI only; keep PR4 draft and main1599ab2/production274 untouched.
Production trusted durations, Auth, near-zero-loss recovery, operator capability,
fresh direct IPv6 and stable release window remain unsatisfied gates. Retain both
acceptance resources. Earlier pending-manual-policy/disposable-only-hook statements
below are historical and superseded by this entry.


## Local course cutover preparation and278 (2026-09-30)

Migration278 narrows lockliel_sample_media publication eligibility, locks relevant
canonical/content rows, then rechecks before any credit write. No engine redesign or
backfill. See `docs/course-release-278-transition-2026-09-30.md`.

Temporary operational SQL (outside the migration ledger) implements a closed private
control, course-table drain/write triggers, restrictive reads and PostgREST pre-request
protocol check. The candidate journey handler fails closed on missing maintenance
status. Schema count/final-function fingerprint gates prevent premature reopen.
New client protocol278-v1 is compatibility metadata, never authorization. The saver
retains drafts and stops retries on503/426. Operational installation, hosted
PostgREST behavior and exact app cutover remain unverified outside disposable tests;
there is no implicit deployment approval. Old production tabs require an unresolved
copy-and-close decision. The published artifact is unchanged.

## Media publication boundary requires a database correction (2026-09-30)

Disposable 277 tests prove `lockliel_sample_media` remains writable for enrolled draft/
archived canonical courses, including a published translation. The definer RPC's own
eligibility resolution must enforce published canonical/content courses; an application
handler cannot close direct authenticated RPC access. See the transition preparation
report for the minimal278 proposal. No function or migration has been changed.

## Course release transition constraint (2026-09-30)

The production 1599ab2 handler uses direct progress writes blocked by candidate 275's
restrictive policies. Candidate 91611ad needs columns/RPCs absent from schema 274.
Neither ordinary rolling order is compatible. Review proposes a controlled course
maintenance transition, staged 275→276→277 then application, plus stale-client handling.
That mechanism is not yet implemented/rehearsed. See the production release review.

## Dedicated acceptance artifact and hosted repairs (2026-09-30)

The separate artifact pins site `60579b8e-d0ca-4ac1-abe5-7128f4243e8b` and isolated
backend `jxtgtfffdiwzxocxoqxk`, 14 handlers including authorized signup, HTTPS Secure
cookies and a commit/function-hash identity manifest. Original production bindings and
preview guards stay unchanged. Branch SMTP is off and confirmation is not required.

New migrations 276/277 follow immutable 275: private release-trigger execution retains
readiness/RLS; business CAS conflicts use PT409 instead of retryable 40001. The save
controller explicitly archives a conflicting local draft before adopting cloud state.
Manager projection parses each response once and counts all course lessons rather
than only started records. It never queries private learner notes. See the isolated
acceptance report for hosted evidence and exact isolated ledger mapping.

## Course configuration readiness (2026-09-30)

`lessonReadiness` / `courseReadiness` in the existing pure engine distinguish active
supported media, trusted duration, required worksheet and protected resource mapping.
Readiness never grants enrollment or progression. The member overview/player retain
server gates and show pending content without technical jargon. The same projection
feeds MFA/role-restricted admin content tools; no learner notes enter this projection.
Manual duration verification requires seconds plus a descriptive authoritative source;
the database stamps verification and clears timing on video identity changes. No
provider API credential or metadata fetch was introduced. Private storage paths are
replaced by a boolean mapping indicator in the member journey DTO.

Getting a Grip remains Model A/95/no-score/sequential with required worksheets. Its
permanent database constraint rejects clearing rules or switching to Model C. Existing
274 migration files are immutable; only unapplied candidate 275 changes. Its private
grading table has RLS and no public/authenticated grants. Existing legacy direct media
writes cannot bypass configured rules through an unconfigured translation in the same
course family. The hosted isolation plan is `docs/course-engine-hosted-acceptance.md`;
ordinary previews still deny every production-backed handler.


## Reusable course engine candidate (2026-09-29)

The approved Champion Life finished course standard is implemented through the
existing Lockliel course/enrollment/content/translation/progress architecture.
`course-engine.mjs` projects server gates; one React workspace renders every lesson;
`lib/course/autosave.mjs` owns resilient drafts and revision saves. New atomic lesson
and server-timed media RPCs replace identity-column REST upserts. Minimal new tables
hold learner-private notes and nonpublic versioned grading keys. Configurable models
A/B/C/D separate advancement, worksheet, score and reviewed completion. Snapshots
retain answered prompts/media identity; existing completion and attribution remain.
See `docs/course-engine-reconciliation.md` for schema, future management limits and
release dependencies. The one new migration remains unapplied in production.

## Production deployment baseline (2026-09-29)

The My Lockliel application and Getting a Grip invitation are now published on Netlify main at merge `1599ab271e0120a5cdc4e38e225ba749dd214721`, deploy `6abbb27a1cdd6d00081b0e8e`. Supabase remains at 274. Public design is preserved with the My Lockliel nav addition. The passive Share Library manifest is still not active production content. Preview handlers remain fail-closed; production unauthenticated session responds 401 correctly. See `docs/production-application-release-2026-09-29.md`. Earlier local-only feature labels describe prior checkpoints.

Baseline: 2026-09-26, development commit
`47409a2796a5275e12684cb4a182cb008c4d5414`.
See `CURRENT_BUILD_STATE.md` for live evidence and verification limits.

## Getting a Grip invitation (local, 2026-09-27)

`/getting-a-grip` is a static public invitation, not a course reader. It imports
approved title/description from a passive release manifest, with signup/sign-in
links only. The existing whole-site referral cookie feeds signup Auth metadata;
existing bootstrap resolves lineage and the faith-profile trigger enrolls eligible
profiles into a published foundational course. No duplicate enrollment service.

The manifest is not imported into the Share Library APIs. Existing admin draft and
active release controls remain required. `lib/share-selection.mjs` allows both
course and invitation assets in the My Five invitation filter, after the active
library API response. Category/type mapping still yields exactly new-faith, bible,
and discipleship without changing the ten-lane taxonomy. See
`docs/getting-a-grip-invitation.md` for release limits and verification evidence.

## My Five guided follow-up (local, 2026-09-27)

`my-five.mjs` owns pure stage, reminder, next-action and timeline projections.
`my-five-data.mjs` reads the caller's contact first, then owner-scoped links and
share preparations. `lockliel-my-five` exposes a small person DTO and explicit
note/reminder/follow-up/share-confirmation operations. Notes use `updated_at`
optimistic concurrency; writes remain caller-JWT PostgREST operations under RLS.

The static person route uses a query ID; its private data comes only from the
protected API. Existing list, messaging and consent architecture remains intact.
`next_follow_up_at` is the private reminder store. Staff-purpose `follow_up_tasks`
remain in the existing Connections experience and are not repurposed for notes.
No scheduler or recipient messaging transport was added.

Member Journey uses the same pure person action at priority six for due reminders
or a confirmed share not yet followed up. Mandatory onboarding/course order is
preserved. Share need lanes in `share-guidance.mjs` project existing categories
and types; unknown/empty categories do not manufacture released content.
Existing locale/type-compatible selection survives. Share assets describe
approved navigation, not entitlements. Protected delivery remains on its existing
entitlement-checked API and Storage policies. Raw files, reader/download/API
paths, external destinations and query-bearing share targets are excluded.
See `docs/my-five-guided-follow-up.md` for bounded history and implementation limits.

## Member Journey Core, local implementation (2026-09-27)

The authenticated member experience now has four short onboarding steps and one
primary recommendation. `netlify/lib/member-journey.mjs` is the pure deterministic
domain boundary; `member-journey-data.mjs` reads narrow caller-scoped data; the new
`lockliel-next-step` handler returns a rendering projection. It does not persist
recommendations, invoke AI, write progress or confer eligibility. UI components
consume this decision instead of duplicating priorities or the older persisted
`member_journey.next_step_*` labels.

Priority is onboarding, active Grip lesson, unfinished requirement, unstarted Grip,
empty My Five, due follow-up, actionable community, approved host orientation,
ranked resource, healthy growth. Video/worksheet requirements refine an active
lesson CTA. `course-journey.mjs` extracts the existing translated player reader
without changing the POST/completion path; its summary mode excludes worksheet
answers and storage paths. Enrollment alone is not course activity. Unavailable
content never implies a fabricated enrollment or lesson entitlement.

Onboarding reuses `/api/lockliel/profile` for the protected profile transition and
`/api/lockliel/onboarding` for optional private interests/new-believer selection.
Completion derives from an active profile and an existing faith-profile row,
including an intentionally empty selection. Existing members satisfying those
conditions need not repeat onboarding. Profile and preference saves are separate
retryable requests, not an atomic multi-table transaction. There is no duplicate
profile, survey, consent or recommendation store and no new migration.

My Five uses existing statuses and due dates. Community reads actual memberships
and pending requests. Resource ranking uses active Share Library category and
locale variants, with safe local destinations. Journey stages are descriptive;
Multiplying is displayed as an ongoing goal without a fabricated achievement.
New browser-local event-name hooks respect Do Not Track and have no transport or
collector. Existing durable module events remain authoritative for actual actions.

Both new default handlers retain `withProductionBackend`. The local count is now
61 imported handlers/68 Netlify modules; the deployed baseline below predates this
package. No manifests, workflows, dependency versions, public landing pages or
published websites changed. Read `docs/member-journey-core.md` for API and test scope.

## Current deployment boundary (2026-09-26)

Work verified production branch main, PR previews enabled, standalone branch
deploys disabled, no listed build hooks/plugins/dashboard project variables,
empty GitHub repository webhooks and disabled Pages. Supabase has no connected
repository and no branches. Netlify and ChatGPT Codex Connector are installed
repository apps. An empty webhook list does not disable app-based previews.
Full provenance and limits: `docs/deployment-safety-review.md`.

The separate ChatGPT Site version 25 remains active, with last successful
publication August 27, 2026 and no custom domains. Its source binding is unknown;
do not infer a publishing route from the historical Sites files in this repo.
Preserve it and Netlify production until Chat selects a visual source and a
recoverable source/assets baseline is retained before substantial frontend work.

New request boundary: `netlify/edge-functions/preview-isolation.js` runs for all
paths with fail-closed error handling. Outside trusted production context it
blocks every method except static GET/HEAD, plus API, direct-function, referral
and protected-reader GET/HEAD paths. Each of the 58 serverless handlers also uses
`netlify/lib/deployment-safety.mjs` to reject every nonproduction invocation
before its existing body runs, including direct function URLs. Explicit trusted
production context passes through without changing authentication or responses.

The build remains Webpack static export, followed by
`scripts/isolate-preview-forms.mjs`. For production CONTEXT the exported HTML is
unchanged. Every other build context removes only form-detection attributes so
preview deployment cannot register/update shared Netlify form definitions. The
edge guard independently handles runtime submissions to already known names.
No additional backend or preview credential exists. Local frontend development
continues; backend behavior is tested using mocks and disposable SQL. Previews
are for static review until an isolated backend is separately approved.

## Implemented application shape

`package.json` uses Next.js 16.3.6, React 19.2.6 and TypeScript. `next.config.ts`
sets `output: "export"` and unoptimized images. `netlify.toml` builds with
`npm run build`, publishes `out`, and bundles `netlify/functions` with esbuild.
This is a static Next.js frontend with Netlify API functions, not a deployed
Next.js server inferred from the framework name.

```text
Browser: static Next.js pages and client components
  -> /api/... Netlify functions
     -> Supabase Auth and REST/RPC with the caller's token
     -> Supabase private Storage with scoped access
     -> public-intake or privileged Supabase Edge Functions as appropriate
  -> separate Faith Boost / book-release Netlify Forms and Blobs flows
```

Supabase is the member platform's system of record: identity, profiles,
relationships, courses, commerce foundations, staff authorization and audit.
`netlify/lib/lockliel-core.mjs` centralizes the project endpoint, publishable-key
requests, HttpOnly cookies, token refresh, Auth user validation, active-session
checks and AAL parsing. Actual staff authorization also depends on database roles
and RLS. The publishable key is not reproduced in continuity documents.

## Application inventory

| Area | Repository evidence | Responsibility |
| --- | --- | --- |
| Public ministry and resources | `app/page.tsx`, `app/founders-50/`, `app/who-god-says-you-are/`, `app/a-heart-for-the-lost/` | Vision, intake, free resource, book notification |
| Account and security | `app/my-lockliel/sign-in/`, `sign-up/`, `security/`; `netlify/functions/lockliel-{login,signup,session,mfa,account-security}.mjs` | Account lifecycle, cookies, MFA and session management |
| Member information | `app/my-lockliel/profile/`, `faith-profile/`, `preferences/`, `notifications/` | Profile, private assessment, consent and preferences |
| Relationships and outreach | `app/my-lockliel/share/`, `connections/`, `leader/`, `group/`, `founder/` | My Five, referrals, reviewed leadership, groups and orientation |
| Learning | `app/my-lockliel/journey/`; `lockliel-journey.mjs`, `lockliel-lesson-resource.mjs` | Enrollment, lessons, notes, media progress and protected assets |
| Member commerce | `app/my-lockliel/partner/`, `orders/`, `resources/`, `fulfillment/` | Giving/order history, entitlements and fulfillment foundations |
| Staff operations | `app/my-lockliel/admin/`; `netlify/functions/lockliel-admin-*.mjs` | People, CRM, reviews, groups, content, finance, roles, privacy, readiness and integrity |
| Privacy | `app/my-lockliel/privacy/`; `lockliel-privacy*.mjs`, `netlify/lib/lockliel-export-pages.mjs` | Requests and caller-scoped exports |
| Destructive execution | `supabase/functions/process-account-deletion/` | Explicit staff-authorized, service-credential-backed deletion workflow |

Paths grouped with braces or shortened directory names above are inventory
notation; inspect actual files before editing. Existence of these surfaces does
not establish completed live user-journey testing.

## Database and deployment boundaries

- `supabase/migrations/`: 272 versioned SQL files at the baseline.
- Live `public` schema: 56 tables, all RLS-enabled, and 111 policies.
- `app_private`: authorization helpers, guarded workflow implementations,
  bootstrap and internal deletion support. Public RPC wrappers generally retain
  caller security; privileged service-only exceptions are documented separately.
- Private `lesson-assets` and `member-resources` buckets store protected resources.
- Five Edge Functions are represented in `supabase/config.toml` and deployed.
  Their entrypoint contents match this commit; see the baseline table.
- No organization/tenant model is asserted by this baseline. The observed model
  is a dedicated Lockliel project with member, relationship, group and staff
  boundaries. Future multi-organization scope requires explicit design.
- Translation keys and language-aware course/resource resolution are implemented
  foundations. They do not prove a complete translated catalog or native app.

## Separate Netlify resource systems

`docs/faith-boost-resource.md`, `netlify/functions/faith-boost-*.mjs`, and
`netlify/lib/faith-boost-core.mjs` describe a private Blobs store plus Forms capture,
an opaque reader cookie and an allowlisted bundled PDF/image reader. Free-resource
access is not proof of email ownership and is not a Supabase member login.

`docs/heart-for-the-lost-release.md` and `netlify/functions/book-release.mjs`
describe book-specific consent and a separate Blobs/Forms notification list.
These flows do not themselves send release announcements, welcome emails or SMS.
Both signup handlers also make a best-effort `capture-lead` call into Supabase
CRM (`book-release.mjs` and `faith-boost-signup.mjs`). The existing resource docs
omit this later mirroring behavior. A successful resource signup does not prove
that the CRM mirror succeeded, and it does not expand the supplied consent.
Supabase-only privacy inspection cannot establish complete retention/deletion
coverage for these separate stores. Their deployed data and configuration were
not inspected during this baseline.

## Inactive and legacy infrastructure

Provider-neutral checkout, payment-event, giving, benefit and fulfillment tables
exist. `lockliel-partner.mjs` reads readiness and history; this does not establish
a working gateway checkout or webhook. All live provider records are disconnected.

Vinext, Vite, Cloudflare, Drizzle and Sites starter artifacts remain in the tree
and dependencies. The current build and CI use Next.js and Netlify. Do not infer
that D1, Sites hosting, ChatGPT sign-in, or the unrelated Prime49 system is an
active Lockliel dependency. Preserve these artifacts until a scoped cleanup
establishes which can safely be removed.

## Local validation update, 2026-09-26

The supported build is now explicitly `next build --webpack`; static export is
unchanged. README.md is authoritative for commands. CI uses all guarded Node
tests and an independent disposable PostgreSQL 17 job. Resource signup factories
accept a separate CRM `mirror` transport with the same production fetch default.
SQL compatibility fixtures and catalog supplements are test infrastructure only,
not a second application schema or proof of full Supabase service equivalence.

## Reconciled migration chain, 2026-09-26

The authoritative chain includes the documented reconstruction at ordering version
`20260925035350`. Historical test-only supplements were removed. Targeted catalog
parity for review/share objects is checked by the same query used for live reads.
The bridge creates missing fresh-environment objects or verifies a matching
completed existing schema without DDL/DML. Other partial schemas fail closed.
Platform compatibility stubs remain distinct from migrations and test data.
See `docs/migration-reconciliation.md` for why normal chronological forward-only
DDL cannot repair the earlier replay failure without this bounded exception.

## Prepared migration release boundary, 2026-09-27

The official pinned Supabase CLI 2.118.0 performs future version-preserving SQL
release. Repository helpers only prepare byte-verified external workdirs and check
read-only captures; the rehearsal creates its own offline PostgreSQL 17 cluster.
Two workdirs enforce 272 -> bridge-only 273 -> email-only 274. No application,
Netlify, Sites, Edge Function, seed, role or Vault deployment is combined with it.
Existing production email semantics are valid; canonical `[.]` provides convergence
with immutable repository replay history. Follow the production migration runbook
for the independent authorization/recovery/MFA gates. No live release occurred.
