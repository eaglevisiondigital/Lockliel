# Public provider documentation, not hosted evidence

Reviewed2026-11-04:
- https://supabase.com/docs/reference/cli/supabase-migration-new — supported local migration creation operation. The actual installed pinned binary/help and creation receipt, not the current website's latest CLI flags, determine this candidate's provenance.
- https://supabase.com/changelog — current public index reports CLIv3 breaking changes/defaults. No CLI upgrade or install was performed. Existing pinned CLI use avoids assuming the new defaults apply to the local binary. The markdown endpoint was unsupported by the browsing tool; HTML index was read instead.

No authenticated provider call, project inspection or configuration was performed. Official documentation cannot establish current hosted identity, RLS, token revocation, locale or deployment state.

Approved binary recovery: official public release https://github.com/supabase/cli/releases/tag/v2.118.0 and asset https://github.com/supabase/cli/releases/download/v2.118.0/supabase_2.118.0_darwin_arm64.tar.gz were read without credentials. Download was placed in /private/tmp/lockliel-approved-cli-5qTafr, not installed. Extracted executable SHA256 exactly matched repository-approved8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4 before any execution; independent reviewer confirmed. No version upgrade, provider account or database connection.
