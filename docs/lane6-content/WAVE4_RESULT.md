# L6 Wave 4 synthetic content contracts result

November 1, 2026. Actual owner `/root/content_wave3`; branch `codex/lane6-content-readiness`. This implementation follows documentation-only checkpoint `4868c7a9f18c91f0ae48aeef9f036fd099de3650`, based on course source `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.

## Authority and history

Direct Wave 4 authorization explicitly supersedes the Wave 3 preparation-only hold for this narrow synthetic contract/test package. The prior automatic rejection and L6 documentation-only status are preserved in the earlier plan. No prior rejected source operation was retried or bypassed. No new L6 automatic rejection occurred during implementation. The coordinator later directed all lanes to commit only lane-owned files after another lane's shared-file staging was rejected. Accordingly, the supplied coordinator context/authorization mirrors remain unmodified, untracked dependencies, excluded from the L6 commit.

## Implemented exports

`lib/content-readiness-preview/index.ts` imports the read-only coordinator context and re-exports the shared `SyntheticCatalogItemV1` type. No UI, live adapter, handler, shared navigation/token, persistence, schema or dependency was introduced.

| Export | Behavior and limits |
| --- | --- |
| `buildCatalogItem(input)` | Strict fixed-version synthetic-organization catalog builder; returns defensive frozen projection or generic blocked result. Extra/private/locator fields are rejected. Inactive metadata may be described, but cannot become eligible through projection. |
| `projectCatalogItem(input)` | Exact structural DTO or null for coordinator/L5 compatibility. Requires an invented title beginning `Synthetic `, bounded plain text without URL/path markup characters, explicit language, safe nonnegative revision and known enums. |
| `catalogReadiness(context,item,request,entitlement?)` | Discover/share/read metadata decisions. Inactive/unavailable items, stale revisions, wrong organization/context and unshareable requests are blocked. Member visibility requires its separate fixture grant. Entitled metadata and book/training reader readiness require an actor/resource/revision-bound, unexpired, non-revoked entitlement and separate `content:read` fixture grant. No content is returned. |
| `publicationReadiness(context,item,evidence)` | AAL2 review-grant fixture, current reviewed revision and invented-placeholder-only rights required. Returns review-only, never publication. Pending/revoked/assumed-license evidence fails closed. |
| `intakeReadiness(context,input,expectedRevision)` | Owner-bound purpose-specific follow-up preparation with known-version explicit email consent and current revision. Withdrawal blocks immediately. No contact field, lead persistence, mailbox verification, membership or email sending. Reader-cookie presence never proves identity. |
| `foundersReadiness(context,input,expectedRevision)` | Distinct application, orientation and human-review fixture states. Completed review and descriptive tags grant no role, staff access or facilitator entitlement. Closed/unknown recruiting and invalid combinations block. |

Every successful result is `state: synthetic-ready` with frozen false effects for save/send/schedule/grant/publish/pay/execute. All denials are the same generic blocked object and echo no private input. Caller-supplied fixture contexts/grants are not authenticated identity, RLS or production permissions. The request clock is deterministic fixture data, not a trusted live clock.

Faith Boost discovery/share uses synthetic resource-invitation metadata. Existing lead/cookie/reader/Auth handlers are unchanged. Share Library visibility/eligibility uses the fixed coordinator DTO. Training/book metadata is separate from protected entitlement. Synthetic Founder review cannot grant facilitator resources. Getting a Grip is tested as an inactive synthetic invitation; the actual production Share Library remains unmodified and was not queried here.

## API examples

These are invented fixtures, not accounts or credentials. `syntheticContext` must match the coordinator's exact fixture schema.

```ts
const built = buildCatalogItem({
  schemaVersion: 'lockliel-catalog-preview-v1', mode: 'synthetic',
  organizationId: 'synthetic-lockliel', resourceId: 'synthetic-faith-boost',
  revision: 2, label: 'Synthetic resource invitation', language: 'en',
  kind: 'resource-invitation', publication: 'active', availability: 'available',
  visibility: 'public', shareable: true,
});
const result = built.ok ? catalogReadiness(syntheticContext, built.value, {
  schemaVersion: 'lockliel-content-request-v1', resourceId: 'synthetic-faith-boost',
  revision: 2, action: 'share', now: '2026-11-01T12:00:00.000Z',
}) : built;
// Result has metadata only. No recipient, URL, content, save or send action exists.
```

A book/training read request additionally requires an exact `lockliel-content-entitlement-v1` fixture with matching organization, owner, resource and revision, future ISO expiry and `revoked:false`, plus the context grant `content:read`. An application's tag or approval does not satisfy that requirement. No token, cookie, storage locator or mailbox proof is accepted.

## Executed validation

- **86 focused guarded Node 24 tests passed, zero failed.** Coverage includes A/B and organization isolation, stale versions/revisions, expiry/revocation, extra/private-field denial, inactive Getting a Grip, consent withdrawal, book/training entitlements and Founders-to-role separation.
- Strict scoped TypeScript passed with extensionless imports and existing bundler resolution, without `allowImportingTsExtensions` or tsconfig modification.
- Targeted ESLint passed with zero warnings.
- In-memory browser esbuild bundle passed under the network guard: **10,364 bytes**, exactly shared context plus L6 source, **zero external imports**. The focused tests use an in-memory esbuild module so Node and application TypeScript stay compatible.
- All **280 migration file bytes** match lane HEAD. Supplied shared-file hashes are recorded in WAVE4_VALIDATION.json for coordinator parity review; canonical files are not present in the root course checkout, so no nonexistent root-comparison claim is made.
- No UI/browser, full application build, SQL/RLS replay, real Auth/entitlement, delivery, provider license or role-grant acceptance was performed or claimed.

Executed commands used `/opt/homebrew/opt/node@24/bin/node`:

```text
node --import ./tests/support/network-guard.mjs --test tests/content-readiness-preview.test.mjs
node node_modules/typescript/bin/tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck lib/content-readiness-preview/index.ts lib/synthetic-contracts/context.ts
node node_modules/eslint/bin/eslint.js --max-warnings 0 lib/content-readiness-preview/index.ts tests/content-readiness-preview.test.mjs
```

Existing dependencies were temporarily linked, not installed; the link is removed after validation. Initial direct-Node imports used explicit `.ts` extensions and passed scoped checks with a compiler flag; coordinator review corrected them to extensionless imports and affected checks all reran successfully. That earlier intermediate result is not the final compatibility claim.

## Remaining dependencies and acceptance

Ready for coordinator code and structural DTO compatibility review only. L5 may consume the fixed projection without importing the sibling lane. Shared context and current authorization mirrors must be independently preserved by coordinator before a clean independent checkout can run tests. No global application configuration is changed by L6.

The earlier matrix's loading/empty fetching UX and browser accessibility are future work: this pure package provides no catalog-fetch adapter or UI. Trusted backend identity, entitlement authority, revocation and clock sources, durable consent/retention, approved content/license and effective role workflows remain separate live-integration gates. No offer, gift, complimentary-book eligibility, payment gateway, currency, shipping, returns or legal classification decision was made.

No production access, network, account/Auth/CAPTCHA/session/email operation, content-byte download, schema/migration, maintenance change, push, merge, deployment, payment activation or purchase occurred. This is a local synthetic checkpoint, not release authorization.
