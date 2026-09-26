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
- The current 2026-09-26 assignment authorizes local migration-history
  reconciliation, compatibility/recovery planning and isolated validation. Do not apply migrations, change permissions, toggle flags,
  bootstrap staff, or execute SQL fixtures against the connected project for it.
- Read `docs/migration-reconciliation.md` before future database releases. The
  reconstructed version `20260925035350` is an explicit ordering exception, not a
  recovered original timestamp. Do not edit existing migration bodies or bypass
  its catalog guard. Keep pushes blocked until hosting triggers are verified.
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
  cluster. Never supply linked-project credentials or execute fixtures live.
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
