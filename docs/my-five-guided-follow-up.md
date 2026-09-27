# My Five and Share Center guided follow-up

Assignment: 2026-09-27. Local starting commit
`2b31eafd4ba67489cab4b2ecb8b24dab2ef46fd1`, preserving remote implementation
`cc6f430a1e03ba55a44774e8ade8fa05edec4617` and the local checkpoint evidence.
Local implementation only. No push, production write, settings change or site
publication is part of this package.

## Inventory and schema decision before implementation

- `reach_contacts` owns private names/context/notes, six stored statuses, latest
  share/follow-up timestamps and next follow-up. Owner-only RLS and the concurrent
  five-active-person trigger already exist. Notes have a 3,000-character DB bound.
- `referral_links.reach_contact_id` has a composite owner foreign key. Separate
  unique indexes preserve generic and person/resource links. Existing validated
  campaigns and original-inviter bootstrap remain authoritative.
- `referral_events` records share initiation, anonymous visits, attributed signup
  and course progress. Preparing a link does not prove delivery or identity.
  Only explicit own share history and minimal consent-gated linked engagement
  belong in the new private projection. No raw analytics/metadata/member IDs.
- `next_follow_up_at` already supports private contact reminders. Existing
  `follow_up_tasks` require platform subjects, have staff read purposes, and do not
  allow member-created task rows. Do not repurpose them for private contact notes
  or unlinked recipients. Existing assigned welcome tasks can be displayed with
  minimal fields when the linked relationship still permits follow-up.
- Share Library already owns active resource type/category/locale/translation
  metadata and approved destinations. Need lanes are a code projection, not a new
  taxonomy or inferred approval of new content. Protected resource delivery and
  entitlement checks stay on their existing endpoints; do not share raw files.
- No durable prayer event or status/note revision history exists. The prayer
  action is a private reflection with optional note saving. It does not claim an
  outreach event, spiritual milestone or durable prayer counter. The timeline
  derives contact creation, latest recorded share/follow-up and link preparation;
  it does not manufacture older status/note changes. Current notes remain editable.

Decision: reuse this schema without a migration. Preserve all 274 migration bytes
and the separately controlled production release package. No new generalized
scheduler, CRM, messaging transport, permissions or analytics collection is needed.

## Implementation and validation

Completion evidence is recorded here after implementation. Mocked HTTP checks and
disposable SQL/RLS checks must remain separate from deployed evidence.

### Implemented local behavior

- Pure `netlify/lib/my-five.mjs` centralizes six truthful stage labels, prayer,
  share/encouragement and due/unaddressed-share follow-up recommendations. Paused
  or completed contacts are review-only. Future reminders defer outreach prompts.
- `lockliel-my-five` validates session and owner before any timeline read. The DTO
  omits linked identity, caller IDs, analytics metadata, recipient timestamps and
  private reasoning. It returns the owner's note and an edit version. Note saves
  are bounded to 3,000 characters with optimistic concurrency. Follow-up clears
  the reminder; tomorrow/three days/week/custom reuse `next_follow_up_at`.
- Timeline derives contact creation, latest confirmed share/follow-up, and up to
  50 preparation events across the most recent 100 owned person-specific links.
  Reaching either cap shows an older-history limitation. The resource label says
  a link was prepared, not that this exact resource was delivered. Current fields
  cannot reconstruct older notes, statuses, or which resource a confirmation meant.
- Linked signup/course-start evidence is reduced to “Engaged with your invitation”
  only with current exact inviter-followup permission and exact linked member ID.
  No visit/recipient history is returned. Unlinked private contact names do not
  establish recipient identity. Absence/revocation blocks guided linked outreach;
  member-owned notes and preparation history stay private and available.
- Person actions include private prayer, note, resource, invitation, follow-up and
  history. Prayer changes the suggestion only for the current page visit and
  optionally leads to note saving. No prayer event, score or streak is fabricated.
- Member Journey names a due/unaddressed-share person at priority six, preserving
  priorities one through five. The API never returns other contacts' notes or
  sensitive reasons. Routine prayer/resource suggestions stay on the person page.
- Share Center projects ten lanes from existing categories/types after existing
  active/locale/type-compatible selection. It supports normal or My Five sharing,
  preserves existing campaigns/composite ownership/original inviter, and requires
  intentional preparation followed by explicit “I shared this” confirmation.
  Copying, native cancellation, and opening text/email never mark delivery. No
  recipient address is guessed or sent by the application. Native/text/email use
  the existing user's-device share interfaces; no transport was added.
- Safe destinations are navigation only: no external URL, API, file, reader,
  download, storage path or query-bearing target. Share assets have no entitlement
  mapping; this package does not invent one. Existing protected resource delivery
  still checks entitlements, release state and Storage RLS. A share grants none.

### Verification (local, 2026-09-27)

- 447 JavaScript tests pass, including 36 new guidance/API boundary tests.
- 274 authoritative migrations replay in disposable PostgreSQL 17 with TCP
  disabled; nine rolled-back SQL/RLS files pass. New checks cover note isolation,
  authenticated staff denial, cross-owner link/timeline denial, bounded notes,
  protected resource denial without entitlement, engagement forgery and no role,
  consent, entitlement or original-inviter mutation from stage/sharing.
- All 274 SHA-256 values match `supabase/verification/release-migrations.json`.
  No migration or pending-release body was edited or added.
- Webpack/static build, TypeScript, Netlify validation (72 modules / 62 handlers),
  configured tooling lint and changed-code lint pass. No dependency changes.
- Production dependency audit: zero vulnerabilities. The npm process had
  localhost-only egress; a narrowly scoped proxy forwarded only the official
  registry bulk advisory request, without credentials. Build/unit checks denied
  outbound networking; SQL allowed only private local Unix sockets.
- Synthetic Chrome checks use static output and mocked APIs, with OS networking
  restricted to localhost. They exercise private prayer without a POST, escaped
  note saving, reminder and follow-up, person selection, empty lanes/invitations,
  explicit share confirmation, invalid-person denial, revoked consent and preview
  failure. Person and share pages fit 390/768/1365 widths. Zero external requests.
  Screenshots and execution logs are temporary local validation artifacts.
- Default new/existing handler preview denial is checked locally. This is not a
  new deployed preview check or successful live authenticated integration.

### Preservation, limits and next package

No push, main change, production write, migration, deployment, settings/permission
change, real-data test or published-site edit. Last remote verification remains
`cc6f430a1e03ba55a44774e8ade8fa05edec4617`; local evidence parent remains
`2b31eafd4ba67489cab4b2ecb8b24dab2ef46fd1`. The commit containing this document is
the local implementation checkpoint; its exact SHA belongs in the completion
report. Source and assets remain recoverable in Git. No public-page redesign.

No live catalog assertion was made. Empty lanes and missing released invitations
are honest states, not permission to invent resources. Getting a Grip invitation
and broader lane coverage require approved catalog content. Prayer history and
revision history would need a separately designed durable model if later required.
Reminder handling is member-driven, not background delivery. Rate limits are
configuration and local evidence, not proof of deployed enforcement. Existing
legacy field updates remain supported; this package adds no database consent rule.

Next recommended product package: approved Share Library content/readiness and a
Getting a Grip invitation, with an isolated backend for authenticated integration
validation. First checkpoint this completed package through a separate controlled
development push assignment. Do not start new work automatically.
