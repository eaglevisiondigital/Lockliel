# Wave 10 independent provider reconciliation

November 1, 2026. Actual reviewer: `/root/wave10_provider_security`. This worker implements no application, runtime, UI, packaging or verification code. The coordinator owns source validation and isolated SQL. Provider calls here were read-only project, scoped deploy and branch metadata only; no SQL, Auth session, key/configuration value retrieval, provisioning, settings or deployment operation.

## Fresh observations

| Approved resource | Observed | Limits |
| --- | --- | --- |
| Netlify `70b03a42-6329-476e-bf4b-2b1ce30e9567` | Name `jade-unicorn-642f40`; plan `nf_team_pro`; current deploy enrichment empty | Does not establish current alias, source, backend or configuration binding |
| Its historical deploy `6abfd81ccee16b59b75711a0` | Scoped detail ready, branch `rehearsal`, context `branch-deploy`, published_at null, 9 functions, no source ZIP, commit_ref null | Title naming fa294f7 is descriptive, not an exact-source attestation |
| Netlify `60579b8e-d0ca-4ac1-abe5-7128f4243e8b` | Name `lockliel-course-acceptance-jxtgtfff`; plan `nf_team_pro`; current deploy enrichment empty | Distinct resource, not a proven rename of the rehearsal site |
| Its historical deploy `6abcdb0c84404e24a9880ac6` | Scoped detail ready, branch `acceptance`, context `branch-deploy`, published_at null, 14 functions, no source ZIP, commit_ref null | Does not prove the old acceptance database is present or currently bound |
| Generated project-reader deploy-style IDs | `6ae7eb995842d69fe118139f` and `6ae7eb9a660a85b2d854fec5` | One scoped lookup each returned `INVALID_ARGUMENT`; no repetition, guessing or workaround |
| Parent Supabase branch listing | qjks branch `7091bfd6-83ce-4c11-ac30-8ce85e09be2d`, name `course-cutover-rehearsal-274`, lifecycle `FUNCTIONS_DEPLOYED`, preview status `ACTIVE_HEALTHY`; main also present | Lifecycle metadata is not schema, maintenance, caller-RLS or app binding proof |
| Direct project reader for qjks | `INVALID_ARGUMENT` | The successful branch listing is separate evidence; do not infer deletion |
| Older jxtgtfff branch | Absent from current parent listing | Its prior denied lookup is historical. No new denied-identity bypass, alternate network probe, recreation or cleanup was attempted; disposition remains unknown |

No provider archive was retrieved. No provider function digest is equated with compiled-module SHA256. No public URL, response header or deploy title is used as independent source authority. Provider response fields outside the reporting whitelist are omitted from this packet. The first detail response was emitted more broadly than intended and contained a provider skew-protection field; the coordinator was notified. That value is not copied into evidence, documentation, code or a handoff. No password, API key or Auth access/session token was requested or obtained.

## Reuse suitability

The existing qjks backend is a plausible member-read target from retained Wave 9 catalog evidence, not a newly certified database by this worker. Neither Netlify site's existing aliases should be replaced. The rehearsal site is the only target currently pinned by the new package design and may support a separate draft immutable deploy, subject to independent provider read-back and explicit owner authorization. Do not reuse its accepted course alias or assume site/account variables and provider-side features cannot affect a new deploy. The older acceptance site has unresolved backend existence and incompatible identity pins; it is not a substitute target.

No new database is demonstrated necessary. A new Netlify runtime is only a fallback proposal if coexistence cannot be verified. Its site ID, name, plan/organization quote, exact costs and rewritten validated pins would need approval before creation. Existing `nf_team_pro` metadata is not a quote or purchase authority. Preserve both sites, all course aliases, fixtures, functions, history and production.

## Provider-supported deploy-pin lifecycle, documentation only

The [Netlify API guide](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/#draft-deploys) states that draft deploys do not replace the published deploy. Its [digest documentation](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/#file-digest-method) distinguishes static file SHA1 from function SHA256 and requires zipped functions.

The [official OpenAPI reference](https://open-api.netlify.com/#tag/deploy/operation/createSiteDeploy) exposes createSiteDeploy with draft/files/functions; [updateSiteDeploy](https://open-api.netlify.com/#tag/deploy/operation/updateSiteDeploy) permits finalizing an existing deploy with files/functions/draft. Deploy-specific environment data is applied at creation/finalization and cannot subsequently be modified. These contracts support preparing a reserve-ID, compile-exact-ID, finalize-same-ID proposal. No create, update or upload was performed.

The exact behavior of an empty reservation has not been experimentally verified. A future separately approved executor must validate returned site/deploy/context, nonproduction/unpublished state and immutable HTTPS origin before compilation or upload; abort on unexpected state or publication. Read-back must remain independent of app response claims. Keep source-tree, built static SHA256, Netlify static SHA1, compiled-handler SHA256, uploaded function ZIP SHA256 and provider digest domains distinct. A correct manifest proves reviewed local bytes only until independently matched to the exact provider deployment.

The Supabase changelog Markdown URL was attempted: web reported unsupported Markdown content type; the shell's unauthenticated HTTPS read failed local DNS. No network setting or alternate credential path was used. No new Supabase behavior is implemented by this worker, and these failures do not establish provider health.

## Preservation

No production query or change; no hosted session, password/MFA reset, new account, role, email/SMS, payment, content, maintenance change, database/schema operation, infrastructure purchase, deletion, push, merge or deployment. Production and course release gates remain intact. Current runtime binding remains unverified; successful metadata reads alone do not close it.
