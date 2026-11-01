# Lane 5 Wave 4: synthetic relationships and consent contracts

November 1, 2026. Agent `/root/connections_wave3` on `codex/lane5-consent-followup`.
Worktree `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane5-consent-followup/Lockliel`.
Parent checkpoint `077e4d7877ea19b7e9bb22be0094f03cf44edd6d`, based on `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.

## Cross-lane member-visibility correction

The coordinator's independent L5/L6 comparison found that an active, available, shareable member-visible DTO was allowed by `prepareShare` with `connections:share` but without L6's additional `member:read` grant. Starting from `6710d572c527d29edc332ef85306b7091e4d241d`, member-visible share preparation now requires both grants under the same validated synthetic organization/context. Public resources retain the independent relationship-share boundary. Entitled sharing stays denied. `isShareableCatalogItem` is a structural predicate only; actor eligibility is enforced separately in `prepareShare` and must not be inferred from that predicate alone.

Five new consumer regressions cover missing/present member-read grant, independent connection-sharing permission, cross-organization context/resource and stale resource/confirmation revisions. All **80 focused tests** pass, along with strict scoped TypeScript, zero-warning lint and a 10,129-byte browser-platform pure bundle (two inputs, zero external imports). Existing coercion/privacy regressions remain included. No sibling code is imported into the consumer tests; the coordinator must still run actual producer/consumer compatibility under identical fixtures in the combined harness before claiming cross-lane integration complete.

Only owned source/test/report files change in the separate local correction. Shared contracts, prior history and live behavior remain untouched. The temporary dependency link is removed after checks.

## Independent review correction

The coordinator review identified a privacy bug in the initial synthetic projection: enum checks used `String(value)` but some projections returned the original object. An object whose `toString` returned an allowed state/response/decision could pass and expose arbitrary nested private fields. Catalog kind/visibility coercion also incorrectly accepted objects, even where the object was not projected.

Starting from coordinator dependency checkpoint `17989532c32b0d7e33d97f740e525b6fc5b94ec4`, all five enum-coercion paths were replaced with a shared owned strict string-membership helper. Relationship stage validation uses the same strict helper. The owned source has no `String(...)` coercion left. Literal-equality enum paths were reviewed and remain strict. No shared source was changed.

Twenty added regression cases cover each of the five paths with a plain coercible object, boxed String, Symbol.toPrimitive hook and throwing coercion hook. All twenty fail against the original source, establishing the reviewed defect. After correction all **75 tests pass**, including the original 55. Every non-string enum is generically denied, hooks are not invoked and private sentinel fields never appear in the result. This is a real fix to synthetic input projection, not a claim of live server security acceptance.

Strict scoped TypeScript and zero-warning targeted lint pass again. The updated browser-platform bundle is **10,028 bytes**, with only the owned module and exact coordinator context, zero external imports and no file output. The two shared files are now tracked by the coordinator's separate dependency commit, superseding their untracked status at the initial lane checkpoint. The temporary dependency link is removed after revalidation. The correction is preserved in a separate local commit; the initial implementation commit is not amended.

## Authorization and limits

Wave 4 explicitly authorizes the synthetic contract/test implementation previously held in Wave 3. The earlier automatic-review rejection remains historical in `IMPLEMENTATION_READY_PLAN.md`; it was not retried during that hold. The new source/test writes were approved. At checkpoint time automatic review rejected staging the two coordinator-owned shared mirror files alongside lane files; the command did not execute. The reviewer explicitly allowed staging lane-owned files only. That narrower alternative is used, leaving shared mirrors to the coordinator and avoiding any retry of the rejected shared-file staging action. This result supersedes preparation-only status for this narrowly implemented slice, not for live adapters or release.

The implementation is pure, memory-only and synthetic. Caller-supplied context, AAL, grants, identity and consent are test fixtures, not authentication, server authorization, legal consent verification or RLS. All successful and denied results carry frozen `NO_EFFECTS`: no save, send, schedule, grant, publish, pay or execute. No module imports live handlers or external service clients. No state is persisted. No UI or live My Five behavior was changed.

## Exact implementation and approved subject coverage

Source: `lib/connections-preview/index.ts`. Tests: `tests/connections-preview.test.mjs`.

| Export | Implemented boundary |
| --- | --- |
| `projectRelationship` | Owner-only, explicit-grant projection. Original inviter, latest campaign, mentor and group remain independent. Notes, assessments, prayers, finance, unrestricted contact details, arbitrary metadata and leadership are excluded. |
| `reviewCapacity` | Mirrors praying/invited/connected/growing active stages and five-active cap. Existing update does not consume another slot; paused/completed do not count. Duplicate IDs, mixed ownership and stale revisions deny. This is not a concurrent-write guarantee. |
| `reviewPrivateNote` | Owner-private synthetic draft up to 3,000 characters with current revision. Independent of contact follow-up consent, preserving the existing distinction between private reflection and outreach. No private draft is returned to another actor. |
| `reviewReminder` | Explicit follow-up consent, active relationship, owner/edit grant and current revision required. Future reminder within 366 days or cancellation draft only, never scheduling or delivery. Resource-share consent does not confer reminder permission. |
| `isShareableCatalogItem` | Frozen coordinator/L6 structural schema, organization, version, revision, kind, language and active/available/shareable fields. Rejects extra fields, URLs/locators, inactive/unavailable/unshareable and entitled resources. |
| `prepareShare` | Separate owner/share grant, current resource-share consent and explicit confirmation bound to owner/contact/resource/consent revisions. Revocation and stale confirmations deny on every attempt. Returns IDs only, never URLs, recipient contact data or a sent event. |
| `projectMembership` | Self-only synthetic membership state, group/member IDs and revision. No roster, other member, role, tags or contact data. Active membership does not grant leadership. |
| `reviewGroupAction` | Self join/host requests; matching-recipient, unexpired invited-state acceptance/decline drafts; separate explicit AAL2 human host/leader review recommendation for a different subject; multiplication plan for a distinct proposed group. All remain proposals without assignments, membership changes, approval execution or privileges. |

The existing live My Five engine and historical source evidence in the preparation plan remain unchanged. This bounded preview is intentionally stricter than the existing unlinked-contact path and does not reinterpret it or migrate real consent. All fixture IDs use the coordinator synthetic vocabulary; cross-organization inputs fail closed to the same generic denial DTO.

## Shared dependencies and example

Only shared source dependency: read-only `lib/synthetic-contracts/context.ts`, coordinator SHA256 `f2735b6aad2f2e287a7e9635f4c22265c6d91502dc76e2da4a50bb61de58a30e`. The exact coordinator authorization mirror is retained at `docs/wave4/AUTHORIZATION_AND_CONTRACT.md`. No sibling lane source dependency exists. `SyntheticCatalogItemV1` is a structural type from the coordinator, with L6 remaining owner of catalog meaning.

Example: `prepareShare({context, contact, consent, resource, confirmation, now})` returns `share-preview` plus synthetic contact/resource IDs and all false effects only when current fixture context, narrow consent and exact confirmation agree. Setting `consent.state` to `revoked`, swapping actor or organization, changing the resource revision, or marking the catalog item inactive returns the identical generic `denied` result. A `share-preview` is never an instruction or credential that authorizes actual sharing.

Entitled resources remain held until a future authoritative rights/entitlement boundary exists. Group proposals require future group-specific server authorization before live use. Synthetic reviewer grants and invitation fields are not proof that a human actually reviewed or that an invitation exists. Freeform notes/next steps must remain synthetic in this workflow and never be fed real private data.

## Initial implementation verification

- 55 focused Node 24 tests passed with the repository network guard preloaded, zero failures/skips. Tests bundle only this pure module in memory using already-installed esbuild, then exercise real exports. No package or lockfile change.
- Scoped strict TypeScript passed for source and exact shared context.
- Targeted ESLint passed with `--max-warnings=0`.
- Browser-platform esbuild pure module bundle passed: 10,001 bytes, two inputs (owned source and shared context), zero external imports and no file output.
- Meaningful negative/transition coverage: A/B/public/no-session/org/grant denial, sensitive-field allowlisting, consent states/purpose/expiry/revocation, five-active boundary, version conflicts, confirmation swaps, catalog fields, invitation recipient/revocation, AAL1 denial, human-review separation, membership privacy and multiplication without grants.
- No database replay, full application build, browser/accessibility, hosted acceptance, real session or remote CI was run. No UI is added, so keyboard/zoom/reflow acceptance is not claimed.

Temporary dependency link is removed after checks. The local lane commit includes only the three Lane 5 source/test/result files. At that initial checkpoint the two supplied coordinator mirrors remained untracked, so the tree was not fully clean. The later coordinator-owned dependency checkpoint described above resolves that historical state. All migration files, shared Auth/navigation/design/hosting/dependency source and existing application implementation remain untouched. No production access or account/Auth/settings/data change, credentials, email/SMS, migration, content activation, maintenance change, push, merge, deployment, payment, privilege activation or purchase occurred.

## Integration readiness and next safe step

Ready for coordinator code review and synthetic L5/L6 DTO compatibility tests only. Not production-ready and not a server security boundary. Do not integrate or activate live handlers from this result. Next smallest step: coordinator tests an actual L6 catalog projection against `isShareableCatalogItem` and `prepareShare`, including incompatible version/org/inactive/entitled cases, while preserving all release gates. UI integration, real permission/session/consent adapters, group-specific authorization and durable private storage remain separately gated.
