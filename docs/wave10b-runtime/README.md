# Wave 10B local Auth runtime

Local implementation only, 2026-11-01. This source does not authorize hosted Auth, credentials, a deployment or a provider setting change. The coordinator owns the final source commit, full validation, independent review and release proposal.

## Implementation and reuse

`createLoginHandler` and `createLogoutHandler` expose the existing handlers through dependency injection. Their default exports retain `withProductionBackend`, production validation/grant/MFA response semantics, cookie serialization and existing best-effort unspecified-scope production logout. Both path/rate-limit configurations remain unchanged. Pure annotations permit the existing read-only archive to omit unused Auth exports; they do not change runtime execution.

`createHostedLogin` and `createHostedLogout` compose those actual factories. Both read enablement and independent `authEnabled` default false and require literal true. Trusted provider Context must match the immutable source/site/deploy, unpublished deploy-preview, exact origin and isolated project. Browser headers cannot supply that authority. Wrong-runtime and CSRF requests do not clear cookies or touch a private runtime key.

Accepted Auth requests require POST, exact path/origin, JSON, no query or browser Authorization, approved Fetch Metadata and at most 4,096 bytes. The actual login accepts exactly email/password; logout accepts exactly an empty object. Password grant is sent only through the confined isolated transport. Credentials are never returned in URLs, diagnostics, browser JSON or evidence. Raw provider failures and redirects are replaced by generic errors.

The new isolated cookie adapter reuses existing serialization, encoding, names, expiry and Max-Age=0 clearing, with fixed Path=/, HttpOnly, SameSite=Lax, no Domain and explicit Secure even when build environment variables are missing. It never changes process.env. Failed trusted login clears prior host cookies. No refresh flow or broad session DTO is added.

## Logout and MFA

Valid isolated tokens may reach only POST `/auth/v1/logout?scope=local`. Global, others, unspecified scope, extra query parameters, refresh and request bodies are rejected. Cookie clearing is distinct from provider revocation:

- Missing, expired, malformed and foreign cookies clear locally without reading a private key or making a provider request: `revocation=not-attempted`.
- Valid isolated logout clears locally and reports `verified` only for provider success. Provider failure or missing key reports `unverified`. This does not promise immediate invalidation of an access JWT on another client.
- MFA-required AAL1 grants fail before success cookies, clear prior host cookies and attempt local revocation of only the newly issued grant held in process memory. Verified phone and WebAuthn factors cannot disappear into no-MFA acceptance through TOTP-only filtering. Unknown/malformed provider factor knowledge is also denied and only that new grant is locally cleaned up. Both known and unknown MFA denials report `requiresMfa=true` and explicit verified/unverified cleanup so the UI stops acceptance. No challenge, factor reset, manager workflow or role grant is implemented.

Decoded claims only prefilter the isolated issuer, audience, role, expiry and session identity. Provider password-grant/user identity and the existing caller RLS/session-active checks remain the authority. Browser role claims do not authorize anything. The existing GET-only member read transport, DTO and readiness checks retain their semantics; private courses, notes, financial data and privileged paths remain unavailable.

## Validation and limits

The network-guarded focused run passed 107 tests: 59 new actual-composition/security tests plus the existing 48 runtime tests. Scoped ESLint passed for both extracted handlers, runtime, transport, cookie adapter and the new test file. These numbers are subsets of any later full-suite total, not additional unique tests.

Synthetic tests cover actual handler composition, default production factory compatibility and guards/rate limits; source/site/project/deploy/context/publication/default-OFF; body/Origin/CSRF/query/native form rejection before private-key use; Secure host-only success/clear cookies; A/B provider identity and minimal response; revoked-session denial; expiry/foreign-cookie zero-egress cleanup; local-only scope and honest revocation failure; known and unknown MFA success-cookie denial and new-grant cleanup; generic upstream failures and redirect denial; unchanged GET projection regressions.

A separate agent reviews these changes. This implementer does not certify its own security acceptance. No hosted session, real password, runtime provider key, SQL, migration, provider settings, maintenance operation, message, role, payment, deployment, push or merge was performed here. Real hosted provider binding, runtime key provenance, exact deployment and existing synthetic A/B acceptance remain separate future authorization gates.
