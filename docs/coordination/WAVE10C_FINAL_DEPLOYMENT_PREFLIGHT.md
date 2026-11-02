# WAVE 10C FINAL DEPLOYMENT PREFLIGHT

**DEPLOYMENT PREFLIGHT BLOCKED**

November 2, 2026, America/Chicago. Read-only provider verification and exact-source review completed. No mandatory capability was proved unsupported, but required context and operational evidence remain unverified. Do not turn these unknowns into permission to deploy. No deployment assignment is supplied as executable.

## 1. Exact source and target

Application `327ba098628f70aa65140862b8b14cd709bfd711`; direct runtime parent `bcaa35680ffefc61775636d65f568827e42d7f06`. Starting documentation HEAD `24be944e5836cfddd9e5dad3e1683017caf3d292`, branch `codex/wave10-hosted-composition`, existing dedicated Wave 10 worktree. It was clean before this documentation package. No application, test, config or migration source changed.

Target remains Netlify **70b03a42-6329-476e-bf4b-2b1ce30e9567** only, fresh metadata name jade-unicorn-642f40, plan nf_team_pro. Team metadata says Pro. Supabase **qjksggxorghaxvpyslip**, branch course-cutover-rehearsal-274 only. A new immutable unpublished deploy-preview is proposed; **actual deployment ID remains UNASSIGNED**. No replacement target, branch/review alias or existing deploy is substituted.

Synthetic manifest `f9eb5c350815bd69930c8c90f78c8d5abb87e50a426d83cad4bc175c514647f5` remains localFixture=true/releaseEligible=false. Independently reviewed source hashes, manifest digest and all 29 retained artifact file hashes match. It is not a deployable reservation or hosted receipt.

## 2. Provider capability evidence

| Capability | Current evidence | Decision |
| --- | --- | --- |
| Reserve ID before compile; finalize same ID | Official CLI reserves first, builds afterward and updates that ID | Documented pattern, not exercised here |
| Immutable URL and unpublished draft | Official draft and deploy documentation | Supported; actual new object does not exist |
| Exact deploy-preview Context through manual digest flow | DeployFiles exposes no explicit context property; CLI context flag selects build variables | **Unverified mandatory guarantee** |
| Deployment-private protected functions key | OpenAPI 2.63.1 supports per-deploy environment, secret marking and functions scope | Documented, no provisioning performed |
| Existing course alias preservation | Draft guarantee covers published deploy; no branch/alias/review should be supplied | Exact alias readback remains required |
|30/60/IP | Code rules and upload traffic-rule mapping are documented | Actual acceptance/enforcement remains unverified |
| Independent new-draft retirement | Scoped delete plus independent immutable-route checks are documented | Operator permission and actual retirement untested |

Primary references: [CLI reservation/build](https://github.com/netlify/cli/blob/main/src/commands/deploy/deploy.ts), [same-ID uploader](https://github.com/netlify/cli/blob/main/src/utils/deploy/deploy-site.ts), [draft guarantee](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/#draft-deploys), [OpenAPI deploy update](https://open-api.netlify.com/#tag/Deploy/operation/updateSiteDeploy), [context definitions](https://docs.netlify.com/deploy/deploy-overview/). Current public CLI source is not a claim that an installed CLI version or this site's permissions were exercised.

The available MCP deploy-site interface accepts only a site ID. It cannot express the reviewed reservation/finalization/key/native-function procedure. It was inspected as tool metadata only and was **not invoked**. A separately reviewed operator implementation or supported protected API path is still needed; an abstract deploy call is not a substitute.

## 3. Fresh isolated Supabase readiness

Two scoped read-only transactions observed actual `transaction_read_only=on`, `lock_timeout=5s`, `statement_timeout=30s`, database postgres; both rolled back. No production SQL or Auth lifecycle operation occurred.

- Exactly 280 versions and all 280 stored `md5(statements::text)` fingerprints match retained canonical hosted baseline `docs/evidence/hosted-duration-280-2026-10-01/expected-280.json` and the actual post-280 hosted record:0 missing,0 unexpected,0 changed.
- Migration 280 stored-array-text MD5: `a55aead9115d12881650fee9f1bede27`. Its source-file SHA256 remains `bb8af646303725c9c29ddc7119c5d8aefe2bf0afb91c206ffa8baa1a08e1b1c3`.
- All 274 historical source seals plus 6 later seals match. No source bytes changed or migrations replayed.
- Maintenance **ON**, `paused=true`, `schemaReady=true`, `protocol=278-v1`.
- RLS enabled on 57/57 public tables. All 11 required profile/preference columns readable by authenticated, none readable by anon.
- Effective service-role private-note privileges: **0 table /0 column**. Creator-specific default ACLs still differ; future default grants are separate from current effective table/column grants.
- Three required RPCs match Wave 9 definitions/owners/ACLs/STABLE/empty search_path. Public active-session wrapper is invoker; private active-session helper and readiness are definer. Anon denied, authenticated execute present. Readiness ran only after matching its expected definition fingerprint.
- Existing synthetic A/B provenance and profiles match; each has0 staff roles/0 sessions. Only booleans/counts/labels returned, no identity/credential fields retained in this evidence.

Fresh branch metadata maps qjks to branch 7091bfd6-83ce-4c11-ac30-8ce85e09be2d and reports preview ACTIVE_HEALTHY. Direct get_project still returns Project not found/INVALID_ARGUMENT. This is an unresolved management-reader inconsistency, not deletion evidence. Project-bound SQL and branch mapping establish the inspection target; they do not establish a new Netlify artifact/backend binding.

Historical rehearsal `stage-reference.json` has different first 274 fingerprints. It is not the canonical hosted baseline; do not overwrite it or mislabel the longstanding reference distinction as new drift. Source SHA256, ledger version-set and stored-array serialization are distinct domains. [Fresh comparison](evidence/2026-11-02-wave10c/ledger-comparison.json).

No actual caller bearer/RLS REST or hosted RPC HTTP acceptance was attempted. Those remain separately authorized runtime tests.

## 4. Deployment-private key feasibility

Current API documents genuine deploy-only environment data, not merely site/context scoping. Creation/finalization can supply `LOCKLIEL_MEMBER_READ_PUBLISHABLE_KEY` with functions scope and secret marking. Data becomes immutable once provided. By that contract, a new deploy-specific value does not provision a site/team/context variable or propagate into existing course/production deploys. [Official environment helper](https://github.com/netlify/cli/blob/main/src/utils/env/deploy-env-vars.ts).

This closes the old documentation-level feasibility question. It does **not** establish a working protected transfer, opaque key project provenance, exact reservation/finalization sequencing or target-specific operational coexistence. No environment/key-value reader, publishable-key endpoint or provision operation was used. No claim is made about preexisting key presence. Do not pass secrets in CLI arguments/environment/plaintext files, logs, Git or evidence. Do not substitute site-wide configuration. Operational gate remains held.

## 5. Immutable reservation and source-to-artifact procedure

Prepare only; no operations below ran:

1. Obtain provider confirmation or separately approved secret-free reservation proof for the exact manual workflow and Context guarantee.
2. After later authorization, reserve a new draft on site 70 only with no existing alias/review/branch identifiers. Validate trusted returned site/ID/Context/unpublished status **before** compiling or transferring a key. Wrong or unknown Context stops.
3. Use a clean exact source-327 checkout, not the later documentation HEAD. Verify direct runtime parent, reviewed 11 source hashes and280 source seals; retain build recipe/toolchain versions.
4. Compile the real reserved 24-hex ID/source/site/qjks/immutable HTTPS origin into approved flags and strict Auth manifest. Synthetic a24ID and old manifest cannot be reused.
5. Recreate exactly three official native archives: lockliel-member-read, lockliel-login, lockliel-logout; exact three custom routes and minimal static assets. Independently approve source/compiled/nativeZIP/staticSHA1 domains and new manifest digest.
6. A later reviewed protected operator would finalize the **same ID**, explicitly preserving draft status, supported functions_config route/traffic-rule mapping and deploy-only functions key. No uploader is implemented or executed here.
7. Independently reread exact site/ID/source/context/unpublished state, native-function/static hashes, routes, accepted rate rules, unchanged old aliases and current backend receipts. A title, browser echo, local JSON or successful upload is not authority. Stop before Auth if any proof fails.

The reserve-before-build pattern is documented. The exact manual Context guarantee is **not proved**, and a current read-only assignment cannot experimentally create it. Do not downgrade to branch-deploy or set fake Context environment values to bypass compiled gates.

## 6. Actual rate-limit enforcement

The two Auth entries retain30 requests/60 seconds/IP. Provider enforcement is **NOT VERIFIED**. Current documentation says Pro allows five code rules per project, enforcement may lag up to10seconds, and invalid rules need not fail deployment. Require supported traffic-rule upload, rule-capacity check and explicit successful post-processing evidence. [Rate limits](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/), [official metadata mapping](https://github.com/netlify/cli/blob/main/src/utils/deploy/hash-fns.ts).

A later harmless probe should use bounded invalid JSON/empty-body POST requests rejected before credential/provider work, then check429 after the documented lag. Never run repeated real password grants to test throttling. Current plan label alone does not prove available rule capacity, configuration or enforcement. No rate probe or log containing credentials ran here.

## 7. Authentication and containment readiness

The source/acceptance proposal preserves existing ordinary synthetic A/B only, separate browser cookie jars, fixed same-host POST, Secure/HttpOnly/host-only cookies, exact Origin/CSRF gates, minimal owner reads, local-only logout, expired/revoked rejection and MFA failure without privileged bypass. No production transport, member writes, signup/recovery/email/payment or role action. Source review found no new defect.

Synthetic-only is an **operator scope**, not an A/B-only endpoint allowlist. CSRF does not exclude same-host visitors. Current site metadata reports no password/SSO requirement; unpublished does not mean access-private. No wall-clock endpoint shutdown exists. Real provider factor shape, protected credentials, current sessions and actual hosted Auth remain unverified.

Supported containment proposal: after exact-new-ID permission, ensure only the new draft belongs to site 70 and is not published, then use scoped DELETE `/sites/{site_id}/deploys/{deploy_id}`. If in progress, cancel/wait before deleting. Deletion is asynchronous. Independently confirm provider absence/deleted state and immutable page plus all three API/direct-function URLs become inaccessible. Expected404 is stronger evidence than cancellation or fail-closed503. Mutable aliases may fall back elsewhere and are not retirement proof. [Deletion requirements/effects](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/).

No deletion, cancel, protection or site-setting operation ran. Old acceptance/course resources remain untouched. Operator delete permission and actual new-draft retirement are not currently proved. An OFF successor, expired human window or abandoned URL does not retire a previous immutable Auth surface.

## 8. Expected cost

Existing target/team metadata says Pro; it does not establish legacy versus credit billing, actual balance/usage/recharge, remaining rule capacity or marginal charges. No new paid resource is demonstrated necessary, and no purchase or billing change is authorized.

The retained package has19 public files/3,147,047 uncompressed bytes and209,432 bytes across 3 ZIPs. Planning illustration: at most1,000 HTTP requests,200 function invocations,0.05 GB egress and0.05 GB-hours compute. **If** this account uses the current standard credit schedule, that example is approximately **1.7 credits** for request/bandwidth/compute, not an upper cost bound or quote. Preview deployment itself has no deployment-credit charge under that schedule; runtime/egress still cost usage. [Current credit schedule](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/).

Actual duration/memory/cache/external traffic and existing Supabase usage vary. No zero-cost or USD guarantee follows. Owner/operator must confirm billing model, available headroom and spending ceiling without enabling recharge/upgrades or changing settings. No new database, site, compute, PITR or infrastructure purchase is proposed for execution.

## 9. Recommended window and operator actions

No calendar execution is scheduled or authorized. After proof gaps close, propose a 15-minute acceptance target,20 minutes including verified retirement. This is an operator target, **not enforced endpoint expiry**. Operator must stay available through containment, with escalation if retirement fails; merely stopping at minute 20 is unsafe.

Before any later window: name operator with exact-site draft/create/update/delete rights; confirm cost/headroom and existing alias baseline; approve protected Netlify API authority/key provenance and existing A/B password input without disclosure; preauthorize only the new draft's retirement and session-local cleanup. No DB password, manager factor, new user, SMTP/CAPTCHA or settings change is required/approved here. If any is unexpectedly required, stop.

## 10. Independent review

Actual `/root/wave10c_provider_capabilities` independently researched public official provider/API/CLI capabilities without account calls. Actual `/root/wave10c_independent_review` checked source/artifact integrity and complete supplied execution proposal. Result: **PASSED WITH DEPLOYMENT HOLD**, agrees with **DEPLOYMENT PREFLIGHT BLOCKED**. It independently verified11 source hashes/all 29artifact files/280migration source equality and highlighted Context, protected key operation, public endpoint lifetime, rate enforcement and exact retirement gaps. No additional source change, provider call, SQL, test rerun or execution was performed by either agent.

Provider conclusions in the security review are based on the coordinator's supplied current evidence, not another independent account inspection. [Recorded independent review](evidence/2026-11-02-wave10c/independent-review.json).

## 11. Exact remaining approvals and smallest alternative

**No executable full-deployment assignment is ready.** First obtain authoritative provider confirmation of manual reserve/update retaining deploy-preview Context and supported protected native upload/retirement semantics. No message is sent by this assignment.

If documentation/provider confirmation cannot close it, Primary Chat may separately review a **secret-free reservation-only experiment**: site 70 only; one new empty draft; no aliases/review/branch, assets, functions, key, Auth, user or application upload; bounded cost/operator window; record only safe ID/site/context/unpublished metadata; exact-new-ID cancel/wait/delete and independent inaccessibility proof preauthorized. This is a new environment-write permission and is **not authorized or executed now**. No reservation is a harmless read, and a reservation probe is not Auth deployment permission. See [smallest-next-review packet](WAVE10C_NEXT_OWNER_REVIEW.md).

Only after that gate passes can a later exact deployment/key/operator/budget/native-artifact/rate/contained synthetic-Auth approval be prepared. No alternate site, site-wide secret, relaxed Context, new Auth behavior or existing deploy repointing is substituted.

## 12. Production and completed-work preservation

No deployment, reservation, upload, key retrieval/provision, hosted Auth/session, account/factor/role action, schema/migration replay, environment/Auth/SMTP/PITR/compute/maintenance/Storage change, messages/payments/content activation, purchase, production SQL, push or merge. Only the isolated metadata/read-only SQL described above and local documentation preparation occurred. Production main/course PR #4/both published websites and every existing acceptance resource remain untouched by this task; no fresh production audit is claimed.

Wave 10B1,689 tests/sixbuilds/type/lint/Netlify/disposable 280/17 SQL remain exact-source prior evidence, **not rerun** for this read-only preflight. All 280sealed source hashes and existing application bytes remain unchanged. All twelve registers and37 feature statuses remain current; none newlyLive. Production release gates remain intact regardless of isolated readiness.
