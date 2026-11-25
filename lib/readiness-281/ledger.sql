-- Proposed read-only receipt input; never executed by this package.
-- PostgreSQL statements-array::text MD5 is distinct from migration-file SHA256.
select jsonb_agg(jsonb_build_object('version',version,'name',name,'statements_md5',md5(statements::text))order by version)
from supabase_migrations.schema_migrations;
