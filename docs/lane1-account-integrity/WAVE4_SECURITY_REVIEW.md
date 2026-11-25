# Wave 4 bounded security review and real-CAPTCHA acceptance preparation

Date: 2026-11-01. Owner: `/root/security_wave4`. Branch: `codex/lane1-account-integrity`. Starting local checkpoint: `755b9859023dbb17995ade499eab53ecf9088686`.

This document supplements `REAL_CAPTCHA_ACCEPTANCE_PROCEDURE.md`; it does not open an execution window. Wave 4 authorizes L5–L8 synthetic contracts and bounded security review, not production account or Auth/CAPTCHA changes. The earlier automatic review rejection remains historical and must remain in the coordinator record; this security review does not bypass it.

## Evidence reviewed and source boundary

Read the Wave 3 coordinator result, lane Wave 3 result, existing real-CAPTCHA procedure, exact Git source parents, CAPTCHA component/helper, signup/login/recovery/config handlers, static form tests and network guard. Applied the Supabase skill's Auth security checklist to this local source review. No current provider behavior or setting was inferred from documentation recollection, and no live provider observation was made.

- Exact standalone Auth source `d71d079126f48e49f8d3df591373c0381b9f91e1` is a child of production main `1599ab271e0120a5cdc4e38e225ba749dd214721`. Its schema-274 compatibility and earlier mock validation are historical evidence, not production activation or current deployment attestation.
- Exact course source `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098` is distinct. Its course/schema-280 acceptance does not include or certify the standalone real-CAPTCHA candidate. Never silently substitute one for the other.
- Local source inspection confirms that CAPTCHA proof is forwarded to Supabase for verification, rather than accepted as browser authority. Missing/malformed proof and unavailable configuration are guarded. An unset local feature preserves the old Auth path, so local tests alone do not establish provider-enforced protection. Actual provider configuration, all relevant clients and direct-Auth behavior require later isolated acceptance.
- Frontend code clears proof on error, expiry, timeout and reset. This source behavior does not demonstrate that a real proof was generated or accepted. Historical error 300030 remains before accepted proof; automation alone is not established as its cause.
- Signup source/referral fields are user-influenced attribution, not trusted actor identity, consent, membership or staff/leader authority. The original inviter, latest campaign, current mentor/group and access permissions remain separate.

The course lane's current alias-to-immutable-deployment/backend binding gap remains open. Ready metadata, static parity, CSP and 401 responses cannot certify current runtime code or its backend. No fresh isolated database/readiness observation was performed here. The carried-forward isolated state remains schema 280, paused=true, schemaReady=true, protocol=278-v1, with maintenance ON. Production's ledger-274 and account observations remain dated evidence, not a fresh audit.

## Required acceptance preconditions, all still gates

1. Record the exact reviewed Auth source, immutable deployed artifact, function/source digest domain, current alias mapping, intended isolated backend and outbound protections. A source SHA is not a deploy SHA. An archive hash is not automatically a bundled-handler hash. A missing or mismatched link stops acceptance; do not redeploy or select another candidate implicitly.
2. Obtain independently authorized read-only isolated identity, ledger/readiness, RLS and effective private-note table/column privilege checks. Schema 280 in the shared isolated environment must not be treated as schema-274 compatibility evidence. Keep course maintenance ON; no course progression/write regression belongs in this Auth window.
3. Resolve the browser compatibility prerequisite through a separately scoped owner-operated, password-free public diagnostic in another supported browser on the unchanged network. Do not open that diagnostic from this preparation, spoof clients, change privacy settings, weaken protections, or use a dummy proof as a workaround.
4. Before any required configuration or fixture action, obtain a fresh explicit bounded isolated Auth/CAPTCHA/callback/SMTP/synthetic-identity window. Earlier temporary windows and retired helpers are consumed. The approved test inbox is the owner-designated inbox on record; reconfirm its use for the new window without repeating the address in public evidence. No production identities, SMTP, callbacks or passwords.
5. Privately capture the exact isolated baseline and restore plan before changing anything. Verify provider identity, callback/site origin, existing SMTP identity/status and untouched fields without emitting credential representations. A historic blank UI field does not prove an empty secret. Do not expose secret-derived fingerprints.
6. A fresh protected hidden-input mechanism must pass a synthetic handoff/lifetime/clear test before real input. Keep values only in process memory; no chat, command arguments, plaintext environment variables, files, Git, evidence, screenshots, logs or shell history. Request no values during planning. Do not revive a retired receiver or assume prior secrets remain available.

## Real-proof acceptance matrix for a future authorized window

Use only explicitly approved synthetic identities and bounded paced requests. Record statuses/booleans and source/deploy identity, never proof or token-bearing data.

| Case | Required evidence and stop condition |
|---|---|
| Missing, malformed, expired and reused proof | Signup/login/recovery deny safely without establishing a session or bypass. A mock provider response is local coverage only. Stop if any real path bypasses provider verification. |
| Fresh valid proof | Owner completes the real widget; the intended provider validates it for the intended action/origin. Prove request forwarding and provider outcome separately. A proof-shaped string, checkbox, public test key or test-mode success is not acceptance. |
| Signup and confirmation | Separate request receipt, provider creation, actual test-inbox delivery, one-use confirmation, callback identity and authenticated session. A 200 response alone proves none of the later stages. Never save confirmation links. |
| Recovery | Distinguish non-enumerating request receipt, actual delivery, authorized synthetic one-use completion, new authentication and old-link replay denial. Do not reset real accounts or infer password/session revocation semantics from mocks. |
| Session and account isolation | A and B use separate browser contexts; verify refresh/logout/re-login, stale/expired session denial and no cookie/account contamination. Role/AAL is checked by trusted server state, not editable metadata or stale client claims. |
| Manager | Separately authorized existing synthetic manager only: AAL1 privileged denial, normal factor challenge, AAL2 authorized success, no broader role. Password/factor replacement needs explicit scope; the old course MFA PASS is not a new CAPTCHA PASS. |
| External clients | Inventory Netlify and preserved Sites v25 entry paths and direct provider exposure. Obtain separate synthetic compatibility permission where needed. Do not edit, publish or weaken Sites or production settings to make acceptance pass. An untested client stays unverified. |
| Retry, expiry and failure UX | Failed/expired challenge clears proof and keeps protected submit disabled until fresh verification. Network/provider failure fails closed. Recovery UI must not reveal account existence. No automated challenge bypass or repeated load. |

## Consent and private-data regression requirements

CAPTCHA proves challenge completion; it does not prove contact consent, legitimate account ownership, group membership, leadership permission or authority to share another person's data. L5–L8 synthetic contracts must preserve these independent checks:

- Revoked, expired, missing or wrong-organization consent denies follow-up, sharing and invitation operations at action time. A formerly valid consent snapshot must not authorize a new action. Require explicit renewed consent; do not silently extend it.
- A previously issued invitation does not grant host/leader/staff status. An application, Founder state, campaign tag, original inviter or group lineage must not confer a role. Request, approval and actual role authority are distinct.
- Explicit share confirmation must name the intended synthetic recipient/scope and be re-evaluated after identity, organization, entitlement or consent changes. Stale confirmation must not cross an account reset boundary.
- General reports, inviter/leader follow-up and operational audit projections exclude private assessments, prayer/growth drafts, course/contact notes, finance, unrestricted contact details, credentials and token-bearing URLs. Audit outcomes use approved metadata, not submitted private bodies.
- No synthetic contract test grants actual authority. Browser payloads and user-editable source metadata are untrusted. Server authorization, verified session identity/AAL, ownership, current entitlement and private-data policy remain required future adapters.

## Account integrity and least-PII limits

No Wave 4 account queries or logs were requested or run. Prior bounded counts, timing correlations, source tags and HTTP statuses remain historical evidence. The owner reports no known approved campaign/import/test. That narrows known explanations but does not establish actor identity, intent, illegitimacy, abuse or compromise. No account is classified for deletion or restriction from this record.

Any further investigation should begin with a named question, fixed UTC range, minimum aggregate fields, bounded pagination and coverage/gap reporting. Prefer aggregates over member identifiers. Do not retrieve names, emails, IP addresses, private notes, token material or broad raw logs merely because access exists. A remediation proposal stays separate from execution and must state uncertainty, reversible scope, account-disposition authority, owner/member impact and rollback. No automatic deletion, password reset, session revocation, role change, production protection change or account merge is approved.

## Cleanup and evidence requirements for the future window

Prepare cleanup before opening the window. Restore exact captured isolated Auth/CAPTCHA/callback configuration and privately verify all unrelated SMTP/provider/settings fields. Retire only newly authorized synthetic sessions and temporary helpers/processes, clear in-memory credentials and close only test-owned tabs. Do not delete acceptance environments or broaden fixture cleanup. Independently re-read ledger/readiness and confirm maintenance remains ON. If restoration or secret/session cleanup cannot be verified, report the blocker immediately and do not call the window passed.

Separate performed observations, mock results, retained historical evidence and unknowns in the result. Do not infer production preservation from a synthetic PASS. Production activation, migrations, release, deployment, maintenance exit, content activation and member account remediation each remain separate decisions.

## Validation and result

Fresh local run: `node --import ./tests/support/network-guard.mjs --test tests/auth-captcha.test.mjs tests/auth-form-static-safety.test.mjs` using Node 24 with a scrubbed environment. **22 tests passed; 0 failed, skipped or cancelled.** Outbound network guard was active and no network-attempt failure occurred. Tests use injected synthetic provider responses and source checks; they do not exercise real Turnstile, mailbox delivery, hosted sessions, current binding or production.

Document-only change. No broad build, migration replay or hosted test repeated because no application source changed. No production or isolated SQL/log/API queries, challenge requests, keys/passwords/credential helper, browser window/session/email, Auth/CAPTCHA/settings/account/role/schema/migration/content/maintenance action, push, merge or deployment occurred.

**Readiness:** procedure and local security contracts are reviewable. Real-CAPTCHA acceptance and production containment remain NOT VERIFIED. Smallest next security action: owner review of the browser-compatibility prerequisite and exact Auth artifact/binding evidence, followed only if those pass by a separately authorized bounded isolated real-proof/email/session window. Keep course maintenance ON and all production release gates intact.
