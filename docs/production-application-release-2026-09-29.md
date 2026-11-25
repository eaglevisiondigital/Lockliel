# Production application release verified

Released 2026-09-29 under the explicit assignment to merge PR #3 and allow the
normal Netlify main deployment. No application edits or development push occurred.
Local evidence commit `c2ad20aa5477f12556f3dc1b0d892a165769115d` stayed local.

## Preflight and merge

- Approved PR head: `9a4129aeaafeaf43e15fc6df9f8d262b8a63ec3f`.
- Main before: `77d1d1918793bc6a25f38721e882f3d011903bad`.
- PR #3 was open, unmerged, mergeable, base main, exact approved head; auto-merge
  disabled. Both Lockliel Preview Check runs passed: push `36566827934`, PR
  `36566832764`. Baseline: 501 JS tests, 274 disposable migration replay,
  10 SQL/RLS files, build/static export, TypeScript, configured lint, Netlify
  validation and zero production dependency vulnerabilities. These were the
  completed exact-head CI results, not newly rerun local tests in this release.
- Exact preview `6abbabb1f3101300082e9778` was ready and green.
- Fresh read-only Supabase checks matched the checkpoint: 274 ledger entries,
  zero pending local versions, 56 public tables with RLS, clear Security Advisor,
  healthy project and unchanged ledger/security/content/write fingerprints.
- Netlify published production was main at the expected old commit.
- GitHub normal merge completed at **2026-09-29T12:43:15Z**, using the API's exact
  head SHA condition, with no squash, rebase, force-push or auto-merge.
- Merge and new remote main: `1599ab271e0120a5cdc4e38e225ba749dd214721`.
  Its parents are the old main and approved PR head. Tree
  `98e13d1dc4b6c1fe8a021854e4a8b955df3c0bea` exactly matches the approved head.
- PR #3 is MERGED. Only main/default HEAD changed; GitHub removed its synthetic
  PR merge ref. Development and all other branches/tags stayed unchanged.

## Production publication

Netlify deploy **`6abbb27a1cdd6d00081b0e8e`** is ready, context production,
branch main, commit `1599ab271e0120a5cdc4e38e225ba749dd214721`.
Published **2026-09-29T12:44:51.484Z** through the normal Git integration.
No manual deployment or Netlify setting change. Established production URLs
remain https://lockliel.com and https://lockliel.netlify.app.

## Harmless public and security verification

GET-only checks returned 200 for `/`, `/getting-a-grip`, `/my-lockliel`,
`/my-lockliel/sign-up`, `/my-lockliel/sign-in`,
`/my-lockliel/forgot-password` and `/my-lockliel/reset-password`.

Browser comparison confirms all 13 homepage sections retain identical rendered
text, IDs and classes, including hero, vision, videos, Faith Boost, Founders 50
and partnership. Image paths are unchanged; all 24 unique homepage image URLs
return 200. Before/after hero screenshots retain the existing design. Public
assets, global CSS, root layout and homepage section components have no source
changes versus old main. The only homepage source addition is the My Lockliel
navigation link. No broad redesign occurred.

Getting a Grip renders the approved invitation and exact signup/sign-in CTAs.
Scoped HTML checks found no protected PDF or Supabase Storage path exposure.
No course access or authenticated integration was tested.

All checked My Lockliel pages have noindex/nofollow/noarchive headers and robots
metadata, strict-origin-when-cross-origin referrer policy, nosniff, DENY framing
and CSP frame-ancestors 'none'. `/r/*` remains configured in the released
netlify.toml to the referral handler. No live referral was invoked.

The reviewed session handler returns before any Supabase request when no cookies
are supplied. An unauthenticated GET to `/api/lockliel-auth/session` returned
HTTP 401, `authenticated:false`, no-store. Thus the preview-only 503 guard does
not incorrectly block production. No mutating endpoint, signup, valid form,
payment, real email/SMS, member data or account creation was tested.

## Production preservation and limits

Before/after read-only snapshots have identical 274-entry migration ledger,
catalog/security fingerprints and public/Auth/Storage write counters, including
statistics reset. No automatic migration or DB data mutation was observed.
All 56 public tables retain RLS and Security Advisor remains clear. All five
Supabase Edge Function metadata snapshots match the prior checkpoint; reviewed
build/workflow commands contain no automatic production migration/deployment.

Aggregate counts and complete-row hashes match for staff roles, payment provider
connections, partner checkout, Share Library, flags, courses, lessons, lesson
assets and Storage metadata. Current Auth users and staff roles remain zero.
Getting a Grip Share Library slug has zero rows and remains NOT ACTIVE IN
PRODUCTION despite the public invitation now being live.

No Auth, SMTP, permission or unrelated settings change was performed. The supplied
Site URL/redirects and Resend verification remain operator-reported configuration;
complete independent Auth/SMTP setting snapshots were unavailable. This release
does not certify email delivery or authenticated member behavior.

ChatGPT Site remains active version 25 at its existing URL and unchanged
`2026-08-27T22:28:57.301945+00:00` update timestamp. No Site modification.

## Rollback readiness

Previous Netlify production deploy **`6ab3f0887cb1200008eb8e9f`**, previous main
**`77d1d1918793bc6a25f38721e882f3d011903bad`**, recorded before merge and still
available in ready state after release. Netlify supports republishing a retained
successful deploy using Publish Deploy, without rebuilding:
https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/#rollbacks
Alternatively a reviewed normal revert of the application merge can be prepared.
No rollback was needed or executed. Never restore/roll back the 274 database
baseline merely to roll back application code.

## Outcome and follow-up

PRODUCTION APPLICATION RELEASE VERIFIED

Release evidence is under `/private/tmp/lockliel-app-release`, with sanitized
Netlify snapshots under `/private/tmp/lockliel-grip-checkpoint/netlify-app-release-*`.
Continuity updates remain local on lockliel-backend-v1; no extra push.

Next recommended assignment: one controlled real signup and Resend confirmation
test with an explicitly approved test identity and cleanup/retention expectations.
Do not create that account automatically. First super-admin setup and Getting a
Grip Share Library activation remain separate pending assignments.
