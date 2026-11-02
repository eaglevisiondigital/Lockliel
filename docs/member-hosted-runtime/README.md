# Wave 10 isolated runtime composition

Local implementation only. No deployment, hosted authentication or provider writes are authorized by this package. Automatic approval review rejected credential-bearing UI integration. The coordinator consequently packages only the member-read route with an existing isolated session. No login/logout route is exposed. The generic Auth wrapper and its synthetic tests described below were written before that rejection and remain inactive implementation, not an authorization or completed Auth bootstrap. The original `netlify/functions/lockliel-member-read.mjs` export remains closed. Existing login, logout, core, backend configuration and production safety handlers remain unchanged.

## Composition interface

`validateHostedPin` accepts an exact public, noncredential deployment manifest:

- version `lockliel-member-hosted-v1`
- binding project `qjksggxorghaxvpyslip`, site `70b03a42-6329-476e-bf4b-2b1ce30e9567`, exact 24-character lowercase hexadecimal deploy and 40-character lowercase hexadecimal source
- origin `https://DEPLOY--jade-unicorn-642f40.netlify.app`
- context `deploy-preview`, schema `280`, protocol `278-v1`, paused `true`

Deploy/source placeholders are not usable runtime identity. A future artifact needs independently reviewed exact pins, provider evidence, and authorization. The pin itself does not attest source bytes, upload bytes, deployment ownership or actual backend configuration; the coordinator artifact verifier and provider reconciliation supply independent evidence in their respective byte domains.

`createHostedAuthHandler({ pin, runtimeSource, enabled, keyReader, fetchImpl, compose, path })` is default OFF. It first compares Netlify provider Context site/deploy/context and `published === false` with the compiled pin and source, and validates the immutable request origin/path/method. Only then can it read the isolated publishable key. `compose({ key, fetchImpl })` instantiates the unchanged reviewed existing login or logout handler with lexical isolated dependencies. It must not import the default production handler into a permissive global override. Request headers cannot provide runtime identity. Unknown/missing configuration and key input stay closed.

The only Auth paths are `/api/lockliel-auth/login` and `/api/lockliel-auth/logout`, POST with an exact same-origin Origin and JSON body no larger than 4096 bytes. Cross-site/same-site Fetch Metadata is denied. Responses are private/no-store at browser and both CDN layers. Only existing host-only Secure, HttpOnly, SameSite=Lax access/refresh cookies are accepted. No new Auth framework, refresh flow, signup, recovery, email or MFA endpoint is introduced.

`createHostedMemberRead` composes the existing Wave 8 read factory. In addition to verified provider identity, stable active-session RPC and caller-scoped RLS reads, it requires a fresh authenticated GET of `lockliel_course_cutover_status` reporting `paused=true`, `schemaReady=true`, `protocol=278-v1`. The readiness function evaluates database postconditions, but its three-field DTO does not expose an independent migration ledger. Exact 280-ledger/catalog attestation remains an independent provider preflight requirement. No maintenance change or course read/write is performed. Dashboard course availability remains unavailable.

## Confined transport

`createHostedReadTransport` is a standalone GET-only/no-body transport for the actual member-read artifact. It checks the method before key lookup and shares only claim, path and bounded-JSON helpers with the inactive generic transport. It does not call `createHostedTransport`, so unused Auth code can be removed from the read artifact by the bundler. Auth POSTs cannot pass the read dependency. It permits only the exact isolated HTTPS origin, approved method/path/query combinations and the supplied isolated publishable key. Caller-bearing requests require isolated issuer/ref, authenticated role/audience, UUID subject/session, current expiry/not-before and known AAL. These decoded claims are a prefilter, not signature authority; member identity still requires the provider user endpoint plus active-session validation. GET profile/preference selections are fixed, minimal, owner-scoped and limit one. Provider redirects, service/legacy keys, refresh, signup/recovery, admin, private notes, production destinations, arbitrary queries and writes are denied.

For password login, only the existing email/password payload reaches the provider password-grant endpoint. Returned token claims, user identity and nonanonymous status must match the isolated boundary before the existing cookie routine sees them. Raw provider failures and extra user metadata are excluded. Logout can revoke only the approved isolated access token and clears existing cookies. This Auth lifecycle remains unexecuted on hosting.

Secret lookup uses an injected private reader for `LOCKLIEL_MEMBER_READ_PUBLISHABLE_KEY`; the final entry composition may supply `Netlify.env.get` through that reader. No actual key is fetched during local tests or included in source/artifact manifests. Private values remain request/process-memory-only and are not deliberately cached, persisted, logged or included in response DTOs. Strings are released with the request scope; JavaScript cannot promise physical memory zeroization.

## Local validation

The focused runtime suite uses explicitly synthetic fixture strings and injected mock transport only. It covers wrong/missing runtime identities, OFF/default policy, wrong source/site/project/origin/context/publication, missing keys, no-query owner forging, foreign/expired tokens, active-session revocation, exact readiness, caller isolation, transport allowlists, redirect/raw-error rejection, response projection, Origin/metadata/JSON/body limits and secure cookies. The broader existing server/client/cross-lane suite checks backward compatibility. Exact counts and commands are recorded in the Wave 10 coordinator report after final integration.

Hosted route precedence, real current Context values, real isolated password authentication/caller REST acceptance, independent publishable-key project attestation, immutable deploy identity and browser-ready user reads are not established by these local tests. Do not treat this factory as deployed or live.
