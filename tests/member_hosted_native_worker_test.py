"""Offline protected native producer tests. No real prompt/socket/libpq/state."""
import copy
import ctypes
import getpass
import importlib.util
import json
import socket
import time
from pathlib import Path
import unittest
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);out=importlib.util.module_from_spec(spec);spec.loader.exec_module(out);return out
w=module('native_worker',ROOT/'scripts/member-hosted/deployment_native_worker.py')
f=module('old_inventory_fixture',ROOT/'tests/member_hosted_deployment_preflight_test.py')
N=f.n
NOW=time.time_ns()//1000000

def mapping():return {'version':'lockliel-synthetic-identity-mapping-v1','project':w.PROJECT,'branch':w.BRANCH,'branchId':w.BRANCH_ID,'issuedAt':NOW-10000,'expiresAt':NOW+60000,'evidence':{'source':'independent-approved-synthetic-fixture-record','approvalId':'synthetic-offline-only','recordSha256':'c'*64,'verifiedAt':NOW-20000},'subjects':[{'label':'A','subjectSha256':'1'*64,'profileSha256':'3'*64,'createdAtSha256':'5'*64,'loginSha256':'7'*64},{'label':'B','subjectSha256':'2'*64,'profileSha256':'4'*64,'createdAtSha256':'6'*64,'loginSha256':'8'*64}]}
def rows(m):return [{k:v for k,v in s.items() if k!='label'}|{'profileCount':1,'confirmed':True,'staffRoleCount':0} for s in m['subjects']]
class Driver(f.Driver):
 def __init__(self,m):super().__init__();self.mapping_rows=rows(m)
 def select(self,sql):
  if sql==w.IDENTITY_SQL:self.calls.append(sql);return copy.deepcopy(self.mapping_rows)
  return super().select(sql)
class NativeWorkerTests(unittest.TestCase):
 def setUp(self):
  self.patches=[patch.object(obj,name,side_effect=AssertionError('No live operation permitted')) for obj,name in ((socket,'socket'),(socket,'getaddrinfo'),(socket,'create_connection'),(getpass,'getpass'),(ctypes,'CDLL'))]
  for p in self.patches:p.start()
 def tearDown(self):
  for p in reversed(self.patches):p.stop()
 def inspect(self,d,m):return w.inspect_owned(d,N,m,'a1'*16)
 def deny(self,mutate,code='SYNTHETIC_PROVENANCE_MISMATCH'):
  m=mapping();d=Driver(m);mutate(d,m)
  with self.assertRaises(Exception) as caught:self.inspect(d,m)
  self.assertEqual(caught.exception.code,code);self.assertTrue(d.closed)
 def test_actual_v2_full_inventory_mapping_and_counts(self):
  m=mapping();d=Driver(m);r=self.inspect(d,m)['receipt'];self.assertEqual(r['version'],w.VERSION);self.assertEqual((r['inspectionQueries'],r['witnessQueries'],r['totalStatements']),(8,17,27));self.assertEqual(len(d.calls),27);self.assertTrue(r['syntheticProvenanceVerified']);self.assertFalse(r['callerRestVerified']);self.assertFalse(r['deploymentReady']);self.assertTrue(r['rolledBack']);self.assertEqual(r['subjectsVerified'],['A','B'])
 def test_private_digests_not_emitted(self):
  m=mapping();r=json.dumps(self.inspect(Driver(m),m));self.assertNotIn('1'*64,r);self.assertNotIn('3'*64,r);self.assertNotIn('5'*64,r);self.assertNotIn('identityMapping',r)
 def test_wrong_project_before_sql(self):self.deny(lambda d,m:m.update(project='bsndfhbemstyrrglajat'),'IDENTITY_MAPPING_REJECTED')
 def test_wrong_branch(self):self.deny(lambda d,m:m.update(branch='production'),'IDENTITY_MAPPING_REJECTED')
 def test_wrong_branch_id(self):self.deny(lambda d,m:m.update(branchId='unknown'),'IDENTITY_MAPPING_REJECTED')
 def test_missing_user(self):self.deny(lambda d,m:d.mapping_rows.pop())
 def test_swapped_profile(self):self.deny(lambda d,m:d.mapping_rows[0].update(profileSha256='4'*64))
 def test_wrong_creation_provenance(self):self.deny(lambda d,m:d.mapping_rows[0].update(createdAtSha256='7'*64))
 def test_wrong_login_binding(self):self.deny(lambda d,m:d.mapping_rows[0].update(loginSha256='8'*64))
 def test_missing_login_binding(self):self.deny(lambda d,m:m['subjects'][0].pop('loginSha256'),'IDENTITY_MAPPING_REJECTED')
 def test_duplicate_login_mapping(self):self.deny(lambda d,m:m['subjects'][0].update(loginSha256='8'*64),'IDENTITY_MAPPING_REJECTED')
 def test_duplicate_subject(self):self.deny(lambda d,m:d.mapping_rows.append(copy.deepcopy(d.mapping_rows[0])))
 def test_unconfirmed_user(self):self.deny(lambda d,m:d.mapping_rows[0].update(confirmed=False))
 def test_staff_user(self):self.deny(lambda d,m:d.mapping_rows[0].update(staffRoleCount=1))
 def test_orphan_profile(self):self.deny(lambda d,m:d.mapping_rows[0].update(profileCount=0))
 def test_numeric_bool_rejected(self):self.deny(lambda d,m:d.mapping_rows[0].update(confirmed=1))
 def test_mapping_private_field_rejected(self):self.deny(lambda d,m:m.update(password='SYNTHETIC-CANARY'),'IDENTITY_MAPPING_REJECTED')
 def test_result_private_field_rejected(self):self.deny(lambda d,m:d.mapping_rows[0].update(email='SYNTHETIC-CANARY'))
 def test_stale_mapping(self):self.deny(lambda d,m:m.update(expiresAt=NOW-1),'IDENTITY_MAPPING_EXPIRED')
 def test_future_mapping(self):self.deny(lambda d,m:m.update(issuedAt=NOW+100000),'IDENTITY_MAPPING_EXPIRED')
 def test_oversized_window(self):self.deny(lambda d,m:m.update(expiresAt=NOW+86400001),'IDENTITY_MAPPING_EXPIRED')
 def test_mapping_cannot_derive_from_metadata(self):self.deny(lambda d,m:m['evidence'].update(source='user_metadata'),'IDENTITY_MAPPING_REJECTED')
 def test_ordinary_members_not_manager_proof(self):
  m=mapping();r=self.inspect(Driver(m),m)['receipt'];self.assertNotIn('aal2AuthorizedOnly',r);self.assertNotIn('staffRoleAuthorized',r)
 def test_wrong_native_project(self):self.deny(lambda d,m:d.native_change.update(host='db.bsndfhbemstyrrglajat.supabase.co'),'WRONG_PROJECT_OR_DATABASE')
 def test_readonly_off(self):self.deny(lambda d,m:d.witness_change.update(read_only='off'),'READ_ONLY_NOT_ON')
 def test_unlimited_lock_timeout(self):self.deny(lambda d,m:d.witness_change.update(lock_timeout='0'),'LOCK_TIMEOUT_NOT_5S')
 def test_wrong_statement_timeout(self):self.deny(lambda d,m:d.witness_change.update(statement_timeout='2min'),'STATEMENT_TIMEOUT_NOT_30S')
 def test_tls_downgrade(self):self.deny(lambda d,m:d.native_change.update(sslmode='require'),'TLS_IDENTITY_NOT_VERIFIED')
 def test_connection_change(self):
  def mutate(d,m):
   def trigger(driver,sql):
    if sql==N.SYNTHETIC_SQL:driver.sock+=1
   d.trigger=trigger
  self.deny(mutate,'CONNECTION_REPLACED')
 def test_source_failure_closes_driver(self):
  m=mapping();d=Driver(m)
  with patch.object(N,'load_guard',side_effect=w.WorkerError('SOURCE_MISMATCH')):
   with self.assertRaises(w.WorkerError):self.inspect(d,m)
  self.assertTrue(d.closed)
 def test_invalid_nonce_closes_driver(self):
  m=mapping();d=Driver(m)
  with self.assertRaises(w.WorkerError):w.inspect_owned(d,N,m,'bad')
  self.assertTrue(d.closed);self.assertEqual(d.calls,[])
 def test_preparation_remains_disabled(self):
  out=w.run(['--offline-verify']);self.assertTrue(out['ok']);self.assertFalse(out['executionAuthorized']);self.assertEqual(out['connectionsOpened'],0)
 def test_unknown_cli_denied(self):self.assertEqual(w.run(['--execute'])['errorCode'],'EXECUTION_NOT_AUTHORIZED')
 def test_private_channel_denied_before_stdin_or_prompt(self):
  with patch.object(w.sys,'stdin',None),patch.object(w,'_private_record',side_effect=w.WorkerError('EXECUTION_NOT_AUTHORIZED')):self.assertEqual(w.run_private_channel()['errorCode'],'EXECUTION_NOT_AUTHORIZED')
 def test_duplicate_private_channel_denied(self):self.assertEqual(w.run_private_channel()['errorCode'],'EXECUTION_NOT_AUTHORIZED')
 def test_unapproved_caller_authority_denied(self):
  out=w._execute_sealed({'executionAuthorized':False},{'password':'SYNTHETIC-CANARY'},{});self.assertFalse(out['ok']);self.assertNotIn('SYNTHETIC-CANARY',json.dumps(out))
 def test_mapping_query_no_write_or_email_or_user_metadata(self):
  sql=w.IDENTITY_SQL.lower();self.assertTrue(sql.startswith('select '));self.assertNotIn('raw_user_meta_data',sql);self.assertNotIn('u.email,',sql);self.assertNotIn('insert ',sql);self.assertNotIn('update ',sql)
 def permit(self):
  import hashlib
  return {'version':'lockliel-deployment-native-owner-permit-v1','authorization':'wave10im-one-native-preflight','project':w.PROJECT,'branch':w.BRANCH,'branchId':w.BRANCH_ID,'applicationSource':'327ba098628f70aa65140862b8b14cd709bfd711','workerSha256':hashlib.sha256(Path(w.__file__).read_bytes()).hexdigest(),'manifestSha256':w.MANIFEST_SHA256,'grantSha256':'d'*64,'identityMappingSha256':w.sha(mapping()),'identityApproval':mapping()['evidence'],'issuedAt':NOW-10000,'expiresAt':NOW+60000,'maximumDatabaseConnections':1}
 def test_owner_permit_exact_source(self):self.assertEqual(w.validate_owner_permit(self.permit(),NOW)['project'],w.PROJECT)
 def test_owner_permit_wrong_worker(self):
  value=self.permit();value['workerSha256']='0'*64
  with self.assertRaises(w.WorkerError):w.validate_owner_permit(value,NOW)
 def test_owner_permit_wrong_manifest(self):
  value=self.permit();value['manifestSha256']='0'*64
  with self.assertRaises(w.WorkerError):w.validate_owner_permit(value,NOW)
 def test_owner_permit_expired(self):
  value=self.permit();value['expiresAt']=NOW-1
  with self.assertRaises(w.WorkerError):w.validate_owner_permit(value,NOW)
 def test_owner_permit_wrong_project(self):
  value=self.permit();value['project']='bsndfhbemstyrrglajat'
  with self.assertRaises(w.WorkerError):w.validate_owner_permit(value,NOW)
 def test_static_manifest_has_no_mutual_hash_cycle(self):
  value=w.preparation();self.assertIsNone(value['operatorSeal']);self.assertNotIn('deployment_native_worker.py',value['sourceHashes'])
 def test_private_record_owner_only_no_follow(self):
  import tempfile,os
  with tempfile.TemporaryDirectory() as temp:
   file=Path(temp)/'permit.json';file.write_text('{"synthetic":true}');file.chmod(0o400);self.assertEqual(w._private_record(file),{'synthetic':True});file.chmod(0o600)
   with self.assertRaises(w.WorkerError):w._private_record(file)
   file.chmod(0o400);link=Path(temp)/'link';link.symlink_to(file)
   with self.assertRaises(OSError):w._private_record(link)
 def test_private_record_digest_mismatch(self):
  import tempfile
  with tempfile.TemporaryDirectory() as temp:
   file=Path(temp)/'permit.json';file.write_text('{"synthetic":true}');file.chmod(0o400)
   with self.assertRaises(w.WorkerError):w._private_record(file,'0'*64)
 def execute_mocked(self,failure=None):
  import contextlib,types
  events=[];m=mapping();password=bytearray(b'SYNTHETIC-SECRET-DO-NOT-PRINT');permit=self.permit();grant={'operatorSha256':permit['workerSha256']};manifest=w.preparation();d=Driver(m)
  boundary=types.SimpleNamespace(_safe_tls_environment=lambda:events.append('tls_environment'),_private_output=contextlib.nullcontext,_wipe=lambda value:value.__setitem__(slice(None),bytes(len(value))) if value is not None else None)
  manual=types.SimpleNamespace(validate_identity=lambda:events.append('historical_identity'),load_boundary=lambda:boundary,hidden_password=lambda:(events.append('password'),password)[1])
  guard=types.SimpleNamespace(**{name:getattr(f.G,name) for name in dir(f.G) if not name.startswith('__')});guard.validate_ca=lambda path:(events.append('ca'),path)[1]
  class Attempt:
   def validate_grant(self,value,now):events.append('validate_grant')
   def consume_at(self,root,value):
    events.append('consume')
    if failure=='consume':raise RuntimeError('SYNTHETIC-SECRET-DO-NOT-PRINT')
  modules={'manual_database_preflight.py':manual,'recovery_launcher.py':types.SimpleNamespace(verify_runtime=lambda root:events.append('runtime')),'deployment_database_preflight.py':N,'deployment_preflight_attempt.py':Attempt()}
  def construct(ca,plain,native):
   events.append('connect');self.assertEqual(plain,'SYNTHETIC-SECRET-DO-NOT-PRINT')
   if failure=='authentication':raise guard.GuardError('AUTHENTICATION_FAILED')
   if failure=='interrupted':raise KeyboardInterrupt('SYNTHETIC-SECRET-DO-NOT-PRINT')
   return d
  with patch.object(w,'_module',side_effect=lambda name,digest:modules[name]),patch.object(w,'_private_record',return_value=grant),patch.object(N,'load_guard',return_value=guard),patch.object(w,'create_driver',side_effect=construct):out=w._execute_sealed(manifest,{'runNonce':'a1'*16,'identityMapping':m},permit)
  return out,events,password,d
 def test_concrete_protected_worker_success_order_and_disposal(self):
  out,events,password,d=self.execute_mocked();self.assertTrue(out['ok']);self.assertTrue(out['attemptConsumed']);self.assertLess(events.index('runtime'),events.index('password'));self.assertLess(events.index('ca'),events.index('password'));self.assertLess(events.index('consume'),events.index('password'));self.assertLess(events.index('password'),events.index('connect'));self.assertTrue(all(b==0 for b in password));self.assertTrue(d.closed);self.assertNotIn('SYNTHETIC-SECRET',json.dumps(out))
 def test_concrete_incorrect_password_stops_and_disposes(self):
  out,events,password,d=self.execute_mocked('authentication');self.assertFalse(out['ok']);self.assertEqual(out['errorCode'],'AUTHENTICATION_FAILED');self.assertEqual(out['attemptStatus'],'CONSUMED');self.assertTrue(all(b==0 for b in password));self.assertNotIn('SYNTHETIC-SECRET',json.dumps(out));self.assertEqual(events.count('connect'),1)
 def test_interrupted_worker_no_retry_and_disposal(self):
  out,events,password,d=self.execute_mocked('interrupted');self.assertFalse(out['ok']);self.assertFalse(out['retryAllowed']);self.assertEqual(out['attemptStatus'],'CONSUMED');self.assertTrue(all(b==0 for b in password));self.assertEqual(events.count('connect'),1)
 def test_ambiguous_consumption_never_reports_unused(self):
  out,events,password,d=self.execute_mocked('consume');self.assertFalse(out['ok']);self.assertEqual(out['attemptStatus'],'CONSUMED_OR_AMBIGUOUS');self.assertIsNone(out['attemptConsumed']);self.assertNotIn('password',events);self.assertNotIn('connect',events);self.assertFalse(out['retryAllowed'])
 def test_old_j_and_il_native_hashes_unchanged(self):
  import hashlib
  self.assertEqual(hashlib.sha256((ROOT/'scripts/member-hosted/deployment_database_preflight.py').read_bytes()).hexdigest(),'c367e660e07d42286ec1be321fd65593a82aa2ad85bd883383b677cd139e75db');self.assertEqual(hashlib.sha256((ROOT/'scripts/member-hosted/database_preflight.py').read_bytes()).hexdigest(),'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba')
if __name__=='__main__':unittest.main()
