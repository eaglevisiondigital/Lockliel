# Lockliel decisions and open questions

Recorded 2026-09-26. Status labels distinguish user-approved constraints from
implementation facts and proposals. Code or a seeded row is not business approval.

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

## Proposed next package (not started)

Reconcile missing schema history with authoritative catalog/deployment evidence,
prove unsupplemented migration reproducibility, and prepare a reviewed release
plan for the email constraint correction, including existing-data compatibility
and rollback considerations. Keep production application separately authorized.
Repository-wide lint remediation should remain a separately scoped follow-up.
