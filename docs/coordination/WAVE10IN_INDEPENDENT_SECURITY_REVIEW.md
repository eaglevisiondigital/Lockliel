# Wave 10I-N independent security review

**LOCAL PREPARATION REVIEW PASSED. PREFLIGHT READINESS INCOMPLETE.**

November 3, 2026. Separate reviewer `/root/wave10in_security` reviewed exact Wave 10I-M source `d51b90db66d5fc650e7b5139a8a5787ba6a994ac`, documentation checkpoint `acd29c4f4b127e3a9fa66a1527a1364b6fb0c3b2`, the existing proposal and independent findings, and the additive Wave 10I-N offline preparation tool. This review authorizes no installation activation, credential input, provider request, database connection, Auth session or deployment.

## Reviewed preparation boundary

`prepare-operator-installation.mjs` uses Node built-ins and fixed read-only Git blob operations. It parses the already-hashed source-seal literal as data. It does not import the operator, execute a native worker, read private identity/operator/credential files, initialize READY/CONSUMED state, patch source approval constants, or create a usable permit/grant. The exact source lookup disables Git replacement objects and hooks, uses a cleared child environment, and rejects paths/options/callbacks supplied by callers.

Audit compares 36 source-sealed files and four exact-source extras against the reviewed commit. Staging writes those 40 unchanged files, plus a preparation-only manifest, to a new owner-private temporary directory with mode 0700 and files mode 0400. It is an inert source preparation, not a live operator installation. The disabled operator and identity approval pins remain null; native execution authorization remains false. The manifest cannot create authority, even if copied or presented to a live API. No live execution command is supplied.

Reviewed additive preparation-tool SHA256:
`221f71174c2f716f2eac641d17d599c96b4224c8db077d2be77335f036e87761`

Independent test SHA256:
`622320638a11f19c85fdcb2598a6b5a11f1abaa9b7151ec5e7161c7c4f77957e`

All 36 retained source seals were independently compared to current bytes. Original source, authority, identity, native guard, attempt primitive, uploader, receipt verifier and Auth verifier were not changed by this reviewer.

## Findings and verification

1. **Corrected strict-data defect.** The initial new manifest checker applied a hexadecimal regular expression without requiring a string. A one-element array containing a 64-character string passed JavaScript coercion. The independent regression reproduced the failure. An explicit string-type check now rejects it. This did not issue live authority because the manifest remained preparation-only, but strict validation is required.
2. **Exact-source hardening.** The new Git blob reader now uses `--no-replace-objects`; otherwise local replacement refs could substitute the meaning of the named commit for extras not independently pinned in the 36-file seal. This change affects only the additive read-only preparation tool. No repository replacement ref was created or used in the review.
3. **Investigated and rejected hypothesis.** An initial concern that importing the operator immediately evaluates `esbuild` before runtime verification was disproved. The package module is dynamically imported only inside the deferred build path. A temporary exact-source copy with a synthetic adjacent `esbuild` canary reached offline preparation successfully without evaluating the canary. The fixture was removed. No dependency pre-import defect is claimed from that hypothesis, and no old code was altered to address it.
4. **No live authority from fixtures.** Synthetic identity/native/network handles, caller options, raw receipts and preparation manifests remain separate from live authority. Retained independent tests verify wrong-user/claim isolation, sanitized errors, cookie/header boundaries, reserved containment budgets, current deployment denial, and source checks before executable dependency evaluation.

Fresh validation by this reviewer: 14 new independent Wave 10I-N tests pass, including wrong target, changed authorization/grant/allowance flags, digest coercion, unknown secret-shaped fields, proxies/getters, injected options and rejected live CLI flags. Two coordinator audit/stage tests also pass when run with these tests: 16 total, zero failures/skips. The 27 retained independent Wave 10I-M attacker tests pass separately. These are subsets of coordinator regression totals, not additional unique counts. Only synthetic local fixtures and read-only local source checks were used.

## Installation and execution gates that remain unresolved

- `REVIEWED_APPROVAL` and `REVIEWED_INSTALLATION` are unset. The existing bootstrap is offline-only. An active installation would require reviewed exact private artifact hashes, source approval metadata, source/bootstrap resealing and a separately reviewed live entry. This assignment's instruction to stop on a changed reviewed boundary was honored; no such activation occurred.
- No actual independent synthetic A/B fixture-creation record, current private mapping, or operator authority artifact was accessed or verified. A/B labels, account existence/counts, editable metadata, or successful login are insufficient provenance. The exact existing subject/profile/creation/login digests must be tied to independently approved isolated fixture evidence before the native comparison can run.
- Current branch linkage in the native proof is explicitly historical, `fresh=false`. Fresh current identity/health evidence requires separately authorized nonsecret child-only metadata or protected owner evidence. No production-parent access may be added silently.
- Operator approval, native permit and new grant carry original issue/expiry times within five minutes. Exact source/artifact installation must be sequenced and independently checked inside its allowed timing window. Stale records cannot be re-dated, and J's consumed receipt/allowance cannot be rearmed. No usable fresh grant was created here.
- Provider caller/site/account permissions, billing headroom and publication/alias preservation are not freshly verified by offline review. They require the future bounded provider reads. Read-only proof must come from the same direct IPv6/TLS-verified PostgreSQL connection and transaction that performs the eight fixed inspections, with actual on/5s/30s witnesses, ledger 280, maintenance ON, catalog/RLS checks, approved A/B digests, rollback and close.
- A preflight pass cannot establish hosted Auth denials. The ordinary A/B observer currently proves only a limited subset of the unchanged acceptance fields when actually run. Anonymous/expired/revoked, forged owner/role, cross-user and privilege-denial observations require their exact reviewed scenarios. Deliberate session revocation is a separate mutation, not implicit read-only permission. Positive manager AAL2 and staff-role acceptance remain separately authorized and NOT TESTED. No verifier requirement was weakened.

The smallest next action is review of the exact protected provenance and source-pinned activation procedure, followed by separately authorized one-use read-only preflight only after those installation prerequisites are fulfilled. No executable preflight command is approved by this report. Deployment remains held even if that future preflight succeeds.

## Preservation

The reviewer performed no live credential/private artifact access, network/provider/database request, hosted Auth, password reset, grant initialization/reset, maintenance/settings change, migration, reservation/upload/deployment, Git commit/push/merge, message/payment/content activation or production action. J remains recorded CONSUMED and the application reservation UNUSED; these statuses were not modified. Original application, all 280 migration sources, PR #4, course acceptance infrastructure and published sites are preserved by no action. No fresh production or hosted-state audit is claimed.
