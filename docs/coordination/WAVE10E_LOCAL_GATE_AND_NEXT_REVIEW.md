# Wave 10E local metadata gate and next review

**PROPOSAL ONLY. The one authorized reservation has been consumed and deleted. No further remote operation is authorized here.**

## Established evidence

One actual draft=true reservation on the exact approved site returned context=deploy-preview, state=new, published_at=null and no branch/review. Both site publication pointers remained empty/null and every historical deployment was preserved. The local guard additionally required an explicit response draft=true; its normalized value was null. That stopped finalization. Cleanup passed independently. It is inaccurate to call this a provider context failure.

The provider response schema lists draft as a property without making it required. Retained sanitized evidence does not preserve whether the response omitted the field or explicitly returned null. The local guard can be reviewed against available publication evidence without changing any application Auth or context pin. No source correction to the executed operator has been made and no new guard has been run remotely.

## Proposed corrected criteria for separate review

A new experimental reservation could pass the publication check only if ALL are true:

- The one allowed create request was exactly draft=true, with no branch/review/alias, files/functions/environment or build trigger.
- Trusted create response and separate GET agree on a new provider ID, exact site and context=deploy-preview.
- Exact site/current published-deploy pointers do not identify the experimental ID; published_at is null; state is a recognized nonpublished reservation state.
- Branch/review are absent/null. Complete existing deployment and alias metadata remains unchanged.
- If an explicit response draft boolean is present, false denies. Missing/null can be considered only with every independent publication and identity proof above; malformed/string values deny.
- Missing or ambiguous context, missing required publication/identity evidence, a current/published pointer, a reused historical ID, unknown site, changed alias, or inconsistent metadata always denies and permits only new-ID containment.

For empty finalization, use the exact same new ID and draft=true/files={}; recheck provider identity/context/publication and all existing resources afterward. No fallback to another deployment, dummy asset, branch/review alias or context override. Unsupported empty finalization stops and cleans up.

These criteria are a review proposal, not a passing test result or implementation. Before any future execution, local tests must exercise missing/null/true/false/malformed draft representations, context/site/ID mismatch, publication-pointer contradiction and historical-ID deletion denial. Do not rerun or amend the existing remote experiment.

## Exact optional next owner authorization

Only after reviewing the criteria above, the owner may explicitly authorize:

> Approve one NEW secret-free empty reservation and conditional same-ID empty finalization on Netlify site 70b03a42-6329-476e-bf4b-2b1ce30e9567 only. Use actual provider deploy-preview context and independently verified publication/site/alias metadata; do not require an optional response draft field when those publication proofs are complete, and reject an explicit false or malformed value. Keep draft=true on both writes. Preauthorize cancel/wait/delete only the new experimental ID and independent inaccessibility checks. No application, functions, environment/key values, Auth, Supabase, settings, aliases, build triggers, production or automatic replacement. Stop after the experiment. Keep a bounded operator request/time budget and report billing uncertainty.

This language is not currently approved. The current assignment authorized exactly one reservation, which is already consumed. No second creation has occurred. An authoritative provider support answer remains the resource-free alternative; no outreach has been sent.
