-- PREPARED ONLY; do not execute without a fresh exact disposable-fixture grant.
-- Run in the same verified read-only/5s/30s transaction as the full catalog.
select jsonb_agg(jsonb_build_object(
 'name',con.conname,
 'sourceSchema',src_ns.nspname,'sourceTable',src.relname,'sourceOwner',pg_get_userbyid(src.relowner),
 'targetSchema',dst_ns.nspname,'targetTable',dst.relname,'targetOwner',pg_get_userbyid(dst.relowner),
 'sourceColumns',(select jsonb_agg(a.attname order by k.ordinality)from unnest(con.conkey)with ordinality k(attnum,ordinality)join pg_attribute a on a.attrelid=con.conrelid and a.attnum=k.attnum),
 'targetColumns',(select jsonb_agg(a.attname order by k.ordinality)from unnest(con.confkey)with ordinality k(attnum,ordinality)join pg_attribute a on a.attrelid=con.confrelid and a.attnum=k.attnum),
 'matchType',con.confmatchtype,'updateAction',con.confupdtype,'deleteAction',con.confdeltype,
 'deferrable',con.condeferrable,'initiallyDeferred',con.condeferred,'validated',con.convalidated,
 'sourceRls',src.relrowsecurity,'sourceForceRls',src.relforcerowsecurity
)order by con.conname)
from pg_constraint con
join pg_class src on src.oid=con.conrelid join pg_namespace src_ns on src_ns.oid=src.relnamespace
join pg_class dst on dst.oid=con.confrelid join pg_namespace dst_ns on dst_ns.oid=dst.relnamespace
where con.contype='f' and con.conrelid='public.reach_contacts'::regclass;
