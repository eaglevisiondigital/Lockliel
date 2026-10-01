# Course release recovery and Auth prerequisites

## Recovery configuration completed, 2026-10-01

The later explicit Small-compute/PITR approval was executed and verified. See
`production-pitr-enabled-2026-10-01.md`: production now uses Small with seven-day PITR,
ACTIVE_HEALTHY, unchanged version/region and 274 migrations. Dashboard UTC window
was 2026-09-24 21:06:12 through 2026-10-01 19:11:17. This supersedes the OFF/Micro
blocker below, not the separate release gates. No restore, migration or deploy occurred.
RPO <= 2 minutes and planned course maintenance <= 30 minutes are targets. Before
cutover recheck the usable pre-cutover point, Owner/MFA/restore rights, independent
Storage protection, provider stability and the remaining application/security gates.

## Recovery policy update, 2026-10-01

See `production-pitr-review-2026-10-01.md`. Primary Chat approved 7-day PITR,
RPO <= 2 minutes and planned course maintenance <= 30 minutes. These are targets, not
verified restore duration or proof of a usable recovery point. Actual PITR remains
OFF: current Micro requires a separately authorized Small compute change plus billing
approval; the scoped enablement task explicitly forbade compute changes. No settings
were saved. Supabase PITR replaces separate Daily Backups; independent archival and
Storage-object protection are still future work. Before migration release verify a
usable pre-cutover point and an authorized Owner/operator with MFA/restore capability.
No down migration is assumed; recovery after a commit may require coordinated full
DB and application restoration. Provider incident and other release gates remain.
Earlier missing numeric-policy or no-PITR-authorization statements below are historical;
they do not override this approved target or authorize the required compute upgrade.

Preparation only, 2026-09-30. No settings were changed or purchased.

## Leaked-password protection

A fresh read-only production Security Advisor check still reports
`auth_leaked_password_protection`, WARN. Production project is
`bsndfhbemstyrrglajat`. A separately authorized Owner/operator must open this
project's Authentication password-security settings and enable **Prevent the use
of leaked passwords**, then save that one setting and re-run Security Advisor.
Leave SMTP, email confirmation, URLs, password length/character rules, sessions,
MFA configuration, payment and staff state alone. Record before/after evidence and
operator identity without credentials. Do not use a real member or a real leaked
password for production testing. Validate rejection behavior in isolation first.

Supabase documents this feature for Pro and above and describes its HaveIBeenPwned
check. Existing passwords are not silently rotated; the documentation distinguishes
existing sign-in from enforcement for new/password-change requests and weak-password
reporting. See [password security and the remediation reference](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
An enabled setting is still NOT VERIFIED. This assignment does not authorize it.

## Near-zero-loss recovery is required

Primary Chat requires near-zero-loss recovery before cutover. The earlier same-day
Dashboard evidence showed PITR disabled, a physical backup from
2026-09-30T07:30:55Z, and an available restore control. That is not proof of a
successful restore or an acceptable current recovery point. No restore was clicked.

Before a production assignment, an Owner must approve the PITR cost and retention,
separately authorize enabling it, and verify the project now exposes a usable recent
recovery window. Published pricing is approximately $100/month for seven-day retention,
charged $0.137/hour; it is an add-on outside the Spend Cap. This is a quoted planning
cost, not purchase authorization. Confirm current project eligibility/compute and the
actual Dashboard quote. [Official PITR usage and pricing](https://supabase.com/docs/guides/platform/manage-your-usage/point-in-time-recovery).

The operator must have a current MFA-authenticated account, verified restore
permissions, a tested recovery factor held securely, and a second available operator
or explicit recovery arrangement. Confirm the earliest/latest recoverable timestamps
and that the chosen UTC point precedes the first cutover write. Record the last
accepted write/drain boundary and provider confirmation that the recovery window
covers it. Do not promise zero loss merely because PITR is enabled.

Database restoration takes the project offline and affects unrelated database
activity. Storage object bytes need separate preservation; database backups cover
metadata rather than those file bytes. Retain the exact old/new app artifacts,
protected content assets and current configuration references. Rehearse recovery in
an isolated target and verify ledger, catalog, representative synthetic data and app
compatibility. [Official database backup/restore documentation](https://supabase.com/docs/guides/platform/backups).

## Connection and incident gates

The earlier production direct endpoint check resolved IPv6 but found no route;
production TLS/authentication and timeout settings have not been freshly proved.
The new disposable rehearsal proves verify-full and wrong-CA/hostname rejection,
plus actual writer lock_timeout=5s and statement_timeout=30s. It does not prove the
Mac's current production path. Recheck direct
`db.bsndfhbemstyrrglajat.supabase.co:5432` with the trusted project CA and hidden
credentials. Never fall back silently to a pooler or weaken TLS.

Before release, verify stable provider/network routing, current Supabase and Netlify
health, no unresolved regional incident, workstation power and a stable connection.
Do not switch Wi-Fi/hotspot mid-transaction. On any client/network failure keep course
maintenance closed, reconnect read-only through the same approved endpoint, and
classify ledger AND catalog. Exact pre-stage state means rolled back; exact expected
post-stage state means committed; every mismatch or failed reconnect is UNKNOWN/STOP.
Never blindly retry, drop objects, mark ledger rows manually, restore, or reopen.

After any new-engine writes, rolling back the frontend alone to the 274 app is not
safe. Near-zero-loss restoration and any wider write freeze must be a separately
approved incident decision. Preserve evidence and newer member drafts; never claim
an older backup restores unsaved browser memory.

## Exact final recovery and network gates

PASS requires PITR active through the pre-cutover instant OR a separately approved
equivalent recoverable post-freeze snapshot and explicit near-zero-loss RPO. An old
backup or a proposed purchase is insufficient. Verify Owner MFA, restore permissions,
operator recovery access and a stable Supabase/provider window with fresh evidence.
No PITR purchase, setting or restore is authorized by this preparation.

Known-good prior network path: T-Mobile iPhone hotspot. Normal Ethernet/Wi-Fi lacked
a direct IPv6 route. Final production preflight must freshly verify the direct
endpoint db.bsndfhbemstyrrglajat.supabase.co:5432: IPv6 route, trusted-CA TLS
sslmode=verify-full, authentication, read-only connection, lock_timeout=5s and
statement_timeout=30s. Use hidden input for credentials. Do not use Session Pooler.
No current production connection success is claimed from disposable/local TLS tests.

## Copy-and-paste separate Auth assignment

RECOMMENDED THINKING LEVEL: MEDIUM
CODEX TASK NEEDED
Project Lockliel, production Supabase bsndfhbemstyrrglajat. Authorize enabling ONLY
leaked-password protection after recording the current setting and Security Advisor
warning. Confirm exact project before saving; verify enabled state and rerun Security
Advisor. Preserve SMTP, confirmation, redirect URLs, password length/character rules,
sessions, MFA configuration and all staff/payment/content settings. Do not create or
modify real member accounts, test real leaked passwords, migrate or deploy. Return
before/after evidence, Advisor outcome and explicit no-other-change confirmation.
If plan eligibility or an unexpected setting blocks the change, stop and report.
