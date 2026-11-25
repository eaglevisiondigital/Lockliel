# Wave 10I-T independent security review

November 3, 2026. Reviewer: native agent `wave10it_security`, independent of the coordinator, evidence-contract implementer and member-feature implementer. Local source and synthetic tests only. Public unauthenticated provider documentation was reviewed; no authenticated provider operation, credential handling, SQL, account operation or deployment occurred.

## Scope and authority

Starting documentation `62caa880`; fixture integration `9bde7d74e3f8c303155ece75fd8148c0d45fd61a`. The S metadata allowance is spent and its sanitized result establishes no current hosted fact. J is consumed; the application reservation is unused. A pure projection validates data shape and cannot establish provider provenance, named operator authority, credential origin or activation permission.

## Public provider contract review

The official public OpenAPI document at https://api.supabase.com/api/v1-json was read without credentials or a project request. SHA256: `d0406b92a25c651b45f1baade59bfa384e3085ce8dfaf181a96434e7daf6807c`. This is a public schema hash, not a live provider receipt. The Auth configuration schema contains all seven nullable hook-enabled fields, including after-user-created; the rendered reference page does not currently show that last field. The official OpenAPI contract is the direct evidence for its inclusion.

The public changelog Markdown endpoint failed content-type rendering; the official HTML changelog was used. No infrastructure change follows from this documentation review.

- [Project metadata](https://supabase.com/docs/reference/api/v1-get-project): GET `/v1/projects/{ref}`, `project_admin_read`, required id/ref/organization/name/region/time/status/database fields. It does not report branch-parent linkage. Strict local response-field rejection is intentionally stronger than the open-ended JSON schema and may fail closed on future provider additions.
- [Auth configuration](https://supabase.com/docs/reference/api/v1-get-auth-service-config): GET `/v1/projects/{ref}/config/auth`, `auth_config_read`, broad secret-bearing response. A seven-flag synthetic object is not this provider's full response. No live call is permitted through a model-visible interface; no private collector is certified by a pure parser.
- [Auth health](https://supabase.com/docs/reference/api/v1-get-services-health): GET `/v1/projects/{ref}/health?services=auth`, `project_admin_read`. Auth version may be available but the service response contains no project reference. Trusted request/transport provenance is necessary; PostgreSQL version must not substitute for Auth version.
- [Branch lookup](https://supabase.com/docs/reference/api/v1-get-a-branch): parent-addressed branch operation exposes child and parent references, but its contract does not guarantee a self-lookup through the child project reference. Production-parent access remains prohibited. Credential-bearing branch configuration is excluded.

## Security findings and review requirements

1. The S projection discarded unknown fields. T's stricter requirements require rejection of unsupported fields/shapes and conflicting identities or representations. Do not guess connector wrappers until the exact envelope contract is established.
2. Disabled hooks are not proof of absent database side effects. Distinguish configured, disabled, absent and unknown with explicit applicability and independent evidence. Missing/null configuration is unknown; no implicit false conversion.
3. The native graph fingerprints triggers in auth/public/app_private/lockliel_cutover, but function bodies only in public/app_private/lockliel_cutover. An arbitrary auth/extension helper's full dependency closure is not automatically covered. Preserve this limitation and require the actual reviewed creation path; do not infer every dependency safe from one graph digest.
4. Creation and auto-confirmation can invoke the seven known application bootstrap rows per account and provider Auth/identity/audit effects. Role, enrollment, notification, custom-claim, consent and external hook effects require explicit boundaries and current evidence. Local replay is not hosted equivalence.
5. No output filter establishes a private response boundary if a tool exposes raw content before the filter executes. A caller-created `trusted`, `provider`, operator name or local digest cannot manufacture authority. Secret-bearing responses and error strings must remain outside model-visible tooling.

## Implementation and regression review

Reviewed `private-provider-projection.mjs`, `provider-evidence.mjs`, revised `operator-authority.mjs` and both new test suites. The exact REST project shape rejects missing/unknown fields, conflicting project IDs, wrong branch/host, unsupported status and duplicate JSON keys before overwriting. Escaped duplicate keys also deny. The parser accepts primitive JSON bytes only, bounds size/depth/nodes and never coerces caller objects, invokes getters or emits raw exceptions. Two explicitly hypothetical connector envelopes remain marked unverified. Successful shape validation always leaves provider identity UNKNOWN, independent authority false and activation false. Seven-field hook projection is explicitly synthetic and rejects full Auth configuration; it is not a secret-response collector.

The provider-evidence v2 creation gate requires all seven hook states disabled, exact reviewed native-graph binding, a zero-unresolved-dependency review receipt and fixed bootstrap/ordinary-role/no-enrollment/no-custom-claim effects. V1 four-hook receipts, missing or unknown states, unknown additional hooks/mechanisms and mismatched independent seals deny. A valid data object does not become a trusted operator handle. The installation seal remains disabled; obtaining and independently approving factual evidence is still necessary.

Independent initial rerun of the project/evidence suites: **148/148 passed**. After full Auth projection was added, independent final rerun of all three new suites: **420/420 passed** (includes the earlier 148). Twelve additional initial adversarial checks: **12/12 passed**, zero provider calls and no private synthetic sentinel in output. These separately covered conflicting ref/id, conflicting structured/text representations, same-value duplicate identities, escaped duplicate hook keys, extra lone-surrogate property, deep private extra fields, raw provider errors, observation-time object noncoercion, inability of valid shapes to grant authority, synthetic-hook non-authority, null/missing/false-string hook states and proxy traps. These totals describe separate checks, not additional unique full-suite coverage.

The completed full Auth configuration filter was separately reviewed. Its generated 238-property contract exactly matches the independently downloaded official schema after explicitly normalizing absent `nullable` to false for eight fields; required keys and every primitive/enum/numeric/pattern constraint match. Full configuration is accepted only as bounded JSON bytes, not a live tool response or caller object. Every unexpected or missing field denies. Secret/URI/string values are validated and discarded without output or raw-response hashing. Only seven hook states and fixed nonsecret metadata leave the function; project binding, provider identity, operator identity and credential provenance remain UNKNOWN and activation remains false. Eight additional independent full-response checks passed, including all nonnullable fields, raw/escaped duplicate secret keys, extra project identity, wrong secret field type, invalid private email, null after-create state and synthetic secret non-disclosure. Total additional independent adversarial groups: **20/20**. No real credential or response was used.

No actionable local source defect remains in this review pass. The real private transport/credential/process boundary is still unavailable and not certified by these pure filters. It must be reviewed before any secret-bearing endpoint invocation.

Final fixture pin chain independently verified: 15 fixed package files match the manifest, manifest and launcher match runner pins, and runner matches the shell launcher. The separate offline wrapper pins launcher/manifest/runtime. The local `--offline-verify` call passed with inputRequests=0 and networkRequests=0. The installation seal is unchanged, false with null approval fields; `--execute-installed` was not invoked. Manifest SHA256 `cee869b2bdd0066341624ace2e078068527c3846d13ba8adcd9b209b63d92020`; launcher `8b3bbbc32a89dfa3ab784bbb366addedd1f245679eac64bba98793ab77447ba3`; runner `2619d693441ee74d5123656534929b28da1b103d78d6952624bd13795cea2e02`. These fixture package changes are separate from the preserved 40-file deployment operator.

## Remaining operational decision

The most useful prospective operation is ONE GET `/v1/projects/qjksggxorghaxvpyslip/config/auth` with existing `auth_config_read` authority, but only after a concrete private collector, source/operator binding and strict response projection are independently verified. This proposal is NOT EXECUTABLE now. It requires exact request/TLS identity, no redirects/retries/fallback, a pinned complete response schema, output limited to seven hook states and fixed nonsecret receipt metadata, and separate owner approval. No raw tool path may expose the sensitive response. Do not create a broader token or call production to make it pass. Another project-metadata read cannot resolve hooks and is not a useful substitute under the spent S grant.

An owner-only isolated Dashboard review of the nonsecret hook controls, or provider support confirmation of child-only linkage semantics, can supply narrower observational evidence without authorizing raw secret retrieval. Such observations still do not establish credential origin or every remaining fixture gate.

A supported metadata shape alone is insufficient for execution while the concrete connector envelope/private transport remains unverified. Auth hooks, current Auth version, named operator identity, credential custody and child-parent linkage remain UNKNOWN until separately established by supported, scoped evidence. Provisioning remains disabled. No fixture creation or deployment approval is implied.

## Preservation

This reviewer performed no hosted request, credentials, database connection, migration, account mutation, maintenance change, Netlify operation, production access, push or merge. The review does not claim fresh production-state verification.

## Exact reviewed local source hashes

- `scripts/fixture-provision/private-provider-projection.mjs`: `76fa6b7f16720291115f110f9a9d68acbac3fe605f6e44a69b9cacd37077682d`
- `scripts/fixture-provision/provider-evidence.mjs`: `1e7443b0e7f40a51f9170738d14461bf9847cb7f8495edd5d6a1ceaef6aaaadd`
- `scripts/fixture-provision/operator-authority.mjs`: `a95e78a3b37d5ee6c485d1ad9bfdbec1bbd27a4bdd766b83d7729c20595a51fc`
- `scripts/fixture-provision/auth-config-schema.json`: `96e2a88494847a18923640fe0979ce4c387a4f5f82f770125c86016397b30415`

**Local correction security review: PASSED. Provider evidence path: STILL BLOCKED.** No authenticated provider or fixture activation authority is granted by this review.
