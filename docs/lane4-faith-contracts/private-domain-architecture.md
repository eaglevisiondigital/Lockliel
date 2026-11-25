# Private faith domain architecture

## Wave 2 status, November 1, 2026

Dave subsequently authorized actual isolated memory-only React prototypes. See
[WAVE2_RESULT.md](WAVE2_RESULT.md) for that implementation and verification scope.
The historical Wave 1 text below remains a contract-only snapshot; live providers,
durable persistence, sharing delivery and crisis runtime remain held.


November 1, 2026. Proposed architecture with pure memory-only draft contracts. No
schema, database object, durable record, member-facing route or sharing service exists
from this package. No account, personal prayer or real member information was used.

## Existing systems retained

- Faith profile captures background, stage and growth interests. It is not a prayer
  journal. Existing own-member faith-profile RLS remains separate and was not changed.
- My Five owns private contact notes and consent-based outreach. Its Pray action does
  not record a durable prayer event. Do not repurpose it into a public prayer feed.
- Course private notes have their own course-bound lifecycle/security. They are not
  the backing store for general prayer, health, family or growth data.
- Staff tasks and admin notes are purpose-scoped staff data. They must never become
  private prayer storage through reuse of a convenient notes field.

Evidence: `app/my-lockliel/faith-profile/faith-profile-form.tsx`,
`netlify/functions/lockliel-faith-profile.mjs`,
`app/my-lockliel/connections/person/person-client.tsx`,
`docs/my-five-guided-follow-up.md`, `docs/course-engine-reconciliation.md`, and
`SECURITY_MODEL.md` relationship/private-information boundaries.

## Domain separation

| Domain | Proposed private data | Deliberate exclusion |
| --- | --- | --- |
| Scripture Anchor | Owner, revision, exact reference/version identity and optional private reflection | No licensed verse bytes stored by the draft; no automatic publication or spiritual score |
| Prayer Board entry | Owner-private body and open/archived self-managed state | No community feed, leader visibility, prayer-count claim, diagnosis or inferred answered-prayer event |
| Areas I'm Growing In | Member-selected title and reflection | No inferred condition, spiritual ranking, staff assessment or compulsory disclosure |
| Practical action plan | Optional growth-area link; member-authored steps with planned/done/skipped self-report | No claim that checking a step proves spiritual achievement or clinical improvement |

Current implementation constructs only prayer/anchor drafts. Growth/action-plan
shapes are typed architecture; constructors, persistence and workflows remain held.
Draft limits of 4,000 characters and a review-form maximum of five recipient IDs are
bounded synthetic contract choices, not an approved retention, audience or product policy.

## Ownership and trust boundary

Future owner identity must come from Lane 1's authenticated, active-session context,
not request-supplied owner IDs, profile tags, original inviter, campaign attribution,
assigned mentor/group or a client-visible visibility flag. RLS and narrow server
interfaces must enforce owner access independently of the UI. Staff, AAL2 managers,
leaders and inviters receive no private-body access by default. Do not use service
credentials to bypass learner ownership. All eventual actual table and column ACLs
must be reviewed separately from default ACLs, including administrative/service paths.

The pure draft builders do not authenticate anyone. Tests use synthetic identifiers
and check field projection/defaults. They are not hosted A/B/RLS acceptance evidence.

## Explicit sharing proposal

A share review names one source entry and revision, owner, individually selected
recipients, selected permitted fields and an expiry. It starts with no recipients or
fields, no confirmation and delivery held. A stale revision, another actor, unknown
field, duplicate recipient or unbounded implicit audience cannot become a reviewable
proposal. Even a valid proposal has no sharing capability, URL, delivery token or write.
No contact permission or leadership role is conferred by a proposal.

Before any sharing runtime, owner-approved policy and review must resolve:

1. Recipient identity and consent, precise preview and explicit confirmation after
   preview; cancellation without a write or message.
2. Server-side field projection, atomic revision/consent checks and a separately
   authorized recipient grant that cannot be broadened by a forwarded URL.
3. Revocation/expiry checks on every read, behavior for edits and source deletion,
   recipient re-sharing limits, and honest limits for already received copies.
4. Notifications that contain no sensitive text; audit metadata minimized to the
   approved purpose. Private bodies never enter URLs, analytics, logs or referral metadata.
5. Default-private behavior throughout export, backup, caching and offline drafts.

These are contracts to review, not implemented sharing guarantees.

## Lifecycle and privacy review gates

Lane 8 owns the eventual purpose/retention/export/deletion contract with Lane 1
security review. The coordinator alone allocates migrations. Required future evidence:

- Owner, member B, anonymous, stale/revoked session and privileged-role read/write
  denial/allowance matrix, including direct API paths and actual/default ACL distinction.
- Data minimization, minors policy, jurisdictions, retention periods and recovery/backups.
- Owner-authenticated bounded export, deletion/cascade semantics and revocation of
  related shares, with truthful limits for backup retention and exported copies.
- Cross-account draft clearing; offline sensitive-storage policy; conflict handling;
  no hidden local cache; shared-device exposure and recovery behavior.
- A single allowed interface per domain; no disclosure to generic admin reporting,
  contact enrichment, payments, recommendation providers or analytics by default.

No existing export/deletion worker or schema was modified. No retention period or
policy sufficiency is established by the in-memory types.

## Crisis and recommendation hold

`FAITH_PRIVACY_CONTRACT` explicitly holds crisis runtime, recommendations, sensitive
persistence and sharing. There is no classifier, automated escalation, diagnosis,
monitoring promise, leader notification or emergency disclosure implemented here.

Release requires reviewed non-coercive copy, scope, qualified safety review, localized
human-support resources, accessibility, minors/jurisdiction decisions and explicit
privacy/consent treatment. Do not imply that prayer or Scripture replaces immediate
human help. No user-facing crisis advice or helpline list was generated in this package.
Any future recommendation engine needs approved editorial/theological content and
private-data/third-party disclosure review; no AI integration is authorized by a type.

## Shared-file integration boundaries

Lane 4 owns these domain/provider contracts. Lane 3 owns shared tokens, navigation,
dashboard and any common drawer primitives; Lane 2 owns course-player wiring; Lane 1
owns authentication/session primitives; Lane 6 owns approved resource content; Lane 8
owns admin/privacy operations. Submit typed interface requests to those owners. No
shared file, course content, migration, manifest or package was edited in this slice.
