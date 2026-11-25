# Trusted Netlify binding packet required before hosted acceptance

Proposal only. This request does not authorize credentials, deployments, configuration changes or hosted sign-in. Preserve course rehearsal `qjksggxorghaxvpyslip`, maintenanceON, the accepted course artifact and both existing nonproduction Netlify sites.

## Required provider-supported evidence

Obtain a timestamped, sanitized read-only export through an already approved connected provider read surface or an owner/provider operator. Do not ask for a personal access token in ChatGPT. No full raw project/environment export may enter evidence because it can contain secrets. The operator returns only these nonsecret fields or yes/no attestations:

1. Exact intended siteID and site name, branch/context, public alias and current immutable deployID. Link the current alias to that deploy through supported provider state. A historical deploy's `links.alias` alone is insufficient.
2. Exact deploy detail: siteID, deployID, ready state, branch/context, source commit if present, source method, creation time and immutable HTTPS permalink. For a manual deploy with nullcommit_ref, supply independent source/build provenance rather than infer it from its title.
3. Exact packaged function inventory, route map, runtime and provider digests, plus documentation of each digest's byte domain. Bridge actual packaged archive bytes to the preserved generated-handler bytes with a deterministic manifest or trusted provider build attestation. Do not equate source closure SHA256 with an uploaded archive hash.
4. Current nonsecret function binding: fixed `qjksggxorghaxvpyslip` origin, matching server-side site/context/source/deploy checks, no production reference, no service-role member bypass, caller-only identity verification and active-session check. Inspect the actual bound artifact or provider build/config attestation, not only the repository's intended configuration.
5. Runtime configuration attestation without values: allowed key names/scopes, publishable-key project provenance privately checked, no production Supabase/key fallback, no active SMTP/email/SMS/payment/Blobs transport and no runtime override of the isolated destination. Do not reveal any key, token or password; do not store credential-derived values.
6. Current Auth/session boundary assertions, callback origins and lifecycle constraints without secrets, plus synthetic A/B provenance. Root's isolated database/RPC/RLS evidence remains separate from Netlify evidence. No new account creation or Auth mutation is authorized by this request.
7. Safe coexistence plan that preserves current course alias/functions and maintenanceON. A new member candidate requires its own reviewed source composition, exact build/route exposure and separately authorized deploy; Wave8's closed/local-only source cannot be activated just by an environment flag.

Unknown fields remain NOT_VERIFIED. A mismatch stops acceptance rather than causing an implicit redeploy, rename, setting correction, DB repair or fallback to production.

## Supported read routes and currently missing capability

Netlify's official API documents read-only `GET /sites/{site_id}`, `GET /sites/{site_id}/deploys`, `GET /sites/{site_id}/deploys/{deploy_id}`, `GET /sites/{site_id}/functions` and file metadata readers. The connected tools in this review exposed enriched project metadata and exact deploy lookup, but no arbitrary raw site/list-deploy/function archive reader. Current alias-to-deploy proof and archive extraction therefore remain a capability gap. Do not use write/updater tools as a replacement.

Netlify documents immutable deployed functions and a dashboard filter for a selected branch or preview. Its deploy file explorer is a supported way to inspect generated static assets. Static asset recovery by itself does not prove server function contents, private runtime values or backend binding.

Official references checked November1,2026: [OpenAPI](https://open-api.netlify.com/), [deployed functions](https://docs.netlify.com/build/functions/overview/), [deploy file explorer](https://developers.netlify.com/guides/deploy-file-explorer/). Only GET/read operations are proposed. Never upload, retry, publish, restore or delete a deploy to obtain evidence.

## Owner decision after evidence

Owner selects the exact isolated target and reviews coexistence/cost. Root reviews the new concrete application composition and proposes separate source/build/deployment authorization. Only after binding is established should an exact existing-synthetic A/B hosted sign-in/read matrix be approved. That later matrix may involve Auth lifecycle writes, so the present read-only assignment does not execute it. No production release follows automatically.
