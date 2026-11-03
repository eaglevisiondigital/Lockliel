# Wave 10I-U independent security review

November 3, 2026. Independent reviewer: native agent `wave10iu_security`, separate from collector and member-feature implementers. Scope is local implementation, synthetic offline validation and public unauthenticated documentation only. No authenticated provider operation or credential access is authorized.

## Provider authority limitation

The official [personal access token documentation](https://supabase.com/docs/guides/platform/personal-access-tokens) establishes that token permission scope intersects the current account role. Token possession, its scoped prefix, a local operator name, a JSON approval record, source integrity and a successful request cannot individually establish named operator identity and exclusive isolated-project permissions. The public documentation reviewed does not establish a pre-secret introspection procedure binding the exact submitted credential to these facts. This is a limitation of the reviewed evidence, not a claim that the provider has no other capability.

The [Auth configuration endpoint](https://supabase.com/docs/reference/api/v1-get-auth-service-config) is GET `/v1/projects/{ref}/config/auth`, requiring `auth_config_read` or OAuth `auth:read`. It returns secret-bearing configuration with no project identity, operator identity or credential scope attestation. TLS and the actual fixed request destination can bind a response to the service but cannot establish exclusive credential authority. The [profile endpoint](https://supabase.com/docs/reference/api/v1-get-profile) returns account identity fields, not the credential's exact project scope. The [branch endpoint](https://supabase.com/docs/reference/api/v1-get-a-branch) exposes parent linkage but does not document the required child-only self-lookup semantics. These endpoints were not called. No broader token or production-parent request is proposed as a workaround.

The public changelog Markdown endpoint returned unsupported content type; the official HTML changelog was read instead. No infrastructure or configuration change follows.

## Review gates

The live collector must stop before hidden input and before the secret-bearing request when independent authority is unavailable. Synthetic fixtures must not mint a live authority handle. Receipt integrity hashes are local tamper checks, not provider signatures. Freshness cannot repair missing provenance. Existing T filter and seven-hook checklist remain preserved. Unknown hooks, current Auth version, branch linkage, operator identity and credential provenance stay UNKNOWN absent actual authorized evidence.

## Implementation review

Initial source review covers the collector, authority module, native HTTPS transport, durable marker primitive and launcher. The source-authority module has no capability mint and refuses caller-created claims. An API success is not used to retroactively prove pre-request authority. The unchanged 238-field T filter remains the only configuration projection.

Confirmed initial defect: the transport returned `AUTHORITY_UNAVAILABLE` without clearing an already supplied owned credential buffer. The independent 16-test suite initially passed 4 checks and failed 12 disposal assertions for this single defect; every request still denied and no synthetic sentinel was emitted. The implementer corrected this defect; final retesting passes. The reviewer also requested stronger manifest/path integrity, interrupted/error response handling and explicit treatment of the attempt primitive as unauthenticated until independently bound.

The coordinator requested the actual ordered pipeline be tested, even though no live authority can currently enable it: authority verification, consumption, hidden input, repeat verification, one fixed request, sanitized receipt and disposal. Separate helper tests do not establish this integration. The final source implements that sequence, with live authority and entered-credential binding deliberately unavailable.

## Preservation

The reviewer has made no authenticated provider request, used no credentials, opened no database connection, changed no account/settings/maintenance, and performed no deployment, migration, push or merge. Public documentation reads are not hosted isolated evidence. J remains consumed and the deployment reservation remains unused by this review.

## Final implementation findings and disposition

The final collector uses a fixed native HTTPS request to `api.supabase.com:443`, the exact child project's Auth configuration path, GET only, TLS certificate and hostname validation, no redirects, no retries and no caller-provided destination/transport/logger. The source-pinned shell clears the environment, verifies the actual Node binary, manifest and launcher hashes before launcher execution, and the launcher validates the exact nine source/dependency files before importing the collector. Ownership, writable modes and symlink substitution are checked. These are local source/runtime integrity checks, not proof of provider/operator authority.

Confirmed review corrections are complete:

1. A rejected authority now clears an already supplied owned credential buffer.
2. The launcher is hashed before execution, rather than trusting its own later self-check. Independent modified-launcher and modified-manifest tests stop before evaluating the entry.
3. The actual pipeline includes a distinct entered-credential binding gate. A pre-input boolean does not establish that the later entered value belongs to that authority. The adapter remains explicitly unavailable, and no fake capability mint was added.
4. Five-minute proof validity is rechecked before input and after input on the same authority object, with monotonic versus wall-clock consistency. Unknown, replaced or expired authority stops the pipeline.
5. Failed or interrupted durable consumption is reported as `UNVERIFIED_OR_SPENT`, with `attemptConsumed=null` at the pipeline boundary. A partial marker is never reported as a reusable allowance. A synthetic partial-write test proves the marker survives and a restarted attempt denies.
6. The transport installs an immediate error handler, bounds bytes before concatenation, rejects invalid UTF-8, duplicate relevant headers, length mismatch, compression, redirects, incomplete responses and raw error shapes. It uses an overall 15-second deadline and fixed sanitized failures.

The actual local orchestration is tested using VM-linked synthetic dependencies: validate authority, consume the independently bound grant, revalidate, request hidden input, revalidate same authority/freshness, verify entered-credential binding, perform one fixed request, filter inside the private process, emit only allowlisted evidence and dispose owned buffers. There is no test-fixture switch or injected callback in the public live interface. The authority module has no capability mint; `loadInstalledAuthority` and the missing credential-binding adapter fail closed. The direct transport also requires an inaccessible, entered-credential-bound one-use capability.

The existing 238-field filter, schema and seven-hook checklist match the exact T source. Raw Auth JSON and error bodies are not output or hashed. The seven hook states and fixed nonsecret transport/projection fields are the only provider-derived output. All non-hook configuration is discarded inside the private process. Named operator, exclusive scope, branch linkage, Auth version and credential provenance are not inferred from shape validation. Receipt digests are local integrity only. Owned buffers are cleared; physical zeroization of immutable JavaScript/HTTP copies is not promised, so the reviewed launcher exits its process. No live private-process operation or provider transport has been exercised.

## Independent final validation

Final run used the repository network guard and synthetic data only:

`node --experimental-vm-modules --import ./tests/support/network-guard.mjs --test-reporter=tap --test tests/provider-evidence-collector.test.mjs tests/provider-collector-independent-security.test.mjs`

**77/77 passed: 59 implementer VM/transport/pipeline/ledger cases plus 18 independently authored adversarial cases.** The independent cases reject forged provider/operator/project/permission/receipt/digest/prefix authority, getters and prototypes, caller enabling flags, mutation of denied readiness, credential leakage and pre-execution source tampering. These are focused test counts, not additional full-regression totals.

Independent source verification: all nine manifest pins match; shell pins match the actual launcher, manifest and Node binary. T filter/schema/checklist bytes are unchanged. The actual offline readiness command returned `sourceVerified=true`, `AUTHORITY_UNAVAILABLE`, `inputRequested=false`, `requestAttempted=false`, `attemptConsumed=false`. Exit 1 is the expected closed gate, not a successful authenticated read. No real grant was installed or consumed.

Review evidence: `/private/tmp/lockliel-wave10iu-independent-review-evidence.json`; focused test log: `/private/tmp/lockliel-wave10iu-security-final-tests.log`. Log SHA256: `1f143c517f11770387330dacb353f029e8fccda2540b30ea434decc80ca696a8`.

- Collector: `72d0cd5ea41f345b5f41fa7b85d06fb5e437003610661fbdd1f5fad7aaaa7852`
- Transport: `650dba635d3093789e870ef50c0bc51fefa97e91a481a01f98ecf4dc94dfb60a`
- Authority: `ae74ff18d983082d76b52563fcfad44d3fe73d876b28a877ab4dc88e3d3680f2`
- Manifest: `198578421c5eb2895d8395c3cb963b3f62cee37b9e97d24f2a0d7d2ac226f12c`
- Launcher: `b3db74a7014c81e09c6952f327fdb49ccfa51bb7a68962a6d98d30a5e9b235b3`
- Shell entry: `8668e165a961adb61149c92ab5fb00cc359ffc542341ac892ccff05981b95be8`

## Remaining gate and smallest supported alternative

No actionable local defect remains in this bounded review. **Local fail-closed implementation security review: PASSED. Operational assessment: PRIVATE COLLECTOR STILL BLOCKED.** The new collector does not make independently verified operator identity, child-only permission or exact entered-credential binding available. A successful hypothetical mocked transport is not that proof. No owner approval text alone can turn this unavailable provider capability into a fact.

The smallest supported alternative is a separately authorized owner-private Dashboard observation of nonsecret isolated hook controls and existing operator/token scope metadata, with no token value revealed, copied or created. Report such evidence as an owner/provider-UI observation, not a source-authenticated API receipt or proof that a later entered token matches it. Provider confirmation of an independently verifiable child-only authority/binding mechanism remains necessary if the automated API receipt gate is retained. Do not broaden project permissions, request a production-parent endpoint or run an exploratory secret-bearing request to discover authority.

No additional fixture creation, deployment or release authority follows from this review. The fixture creation gate remains closed; J is consumed and the application reservation is unused.
