# Wave 8 local member server read candidate

November 1, 2026. Local implementation and mocked transport acceptance only. No hosted request, login, refresh, SQL, deployment or configuration change was performed by this lane. The actual exported route always returns503 before network access. The separately testable factory contains the complete read implementation; enabling a hosted artifact is a separate exact-source approval and composition task.

## Owned files and existing service reuse

- netlify/functions/lockliel-member-read.mjs: default CLOSED Netlify function at GET /api/lockliel/member-read. Other methods also remain503 while closed. No environment variable activates it.
- netlify/lib/member-read-binding.mjs: isolated project/site constants, trusted source/deploy/context and current immutable-permalink validation.
- netlify/lib/member-read-server.mjs: existing access-cookie/JWT parsing primitives, provider-validated current user, existing stable active-session RPC, owner-filtered profile and communication preference reads, bounded projection envelope.
- netlify/lib/member-read-projection.mjs: field-only projection and explicit ready/missing/unavailable semantics.
- tests/member-read-server.test.mjs:85 synthetic tests, no live transport.

The existing lockliel-core.mjs, backend-config.mjs and deployment-safety.mjs remain unchanged. Their imported ACCESS_COOKIE, parseCookies and jwtClaims are reused. Existing authUser is hard bound to the existing production backend config and requireSession may refresh, so neither is called. This narrow read composition calls the same provider verification endpoints against its pinned isolated URL, without creating another authentication system, token store, login/refresh flow or session cookie.

## Binding and closed exposure

Factory API:

    createMemberReadHandler({
      enabled, expectedBinding: {project,site,deploy,source}, runtimeSource,
      expectedOrigin, publishableKey, fetchImpl, now
    })

All inputs are server-owned composition dependencies, never request fields. enabled defaultsfalse. Project must be qjksggxorghaxvpyslip and site70b03a42-6329-476e-bf4b-2b1ce30e9567. Both expected source and server runtime source must match40 lowercase hex characters, and deploy must be24 lowercase hex. The Netlify invocation context must attest the same site ID/deploy ID and branch-deploy context. Production, deploy-preview, local and unknown contexts deny before network.

expectedOrigin must be an explicit HTTPS immutable Netlify permalink for the exact deploy ID, with no credentials, port, path, query or fragment. Site names are mutable; no historical site name or acceptance alias is inferred. Current provider metadata and exact artifact/source proof still require coordinator review. Supplying runtimeSource is a config comparison, not independent proof of deployed code. The factory does not manufacture the missing binding attestation. The current published artifact is not replaced.

Only an explicit publishable-key-shaped value is accepted; secret/service-role/legacy JWT keys deny. No key is read from ambient production env or browser data. The provenance of a future actual isolated publishable key must be verified privately before approved composition. Tests use a synthetic nonfunctional placeholder only. This is not proof that an arbitrary opaque key belongs to the project.

The production backend URL is never a transport destination. The only outbound origin is the fixed isolated Supabase URL, and redirects are disabled. There are no real outbound requests in this package. The default route has no fetch dependency and cannot call the factory through a public request.

## Request and session validation

GET /api/lockliel/member-read accepts no query or body authority, and no Authorization header. A single existing lockliel_access cookie is required. A refresh cookie is ignored. Browser role/owner/session fields cannot authorize a read. Foreign Origin, cross-site and same-site requests deny; custom nonce/generation headers prevent an ordinary navigation from requesting the projection.

X-Lockliel-Read-Nonce must be32 lowercase hex characters. X-Lockliel-Read-Generation is a positive decimal integer at most9digits. These are correlation values only, not authentication. The response echoes them exactly/with integer generation.

Unverified JWT claims are used only as a pre-network rejection filter: exact isolated issuer/ref where present, authenticated audience and role, UUID subject/session ID, known AAL, expiry and not-before. Local parsing is NOT signature verification. Actual GET /auth/v1/user verifies the token with Supabase, requires the returned ID to match the subject and denies anonymous identities. GET /rest/v1/rpc/lockliel_current_session_active must return exactlytrue both before and after profile reads. The existing SQL function is stable/security invoker and checks auth.sessions through its established internal predicate. GET is used for this stable read rather than the older POST transport. Hosted RPC GET exposure is not tested here and remains a required separately authorized acceptance check.

Caller bearer is reused for every data request. No service-role bypass is possible in this composition. Fetch uses GET only, no body, no Cookie forwarding, redirect:error, cache:no-store, credentials:omit and an8second signal. Upstream JSON is limited to64KiB. Abort, expiry, inactive session or final revocation denies the whole snapshot. No refresh, Set-Cookie, session clearing, Auth write or background work occurs.

## Actual fields and authorization

| Domain | Actual select | Owner predicate | Display projection |
|---|---|---|---|
| Profile | id,first_name,last_name,onboarding_status | profiles.id equals provider-verified caller ID; row ID checked again | displayName, initials, onboardingStatus only |
| Communication preferences | profile_id,ministry_email,faith_boost_email,book_release_email,partner_email,sms_updates,updated_at | communication_preferences.profile_id equals same ID; row owner checked again | five strict booleans plus exact updated_at revision |
| Identity | provider user ID for internal validation, AAL from provider-accepted token | verified subject/current active session | owner display label/initials and assurance only |
| Dashboard | no extra table or course read | no additional permission inferred | courseAvailability:unavailable |

Nullable names in the real profile schema use generic Member/M, not user_metadata fallback. Each name accepts up to120 UTF-16 code units, combined display name241 and onboarding status80. Undefined/malformed values remain unavailable. An empty owner result is missing; failed reads, foreign/duplicate rows and malformed fields remain unavailable. A denied upstream permission fails the envelope401/403 rather than masquerading as a successful empty record.

Preference booleans are never coerced. The exact timestamp revision is retained, including provider precision. This read package does not invent a profile CAS, consent decision, opt-in mutation or new preference event. Communication choices are not permission to share a resource or contact a relationship.

No email, phone, raw user/session IDs, staff-role joins, inviter/leader/campaign fields, private notes/Faith bodies, grading keys, entitlements, financial fields or Storage locators enter the response. Staff-like user metadata and AAL2 do not expand the projection to another owner. No request loads staff, finance, relationship or course detail tables. Course summary remains unavailable until a separately reviewed safe summary exists.

## Exact response contract

Version: lockliel-member-server-read-v1. Top-level keys only:

- version, nonce, generation
- boundary:64 lowercase hex opaque SHA256 of project/site/deploy/source/owner/session/AAL; raw IDs never emitted. This is response correlation, not transferable authentication.
- validUntil: integer Unix milliseconds, capped at earliest of60seconds from response and actual token expiry
- binding: project,site,deploy,source only
- identity: {status:ready,value:{displayName,initials,assurance}}
- profile: {status:ready,value:{displayName,initials,onboardingStatus}}, {status:missing}, or {status:unavailable}
- preferences: {status:ready,value:{ministryEmail,faithBoostEmail,bookReleaseEmail,partnerEmail,smsUpdates,revision}}, {status:missing}, or {status:unavailable}
- dashboard: {status:ready,value:{courseAvailability:unavailable}}

Errors are generic with no upstream payload, URL, token or stack. No logging exists. All responses carry private/no-store, both CDN no-store headers, Vary:Cookie, nosniff and no-referrer. No CORS permission or Set-Cookie is returned. Runtime headers are emitted in the function, not inferred from static hosting headers.

## Tests and limits

85 tests pass under the existing deny-all network guard, zero failures/skips. Scoped ESLint has zero warnings. The coordinator owns full combined regression, TypeScript, builds, Netlify validation, SQL fixture and browser acceptance. Local mocks verify request methods, destination, bearer/owner filters, select allowlists, explicit states, token/provider/active-session denial, A/B isolation, metadata/staff boundaries, final revocation/expiry, malformed/oversized responses and no credential/error leakage. Mock passing does not certify live RLS, current table/column/RPC ACLs, provider Auth, maintenance or current hosted function binding.

No new SQL or migrations. No hosted state changed. Existing280 migration sources, course release branch/PR4, public design and production boundaries remain untouched by this lane. Keep maintenance ON. Future hosted testing needs exact source/deploy/project attestation, safe coexistence with the course site, schema280/readiness/grants proof, protected synthetic sessions and separately scoped owner authority. No credential entry or hosted session is requested here.

## References checked

Netlify function skill and successful get_netlify_coding_context(creationType:netlify-functions) read before implementation. Supabase changelog markdown fetch was unsupported by the web reader; current HTML changelog and linked Auth/session docs were read instead. Current breaking-change listing includes Data API exposure changes, so actual grants and RPC exposure remain explicit hosted gates.

- [Supabase current changelog](https://supabase.com/changelog)
- [Supabase provider-verified getUser](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Supabase session ID and revocation semantics](https://supabase.com/docs/guides/auth/sessions)
- [Supabase JWT reference](https://supabase.com/docs/guides/auth/jwts)
- [Netlify function overview](https://docs.netlify.com/build/functions/overview/)
