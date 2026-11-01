# L6 Founders 50, Faith Boost and Content: implementation-ready plan

November 1, 2026. Actual preparation owner: `/root/content_wave3`. Dedicated branch: `codex/lane6-content-readiness`. Base: `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.

## Status and scope

PREPARED ONLY. No L6 application implementation, tests, UI, network calls or activation occurred. The coordinator stopped the initially dispatched implementation slice after automatic approval review rejected another lane's source write because Wave 3 Phase 5 is preparation-only for L5 through L8. L6 had executed read-only source inspection only before that stop. Do not infer that L6 code or a failed L6 write exists. This packet requires unambiguous Primary Chat implementation authorization before execution.

Only `docs/lane6-content/**` is leased for this preparation. Future proposed files are `lib/content-readiness-preview/**`, `tests/content-readiness-preview.test.mjs` and, under a separately approved UI slice, `components/content-readiness-preview/**`. These do not exist as an L6 deliverable. No shared Auth, API, navigation, global styles, design tokens, schema, migration, dependency, deployment or production file is changed.

## Source-grounded inventory

These are local source observations at the exact base, not live-state or deployment verification.

| Existing source | Verified local behavior | Preservation requirement |
| --- | --- | --- |
| `docs/faith-boost-resource.md` | Describes a public lead funnel and private reader; explicitly distinguishes resource access from identity and mailbox verification. | Do not describe an opt-in or reader cookie as account authentication or mailbox ownership. |
| `netlify/lib/faith-boost-core.mjs` | Signup validation returns `emailVerified: false` and `smsConsent: false`; session lookup checks the resource cookie's hashed server record and expiry. | No copying real tokens, lead/contact fields or storage keys into preview DTOs. |
| `netlify/functions/faith-boost-access.mjs` | Requires a resource session and associated lead record; 401 or 503 are distinct outcomes. | A service error cannot become an empty catalog or access approval. |
| `netlify/functions/faith-boost-reader.mjs` | Guards reader access with a resource session and an explicit resource filename allowlist, using no-store/noindex headers. | Do not move protected reader assets into public preview output or broaden delivery routes. |
| `netlify/functions/lockliel-founders50.mjs` | Existing application proxy has an origin check and declared per-IP limit; forwards submitted application data. | Do not invoke the handler, submit applications or infer acceptance/role assignment from a successful HTTP submission. |
| `supabase/functions/submit-founders50/index.ts` | Existing source validates application fields, checks recruiting flag and rate controls. | No call, replay, fixture creation or permission change. Provider execution and current flag values are not audited here. |
| `supabase/migrations/20260924230729_lockliel_founders50_account_tag_link.sql` | Links the application to a descriptive profile tag. | A tag is not a leadership grant. |
| `supabase/migrations/20260925120958_lockliel_immutable_founders50_review_workflow.sql` | Separates review records and orientation prerequisites for active-host approval. | Application, orientation, human decision and effective role authorization stay separate. |
| `netlify/functions/lockliel-share-library.mjs` | Requires a member session, queries active assets and selects compatible language variants. | Proposed metadata must not replace authenticated runtime catalog checks or activate draft resources. |
| `docs/getting-a-grip-invitation.md` | Records an approved future-release manifest, with no runtime import substituting it for active rows. | Getting a Grip Share Library remains NOT ACTIVE IN PRODUCTION. This packet performs no live-state recheck. |

No protected book/PDF was opened, exported or copied during this preparation. No contacts or credentials were inspected.

## Smallest future implementation package

Start with pure typed functions and invented, clearly labeled fixtures. No network, persistence, cookies, live Auth, provider APIs, resource bytes or real contact inputs. The pure preview must carry an explicit synthetic/non-authoritative marker. Do not provide an adapter to existing handlers yet.

1. Catalog readiness: represent `loading`, `empty`, `unavailable` and `ready` separately. Per-item publication is `inactive` or `active`; per-item availability is `unavailable` or `available`. Unknown values deny preview opening. Approval for future release is metadata, not publication state.
2. Reader readiness: only a synthetic available-and-active item plus a synthetic reader-grant fixture may produce an invented placeholder preview. Member identity, mailbox verification and resource access are independent inputs. A lead/resource cookie cannot become member identity. Output contains no URLs, filenames, storage paths, signatures or tokens.
3. Lead intake preparation: require explicit purpose-specific consent for a memory-only draft. Syntax acceptance is not mailbox verification; prepared intake is not delivered email, persistent lead or membership. No delivery/benefit promise. Reject unknown consent versions, oversized text, invalid states and extra sensitive fields rather than silently approving them.
4. Founders readiness: model application, orientation and human-review states separately from role permission. No combination, tag or synthetic decision writes or grants a role. Unknown/incomplete/closed/unavailable states remain blocked. A future trusted backend supplies effective permissions; client types cannot certify that trust.
5. Freeze a minimal read-only catalog projection only after coordinator and L5 review. Then implement focused tests under the existing network guard. A separate UI proposal can consume that contract after design ownership review.

## Proposed L5 catalog DTO, documentation only

This is a contract request, not a shared implementation or finalized API. Coordinator owns the final contract. Do not add it to a shared module until reconciled with L5.

| Field | Allowed purpose | Restrictions |
| --- | --- | --- |
| schemaVersion | Detect incompatible DTOs. | Fixed version with explicit rejection of unknown versions. |
| context | Identify synthetic preview versus a future trusted catalog snapshot. | Current proposed fixture value is synthetic only; caller input cannot grant trust. |
| resourceId | Opaque fixture identifier used for local selection. | No database/storage key, signed URL or private identity. |
| label | Invented human-readable fixture title. | Plain bounded text, not HTML or licensed content. |
| language | Explicit fixture language. | No silent language/translation fallback presented as approved. |
| kind | Course invitation, resource invitation or placeholder reader. | Does not confer enrollment or delivery entitlement. |
| publication | Inactive or active fixture state. | Getting a Grip production status cannot be changed by this DTO. |
| availability | Available or unavailable fixture state. | Missing/unknown/errors fail closed. |
| reason | Stable, non-sensitive unavailable/inactive reason code. | No private assessment, contact information or credential-derived detail. |

Do not include share-recipient IDs, original inviter, latest campaign, assigned mentor/group, member permissions or lead details in this catalog DTO. Those are separate L5/L1/L8 contracts with independent consent and authorization. A selection is only a local draft; it does not send, share, enroll, follow up or publish.

## Dependencies and decisions

- L1 owns truthful authentication, mailbox verification and actual signup-protection acceptance.
- L5 and coordinator approve the catalog DTO, share intent and consent contract; L6 cannot create shared files unilaterally.
- L8 owns retention, lawful purpose and purpose-limited human review requirements before durable intake or staff use.
- L7 owns any future benefit/order eligibility. No approved gateway, gift, complimentary book, currency, shipping, returns or legal classification is assumed here.
- Owner supplies approved final assets/content, rights, eligibility and copy before any real delivery or frontend activation.
- Backend integration, schema, content activation, public catalog rollout and member role work require separate review/authorization.

## Validation performed and limits

Performed only read-only local Git/source inspection and documentation review. Starting branch was clean and exact HEAD matched the base. No lane tests, TypeScript, lint, build, browser or live/security acceptance have been run for an L6 implementation because no implementation exists. The acceptance matrix is a future requirement, not a passed test report.

Next safe action: coordinator review of this documentation and the proposed L5 DTO. Next implementation action requires explicit approval for the pure synthetic contract/test slice above.
