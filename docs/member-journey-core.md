# Member Journey Core, phase 1

Subsequent status: exact implementation `cc6f430a1e03ba55a44774e8ade8fa05edec4617`
was pushed under the separate checkpoint assignment. Remote CI and protected
preview verification passed. See `member-journey-remote-checkpoint-2026-09-27.md`.
The local-only wording below records the original implementation handoff, before
that authorization. No production release followed.

Assignment: 2026-09-27. Starting commit: fc78dcea390df434c7378da58566e35cf88f4bf5,
branch lockliel-backend-v1. This is local member-experience implementation, not a
production release or permission change. Preserve both published websites and the
separate two-migration release package. The existing member CSS/components and
committed source/assets at this starting SHA form the recoverable local baseline.
This does not select either published site as the broader visual source of truth.

## Reuse and schema decision, recorded before implementation

- Profile completion already advances `profiles.onboarding_status` from new to
  active through a protected trigger. Member writes cannot set it directly.
- `faith_profiles` already owns optional growth interests and faith stage. Its existence plus an active profile is the derived onboarding-complete
  condition. Empty interests explicitly support declining to answer. No completion
  flag, duplicated survey, recommendation table or migration is needed.
- Guided onboarding saves only growth interests and an explicitly
  selected new-believer stage. Existing background, ministry experience, hosting,
  connection preference, notes and unrelated fields are preserved. SQL verification
  exposed that wants_group/wants_host writes trigger staff-visible request creation
  or closure. The short private flow therefore never writes those columns. Community
  interest is an explicit action in the existing group flow, not a silently shared
  survey answer. No contact permission or connection request changes here.
- Existing course/enrollment/lesson/media records, canonical translation mapping,
  95 percent video threshold, worksheets and completion triggers stay authoritative.
- `reach_contacts` retains existing statuses and five-active-person maximum.
  Conceptual praying/connecting/sharing/engaging/growing/discipling copy does not
  replace stored statuses or claim new independently measured stages.
- Group memberships/requests and approved Founders orientation drive navigation.
  No group role, staff role, lineage, consent or assigned leader is changed.
- Active Share Library categories and locale provide basic resource ranking.
  Protected library delivery retains its existing entitlement checks.

## Implemented domain and privacy boundary

One pure deterministic service ranks onboarding, active lesson, unfinished lesson
requirements, unstarted Grip, empty My Five, due follow-up, actionable community,
approved orientation/hosting, relevant resource, then healthy growth. Requirements
within an active lesson refine its continuation CTA. Enrollment alone is not proof
that a course was started. Missing/unavailable enrollment never fabricates access.

A caller-scoped read service supplies only needed columns under the existing JWT
and RLS. Upstream failures return an unavailable response rather than pretending
that a member has no data. The dashboard returns rendering fields and aggregate
counts, not faith answers, worksheet answers, My Five identities/notes or a sensitive
reason trace. Journey labels are descriptive and never authorization inputs.

Existing durable lesson/referral, group, My Five and share state/events stay intact.
There is no general member UI analytics ingestion contract. New UI lifecycle hooks
are browser-local, allowlisted event names only, respect Do Not Track and introduce
no storage or network collector. Durable capture of these new hook names remains
a separate telemetry decision. Public resource funnel analytics are not repurposed.

## Validation and completion

The full guarded `npm test` passed **411 tests**, including 26 focused new tests
and both new default handlers in the existing preview-isolation suite. Coverage
includes every priority, ordering, video/worksheet requirements, translated course
mapping, active-only My Five counts, due actions, community and orientation gates,
safe resource destinations, unauthorized requests, caller isolation, private field
omission, failed reads/writes, onboarding transition and telemetry payloads/DNT.

`npm run test:sql` freshly replayed **274 authoritative migrations** and passed
**8 SQL/RLS test files** in disposable PostgreSQL 17 with TCP disabled. New
`member_journey_core.sql` exercises real RLS and database functions for cross-member
read/write denial, profile transition, minimal-upsert preservation, unchanged
connection requests/consent, protected system fields, five-active-person limit and
absence of leadership grants. All fixtures rolled back. No fixture was run live.

Webpack static export, `npm run typecheck`, `npm run validate:netlify` (68 modules,
61 handlers), `npm run lint:tooling`, and targeted ESLint on every new/changed
implementation module passed. Full repository lint was not represented as clean;
its previously documented debt remains. Build/tests ran with cleared credentials
and OS outbound network denial in addition to the existing Node test guard.

A separate synthetic Chrome/Playwright check used the actual exported pages and
domain projection with mocked API responses at 390, 768 and 1365 pixel widths.
It covered profile prefill, optional choices, privacy confirmation before saving,
first recommendation, dashboard empty/populated/community states, 95-percent video
to worksheet navigation, unavailable-response recovery and names-only event hooks.
No page errors, horizontal overflow or external browser requests were observed.
Local screenshots were visually reviewed. This is not connected browser validation
of Supabase Auth, PostgREST, Storage or deployed Netlify functions. Backend guards
were not disabled. Temporary browser artifacts are not a new supported CI harness.

## API, components and file map

| Boundary | Files / behavior |
| --- | --- |
| Pure decision | `netlify/lib/member-journey.mjs`: derived onboarding/course/community state, priority rules, resource ranking, descriptive stages |
| Scoped reads | `netlify/lib/member-journey-data.mjs`: explicit caller filters and narrow REST selects under JWT/RLS |
| Course reuse | `netlify/lib/course-journey.mjs`, `netlify/functions/lockliel-journey.mjs`: shared existing canonical/translated reader, unchanged mutation/completion path; upstream read failure now returns 503 |
| Recommendation API | `netlify/functions/lockliel-next-step.mjs`: GET `/api/lockliel/next-step`, no application writes, unauthorized 401, unavailable 503 |
| Onboarding API | `netlify/functions/lockliel-onboarding.mjs`: GET own prefill, POST private allowlisted preferences only after active-profile transition; no-store, same-origin check, bounded input, rate limit |
| UI | `app/my-lockliel/onboarding/`, `member-journey-panels.tsx`, `dashboard-client.tsx`, scoped additions in `my-lockliel.css` |
| Client contracts | `lib/member-journey-types.ts`, `lib/member-journey-events.mjs` |
| Tests | `tests/member-journey.test.mjs`, localized-reader inspection adjustment in `tests/my-lockliel-platform.test.mjs`, `supabase/tests/member_journey_core.sql` |
| Continuity | `AGENTS.md`, `CURRENT_BUILD_STATE.md`, `ARCHITECTURE.md`, `SECURITY_MODEL.md`, `DECISIONS.md`, this record |

Recommendation response: `onboardingComplete`, `nextStep` with type/priority/title/
description/CTA/optional counts, `continueGrowing`, `myFive` counts, `community`
state, resource cards and descriptive `journey`. It contains no contact IDs or
private reason trace. Existing authentication may refresh its cookie; the guidance
service itself does not write member state. No service-role credentials are used.

Onboarding completion derives from `profiles.onboarding_status = active` plus
the existence of a faith profile. Existing members meeting that condition retain
their completed state without a forced repeat survey. Profile confirmation and
private preference save are separate retryable operations. A failed final
recommendation read clearly leaves preferences saved and offers retry/dashboard
navigation. Selecting nothing is supported. Existing faith stages survive unless
the member explicitly selects new-believer or clears a previously selected value.

## Production, preservation and release separation

No production migration, database write, settings change, main merge, deployment,
published-site edit, real-member test or remote push was performed. The two prior
local commits remain ancestors. Package manifests, workflows, hosting manifests,
release scripts/records and all 274 migration bytes are unchanged. This package
adds no publishing route, build-time production call or automatic migration step.
The two new function defaults inherit the current preview guard; a subsequent
development push can trigger the existing CI/Netlify PR preview, whose connected
features remain blocked. That is separate from production-runtime onboarding writes
if the application is explicitly approved and deployed in a later release.

The last production verification recorded 272 applied migrations. It was not
refreshed during this package. The bridge/email release still needs its separate
Owner MFA, backup, read-only preflight, connectivity and authorization gates.
This feature does not change or satisfy those gates. A future release must name
its exact approved application commit as well as any approved migration versions.

## Limits and next recommendation

- Hosted integration and authenticated end-to-end browser behavior remain
  unverified; current previews deliberately have no connected backend.
- New lifecycle hooks currently emitted are onboarding started/completed and next
  step viewed/started/completed. Other allowlisted names reserve no claim of
  emission or persistence. Existing durable module state/events remain unchanged;
  no generic member UI telemetry ingestion endpoint exists.
- Private faith/My Five reasoning stays server-side. This package does not change
  existing staff purpose-based access rules or expand consent to follow up.
- My Five conceptual labels reuse existing stored statuses. Multiplying is a goal,
  not a newly measured milestone. No progress label affects authorization.
- No new schema, dependency, authoritative published-design decision or business
  approval for payments, book gifts, shipping or legal classification was needed.
- Next product proposal: guided My Five follow-up and resource sharing with
  existing statuses, voluntary consent, private notes, original inviter and
  campaign attribution. Do not start without another assignment. Prepare an
  isolated integration environment separately before live write-based browser QA.

Ready for development-branch review and a separately authorized push. Current
implementation is local only. The commit introducing this record follows
`fc78dcea390df434c7378da58566e35cf88f4bf5`; obtain its exact SHA with
`git log -1 --format='%H %s' -- docs/member-journey-core.md`.
