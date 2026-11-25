"""Fixed full isolated database inventory, preparation only.

No import-time I/O, prompt, connection, executable grant, or live entry point.
The old J guard is source-pinned and never changed or rearmed. An inspection
receipt alone is data, not authority; only a separately reviewed pinned operator
may mint a fresh private Node handle from a future authorized native worker.
"""
import ctypes as C
import hashlib
import json
import re
from pathlib import Path
import time
import types

PROJECT = 'qjksggxorghaxvpyslip'
BRANCH = 'course-cutover-rehearsal-274'
HOST = 'db.' + PROJECT + '.supabase.co'
GUARD_SHA256 = 'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba'
BASELINE_SHA256 = '1b17b93a1c4d21d19cda04cd62c57785f276797c929fd5906c90b75ecf39e8ae'
VERSION = 'lockliel-deployment-native-preflight-v1'
MAX_RESULT_BYTES = 1048576
CODES = frozenset('SOURCE_MISMATCH BASELINE_MISMATCH BRANCH_IDENTITY_MISMATCH CATALOG_DRIFT LEDGER_DRIFT READINESS_MISMATCH SECURITY_BASELINE_MISMATCH PROJECTION_GRANTS_MISMATCH RPC_CATALOG_MISMATCH SYNTHETIC_IDENTITY_BASELINE_MISSING SYNTHETIC_PROVENANCE_MISMATCH QUERY_SHAPE_DENIED PREFLIGHT_CLOCK_INVALID NATIVE_EXECUTION_NOT_AUTHORIZED'.split())

class PreflightError(Exception):
    def __init__(self, code):
        self.code = code if code in CODES else 'BASELINE_MISMATCH'
        super().__init__(self.code)

def need(value, code):
    if not value:
        raise PreflightError(code)

def canonical(value):
    # Explicitly reject NaN and Infinity. Canonical contract is shared with Node.
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False).encode('utf-8')

def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()

def catalog_canonical(value):
    need(type(value) is dict and set(value) == {'ledger','tables','columns','policies','triggers','functions','constraints','column_grants','table_defaults','global_table_defaults'}, 'QUERY_SHAPE_DENIED')
    need(all(type(v) is list for v in value.values()), 'QUERY_SHAPE_DENIED')
    return {key: sorted(rows, key=canonical) for key, rows in value.items()}

def _read_pinned(path, expected):
    need(not path.is_symlink() and path.is_file(), 'SOURCE_MISMATCH')
    raw = path.read_bytes()
    need(hashlib.sha256(raw).hexdigest() == expected, 'SOURCE_MISMATCH')
    return raw

def load_guard():
    path = Path(__file__).resolve().with_name('database_preflight.py')
    raw = _read_pinned(path, GUARD_SHA256)
    module = types.ModuleType('_lockliel_pinned_deployment_guard')
    module.__file__ = str(path)
    exec(compile(raw, str(path), 'exec'), module.__dict__)
    return module

def load_baseline():
    root = Path(__file__).resolve().parents[2]
    data = json.loads(_read_pinned(Path(__file__).with_name('deployment-preflight-baseline.json'), BASELINE_SHA256))
    need(data['project'] == PROJECT and data['branch'] == BRANCH, 'BASELINE_MISMATCH')
    need(len(data['ledger']) == 280 and len({r['version'] for r in data['ledger']}) == 280, 'BASELINE_MISMATCH')
    need(digest([r['version'] for r in data['ledger']]) == data['versionsSha256'], 'BASELINE_MISMATCH')
    original = json.loads(_read_pinned(root / data['catalogSource'], data['catalogSourceSha256']))
    need(digest(catalog_canonical(original)) == data['catalogSha256'], 'BASELINE_MISMATCH')
    source = root / 'supabase/migrations/20261001211009_lockliel_current_trusted_duration_progression.sql'
    _read_pinned(source, data['migration280SourceSha256'])
    identity = json.loads(_read_pinned(Path(__file__).with_name('manual-branch-identity.json'), data['identitySha256']))
    rows = identity.get('isolatedBranch')
    need(identity.get('verified') is True and identity.get('isError') is False and identity.get('secretEndpointCalled') is False and type(rows) is list and len(rows) == 1, 'BRANCH_IDENTITY_MISMATCH')
    row = rows[0]
    need(row.get('project_ref') == PROJECT and row.get('name') == BRANCH and row.get('id') == data['branchId'] and row.get('is_default') is False, 'BRANCH_IDENTITY_MISMATCH')
    # This remains historical provider evidence, never a new provider observation.
    return data

PROJECTIONS = tuple(('profiles', x) for x in ('id','first_name','last_name','onboarding_status')) + tuple(('communication_preferences', x) for x in ('profile_id','ministry_email','faith_boost_email','book_release_email','partner_email','sms_updates','updated_at'))

READINESS_SQL = """select pg_catalog.json_build_object('status',public.lockliel_course_cutover_status(),'control',(select pg_catalog.json_build_object('paused',paused,'protocol',protocol) from lockliel_cutover.control where singleton));"""
SECURITY_SQL = """select pg_catalog.json_build_object(
 'publicTables',(select count(*) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p')),
 'rlsPublicTables',(select count(*) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') and c.relrowsecurity),
 'notesServiceTablePrivileges',(select count(*) from (values('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER'),('MAINTAIN')) p(privilege) where pg_catalog.has_table_privilege('service_role','public.lesson_private_notes',p.privilege)),
 'notesServiceColumnPrivileges',(select count(*) from (values('SELECT'),('INSERT'),('UPDATE'),('REFERENCES')) p(privilege) where pg_catalog.has_any_column_privilege('service_role','public.lesson_private_notes',p.privilege)),
 'gradingKeysAnon',(select pg_catalog.has_table_privilege('anon','app_private.course_answer_keys','SELECT,INSERT,UPDATE,DELETE') or pg_catalog.has_any_column_privilege('anon','app_private.course_answer_keys','SELECT,INSERT,UPDATE,REFERENCES')),
 'gradingKeysAuthenticated',(select pg_catalog.has_table_privilege('authenticated','app_private.course_answer_keys','SELECT,INSERT,UPDATE,DELETE') or pg_catalog.has_any_column_privilege('authenticated','app_private.course_answer_keys','SELECT,INSERT,UPDATE,REFERENCES')));"""
PROJECTIONS_SQL = "select pg_catalog.json_agg(pg_catalog.json_build_object('table',p.t,'column',p.c,'authenticatedSelect',pg_catalog.has_column_privilege('authenticated','public.'||p.t,p.c,'SELECT'),'anonSelect',pg_catalog.has_column_privilege('anon','public.'||p.t,p.c,'SELECT')) order by p.t,p.c) from (values " + ','.join("('%s','%s')" % p for p in PROJECTIONS) + ') p(t,c);'
RPC_SQL = """select pg_catalog.json_agg(pg_catalog.json_build_object('schema',n.nspname,'name',p.proname,'args',pg_catalog.pg_get_function_identity_arguments(p.oid),'owner',pg_catalog.pg_get_userbyid(p.proowner),'securityDefiner',p.prosecdef,'volatility',p.provolatile,'config',p.proconfig,'definitionMd5',pg_catalog.md5(pg_catalog.pg_get_functiondef(p.oid)),'anonExecute',pg_catalog.has_function_privilege('anon',p.oid,'EXECUTE'),'authenticatedExecute',pg_catalog.has_function_privilege('authenticated',p.oid,'EXECUTE'),'serviceExecute',pg_catalog.has_function_privilege('service_role',p.oid,'EXECUTE')) order by n.nspname,p.proname) from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace where (n.nspname,p.proname) in (('public','lockliel_current_session_active'),('app_private','current_session_is_active'),('public','lockliel_course_cutover_status'));"""
# Aggregate evidence is not A/B identity proof. Existing historical records omit
# the exact private fixture mapping; no inference from editable user_metadata,
# display names, email domain or counts may substitute for that missing binding.
SYNTHETIC_SQL = """select pg_catalog.json_build_object('totalUsers',(select count(*) from auth.users),'totalProfiles',(select count(*) from public.profiles),'totalSessions',(select count(*) from auth.sessions),'nonStaffProfiles',(select count(*) from public.profiles p where not exists(select 1 from public.staff_roles s where s.profile_id=p.id)));"""

def inspections(baseline=None, guard=None):
    baseline = load_baseline() if baseline is None else baseline
    guard = load_guard() if guard is None else guard
    root = Path(__file__).resolve().parents[2]
    catalog = _read_pinned(root / baseline['catalogQuerySource'], baseline['catalogQuerySourceSha256']).decode('utf-8')
    return (('identity', guard.IDENTITY_SQL), ('catalog', catalog), ('security', SECURITY_SQL), ('projections', PROJECTIONS_SQL), ('rpcs', RPC_SQL), ('readiness', READINESS_SQL), ('synthetic', SYNTHETIC_SQL))

def validate_rpc_rows(rpcs, baseline):
    need(type(rpcs) is list and len(rpcs) == 3, 'RPC_CATALOG_MISMATCH')
    seen = set()
    for rpc in rpcs:
        need(type(rpc) is dict and set(rpc) == {'schema','name','args','owner','securityDefiner','volatility','config','definitionMd5','anonExecute','authenticatedExecute','serviceExecute'}, 'RPC_CATALOG_MISMATCH')
        key = rpc['schema'] + '.' + rpc['name'];seen.add(key)
        need(key in baseline['rpcMd5'] and rpc['definitionMd5'] == baseline['rpcMd5'][key] and rpc['owner'] == 'postgres' and rpc['args'] == '' and rpc['volatility'] == 's' and rpc['config'] == ['search_path=""'] and rpc['anonExecute'] is False and rpc['authenticatedExecute'] is True, 'RPC_CATALOG_MISMATCH')
        need(rpc['securityDefiner'] is (key != 'public.lockliel_current_session_active'), 'RPC_CATALOG_MISMATCH')
        need(rpc['serviceExecute'] is (key != 'public.lockliel_course_cutover_status'), 'RPC_CATALOG_MISMATCH')
    need(seen == set(baseline['rpcMd5']), 'RPC_CATALOG_MISMATCH')

def validate_inventory(rows, baseline):
    need(type(rows) is dict and set(rows) == {'identity','catalog','readiness','security','projections','rpcs','synthetic'}, 'QUERY_SHAPE_DENIED')
    identity = rows['identity']
    need(type(identity) is dict and set(identity) == {'database','serverVersion'} and identity['database'] == 'postgres' and type(identity['serverVersion']) is str and identity['serverVersion'].startswith('17.'), 'BASELINE_MISMATCH')
    cat = catalog_canonical(rows['catalog'])
    ledger = sorted(cat['ledger'], key=lambda x:x['version'])
    need(ledger == baseline['ledger'], 'LEDGER_DRIFT')
    need(digest(cat) == baseline['catalogSha256'], 'CATALOG_DRIFT')
    readiness = rows['readiness']
    need(canonical(readiness) == canonical({'status':{'paused':True,'schemaReady':True,'protocol':'278-v1'},'control':{'paused':True,'protocol':'278-v1'}}), 'READINESS_MISMATCH')
    security = rows['security']
    need(canonical(security) == canonical({'publicTables':57,'rlsPublicTables':57,'notesServiceTablePrivileges':0,'notesServiceColumnPrivileges':0,'gradingKeysAnon':False,'gradingKeysAuthenticated':False}), 'SECURITY_BASELINE_MISMATCH')
    projections = rows['projections']
    expected = [{'table':t,'column':c,'authenticatedSelect':True,'anonSelect':False} for t,c in sorted(PROJECTIONS)]
    need(canonical(projections) == canonical(expected), 'PROJECTION_GRANTS_MISMATCH')
    validate_rpc_rows(rows['rpcs'], baseline)
    synthetic = rows['synthetic']
    need(type(synthetic) is dict and set(synthetic) == {'totalUsers','totalProfiles','totalSessions','nonStaffProfiles'} and all(type(v) is int and 0 <= v <= 1000000 for v in synthetic.values()), 'QUERY_SHAPE_DENIED')
    # A fresh independent exact fixture binding remains mandatory. The retained
    # historical booleans are deliberately not turned into new provenance proof.
    return {'catalogSha256':digest(cat),'securitySha256':digest(security),'currentSessionCatalogVerified':True,'requiredColumnGrantsVerified':True,'syntheticProvenanceVerified':False,'blockedReasons':['SYNTHETIC_IDENTITY_BASELINE_MISSING']}

def _inspect_guarded_owned(driver, *, run_nonce):
    """Fixed full inventory, same native handle/socket/PID/transaction throughout.
    The injectable driver exists solely for offline tests; never an operator API.
    Receipt output is strict projection, never raw rows/errors/member data.
    """
    need(type(run_nonce) is str and re.fullmatch(r"[0-9a-f]{32}",run_nonce) is not None, "BASELINE_MISMATCH")
    guard = load_guard();baseline = load_baseline();inventory = inspections(baseline, guard)
    started = time.time_ns() // 1000000
    witness_count = 0;query_count = 0;result = None
    try:
        initial = driver.identity();connection = guard.validate_native(initial)
        guard.require(initial.get('transaction_status') == 0, 'CONNECTION_NOT_IDLE')
        driver.command('BEGIN READ ONLY')
        def witness(anchor=None):
            nonlocal witness_count
            native = driver.identity()
            guard.require(guard.validate_native(native) == connection and native.get('transaction_status') == 2, 'CONNECTION_REPLACED')
            row = driver.select(guard.GUARD_SQL);witness_count += 1
            current = guard.validate_witness(row, connection[2]);after = driver.identity()
            guard.require(guard.validate_native(after) == connection and after.get('transaction_status') == 2, 'CONNECTION_REPLACED')
            guard.require(anchor is None or current == anchor, 'TRANSACTION_REPLACED')
            return current, row
        anchor, first = witness();rows = {}
        for name,sql in inventory:
            witness(anchor);rows[name] = driver.select(sql);query_count += 1;witness(anchor)
            # Validate metadata before invoking a privileged readiness function.
            if name == 'catalog':
                need(digest(catalog_canonical(rows[name])) == baseline['catalogSha256'], 'CATALOG_DRIFT')
            if name == 'rpcs':
                validate_rpc_rows(rows[name],baseline)
        verified = validate_inventory(rows, baseline)
        result = {'version':VERSION,'runNonce':run_nonce,'source':'direct-native-deployment-preflight','project':PROJECT,'host':HOST,'database':'postgres','observedStartedAt':started,'startupOptionsVerified':True,'backendPid':anchor[0],'transactionStartedAt':anchor[1],'tlsVersion':first['tls'],'cipher':first['cipher'],'tlsVerifyFull':True,'hostnameVerified':True,'directIPv6':True,'transactionReadOnly':first['read_only'],'lockTimeout':first['lock_timeout'],'statementTimeout':first['statement_timeout'],'samePhysicalConnection':True,'sameTransaction':True,'noReconnect':True,'noDataWrites':True,'inspectionQueries':query_count,'witnessQueries':witness_count,'totalStatements':query_count+witness_count+2,'ledger':len(baseline['ledger']),'baseline':{k:baseline[k] for k in ('versionsSha256','migration280StatementsArrayTextMd5','migration280SourceSha256')},'paused':rows['readiness']['status']['paused'],'schemaReady':rows['readiness']['status']['schemaReady'],'protocol':rows['readiness']['status']['protocol'],'rlsAll':rows['security']['publicTables']==rows['security']['rlsPublicTables']==57,'notesServiceTablePrivileges':rows['security']['notesServiceTablePrivileges'],'notesServiceColumnPrivileges':rows['security']['notesServiceColumnPrivileges'],'branchIdentity':{'source':'historical-provider-metadata-2026-11-02','branch':BRANCH,'branchId':baseline['branchId'],'fresh':False},'callerRestVerified':False,**verified}
    finally:
        try:
            if driver.connected() and driver.transaction_status() in (2,3):
                driver.command('ROLLBACK');guard.require(driver.transaction_status() == 0,'ROLLBACK_NOT_VERIFIED')
                if result is not None:result['rolledBack'] = True
        finally:
            driver.close()
    need(result is not None and result.get('rolledBack') is True, 'BASELINE_MISMATCH')
    ended = time.time_ns() // 1000000
    need(type(ended) is int and 0 < started <= ended and ended-started <= 300000,'PREFLIGHT_CLOCK_INVALID')
    result.update(observedAt=ended,connectionClosed=True,nativeInventoryVerified=True,deploymentReady=False)
    return {'ok':False,'errorCode':'SYNTHETIC_IDENTITY_BASELINE_MISSING','receipt':result}


def inspect_guarded(driver, *, run_nonce):
    """Take ownership immediately, including failed source/nonce setup."""
    try:
        return _inspect_guarded_owned(driver,run_nonce=run_nonce)
    finally:
        # DirectLibpq.close is idempotent. Even pre-BEGIN/source setup failure
        # may not leave a supplied physical connection available for reuse.
        driver.close()


def create_native_driver(ca, password):
    """Only the future exact-source authorized worker may call this constructor.
    No input or credential handling is exposed by CLI. Inherit unchanged reviewed
    IPv6/TLS/startup primitives; expand SELECT allowance only to this fixed list.
    No driver callback or extra SQL may be injected into the native factory.
    """
    guard = load_guard();baseline = load_baseline()
    allowed = frozenset([guard.GUARD_SQL] + [sql for _,sql in inspections(baseline,guard)])
    class FixedInventoryDriver(guard.DirectLibpq):
        def select(self, sql):
            guard.require(type(sql) is str and sql in allowed and self.transaction_status() == 2,'UNGUARDED_QUERY_DENIED')
            result = self._exec(sql,2)
            try:
                guard.require(self.lib.PQntuples(result) == 1 and self.lib.PQnfields(result) == 1 and not self.lib.PQgetisnull(result,0,0),'QUERY_SHAPE_DENIED')
                guard.require(self.lib.PQgetlength(result,0,0) <= MAX_RESULT_BYTES,'QUERY_RESULT_TOO_LARGE')
                return json.loads(self.lib.PQgetvalue(result,0,0).decode('utf-8'))
            except (ValueError,UnicodeError):
                raise guard.GuardError('QUERY_SHAPE_DENIED') from None
            finally:
                self.lib.PQclear(result)
    return FixedInventoryDriver(ca,password)


def preparation_only():
    return {'ok':False,'errorCode':'NATIVE_EXECUTION_NOT_AUTHORIZED','version':VERSION}

if __name__ == '__main__':
    # This preparation module cannot prompt, connect, use credentials or consume
    # any allowance. A future source-bound worker/launcher requires exact review.
    print(json.dumps(preparation_only(),separators=(',',':')))
    raise SystemExit(1)
