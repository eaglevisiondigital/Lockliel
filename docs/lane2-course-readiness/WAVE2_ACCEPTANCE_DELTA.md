# Wave 2 acceptance delta

November 1, 2026. Append-only clarification of the existing
[isolated matrix](ISOLATED_ACCEPTANCE_MATRIX.md). No consumed maintenance window,
credential reset or positive acceptance is reauthorized by this table.

| Matrix/gate | Wave 1 state | Wave 2 actual evidence | Current disposition |
|---|---|---|---|
| I01 frontend | Four historical artifact matches | Same four fresh 200/hash matches; CSP includes qjks/excludes production; form-action self | PASS for these four static pages only. |
| I02 runtime artifact/binding | Uncertified function bytes/runtime target | Metadata still ready / commit_ref=null; no comparable digests. Expected no-cookie session/journey 401 denials | OPEN. Behavior is consistent, not proof of complete artifact or backend binding. |
| I03 identity/readiness/security | Coordinator SQL passed; Lane2 additional call errored | Lane2 fresh read-only ON / 5s / 30s SQL passed: 280 / paused ON/schemaReady/278-v1, migration 280 fingerprint match, notes/keys RLS, postgres notes owner and zero service note table/column privileges including MAINTAIN | PASS for enumerated checks. Not a complete fresh catalog/ledger/function audit or direct TLS preflight. Prior tool error remains history. |
| API exposure/defaults | Prior accepted grants; provider rollout not assessed | Current authenticated notes SELECT/schema USAGE true and effective table/column writes false; isolated defaults service_role=Dxtm | Partial metadata PASS. Fresh authenticated REST/API-exposure and creator-default review at relevant window remains a gate; no grant changes. |
| A01–A03 manager/A/B | October 3 fa294f7 PASS | Not repeated | Retain PASS; verify current binding and explicit new Auth scope before future tests. |
| A04 logout/downgrade | Prior/source limits | Anonymous route denial is not authenticated logout/downgrade acceptance | No new positive claim. |
| C01–C02 persistence/retry | October 3 PASS | Not repeated | Retain historical PASS and fixture limits. |
| C03 browser lost-ack | Unverified | No browser/network fault | Remains optional/unverified; future explicit bounded synthetic window only. |
| C04–C13 privacy/watch/durations/resources/pending lessons | October 3 accepted evidence and stated limits | Metadata security checks only; no playback/save/resource download | Retain prior evidence. No production-duration, pending-media or PDF-byte recovery acceptance inferred. |
| C14 closure | Closed 280 baseline | Fresh SQL confirms maintenance ON and readiness; no mutating request sent | Closure verified. 401 unauthenticated requests do not establish the authenticated maintenance 503 path. |
| Real CAPTCHA | d71d079 separate candidate blocked 300030 | Not tested | Remains separate/incomplete; no public dummy-key substitution. |
| Integration/release | Reviewable local packet; no execution | Documentation delta and sanitized checks | Review only. No source/schema/remote/production permission granted. |

Before any future credential or course-write acceptance, close the current runtime
attestation gate and obtain the exact required Auth/window authority. Do not invent
a new requirement to replay already passed migrations/tests or reset manager factors.
