# Minimum isolated provider attestation request

Prepared November 1, 2026. **Not sent; no configuration change or credential is requested.**

Please provide a dated read-only provider record for Netlify site
`70b03a42-6329-476e-bf4b-2b1ce30e9567` and the rehearsal alias
`https://rehearsal--jade-unicorn-642f40.netlify.app`.

## Minimum continuity record

Return only:

1. Observation timestamp in UTC and evidence surface/provider reference.
2. Site ID, exact alias, branch `rehearsal` and active immutable deploy ID/context.
3. Whether that active ID is exactly `6abfd81ccee16b59b75711a0`, the previously accepted
   fa294f7 deploy. A current branch/deploy mapping is required; a ready historical deploy
   or default published-site list alone is insufficient.

Netlify documents the branch filter under Functions. If the current alias is confirmed
as the same immutable deployment, the coordinator can review it against the retained
accepted upload/artifact provenance for application
`fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098` and hardcoded isolated binding. Do not invent
a commit_ref or assume an owner statement without its evidence source is provider proof.

## Only if the continuity chain cannot establish artifact identity

Ask the provider for a deploy-specific function manifest/attestation. Return the exact
active deploy ID and function names/IDs, digest algorithm, digest byte domain, hashes,
and an authoritative link to the reviewed artifact. Expected historical functions:
login, logout, session, mfa, journey, lesson-resource, profile, admin-content, admin-person
(with their `lockliel-` deployed names where applicable).

The historical handler hashes and provider upload hashes may describe different bytes.
Do not compare SHA256 of a bundled .mjs file with SHA256 of an archive as if identical.
Use a verified manifest linking those domains, or provider attestation of the exact
reviewed immutable version. A function list without digests does not close byte identity.

Binding attestation should return booleans only for: matches reviewed qjks target,
reviewed site/branch-context guard intact, production/other outbound destinations denied,
and no runtime environment override of that hardcoded target. It must be backed by
provider/version provenance; do not fetch or paste configuration values to establish it.

## Available next surfaces and privacy boundary

Documented branch deployment/function search or a provider-assisted immutable-version
record may supply the evidence. The current Codex connector does not expose those
operations; its get-deploy reader was insufficient. If the provider surface cannot
supply the required relationship, report that limit instead of manufacturing a result.
No new credential, API token, permission expansion, bundle download or redeploy is
requested. Do not send env values, keys, tokens, cookies, account details, function
source, private URLs or arbitrary logs. No production endpoint, Auth test, migration,
maintenance change or release action forms part of this request.
