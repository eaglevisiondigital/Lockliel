# L8 Wave 4 synthetic administration, privacy and operations

Owner: /root coordinator. Branch: codex/lane8-privacy-ops. Original base fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098. Coordinator-owned shared dependency checkpoint d49e945684a7d8313e76b1b731f591ed1cdf1d39 precedes this lane implementation. The prior Wave3 preparation-only rejection remains recorded in the coordination packet; Wave4 explicitly authorizes this synthetic source/test package. No new approval rejection occurred in L8.

## Existing architecture preserved

Read existing lockliel-admin-person, lockliel-admin-privacy, privacy/export handlers and lockliel-core as text. Their current session/AAL2, server staff-role lookup, privacy claim/review/execute and course-note distinctions are preserved. This package adds no alternate live staff or privacy system and imports no handler. Supabase MFA documentation was reviewed; backend enforcement remains distinct from UI/types. https://supabase.com/docs/guides/auth/auth-mfa

## Implemented contracts

- Explicit synthetic organization/context and active-session/AAL2 fixture grants, plus purpose/actor/subject/revision/expiry/revocation/human-review scope. Applications, tags, assignments and caller metadata never create authority. A fixture context is NOT an authenticated principal.
- Member-support and account-integrity projections allow only opaque ID, revision, synthetic display label and coarse state. Prayers, growth, course private notes, assessments, finance and contacts never enter general member projections.
- Owner-only privacy request and projection, independent human reviewer, revision-bound review and a separately scoped operator execution PLAN. Even all-passed policy/identity/coverage/retention/revocation/operator/authorization evidence yields synthetic-plan-only with executionImplemented=false. No export or deletion exists.
- Purpose-bound metadata-only audit proposals. No audit sink or persistent log. Small-cell-suppressed aggregate operations review, no rows/PII or live operational claim.
- Separate-author content review/approval proposals with explicit rights/editorial/privacy/owner-decision gates. No publication/content/entitlement/staff activation.
- Fixed production release-gate inventory, fail-closed unknown evidence and executeProduction=false even for all-pass fixtures. No gate is asserted passed in a real environment.
- Account-integrity review proposals retain not-established attribution and never disable/delete/reset/modify an account. Privacy coverage explicitly includes profile, contacts, consent, course progress/private notes, prayers, growth, public intake, financial retention and Storage bytes.

Every result carries NO_EFFECTS: save/send/schedule/grant/publish/pay/execute=false. Denials are generic. Inputs do not escape via arbitrary extra fields; enum validation rejects coercible objects. Supplied timestamps are bounded deterministic epoch-millisecond fixtures, not a trusted clock. Real authorization, policy/retention/minors, legal financial holds, recovery proof and execution authority remain separate dependencies.

## Validation

50 guarded focused tests pass, no failures/skips. Strict scoped ordinary TypeScript, zero-warning targeted lint and browser-target pure ESM bundle pass. Bundle12595bytes, exactly L8source/sharedcontext, zero external runtime imports. Independent reviewer inspected AAL2/purpose/private projection/reviewer/operator boundaries and found no additional actionable defect in this synthetic scope. No full application build or browser claim from lane-only contracts; coordinator performs combined checks separately.

No UI, live Auth, RLS/schema/migration, staff grant, real privacy request, data export/deletion, production query/settings, Auth/CAPTCHA, email/SMS, purchase, push/merge/deploy or other repository change. All280 migration bytes match original base. No secrets or real personal data used. Shared context source is coordinator-owned and remains identical; no shared configuration edited.

## Next integration seam

A future mock-only adapter may translate an explicit scoped synthetic principal into these review projections. It must never accept L5 lineage or L6 application/catalog state as authorization, or L7 settlement as staff permission. Keep general member views separate from finance purpose, redact private domain bodies from audit/monitoring, and keep request/review/execute separate. No durable adapter is implemented or approved here.
