-- Reconstructed 2026-09-26 from the live catalog, NOT recovered original SQL.
-- Ordering version 20260925035350 is assigned for dependency replay only.
-- See DECISIONS.md and docs/migration-reconciliation.md before any existing-env use.
-- All original migration bodies remain unchanged. No seed/member data is copied.
-- Matching completed environments: read-only validation and no DDL/DML.
-- Conflicting/partial existing objects: abort; never guess or overwrite them.
do $bridge$
declare
  present_columns integer;
  actual_schema jsonb;
begin
  select count(*) into present_columns
  from information_schema.columns
  where table_schema='public' and table_name='share_assets'
    and column_name in ('share_text','category','preview_image_path','sort_order','featured','updated_at');

  if to_regclass('public.founders50_reviews') is not null or present_columns<>0 then
    if to_regclass('public.founders50_reviews') is null or present_columns<>6 then
      raise exception 'Reconciliation refused: partial review/share schema requires explicit review.';
    end if;
select jsonb_build_object(
'columns',(select jsonb_agg(jsonb_build_object('table',c.table_name,'column',c.column_name,'type',c.udt_name,'nullable',c.is_nullable,'default',c.column_default) order by c.table_name,c.ordinal_position) from information_schema.columns c where c.table_schema='public' and c.table_name in ('founders50_reviews','share_assets')),
'constraints',(select jsonb_agg(jsonb_build_object('table',r.relname,'name',c.conname,'definition',pg_get_constraintdef(c.oid),'validated',c.convalidated) order by r.relname,c.conname) from pg_constraint c join pg_class r on r.oid=c.conrelid where c.conrelid in ('public.founders50_reviews'::regclass,'public.share_assets'::regclass)),
'indexes',(select jsonb_agg(jsonb_build_object('table',tablename,'name',indexname,'definition',indexdef) order by tablename,indexname) from pg_indexes where schemaname='public' and tablename in ('founders50_reviews','share_assets')),
'policies',(select jsonb_agg(jsonb_build_object('table',tablename,'name',policyname,'permissive',permissive,'roles',roles,'cmd',cmd,'qual',qual,'check',with_check) order by tablename,policyname) from pg_policies where schemaname='public' and tablename in ('founders50_reviews','share_assets')),
'triggers',(select jsonb_agg(jsonb_build_object('table',r.relname,'name',t.tgname,'enabled',t.tgenabled,'definition',pg_get_triggerdef(t.oid)) order by r.relname,t.tgname) from pg_trigger t join pg_class r on r.oid=t.tgrelid where not t.tgisinternal and t.tgrelid in ('public.founders50_reviews'::regclass,'public.share_assets'::regclass)),
'rls',(select jsonb_agg(jsonb_build_object('table',relname,'rls',relrowsecurity,'force',relforcerowsecurity) order by relname) from pg_class where oid in ('public.founders50_reviews'::regclass,'public.share_assets'::regclass)),
'grants',(select jsonb_agg(jsonb_build_object('table',table_name,'role',grantee,'privilege',privilege_type,'grantable',is_grantable) order by table_name,grantee,privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name in ('founders50_reviews','share_assets') and grantee in ('anon','authenticated','service_role')),
'column_grants',(select jsonb_agg(jsonb_build_object('table',table_name,'column',column_name,'role',grantee,'privilege',privilege_type) order by table_name,column_name,grantee,privilege_type) from information_schema.role_column_grants where table_schema='public' and table_name in ('founders50_reviews','share_assets') and grantee in ('anon','authenticated','service_role'))
) into actual_schema;
    if actual_schema is distinct from $expected${
  "rls": [
    {"rls":true,"force":false,"table":"founders50_reviews"},
    {"rls":true,"force":false,"table":"share_assets"}
  ],
  "grants": [
    {"role":"authenticated","table":"founders50_reviews","grantable":"NO","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","grantable":"NO","privilege":"DELETE"},
    {"role":"service_role","table":"founders50_reviews","grantable":"NO","privilege":"INSERT"},
    {"role":"service_role","table":"founders50_reviews","grantable":"NO","privilege":"REFERENCES"},
    {"role":"service_role","table":"founders50_reviews","grantable":"NO","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","grantable":"NO","privilege":"TRIGGER"},
    {"role":"service_role","table":"founders50_reviews","grantable":"NO","privilege":"TRUNCATE"},
    {"role":"service_role","table":"founders50_reviews","grantable":"NO","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","grantable":"NO","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","grantable":"NO","privilege":"DELETE"},
    {"role":"service_role","table":"share_assets","grantable":"NO","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","grantable":"NO","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","grantable":"NO","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","grantable":"NO","privilege":"TRIGGER"},
    {"role":"service_role","table":"share_assets","grantable":"NO","privilege":"TRUNCATE"},
    {"role":"service_role","table":"share_assets","grantable":"NO","privilege":"UPDATE"}
  ],
  "columns": [
    {"type":"uuid","table":"founders50_reviews","column":"id","default":"gen_random_uuid()","nullable":"NO"},
    {"type":"uuid","table":"founders50_reviews","column":"application_id","default":null,"nullable":"NO"},
    {"type":"uuid","table":"founders50_reviews","column":"reviewer_id","default":null,"nullable":"YES"},
    {"type":"text","table":"founders50_reviews","column":"decision","default":null,"nullable":"NO"},
    {"type":"text","table":"founders50_reviews","column":"rationale","default":null,"nullable":"YES"},
    {"type":"timestamptz","table":"founders50_reviews","column":"created_at","default":"now()","nullable":"NO"},
    {"type":"uuid","table":"share_assets","column":"id","default":"gen_random_uuid()","nullable":"NO"},
    {"type":"text","table":"share_assets","column":"slug","default":null,"nullable":"NO"},
    {"type":"text","table":"share_assets","column":"title","default":null,"nullable":"NO"},
    {"type":"text","table":"share_assets","column":"asset_type","default":null,"nullable":"NO"},
    {"type":"text","table":"share_assets","column":"description","default":null,"nullable":"YES"},
    {"type":"text","table":"share_assets","column":"destination_path","default":null,"nullable":"NO"},
    {"type":"text","table":"share_assets","column":"status","default":"'draft'::text","nullable":"NO"},
    {"type":"timestamptz","table":"share_assets","column":"created_at","default":"now()","nullable":"NO"},
    {"type":"text","table":"share_assets","column":"share_text","default":null,"nullable":"YES"},
    {"type":"text","table":"share_assets","column":"category","default":null,"nullable":"YES"},
    {"type":"text","table":"share_assets","column":"preview_image_path","default":null,"nullable":"YES"},
    {"type":"int4","table":"share_assets","column":"sort_order","default":"100","nullable":"NO"},
    {"type":"bool","table":"share_assets","column":"featured","default":"false","nullable":"NO"},
    {"type":"timestamptz","table":"share_assets","column":"updated_at","default":"now()","nullable":"NO"},
    {"type":"text","table":"share_assets","column":"language_code","default":"'en'::text","nullable":"NO"},
    {"type":"text","table":"share_assets","column":"translation_key","default":null,"nullable":"NO"}
  ],
  "indexes": [
    {"name":"founders50_reviews_application_idx","table":"founders50_reviews","definition":"CREATE INDEX founders50_reviews_application_idx ON public.founders50_reviews USING btree (application_id, created_at DESC)"},
    {"name":"founders50_reviews_pkey","table":"founders50_reviews","definition":"CREATE UNIQUE INDEX founders50_reviews_pkey ON public.founders50_reviews USING btree (id)"},
    {"name":"founders50_reviews_reviewer_idx","table":"founders50_reviews","definition":"CREATE INDEX founders50_reviews_reviewer_idx ON public.founders50_reviews USING btree (reviewer_id, created_at DESC)"},
    {"name":"share_assets_pkey","table":"share_assets","definition":"CREATE UNIQUE INDEX share_assets_pkey ON public.share_assets USING btree (id)"},
    {"name":"share_assets_slug_key","table":"share_assets","definition":"CREATE UNIQUE INDEX share_assets_slug_key ON public.share_assets USING btree (slug)"},
    {"name":"share_assets_status_sort_idx","table":"share_assets","definition":"CREATE INDEX share_assets_status_sort_idx ON public.share_assets USING btree (status, featured DESC, sort_order, title)"},
    {"name":"share_assets_translation_idx","table":"share_assets","definition":"CREATE INDEX share_assets_translation_idx ON public.share_assets USING btree (translation_key, language_code, status)"},
    {"name":"share_assets_translation_language_unique","table":"share_assets","definition":"CREATE UNIQUE INDEX share_assets_translation_language_unique ON public.share_assets USING btree (translation_key, language_code)"}
  ],
  "policies": [
    {"cmd":"INSERT","name":"founders50_reviews_staff_insert","qual":null,"check":"((reviewer_id = ( SELECT auth.uid() AS uid)) AND app_private.has_staff_role(ARRAY['super_admin'::text, 'admin'::text, 'founders50_reviewer'::text]))","roles":["authenticated"],"table":"founders50_reviews","permissive":"PERMISSIVE"},
    {"cmd":"SELECT","name":"founders50_reviews_staff_read","qual":"app_private.has_staff_role(ARRAY['super_admin'::text, 'admin'::text, 'founders50_reviewer'::text])","check":null,"roles":["authenticated"],"table":"founders50_reviews","permissive":"PERMISSIVE"},
    {"cmd":"SELECT","name":"share_assets_member_read","qual":"(status = 'active'::text)","check":null,"roles":["authenticated"],"table":"share_assets","permissive":"PERMISSIVE"},
    {"cmd":"INSERT","name":"share_assets_staff_insert","qual":null,"check":"app_private.has_staff_role(ARRAY['super_admin'::text, 'admin'::text, 'content_admin'::text])","roles":["authenticated"],"table":"share_assets","permissive":"PERMISSIVE"},
    {"cmd":"UPDATE","name":"share_assets_staff_update","qual":"app_private.has_staff_role(ARRAY['super_admin'::text, 'admin'::text, 'content_admin'::text])","check":"app_private.has_staff_role(ARRAY['super_admin'::text, 'admin'::text, 'content_admin'::text])","roles":["authenticated"],"table":"share_assets","permissive":"PERMISSIVE"}
  ],
  "triggers": [
    {"name":"apply_founders50_review_decision_trigger","table":"founders50_reviews","enabled":"O","definition":"CREATE TRIGGER apply_founders50_review_decision_trigger AFTER INSERT ON public.founders50_reviews FOR EACH ROW EXECUTE FUNCTION app_private.apply_founders50_review_decision()"},
    {"name":"default_share_translation_key_trigger","table":"share_assets","enabled":"O","definition":"CREATE TRIGGER default_share_translation_key_trigger BEFORE INSERT OR UPDATE OF slug, translation_key ON public.share_assets FOR EACH ROW EXECUTE FUNCTION app_private.default_translation_key_from_slug()"},
    {"name":"normalize_share_asset_trigger","table":"share_assets","enabled":"O","definition":"CREATE TRIGGER normalize_share_asset_trigger BEFORE INSERT OR UPDATE ON public.share_assets FOR EACH ROW EXECUTE FUNCTION app_private.normalize_share_asset()"},
    {"name":"validate_share_asset_translation_family_trigger","table":"share_assets","enabled":"O","definition":"CREATE TRIGGER validate_share_asset_translation_family_trigger BEFORE INSERT OR UPDATE OF translation_key, asset_type ON public.share_assets FOR EACH ROW EXECUTE FUNCTION app_private.validate_share_asset_translation_family()"}
  ],
  "constraints": [
    {"name":"founders50_reviews_application_id_fkey","table":"founders50_reviews","validated":true,"definition":"FOREIGN KEY (application_id) REFERENCES founders50_applications(id) ON DELETE CASCADE"},
    {"name":"founders50_reviews_decision_check","table":"founders50_reviews","validated":true,"definition":"CHECK ((decision = ANY (ARRAY['note'::text, 'needs_info'::text, 'accept'::text, 'decline'::text, 'pause'::text, 'activate_host'::text])))"},
    {"name":"founders50_reviews_decision_rationale","table":"founders50_reviews","validated":true,"definition":"CHECK (((decision = 'note'::text) OR (char_length(TRIM(BOTH FROM COALESCE(rationale, ''::text))) >= 20)))"},
    {"name":"founders50_reviews_pkey","table":"founders50_reviews","validated":true,"definition":"PRIMARY KEY (id)"},
    {"name":"founders50_reviews_rationale_length","table":"founders50_reviews","validated":true,"definition":"CHECK (((rationale IS NULL) OR (char_length(rationale) <= 5000)))"},
    {"name":"founders50_reviews_reviewer_id_fkey","table":"founders50_reviews","validated":true,"definition":"FOREIGN KEY (reviewer_id) REFERENCES profiles(id) ON DELETE SET NULL"},
    {"name":"share_assets_asset_type_check","table":"share_assets","validated":true,"definition":"CHECK ((asset_type = ANY (ARRAY['faith_boost'::text, 'graphic'::text, 'book'::text, 'course'::text, 'invitation'::text])))"},
    {"name":"share_assets_category_length","table":"share_assets","validated":true,"definition":"CHECK (((category IS NULL) OR (char_length(category) <= 120)))"},
    {"name":"share_assets_description_length","table":"share_assets","validated":true,"definition":"CHECK (((description IS NULL) OR (char_length(description) <= 1000)))"},
    {"name":"share_assets_destination_local_path","table":"share_assets","validated":true,"definition":"CHECK (((char_length(destination_path) >= 1) AND (char_length(destination_path) <= 500) AND (\"left\"(destination_path, 1) = '/'::text) AND (\"left\"(destination_path, 2) <> '//'::text)))"},
    {"name":"share_assets_destination_path_check","table":"share_assets","validated":true,"definition":"CHECK ((((char_length(destination_path) >= 1) AND (char_length(destination_path) <= 500)) AND (\"left\"(destination_path, 1) = '/'::text)))"},
    {"name":"share_assets_language_code_length","table":"share_assets","validated":true,"definition":"CHECK (((char_length(language_code) >= 2) AND (char_length(language_code) <= 12)))"},
    {"name":"share_assets_pkey","table":"share_assets","validated":true,"definition":"PRIMARY KEY (id)"},
    {"name":"share_assets_preview_path_length","table":"share_assets","validated":true,"definition":"CHECK (((preview_image_path IS NULL) OR (char_length(preview_image_path) <= 500)))"},
    {"name":"share_assets_share_text_length","table":"share_assets","validated":true,"definition":"CHECK (((share_text IS NULL) OR (char_length(share_text) <= 1200)))"},
    {"name":"share_assets_slug_format","table":"share_assets","validated":true,"definition":"CHECK (((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text) AND (char_length(slug) <= 160)))"},
    {"name":"share_assets_slug_key","table":"share_assets","validated":true,"definition":"UNIQUE (slug)"},
    {"name":"share_assets_sort_order_nonnegative","table":"share_assets","validated":true,"definition":"CHECK ((sort_order >= 0))"},
    {"name":"share_assets_status_check","table":"share_assets","validated":true,"definition":"CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])))"},
    {"name":"share_assets_title_length","table":"share_assets","validated":true,"definition":"CHECK (((char_length(title) >= 1) AND (char_length(title) <= 300)))"},
    {"name":"share_assets_translation_key_length","table":"share_assets","validated":true,"definition":"CHECK (((char_length(translation_key) >= 1) AND (char_length(translation_key) <= 200)))"},
    {"name":"share_assets_translation_language_unique","table":"share_assets","validated":true,"definition":"UNIQUE (translation_key, language_code)"}
  ],
  "column_grants": [
    {"role":"authenticated","table":"founders50_reviews","column":"application_id","privilege":"INSERT"},
    {"role":"authenticated","table":"founders50_reviews","column":"application_id","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"application_id","privilege":"INSERT"},
    {"role":"service_role","table":"founders50_reviews","column":"application_id","privilege":"REFERENCES"},
    {"role":"service_role","table":"founders50_reviews","column":"application_id","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"application_id","privilege":"UPDATE"},
    {"role":"authenticated","table":"founders50_reviews","column":"created_at","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"created_at","privilege":"INSERT"},
    {"role":"service_role","table":"founders50_reviews","column":"created_at","privilege":"REFERENCES"},
    {"role":"service_role","table":"founders50_reviews","column":"created_at","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"created_at","privilege":"UPDATE"},
    {"role":"authenticated","table":"founders50_reviews","column":"decision","privilege":"INSERT"},
    {"role":"authenticated","table":"founders50_reviews","column":"decision","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"decision","privilege":"INSERT"},
    {"role":"service_role","table":"founders50_reviews","column":"decision","privilege":"REFERENCES"},
    {"role":"service_role","table":"founders50_reviews","column":"decision","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"decision","privilege":"UPDATE"},
    {"role":"authenticated","table":"founders50_reviews","column":"id","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"id","privilege":"INSERT"},
    {"role":"service_role","table":"founders50_reviews","column":"id","privilege":"REFERENCES"},
    {"role":"service_role","table":"founders50_reviews","column":"id","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"id","privilege":"UPDATE"},
    {"role":"authenticated","table":"founders50_reviews","column":"rationale","privilege":"INSERT"},
    {"role":"authenticated","table":"founders50_reviews","column":"rationale","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"rationale","privilege":"INSERT"},
    {"role":"service_role","table":"founders50_reviews","column":"rationale","privilege":"REFERENCES"},
    {"role":"service_role","table":"founders50_reviews","column":"rationale","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"rationale","privilege":"UPDATE"},
    {"role":"authenticated","table":"founders50_reviews","column":"reviewer_id","privilege":"INSERT"},
    {"role":"authenticated","table":"founders50_reviews","column":"reviewer_id","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"reviewer_id","privilege":"INSERT"},
    {"role":"service_role","table":"founders50_reviews","column":"reviewer_id","privilege":"REFERENCES"},
    {"role":"service_role","table":"founders50_reviews","column":"reviewer_id","privilege":"SELECT"},
    {"role":"service_role","table":"founders50_reviews","column":"reviewer_id","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"asset_type","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"asset_type","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"asset_type","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"asset_type","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"asset_type","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"asset_type","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"asset_type","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"category","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"category","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"category","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"category","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"category","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"category","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"category","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"created_at","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"created_at","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"created_at","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"created_at","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"created_at","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"description","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"description","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"description","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"description","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"description","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"description","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"description","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"destination_path","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"destination_path","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"destination_path","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"destination_path","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"destination_path","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"destination_path","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"destination_path","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"featured","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"featured","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"featured","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"featured","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"featured","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"featured","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"featured","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"id","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"id","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"id","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"id","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"id","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"language_code","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"language_code","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"language_code","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"language_code","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"language_code","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"language_code","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"language_code","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"preview_image_path","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"preview_image_path","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"preview_image_path","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"preview_image_path","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"preview_image_path","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"preview_image_path","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"preview_image_path","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"share_text","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"share_text","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"share_text","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"share_text","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"share_text","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"share_text","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"share_text","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"slug","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"slug","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"slug","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"slug","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"slug","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"slug","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"sort_order","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"sort_order","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"sort_order","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"sort_order","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"sort_order","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"sort_order","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"sort_order","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"status","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"status","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"status","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"status","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"status","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"status","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"status","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"title","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"title","privilege":"SELECT"},
    {"role":"authenticated","table":"share_assets","column":"title","privilege":"UPDATE"},
    {"role":"service_role","table":"share_assets","column":"title","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"title","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"title","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"title","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"translation_key","privilege":"INSERT"},
    {"role":"authenticated","table":"share_assets","column":"translation_key","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"translation_key","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"translation_key","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"translation_key","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"translation_key","privilege":"UPDATE"},
    {"role":"authenticated","table":"share_assets","column":"updated_at","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"updated_at","privilege":"INSERT"},
    {"role":"service_role","table":"share_assets","column":"updated_at","privilege":"REFERENCES"},
    {"role":"service_role","table":"share_assets","column":"updated_at","privilege":"SELECT"},
    {"role":"service_role","table":"share_assets","column":"updated_at","privilege":"UPDATE"}
  ]
}$expected$::jsonb then
      raise exception 'Reconciliation refused: existing review/share schema differs from verified catalog.';
    end if;
    return;
  end if;

  create table public.founders50_reviews (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.founders50_applications(id) on delete cascade,
    reviewer_id uuid references public.profiles(id) on delete set null,
    decision text not null,
    rationale text,
    created_at timestamptz not null default now()
  );
  alter table public.founders50_reviews enable row level security;
  revoke all on public.founders50_reviews from public, anon, authenticated;
  grant select on public.founders50_reviews to authenticated;
  grant insert (application_id,reviewer_id,decision,rationale) on public.founders50_reviews to authenticated;
  grant select, insert, update, delete, truncate, references, trigger on public.founders50_reviews to service_role;
  create index founders50_reviews_application_idx on public.founders50_reviews(application_id,created_at desc);
  create index founders50_reviews_reviewer_idx on public.founders50_reviews(reviewer_id,created_at desc);
  create policy founders50_reviews_staff_read on public.founders50_reviews for select to authenticated
    using (app_private.has_staff_role(array['super_admin','admin','founders50_reviewer']));
  create policy founders50_reviews_staff_insert on public.founders50_reviews for insert to authenticated
    with check (reviewer_id=(select auth.uid()) and app_private.has_staff_role(array['super_admin','admin','founders50_reviewer']));
  -- Attach the existing reviewed workflow body; the later immutable-workflow
  -- migration replaces this function with the same body and adds table checks.
  execute $ddl$create or replace function app_private.apply_founders50_review_decision()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  applicant_profile uuid;
  current_status text;
  required_count integer;
  complete_count integer;
begin
  if new.decision='activate_host' then
    select f.profile_id,f.status
      into applicant_profile,current_status
    from public.founders50_applications f
    where f.id=new.application_id;

    if applicant_profile is null then
      raise exception
        'Active-host approval requires a linked My Lockliel account.';
    end if;

    if current_status<>'orientation' then
      raise exception
        'Active-host approval requires the application to be in orientation.';
    end if;

    select count(*)::integer
      into required_count
    from public.founder_orientation_steps s
    where s.active=true
      and s.required=true;

    select count(*)::integer
      into complete_count
    from public.founder_orientation_progress p
    join public.founder_orientation_steps s
      on s.id=p.step_id
    where p.profile_id=applicant_profile
      and p.completed_at is not null
      and s.active=true
      and s.required=true;

    if required_count=0 or complete_count<required_count then
      raise exception
        'Active-host approval requires all required Founder orientation steps.';
    end if;

    update public.founders50_applications
    set status='active_host',
        updated_at=now()
    where id=new.application_id;

  elsif new.decision='accept' then
    update public.founders50_applications
    set status='accepted',
        updated_at=now()
    where id=new.application_id;

  elsif new.decision='decline' then
    update public.founders50_applications
    set status='declined',
        updated_at=now()
    where id=new.application_id;

  elsif new.decision='needs_info' then
    update public.founders50_applications
    set status='needs_info',
        updated_at=now()
    where id=new.application_id;

  elsif new.decision='pause' then
    update public.founders50_applications
    set status='paused',
        updated_at=now()
    where id=new.application_id;
  end if;

  insert into public.audit_events(
    actor_profile_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  values(
    new.reviewer_id,
    'founders50_review_recorded',
    'founders50_application',
    new.application_id::text,
    'Founders 50 review recorded',
    jsonb_build_object('decision',new.decision)
  );

  return new;
end;
$function$;

revoke execute on function app_private.apply_founders50_review_decision()
from public, anon, authenticated;
$ddl$;
  create trigger apply_founders50_review_decision_trigger after insert on public.founders50_reviews
    for each row execute function app_private.apply_founders50_review_decision();

  alter table public.share_assets
    add column share_text text,
    add column category text,
    add column preview_image_path text,
    add column sort_order integer not null default 100,
    add column featured boolean not null default false,
    add column updated_at timestamptz not null default now();
  alter table public.share_assets add constraint share_assets_status_check
    check (status in ('draft','active','archived'));
  create index share_assets_status_sort_idx on public.share_assets(status,featured desc,sort_order,title);
  create policy share_assets_staff_insert on public.share_assets for insert to authenticated
    with check (app_private.has_staff_role(array['super_admin','admin','content_admin']));
  create policy share_assets_staff_update on public.share_assets for update to authenticated
    using (app_private.has_staff_role(array['super_admin','admin','content_admin']))
    with check (app_private.has_staff_role(array['super_admin','admin','content_admin']));
end;
$bridge$;
