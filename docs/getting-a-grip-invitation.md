# Getting a Grip invitation, development only

Assignment: 2026-09-27. Inspected and built on clean local branch
`lockliel-backend-v1` at `559639baf90aa60e8dac3423d78fa599b135b789`, preserving
remote implementation `9eee9ee50cd6a21e0dde804b00725d17d6d31f93`.
This package authorizes local implementation, isolated tests, documentation and a
local commit only. It does not authorize pushing, publishing or content activation.

## Approved definition and release status

**APPROVED FOR FUTURE RELEASE / NOT YET ACTIVE IN PRODUCTION**

The authoritative reviewed content is `content/share-library/getting-a-grip.json`.
It is a passive definition, not a database seed, importer or startup fixture.
No runtime Share Library endpoint imports it or substitutes it for active rows.

| Field | Approved value |
| --- | --- |
| title | Getting a Grip on the Basics |
| asset_type | course |
| category | biblical-foundations |
| destination_path | /getting-a-grip |
| language_code | en |
| translation_key | getting-a-grip-on-the-basics |
| featured | true |
| sort_order | 10 |

Implementation slug: `getting-a-grip-on-the-basics`, matching the canonical key.
No preview image, pricing claim, free offer or automatic activation is introduced.

Description: A simple, Scripture-based 13-lesson course designed to help you build
a strong biblical foundation and take practical next steps in your walk with God.

Share text: I thought of you and wanted to send you this. Getting a Grip on the
Basics is a 13-lesson Lockliel course that walks through foundational biblical
truths one step at a time. I’d love for you to check it out.

A separately authorized release should use the existing admin Share Library
workflow with an active authorized staff session and AAL2. Create as draft, compare
every field with the manifest, and activate only under that release assignment.
API field mapping remains assetType, destinationPath, languageCode, translationKey,
shareText and sortOrder for their snake_case manifest counterparts. Other fields
keep their names. Creation always defaults to draft. Do not run a SQL seed.
Before activation, verify the destination is deployed and foundational course
readiness/enrollment is usable. Metadata approval alone does not establish that
course content is ready or published. The existing 13 lessons, 13 worksheets,
10 video lessons and 13 protected PDFs threshold remains unchanged.

## Public destination and preservation

`app/getting-a-grip/page.tsx` statically renders the approved title and description,
with scoped styles and the existing logo, navy/blue palette and type system.
Primary: **Start Getting a Grip** -> `/my-lockliel/sign-up`.
Secondary: **Already have an account? Sign in** -> `/my-lockliel/sign-in`.
Participation continues through My Lockliel. No homepage, dashboard, global styles,
existing published Site, protected resource or course reader was changed.
The page has no data fetch, form, protected media, private identifiers, analytics
projection or query reflection. Existing account/session controls remain in place.

## Referral and course handoff

Existing `/r/:code` tracking resolves the approved destination and issues a
whole-site `lockliel_ref` HttpOnly, SameSite=Lax cookie. The invitation's ordinary
signup link needs no recipient identity or extra referral parameters. Signup reads
its existing explicit referral code or cookie fallback and sends only the referral
code as Auth metadata. Existing Auth bootstrap resolves original inviter and
person linkage. No duplicate attribution mechanism or lineage mutation was added.
Referrer and signup handlers gained injectable factories only for deterministic
transport tests; their default exports, guards and rate limits are preserved.

Course enrollment is not performed by this public page or signup alone. Existing
faith-profile insert/update processing invokes `ensure_grip_enrollment`, choosing
a published course with translation key `getting-a-grip-on-the-basics`, matching
locale or English fallback. Repeated processing is idempotent. Existing private
journey selection and lesson authorization remain authoritative. No published
eligible course means no enrollment. This assignment proves the integration in a
disposable database, not live production readiness or authenticated live behavior.

## Sharing and consent

Existing guidance maps this course/category to exactly `new-faith`, `bible`, and
`discipleship`. All ten lanes remain unchanged. A narrow selection fix allows
course assets through the My Five `kind=invitation` filter as well as invitation
assets. Only assets already returned by the active-only library API can appear.

Generic and person-specific share links use the existing owner-scoped, consent-
checked creation endpoint. URLs contain an opaque code, never a recipient name or
My Five ID. `share_initiated` means preparation only. Copying a link does not update
the person's share status; the existing **I shared this** confirmation remains
explicit. No messages, delivery claims, automatic consent or leadership grants.

## Validation and evidence limits

- `npm test`: 456 JavaScript tests passed with fail-closed transport guard and OS
  outbound networking denied; supported webpack build/static export passed.
- `npm run test:sql`: 274 authoritative migrations replayed; 10 SQL/RLS files
  passed in disposable PostgreSQL 17, TCP disabled, IP networking denied. The new
  fixture uses synthetic content/accounts, satisfies release checks normally and
  rolls back. It verifies attribution, private-note isolation, draft exclusion,
  published-course enrollment, idempotence, immutable inviter and lesson access.
- TypeScript, Netlify validation (72 modules, 62 handlers), configured lint and
  targeted lint passed. `verifyMigrationBytes` verified all 274 existing hashes.
- Production dependency audit: zero vulnerabilities. Fixed official npm advisory
  proxy only; audit subprocess restricted to localhost. No dependency changes.
- Browser passed at 390/768/1365 widths: rendered approved content, no query
  reflection or protected embeds, plain signup navigation/reload with HttpOnly
  referral cookie, mocked account confirmation, course appearing in My Five's
  invitation filter, and copy preparation without automatic share confirmation.
  Zero external requests. Phone and desktop screenshots visually inspected.
  Evidence is synthetic local output, not live authenticated validation.
  Local artifacts: `/private/tmp/lockliel-grip-{validation,sql,browser}.log`,
  `/private/tmp/lockliel-grip-audit.json`, and
  `/private/tmp/lockliel-grip-screenshots/` (temporary, not committed).
- No migrations, dependency changes, hosting/workflow edits or release-preparation
  changes. No push, production DB change, production Share Library row, deployment,
  settings/permission change, real-data testing or main merge.
- Production and website services were not contacted by this package. Their
  historical checkpoint evidence remains in `my-five-remote-checkpoint-2026-09-27.md`;
  this assignment does not claim a fresh external drift audit. Both pending
  production migrations remain outside this assignment and were not applied.

Next: authorize one controlled development checkpoint, verify exact remote CI and
safe preview rendering, then separately decide production release readiness.
Do not activate content as part of that development push.

## Exact changed files

- `app/getting-a-grip/page.tsx`
- `app/getting-a-grip/page.module.css`
- `content/share-library/getting-a-grip.json`
- `app/my-lockliel/share/share-client.tsx`
- `lib/share-selection.mjs`
- `netlify/functions/lockliel-referral-redirect.mjs`
- `netlify/functions/lockliel-signup.mjs`
- `tests/getting-a-grip-invitation.test.mjs`
- `supabase/tests/getting_a_grip_invitation.sql`
- `AGENTS.md`
- `CURRENT_BUILD_STATE.md`
- `ARCHITECTURE.md`
- `SECURITY_MODEL.md`
- `DECISIONS.md`
- `docs/getting-a-grip-invitation.md`
