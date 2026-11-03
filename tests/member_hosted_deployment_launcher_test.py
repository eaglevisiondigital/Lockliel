"""Disabled launcher/source/attempt contract regressions. No live inputs or I/O."""
import ctypes
import getpass
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import socket
import tempfile
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]/'scripts/member-hosted'
spec=importlib.util.spec_from_file_location('disabled_preflight_launcher',ROOT/'deployment-preflight-launcher.py')
l=importlib.util.module_from_spec(spec);spec.loader.exec_module(l)

def forbidden(*args,**kwargs):raise AssertionError('Forbidden connection, native driver or real input')

class LauncherTests(unittest.TestCase):
 def setUp(self):
  self.patches=[]
  for owner,key in ((socket,'socket'),(socket,'create_connection'),(socket,'getaddrinfo'),(getpass,'getpass'),(ctypes,'CDLL')):
   p=patch.object(owner,key,forbidden);p.start();self.patches.append(p)
 def tearDown(self):
  for p in reversed(self.patches):p.stop()
 def modified(self,change):
  with tempfile.TemporaryDirectory(prefix='lockliel-launch-fixture-') as tmp:
   root=Path(tmp)
   for name in [*l.EXPECTED_SOURCES,'deployment-preflight-launcher-manifest.json','recovery-runtime-manifest.json','recovery-runtime-SHA256SUMS']:shutil.copyfile(ROOT/name,root/name)
   manifest=json.loads((root/'deployment-preflight-launcher-manifest.json').read_text());change(manifest)
   raw=json.dumps(manifest).encode();(root/'deployment-preflight-launcher-manifest.json').write_bytes(raw)
   with patch.object(l,'MANIFEST_SHA256',hashlib.sha256(raw).hexdigest()):
    with self.assertRaises(l.Denied):l.verify_preparation(root)
 def test_valid_preparation_never_authorizes(self):
  value=l.verify_preparation(ROOT);self.assertTrue(value['preparationVerified']);self.assertFalse(value['executionAuthorized']);self.assertEqual(value['connectionsOpened'],0);self.assertFalse(value['attemptStateTouched'])
 def test_default_invocation_denied(self):self.assertEqual(l.run([])['errorCode'],'EXECUTION_NOT_AUTHORIZED')
 def test_execution_switch_denied(self):self.assertEqual(l.run(['--execute'])['errorCode'],'EXECUTION_NOT_AUTHORIZED')
 def test_arbitrary_path_denied(self):self.assertEqual(l.run(['--offline-verify','/tmp/foreign'])['errorCode'],'EXECUTION_NOT_AUTHORIZED')
 def test_wrong_project(self):self.modified(lambda m:m.update(project='bsndfhbemstyrrglajat'))
 def test_wrong_sibling(self):self.modified(lambda m:m.update(project='not-the-isolated-project'))
 def test_wrong_branch(self):self.modified(lambda m:m.update(branch='main'))
 def test_authorized_claim_not_accepted(self):self.modified(lambda m:m.update(executionAuthorized=True))
 def test_ready_state_claim_not_accepted(self):self.modified(lambda m:m.update(authorizationState='READY'))
 def test_unreviewed_source(self):self.modified(lambda m:m['sources'].update({'deployment_database_preflight.py':'0'*64}))
 def test_weak_tls_denied(self):self.modified(lambda m:m['guards'].update(tls='require'))
 def test_pooler_denied(self):self.modified(lambda m:m['guards'].update(pooler=True))
 def test_readonly_off_denied(self):self.modified(lambda m:m['guards'].update(readOnly='off'))
 def test_timeout_denied(self):self.modified(lambda m:m['guards'].update(statementTimeout='2min'))
 def test_grant_rearming_denied(self):self.modified(lambda m:m['attempt'].update(rearm='allowed'))
 def test_second_connection_denied(self):self.modified(lambda m:m['attempt'].update(maximumDatabaseConnections=2))
 def test_consume_after_input_denied(self):self.modified(lambda m:m['attempt'].update(consumeBeforeInput=False))
 def test_same_recovery_allowance_denied(self):self.modified(lambda m:m['attempt'].update(separateFromConsumedRecoveryAllowance=False))
 def test_unknown_metadata_denied(self):self.modified(lambda m:m.update(unreviewed=True))
 def test_consumed_attempt_after_restart_denied(self):
  snapshot={'ready':False,'consumed':True,'interrupted':False,'authorizationEnabled':False}
  self.assertEqual(l.state_decision(snapshot),'DENY_CONSUMED_OR_INTERRUPTED');self.assertEqual(l.state_decision(dict(snapshot)),'DENY_CONSUMED_OR_INTERRUPTED')
 def test_ready_and_consumed_ambiguous_denied(self):self.assertEqual(l.state_decision({'ready':True,'consumed':True,'interrupted':False,'authorizationEnabled':False}),'DENY_CONSUMED_OR_INTERRUPTED')
 def test_missing_attempt_denied(self):self.assertEqual(l.state_decision({'ready':False,'consumed':False,'interrupted':False,'authorizationEnabled':False}),'DENY_MISSING')
 def test_interrupted_attempt_denied(self):self.assertEqual(l.state_decision({'ready':False,'consumed':False,'interrupted':True,'authorizationEnabled':False}),'DENY_CONSUMED_OR_INTERRUPTED')
 def test_offline_snapshot_never_execution_authority(self):
  for enabled in (True,False):self.assertEqual(l.state_decision({'ready':True,'consumed':False,'interrupted':False,'authorizationEnabled':enabled}),'DENY_EXECUTION_NOT_AUTHORIZED')
 def test_bad_snapshot_types_denied(self):
  for value in ({},None,{'ready':1,'consumed':False,'interrupted':False,'authorizationEnabled':False}):self.assertEqual(l.state_decision(value),'DENY_AMBIGUOUS')
 def test_no_spent_kit_reference_or_mutation(self):
  source=(ROOT/'deployment-preflight-launcher.py').read_text()
  for text in ('wave10ie-qjks-recovery','os.rename','os.replace','getpass(','create_native_driver(','.write_text(','.write_bytes(','os.mkdir'):
   self.assertNotIn(text,source)
 def test_shell_is_disabled_and_pins_launcher(self):
  command=(ROOT/'deployment-preflight-launch.command').read_text();sha=hashlib.sha256((ROOT/'deployment-preflight-launcher.py').read_bytes()).hexdigest()
  self.assertIn(sha,command);self.assertIn(l.MANIFEST_SHA256,command);self.assertIn('EXECUTION_NOT_AUTHORIZED',command);self.assertNotIn('wave10ie-qjks-recovery',command)

if __name__=='__main__':unittest.main()
