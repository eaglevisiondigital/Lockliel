# Public contract references — 2026-11-04

Public documentation only; no authenticated provider inspection. Existing source is the authority for current app behavior, not assumed current hosted state.

- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security . Preserve ownership predicates and update checks. No policies or grants are broadened by the proposed cap correction.
- PostgREST pagination: https://docs.postgrest.org/en/stable/references/api/pagination_count.html . Limit/range responses may contain fewer rows than requested. Exact counts have cost; a bounded page is not the full list or a total. Candidate must not claim snapshot consistency or whole-list completeness from a single page.
- Supabase changelog: https://supabase.com/changelog . Markdown endpoint could not be rendered by the browsing tool, so the public HTML index was reviewed. Recent TLS/Postgres operational notices do not authorize upgrades/settings changes and do not establish hosted readiness. No new Supabase SDK or API capability is assumed for this local correction.

No raw credentials, project configuration or member data was retrieved.
