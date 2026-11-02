# Wave 10A provider-output classification and artifact review

Date: November 1, 2026. Reviewer: `/root/wave10a_artifact_review`, independent of the Wave 10 runtime, UI and package implementation. Scope: read-only local inspection, primary-source documentation and this report only. No provider response, credential or private chat log was retrieved by this reviewer.

## Starting evidence and incident identity

Reviewed source `f5214b75b8dba3671b8eeda6c45574baa2539221`, runtime parent `70ad7d0881acfa51f6ea33931f9738b77bff7fff` and documentation checkpoint `e0f3e3928591a1996386debe89e2b92412263fdd` on `codex/wave10-hosted-composition`. The worktree was clean when inspection began.

The retained Wave 10 provider reconciliation and independent security review record that the first Netlify deploy-detail response was emitted too broadly and contained a skew-protection field. They identify a scoped historical rehearsal deploy `6abfd81ccee16b59b75711a0` on site `70b03a42-6329-476e-bf4b-2b1ce30e9567`, context `branch-deploy`, branch `rehearsal`, state `ready`, published_at null. They also record the distinct older acceptance site and deploy. The original reviewer subsequently supplied nonsecret provenance from existing memory, without rereading the response: originating operation `mcp__codex_apps__netlify_netlify_deploy_get_deploy_for_site`, scoped deploy-detail GET, top-level deploy property `skew_protection_token`. The same broad batch emitted this property for both historical responses: rehearsal site/deploy above and acceptance site `60579b8e-d0ca-4ac1-abe5-7128f4243e8b`, deploy `6abcdb0c84404e24a9880ac6`. Both were recorded as branch-deploy with published_at null. Raw parsed detail reached the originating worker's `functions.exec` text output. This is original-reviewer provenance, not a fresh provider verification or an inference from a title or URL.

The value has not been repeated, printed, copied, compared, logged, persisted, used as a credential or requested from its holder in this investigation. The field names below identify the documented mechanism only.

## Classification using current official documentation

Netlify's [Frameworks API](https://docs.netlify.com/build/frameworks/frameworks-api/#netlifyv1skew-protectionjson) describes the skew-protection token as carrying a fingerprint of one deploy, intentionally accepted from client headers, cookies or query parameters. Netlify's [Functions API](https://docs.netlify.com/build/functions/api/#deploy) exposes the corresponding `deploy.skewProtectionToken` property. The [OpenAPI reference](https://open-api.netlify.com/) lists `skew_protection_token` in deploy metadata.

This supports classifying the documented field as a deploy-routing token intended for client transport, rather than establishing that an account-management API key, Supabase key or member Auth/session credential was leaked. Its documented effect is routing a client's requests to that specific deploy. These sources do not establish administrative, data-write, account, provider-management or arbitrary-deploy access. Field name and mechanism documentation do not prove the exact unseen value's format, freshness or identity, so this is not blanket proof that every provider token is nonsecret.

Netlify's [deploy overview](https://docs.netlify.com/deploy/deploy-overview/#skew-protection) limits skew protection to production context; branch deploys, previews and immutable permalinks do not use it. It also describes protections against access to unpublished production versions and states that production/all-deploy password protection disables skew protection. The recorded rehearsal response is a branch deploy, so an active skew-routing capability for that historical response is not demonstrated. No request using the value was made to test effectiveness. Current feature configuration, expiry and Netlify's own invalidation policy remain unknown to this reviewer.

## Exposure scope and containment

Verified exposure surface: the two Wave 10 provider detail responses in the originating worker's tool transcript and private function store, confirmed by the original reviewer and coordinator. The original reviewer reports that values were not sent to other agents or normal commentary/final reports. The response was not a Git publication, application HTTP response, deployed artifact or member-facing screen. Whether all tool output was visible to the owner or retained by provider/product systems follows those systems' access and retention policies, which were not audited. Do not describe the event as proven process-memory-only or publicly published. Broader access, copying outside this work, and downstream retention remain unverified.

Keep the historical exposure entry. Use explicit allowlisted metadata projections before emitting any future provider result, omit token-like fields and avoid refetching this field for diagnosis. No confirmed live administrative or Auth credential has been identified by this review; therefore no emergency account/API credential rotation is justified solely by the documented skew-token name. Ask Netlify for a value-free classification/invalidation explanation if the owner wants further assurance. Do not rotate, revoke, delete deploys, alter protection settings or publish another deploy under this assignment. If independent provider metadata instead identifies an active credential granting protected access, stop and seek narrowly scoped containment authorization.

## Local source and artifact coverage

Performed byte inspection that emitted only counts, file paths, field names and already-approved artifact digests. No candidate token value was obtained or matched.

| Inspection | Result |
| --- | --- |
| Current tracked files at documentation checkpoint | 1,467 inspected; no occurrences of `skew_protection_token`, `skewProtectionToken`, `NETLIFY_SKEW_PROTECTION_TOKEN` or `skew-protection.json` |
| Changed committed blobs in runtime commit | 7 inspected; no occurrences of those four field names |
| Changed committed blobs in application commit | 9 inspected; no occurrences |
| Changed committed blobs in documentation commit | 34 inspected; no occurrences |
| Retained exact-source package | 23 files inspected; no field-name occurrences in top-level file bytes |
| Function ZIP | All four entries opened without extraction or execution; only the official bootstrap contains the `skewProtectionToken` property name |

The retained package is `/private/tmp/lockliel-wave10-exact-source-package`, explicitly a synthetic-ID local fixture and not release eligible. Its manifest SHA256 is `0943e58ebfcf7dd45b7542c3444d2aba0096834fec27ae7ead6ad44cc1e2e84f`. The bootstrap SHA256 is `d0a7166bbc0a4c664dccb3446e4c0358de247ced3214c1e7b944f34f467a4894`, exactly the independently pinned official bootstrap recorded before this investigation. The bootstrap property reference therefore belongs to preserved official runtime bytes, not a newly copied provider-value assignment. No other archive entry referenced the inspected field names.

This scan does not prove absence of an unlabeled value or prove absence from every historical Git blob, private log, old hosted artifact or published site. Exact-value scanning was intentionally not attempted because obtaining or copying the value is forbidden. Retained documentation reports that the original reviewer omitted the value from Git and evidence; this reviewer verified named-field and package-flow coverage, not an impossible exact-value comparison. Wave 10 made no deployment or push, so this package was not published by that work. Older hosted content was not downloaded or compared.

## Result and preservation

Documented classification: a client-carried, deploy-specific routing fingerprint, with no administrative or Auth credential identified. Activity, exact field-to-value association and wider retention remain explicit limits. This reviewer does not certify the incident as a live credential or as proof of unrestricted zero exposure. The original reviewer's value-free provenance establishes the operation and both site/deploy associations. Current token activity remains unknown and was not tested; documented skew routing does not apply to the recorded historical branch-deploy contexts. This incident review clears the blocker for narrow LOCAL Auth implementation REVIEW only. It grants no authority to implement rejected credential handling, use real credentials, change hosting or deploy.

No application source, tests, migrations, Git refs, credentials, provider settings, Auth, sessions, maintenance, database, payment, message, content or production resource was changed. No provider operation, SQL, hosted request, push, merge, deployment, revocation or infrastructure purchase was performed by this reviewer. Only this documentation file was created.

## Independent final packet review

Reviewed coordinator documents `docs/coordination/WAVE10A_SECURITY_AND_AUTH_REVIEW_RESULT.md`, `docs/coordination/WAVE10A_NARROW_AUTH_AND_DEPLOYMENT_PROPOSAL.md` and sanitized `docs/coordination/evidence/2026-11-01-wave10a/incident-metadata.json` after consolidation. No raw provider response or exposed value was retrieved for this recheck.

The packet correctly identifies both top-level field instances and the originating scoped GET operation, attributes provenance to the original reviewer, limits known exposure to that worker's tool transcript/private result store and leaves human visibility/platform retention/current lifecycle unverified. Classification is appropriately confined to the documented client-carried deploy-routing fingerprint; no administrative/Auth credential is identified. No credential rotation/revocation or protected-access containment operation is recommended solely from this evidence. Metadata omission/allowlisting and retention of the incident remain appropriate.

The packet distinguishes field-name/code-flow inspection from forbidden exact-value matching. It does not claim exhaustive historical Git or old published-artifact inspection, zero tool-output exposure, universal token safety or confirmed public publication. Its statements that the Wave 10 packages did not publish are bounded to the recorded absence of pushes/deployments. No actionable incident-claim discrepancy was found in this final review.

Independent incident assessment agrees with **WAVE 10A CLEARED FOR NARROW AUTH IMPLEMENTATION REVIEW**, exclusively as permission to consider a separately authorized LOCAL correction. The proposal expressly withholds implementation, credentials, hosted sessions, provider changes, deployment and production authority. Review of the exact Auth behavior and implementation remains the separate Auth reviewer/coordinator responsibility; this incident review does not approve those operations.
