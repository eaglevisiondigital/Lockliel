# Trusted-duration correction: local proposal only

**Historical proposal, superseded on2026-10-01.** The reviewed correction was
strengthened and promoted as authoritative migration
`20261001211009_lockliel_current_trusted_duration_progression.sql`. The full SQL suite
now tests280 directly and does not execute this overlay. Its two-function form is
insufficient for replacement-media re-verification. Retained below is the original
review context, not current execution guidance. See
[the280 report](../../../docs/trusted-duration-280-2026-10-01.md).

The approved policy cannot be enforced by the unchanged275–279 functions. The
timestamped SQL was created with the pinned CLI's `migration new` command, then
kept here outside `supabase/migrations` to preserve the specified279 release set.
It is not an authoritative280 migration, hosted operation or deployment instruction.

The proposal changes two functions. It checks current trusted metadata before
honoring historical watch credit. It also routes already-completed lesson saves
through UPDATE so the INSERT-before-conflict completion trigger does not reject
legitimate notes edits when current duration is unavailable. Existing checks for
identity, active session, enrollment, publication, revision, immutable answers and
owner-only notes remain. It changes no grants, tables, data or historical files.

`npm run test:sql` applies it only inside a rolled-back disposable transaction after
the exact279 baseline. Eight focused policy cases and three security/persistence
files pass. This does not constitute a six-stage CLI or hosted acceptance test.

Before promotion: revise and review the release set, seal the candidate hash,
regenerate exact catalog expectations, update the maintenance readiness fingerprint,
reconcile the old tests that intentionally accepted cached achievement during media
withdrawal, and rehearse every release stage and failure path. Repeat hosted
acceptance only with explicit isolated scope. Do not edit275 or bypass readiness.
See [the review](../../../docs/verifier-duration-policy-2026-10-01.md).
