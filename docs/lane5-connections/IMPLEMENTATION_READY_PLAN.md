# Lane 5: My Five, referrals and groups preparation

November 1, 2026. Owner: native subagent `/root/connections_wave3`.
Branch: `codex/lane5-consent-followup`.
Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane5-consent-followup/Lockliel`.
Base: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.

## Status and authorization

PREPARED, NOT IMPLEMENTED. The coordinator dispatched a proposed narrow contract/test slice. Automatic approval review rejected the first source-file write before execution because the direct Wave 3 authorization was interpreted as preparation only for L5 through L8. No implementation write was retried, no alternate mechanism was used, and no source/test/UI file was created. The coordinator explicitly held implementation and limited this follow-up to documentation. The rejection did not block preparation that the user expressly requested.

No new test, build, browser or accessibility acceptance is claimed. No production access, account/Auth/session/email activity, migration, dependency change, network request, push, merge, deployment or permission change occurred.

## Existing implementation to preserve

The following code was inspected at the exact base, without running it:

- `netlify/lib/my-five.mjs`: deterministic private guidance and stages; active statuses are praying, invited, connected and growing. Guidance stage is not authorization. Link preparation is distinct from a member confirming a share.
- `netlify/lib/my-five-data.mjs`: owner-filtered contact reads; linked-member follow-up checks current non-revoked inviter-followup permission; engagement is a narrow projection. Unlinked contacts follow a distinct existing path. This proposal does not silently reinterpret that behavior as new consent or change it.
- `netlify/functions/lockliel-my-five.mjs`: session requirement, owner lookup, version conflict checks, follow-up gating and private-note/reminder handling.
- `netlify/functions/lockliel-share-link.mjs`: contact ownership/current permission, active approved asset lookup, referral-link preparation and a share-initiated event. Preparation is not email/SMS delivery.
- `netlify/functions/lockliel-connections.mjs`: existing five-active checks on adding/reactivating contacts.
- `supabase/migrations/20260925111601_lockliel_enforce_my_five_integrity.sql`: historical source enforcing five-active integrity. Inspected as text only; not executed or modified.
- `tests/my-five-guidance.test.mjs`: existing owner, consent, safe-path, versioning and preview production-backend guard coverage. Not rerun for a documentation-only package.

These are repository observations, not claims about deployed behavior or fresh database ACLs. Do not recreate the live My Five engine.

## Smallest future implementation slice

After explicit implementation authorization, add pure typed contracts and meaningful tests only under `lib/connections-preview/**` and `tests/connections-preview.test.mjs`. Keep the existing live implementation untouched. Do not integrate a UI or handler yet.

1. Owner-private synthetic relationship projection with an explicit field allowlist. Synthetic actor A can project A's fixtures only. Actor B, public, absent actor and malformed/mixed-owner data fail closed. Synthetic identity is a fixture label, not real authorization.
2. Independent original inviter, latest campaign, assigned mentor, assigned group, consent and explicit access-permission fields. No inferred permission from lineage, tag, application or assignment. Never add leadership to an output DTO.
3. Capacity review mirrors the four existing active statuses and five-active boundary. Updating an existing active contact does not consume another slot. Paused/completed entries do not count. Duplicate, malformed or mixed-owner records fail closed. The result is a review, not a save or concurrent database guarantee.
4. Share-intent review requires current accepted purpose-limited consent, a distinct current narrow preview permission, active stage, approved synthetic resource and explicit confirmation bound to owner/contact/resource/revisions. Revoked, declined, pending, expired, wrong-subject and stale confirmations deny. Re-evaluate consent on every attempt. No bypass from inviter, leader or campaign metadata.
5. Group/host requests produce a human-review-required intent only. They never assign a group, approve a role, create membership, send a notification or save an application.
6. Output effects stay explicitly `send=false`, `schedule=false`, `save=false`, `grant=false`. No generated URL, transport adapter, persistence adapter or browser storage. Do not claim a pure function is a backend/RLS control.

Only fixture identifiers and synthetic resource metadata may be accepted. Never project private prayers, course/assessment notes, answers, finance, unrestricted email/phone, sensitive profile data or arbitrary fields. A deny response must not reveal whether another person's record exists.

## Proposed catalog read DTO for coordinator/L6 review

Documentation only, no shared file or API change. Proposed fields: synthetic resource ID, catalog revision, short display title, approved audience lane, public/private/protected classification, availability state and preview-only review status. Resource publication, entitlement, rights and route validation remain separate authoritative concerns.

Exclude protected storage paths, signed URLs, tracking identifiers, user-specific entitlements, internal manuscript/content bodies and financial fields. The L5 contract should consume a trusted approved synthetic projection, not a raw catalog row or arbitrary URL. L6 owns catalog meaning; coordinator owns any eventual shared contract. Missing, retired, unapproved or incompatible catalog entries must deny sharing preparation. The Getting a Grip production Share Library item must remain inactive.

## Dependencies and release limits

- L1/coordinator: authenticated principal and purpose-limited permission contract; real session/consent checks must be server-enforced before future live integration.
- L3: reviewed private presentation contract if a later UI is authorized. No shared component/token edit now.
- L6: approved catalog projection described above. No dependency on uncommitted sibling code.
- L8: future human-review/admin request boundary and audit rules. L5 must not edit the admin-person handler or grant a role.
- Coordinator: all shared contracts, navigation, schema/migrations, integration and release decisions.

No schema is needed for a pure synthetic slice. Durable relationship writes, contact imports, leadership/group assignment, notifications, live referral attribution and real sharing remain separately held. A proposed contract is not permission to implement or release them.

## Next action

Primary Chat must explicitly authorize the narrow L5 synthetic contract/test implementation before the rejected source write can be attempted again. Keep the dedicated clean source base and documentation checkpoint. Continue independent approved first-four-lane/integration work while this remains held.
