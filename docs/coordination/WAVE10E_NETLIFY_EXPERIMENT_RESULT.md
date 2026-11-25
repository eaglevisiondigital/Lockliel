# WAVE 10E NETLIFY EXPERIMENT RESULT

**NETLIFY DEPLOYMENT WORKFLOW BLOCKED**

November 2, 2026. The one authorized experiment was performed and its new resource was successfully removed. Reservation **did return the required deploy-preview context**. Same-ID finalization was not attempted because the coordinator's local guard additionally required an explicit draft=true response boolean. The normalized provider field was null. This was a local validation stop, not a wrong-context response or proof Netlify cannot support finalization.

## Operator and exact target

Netlify site **70b03a42-6329-476e-bf4b-2b1ce30e9567**, name **jade-unicorn-642f40**, team 6a674f7a0e2cdcc2b838db89. Connected provider metadata and the existing CLI login agree on the caller. Direct account metadata confirms **Owner**, **site_access=all**, and caller membership in owner_ids. Supported role permissions cover create/read/update/cancel/delete; create/read/cancel/delete succeeded in this experiment, while update permission is role-based and no PUT was exercised. [Management permissions](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/#deploy-deletion-requirements).

The existing cached CLI credential was read into process memory for HTTPS Authorization headers to api.netlify.com only. It was never copied into deployment content/configuration, arguments, environment variables, output, evidence or a new credential file. No login, new token, privilege grant or credential request was needed. Raw API account/deploy responses were not emitted or retained; only reviewed safe projections were recorded.

Local application source remains **327ba098628f70aa65140862b8b14cd709bfd711**, runtime parent **bcaa35680ffefc61775636d65f568827e42d7f06**. The existing Wave 10 worktree/branch was clean at documentation parent **aa983fc6a877451f2ae0960093caa72d704fc3b5**. No application rebuild or upload occurred.

## Preflight and preservation baseline

- Exact site/team/caller ownership verified using read-only provider calls before creation.
- Site published_deploy was null, deploy_id empty, no custom domain/domain aliases/custom branch or preview domain. Therefore this isolated site had **no published deployment** to preserve. This is not a claim about the separate production site.
- Complete deployment listing contained six ready historical rehearsal deployments. Latest historical rehearsal ID remained **6abfd81ccee16b59b75711a0**. All six IDs and selected immutable identity/context/branch/publication metadata were preserved exactly before reservation, after reservation and after cleanup.
- Provider deployed-branches list was empty even though the manual rehearsal alias exists. It was not treated as a complete alias inventory. The rehearsal URL and latest historical immutable URL were separately checked; both retained identical 302 response hashes. The final responses both redirect to /my-lockliel/journey; the initial Location header was not retained. No redirect was followed and no script/Auth request ran.
- The site API's standalone deploy_url yielded different URLs on reads while deploy_id was empty and published_deploy null. It was not treated as a persistent published pointer or a valid experimental reservation. Only the actual create response and independent deploy lookup supplied the experimental ID.
- No site-wide modification, application, function, key, environment or Auth operation was needed or performed.

## Actual reservation and context

The coordinator's credential-free operator passed local safety checks for old-ID exclusion, fixed-site/ID checks and context/publication guards before execution. Its mutation process was bounded to 30 API requests and 600 seconds; actual process used 18 API calls plus one credential-free immutable URL check in **7.774 seconds**. Preflight and independent follow-up reads are separate. These are operator bounds, not automatic endpoint expiry.

Exactly **one** POST to `/api/v1/sites/70b03a42-6329-476e-bf4b-2b1ce30e9567/deploys`, body **draft=true only**, returned HTTP **200**.

Actual provider-assigned ID: **6ae8942b7f6512d039ce0da6**.

Created at **2026-11-02T13:46:19.416Z**. Create response and independent site-scoped GET agreed:

| Field | Observed |
| --- | --- |
| site_id | 70b03a42-6329-476e-bf4b-2b1ce30e9567 |
| id | 6ae8942b7f6512d039ce0da6 |
| context | **deploy-preview** |
| state | new |
| branch / review_id | null / null |
| published_at | null |
| normalized draft | null; no explicit true boolean retained |

The safe projection used dict.get, so retained evidence cannot distinguish an omitted draft field from explicit JSON null. No raw response was kept to recover that distinction. The request did specify draft=true, and context/publication pointers confirmed a nonpublished reservation. No branch-deploy substitution, alias, review identifier, fake context or fabricated ID was used.

## Why finalization stopped

The local phase3 guard required `response.draft is True` in addition to correct ID/site/context and unpublished pointers. It returned false because the normalized draft value was null. The script then stopped finalization and entered authorized cleanup. **Finalization attempts: 0.** No empty PUT, application digest or replacement reservation was sent.

The guard was stricter than necessary to record the confirmed context and available publication evidence. The coordinator owns that limitation. The full requested workflow remains unverified because same-ID finalization was not exercised, not because Netlify returned the wrong context. Do not re-label this as a provider failure or a clean full pass. The approved one-reservation allowance is consumed; a new attempt needs new explicit owner authority.

## Scoped cleanup and independent verification

Before cleanup, a fresh site-scoped GET verified that the new ID belonged to the exact site, was absent from the six historical IDs and was not published. Site publication pointers were reread to ensure it was not current.

1. POST `/api/v1/deploys/6ae8942b7f6512d039ce0da6/cancel`: HTTP **200**.
2. Terminal-state read completed, then DELETE `/api/v1/sites/70b03a42-6329-476e-bf4b-2b1ce30e9567/deploys/6ae8942b7f6512d039ce0da6`: HTTP **204**.
3. Site-scoped GET: **404**. Global deploy GET: **404**. Complete site list restored to exactly the original six IDs.
4. Exact immutable URL returned **404**. A separate read-only process independently repeated both provider lookups, list absence, site publication preservation and HTTPS inaccessibility at **2026-11-02T13:48:34Z**.

Immutable URL: https://6ae8942b7f6512d039ce0da6--jade-unicorn-642f40.netlify.app/ . It is not an acceptance URL and must not be reused.

**Containment verified. No containment failure.** No historical deployment was cancelled/deleted. Existing site alias metadata and rehearsal responses were preserved. The generic primary 404 page's body hash varied between requests; an initial overly broad follow-up hash assertion failed. The corrected read-only check retained that difference and used stable provider publication identities/status plus unchanged actual rehearsal hashes. It did not claim generic 404 bodies are immutable or change any remote state.

## Billing

Provider reports credit-pro-tier-3 / Pro, **10,000 plan credits**, capability **included=10,000 / used=0**, lifecycle active, no exceeded-usage/configurable-limit flags, and **auto top-up OFF**, before and after. No purchase, upgrade, billing modification, provider build or compute/function test occurred. No application functionality was exercised; public checks were small GETs of existing static/404 responses.

No invoice or experiment-attributable charge was available; the capability used=0 readback may not be immediate metering. Do not claim exact zero cost. Current pricing documents preview deployment credits separately from metered web traffic. [Credit schedule](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/).

## Smallest secure next step

Review the documented local draft/publication gate, then, only if the owner wants empirical finalization proof, separately authorize **one new** empty reserve/same-ID-empty-finalize/cleanup experiment with the corrected evidence criteria. The exact proposed criteria and denial cases are in [local gate and next approval review](WAVE10E_LOCAL_GATE_AND_NEXT_REVIEW.md). No correction to the application candidate or real Auth boundary is proposed. No new experiment is authorized or executed by that packet.

An authoritative provider answer about this observed response shape and same-ID finalization could close the gap without another remote resource. The already prepared support question may be supplemented with this ID/result; no message has been sent. Do not switch target/context, start a provider build, use site-wide secrets or authorize full application deployment from this partial result. No application-deployment authorization request is presented because the required full-workflow assessment did not pass.

## Preservation

Confirmed task operations: no Lockliel application upload, functions, deployment secrets/configuration, hosted Auth, Supabase access/change, production operation, Git push/merge, migration, maintenance toggle, historical deployment deletion or existing alias repointing. Existing Netlify operator authentication was used only to perform the authorized administration calls.

No fresh production/Supabase audit was performed. Isolated migration 280/maintenance ON remains prior Wave 10C evidence; nothing in this experiment changed it. Main, course PR #4, both published websites and application/migration bytes were not modified. All twelve registers are updated; all 37 feature rows/statuses remain unchanged. No subagent was dispatched; independent verification means a separate read-only process, not an independent agent review.

Evidence: [preflight](evidence/2026-11-02-wave10e/preflight.json), [actual operation journal](evidence/2026-11-02-wave10e/experiment.json), [independent verification](evidence/2026-11-02-wave10e/independent-verification.json), [local guard limitation](evidence/2026-11-02-wave10e/local-gate-review.json).

**NETLIFY DEPLOYMENT WORKFLOW BLOCKED**
