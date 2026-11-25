# Wave 6 authenticated-development integration strategy

November 1, 2026. **Implementation-ready plan for review, not runtime authorization.**

## Exact application and evidence

Local review candidate: `13118829b485893a1ae169db0a098c79ad99a169`, branch `codex/wave6-privacy-integration`, with panel checkpoint `fa24c3464ea85338cda8ae7128007a3eb91eefbb`. Base is Wave 5 documentation/evidence `24a6159efb2daba4e8dddf2c075694ac599d9a83`, preserving application `af99a5211e9af55645fb0817d7976d3e0b1b6893`. This candidate is validated locally; it is not an approved connected deployment or production candidate.

The independent seven-document plan is sealed at `d16dd5c922d68b79c2e223ec04bab95c67a6c5f7` on `codex/wave6-backend-plan`, under `docs/authenticated-integration-plan/`. Its42 source hashes and82 anchors deliberately refer to the preserved Wave 5 source. The final Wave 6 delta is only synthetic owner privacy UI/model/tests/docs and the local review host/gates. Existing Auth, API, schema and Storage bytes remain equal, so the reuse analysis remains applicable. The coordinator pins the new application here without rewriting the planning lane's historical provenance.

## Environment and compatibility decision

| Item | Proposed value / required condition |
|---|---|
| Supabase target | Existing isolated `qjksggxorghaxvpyslip`, branch `course-cutover-rehearsal-274`, only after owner confirms safe reuse and current binding. Production `bsndfhbemstyrrglajat` is excluded. |
| Hosting target | Existing isolated site `70b03a42-6329-476e-bf4b-2b1ce30e9567`, only if it can preserve the accepted course artifact and maintenance state. No new site/project or paid capacity approved. |
| New connected deploy | **UNASSIGNED / NOT DEPLOYED.** Do not map this member candidate to historical deploy `6abfd81ccee16b59b75711a0`, which belongs to course source fa294f7. |
| Current binding | BLOCKED. Need trusted current alias to immutable artifact/function/config provenance and qjks-only outbound assertion. Site identity, HTML, CSP and401 cannot replace it. |
| Schema |280 local source files; isolated280 and production274 are last verified observations. Future P1 must verify exact required signatures, current effective privileges and readiness before use. Never replay275–280. |
| Course isolation | Maintenance stays ON. No playback/course saves/content/duration or privileged manager action. Stop if an unrelated course setting must change. |
| Fixtures | Offline invented fixtures for P0. Later existing isolated synthetic identities only with separately authorized protected session input. No production users/credentials/tokens/PDFs copied. |

If safe reuse cannot be established, present the exact alternative and actual cost to the owner before any environment creation. Do not solve the provenance gap by overwriting acceptance infrastructure.

## Contracts and reuse

Retain static Next plus Netlify BFF and same-origin requests. Reuse HTTP-only cookies, Auth user/token-pair validation, active-session RPC, caller bearer PostgREST/RLS, existing profiles, preferences, faith profile, My Five, protected resources and privacy request/export/deletion machinery. No framework rewrite, second identity store or browser service key.

Introduce a **separate proposed authenticated read-model contract**, discriminated from synthetic-owner. Unknown/loading/unavailable do not expose private data. Server derives current subject/environment/session generation/AAL/permissions; browser-supplied IDs, tags, metadata and synthetic grants never authorize. Project only intended display fields; do not forward raw session email/phone/role IDs or My Five private notes/timeline into the unified UI.

On logout/account/environment/grant/session-generation change: abort requests, increment generation, discard late responses and clear private drafts, confirmations, previews, preferences and object URLs before rendering a new subject. No automatic write replay on refresh. Later mutations need strict field types, Origin/CSRF, bounded JSON, transactional owner+version predicates and explicit409 conflicts. Existing timestamp CAS is reusable; current profile/preferences writes are not automatically ready.

Existing Share Library can supply reviewed active metadata. Existing share-link POST creates referral links/events and is **forbidden for preview confirmation**. Current followupAllowed behavior for unlinked contacts and inviter/leader/group permissions does not equal L5 accepted scoped/versioned resource-share consent. Until recipient-consent provenance is approved and verified, those connected recipients stay unavailable. No delivery/event counter follows a local preview result.

## Phased packages and flags

1. **Wave 7 P0, recommended:** offline authenticated display DTOs, strict fixture adapters, mocked BFF read client, account-switch/late-response tests and loading/denial/error UI. Dedicated worktree, default-OFF, no network, migrations, Auth/hosting/configuration change or new persistence. Leave existing synthetic gates and fixtures as a regression reference.
2. **P1, later connected read-only slice:** existing profile/session/preference reads after explicit exact-source/target/binding/deployment/synthetic-session approval. GET-only application data routes; authentication/refresh are separately identified Auth operations, not falsely described as no-write operations.
3. **P2:** narrowly approved existing profile/preferences edits only after CSRF, strict typing and CAS/conflict fixes. No enrollment/host-request side effects implicitly enabled.
4. **P3:** private Faith persistence only after new schema/retention/export/deletion approvals, disposable SQL/RLS/ACL replay and explicit isolated migration/write authority.
5. **P4:** photo/banner lifecycle and private Storage only after separate metadata/processing/visibility/retention/cost/upload approval.
6. **P5:** authenticated Share Review reads with current recipient consent/resource revisions; confirmation still local-only. Delivery and actual share-event semantics remain a later independent assignment.

Implemented exposure flags remain `LOCKLIEL_MEMBER_REVIEW`, `LOCKLIEL_SHARE_REVIEW` and `LOCKLIEL_PRIVACY_REVIEW`, exact value `synthetic-local`, all default-OFF and local/non-Netlify only. They are not authentication. A future server adapter gate, proposed name `LOCKLIEL_AUTHENTICATED_MEMBER_ADAPTER`, must default OFF and require an exact immutable source/site/project/context allowlist. Domain writes/uploads/sharing/messages/payments remain separately OFF. This future gate is **not implemented** by Wave 6.

## New schema proposals and lifecycle

No new migration or SQL was authored. Existing relationships and privacy-request queue are reused, not duplicated. Proposed separately reviewed objects cover member display/Bible preferences, photo asset metadata, Scripture Anchors, private prayers, growth areas, action plans/steps and bounded mutation deduplication if required. Resource/consent revision extensions require a centrally reviewed design. Names are placeholders, not approved schema or an allocation of migration281.

Do not repurpose faith_profiles.notes, staff notes, lesson notes, follow-up tasks or contact private_notes as a private Faith store. New bodies are owner-private by default, with explicit active-session/RLS, immutable ownership, exact table/column grants, no broad staff/service reads, bounded pagination and body-free audit. Extend existing export/deletion coverage before enabling persistence. Retention, minors/legal holds and any future sharing need owner decisions.

Photo design proposes a separate private bucket, immutable random owner-bound objects, verified MIME/size/dimensions and safe EXIF handling, explicit finalization, short-lived authorized reads, replacement/cleanup and export/delete of all pending/old objects. No remote fetch or course-PDF bucket reuse. Signed URL/browser-cache revocation limits must be disclosed and approved. Storage-byte recovery is distinct from PITR.

## Acceptance, rollback and cost

Before P1: current target binding/schema/readiness, A/B/anon negative access, session expiry/revocation/refresh concurrency, Origin/CSRF for any later writes, actual table AND column ACL versus defaults, RPC owners/search_path/EXECUTE, current DataAPI exposure and private-note restrictions. Unknown or contradictory evidence blocks that package. Retain real-CAPTCHA, manager AAL1/AAL2 and production gates separately.

Offline regression: focused/adversarial privacy and cross-module tests, full application suite, type/build/lint/Netlify, all280 hashes, outbound guard, responsive/keyboard and exact-source visual evidence. Actual200%zoom and spoken screen reader remain unverified in Wave 6; OS Reduce Motion is now exercised/restored within the documented scope. Final connected acceptance needs its own supported accessibility evidence.

Rollback P0 by reverting the isolated source/closing its flag. Later runtime rollback closes adapter flags, stops test traffic, clears private UI and restores the approved compatible isolated artifact/config; revoke only test-owned sessions if separately authorized. Never reset database/production, replay migrations, delete acceptance infrastructure or change course maintenance. Report uncertain outcomes rather than retrying writes blindly.

**Cost incurred: none.** Existing hosted usage, egress/email/Storage/provider costs are not freshly measured. No purchase/upgrade is approved. Owner approvals are ordered in the independent plan's ACCEPTANCE_AND_APPROVALS.md. No execution, deployment, schema, session, account or production release authority follows from this document.
