-- READ ONLY. No migration statement bodies or member data are returned.
begin read only;
select jsonb_agg(jsonb_build_object(
  'version',version,'name',name,'statements_md5',md5(array_to_string(statements,E'\n'))
) order by version) as ledger
from supabase_migrations.schema_migrations;
commit;
