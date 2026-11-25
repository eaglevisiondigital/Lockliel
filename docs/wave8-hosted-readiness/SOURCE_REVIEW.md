# Wave 8 independent source security and compatibility review

November 1, 2026. Reviewer /root/wave8_binding_resume. Read-only application review in the Wave 8 integration worktree. No hosted request/query, credential/session, source edit or staging during this review. Only this report written. Earlier separate read-only isolated environment observations belong to the immutable readiness-plan commit, not a live test of this candidate.

## Initial finding, corrected and independently rechecked

**P2: Existing cross-tab Auth invalidation notification is ignored.** At review time components/member-review/server-member-read-shell.tsx:17–23 listened to the invented lockliel:session-changed event and window lifecycle events, while actual Auth producers write the localStorage lockliel:auth-change key in app/my-lockliel/auth-form.tsx:61 and dashboard-client.tsx:125. The established lesson-player consumer listens to storage for that key. No producer for the new custom event exists in current source.

If another same-origin tab changes shared cookies while a ready member-review tab stays focused/visible, the established storage event does not invalidate its displayed prior-owner snapshot or in-flight request generation. The previous projection can remain until its at-most 60 second expiry or manual/lifecycle clearing. Current exported handler and hosted UI are closed, so this is a pre-hosted integration defect, not a claim of live exposure. Correct by consuming the existing storage key and synchronously clearing generation/UI; verify a pending late response cannot repopulate after that notification. Keep the custom notification as an additional optional signal if desired, not as the only integration path.

Finding sent to coordinator with concrete source references. The following initial analysis and pins are retained for traceability. Final correction acceptance is appended below; no actionable defect remains within this bounded source review.

## Scoped safeguards reviewed

The deployed entrypoint is unconditionally503 with private/no-store and no fetch, cookie, refresh or factory activation. Factory activation is server-owned explicit dependencies, default OFF, isolated project/site/deploy/source/context/permalink restrictions; production, preview, unknown and wrong binding deny. Client route remains independent local-only/default OFF and missing binding makes no request. No browser role/owner/environment claim authorizes a read. Config-supplied runtimeSource equality does not independently attest deployed bytes; live binding remains blocked.

Unverified JWT parsing only prefilters. The exact isolated /auth/v1/user accepts the caller bearer and must return its same subject, followed by exacttrue current-session RPC before and after owner data reads. Ordinary reads reuse that same caller bearer/publishable-key seam, no service-role bypass, refresh or Set-Cookie. UUID owner filters and response owner checks apply even if existing RLS permits a staff role broader reads. Metadata/AAL labels never enlarge member projection. Fixed isolated outbound origin, GET-only, no cookie forwarding, redirects forbidden, transport cancellation/deadline,64 KiB upstream limit and generic errors contain private responses. Selected fields and reconstruction exclude raw contact/role/inviter/notes/finance/entitlement/Storage fields. Null names legitimately fall back to Member/M; upstream error does not become false preferences or empty saved private domains.

Nonce/generation, exact response version/binding, opaque owner/session/AAL boundary, expiry cap, strict descriptor validation/reconstruction and controller abort/generation timers limit stale or forged response adoption. Requests clear prior data before loading. Response headers disable private/CDN caches; no durable browser store or mock fallback. Unsupported course/private domains remain unavailable. Revocation checked per request, with residual snapshot lifetime bounded 60 seconds; there is no promise of push revocation visibility. Server/source pins are not client authorization.

## Existing SQL compatibility

supabase/migrations/20260925175229_lockliel_require_active_session_for_staff_access.sql:26–39 defines public.lockliel_current_session_active() as STABLE, SECURITY INVOKER, empty search_path, scalar boolean, PUBLIC/anon EXECUTE revoked, authenticated/service_role EXECUTE granted. It delegates the established app_private.current_session_is_active(), STABLE SECURITY DEFINER, empty search_path, matching auth.uid + JWT session_id against auth.sessions user/id and not_after. Candidate GET is compatible with this local read-only STABLE RPC contract. No new auth framework, schema or migration is required.

Existing profile/communication-preference policies allow own rows and specified staff scopes. The candidate always filters owner to provider-verified caller and validates returned row owner; it does not rely on an unrestricted staff RLS result. Current hosted effective table/column/RPC ACLs, actual GET exposure, provider key provenance, Auth boundary/config and caller-token RLS remain separate acceptance gates, not proved by source or fixtures.

## Compatibility-test amendments

Reviewed coordinator amendments to tests/my-lockliel-platform.test.mjs and tests/preview-isolation.test.mjs. New handler is not put into publicRoutes. A narrow exception asserts exact unconditionally closed entrypoint and forbids env/fetch/factory activation. Existing all-method nonproduction invocation matrix remains under deny-all network guard, with exact 503/private-no-store/both-CDN-no-store/no-cookie/no-redirect assertions for this route. Old production guard/auth/config source is unchanged. Current default-route test separately covers production GET; do not claim all production methods unless the coordinator adds that explicit matrix.

## Verification and remaining limits

Independent guarded run of member-read-server.test.mjs, member-server-client.test.mjs and wave8-member-ui.test.mjs:138 passed, 0 failed/skipped. This overlaps coordinator totals and is not added to the unique test total. git diff --check passed. No browser/a11y, full suite, SQL replay or remote CI is claimed by this source review. Coordinator owns those results. No unchanged hosted capability was retried.

Hosted binding, exact source/function artifact/runtime configuration, current Auth boundaries, protected synthetic identities/lifecycle, deployed caller RLS/RPCGET, real CAPTCHA, account-origin disposition, recovery/duration/production release gates remain unresolved. No live operation follows from passing local tests. Review cannot certify production readiness.

## Reviewed byte pins

These pins identify actual files reviewed before the correction follow-up. Coordinator may retain them as historical and append final changed pins below.

```
88ad503e9a987c5a8307c61d96d1559b3bd277b25224ce6e8f520bee61192a08  netlify/lib/member-read-binding.mjs
553aa0a6927b27ac35a54e95f0eb65f157d95d67eef44d7b2bd9c538bca0d5f7  netlify/lib/member-read-server.mjs
96b2a1908245d30df38219d930e111a72aae17c5ebfb346c7e2addbf85af112a  netlify/lib/member-read-projection.mjs
d2bce11076ae9ad82f03f91f4d76a8d1329df57f2484812580c69637d05be929  netlify/functions/lockliel-member-read.mjs
de0d4a7c1ae19ef3af5093086fbc4a7557bf796e65493f83e58cce805ccb8d0e  lib/member-server-read/contracts.ts
15a01671c0ae9249393fa67abc3453a6b8ae1f051bbcc8c23391eb1010984e9f  lib/member-server-read/adapter.ts
8ec4c922a36c95678cacbb0a537cba8e56bde165df41e23c8edcd60003d22631  lib/member-server-read/controller.ts
370f8b49bc51a33af0a5a1d2b97f798008e5a06945896ddcdb16e37e5bee1ba7  lib/member-server-read/validation.ts
153ea1f55969912a5b7987d4c40160044510f681db76378d42902c10cbe83032  components/member-review/server-member-read-shell.tsx
39d06088d5843d3ed25dc1dc8a771eee663fdeac119bec01c0396386a6b5f076  components/member-review/member-review-shell.tsx
4b76455a315ea30efa8088eb2d1450b76049eb72cad155eb6581d963abe07263  app/my-lockliel/review/page.tsx
ccac28bf377198a71dfe7867c03c716150e70b09d92288ba4893ba3240bb3886  lib/member-review/review-policy.ts
eb0eae3d9b4e06b98784bd8dbaabaebc6c8fe918cd7ffea82a86cfe2bac4ef4a  tests/member-read-server.test.mjs
a5822fcd101a0c61832cc26463187010191e17c9642cdb145886bf501aae051b  tests/member-server-client.test.mjs
c39579471834e520ce574cc8120a676afac636bc4f64220bded0dcbc9ada85d0  tests/wave8-member-ui.test.mjs
9a0a0e5b67120d5e1ad1e88fb2481ecdc580db996cf4c1322da062a03e262905  tests/my-lockliel-platform.test.mjs
2db8428f899edb0fb3f1310b4b0df8903b79d276f623696c307f788f88ae998d  tests/preview-isolation.test.mjs
cfa3123a3caafe2676ae14c0105f7357a090d7a4ef55deff8de791735d1ac146  netlify/lib/lockliel-core.mjs
84716b879d51b25b01be6e8cc3906bcd16e45b3cc5c9802808534af4859bb263  netlify/lib/backend-config.mjs
20cdfe213e786c3f9020e52d7e0aaa2cad61960e623167fc8861645786556526  supabase/migrations/20260925175229_lockliel_require_active_session_for_staff_access.sql
```

## Final correction and independent acceptance

**SCOPED SOURCE REVIEW PASSED. No pending actionable source defect found.** This is acceptance of local source and mocked compatibility only, not hosted or production certification.

Coordinator corrected the P2 in new lib/member-server-read/session-events.ts. bindServerReadInvalidation consumes the actual established lockliel:auth-change storage key, synchronously invokes the shell's controller.invalidate plus view reset, and removes all listeners during cleanup. It never reads the key value or modifies storage, cookies or Auth. Optional custom event and existing visibility/pagehide/blur clearing remain additional signals. ServerMemberReadShell now calls this binder. Existing Auth producers, shared session implementation, hosting configuration and all migrations remain unchanged.

Independent recheck uses real EventTarget dispatch: unrelated key preserves current read, exact Auth key clears ready data and advances generation, pending request is aborted and late response cannot repaint, unbind prevents further invalidation. No new event grant or identity authority exists.

Also reviewed the final two root test amendments and tests/wave8-server-client.test.mjs's dedicated closed-export matrix: all seven methods across production, branch-deploy, deploy-preview, dev, unknown and absent contexts always503/no cookie/no redirect and exact unavailable body. The old source enumeration continues to require shared session guard for all ordinary protected routes; new closed candidate remains outside publicRoutes and cannot activate a factory/environment override. Existing nonproduction zero-egress matrix retains its coverage. These test changes do not grant a public-auth exception.

Fresh independent guarded command:

    node --import ./tests/support/network-guard.mjs --test tests/member-read-server.test.mjs tests/member-server-client.test.mjs tests/wave8-member-ui.test.mjs tests/wave8-server-client.test.mjs

**162 tests passed, 0 failed, 0 skipped.** Includes the real server-output→adapter→controller composition and source-compatible stable RPC seam through mocked transport; no live API or SQL. Totals overlap coordinator suite. git diff --check passed. No application source was edited or staged by this reviewer. No hosted request was made during this independent audit. Earlier initial 138 result is superseded by this recheck for changed client/root tests. Coordinator retains responsibility for complete suite, builds/types/lint/Netlify, disposable SQL fixtures, browser/a11y and preservation.

Frozen final reviewed byte pins, replacing the initial pins for final acceptance:

```
88ad503e9a987c5a8307c61d96d1559b3bd277b25224ce6e8f520bee61192a08  netlify/lib/member-read-binding.mjs
553aa0a6927b27ac35a54e95f0eb65f157d95d67eef44d7b2bd9c538bca0d5f7  netlify/lib/member-read-server.mjs
96b2a1908245d30df38219d930e111a72aae17c5ebfb346c7e2addbf85af112a  netlify/lib/member-read-projection.mjs
d2bce11076ae9ad82f03f91f4d76a8d1329df57f2484812580c69637d05be929  netlify/functions/lockliel-member-read.mjs
de0d4a7c1ae19ef3af5093086fbc4a7557bf796e65493f83e58cce805ccb8d0e  lib/member-server-read/contracts.ts
70bca2661513f5ea3dbadad98907a75a48b7b67b3ccd618015d8af0b6d1a0a77  lib/member-server-read/adapter.ts
8ec4c922a36c95678cacbb0a537cba8e56bde165df41e23c8edcd60003d22631  lib/member-server-read/controller.ts
a82fcbd3399228de56cc3333bde145753550c2049b259cb995d1877db9e0a1cd  lib/member-server-read/validation.ts
4b0b8d05cc7e55ae3cab613e7d21a75dfd2f2a435bcfd3ef63eecfdf38ef3993  lib/member-server-read/session-events.ts
fd7bbde3940cebf405fa36554288350d1d1a60ee023e4bbc5a341f6f834f474f  components/member-review/server-member-read-shell.tsx
39d06088d5843d3ed25dc1dc8a771eee663fdeac119bec01c0396386a6b5f076  components/member-review/member-review-shell.tsx
4b76455a315ea30efa8088eb2d1450b76049eb72cad155eb6581d963abe07263  app/my-lockliel/review/page.tsx
ccac28bf377198a71dfe7867c03c716150e70b09d92288ba4893ba3240bb3886  lib/member-review/review-policy.ts
eb0eae3d9b4e06b98784bd8dbaabaebc6c8fe918cd7ffea82a86cfe2bac4ef4a  tests/member-read-server.test.mjs
283eeb21b9ccc5670dab0d1c47f5a6cc979a30f9dfef73309a9556d0ba56eba3  tests/member-server-client.test.mjs
c39579471834e520ce574cc8120a676afac636bc4f64220bded0dcbc9ada85d0  tests/wave8-member-ui.test.mjs
3431df9317bc354a652f59213c340eb569b2afc2507baa0e09e7ac4ae102a1d4  tests/wave8-server-client.test.mjs
9a0a0e5b67120d5e1ad1e88fb2481ecdc580db996cf4c1322da062a03e262905  tests/my-lockliel-platform.test.mjs
2db8428f899edb0fb3f1310b4b0df8903b79d276f623696c307f788f88ae998d  tests/preview-isolation.test.mjs
cfa3123a3caafe2676ae14c0105f7357a090d7a4ef55deff8de791735d1ac146  netlify/lib/lockliel-core.mjs
84716b879d51b25b01be6e8cc3906bcd16e45b3cc5c9802808534af4859bb263  netlify/lib/backend-config.mjs
20cdfe213e786c3f9020e52d7e0aaa2cad61960e623167fc8861645786556526  supabase/migrations/20260925175229_lockliel_require_active_session_for_staff_access.sql
```
