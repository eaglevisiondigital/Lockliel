# WAVE 10D NETLIFY CONTEXT RESULT

**NETLIFY DEPLOYMENT WORKFLOW BLOCKED**

November 2, 2026. Phase 1 completed as a public-provider API/documentation/source review. Phase 2 was not authorized and was not executed. This result does not claim that Netlify cannot support the workflow; it identifies the exact guarantee that remains unverified.

## Exact candidate and scope

Application `327ba098628f70aa65140862b8b14cd709bfd711`, runtime parent `bcaa35680ffefc61775636d65f568827e42d7f06`. Target Netlify `70b03a42-6329-476e-bf4b-2b1ce30e9567` only, isolated Supabase `qjksggxorghaxvpyslip` only. Existing branch `codex/wave10-hosted-composition`; starting documentation checkpoint `855bc685f8288351ed6bf19c8b5aced49ffa6153` was clean. No new source candidate, build, deployment ID or environment was created.

The Wave 10C isolated 280-migration, maintenance ON baseline and completed security/artifact reviews are retained evidence, not rerun or freshly audited here. This assignment resolves provider semantics only; it does not clear the separate execution-time key, routing, rate, operator or containment checks.

## Provider-confirmed semantics versus unknowns

| Requirement | Authoritative evidence | Status |
| --- | --- | --- |
| Reserve before compiling | Official CLI calls createSiteDeploy before handleBuild and passes the returned ID into the build/deploy path | Supported client pattern; no new reservation tested |
| Finalize that same ID | Official uploader calls updateSiteDeploy with the supplied deploy ID, then uploads requested native functions/files | Supported client pattern; no local or hosted operation run |
| Stay unpublished | API guide documents draft=true preserving the currently published deployment | Documented published-deploy guarantee |
| Actual provider context=deploy-preview for this manual reservation and same-ID update | Create/update deploy schema has draft but no context setter or documented draft-to-context invariant | **Unverified, mandatory blocker** |
| Deploy-private protected configuration | DeployFiles environment supports create/finalization, deploy-only precedence and immutability, with functions scope and secret marking | Documented feasibility; no value read/provision and no new coexistence test |
| Preserve every existing alias | Draft documentation covers currently published deploy; omitting branch/review/alias avoids intentionally requesting an alias | Complete alias guarantee for this exact flow remains unverified; later before/after checks required |
| Retire only the new object | Site-and-ID scoped delete marks a deployment for deletion; management docs restrict deletion of published/in-progress deploys | Documented primitive; later permission and independent inaccessibility proof required |

Current official OpenAPI is version 2.63.1, pinned upstream revision `e79124a60a1fb6bb4ae4c5b68fef4b11ff6fbc44`. CLI source is pinned at `857c63fb85746da56447a8be263f2000559a7f8c`. Source hashes and exact relevant ranges are recorded in [provider evidence](evidence/2026-11-02-wave10d/provider-context.json).

Sources: [API create](https://open-api.netlify.com/#tag/Deploy/operation/createSiteDeploy), [API update](https://open-api.netlify.com/#tag/Deploy/operation/updateSiteDeploy), [draft guarantee](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/#draft-deploys), [pinned reservation implementation](https://github.com/netlify/cli/blob/857c63fb85746da56447a8be263f2000559a7f8c/src/commands/deploy/deploy.ts#L1445), [pinned same-ID uploader](https://github.com/netlify/cli/blob/857c63fb85746da56447a8be263f2000559a7f8c/src/utils/deploy/deploy-site.ts#L229).

## Exact context distinction

1. `POST /api/v1/sites/{site_id}/deploys` and `PUT /api/v1/sites/{site_id}/deploys/{deploy_id}` accept DeployFiles. Its draft boolean has no description equating it with context=deploy-preview. The deploy response exposes context, but a response field is not a writable request contract.
2. `POST /api/v1/sites/{site_id}/builds` explicitly documents draft builds as deploy-preview and never published. That operation queues a provider build. It is not an inert reservation or a guarantee about the manual digest endpoint. It was not called and is not substituted for the approved workflow. [Build API](https://open-api.netlify.com/#tag/Build/operation/createSiteBuild)
3. CLI --context selects environment variables used in the build. It does not document an instruction to set the server's deployment context. [CLI reference](https://cli.netlify.com/commands/deploy/)
4. The API collection's shared deploy-previews query parameter has no creation/context-setting contract. Its presence beside listing filters is insufficient proof. No undocumented query or request field was tried.
5. Official CLI deployment tests use a local mocked API. The reviewed mock responses do not provide context at all. They cannot establish the real provider invariant. No upstream tests were executed. [Pinned mock routes](https://github.com/netlify/cli/blob/857c63fb85746da56447a8be263f2000559a7f8c/tests/integration/commands/deploy/deploy-api-routes.ts)
6. Current context documentation associates deploy-preview with PR/MR and agent workflows. Historical official support replies distinguish manual drafts from that workflow; the 2021 replies are not current proof of non-support. No inference from UI labels, an alias, local CONTEXT, a title or an old deploy is accepted. [Current contexts](https://docs.netlify.com/deploy/deploy-overview/#deploy-contexts), [historical discussion](https://answers.netlify.com/t/is-it-possible-to-control-when-a-deploy-previews-deployment-is-created/42374)

The public schema fetched from the pinned repository matches the initially fetched current master bytes. The public rendered API was also inspected. A direct swagger.yml URL on open-api.netlify.com returned 404; the official repository and rendered API supplied the evidence. No authenticated provider metadata, raw deploy output, environment reader, support conversation or secret was fetched. No official support response was obtained or outreach sent.

## Permissions and unchanged execution prerequisites

Any later remote experiment requires explicit owner permission and an operator with existing exact-site API authority to create, read, update, cancel if necessary and delete the new deployment. Management docs identify Developer/Team Owner for deploy management/deletion. Actual operator permissions remain unverified; read access or the prior Pro label does not prove write/delete rights. No role grant, new credential or purchase is proposed here.

After provider context proof, actual application deployment still needs separate approval for protected deploy-only configuration, exact-source build and source/artifact bindings, accepted native-function routes/rate rules, independent A/B hosted Auth acceptance and verified retirement. No production or shared setting is included. An unpublished URL is not access-private, and an operator window is not automatic expiry. Wave 10C safeguards remain in force.

## Scoped retirement and cost

A later approval must name ONLY the newly returned site/ID for deletion, including cleanup after a wrong-context result. Cancel/wait if in progress, delete the new nonpublished object, then verify independent metadata and immutable URL inaccessibility. Application acceptance would additionally require all custom API/direct-function routes inaccessible. A cancelled deploy, successor OFF deploy, 503 or elapsed window does not prove retirement. [Manage deploys](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/)

This review initiated no metered build, function invocation, reservation or billing operation. Actual account billing/headroom was not re-read; a future experiment is not promised free. No additional paid resource is demonstrated necessary. Before any experiment, the owner/operator must approve a request/time budget under existing account terms without upgrades or recharge changes. Prior full-acceptance usage estimates are not an empty-reservation quote.

## Is an experiment still needed?

Not if current authoritative Netlify Support can document the exact create/update context invariant and alias behavior. A precise unsent question is prepared in the [owner review packet](WAVE10D_CONTEXT_OWNER_REVIEW.md).

If such confirmation is unavailable, direct observed evidence needs a separately authorized experiment. The smallest useful proposal checks one empty draft both at reservation and after same-ID empty finalization, then deletes only that new object. It contains no application assets, functions, environment data, key, Auth session or Supabase call. Empty reservation alone cannot prove context survives finalization; that distinction is explicit in the proposed approval. If empty finalization is unsupported, stop and clean up without adding placeholder assets or changing workflow.

This is a proposal only. No remote resource is created by this report. Even a passing empty experiment cannot certify protected configuration, native function/rate handling or real Auth; those execution requirements retain their existing gates.

## Exact next approval and preservation

Preferred next step: Dave obtains a written provider answer to the prepared question; no remote experiment is necessary if it closes the exact guarantee. Alternatively, Primary Chat may expressly approve the bounded empty-reservation/same-ID-empty-finalization/retirement protocol in the owner packet, naming the operator and budget. Do not treat this report or the Wave 10D Phase 1 authorization as approval for Phase 2.

No application source, tests, configuration, migrations, assets or historical evidence changed. No rebuild/test replay, production or isolated SQL, hosted Auth, key retrieval/provision, settings/maintenance change, deployment/reservation/upload, push/merge, message, payment, content activation, purchase or deletion occurred. Main, PR #4, public websites, existing acceptance resources and root dirty work were not modified. No fresh production preservation audit is claimed. All 37 feature statuses remain unchanged; twelve registers receive this documentation-only checkpoint. No subagent was dispatched for this bounded review.

**NETLIFY DEPLOYMENT WORKFLOW BLOCKED**
