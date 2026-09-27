# Lockliel architecture

Baseline: 2026-09-26, development commit
`47409a2796a5275e12684cb4a182cb008c4d5414`.
See `CURRENT_BUILD_STATE.md` for live evidence and verification limits.

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
