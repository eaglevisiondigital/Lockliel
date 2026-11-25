"""Bounded fixture SQL inventory. No import-time I/O or executable live entry.

Concrete query/driver primitive only; receipts are data, never authority. The
source-pinned operator must own the connection, grant, private channel and fresh
provider identity. CLI always denies. No secret or row content is fingerprinted.
"""
import hashlib
import json
import re
import time
import types
from pathlib import Path

PROJECT='qjksggxorghaxvpyslip'
BRANCH='course-cutover-rehearsal-274'
BRANCH_ID='7091bfd6-83ce-4c11-ac30-8ce85e09be2d'
NATIVE_SHA='c367e660e07d42286ec1be321fd65593a82aa2ad85bd883383b677cd139e75db'
TABLES=tuple('audit_events benefit_rules checkout_sessions communication_preference_events communication_preferences connection_requests contact_permissions conversation_members conversations course_enrollments courses entitlements faith_profiles feature_flags follow_up_tasks founder_orientation_progress founder_orientation_steps founders50_applications founders50_reviews gifts group_members group_weekly_checkins groups launch_verifications lead_contacts lead_sources leader_assignments leader_profiles lesson_assets lesson_private_notes lesson_progress lessons media_progress member_journey member_staff_notes messages notifications order_fulfillment_events order_items order_shipping_addresses orders partner_checkout_state partner_commitments payment_events payment_provider_connections privacy_requests products profile_connection_cards profile_finance_cards profile_tags profiles reach_contacts referral_events referral_links share_assets staff_roles tags'.split())
OWNED={'profiles':'id','member_journey':'profile_id','profile_tags':'profile_id','referral_links':'owner_id','communication_preferences':'profile_id','profile_connection_cards':'profile_id','profile_finance_cards':'profile_id'}
COLLISION=(('auth.users','email','id'),('public.profiles','email','id'),('public.profile_finance_cards','email','profile_id'),('public.lead_contacts','email',None),('public.founders50_applications','email',None),('public.gifts','donor_email',None),('public.partner_commitments','donor_email',None),('public.orders','customer_email',None),('public.checkout_sessions','contact_email',None))
PRIVATE_TABLES=('account_deletion_targets','course_answer_keys','public_rate_limits')
LIMITATIONS=('physical_tuple_fingerprints_can_fail_on_maintenance','managed_auth_audit_and_internal_hooks_require_fresh_provider_review','branch_identity_requires_separate_fresh_provider_proof','native_receipt_data_is_not_authority','local_replay_is_not_hosted_equivalence')
class Denied(Exception):
    def __init__(self): super().__init__('FIXTURE_NATIVE_DENIED')
def need(x):
    if not x: raise Denied()
def digest(v): return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
def hex64(v): return type(v) is str and re.fullmatch('[0-9a-f]{64}',v) is not None
def pair(values):
    need(type(values) is list and len(values)==2 and all(hex64(x) for x in values) and values[0]!=values[1]);return tuple(values)
def sql_hash(expression,prefix): return "pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to('"+prefix+"'||("+expression+"),'UTF8')),'hex')"
def literals(values): return ','.join("'"+v+"'" for v in values)
def subject_match(column,subjects):
    return 'false' if not subjects else sql_hash(column+'::text','lockliel:qjks:auth:')+' in ('+literals(subjects)+')'
def _load_native():
    p=Path(__file__).resolve().parents[1]/'member-hosted/deployment_database_preflight.py';need(not p.is_symlink() and p.is_file());raw=p.read_bytes();need(hashlib.sha256(raw).hexdigest()==NATIVE_SHA)
    mod=types.ModuleType('_fixture_pinned_native');mod.__file__=str(p);exec(compile(raw,str(p),'exec'),mod.__dict__);return mod

GRAPH_SQL="""select pg_catalog.json_build_object('publicTables',(select coalesce(json_agg(c.relname order by c.relname),'[]'::json) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p')),'privateTables',(select coalesce(json_agg(c.relname order by c.relname),'[]'::json) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='app_private' and c.relkind in ('r','p')),'graphSha256',pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to((select coalesce(jsonb_agg(v order by v::text),'[]'::jsonb)::text from (select jsonb_build_object('schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),'owner',pg_get_userbyid(p.proowner),'acl',p.proacl,'config',p.proconfig,'definition',pg_get_functiondef(p.oid)) v from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','app_private','lockliel_cutover') and p.prokind='f' union all select jsonb_build_object('schema',n.nspname,'table',c.relname,'name',t.tgname,'enabled',t.tgenabled,'definition',pg_get_triggerdef(t.oid)) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('auth','public','app_private','lockliel_cutover') and not t.tgisinternal) s),'UTF8')),'hex'));"""

DEFAULTS={
 'profiles':({'city':None,'phone':None,'locale':'en-US','region':None,'country':'United States','timezone':None,'last_name':None,'first_name':None,'current_leader_id':None,'onboarding_status':'new','original_inviter_id':None},['id','email','created_at','updated_at']),
 'member_journey':({'next_step_path':'/my-lockliel/profile','next_step_type':'onboarding','next_step_title':'Complete your Lockliel profile','reach_one_count':0,'last_faith_boost_at':None,'active_connections_count':0},['profile_id','updated_at']),
 'profile_tags':({'source':'signup'},['profile_id','tag_id','created_at']),
 'referral_links':({'active':True,'campaign':'member-invite','content_id':None,'content_type':'invitation','destination_path':'/my-lockliel/sign-up','reach_contact_id':None},['id','owner_id','code','created_at']),
 'communication_preferences':({'sms_updates':False,'partner_email':False,'ministry_email':False,'sms_consent_at':None,'email_consent_at':None,'faith_boost_email':False,'book_release_email':False},['profile_id','updated_at']),
 'profile_connection_cards':({'city':None,'region':None,'country':'United States','first_name':None,'last_initial':None,'language_code':'en'},['profile_id','updated_at']),
 'profile_finance_cards':({'city':None,'region':None,'country':'United States','display_name':''},['profile_id','email','updated_at'])
}
def json_literal(value):return "'"+json.dumps(value,sort_keys=True,separators=(',',':')).replace("'","''")+"'::jsonb"
def bootstrap_query(subjects,logins):
    if not subjects:return "select '[]'::json;"
    parts=[]
    for i,sid in enumerate(subjects):
        label=('A','B')[i]
        for table,owner in OWNED.items():
            defaults,ignored=DEFAULTS[table]
            valid="(to_jsonb(t)-array["+literals(ignored)+"])= "+json_literal(defaults)
            if table in ('profiles','profile_finance_cards'):valid+=' and '+sql_hash('lower(btrim(t.email))','lockliel:qjks:login:')+"='"+logins[i]+"'"
            if table=='profile_tags':valid+=" and exists(select 1 from public.tags tag where tag.id=t.tag_id and tag.slug='direct-website')"
            if table=='referral_links':valid+=" and t.code ~ '^[0-9a-f]{10}$'"
            parts.append("select '"+label+"' label,'"+table+"' name,count(*) count,count(*) filter(where "+valid+") valid from public."+table+' t where '+subject_match('t.'+owner,[sid]))
        identity_valid="t.provider='email' and t.provider_id=t.user_id::text and t.identity_data->>'sub'=t.user_id::text and "+sql_hash("lower(btrim(t.identity_data->>'email'))",'lockliel:qjks:login:')+"='"+logins[i]+"'"
        parts.append("select '"+label+"','auth_identity',count(*),count(*) filter(where "+identity_valid+") from auth.identities t where "+subject_match('t.user_id',[sid]))
        valid="u.raw_user_meta_data="+json_literal({'full_name':'Synthetic User '+label,'email_verified':True})+" and u.deleted_at is null and u.banned_until is null and u.phone='' and u.is_anonymous=false"
        parts.append("select '"+label+"','auth_metadata',count(*),count(*) filter(where "+valid+") from auth.users u where "+subject_match('u.id',[sid]))
    return "select coalesce(json_agg(json_build_object('label',label,'table',name,'count',count,'validCount',valid) order by label,name),'[]') from ("+' union all '.join(parts)+') s;'

def plan(stage,login_digests,subject_digests=None):
    need(stage in ('before','after'));logins=pair(login_digests)
    if stage=='before':need(subject_digests is None);subjects=()
    else:subjects=pair(subject_digests)
    collisions=[]
    for table,col,owner in COLLISION:
        login=sql_hash('lower(btrim(t.'+col+'))','lockliel:qjks:login:')
        exclude=' and not ('+subject_match('t.'+owner,subjects)+')' if owner else ''
        collisions.append('(select count(*) from '+table+' t where '+login+' in ('+literals(logins)+')'+exclude+')')
    collision_sql='select pg_catalog.json_build_object(\'collisionCount\','+'+'.join(collisions)+');'
    state=[]
    for table in TABLES:
        condition='not ('+subject_match('t.'+OWNED[table],subjects)+')' if table in OWNED else 'true'
        state.append("select 'public."+table+"' as name,count(*) as count,coalesce(jsonb_agg(jsonb_build_array(t.ctid::text,t.xmin::text) order by t.ctid::text,t.xmin::text),'[]'::jsonb) as tuples from public."+table+' t where '+condition)
    for table in PRIVATE_TABLES:
        state.append("select 'app_private."+table+"',count(*),coalesce(jsonb_agg(jsonb_build_array(t.ctid::text,t.xmin::text) order by t.ctid::text,t.xmin::text),'[]'::jsonb) from app_private."+table+' t')
    for qualified in ['lockliel_cutover.control','storage.buckets','storage.objects']:
        state.append("select '"+qualified+"',count(*),coalesce(jsonb_agg(jsonb_build_array(t.ctid::text,t.xmin::text) order by t.ctid::text,t.xmin::text),'[]'::jsonb) from "+qualified+' t')
    for table,owner in [('users','id'),('identities','user_id'),('sessions',None),('mfa_factors',None),('refresh_tokens',None),('one_time_tokens',None)]:
        condition='not ('+subject_match('t.'+owner,subjects)+')' if owner else 'true'
        state.append("select 'auth."+table+"',count(*),coalesce(jsonb_agg(jsonb_build_array(t.ctid::text,t.xmin::text) order by t.ctid::text,t.xmin::text),'[]'::jsonb) from auth."+table+' t where '+condition)
    state_sql="select pg_catalog.json_build_object('protectedStateSha256',pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(coalesce(jsonb_agg(jsonb_build_object('name',name,'count',count,'tuples',tuples) order by name),'[]'::jsonb)::text,'UTF8')),'hex')) from ("+' union all '.join(state)+') s;'
    bootstrap_sql=bootstrap_query(subjects,logins)
    field=lambda col,prefix:sql_hash(col,prefix)
    subject_sql="select coalesce(json_agg(json_build_object("+','.join([
        "'subjectSha256',"+field('u.id::text','lockliel:qjks:auth:'),"'profileSha256',"+field('u.id::text','lockliel:qjks:profile:'),
        "'createdAtSha256',"+field("to_char(u.created_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"')",'lockliel:qjks:created:'),
        "'loginSha256',"+field('lower(btrim(u.email))','lockliel:qjks:login:'),
        "'profileCount',(select count(*) from public.profiles p where p.id=u.id)","'confirmed',u.email_confirmed_at is not null",
        "'staffRoleCount',(select count(*) from public.staff_roles s where s.profile_id=u.id)","'factorCount',(select count(*) from auth.mfa_factors f where f.user_id=u.id)","'sessionCount',(select count(*) from auth.sessions s where s.user_id=u.id)",
        "'enrollmentCount',(select count(*) from public.course_enrollments x where x.profile_id=u.id)","'progressCount',(select count(*) from public.lesson_progress x where x.profile_id=u.id)+(select count(*) from public.media_progress x where x.profile_id=u.id)","'noteCount',(select count(*) from public.lesson_private_notes x where x.profile_id=u.id)",
        "'unexpectedClaimCount',case when u.role='authenticated' and u.aud='authenticated' and u.raw_app_meta_data='{\"provider\":\"email\",\"providers\":[\"email\"]}'::jsonb then 0 else 1 end"
    ])+") order by u.id),'[]'::json) from auth.users u where "+subject_match('u.id',subjects)+';'
    return (('triggerGraph',GRAPH_SQL),('collisions',collision_sql),('protectedState',state_sql),('bootstrap',bootstrap_sql),('subjects',subject_sql))

def validate_extra(rows,stage,logins,subjects,expected_graph,before=None):
    need(type(rows) is dict and set(rows)=={'triggerGraph','collisions','protectedState','bootstrap','subjects'} and hex64(expected_graph))
    graph=rows['triggerGraph'];need(type(graph) is dict and set(graph)=={'publicTables','privateTables','graphSha256'} and graph['publicTables']==list(TABLES) and graph['privateTables']==list(PRIVATE_TABLES) and graph['graphSha256']==expected_graph)
    need(type(rows['collisions']) is dict and set(rows['collisions'])=={'collisionCount'} and type(rows['collisions']['collisionCount']) is int and rows['collisions']['collisionCount']==0)
    state=rows['protectedState'];need(type(state) is dict and set(state)=={'protectedStateSha256'} and hex64(state['protectedStateSha256']))
    bs=rows['bootstrap'];need(type(bs) is list)
    expected=[] if stage=='before' else [dict(label=label,table=k,count=1,validCount=1) for label in ('A','B') for k in sorted((*OWNED,'auth_identity','auth_metadata'))]
    need(bs==expected and all(type(x['count']) is int and type(x['validCount']) is int for x in bs))
    found=rows['subjects'];need(type(found) is list and len(found)==(0 if stage=='before' else 2))
    out=[]
    if stage=='after':
        need(type(before) is dict and before.get('protectedStateSha256')==state['protectedStateSha256'])
        fields=('subjectSha256','profileSha256','createdAtSha256','loginSha256');counts=('profileCount','staffRoleCount','factorCount','sessionCount','enrollmentCount','progressCount','noteCount','unexpectedClaimCount')
        for i,sid in enumerate(subjects):
            matches=[x for x in found if type(x) is dict and x.get('subjectSha256')==sid];need(len(matches)==1);row=matches[0];need(set(row)==set(fields+counts+('confirmed',)))
            need(all(hex64(row[k]) for k in fields) and row['loginSha256']==logins[i] and row['confirmed'] is True)
            need(all(type(row[k]) is int and row[k]==(1 if k=='profileCount' else 0) for k in counts));out.append({'label':('A','B')[i],**row})
        for k in fields:need(out[0][k]!=out[1][k])
    return {'collisionCount':0,**state,'triggerGraphSha256':expected_graph,'unexpectedWriteCount':0,'subjects':out}

def inspect_owned(driver,stage,logins,subjects,expected_graph,before=None):
    """Same-physical-transaction fixed inspection. Injectable driver is offline
    plumbing, not authority. Future live caller must supply reviewed native driver.
    Always owns and closes driver even when setup/validation fails."""
    result=None;native=None;started=time.time_ns()//1000000
    try:
        queries=plan(stage,logins,subjects);need(hex64(expected_graph));native=_load_native();guard=native.load_guard();baseline=native.load_baseline()
        initial=driver.identity();conn=guard.validate_native(initial);guard.require(initial.get('transaction_status')==0,'CONNECTION_NOT_IDLE');driver.command('BEGIN READ ONLY')
        def witness(anchor=None):
            guard.require(guard.validate_native(driver.identity())==conn and driver.transaction_status()==2,'CONNECTION_REPLACED');row=driver.select(guard.GUARD_SQL);current=guard.validate_witness(row,conn[2]);guard.require(guard.validate_native(driver.identity())==conn and driver.transaction_status()==2,'CONNECTION_REPLACED');guard.require(anchor is None or anchor==current,'TRANSACTION_REPLACED');return current
        anchor=witness();base_rows={};extra={}
        for name,sql in native.inspections(baseline,guard)+queries:
            witness(anchor);value=driver.select(sql);witness(anchor)
            if name in dict(queries):extra[name]=value
            else:base_rows[name]=value
            if name=='catalog':need(native.digest(native.catalog_canonical(value))==baseline['catalogSha256'])
            if name=='rpcs':native.validate_rpc_rows(value,baseline)
        native.validate_inventory(base_rows,baseline);need(base_rows['synthetic']['totalSessions']==0)
        verified=validate_extra(extra,stage,pair(logins),() if subjects is None else pair(subjects),expected_graph,before)
        result={'schema':'lockliel-fixture-native-v1','phase':stage,'project':PROJECT,'branch':BRANCH,'branchId':BRANCH_ID,'startedAt':started,'ledger':280,'paused':True,'schemaReady':True,'protocol':'278-v1',**verified}
    except BaseException:
        raise Denied() from None
    finally:
        try:
            if driver.connected() and driver.transaction_status() in (2,3):
                driver.command('ROLLBACK');need(driver.transaction_status()==0)
        except BaseException:
            result=None
        finally:
            try:
                driver.close();need(not driver.connected())
            except BaseException:
                result=None
    need(result is not None)
    try:
        ended=time.time_ns()//1000000;need(started<=ended and ended-started<=300000)
    except BaseException:
        raise Denied() from None
    result.update(observedAt=ended,safeguards={'directIPv6':True,'tlsVerifyFull':True,'hostnameVerified':True,'transactionReadOnly':'on','lockTimeout':'5s','statementTimeout':'30s','sameConnectionAndTransaction':True,'rolledBack':True,'connectionClosed':True})
    return {'receipt':result,'authority':False,'limitations':list(LIMITATIONS)}

def create_fixed_driver(ca,password,stage,logins,subjects):
    """Construct only the source-pinned direct transport. Future authorized worker
    owns this connection; no arbitrary SQL/callback/endpoint override exists."""
    queries=plan(stage,logins,subjects);native=_load_native();guard=native.load_guard();baseline=native.load_baseline()
    allowed=frozenset([guard.GUARD_SQL]+[sql for _,sql in native.inspections(baseline,guard)+queries])
    class FixedFixtureDriver(guard.DirectLibpq):
        def select(self,sql):
            guard.require(type(sql) is str and sql in allowed and self.transaction_status()==2,'UNGUARDED_QUERY_DENIED')
            result=self._exec(sql,2)
            try:
                guard.require(self.lib.PQntuples(result)==1 and self.lib.PQnfields(result)==1 and not self.lib.PQgetisnull(result,0,0),'QUERY_SHAPE_DENIED')
                guard.require(self.lib.PQgetlength(result,0,0)<=1048576,'QUERY_RESULT_TOO_LARGE')
                return json.loads(self.lib.PQgetvalue(result,0,0).decode('utf-8'))
            except BaseException:
                raise Denied() from None
            finally:self.lib.PQclear(result)
    need(type(password) is bytearray and 0<len(password)<=4096)
    decoded=None
    try:
        # Pinned libpq constructor accepts str and erases its native buffers.
        # Python immutable str copies cannot be promised physical zeroization;
        # keep this sole conversion short-lived and discard after construction.
        decoded=password.decode('utf-8','strict')
        return FixedFixtureDriver(ca,decoded)
    except BaseException:
        raise Denied() from None
    finally:
        decoded=None

if __name__=='__main__':
    print('{"ok":false,"errorCode":"FIXTURE_NATIVE_EXECUTION_NOT_AUTHORIZED"}')
    raise SystemExit(1)
