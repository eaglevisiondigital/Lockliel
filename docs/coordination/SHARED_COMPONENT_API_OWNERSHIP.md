# Shared component, service, database and API ownership

## Wave 3 current result, November 1

Coordinator owns only new app/my-lockliel/review/**, components/member-review/**, lib/member-review/**, tests/member-review-integration.test.mjs and integration docs. Exact W3e3a3dd0 components/member-experience-preview/** plus test and W4f4c2a9f components/faith-journey-preview/**,lib/faith-journey/** plus tests imported without edits. No competing existing Auth/nav/tokens/API/migration/package/config changes. MemberWorkspace receives allowlisted display model/identity/resetKey and emits metadata only; FaithWorkspace gets same identity boundary, controlled edition, resetKey and intent callback. No backend/session adapter. W1/W2 docs only; L5/L6 docs only; L7/L8 no implementation lease.

## Historical snapshots below


## Wave 2 current result, November 1

Wave2 retains existing leases. W4 additionally owns components/faith-journey-preview/** and tests/faith-journey-preview.test.mjs for its newly authorized isolated UI. W3 owns only components/member-experience-preview/** and its focused test. Neither edits shared primitives/tokens/navigation/Auth/course modules or imports an uncommitted cross-lane component. Coordinator alone changes registers/continuity. All future L5–L8 shared DTOs are requests for review; no active leases or agents are assigned to those prepared packages. No shared-file conflict or schema/dependency/configuration edit found.

## Earlier wave record retained

## November 1 next-phase result

The following exclusive file leases were exercised and reviewed. No shared baseline source files changed.

| Package/owner | Actual write ownership |
|---|---|
| W1 /root | docs/lane1-account-integrity/** only |
| W2 /root/course_release_review | docs/lane2-course-readiness/** only |
| W3 /root/feature_inventory | components/member-experience-preview/**; docs/lane3-member-design/**; tests/member-experience-preview.test.mjs |
| W4 /root/faith_design_plan | lib/faith-journey/**; docs/lane4-faith-contracts/**; tests/faith-journey-contracts.test.mjs |
| Coordinator | Root coordination registers, evidence and continuity prepend |

These leases are narrower than future lane ownership below. No new API endpoint, schema, DTO permission grant, dependency, Auth primitive, shared CSS, navigation or deployment configuration was introduced. W3 projections and W4 owner IDs/types are synthetic contract boundaries, not server authorization or RLS. No integration branch was created.

## Initialization snapshot retained for history

November 1 initial ownership contract. These are engineering-role owners, not claims
that named staff or eight persistent agents exist. Dave approves product; coordinator
accepts interface changes. One owner edits a shared file at a time. Other lanes submit
small typed-contract/diff requests and acceptance evidence.

| Owner | Exclusive primary files/services | Database subject/interface ownership | Required consumers/review |
| --- | --- | --- | --- |
| L1 Security/Auth | app/my-lockliel/auth-form.tsx, auth-captcha.tsx and sign-in/sign-up/forgot/reset/MFA/session components; lib/lockliel-auth-cookies.ts; netlify/functions/lockliel-{signup,login,recover,reset-password,session,account-security}.mjs; netlify/lib/lockliel-core.mjs | Auth identity/session/MFA/CAPTCHA contract; active-session/AAL/role check primitives. Production Auth configuration remains owner-controlled | All lanes consume stable session/authorization DTOs; no user_metadata authorization |
| L2 Courses | app/my-lockliel/journey/**; netlify/lib/course-{engine,journey,cutover}.mjs; journey/resource handlers; course-specific tests | courses, lessons, lesson_assets, course_enrollments, lesson_progress, media_progress, lesson_private_notes, app_private.course_answer_keys; progress/save/watch/readiness protocol | L3 dashboard consumes privacy-safe projections; L4 Scripture interface; L8 admin/export contract; no shared schema edits |
| L3 Member/Visual | app/globals.css; app/my-lockliel/my-lockliel.css; app/my-lockliel/layout.tsx; app/my-lockliel/dashboard-client.tsx; app/my-lockliel/member-journey-panels.tsx; components/ui/**; profile/onboarding/preferences/legacy faith-profile; member-journey libs/types | Public/member design tokens, navigation, profile allowlist, next-step view model; eventual photo interface pending policy | L1 owns Auth state semantics; L2 owns progression; L4 owns new sensitive domains; coordinator serializes integration |
| L4 Bible/Faith | Proposed lib/faith-journey/**, components/faith-journey/**, module CSS, synthetic tests | Reference/provider/license identity; proposed owner-private prayer/growth/anchors/actions/sharing envelope. No current durable schema assigned/created | L3 tokens, L1 identity, L8 privacy lifecycle; coordinator alone allocates migrations |
| L5 My Five/Connections | connections/**, group/**, leader/**, share UI; my-five/share-guidance libs; referral/share-link/share-stats/group handlers | reach_contacts, referral lineage/campaign events, consent-scoped connection/group memberships/requests/checkins | L6 owns library catalog/content; L8 owns roles/admin projection; preserve inviter/campaign/leader/permission distinctions |
| L6 Content/Founders/Books | Public book / Faith Boost / Founders components/pages; content/share-library/**; book-release/faith-boost/founders handlers; library read/content contracts | Book/reader/library catalog, public intake forms / private Blobs, founder application/orientation content; product editorial approval | L5 sharing consumes catalog; L7 benefit/order boundaries; L8 review/retention/admin safety. No implicit content activation |
| L7 Giving/Commerce | partner/orders/fulfillment member components; provider-neutral commerce adapters/tests | Payment intents, provider readiness, orders, benefit eligibility, fulfillment interfaces; no live gateway activation | L8 finance/admin handler owner, L6 product content, Dave legal/provider/destination approval |
| L8 Admin/Privacy/Ops | admin/**; netlify/functions/lockliel-admin*.mjs; privacy/export/deletion handlers/worker; operational evidence | Staff purpose-scoped projections, consent/privacy retention/export/deletion requests. Single admin-person handler owner | L1 common AAL/role gate; L2 course projection/private-note exclusion; L5 relation consent; L7 finance purpose boundaries |
| Coordinator / DB-release custodian | AGENTS.md, CURRENT_BUILD_STATE.md, ARCHITECTURE.md, SECURITY_MODEL.md, DECISIONS.md, docs/coordination/**; supabase/migrations/**; verification manifests; scripts/course-release/**; package.json/lockfile; workflows; netlify.toml; deployment-safety/backend binding | Migration allocator, version/schema compatibility, CI/build/release interfaces and environment allowlist | Schema requests reviewed by domain owner, L1 and L8 before one writer; all historical migration bytes, including 274 and 275–280, remain immutable |

Lane 1 may propose backend-config/deployment-safety changes, but the coordinator owns
the actual shared edit. L2 may propose admin-person changes to L8 and dashboard or
navigation changes to L3. L7 may propose admin-finance/order changes, but L8 owns the
admin edits. L6 owns library catalog/content contracts; L5 owns the sharing consumer.
L6 routes any admin content UI or handler change through L8. The coordinator owns
schema, CI, environment binding and integration changes. This resolves overlapping
subject knowledge without two writers. Workstream contracts must name endpoint path,
input/output allowlists, auth/AAL/role/consent requirements, error/availability semantics,
version compatibility, egress bounds and private export/deletion treatment.

The existing course interface, including `paused`, `schemaReady` and protocol `278-v1`,
must remain stable. A lane must not widen manager views to include private notes/assessments or grading keys.
No schema/permission/global-default-ACL change is implicit in a new component. Verify
actual table and column ACLs independently of default ACLs. No application/tag/Founders
completion/assignment infers a staff grant.

Claim procedure for future tasks: coordinator records allowed paths/base/agent/lease
scope in WORKSTREAM_ASSIGNMENTS before edits; lane writes only those paths; shared
file request stays queued until designated owner integrates it. A completed review
releases the assignment, not a license to start another feature. No remote lock service
or automated enforcement was installed in initialization.
