# Wave 10D exact context owner review

**PROPOSAL ONLY. No remote operation is authorized by this file.**

## Preferred option: unsent Netlify Support question

The owner may send this question through the existing Netlify support channel. No message has been sent by Codex.

> For site 70b03a42-6329-476e-bf4b-2b1ce30e9567, does the supported API guarantee that POST /api/v1/sites/{site_id}/deploys with draft=true, no files/functions/environment and no branch/alias/review creates a reservable deployment with actual response context=deploy-preview and no publication?
>
> Can we later PUT /api/v1/sites/{site_id}/deploys/{that_same_id} with draft=true and a file/native-function digest, preserve that exact provider context, and provide functions-only secret-marked deploy-specific environment at finalization, without changing any existing published deployment, branch/review alias or prior deployment configuration?
>
> Please identify the supported API version, required role/permissions, reservation lifetime/automatic completion behavior, authoritative safe metadata for context/publication/alias verification, and any constraints on empty finalization. We need confirmation for the create/update-deploy endpoints, not the separate build-trigger endpoint, and cannot use site-wide environment variables or substitute a target/context.
>
> Can the operator subsequently cancel/wait if needed and DELETE only that new nonpublished site/deploy ID, with independently verifiable metadata and immutable URL inaccessibility? Please note any asynchronous deletion, retention/billing or alias-fallback behavior.

No credentials, existing token values, private configuration or member information belong in the support request. No production access or setting change is requested.

## Alternative: exact owner approval for one empty capability experiment

This requires a new direct owner authorization. The scope below is not active. It is broader than reservation-only because it explicitly includes an empty same-ID finalization, necessary to observe context retention. No application compilation or upload is part of it.

Proposed approval wording:

> Approve ONE secret-free capability experiment on Netlify site 70b03a42-6329-476e-bf4b-2b1ce30e9567 only. Authorize one new unpublished empty draft reservation, safe metadata reads, and, ONLY if the new response confirms context=deploy-preview and unpublished state, one same-ID empty-digest finalization with draft=true and files={}. Authorize no application assets, functions, environment values, protected keys, Auth operations, build triggers, Supabase calls, aliases/branch/review bindings or site settings. Preauthorize cancel/wait/delete ONLY for the newly returned ID, including wrong-context/failure cleanup, with independent metadata/immutable URL verification. Do not touch existing deployments. The operator and permitted request/time budget must be named before execution. Do not continue to application deployment or authentication afterward.

Preconditions for any execution:

1. Name an operator with protected existing exact-site create/read/update/cancel/delete API authority. Do not obtain credentials through ChatGPT, command arguments, plaintext files or logs. The currently available generic deploy-site tool is insufficient; review a narrowly scoped operator path before execution.
2. Confirm current API supports the proposed request shapes, a safe parsed response allowlist and the planned deletion/verification process. Capture the current published deployment and existing alias identities using non-secret metadata. If that baseline or necessary safe metadata cannot be obtained, stop before creating anything.
3. Approve account usage/headroom and a bounded operator window. Suggested planning limit is ten minutes and thirty normal requests, with immediate owner escalation if cleanup cannot be independently verified. This is not automatic expiry or a promise of zero cost; do not change billing or purchase infrastructure.

Proposed protocol after authorization only:

1. POST the site-scoped deploy collection with only draft=true. Do not include branch, alias, review, files, functions, environment, source upload or build trigger.
2. Keep only validated new ID/site/context/draft/state/publication metadata in evidence. Raw responses may contain sensitive provider fields; never emit or retain them. Require the actual site, actual context=deploy-preview and unpublished state. Unknown/wrong context or any existing-deploy/alias change stops experimentation and proceeds only to the approved new-ID cleanup.
3. Only after those gates pass, PUT the same site/ID with draft=true and files={}. No asset or function bytes may be uploaded. If the API rejects the empty operation, stop and clean up; do not add a dummy file or alternate endpoint. Bounded polling may observe metadata only.
4. Require the same ID/site, context=deploy-preview and unpublished state after finalization, and independently recheck the existing published deployment and alias identities. Any ambiguity remains a failure to verify.
5. Cancel/wait if needed and delete ONLY the ID created by this experiment. Verify deletion/inaccessibility independently through safe provider metadata and its exact immutable HTTPS URL. Do not infer deletion solely from an empty draft's preexisting 404. Report cleanup as unverified if provider evidence is insufficient; do not delete anything else.
6. Return the exact observed result and stop. No second reservation, application upload/build, native function, protected configuration or hosted Auth operation is included, even if the test passes.

This observes the empty flow only. It does not by itself guarantee a later nonempty native-function finalization or key/rate behavior; authoritative provider confirmation or additional explicitly scoped evidence may still be required. A reservation-only approval must omit step 3 and cannot be reported as proof of finalization.

No alternate site, fake CONTEXT, branch/review alias, relaxed source pin, shared key, new Auth framework or production action is proposed.
