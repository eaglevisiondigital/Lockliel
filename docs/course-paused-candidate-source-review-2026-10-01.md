# Isolated candidate deployment preflight

**ISOLATED CANDIDATE FAILED PAUSED ACCEPTANCE**

Meaning: blocked before deployment by an explicit source mismatch. No new candidate
was deployed and no authenticated/browser acceptance was performed. This is not an
observed failure of a newly deployed application.

## Exact source and blocker

The assignment explicitly names `3a7b7b9e647739e72746f9ff2cb6602b1e06ff8d` and
forbids silently substituting another commit. That commit hardcodes the production
Supabase URL/public key and production origin in `netlify/lib/lockliel-core.mjs`.
Its `deployment-safety.mjs` permits only production context and does not have the
reviewed isolated-site binding. It contains278 migration files, not279.

The immutable configuration module, exact site/context/backend binding and
configuration-only rehearsal packager were introduced later at
`0cfcf405be16f43fa1ac7fbe0ee0ad2c3b764158`. Current local HEAD is
`4204249345513d9f871f3abeffb706a3bde3caaa`, branch lockliel-backend-v1, clean at
inspection and ten commits ahead of origin. Application files under app, components,
lib and netlify, plus scripts/rehearsal, are unchanged from0cfcf405 through4204249.
The subsequent work is security/migration/tooling/tests/continuity. All279 current
migration hashes match the pinned source and manifest.

Deploying3a7b7b9 unmodified cannot meet the requested binding. Replacing its guard
or substituting4204249 without confirmation would violate the exact-source
instruction. No guard was bypassed and no source substitution was made. A question
requesting explicit use of4204249 is pending. This is a user-instruction conflict,
not an automatic approval rejection or a skill-imposed permission requirement.

## Remote checks

Fresh GitHub inspection confirmed PR4 draft/open/unmerged against main, auto-merge
null, exact head3a7b7b9. Both Lockliel Preview Check workflow runs completed SUCCESS:

- [Push run36743265928](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36743265928)
- [PR run36743273182](https://github.com/eaglevisiondigital/Lockliel/actions/runs/36743273182)

Those results cover3a7b7b9, not the unpushed4204249 source. No workflow was triggered
or PR changed. PR4 was attached to this chat for review.

## Retained site and database

Read-only Netlify inspection confirmed site70b03a42-6329-476e-bf4b-2b1ce30e9567,
jade-unicorn-642f40, and retained old-app deploy6abd778184898338b60d32b2, ready,
branch-deploy/rehearsal context. Its API commit_ref is null; source attribution is
from the existing recorded artifact lineage, not an invented Netlify commit field.
URL: https://rehearsal--jade-unicorn-642f40.netlify.app . No deploy was created.

Fresh direct TLS verify-full read-only checks on qjksggxorghaxvpyslip confirmed
ledger279, exact version prefix, security postconditions and:

```json
{"paused":true,"protocol":"278-v1","schemaReady":true}
```

Connection: PostgreSQL17.11/TLS1.3, transaction_read_only=on, lock_timeout5s,
statement_timeout30s. No hosted writes, migrations or settings changes were made.

## Acceptance status and known limits

Fresh User A/User B/manager authentication, MFA, responsive/static deployed candidate
checks, hosted A/B/notes/privacy checks, no-write snapshots and stale-client browser
behavior: NOT RUN. No claim of paused acceptance or post-reopen course functionality.
The prior original-app media retry limitation remains unresolved historical evidence.

The current journey handler returns maintenance503 before loading course data, and
existing maintenance RLS restricts course reads. Therefore live per-lesson statuses
while paused must not be assumed available. A later acceptance run should record
actual safe maintenance UI and distinguish static shells from authenticated content;
it must not weaken the hook/RLS to satisfy an expected display.

## Preservation

No production command, DB write, migration, deployment, Auth/SMTP/PITR change,
payment/staff/content/settings change, Share Library activation, push or main merge
occurred. Both isolated projects and sites are retained. Production was not queried:
last verified baseline remains274/main1599ab2, Netlify6abbb27a1cdd6d00081b0e8e and
ChatGPT Site25. Local origin/main remains1599ab271e0120a5cdc4e38e225ba749dd214721.
These are prior identities plus no-change actions, not a fresh external-state audit.

## Smallest corrective assignment for Primary Chat

RECOMMENDED THINKING LEVEL: HIGH

CHAT DECISION NEEDED

The named remote commit3a7b7b9 lacks the exact isolated-site binding, introduced in
0cfcf405. Approve this source correction, or retain the deployment hold:

“Use exact local source4204249345513d9f871f3abeffb706a3bde3caaa for the isolated
paused acceptance assignment instead of3a7b7b9. Record that remote CI covers3a7b7b9
and local validation covers the later binding/tooling. Deploy only to retained
site70b03a42-6329-476e-bf4b-2b1ce30e9567, exclusively bound to
qjksggxorghaxvpyslip. Verify the exact packaged source and transport allowlist.
Keep paused=true throughout. Preserve the old deploy/source, both isolated projects
and all production systems. Do not push, mergePR4, deploy production, apply migrations
or reopen maintenance. Perform only the originally scoped synthetic paused acceptance
and report unavailable course reads honestly without loosening the maintenance gate.”

Changing the source requires this explicit correction because the original
assignment prohibits substitution. No new feature or production approval is needed.
