"""Offline full native inventory regressions. Synthetic driver only."""
import copy
import ctypes
import getpass
import importlib.util
import json
from pathlib import Path
import socket
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('deployment_native',ROOT/'scripts/member-hosted/deployment_database_preflight.py')
n = importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(n)
BASELINE = n.load_baseline()
G = n.load_guard()
INVENTORY = n.inspections(BASELINE,G)
NONCE = 'a1' * 16

def forbidden(*args,**kwargs):
    raise AssertionError('Forbidden network, native driver or real password input')

class Driver:
    def __init__(self):
        self.tx=0;self.closed=False;self.pid=1234;self.sock=9;self.native=100;self.stamp='2026-11-02 12:00:00+00';self.calls=[];self.trigger=None;self.native_change={};self.witness_change={}
        catalog=json.loads((ROOT/BASELINE['catalogSource']).read_text())
        self.rows={
            'identity':{'database':'postgres','serverVersion':'17.11'},
            'catalog':catalog,
            'readiness':{'status':{'paused':True,'schemaReady':True,'protocol':'278-v1'},'control':{'paused':True,'protocol':'278-v1'}},
            'security':{'publicTables':57,'rlsPublicTables':57,'notesServiceTablePrivileges':0,'notesServiceColumnPrivileges':0,'gradingKeysAnon':False,'gradingKeysAuthenticated':False},
            'projections':[{'table':t,'column':c,'authenticatedSelect':True,'anonSelect':False} for t,c in sorted(n.PROJECTIONS)],
            'rpcs':[{'schema':k.split('.')[0],'name':k.split('.')[1],'args':'','owner':'postgres','securityDefiner':k!='public.lockliel_current_session_active','volatility':'s','config':['search_path=""'],'definitionMd5':v,'anonExecute':False,'authenticatedExecute':True,'serviceExecute':k!='public.lockliel_course_cutover_status'} for k,v in sorted(BASELINE['rpcMd5'].items())],
            'synthetic':{'totalUsers':4,'totalProfiles':4,'totalSessions':0,'nonStaffProfiles':3}}
    def identity(self):return {'host':n.HOST,'port':'5432','database':'postgres','sslmode':'verify-full','ca_verified':True,'startup_options':G.OPTIONS,'tls_active':True,'tls_version':'TLSv1.3','cipher':'synthetic-cipher','backend_pid':self.pid,'socket':self.sock,'native_handle':self.native,'transaction_status':self.tx,**self.native_change}
    def connected(self):return not self.closed
    def transaction_status(self):return self.tx
    def command(self,sql):
        self.calls.append(sql)
        if sql=='BEGIN READ ONLY':self.tx=2
        elif sql=='ROLLBACK':self.tx=0
        else:raise AssertionError('Unapproved command')
    def select(self,sql):
        self.calls.append(sql)
        if self.trigger:self.trigger(self,sql)
        if sql==G.GUARD_SQL:return {'database':'postgres','backend_pid':self.pid,'transaction_started_at':self.stamp,'default_read_only':'on','read_only':'on','lock_timeout':'5s','statement_timeout':'30s','ssl':True,'tls':'TLSv1.3','cipher':'synthetic-cipher',**self.witness_change}
        for name,query in INVENTORY:
            if sql==query:return copy.deepcopy(self.rows[name])
        raise AssertionError('Unapproved SELECT')
    def close(self):self.closed=True

class NativeTests(unittest.TestCase):
    def setUp(self):
        self.stack=[]
        for obj,name in ((socket,'socket'),(socket,'getaddrinfo'),(socket,'create_connection'),(getpass,'getpass'),(ctypes,'CDLL')):
            p=patch.object(obj,name,forbidden);p.start();self.stack.append(p)
    def tearDown(self):
        for p in reversed(self.stack):p.stop()
    def inspect(self,d):return n.inspect_guarded(d,run_nonce=NONCE)
    def denied(self,d,code):
        with self.assertRaises((n.PreflightError,Exception)) as e:self.inspect(d)
        self.assertEqual(e.exception.code,code);self.assertTrue(d.closed)
    def test_full_inventory_retains_unverified_provenance_blocker(self):
        d=Driver();out=self.inspect(d);r=out['receipt']
        self.assertFalse(out['ok']);self.assertEqual(out['errorCode'],'SYNTHETIC_IDENTITY_BASELINE_MISSING')
        self.assertEqual(r['inspectionQueries'],7);self.assertEqual(r['witnessQueries'],15);self.assertEqual(r['totalStatements'],24)
        self.assertEqual(len(d.calls),24);self.assertTrue(r['rolledBack'] and r['connectionClosed'] and r['nativeInventoryVerified']);self.assertFalse(r['deploymentReady']);self.assertFalse(r['syntheticProvenanceVerified']);self.assertEqual(r['runNonce'],NONCE)
        self.assertFalse(r['branchIdentity']['fresh']);self.assertFalse(r['callerRestVerified'])
    def test_observation_time_captured_around_inventory_and_close(self):
        with patch.object(n.time,'time_ns',side_effect=[1762100000000000000,1762100000123000000]):r=self.inspect(Driver())['receipt']
        self.assertEqual(r['observedAt']-r['observedStartedAt'],123)
    def test_backward_clock_rejected_after_close(self):
        d=Driver()
        with patch.object(n.time,'time_ns',side_effect=[20_000_000,10_000_000]):self.denied(d,'PREFLIGHT_CLOCK_INVALID')
    def test_expired_five_minute_inventory_rejected(self):
        d=Driver()
        with patch.object(n.time,'time_ns',side_effect=[1_000_000,300002_000_000]):self.denied(d,'PREFLIGHT_CLOCK_INVALID')
    def test_wrong_project_rejected_before_begin(self):
        d=Driver();d.native_change['host']='db.bsndfhbemstyrrglajat.supabase.co';self.denied(d,'WRONG_PROJECT_OR_DATABASE');self.assertEqual(d.calls,[])
    def test_wrong_sibling_rejected(self):
        d=Driver();d.native_change['host']='db.someothersibling.supabase.co';self.denied(d,'WRONG_PROJECT_OR_DATABASE')
    def test_ignored_startup_settings(self):
        d=Driver();d.witness_change['default_read_only']='off';self.denied(d,'READ_ONLY_NOT_ON')
    def test_readonly_off(self):
        d=Driver();d.witness_change['read_only']='off';self.denied(d,'READ_ONLY_NOT_ON')
    def test_lock_unlimited(self):
        d=Driver();d.witness_change['lock_timeout']='0';self.denied(d,'LOCK_TIMEOUT_NOT_5S')
    def test_wrong_statement_timeout(self):
        d=Driver();d.witness_change['statement_timeout']='2min';self.denied(d,'STATEMENT_TIMEOUT_NOT_30S')
    def test_tls_downgrade(self):
        d=Driver();d.native_change['sslmode']='require';self.denied(d,'TLS_IDENTITY_NOT_VERIFIED')
    def test_connection_replaced_in_catalog(self):
        d=Driver()
        def mutate(driver,sql):
            if sql==INVENTORY[1][1]:driver.sock+=1
        d.trigger=mutate;self.denied(d,'CONNECTION_REPLACED')
    def test_transaction_replaced_in_catalog(self):
        d=Driver()
        def mutate(driver,sql):
            if sql==INVENTORY[1][1]:driver.stamp='2026-11-02 12:00:01+00'
        d.trigger=mutate;self.denied(d,'TRANSACTION_REPLACED')
    def test_ledger_total_is_not_fingerprint_proof(self):
        d=Driver();d.rows['catalog']['ledger'][0]['statements_md5']='0'*32;self.denied(d,'CATALOG_DRIFT')
    def test_missing_migration(self):
        d=Driver();d.rows['catalog']['ledger'].pop();self.denied(d,'CATALOG_DRIFT')
    def test_extra_migration(self):
        d=Driver();d.rows['catalog']['ledger'].append({'version':'20261102000000','name':'wrong','statements_md5':'0'*32});self.denied(d,'CATALOG_DRIFT')
    def test_catalog_acl_drift(self):
        d=Driver();d.rows['catalog']['tables'][0]['acl'].append('anon=arwd/postgres');self.denied(d,'CATALOG_DRIFT')
    def test_catalog_order_normalized_only_for_set_arrays(self):
        d=Driver()
        for rows in d.rows['catalog'].values():rows.reverse()
        self.assertTrue(self.inspect(d)['receipt']['nativeInventoryVerified'])
    def test_paused_false(self):
        d=Driver();d.rows['readiness']['status']['paused']=False;self.denied(d,'READINESS_MISMATCH')
    def test_control_paused_mismatch(self):
        d=Driver();d.rows['readiness']['control']['paused']=False;self.denied(d,'READINESS_MISMATCH')
    def test_readiness_unavailable(self):
        d=Driver();d.rows['readiness']['status']['schemaReady']=False;self.denied(d,'READINESS_MISMATCH')
    def test_readiness_numeric_boolean_denied(self):
        d=Driver();d.rows['readiness']['status']['paused']=1;self.denied(d,'READINESS_MISMATCH')
    def test_wrong_readiness_definition_prevents_execution(self):
        d=Driver();d.rows['rpcs'][2]['definitionMd5']='0'*32;self.denied(d,'RPC_CATALOG_MISMATCH');self.assertNotIn(n.READINESS_SQL,d.calls)
    def test_wrong_protocol(self):
        d=Driver();d.rows['readiness']['status']['protocol']='280-v1';self.denied(d,'READINESS_MISMATCH')
    def test_notes_service_table_privileges(self):
        d=Driver();d.rows['security']['notesServiceTablePrivileges']=1;self.denied(d,'SECURITY_BASELINE_MISMATCH')
    def test_notes_service_column_privileges(self):
        d=Driver();d.rows['security']['notesServiceColumnPrivileges']=1;self.denied(d,'SECURITY_BASELINE_MISMATCH')
    def test_grading_keys_authenticated(self):
        d=Driver();d.rows['security']['gradingKeysAuthenticated']=True;self.denied(d,'SECURITY_BASELINE_MISMATCH')
    def test_rls_missing(self):
        d=Driver();d.rows['security']['rlsPublicTables']=56;self.denied(d,'SECURITY_BASELINE_MISMATCH')
    def test_projection_anon_grant(self):
        d=Driver();d.rows['projections'][0]['anonSelect']=True;self.denied(d,'PROJECTION_GRANTS_MISMATCH')
    def test_projection_missing(self):
        d=Driver();d.rows['projections'].pop();self.denied(d,'PROJECTION_GRANTS_MISMATCH')
    def test_extra_private_projection_field(self):
        d=Driver();d.rows['projections'][0]['privateNote']='SYNTHETIC-DO-NOT-EMIT';self.denied(d,'PROJECTION_GRANTS_MISMATCH')
    def test_rpc_wrong_owner(self):
        d=Driver();d.rows['rpcs'][0]['owner']='wrong';self.denied(d,'RPC_CATALOG_MISMATCH')
    def test_rpc_anon_execute(self):
        d=Driver();d.rows['rpcs'][0]['anonExecute']=True;self.denied(d,'RPC_CATALOG_MISMATCH')
    def test_rpc_nonempty_searchpath(self):
        d=Driver();d.rows['rpcs'][0]['config']=['search_path=public'];self.denied(d,'RPC_CATALOG_MISMATCH')
    def test_rpc_definition_changed(self):
        d=Driver();d.rows['rpcs'][0]['definitionMd5']='0'*32;self.denied(d,'RPC_CATALOG_MISMATCH')
    def test_rpc_overload_denied(self):
        d=Driver();d.rows['rpcs'].append(copy.deepcopy(d.rows['rpcs'][0]));self.denied(d,'RPC_CATALOG_MISMATCH')
    def test_synthetic_private_fields_never_returned(self):
        d=Driver();d.rows['synthetic']['email']='SYNTHETIC-DO-NOT-EMIT';self.denied(d,'QUERY_SHAPE_DENIED')
    def test_unknown_fixture_counts_cannot_certify_provenance(self):
        d=Driver();d.rows['synthetic']['totalUsers']=4;self.assertFalse(self.inspect(d)['receipt']['syntheticProvenanceVerified'])
    def test_inventory_queries_are_fixed_selects(self):
        self.assertEqual(len(INVENTORY),7)
        for _,sql in INVENTORY:self.assertTrue(sql.lstrip().startswith('select ') or sql.startswith('-- Read-only,'))
        self.assertNotIn('select *', '\n'.join(q.lower() for _,q in INVENTORY));self.assertNotIn('email',n.SYNTHETIC_SQL);self.assertNotIn('raw_user_meta_data',n.SYNTHETIC_SQL)
    def test_import_and_cli_are_preparation_only(self):
        self.assertEqual(n.preparation_only()['errorCode'],'NATIVE_EXECUTION_NOT_AUTHORIZED')
    def test_base_guard_bytes_unchanged(self):
        import hashlib
        self.assertEqual(hashlib.sha256((ROOT/'scripts/member-hosted/database_preflight.py').read_bytes()).hexdigest(),n.GUARD_SHA256)
    def test_native_factory_is_not_invoked_by_inspection(self):
        with patch.object(n,'create_native_driver',forbidden):self.assertFalse(self.inspect(Driver())['ok'])
    def test_nonce_missing_or_malformed(self):
        for nonce in ('','a'*31,'a'*33,'X'*32,False,None):
            d=Driver()
            with self.assertRaises(n.PreflightError):n.inspect_guarded(d,run_nonce=nonce)
            self.assertTrue(d.closed)
    def test_failed_source_setup_closes_owned_driver(self):
        d=Driver()
        with patch.object(n,'load_guard',side_effect=n.PreflightError('SOURCE_MISMATCH')):
            self.denied(d,'SOURCE_MISMATCH')
    def test_receipt_never_copies_native_handles(self):
        result=self.inspect(Driver())['receipt']
        for key in ('native_handle','socket'):self.assertNotIn(key,result)
        self.assertEqual(result['backendPid'],1234);self.assertEqual(result['transactionStartedAt'],'2026-11-02 12:00:00+00');self.assertEqual(result['tlsVersion'],'TLSv1.3');self.assertTrue(result['startupOptionsVerified'])
        self.assertNotIn('SYNTHETIC-DO-NOT-EMIT',json.dumps(result))

if __name__=='__main__':unittest.main()
