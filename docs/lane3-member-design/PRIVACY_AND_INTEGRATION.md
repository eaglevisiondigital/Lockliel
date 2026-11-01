# Privacy architecture and integration boundary

November 1, 2026. This document describes the synthetic W3 prototype and proposed
review requirements. It creates no storage, policy, permission or API contract in
production.

## Current data flow

`synthetic-fixtures.ts` supplies one invented member display object. React state
holds the next-step example, signup example, optional banner, per-field visibility
and selected preview audience. `projectMemberCard` constructs a new object with
only `displayName`, `initials`, `showPhotoPlaceholder`, `locationLabel` and
`faithBanner`. It does not spread a profile or forward extra properties.

Private prayers, notes, assessments, finance, email, phone, profile IDs and roles
are excluded even if a caller adds those fields to the synthetic input. Public or
unrecognized audience values receive no projection. Optional photo-placeholder,
location and banner choices begin private and are independent. Banner values
must be one of the synthetic presets or absent. No Scripture translation, private
faith answer or inferred spiritual assessment supplies banner content.

These are presentation safeguards, not a security boundary. A synthetic fixture
label, a select value or a client-side filter never authorizes a real viewer. The
approved-connection option is a proposed audience concept for review, not a new
consent category or a grant through an inviter, application, group or tag.

There is no HTTP client, Auth import, upload input, persistent storage, background
job, analytics collector or sharing transport. A refresh discards all state. The
prototype never calls real signup, recovery, course, member, referral or group
routes. Its CSP also blocks connections, frames, forms and external resources.

## Photo boundary

Only an initials placeholder is implemented. No file selection, preview blob,
image processing, provider, bucket, signed URL, object path or upload is created.
Before adding real photos, the owner must approve audience/consent rules, moderation,
minors, retention, export/deletion, revocation/cache behavior and resource limits.
Storage and RLS requirements need a separately reviewed interface and schema
assignment. Do not treat the placeholder visibility choice as approved policy.

## Future integration, requiring separate approval

| Subject | Owner / required review |
| --- | --- |
| Auth and signup semantics | L1 supplies verified request, confirmation and session states. L3 renders them without inferring delivery, session, staff status or access from a successful form submission. |
| Member identity and authorization | L1/L8 establish actual session, viewer relationship, purpose and consent server-side. Tags and applications confer no privilege. |
| Course recommendation | L2 supplies an authorized privacy-safe next-step projection. Loading/error/denied remain distinct; no fabricated progress, prerequisite or entitlement. |
| Profile/card projection | L3 and L8 agree on a server-side allowlist and field audiences. Do not send private fields to the browser and hide them with CSS. |
| Faith Banner and sensitive domains | L4 owns new prayer/growth domain contracts. An optional display message must not disclose underlying prayer, assessment, note or finance data. Sharing and revocation remain explicit. |
| Shared layout, tokens and navigation | Coordinator serializes owner-reviewed integration; this package changes none of those shared files. |
| Persistence and lifecycle | No write route exists here. A future request must specify authentication, validation, conflict behavior, retention, export/delete and failure semantics before any save UI can claim persistence. |
| Operational release | Exact application/schema binding, tests, rollback and explicit owner release authority remain mandatory. No production change follows from accepting the mock. |

Proposed reuse is limited to presentation patterns and typed safe state inputs.
It does not merge organization data, payment destinations, permissions or brands.
The approved Champion Life interaction direction is retained; no external
repository or missing final mockup is claimed to have been inspected.
