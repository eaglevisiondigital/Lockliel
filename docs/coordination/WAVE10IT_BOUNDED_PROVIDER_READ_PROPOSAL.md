# Wave 10I-T conditional one-operation provider proposal

**NOT EXECUTABLE. No live read is authorized by Wave 10I-T.**

Reviewed local source: `4560d7b87c6815cf48888bf4976c13aa61cd2fa4`. The pure response filter and fixture checklist are implemented and reviewed. A concrete protected collector establishing request, TLS, operator and isolated-project provenance is not installed or independently verified. A successful pure parse cannot fill that gap. Do not ask for a token, enter credentials, open a secret-bearing tool response or execute this proposal yet.

## Exact useful operation after prerequisites

One HTTP GET to `https://api.supabase.com/v1/projects/qjksggxorghaxvpyslip/config/auth`, with no query parameters, body, redirects, retries, fallback endpoint or parent-project request. This is the [documented Auth configuration read](https://supabase.com/docs/reference/api/v1-get-auth-service-config). Required existing fine-grained permission is `auth_config_read`, restricted to qjks; OAuth equivalent is `auth:read`. Current user/operator role must also permit this exact read. Do not create a token, broaden permissions or read another project. A general read-only preset is not proof of narrow permission.

This operation is more relevant than another get_project read because it can establish the hook flags. It cannot establish branch-parent linkage, Auth binary version, named operator identity or the provenance of a different fixture service-role credential. Those remain separate UNKNOWN facts. The S call allowance was spent and is never reused.

## Prerequisites that must be completed before approval is executable

1. Source-pinned private collector with a single fixed HTTPS destination and authenticated provider TLS/hostname validation; no redirects, proxy substitution or arbitrary URL/callback. Bind the actual request path and returned status to a nonsecret collector receipt. Because the response contains no project ref, the request/transport evidence is indispensable.
2. Independently reviewed owner-only local input/process boundary. Reuse an approved protected-input mechanism only after its source and compatibility are verified. Existing operator authorization must be supplied privately in memory, never in a tool argument, environment, shell history, file, log or model-visible response. No new credential is created or retrieved by this proposal.
3. Named operator and existing child-scoped read authority established through approved nonsecret evidence before access. An operator label or locally entered permission assertion is insufficient. Never print a token, prefix, token hash, credential fingerprint, SMTP setting or private user identity to prove authority.
4. The private process calls `projectPrivateAuthConfigJson` before any raw data can cross into tool/model output. The complete raw Auth response contains secrets and must never enter a connector returning raw content to the conversation. The current pure function is not that process or transport.
5. A new exact one-read authorization and durable, nonsecret consumption record. Consume before the authenticated request, stop after any failure/interruption, no second request after restart. Do not reset J or consume the application reservation. No grant is created in T.
6. Independent review and synthetic tests must cover the actual collector boundary, credential disposal/process exit, wrong target, redirect, raw error, timeout, interruption, duplicate attempt and response-to-request binding. Review the public schema snapshot for changes before sealing it. The filter rejects undocumented fields rather than adapting live.

The smallest remaining local correction is the concrete private collector binding to this already-reviewed filter, not another general fixture redesign. If the execution environment cannot guarantee that boundary, stop. A private owner-operated isolated Dashboard observation of nonsecret hook controls may supply narrower evidence, but cannot be represented as a source-authenticated API receipt or prove credential provenance.

## Allowlisted output

Only fixed operation/project expectation, observation timestamp, collector/source/approval references that contain no credentials, HTTP success/fixed failure classification, and the seven hook enabled states: before-user-created, after-user-created, custom-access-token, password-verification-attempt, MFA-verification-attempt, send-email and send-SMS. True maps to configured, false to disabled, null to unknown. Missing fields fail. Do not emit URI, hook secrets, SMTP/OAuth/password/JWT configuration, raw errors, free provider text, full response hashes or any credentials.

The collector must distinguish a verified request binding from unknown provider/operator/key facts. A digest of the allowlisted projection can record local integrity; it is not a provider signature and cannot mint fixture authority. Evidence is usable for a later creation gate only within its five-minute freshness window alongside all independently required native/identity evidence. This read alone cannot authorize two-account creation.

## Bounds, cost and stop conditions

Proposed bounds: one GET, fifteen-second total deadline, at most 65,536 response characters plus a strict 65,536-byte transport cap, no pagination and no retry. No resource creation, paid infrastructure or settings change. The public endpoint contract documents a read operation, not an exact per-request price; actual provider billing/headroom has not been inspected. Do not promise zero cost. If the owner/operator cannot accept this bounded existing-service usage or sufficient headroom is unverified, stop before the request.

Stop on missing operator/scope evidence, unavailable private input, unreviewed collector/source, wrong host/project/path, TLS failure, redirect, non-200 status, oversized response, timeout, interruption, unknown/duplicate/missing field, schema/type mismatch or any raw-output risk. Emit only a fixed sanitized failure. Do not treat parse success as activation readiness; configured or unknown hooks leave provisioning blocked. Dispose of transient response/input on process exit; immutable runtime copies cannot be promised physical zeroization.

## Exact future owner authorization text

Do not submit this as executable until the prerequisites above are verified:

> Authorize exactly one private read-only GET of `/v1/projects/qjksggxorghaxvpyslip/config/auth` using the separately reviewed source-pinned collector and existing isolated `auth_config_read` authority. Permit the secret-bearing response only inside the protected private process and permit output only of the seven validated hook states and fixed nonsecret request evidence. No credentials or raw response may enter ChatGPT, tool output, files, environment variables or logs. Enforce one attempt, the documented deadline/size bounds, no redirects/retries, and stop on any missing authority or security evidence. No production request, permission change, user creation, database connection, migration, maintenance change, Netlify action, push or merge is authorized.

Source for the filter is fixed above; **collector source remains UNAVAILABLE**. This is deliberately a conditional proposal, not a launch command or permission to implement unreviewed credential handling during execution.
