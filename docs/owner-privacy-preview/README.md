# Wave 6 owner Privacy Status panel

Owner: `/root/connections_wave3`. Branch: `codex/wave6-privacy-integration`.
Base: `24a6159efb2daba4e8dddf2c075694ac599d9a83`.
Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-wave6-privacy-integration/Lockliel`.

## Assignment and API

The Wave 6 attachment explicitly authorizes Assignment B, a synthetic default-OFF Privacy Status panel with no real persistence or sharing. The coordinator owns its independent server-local flag, page/host/navigation integration, combined browser checks and all shared source. This component is a headless h2 section, not another application shell or an authorization gate.

Named export: `OwnerPrivacyWorkspace({context, boundaryKey, idPrefix?})` at `components/owner-privacy-preview/owner-privacy-workspace.tsx`.

- `context`: coordinator `SyntheticContext | null`. Only known fixture owners `synthetic-a` and `synthetic-b`, correct organization, active fixture session and explicit `member:read` are accepted. An operations/staff grant does not substitute for owner access.
- `boundaryKey`: nonempty bounded host visit/reset string. Actor, org, AAL/session/grants or host boundary change yields a new private state key. Old local ideas are discarded when the keyed component unmounts.
- `idPrefix`: optional bounded safe ID prefix, otherwise a unique React ID. Multiple instances retain unique label/help relationships.

This context is a synthetic review fixture, not verified Supabase Auth or live owner authorization. No real member data or credentials may be supplied. The panel deliberately does not accept a profile, photo URL, raw private-domain record or purported live settings object.

## Eight areas and truthful status

| Area | Default local sample | Explicit boundary |
| --- | --- | --- |
| Profile photo | Private | Audience ideas never upload an image or grant access. |
| Faith Banner | Private | A banner is optional presentation, not an assessment or leadership grant. |
| Prayer Board | Private, informative only | No prayer content, notification or sharing control is loaded. |
| Personal growth | Private, informative only | No assessment, score, reflection or action-plan detail is read or exposed. |
| Scripture Anchors | Private, informative only | Public Scripture references do not make private reflections public. No anchor content is loaded. |
| My Five relationships | Private, informative only | Inviter, campaign, mentor/group and actual permissions remain separate; no contact list or relationship record is loaded. |
| Sharing consent | No consent created | A local review idea cannot create, accept or change anyone's consent. |
| Communication preferences | No channel connected | No real subscription, unsubscribe preference, email/SMS/in-app setting, address or delivery is connected. |

Every card separately displays **Current live status: Unknown**. The top notice explains that all statuses describe samples, never verified live privacy state. No successful local change changes that status. Unavailable does not mean public, and the empty fixture does not mean an empty account.

Four optional native-select controls explore local photo/Banner audiences and sharing/communication review ideas. They change a strictly validated, memory-only DTO with local revision checks. Prayer, growth, anchor and My Five cards have no sharing control. No saved setting, audience permission, accepted consent, channel, role or notification can be produced. Reset restores private/no-consent/no-channel ideas only and states that nothing live changed.

## Actual model and domain reuse

`lib/owner-privacy-preview/model.ts` reuses the existing member `PRIVATE_VISIBILITY` defaults and coordinator synthetic context/ownership/grant vocabulary. Those existing source bytes are unchanged. L8 `projectOwnPrivacyRequest` and operations/coverage functions were reviewed; they describe request/operations workflows and require real fixture request/scope inputs that this informative panel does not have. Invoking them here would manufacture a request or suggest export/deletion capability. They are intentionally not called or duplicated.

Model exports:

- `isPrivacyOwner` and `privacyBoundary`: strict known-owner/grant/context recognition and private state boundary.
- `createPrivacyDraft`: a fresh private sample; no alias to mutable global defaults.
- `changePrivacyIdea`: only four bounded enum fields, current revision, no arbitrary property or content update.
- `projectOwnerPrivacy`: exact allowlisted fixed-text status cards; no raw input fields or owner identifier are rendered.

All returned decisions include the exact shared `NO_EFFECTS`: save/send/schedule/grant/publish/pay/execute are false. Ready display additionally states audiencePermissionGranted=false, consentCreated=false, deliveryConnected=false and rolesGranted=false. These are model boundaries, not live RLS or server acceptance.

Malformed/extra fields, cross-owner/org context, stale revision, unknown actor, lost grants, non-string enum objects and accessor-bearing fixtures are unavailable. Accessor fields are rejected before their private getters are evaluated. The model is not an arbitrary JavaScript sandbox or a live authentication decoder.

## Interaction and accessibility

The existing navy/blue/cream palette and Arial typography remain scoped to this module. Status words accompany color, and live Unknown remains visible on each card. The two-column layout becomes one column below 720px, with narrow-screen padding below 380px. Native selects have explicit labels/help IDs and at least 44px targets. Controls and headings have visible focus styling. Reset and sample retry restore heading focus after the resulting render, including when a retry button disappears. Loading, empty and error samples have distinct wording; retry never performs a network request.

No form, anchor destination, image URL, raw markup, clipboard, event sink, transport, browser storage, cookie or private-content import exists. There is no global CSS or token change and no blockquote, avoiding the earlier public-site quote-position collision. The scoped reduced-motion CSS disables motion, but actual OS preference activation, browser zoom and spoken screen-reader verification belong to coordinator/operator acceptance and are not claimed by unit/source checks.

## Fresh agent validation

- **62 focused tests passed:** 48 pure model tests and 14 actual-component SSR/source-boundary tests, under the repository network guard.
- Strict scoped TypeScript passed with existing Next CSS declarations.
- Targeted ESLint passed with zero warnings across owned source and both test files.
- Browser-platform pure model bundle passed: 9,163 bytes, three expected modules (owned model, shared context and member preview model), zero external imports, no file output.
- UI/CSS bundle passed: 22,906-byte JS and 8,978-byte CSS; five expected inputs, existing React external dependency only, no file output.
- Tests cover A/B/org/grant/session denials, all eight areas, private defaults, local choice transitions/reset, no manufactured consent/delivery/roles, stale revisions, non-JSON coercion attempts, private getter non-evaluation, honest degraded states, exact-key projection, unique IDs, labelled controls and no native submission or external destination.

The dependency link is coordinator-owned and remains intact for combined validation. No dependency installation or package/lockfile change occurred. The agent did not run Next build/typegen or the full application suite while the coordinator owned those operations. Actual responsive/focus/reset browser review, combined build/type/lint and default-OFF flag acceptance are recorded separately by the coordinator, not inferred from SSR.

## Preservation and next step

Only leased `components/owner-privacy-preview/**`, `lib/owner-privacy-preview/**`, `tests/owner-privacy-preview*.test.mjs` and `docs/owner-privacy-preview/**` are changed in this checkpoint. Shared member/Faith/Share/Auth, L8, public pages, tokens, hosting and migration source remain untouched. No SQL, production access/change, settings/Auth/CAPTCHA, account action, upload/share/message/export/deletion, migration, push, merge, deployment, financial activation or infrastructure purchase occurred.

Next smallest step: coordinator verifies the actual default-OFF panel within the existing member shell, privacy reset across owner/grant/epoch changes, responsive and keyboard behavior, and exact-source combined checks. Real account settings, owner sessions, RLS, durable private data and any sharing/communications workflow require separately reviewed authenticated-development adapters and acceptance. This panel is informational preparation for that review, not implementation of those services.
