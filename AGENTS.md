# Lockliel engineering instructions

## Read first

Read `CURRENT_BUILD_STATE.md`, `ARCHITECTURE.md`, `SECURITY_MODEL.md`, and
`DECISIONS.md`, then inspect the relevant implementation, migrations, tests,
configuration, and Git status before changing anything. These documents describe
the current Lockliel baseline. `README.md` records supported local validation; `README-V63.md` describes another
project and does not establish Lockliel architecture or business approval.

## Ownership and scope

- Chat owns product strategy, priorities, business rules, UX and architecture decisions.
- Codex owns implementation, debugging, tests, security remediation, and repository documentation.
- Work owns extensive research, vendor investigation, and live browser validation.
- Use the lowest reliable reasoning level: Medium for routine scoped work, High
  for authorization, significant migrations and architecture-sensitive work,
  Extra High only when the complexity warrants it. Recommend the setting without
  claiming to have changed the runtime setting.
- Repository: `eaglevisiondigital/Lockliel`. Existing development branch:
  `lockliel-backend-v1`. Supabase project: `bsndfhbemstyrrglajat`.
- Preserve existing work, approved branding, and completed systems. Keep `main`
  untouched. Do not merge, deploy, change production, or alter protected systems
  without explicit authorization for that scope.
- The subsequent 2026-09-26 assignment authorized exactly one normal development
  push of `b2adf96e988380c36e3b3b0275f7b866067e078c`. It is complete; remote CI
  and preview guards passed. Post-push documentation stays local. Another push
  requires a new assignment. Read `docs/remote-validation-2026-09-26.md`.
  Do not apply migrations, change permissions, toggle flags,
  bootstrap staff, or execute SQL fixtures against the connected project for it.
- The 2026-09-27 preparation assignment authorizes continuity/runbook scripts,
  disposable exact-runner rehearsal and one local commit only. No production
  migration, credential/configuration change, push or deployment is authorized.
  Read `docs/production-migration-runbook.md` before any future release. Pin CLI
  2.118.0 and its reviewed binary hash; preserve all 274 migration hashes. Recheck
  Owner MFA, fresh recoverable physical backup, project/site health, traffic and
  database preflight, then require a separate explicit execution assignment.
  Production already accepts ordinary emails. The pending `[.]` migration provides
  convergence/replay consistency; do not describe a verified live signup outage.
- Read `docs/migration-reconciliation.md` before future database releases. The
  reconstructed version `20260925035350` is an explicit ordering exception, not a
  recovered original timestamp. Do not edit existing migration bodies or bypass
  its catalog guard. Read `docs/deployment-safety-review.md` for the exact reviewed
  range, Work's verified hosting findings and the controlled-push recommendation.
- Preserve both the published ChatGPT Site version 25 and Netlify production.
  Before future substantial frontend changes, Chat must identify the authoritative
  visual version and retain recoverable source/assets. Neither site's served
  source baseline has been established by this backend review.
- Keep all Netlify default handlers behind `withProductionBackend`. Only trusted
  invocation `context.deploy.context === 'production'` permits the live backend.
  Keep the edge POST guard and nonproduction form-detection removal. Do not use
  hostname, request headers, NODE_ENV or an environment override to bypass them.
  Local frontend development and mocked tests remain supported; local functions
  have no live backend. Older immutable previews remain unsafe. PR preview #3
  was verified at deploy `6ab8807f33f3d00009cbf189`, commit `b2adf96`; its alias
  can change on future pushes. Recheck exact deploy identity before validation.
  Use unauthenticated GETs or empty POSTs without form names/personal data. Never
  test a guard by permitting a production write or switching context to production.
- Never recreate or rerun applied migrations against an existing live environment. In particular,
  `20260926033358_lockliel_account_deletion_execution_support` already exists in
  both histories. Recheck migration parity before future database work.

## Permanent product and security constraints

- Preserve original inviter independently of latest campaign, assigned mentor or
  group, and access permissions. Applications and tags do not grant leadership.
- Follow-up requires the relevant consent. Inviter or leader status does not
  expose private assessments, financial information, staff notes, or unrestricted
  contact information. Consent never implies unrelated access.
- Welcome Christian backgrounds and seekers while preserving established
  doctrinal convictions. Teaching is Scripture-first, respectful, non-coercive,
  and consistent with the established Word-of-Faith direction.
- Do not use em dashes in user-facing content.
- Do not approve a payment gateway, complimentary-book offer, shipping policy,
  or legal classification by inference from code, draft rows, or old discussion.
- Keep service credentials server-side; never put secrets in source, logs,
  documentation, or reports. Use narrow privileges and RLS. Privileged staff
  access requires an active Auth session, appropriate role, and MFA/AAL2.
- Preserve audited, idempotent deletion safeguards and required financial,
  operational, and audit history. Never test deletion on real accounts.
- Keep `import-grip-pdfs` disabled. Preserve the approved Getting a Grip release
  threshold: 13 lessons, 13 structured worksheets, at least 10 distinct lessons
  with playable teaching video, and 13 protected PDF lessons. Verified video
  durations are optional, not a new release requirement.

## Verification and continuity

- Distinguish repository code, deployed evidence, approved requirements,
  proposals, unknowns, and historical claims. Passing mocks are not live RLS tests.
- Use the full guarded `npm test` suite and supported commands in README.md.
  Resource signup tests must mock both Forms and CRM transports. Keep fail-closed
  network protection enabled, including subprocess probes for swallowed errors.
- Run SQL fixtures only through `npm run test:sql` in its disposable PostgreSQL 17
  cluster, or through the documented `scripts/rehearse-migration-release.mjs`
  disposable runner rehearsal with verified OS IP egress denial. Never supply
  linked-project credentials or execute fixtures live.
- Run meaningful success, failure, input, ownership and authorization checks for
  changed behavior. Database fixtures require an isolated disposable environment.
- After meaningful work update `CURRENT_BUILD_STATE.md` and affected architecture,
  security or decision documentation. Record inspected commit, checks, limitations,
  completed work, migrations, unresolved issues, and next recommended package.
- Return Completed, Changed, Tested, Security, Documentation, Unresolved,
  Next Recommended Build, and a concise Chat Handoff for substantial build work.
- For missing decisions provide `RECOMMENDED THINKING LEVEL: ...`,
  `CHAT DECISION NEEDED`, and a complete copy-and-paste assignment describing the
  current implementation, exact decision, options, implications and risks.
- For external research or browser work provide the same level recommendation,
  `WORK TASK NEEDED`, and a complete scoped assignment with evidence expectations
  and a return report. Do not send another task a message without authorization.
