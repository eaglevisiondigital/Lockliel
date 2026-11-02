# WAVE 10F LOCAL CHECKER RESULT

**LOCAL CHECKER CORRECTED AND FINAL EXPERIMENT PREPARED. No remote execution authorized or performed.**

November 2, 2026. Starting documentation checkpoint `8f1c29db29b52b71282171a63132b7cb30c0016d`. Local tooling commits `69114462bfa5a3b826b0ca5b1dbb1ac9c6a3d232` then `4e5b59482e5acddce7153aee977dd60ec3970f29`. Application candidate remains `327ba098628f70aa65140862b8b14cd709bfd711`, runtime parent `bcaa35680ffefc61775636d65f568827e42d7f06`. Existing branch/worktree reused; no application, dependency, hosting or migration change.

## Exact correction and provider contract

The official OpenAPI deploy response lists draft as a boolean property without making it required. Requiring an explicit response draft=true was therefore incorrect. The schema does not explicitly declare JSON null valid. Wave 10E's safe projection normalized omission and null alike, so the exact original representation remains unknown. [Pinned official schema](https://github.com/netlify/open-api/blob/e79124a60a1fb6bb4ae4c5b68fef4b11ff6fbc44/swagger.yml#L5381), [current API](https://open-api.netlify.com/#tag/Deploy/operation/getSiteDeploy).

New pure local checker: `scripts/netlify-context/checker.py`. True, null and omitted draft can pass only with ALL independent evidence complete:

- Two matching provider create/read receipts for the actual new ID and exact site, context=deploy-preview, and the expected reservation/finalization state.
- Explicit raw site identity and publication pointers, confirming no published/current deployment; missing pointers cannot default to null.
- Complete unchanged historical deployment and site/alias snapshots; no unknown, missing or duplicate IDs; no new branch/review binding.
- Finalization must reach ready on the same ID. Processing/new/error is not a completed finalization.
- Explicit draft=false, malformed values, wrong site/ID/context, conflicting publication or missing required evidence deny.

The prior optional published_at handling is retained: absent/null is not itself proof and a non-null timestamp denies. Independent site publication metadata is mandatory. This prevents replacing the old optional-field mistake with another optional timestamp requirement. The API's optionality is distinguished from the stricter local evidence required to proceed.

Cleanup retains old-ID exclusion, independent ownership/publication verification, exact new-ID cancel/delete, provider site/global404s, list absence and immutable URL404. Alias drift denies the main workflow; ownership/publication proof can still allow cleanup of only the new nonpublished object. Preservation must also pass before success is reported.

## Local regression result

**33 tests pass**, including parameterized cases. Real sockets are denied. Operator flows use a fake provider and a synthetic in-memory credential placeholder; the actual credential cache is never read. Tested cases cover every requested draft variant, wrong context/site/ID, publication, alias changes, missing metadata, independent receipt absence and cleanup404 failures. Mocked full flows exercise null/omitted draft and optional timestamp omission; negative flows deny permission/billing/publication failures, wrong post-finalization context and incomplete finalization while preserving cleanup.

The prepared operators default to exit2 before credential or provider access. Their flag is an accidental-execution guard, **not an owner authorization or bypass of environment approval**. Historical helpers are retained as sealed .py.txt source templates, not execution entrypoints. No application tests/builds, migrations or prior hosted acceptance were repeated.

Command run locally:

```sh
PYTHONDONTWRITEBYTECODE=1 /Library/Developer/CommandLineTools/usr/bin/python3 -m unittest discover -s scripts/netlify-context -p 'test_*.py' -v
```

Syntax/AST checks and generated artifact hashes pass. Tests exposed a cleanup-budget propagation issue in the prepared adapter; it was fixed and the final 33-test suite passed. Existing Wave 10E helper/evidence bytes remain unchanged.

## Final experiment preparation

The final sealed kit is `/private/tmp/lockliel-wave10f-validated-experiment`. Manifest SHA256:

`44f768595051db86f63071ef1b94b704e5ace139ea67a67ee613d6dd063bb625`

The kit is prepared-only. Earlier local draft kit directories are superseded and must not be used. [Manifest](evidence/2026-11-02-wave10f/kit-manifest.json). Exact commands, preflight requirements and stop/cleanup sequence are in [final experiment preparation](WAVE10F_FINAL_EXPERIMENT_PREPARATION.md).

Fresh preflight will reverify exact site, selected Owner/all-site access, complete historical/alias baseline, nonpublication and available billing flags. It requires active account, auto top-up OFF, no exceeded-usage flags and at least20 returned credits of headroom without changing billing. These are conservative preparation checks, not a price quote. The saved Wave 10E baseline cannot substitute for a fresh preflight; experiment input must be at most five minutes old.

The adapter reuses the existing reviewed private CLI credential mechanism only after later authorization. No new credential transfer or storage mechanism is implemented. It permits only fixed-site empty draft creation, conditional same-ID empty finalization, GETs and scoped new-ID containment; no build, site setting, application, function, environment, key or Auth operations.

## Remaining uncertainty and authorization

Real empty same-ID finalization, provider ready/context retention, current operator rights, billing state and retirement remain untested in this assignment. The Wave 10E reservation/context/cleanup result remains historical and is not rewritten as a full workflow pass. No new reservation ID exists.

The prepared mutation process has a 600-second normal work limit, at most20 normal API requests and reserved cleanup capacity within40 total API requests. Cleanup may continue within that bounded quota after the normal work deadline; no human window is treated as automatic expiry. Independent verification follows separately. Any failure or ambiguity stops advancement; no replacement reservation, dummy upload, alternate site/context or publication is permitted.

**Ready for separate owner review of ONE additional secret-free experiment. Not authorized to execute it.** Any later experiment needs direct owner authorization and normal execution-environment review. Do not use a command flag as evidence of consent. Full application deployment, protected configuration and hosted Auth remain outside this package.

## Preservation

No provider-account call, remote reservation, deployment/finalization/delete, credential access, hosted Auth, Supabase operation, production change, settings/maintenance toggle, migration, push/merge, message, payment or infrastructure purchase occurred. Public official API/schema pages were read for contract evidence. All prior tracked application/configuration/migration/asset/evidence bytes remain unchanged. All280 migration sources and original checkout dirty work are preserved.

All twelve registers and37 feature statuses are reconciled; none newly Live. No subagent was dispatched. Main, PR #4 and published websites were not modified or freshly audited. The production and isolated database states are retained prior observations, not new checks.
