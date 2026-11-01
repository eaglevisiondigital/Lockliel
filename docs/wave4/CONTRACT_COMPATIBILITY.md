# Wave 4 combined synthetic contract review

This is a separate local review branch based on the preserved Wave3 documentation checkpoint9e89fec. Member/Faith application source649a3f5 is byte-identical. No UI panel, navigation, Auth, handler, live adapter, schema, migration, hosting or dependency change is part of this package. Exact imported source commits and hashes are in SOURCE_AND_VALIDATION.json. Lane histories remain independent; files were imported by exact committed bytes, without a branch merge/cherry-pick.

## One shared boundary vocabulary

Coordinator context v1 is synthetic-only. Organization, actor, active-session marker, AAL and explicit fixture grants are independent of campaign/inviter/assignment/tag/application/merchant metadata. The exact shared module is mirrored on each lane branch and checkpointed under coordinator ownership. This is not a JWT decoder or production authorization service.

L6 owns canonical catalog projection and publication/entitlement meaning. L5 consumes the versioned read-only metadata shape and additionally requires owner/current-consent/share-confirmation checks. A member-visible item requires member:read independently of connections:share. Entitled items are deliberately held by L5 until an access adapter is reviewed. A catalog book is not a commerce product, price, shipping decision or merchant entitlement.

L5 clocks use deterministic epoch milliseconds; L6 catalog request/entitlement clocks use canonical UTC ISO strings. The compatibility harness converts the same explicit fixture instant, without an implicit fallback or live clock. A future adapter must normalize this seam deliberately. L6 publication content:review and L8 case-scoped ops:content-review are distinct grants; no automatic mapping is implemented. Commerce finance, group review and administrative purpose grants are likewise independent.

## Tested composed contracts

292 focused tests passed:80L5,86L6,41L7,50L8,17shared,18actual cross-lane tests. The latter bundle all four real modules with exactly one shared context module and zero external runtime imports. They exercise L6-produced member/public DTOs through L5, grant addition/removal, current consent, stale catalog confirmation, inactive/unavailable/unshareable denial, intentionally held entitled sharing, clock normalization, no Founder-to-staff grant, no catalog-to-purchase entitlement, cross-organization denial, no finance-to-admin grant and no private contact-note echo in staff views. All proposal effects remain false.

Full existing application unit suite1006passed with no failures/skips. Ordinary Next static build, TypeScript, configured/targeted lint and Netlify validation75modules/62handlers pass. Credential env was scrubbed and the existing outbound network guard preloaded. No SQL or migration replay was needed or run. No production data or provider credentials were used. Source hashes for all280migrations, existing application, package/lockfile, TypeScript, workflows and hosting remain unchanged.

## Review corrections and approval controls

Independent review reproduced L5 enum object/private echo; strict string validation plus20regression cases fixed it. Actual L6-to-L5 review then found the missing member:read condition;5additional cases and independent probes verify the correction. L6/L7 explicit TypeScript import extensions were corrected to ordinary repository-compatible imports; tests bundle in memory. No tsconfig workaround was introduced. All fixes are separate local commits with earlier history preserved.

The historical Wave3 preparation-only rejection remains recorded and is superseded only by Dave's direct Wave4 synthetic implementation authorization. A new L5 agent staging attempt that included coordinator-owned shared files was rejected before execution. The agent committed only permitted lane files; the coordinator subsequently checkpointed its identical shared files under its assigned ownership through ordinary approval. No rejected agent staging was retried or bypassed. No additional confirmation remains pending for these completed local actions.

## Smallest next integration package

Add mock-only adapters and individually feature-flagged synthetic panels on a NEW branch from the preserved candidate. Start with the L6 catalog-to-L5 share-review seam. Feed canonical projected metadata, one explicit fixture clock and independent context/consent/revision checks. Keep real session adapters, private persistence, entitlement/storage/provider/payment/role/operational execution absent. Then reuse the same shared context for L8 privacy status and L7 unavailable commerce readiness, without mapping grants or promises automatically. Reuse reviewed member visual components and scoped tokens; no public site redesign.

Before claiming a connected feature, separately review live identity/server authorization, consent revocation/retention/minors, private storage/RLS, rights/content eligibility, merchant/provider/legal/receipts/shipping, audit custody and operational execution. Synthetic passing tests settle none of these owner decisions. Course release, real-CAPTCHA and recovery gates remain independent.
