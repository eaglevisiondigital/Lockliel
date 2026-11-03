# WAVE 10I-R FINAL SYNTHETIC FIXTURE READINESS

**FIXTURE INTEGRATION BLOCKED**

November 3, 2026. Local implementation and validation are complete. One specific integration gate remains: a supported, independently reviewed, secret-safe procedure for fresh child-only provider evidence covering branch identity, managed Auth hooks/version and operator/key provenance. The current implementation accepts only a source-pinned independent seal; caller-generated receipts cannot replace missing evidence. No hosted operation is ready or authorized from this result.

## 1. Exact checkpoints

- Fixture source: `9bde7d74e3f8c303155ece75fd8148c0d45fd61a` on `codex/wave10-hosted-composition`, worktree `/Users/davesmacbookpro/.codex/worktrees/lockliel-wave10-hosted-composition/Lockliel`.
- Starting tooling/documentation: `4619835ff2689814eb295be9b02c1053da0dd9e4` / `46be30a1a78859050363c9518e800395e6751102`.
- Separate Faith Journey correction remains `a35ef225286f7c1ab52100f51013c88d47d8b3b5` on `codex/wave10iq-faith-feedback`. R made no UI changes.
- Pinned application remains `327ba098628f70aa65140862b8b14cd709bfd711`; existing 40-file operator remains `d51b90db66d5fc650e7b5139a8a5787ba6a994ac`.
- The local documentation commit containing this report follows the source commit. Its exact SHA is returned in the completion message.

## 2. Five requirements

| Requirement | Local result | Remaining execution limit |
|---|---|---|
| Trusted operator/provider integration | Concrete protected input, fixed provider/native transport, source pins, durable attempt/step claims, nonce-bound receipts and terminal handling implemented | **BLOCKED:** independent provider evidence acquisition procedure must be established; disabled seal remains uninstalled |
| Per-account bootstrap | Exact A/B defaults, ownership and absence checks; old learner/progress preservation and cross-owner denial pass in actual disposable SQL | Fresh hosted catalog and collision checks still required under separate authority |
| Trigger/hook evidence | 280 migrations replayed; 165 noninternal triggers inventoried with definitions; modeled Admin create/confirmation sequence tested | Managed Auth binary, custom hooks and provider audit effects are not certified by local SQL |
| Provider responses | Official raw-user response, omitted factors, lossless timestamps, errors/timeouts and ambiguous outcomes handled and tested | Current hosted shape/version and timing remain fresh-provider gates; no retry on uncertainty |
| Private provenance | Permanent noncredential lifecycle writer, immutable record/anchor chains, independent expected checkpoint and partial reconciliation implemented | No live private store installed; named custodian and independently retained head require exact approval |

Implementation details: [operator](WAVE10IR_OPERATOR_IMPLEMENTATION.md), [private provenance](WAVE10IR_PROVENANCE_IMPLEMENTATION.md), [independent security review](WAVE10IR_INDEPENDENT_SECURITY_REVIEW.md). No replacement Auth or relationship system was introduced.

## 3. Provider and bootstrap verification

Only two fixed serial Admin creation operations exist in the operator, targeting qjksggxorghaxvpyslip. It has no account-list/update/delete/reset/login/invite fallback, retries, production destination or substitute generation. A failure prevents further creation; an ambiguous timeout may conceal a completed write and requires separately authorized reconciliation.

The [official createUser contract](https://supabase.com/docs/reference/javascript/auth-admin-createuser), [Auth admin source](https://github.com/supabase/auth/blob/master/internal/api/admin.go) and [User model](https://github.com/supabase/auth/blob/master/internal/models/user.go) inform the compatibility model. The raw provider user is projected to noncredential identity digests, then independently compared with native SQL. Omitted factors are not interpreted as zero; SQL must prove zero. Variable fractional UTC timestamps normalize without lossy rounding. Unknown shape, lossy precision or clock disagreement stops.

Each new account must have exactly one owned row in profiles, member_journey, profile_tags, referral_links, communication_preferences, profile_connection_cards and profile_finance_cards. Defaults include no inviter/leader, new onboarding, all communication consent flags false, zero relationship counts, direct-website source tag and a neutral member-invite link. Identity provider, provider_id, subject and login must agree. The allowed confirmation metadata is exact. Source tags and applications confer no staff privilege. Both accounts must have zero staff roles, factors, sessions, enrollments, progress and notes.

All comparisons return only counts, booleans or approved noncredential digests. No private identity JSON, member row, password or token is returned. Protected-state fingerprints cover public/private tables, maintenance control, Storage metadata and specified Auth tables; incidental physical row rewrites conservatively fail. Provider internal audit behavior is separately gated.

## 4. Triggers and hooks

The local [complete trigger inventory and test result](evidence/2026-11-03-wave10ir/sql-local-result.json) contains 165 noninternal triggers including local operational maintenance guards. Declarative FK/check constraints are exercised by the real replay, not miscounted as user triggers.

Creation invokes `on_auth_user_created_lockliel` / `app_private.handle_new_user`. The profile insertion also checks inviter/current-leader boundaries, creates default communication preferences and referral link, and syncs connection/finance cards. `validate_referral_link_content` checks the neutral link. Financial/nonfinancial profile-insert linkers are present, and explicit email confirmation invokes both confirmation linkers. Nine collision domains are checked before creation so synthetic email confirmation cannot silently attach existing leads, applications, gifts, commitments, orders or checkout records. The no-referral input avoids referral events, contact consent, inviter conversations/tasks and count changes. No faith profile is created, so the faith-profile course enrollment trigger is not invoked.

Existing email-update, password-update, profile-update/delete and other triggers are catalogued but are not part of the allowed request. Native graph verification includes functions, owners, ACLs, configuration and trigger definitions. No source-defined outbound HTTP/cron operation was found in the reviewed migration search; that does not prove managed hooks absent.

The documented Admin sequence adds provider user/identity/audit state and confirmation metadata. Local SQL models this sequence against the real application triggers but does not run GoTrue. Current hosted Auth hooks/version, provider audit storage and any undocumented automatic action remain unknown until independent isolated provider evidence is obtained. No hosted equivalence or message-free guarantee is inferred.

## 5. Private provenance and credential boundary

The registry admits only exact project/purpose/generation/source/authorization and noncredential identity/evidence digests. It preserves claimed, created-unverified, verified, rejected, ambiguous and separately reconciled states. Both immutable chains and the independent expected head must agree; truncation, replay, interrupted writes, symlinks, hardlinks, writable modes or stale checkpoints deny. Ambiguous/rejected creation permanently stops later creation, even if reconciliation later finds no account.

The fixed private root remains uninstalled. A later installation must name the custodian, approve owner-only storage outside Git/evidence/sync, and establish independent checkpoint custody. A privileged owner who can rewrite every copy is outside filesystem integrity guarantees. Derived mapping evidence remains `REQUIRES_INDEPENDENT_APPROVAL`; it does not authorize the unchanged 40-file deployment operator or satisfy its sixteen Auth flags.

No live credentials were requested or used. Only hidden process input/private pipes are implemented; no secret arguments, environment, files, logs or reports. Mutable buffers are cleared and private processes exit. Immutable JS/Python runtime copies cannot be promised physical zeroization. Only structurally qjks-bound legacy service-role JWTs are supported by this path; decoded claims are not signature/provenance verification. Opaque keys and PATs deny before request. Actual private key provenance and the credential's broader project-admin capability require explicit later review and approval.

## 6. Independent review

Three native agents were actually dispatched. `wave10ir_operator` owned operator/provider/native-worker integration; `wave10ir_provenance` owned the private store and later separate UI review; `wave10ir_security` independently reviewed both and the coordinator's native inventory. Root owned actual SQL, native defaults/identity validation, integration and continuity. No overlapping file edits were left unresolved.

Nine confirmed findings were corrected, including getter leakage, late-output disposal, interrupted A/B input cleanup, durable operation enforcement, native marker checks, runtime hashing and bytearray-to-pinned-driver compatibility. The independent local review passes. It explicitly retains the provider-acquisition gate and residual project-admin/immutable-copy limitations. No current hosted security acceptance is claimed.

## 7. Validation

- Full JavaScript regression: **2,309 passed, 0 failed, 0 skipped**. This includes 38 operator, 29 provenance and 36 independent R security tests; do not add these subsets to the total.
- Python: **43 focused tests passed**: 31 native inventory, four worker denial and eight independent security tests.
- Actual disposable PostgreSQL 17: **280 unchanged migrations replayed and 22 checks passed**. Tests cover exact defaults/identity, partial A, old enrolled learner/progress preservation, 57/57 public RLS, zero service-role private-note table/column grants, both directions of cross-owner denial, and rejection of wrong identity/email/metadata/defaults/role/enrollment/old-row mutation. Negative changes were rolled back.
- Only a newly owned private Unix socket was used. No TCP listener, password, managed connection or unrelated resource change. The owned cluster was stopped and directory removed after each run.
- TypeScript, supported webpack/static build, configured and fixture lint, Netlify validation (83 modules, 63 handlers) and two offline source-verification entry points pass. Existing dependencies only; temporary symlink removed.
- 280 migration hashes and all 40 existing deployment-operator files are byte-identical. The old 16-flag verifier is unchanged.

[Sanitized validation](evidence/2026-11-03-wave10ir/validation.json) records the superseded test-only JSON cast and stale assertion/lint corrections. Final checks pass. Local replay does not certify hosted TLS or CLI migration-ledger statement encoding. Prior unrelated 17-file SQL acceptance was not rerun or represented as fresh.

## 8. Specific unresolved requirement and smallest next operation

A supported secret-safe acquisition procedure for fresh child-only branch, hook, managed Auth version and operator/key provenance has not been established. [The documented child branch-config endpoint](https://supabase.com/docs/reference/api/v1-get-a-branch-config) returns credential-bearing configuration and is not the needed nonsecret metadata proof. No call to it or the production parent occurred. A hash of locally supplied JSON cannot close this gate.

The smallest next operation is a **separately authorized read-only isolated provider evidence review**, limited to nonsecret project/branch identity, Auth hook enablement, deployed Auth version and operator permission/key-source metadata. Start with the supported child Dashboard/provider metadata surface. Do not open secret values, use a parent-project API, create credentials or query accounts. Specify and independently review the actual projection and collector identity before any seal can be admitted. If a required fact is unavailable, report that exact missing fact and keep the seal disabled. No broad implementation cycle, password retry or account creation is recommended.

## 9. Exact eventual two-account effects and cleanup

After the evidence gate and separate creation approval: at most two serial Admin POSTs, one new ordinary A and one new ordinary B, using non-deliverable synthetic aliases, distinct private passwords, neutral names and explicit auto-confirmation. Known application effect is 14 new bootstrap rows total, plus two Auth users, two email identities and provider-required Auth audit/confirmation state. No staff/manager role, session, enrollment, course progress, consent grant, real contact, payment or content activation is permitted.

Before/after direct native observations are read-only, exact qjks, IPv6, verify-full/hostname, same-connection on/5s/30s, ledger280, maintenanceON, exact catalog and protected old-state match. They need a new dedicated creation allowance; J is never reset or reused. No Netlify reservation is consumed.

No automatic cleanup is implemented. A partial or ambiguous result freezes the attempt and retains its private provenance. Any subsequent read-only reconciliation or deletion requires separate exact-subject authority, dependency/cascade review and independent identity confirmation. Existing learners, manager, course infrastructure and historical accounts are never cleanup targets.

## 10. Separate owner approval needed, not requested yet

Once the evidence procedure passes, the exact hosted-creation assignment must pin this source and installation hashes, qjks project/branch, independently captured evidence and five-minute lifetime, a new generation with maximum two creates/two native reads, private operator/database/password handoff, residual service-role authority, auto-confirmed synthetic aliases and 14 bootstrap rows, named provenance custodian/checkpoint retention, partial-failure containment and a no-automatic-delete policy. Operator identity/provenance must be verified, not merely owner-asserted. Member Auth, manager/MFA, settings, migrations, maintenance and application deployment remain excluded.

## 11. Parallel feature evidence

The separate UI correction `a35ef225286f7c1ab52100f51013c88d47d8b3b5` remains clean and was not inserted into the pinned application. A fresh **239-test** Faith/Share/My Five/integration review passed with network blocked, covering whitespace errors, field association, first-invalid focus code, independent clearing, entry limits and owner/reset privacy boundaries. Existing visual tokens/styles and reduced-motion rules are preserved. No new UI code was needed in R; the delivered correction was already implemented in Q. No invented activity is claimed for other lanes. Actual VoiceOver, browser focus, 200% zoom and the separately held connected Share Center announcement follow-up remain unverified/outside this package.

All twelve registers and the 37-feature inventory are updated; statuses remain unchanged and none becomes Live.

## 12. Preservation

[Preservation evidence](evidence/2026-11-03-wave10ir/preservation.json) confirms unchanged 280 migrations, 40 operator files, 1,299 protected root files, dirty-root state, main/course/other existing refs, separate UI and J receipt/grant. J remains CONSUMED; application reservation UNUSED. Only local tooling/documentation commits were created. No push or merge.

No live credentials, hosted database/Auth/user/setting action, production access/change, hosted migration, maintenance change, Netlify reservation/upload/deployment, messaging, payment, staff grant, content activation or infrastructure purchase occurred. Published sites, PR #4 and course infrastructure were preserved by no action, not a fresh provider audit. Public official documentation reads and disposable local synthetic SQL were the only external-document/database activity.
