-- Read-only security gate, separate from migration/canonical catalog identity.
-- Table/column privileges are additive. RLS does not restrict TRUNCATE.
with roles(role_name) as (values ('anon'),('authenticated'),('service_role')),
privileges(privilege_name) as (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),
 ('TRUNCATE'),('REFERENCES'),('TRIGGER'),('MAINTAIN')),
targets(table_name) as (values ('public.lesson_private_notes'),('app_private.course_answer_keys'))
select jsonb_build_object(
 'effective',(select jsonb_agg(jsonb_build_object('table',t.table_name,'role',r.role_name,
  'privilege',p.privilege_name,'allowed',has_table_privilege(r.role_name,t.table_name,p.privilege_name)
   or case when p.privilege_name in ('SELECT','INSERT','UPDATE','REFERENCES')
    then has_any_column_privilege(r.role_name,t.table_name,p.privilege_name) else false end)
  order by t.table_name,r.role_name,p.privilege_name) from targets t cross join roles r cross join privileges p),
 'public_grants',(select count(*) from (
   select x.grantee from pg_class c cross join lateral aclexplode(c.relacl) x
    where c.oid in ('public.lesson_private_notes'::regclass,'app_private.course_answer_keys'::regclass)
   union all
   select x.grantee from pg_attribute a cross join lateral aclexplode(a.attacl) x
    where a.attrelid in ('public.lesson_private_notes'::regclass,'app_private.course_answer_keys'::regclass)
  ) grants where grantee=0)
);
