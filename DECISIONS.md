# Lockliel decisions and open questions

Recorded 2026-09-26. Status labels distinguish user-approved constraints from
implementation facts and proposals. Code or a seeded row is not business approval.

## Approved Getting a Grip invitation (2026-09-27)

APPROVED: the subsequent Chat assignment authorizes a development-only public
`/getting-a-grip` invitation and the exact content recorded in
`content/share-library/getting-a-grip.json`, with scoped existing branding and
signup/sign-in CTAs. APPROVED FOR FUTURE RELEASE / NOT YET ACTIVE IN PRODUCTION.
Local implementation, isolated validation and local commits are authorized.
No push, content activation, production release or migration is authorized.

IMPLEMENTED: passive canonical manifest, static invitation, tested existing
referral/enrollment handoff, and a narrow My Five invitation filter correction to
include course assets. No taxonomy, lineage, consent or permission changes.

UNKNOWN: present live foundational-course release readiness. This package proves
its integration only in disposable SQL and mocks. A future authorized content
release must verify course and destination readiness and use existing admin draft/
activation controls. Production publication and substantial visual redesign still
require their separate assignments. See `docs/getting-a-grip-invitation.md`.

## My Five checkpoint authorization and outcome (2026-09-27)

AUTHORIZED by the subsequent checkpoint assignment: one normal development push
of the clean validated history through `9eee9ee50cd6a21e0dde804b00725d17d6d31f93`,
followed by remote CI, harmless preview checks and read-only preservation checks.
This superseded the local-only restriction for that exact implementation only.

COMPLETED: remote implementation matches, both CI runs passed, preview guards
passed and inspected production baselines match. PR #3 remains open against main
with auto-merge disabled. No second push, production release, pending migration
execution, settings change, real-data testing or subsequent product package was
authorized or performed. Evidence documentation stays local. See
`docs/my-five-remote-checkpoint-2026-09-27.md`.

## My Five + Share Center package (2026-09-27)

AUTHORIZED by the subsequent primary Chat assignment: local guided My Five person
experience, deterministic recommendations, need-based Share Center, isolated tests
and continuity updates. This supersedes the earlier “next package requires another
assignment” restriction for this package only. Report development-checkpoint
readiness without pushing automatically. Production release/settings, both pending
migrations, published sites, main and subsequent feature work remain out of scope.

IMPLEMENTED without schema additions: owner contact fields support notes and
reminders; existing referral links/events support preparation history. Do not use
staff-visible task notes for this private purpose. Do not invent prayer events,
status/note revision history, delivery evidence or spiritual achievement. Prayer
is private reflection with optional note; its UI suggestion lasts for that visit.

IMPLEMENTATION CHOICES: only due/overdue or unaddressed confirmed-share actions
compete at dashboard priority six; ordinary prayer/resource suggestions stay on
the person page. Linked outreach and coarse engagement require active specific
inviter-followup consent. Sharing is intentional, with separate confirmation after
preparing a link. Existing categories/types define ten code-level lanes; empty
results stay empty. No new content, book offer, gateway, shipping policy, legal
classification, role or entitlement is approved by these projections.

UNVERIFIED / FUTURE: real authenticated integration needs an isolated backend.
No authoritative released Getting a Grip invitation or content for every lane was
established by this package. Content readiness is a recommended future product
package, not authorization to create or publish resources now.

## Member Journey checkpoint authorization and outcome (2026-09-27)

AUTHORIZED by the subsequent checkpoint assignment: one normal non-force push of
the clean verified development branch, followed by remote CI, harmless preview
denial checks and read-only production preservation. This superseded the previous
no-push restriction for the exact three-commit range ending at
`cc6f430a1e03ba55a44774e8ade8fa05edec4617` only.

COMPLETED: remote development matches that SHA; main is unchanged; PR #3 remains
open against main with auto-merge off. Push and PR CI passed all configured gates,
including 411 JavaScript tests and eight SQL files after 274 fresh migrations.
Netlify preview `6ab8fab5b738c40008b06835` matches the commit and passed 17 denial
probes. Production Netlify, Sites version 25 and inspected Supabase baselines match
before/after. See `docs/member-journey-remote-checkpoint-2026-09-27.md` for evidence.

No production execution, settings/permissions change, real-data test or next
feature package was approved or performed. Both pending migrations remain under
their separate release process. Follow-up evidence documentation is local only;
another push and the My Five / Share Center package require another assignment.

## Member Journey Core phase 1 decision record (2026-09-27)

AUTHORIZED by the subsequent Chat assignment: implement guided onboarding,
authenticated dashboard improvements and centralized deterministic recommendations
on the existing development branch, reuse established systems, run isolated tests
and update continuity. Preserve both local documentation/release commits and both
published sites. This supersedes the prior preparation-only restriction for this
local feature package. It does not authorize a production migration, merge, site
publication, configuration change or automatic development push.

IMPLEMENTED LOCALLY: four-step onboarding and one prioritized Next Best Step with
course, My Five, community, approved orientation and resource integration. Private
growth choices remain optional. Existing course completion, 95 percent watch
threshold, worksheets, My Five maximum, membership permissions and staff MFA remain
authoritative. UI changes reuse current member styling and committed source/assets;
the broader published visual-source decision remains open.

IMPLEMENTATION CHOICES: derive onboarding completion from active profile plus a
faith-profile row; derive recommendations on demand; reuse existing category/locale
metadata; keep stages descriptive. No schema migration is needed. Never write
`wants_group`/`wants_host` from the private short survey, because their existing
trigger creates/closes staff-visible requests. Community actions stay explicit in
the established group flow. SQL tests verify that unrelated preferences and
requests survive the new upsert. UI lifecycle events use names-only browser hooks;
no existing generic member analytics collector was found or repurposed.

VERIFIED LOCALLY: 411 JavaScript tests, 274-migration fresh replay, eight SQL/RLS
files, build, types, Netlify module validation and targeted lint. Mocked browser
checks cover onboarding, dashboard states and responsive layout with zero external
requests. This establishes local implementation, not a deployed or live-tested
feature. No release file/migration bytes changed; prior production evidence remains
point-in-time. See `docs/member-journey-core.md`.

PROPOSED ONLY: guided My Five follow-up and resource-sharing refinement, preserving
current statuses, consent, original inviter and campaign attribution. Do not start
without another assignment. Durable UI analytics and authenticated preview testing
against an isolated backend remain separately scoped work. Neither pending
production migration is approved for execution by this product package.

## Previous release preparation decision record (2026-09-27)

AUTHORIZED by that preparation assignment: correct continuity, preserve all existing
migration bytes, select/pin/rehearse the exact production runner locally, prepare
read-only preflight and a runbook, run validation, and create one local commit.
No production execution, push, merge, deploy, dependency update, setting change,
MFA setup, backup/restore operation or new feature is authorized.

ACCEPTED CORRECTION: current live email SQL/CHECK uses one backslash and accepts
ordinary addresses. Historical repository migration `20260925153612` has two.
Do not rewrite applied history. Pending `20260926212002` supplies canonical `[.]`
convergence and replay consistency, not proof of repairing an active signup failure.

ACCEPTED MANUAL EVIDENCE from Dave: correct Lockliel Platform project, Pro,
ACTIVE_HEALTHY, three completed physical backups, latest 2026-09-26 07:28:11 UTC,
Restore and Restore to new project available. PITR disabled, retention duration
unverified, Storage bytes excluded; one visible Owner with MFA disabled. No restore
was performed. Release-time dashboard evidence must be refreshed.

ENGINEERING SELECTION, VERIFIED LOCALLY: Supabase CLI 2.118.0, pinned macOS arm64
binary, `db push --include-all --skip-vault`, explicit URL and two isolated file
sets, bridge first then email. Both timeouts and atomic migration-plus-ledger
behavior passed actual-runner tests. No custom production migration executor was
introduced. Historical filenames/bodies/order and both pending hashes are unchanged.
See `docs/production-migration-runbook.md` and `docs/release-preparation-2026-09-27.md`.

SECURITY RECOMMENDATION awaiting fulfillment: **OWNER MFA REQUIRED BEFORE MIGRATION**.
A single privileged account without MFA exposes release and recovery control.
PITR is not required for these two no-DML migrations with zero profiles and a fresh
recoverable physical backup; do not enable it automatically. Storage byte recovery
is a broader launch requirement, not a blocker for these two files. Proposed backup
maximum age is 24 hours unless Chat explicitly accepts another recovery point.
Retention-duration uncertainty alone is not a blocker when a current completed
recoverable backup is visibly available. None of these statements certifies full
recovery readiness or authorizes account changes.

CONDITIONALLY READY TO REQUEST PRODUCTION MIGRATION AUTHORIZATION: complete Owner
MFA/recovery-factor verification separately, refresh all manual/database gates,
verify direct password/TLS connectivity read-only, and obtain an explicit assignment
for the exact release commit/versions. Any data/schema/history/security/traffic drift
requires renewed assessment. Keep dependency triage and frontend decisions separate.

## Completed controlled development push (2026-09-26 America/Chicago)

AUTHORIZED by Dave's follow-up assignment: one normal push of exactly `b2adf96`
on `lockliel-backend-v1`, then read-only remote inspection and harmless preview
guard verification. This superseded the earlier no-push scope for that one action.
COMPLETED: all six reviewed commits are remote; main and other refs are unchanged;
PR #3 remains open/unmerged; push/PR CI passed; the exact new preview passed 12
guard probes and five form-export checks. Production preservation checks match.
Evidence and limits are in `docs/remote-validation-2026-09-26.md`.

The post-push evidence documentation is LOCAL ONLY. No second push is authorized.
No frontend decision, site redesign, migration execution, Auth/SMTP/payment setup,
permission change or feature work was approved or performed. Older previews are
still unsafe, and the protected preview has no writable production backend.

PROPOSED ONLY: review the two pending database migrations and their documented
release prerequisites for a separate Chat release decision. Triage the full
dependency audit's 19 findings in a separate narrow package. Do not begin either
as an automatic continuation of this successful remote checkpoint.

## Previous deployment safety decision (2026-09-26, historical)

AUTHORIZED by Dave's current engineering handoff: preserve the five local commits,
review push effects, implement the smallest code-only preview isolation, validate
without production access and create a local security commit. No push, merge,
publishing, live migration, settings change or second Supabase project is approved.

VERIFIED BY WORK: Netlify production tracks main; standalone branch deploys are
disabled; PR #3 targets main with previews enabled; no listed build hooks/enabled
plugins/dashboard project variables; no GitHub webhooks; Pages disabled; installed
apps Netlify and ChatGPT Codex Connector. Dave's Supabase screenshot shows no
repository connected and no branches. The separate ChatGPT Site has saved version
25, successful publication August 27, 2026 and no custom domains. Its source
binding was not exposed and no push trigger to it was established.

IMPLEMENTED LOCALLY: permit existing backend behavior only for trusted production
invocations; block all connected functions in previews and unknown/local contexts;
add edge protection for native forms and unsafe GETs; remove form-registration
attributes from nonproduction exports. This contains the current shared-backend
risk without changing credentials, namespace configuration or production business
logic. An environment-variable-only guard was avoided because build variables
are not sufficient evidence of a serverless invocation's deployment context.

PRESERVATION REQUIREMENT: retain both existing websites. Before future substantial
frontend changes, Chat must choose which visual implementation is authoritative
and retain a recoverable source/assets baseline. This decision is unresolved and
outside this package. The guard adds only a blocked-feature response, no redesign.

PROPOSAL, NOT STARTED: a separately authorized controlled development push,
remote CI and new-preview guard verification. The exact technical assessment and
limitations are in `docs/deployment-safety-review.md`. Production SQL release,
business decisions and isolated backend browser testing remain separate work.

## Approved constraints

The current user's continuity handoff is authoritative for these requirements:

1. Continue `eaglevisiondigital/Lockliel` on `lockliel-backend-v1`; preserve existing
   work and approved branding. Keep `main` untouched. This baseline makes no
   production, schema, permission, migration or feature-flag changes.
2. Keep original inviter, latest campaign, assigned mentor/group and access
   permissions separate. Applications and tags do not automatically confer
   leadership. Follow-up respects consent and protects assessments, finances
   and unrestricted contact information.
3. Welcome people across Christian backgrounds and seekers while preserving
   established convictions. Teaching is Scripture-first, respectful and
   non-coercive. Do not use em dashes in user-facing content.
4. Do not infer approval of payment providers, complimentary-book offers,
   shipping policy or unresolved legal classification. Require an authoritative
   decision record before implementation or activation of those decisions.
5. Chat owns decisions and prioritization, Codex engineering/testing/documentation,
   and Work external investigation and browser validation. Provide complete
   handoffs with a recommended reasoning level.

## Carried-forward direction and its provenance

The recent strategy handoff in ChatGPT task **Lockliel Backend Build 4**
(`6ab73e5c-0c68-83ea-9531-d7a5b52f2fca`) records:

- Mission: Reach. Teach. Train. Disciple. Help recipients become helpers and
  multiply disciples.
- A premium, uncluttered member experience, practical topic discovery,
  "For Me / Help Someone", sharing, relationships and clear next steps.
- Scripture-first Word-of-Faith convictions with respectful explanations.
- Mission-first funding language such as "Support the mission".
- Preserve approved artwork; alternative-logo discussion is not replacement approval.
- Supabase identity and core data; GoodBarber/native-shell ideas remain future
  architectural context, not a deployed native app.
- Getting a Grip release threshold: 13 lessons, 13 structured worksheet/note
  experiences, at least 10 distinct lessons with playable teaching video,
  13 protected PDF lessons. Verified durations remain optional.

These are carried-forward planning requirements, not proof of complete UI
implementation. The course threshold is also corroborated by the live
`lockliel_grip_readiness` function and current repository code. No final mockups
or additional authoritative source documents were supplied for this assignment.

## Verified implementation choices, not new approvals

- Next.js static export and Netlify functions are the current build path.
- Supabase holds the member platform; Netlify Forms/Blobs also serve distinct
  public resource funnels. Do not silently migrate or merge these systems.
- Auth session checks, staff MFA and RLS are implemented protections.
- Provider-neutral commerce foundations and a draft benefit rule exist.
- Current live flags: Founders 50 recruiting and internal messaging enabled;
  partner checkout, digital-book delivery and book-gift benefit disabled.
- The account-deletion migration `20260926033358` is already present in both
  migration histories. Its prior reconciliation is not a pending migration.

## Open decisions and dependencies

| Item | Status and exact gap | Owner / next evidence |
| --- | --- | --- |
| Initial super administrator | No live staff roles. Need Dave's designated confirmed account and explicit bootstrap authorization. | Dave, followed by a scoped operational task and MFA validation |
| Auth URLs and SMTP | Both live verification records are false. Actual management settings were not inspected. | Work verifies settings and delivery without exposing secrets |
| Payment gateway | Authorize.Net is a historical preference only. All four seeded providers are disconnected. | Chat/Dave records provider, account ownership, allowed payment purposes/currencies, checkout approach and webhook requirements |
| Complimentary-book offer | Draft `heart-for-the-lost-gift-20` row is not approval. Currency, amount/threshold, eligibility, timing and redemption remain unresolved. | Chat/Dave decision before activation |
| Physical shipping | Destinations, price/subsidy, fulfillment owner and refund/return terms not established here. | Chat/Dave |
| Legal classification and receipts | No authoritative determination supplied or verified. Existing labels/acknowledgment code do not settle legal or tax treatment. | Chat obtains the appropriate authoritative decision |
| Final book | Both products are draft with no storage path. Final approved protected PDF and release authorization are missing. | Dave/content owner |
| Native app / alternate shell | Proposal only; this repository baseline proves a web application. | Chat architecture decision if prioritized |
| Complete mockup/vision coverage | Recent handoff recovered, not every historical message or visual reviewed. | Identify the precise source when a future UX decision depends on it |

## Authorized and completed local engineering package

The user's subsequent pasted assignment authorized test isolation, fail-closed
network protection, supported build validation, isolated SQL authorization tests,
and essential hygiene. These now exist locally. It allowed narrow changes for a
verified defect: the email-format constraint correction was prepared and tested,
not applied. This authorization does not extend to production releases.

Implementation decisions: retain Webpack; use native disposable PostgreSQL 17
with TCP disabled; preserve useful legacy test coverage against current output;
record incomplete migration history through explicit test-only supplements;
retain visible full-lint debt instead of suppressing it. No product/business
approval or public branding change is implied.

## Reconciliation assignment now authorized (historical proposal)

Reconcile missing schema history with authoritative catalog/deployment evidence,
prove unsupplemented migration reproducibility, and prepare a reviewed release
plan for the email constraint correction, including existing-data compatibility
and rollback considerations. Keep production application separately authorized.
Repository-wide lint remediation should remain a separately scoped follow-up.

## Reconciliation strategy recorded before implementation (2026-09-26)

Verified: both Git history and all 272 non-null remote ledger bodies lack the
Founders review creation DDL and the six Share Library column additions. Original
execution time/actor and original SQL cannot be recovered from those sources.
The live catalog provides current structure, not historical execution provenance.
A forward-only migration cannot repair fresh replay because older files fail
before it is reached. Replacing historical files or squashing the whole database
would obscure more evidence and affect unrelated systems.

Chosen bounded exception: add one explicitly reconstructed compatibility migration
at the logical replay boundary immediately before the locale foundation
`20260925035351`. Generate its file with the pinned CLI, then assign the documented
ordering version `20260925035350`. That version is a dependency-order identifier,
NOT a claim about its original execution time or a restored historical file.
Original migration bytes and validated commits remain unchanged. The bridge
captures the missing table, columns, indexes, policies and review trigger, using
read-only catalog evidence plus the existing review function definition. Later
historical migrations retain their original hardening responsibilities.

On matching existing environments the bridge must perform no schema/data changes;
it must reject partial/conflicting states instead of silently repairing them.
Test fresh replay, repeat application on completed schema, and rejection of drift.
This is authoritative application migration DDL, not a test supplement. The native
PostgreSQL test harness retains only platform compatibility stubs and test data.

The connected environment already has the objects but lacks this version. A
future operator must compare the schema and ledger, review exactly the inserted
version, and use the CLI's supported older-migration handling only in a separately
authorized release. Never mass-mark history, rerun all historical migrations or
assume default `db push` will accept this older missing version. No history repair
or migration execution is authorized against production in this package.

### Reconciliation outcome and remaining approval boundary

Fresh replay succeeds with the authoritative bridge, with all historical migration
bodies preserved. Catalog comparison additionally found and captured the missing
share status constraint, supporting index and staff write policies. Seven SQL
files exercise the resulting schema; the original 311 JavaScript checks pass.
Email compatibility preflight found zero users/profiles, so no existing-data
remediation is indicated. Release preflight must be repeated. The prepared email
migration remains unchanged. `docs/migration-reconciliation.md` records release
and recovery gates and the limits of structural parity.

No production release or push was approved by the reconciliation findings.
The former hosting verification gap and next-package recommendation are superseded
by the current deployment safety decision at the top of this document.
