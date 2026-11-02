# Wave 10B local same-host Auth presentation

This lane adds a separately gated presentation adapter to the existing login/logout handlers. It does not create another Auth provider, store tokens, request hosted credentials or perform hosted acceptance.

The route imports the existing unchanged member stylesheet for the reused Auth card and input classes. No design token or CSS source changes were made.

The existing hosted read gate remains necessary, and `LOCKLIEL_MEMBER_HOSTED_AUTH_REVIEW=isolated-login` is independently required. Ordinary read-only and local modes retain no credential controls. The shell optional `authControlsEnabled` prop defaults to false and refuses controls without an exact binding.

Both native forms declare POST and fixed same-origin actions. SSR credential fields and submit buttons remain disabled until hydration. JavaScript sends JSON with same-origin credentials, no-store, redirect:error and no-referrer. Passwords remain transient DOM/FormData/request data, not React state, browser token storage, URLs, logs or evidence. The form is reset before awaiting transport and after every attempt. No next/return URL, signup/recovery or MFA path is accepted.

The controller invalidates before and after every Auth transition; token-free same-window and cross-tab signals clear other member views. Profile loading is a separate existing owner-verified GET, never trusted from a login response. The Load button is unavailable while an Auth transition is active. Provider errors are generic. MFA-required outcomes deny access and flag uncertain revocation. Logout distinguishes host cookie clearing from verified provider-local revocation.

Local tests exercise the actual route/component SSR, default-OFF pins, pre-hydration POST/disabled controls, JSON methods and destination, redirect/referrer options, response denials, MFA, logout uncertainty and token-free notifications. Actual browser event tests, full regression and independent security review belong to the coordinator. No hosted session, settings, maintenance or production action occurred in this lane.

Focused validation completed: 33 tests passed (21 retained Wave 10 UI cases and 12 new Wave 10B cases) with outbound network blocked. Scoped ESLint passed. The independent review suggestion to validate exact success/logout response keys and AAL values was applied; unexpected token fields or unknown AAL cannot become a UI success.
