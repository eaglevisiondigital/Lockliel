# Wave 8 isolated server-read client

Local implementation only. No hosted connection, login, refresh, session mutation, environment mutation or credential input was performed. The default server handler is independently closed and the route is local-only by default.

## Existing application integration

The existing `/my-lockliel/review` route and member review shell now select a separate server-read mode before the old offline/synthetic modes. The old workspaces, read-model library, design tokens and routes remain intact. The new mode reuses the approved shell/CSS and `PreviewPanel`; it does not label real server data as offline, synthetic or a successful fixture login.

Expose locally only with both `LOCKLIEL_MEMBER_REVIEW=synthetic-local` and `LOCKLIEL_MEMBER_SERVER_READ_REVIEW=local-server`. Hosted/Netlify/unknown contexts reject exposure. A valid expected source and deploy must be explicitly supplied as nonsecret build expectations through `LOCKLIEL_ISOLATED_READ_SOURCE` (40 lowercase hex) and `LOCKLIEL_ISOLATED_READ_DEPLOY` (24 lowercase hex). Project `qjksggxorghaxvpyslip` and site `70b03a42-6329-476e-bf4b-2b1ce30e9567` are fixed. No target is derived from a response, browser selection, query or user authority.

Missing binding shows unavailable and performs zero requests. It never falls back to fixture content. Enabling this local UI does not enable the closed server handler or authorize using an existing session. Hosted deployment and synthetic Auth acceptance remain separate decisions.

## Read wire and private boundary

The replaceable port uses one fixed relative `GET /api/lockliel/member-read`, same-origin cookies, `cache:no-store` and `redirect:error`. Only Accept and nonce/generation correlation headers are added. No browser owner, grant, token, URL override, request body or service key is accepted.

The versioned envelope is `lockliel-member-server-read-v1`. Strict exact data-descriptor validation accepts only nonce/generation, opaque session boundary, 32-character lowercase-hex nonce, generation 1 through 999999999, at most 60-second validity, the exact expected binding, minimal identity/profile, five communication flags and their actual revision (at most 64 characters), and unavailable course summary. Extra fields, getters, inconsistent identity/profile, wrong runtime, malformed flags, missing revision or stale responses deny. No contact fields, roles, private notes, course bodies, entitlements, Storage paths or private Faith bodies are passed to presentation.

The DTO is not an Auth capability. Existing server session validation and caller RLS remain responsible for authority. A staff or AAL2 label never grants another owner's data. Browser-side checks add correlation and presentation minimization, not a substitute for server authorization.

## Account changes and unavailable domains

A new load clears data synchronously, aborts the old request and advances generation. Uncooperative late responses cannot overwrite the new view. Reset, the existing cross-tab `storage` notification with key `lockliel:auth-change`, optional same-window session-change notification, page hide, window blur, hidden visibility and automatic expiry remove current member data. Existing Auth producers in `app/my-lockliel/auth-form.tsx` and `dashboard-client.tsx` already write that cross-tab key. Values are not read. The optional `lockliel:session-changed` event has no existing producer; no Auth code is modified to add one, and no real login/refresh is performed. A same-window external cookie change without an event is only noticed on a new read or the maximum 60-second snapshot expiry; this is a bounded read snapshot, not continuous revocation proof.

The server mode does not provide a fixture identity selector. Faith records, My Five recipient/catalog, saved banner/photo/privacy state and course progress remain explicitly unavailable/Unknown. Communication reads do not imply resource-sharing consent. Share confirmation is disabled and says Nothing was sent. No forms, uploads, saving, persistence or delivery are offered.

## Focused validation

Scoped synthetic tests cover exact binding, default-OFF gates, anonymous/expired/denied states, no mock fallback, field exclusion, forged owner/role rejection, request shape, network and malformed response failures, A/B generation races, invalidation, timer expiry and disposal. Presentation checks exercise unavailable and ready minimal read projections in the same member route. TypeScript and targeted ESLint are run separately. Full suite/build/browser evidence is maintained by the coordinator, not inferred from these focused checks.

No migration, SQL, live API, Netlify operation, production access, account/Auth setting, maintenance state, message, payment, role or content activation is introduced by this client package.
