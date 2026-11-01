# Wave 9 hosted binding investigation

Read-only observations completed November 1, 2026, at approximately 23:10 UTC. Actual worker: `/root/wave9_hosted_binding`. No application source edit, Git stage/commit, environment change or hosted authenticated acceptance was performed.

## Result

**Current isolated application-to-function-to-backend binding remains NOT VERIFIED.** Supported alternate readers recovered useful historical deploy and function metadata. The older Netlify acceptance resource still exists. Neither result establishes the current alias, source or backend binding, and no resource was recreated or repointed.

| Resource | Fresh provider observation | Source/backend limits |
| --- | --- | --- |
| Netlify production `3096b319-3068-45ab-9837-ba0cce59d50f`, lockliel | Published metadata points to ready deploy `6abbb27a1cdd6d00081b0e8e`; scoped deploy reader confirms production/main and commit `1599ab271e0120a5cdc4e38e225ba749dd214721` | Read-only preservation signal, not a database or Auth audit. No production function invocation. |
| Rehearsal `70b03a42-6329-476e-bf4b-2b1ce30e9567`, jade-unicorn-642f40 | Exact historical deploy `6abfd81ccee16b59b75711a0` remains ready, branch rehearsal, context branch-deploy, CLI origin; nine function metadata records, Node24/us-east-2 | `commit_ref=null`; title names fa294f7. Historical alias/permalink is exposed, but the reader does not establish that alias currently resolves to this deploy. Current backend/config not exposed. |
| Older acceptance `60579b8e-d0ca-4ac1-abe5-7128f4243e8b`, lockliel-course-acceptance-jxtgtfff | Name-filtered inventory and direct site read succeed. Exact historical deploy `6abcdb0c84404e24a9880ac6` remains ready, acceptance/branch-deploy, CLI origin; fourteen function metadata records, Node24/us-east-2 | `commit_ref=null`; title names91611ad. Historical repository record maps this site to `jxtgtfffdiwzxocxoqxk` / course-engine-acceptance. That is not a fresh backend existence or binding check. |

The two nonproduction sites are separate resources. The old acceptance site was not renamed into the rehearsal site. The name-filtered Lockliel list does not include jade-unicorn; direct lookup does. Thus a partial name search alone is not a complete environment inventory.

Project enrichment returned empty current-deploy details for both isolated sites. The rehearsal branch-version URL contained deploy-style ID `6ae7c66e46ddd6b434234e1b`; global detail returned404. The older acceptance list supplied `6ae7c66d96f185ffb5a01630`; scoped detail returned404. A later direct site read supplied another deploy-style URL ID. These are inconsistent metadata observations, not evidence that deployment occurred. No blind retries or guessed deploy IDs were used. Historical known IDs were taken from retained release evidence, and their successful detail reads narrow the provider-reader limitation.

A dedicated Chrome tab opened the rehearsal project overview, but its accessibility tree contained only the WebArea, DOM was empty, screenshot was blank and bounded error log was empty. It exposed no authoritative deployment or configuration controls. The temporary tab was closed. No alternate browser session, credential retrieval, login or settings change was attempted.

## Function and source comparison

`HASH_DOMAIN_COMPARISON.json` records exact metadata digests for all nine rehearsal and fourteen older acceptance functions against the retained generated-handler SHA256s. All digest strings differ. This is **not a finding of drift** because the provider metadata digest byte domain has not been established as the compiled `.mjs` file domain. No function archive was downloaded and no archive-to-handler comparison was possible. Titles alone are not source provenance. The historical CLI deploys have no source ZIP according to the provider metadata.

Wave 8 application `e83f0886ed7761d8a47738b9085ed8fab9610b8c` is a different, local, unconditionally closed member-read candidate. Neither historical deployment contains an attested Wave8 member-read runtime, and this review did not deploy it. Existing fa294f7 course acceptance must remain preserved.

## Suitability and smallest next action

Existing rehearsal reuse remains a proposal. It is not safe to overwrite the accepted course alias to manufacture binding proof. First obtain the sanitized provider-backed packet in `TRUSTED_ATTESTATION_REQUEST.md`. If branch-specific immutable serving and independent route/function/config scoping can preserve the accepted course deployment and maintenance state, a separate approved member-read candidate may be possible without a new database. That coexistence is not currently certified.

No new infrastructure is shown to be necessary yet. Existing usage costs and plan credits are not established by these metadata reads. Do not promise zero cost. If coexistence cannot be proved, present a separately approved target proposal with a new nonproduction Netlify site or branch-scoped runtime and, only if required by isolation, a separate Supabase branch/project. Obtain current provider pricing, usage limits, data lifecycle and owner cost approval before provisioning. No purchase or resource creation occurred.

## Preserved boundaries and remaining gates

No production query, API function invocation, Auth session, real or synthetic sign-in, credential/key/environment-value retrieval, account change, message, payment, settings change, maintenance toggle, migration, deployment, push, merge, delete or infrastructure purchase. No functions were executed to probe identity or outbound destinations. No accounts or logs containing personal information were read. Source identity, active alias resolution, actual server binding, runtime network deny policy, transport exclusions, synthetic identity provenance and exact future composition remain independent acceptance gates.

Read [sanitized provider evidence](NETLIFY_EVIDENCE.json), [hash-domain comparison](HASH_DOMAIN_COMPARISON.json) and [next attestation packet](TRUSTED_ATTESTATION_REQUEST.md). Root owns Supabase, Git, compatibility review, registers and the final Wave9 assessment.
