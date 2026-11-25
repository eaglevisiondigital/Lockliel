# Next-phase authorization reconciliation

November 1, 2026. Source: Dave’s directly typed NEXT PHASE AUTHORIZATION in this chat.

## W1: Security and Account Integrity

Owner: /root coordinator

Branch: `codex/lane1-account-integrity` from `d71d079126f48e49f8d3df591373c0381b9f91e1`.

Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane1-account-integrity/Lockliel`.

Allowed writes: docs/lane1-account-integrity/**; read-only Auth/source/evidence review. No app/config mutation.

State: coordinator completed bounded W1; local files uncommitted.

## W2: Course release readiness

Owner: /root/course_release_review

Branch: `codex/lane2-course-readiness` from `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.

Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane2-course-readiness/Lockliel`.

Allowed writes: docs/lane2-course-readiness/**; read-only isolated source/binding and local verifier checks. No maintenance exit or hosted writes.

State: actually dispatched to the named native agent and completed locally; files uncommitted.

## W3: Member Experience and Design

Owner: /root/feature_inventory

Branch: `codex/lane3-member-design` from `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.

Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane3-member-design/Lockliel`.

Allowed writes: components/member-experience-preview/**; docs/lane3-member-design/**; tests/member-experience-preview.test.mjs if meaningful. Isolated prototype, no shared CSS/token/nav/Auth edits.

State: actually dispatched to the named native agent and completed locally; files uncommitted.

## W4: Bible and Faith Journey

Owner: /root/faith_design_plan

Branch: `codex/lane4-faith-contracts` from `fa294f7d4cd717a37d9fe44b10cd3c32fe2cd098`.

Worktree: `/Users/davesmacbookpro/.codex/worktrees/lockliel-lane4-faith-contracts/Lockliel`.

Allowed writes: lib/faith-journey/**; tests/faith-journey-contracts.test.mjs; docs/lane4-faith-contracts/**. Licensing analysis/service and private domain contracts only, no persistence/schema/UI drawer activation.

State: actually dispatched to the named native agent and completed locally; files uncommitted.

No push, merge, deployment or production modification. Root coordinator alone maintains all twelve registers. Native capacity is coordinator plus three child agents. Live enrollment/account/Auth settings/CAPTCHA/migrations and maintenance remain unchanged. Full hosted positive acceptance, real keys, new sessions and maintenance windows require explicit bounded authority and verified binding.
