# Wave 10I-S independent security review

November 3, 2026. Reviewer: native agent `wave10is_security`, separate from coordinator and feature-review agent. Scope: public official provider contracts, existing local R source, and the proposed bounded evidence operation. No authenticated provider inspection, credentials, SQL, account operation, installation activation or deployment was performed by this reviewer.

## Result

**ISOLATED PROVIDER EVIDENCE STILL BLOCKED**

The owner separately approved the exact one-call child-project metadata read described below. The coordinator reports that it ran once at 2026-11-03 14:12:45 UTC and returned only the fixed sanitized category `UNVERIFIED_PROVIDER_RESPONSE`: the positive projection could not validate the response, and the raw response was discarded. No retry is authorized or performed. This result establishes no provider identity, status, permission denial or underlying failure cause. All fresh target facts remain UNKNOWN. The operation could not establish the full required branch linkage, managed Auth hooks/version or operator credential provenance. A material compatibility gap also exists: the current R provider-evidence schema covers four hook states but omits the provider's documented after-user-created hook. Keep the fixture installation seal disabled. No broad engineering redesign is needed.

## Evidence reviewed

Local source `9bde7d74e3f8c303155ece75fd8148c0d45fd61a`, documentation `70d4925bc701d9eef46d1f57df471f0d245e793d`, R readiness report and `scripts/fixture-provision/operator-authority.mjs`. Public official documentation and the unauthenticated [Management API OpenAPI contract](https://api.supabase.com/api/v1-json) were read. The latter was parsed locally and only schema definitions were printed; these were example/type contracts, never project responses.

The requested changelog Markdown endpoint was unsupported by the web renderer. The official [scoped-token changelog](https://supabase.com/changelog/scoped-personal-access-tokens-ga) and [current token documentation](https://supabase.com/docs/guides/platform/personal-access-tokens) were reviewed instead. Token permissions intersect the operator's current role; an endpoint success does not establish all permissions or a particular named operator. The read-only preset can include secret access, so it must not be assumed suitable.

## Supported operations and limits

| Operation | Documented authority / projection | Security disposition |
|---|---|---|
| `GET /v1/projects/qjksggxorghaxvpyslip` | Project Settings Read / `project_admin_read`; project ref, status and database host metadata | Smallest proposed call. Keep only exact identity/host/name-match booleans and finite status enum. No parent linkage is documented in this response. |
| `GET /v1/projects/qjksggxorghaxvpyslip/health?services=auth` | Project Settings Read; Auth health response can include `info.version` | Supported potential Auth-version evidence, not executed. Reject free-text `error` and `description`; project-addressed response still needs a reviewed collector and owner approval. Missing version is UNKNOWN. |
| `GET /v1/projects/{ref}/branches/{name}` | Development Branches Read or Production Branches Read; returns branch id/name/project_ref/parent_project_ref/status | Has needed relationship fields, but no documented guarantee establishes that substituting the child ref looks up its own parent linkage. Do not assume this works and do not call production parent. Child-only linkage remains unresolved. |
| `GET /v1/branches/{child-ref}` | Branch configuration endpoint | Exposes `db_pass` and `jwt_secret` in documented schema. Excluded. This is not a nonsecret identity endpoint. |
| `GET /v1/projects/qjksggxorghaxvpyslip/config/auth` | Auth Config Read / `auth_config_read`; all seven hook enabled/URI/secrets groups | Secret-bearing aggregate response. Never call through a raw model-visible tool. A privately reviewed collector would need positive field projection before output and separate exact approval; none is established by this review. |
| `GET /v2/projects/qjksggxorghaxvpyslip/config` | Alpha endpoint with eight read permissions, effective configuration and Auth-secret HMACs | Unnecessarily broad. Not a substitute for narrowly reviewed hook evidence. Do not broaden permissions. |
| `GET /v1/projects/qjksggxorghaxvpyslip/api-keys?reveal=false` | API Keys Read metadata operation; response schema also permits `api_key`, prefix, hash and arbitrary JWT-template object | Possible later metadata investigation only. Explicit `reveal=false` is not enough to permit raw output; discard key/prefix/hash/template and free text. Metadata alone cannot prove an unseen key's actual source/validity or its holder's authority. No call approved here. |
| `GET /v1/profile` or organization-member inventory | Profile contains email/username and operator id; account/org scope | Not part of the exact child-only call. Exclude unapproved account-wide inspection and unnecessary PII. |

Sources: [project](https://supabase.com/docs/reference/api/v1-get-project), [Auth health](https://supabase.com/docs/reference/api/v1-get-services-health), [branch](https://supabase.com/docs/reference/api/v1-get-a-branch), [branch configuration](https://supabase.com/docs/reference/api/v1-get-a-branch-config), [Auth config](https://supabase.com/docs/reference/api/v1-get-auth-service-config), [project config](https://supabase.com/docs/reference/api/v2-get-project-config), [API key metadata](https://supabase.com/docs/reference/api/v1-get-project-api-keys), [profile](https://supabase.com/docs/reference/api/v1-get-profile).

## Proposed one-call boundary

Conditional independent approval applies only after the owner explicitly approves one connected `supabase_get_project` operation with `id=qjksggxorghaxvpyslip` and the actual connector's input/response envelope is inspected. No retry, fallback, parent request, listing or additional operation is implied.

The execution wrapper must retain the raw response only inside the tool orchestration boundary, parse the documented JSON envelope and emit a newly constructed object. Allowed fields: fixed requested project, exact returned identity match, expected branch-name match as a boolean, expected direct host match as a boolean, a strictly validated documented status enum or UNKNOWN, operation name, observation timestamp, and digest of the allowlisted projection. Do not return raw names, organization metadata, arbitrary database strings, provider errors or full response hashes. A local digest documents integrity of what was observed; it is not a provider signature or independently sufficient authority seal.

Fail closed on error, missing/mismatched project identity, conflicting/multiple response objects, malformed JSON, unrecognized envelope or ambiguous status. Never `text(result)`, serialize the complete result, forward tool content/error blocks, or rethrow provider exceptions. If the tool itself exposes raw content before wrapper projection, do not execute it.

Success proves only that the currently connected operator can read this child's project metadata. It does not identify that operator, establish a service-role credential's provenance, prove parent linkage, inspect hook configuration or certify current Auth code.

## Actual projection review and offline negative checks

The coordinator supplied `/private/tmp/lockliel-wave10is-project-projection.js` and the sanitized `/private/tmp/lockliel-wave10is-project-receipt.json`. The latter contains only the blocked category, fixed target/operation, observation timestamp and `rawResponseRetained:false`. The reviewer read no raw response and cannot infer why parsing failed.

Eight additional synthetic cases were executed against the exact pure projection, with no provider call. Six met the expected acceptance/denial result; all eight withheld the private sentinel. Two defects were found:

1. A result with `ref` equal to qjks but `id` equal to production was accepted, because `ref` takes precedence. Conflicting supplied project identity fields must fail closed; do not assume interchangeable semantics until the connector contract establishes them.
2. A qjks `structuredContent` object plus a conflicting production JSON text block was accepted, because the structured representation hides the text representation. Reject mixed nonempty representations or independently establish their exact consistency under the connector contract.

Other cases passed: unknown structured envelope, array result, raw error with private sentinel, unknown status mapped to UNKNOWN, private extra fields discarded, and explicit wrong child ref. These are local projector tests, not provider authority evidence. The actual one-call receipt was blocked, so the findings do not show exposure or false acceptance in the performed call. The coordinator corrected only the temporary review projection: reject conflicting supplied ref/id and reject mixed structured/text representations. Independent rerun: **8/8 passed**, all eight with no private sentinel leakage and zero provider calls. Original projection SHA256 `de67d015cf29899228ba911116dc5441acc40fed59d7b7d12d7f196abb924265`; corrected SHA256 `07e836b9869b91463349e82062c45433a68cb9e4b7ced65976b18ed79a0ca27f`. The corrected projection has never executed live. The actual connector envelope remains unverified, and the actual call failure cause remains unknown. Do not invoke the provider again under the spent approval.

## Material local schema finding

The current `validateFixtureProviderEvidence` requires only:

- `beforeUserCreatedHook`
- `customAccessTokenHook`
- `passwordVerificationHook`
- `sendEmailHook`

The official current `AuthConfigResponse_Output` schema independently contains seven nullable boolean hook enablement fields: custom access token, MFA verification attempt, password verification attempt, send SMS, send email, before user created, and **after user created**, each paired with URI and secret fields. The after-create field is directly relevant to the authorized account creation boundary. Missing or null enabled state is not false. Unknown future hook fields must not silently imply no additional hook risk.

Minimum correction proposed, not implemented in S: represent after-create explicitly, reconcile all seven types with the creation path, reject missing/null/unreviewed hook evidence, and test that an enabled or unknown after-create hook cannot produce an activation seal. Bind the observed Auth version to the reviewed provider behavior. Keep any unsupported hook identity/version UNKNOWN. A URI is configuration, not proof of deployed function bytes; HTTPS URIs may embed credentials and must never be copied raw. PostgreSQL trigger/function hashes remain a separate guarded native inventory, not something project metadata proves.

The narrower source change does not authorize a new collector, broader token scope, hosted queries, or account creation. Existing installation remains disabled.

## Operator provenance and receipt authority

Read permissions, human authorization and credential capability are separate. Current PAT documentation supports per-project permissions, but no live token or operator scope has been inspected. Do not create a token or grant extra permissions to complete this review. The R worker's accepted legacy service-role JWT is broader project-admin capability constrained by the worker; decoded claims alone do not authenticate provider origin. A successful Project Settings read does not authorize or verify that separate credential.

A later authoritative receipt needs exact child project and source operation, observation time, trusted collector identity/integrity, operator identity and the specific successful read authority, with the parent linkage and hook/version facts independently supported. Locally entered assertions or a hash of them cannot manufacture these facts. Five-minute validity is an execution requirement, so today's documentation cannot be reused as a fresh creation seal.

## Smallest remaining action

The single approved metadata call is spent. Do not repeat it or infer a missing permission. Review only the connector envelope contract and failed-closed projection offline before proposing any separately approved read. Preserve unresolved identity, linkage, hooks/version and key provenance as UNKNOWN. Resolve child-only branch linkage through provider-confirmed nonsecret evidence, not a production-parent request. Before fixture activation, make only the identified narrow after-create evidence correction and review the exact private projection mechanism for hook metadata. Stop each unsupported portion; do not spin up another general fixture-development cycle.

A later exact two-account assignment must separately approve the source/installation, actual operator and isolated-key provenance, new one-use allowance, fresh native collision/bootstrap evidence, auto-confirmed synthetic aliases, two serial creates with fourteen application bootstrap rows, private provenance custodian/checkpoint, and partial/ambiguous containment without automatic deletion. No ordinary member or manager acceptance is implied by creating fixtures.

## Preservation

This reviewer changed only this local review document and made no authenticated call. The coordinator reports the one separately approved projected child-project read above. Otherwise no credential retrieval/input, managed PostgreSQL, hosted Auth, account mutation, migration, maintenance toggle, Netlify reservation/deployment, production access, push or merge occurred. The diagnostic J allowance stays CONSUMED and application reservation UNUSED. No fresh production or hosted-state audit is claimed.
