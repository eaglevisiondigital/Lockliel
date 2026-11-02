"""Synthetic-only launcher tests; no live worker call or user credential input."""
import contextlib
import ctypes
import ssl
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import pty
import select
import shutil
import socket
import subprocess
import sys
import tempfile
import termios
import time
import types
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'scripts/member-hosted/recovery_launcher.py'
PYTHON='/Library/Developer/CommandLineTools/usr/bin/python3' if sys.platform=='darwin' else sys.executable
ENV={'PATH':'/usr/bin:/bin','LANG':'C','LC_ALL':'C'}
def load():
 spec=importlib.util.spec_from_file_location('launcher_test',SOURCE);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
l=load()
ATTEMPTS=[]
def deny(*_args,**_kwargs):ATTEMPTS.append('forbidden I/O');raise AssertionError('No live I/O')
socket.socket=socket.create_connection=socket.getaddrinfo=deny
ctypes.CDLL=deny

def fixture(root):
 root.mkdir(mode=0o700)
 (root/'kit').mkdir(mode=0o700)
 (root/'READY').mkdir(mode=0o700)
 grant=root/'READY/grant.json';grant.write_text(json.dumps(l.GRANT,sort_keys=True,separators=(',',':'))+'\n');grant.chmod(0o400)

def child(root,body=''):
 code=f'''import importlib.util,pathlib,sys,os
s=importlib.util.spec_from_file_location('reviewed', {str(SOURCE)!r});m=importlib.util.module_from_spec(s);s.loader.exec_module(m);m.ROOT=pathlib.Path({str(root)!r})
try:
 m.consume_attempt()
 print('CLAIMED',flush=True)
 {body or 'pass'}
except BaseException:
 print('DENIED',flush=True)
 sys.exit(1)
'''
 return [PYTHON,'-I','-B','-S','-c',code]


class AttemptTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory(prefix='lockliel-wave10ig-test-');self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name)/'attempt';fixture(self.root);self.context=contextlib.ExitStack();self.addCleanup(self.context.close);self.context.enter_context(patch.object(l,'ROOT',self.root))
 def test_success_consumes_ready_and_preserves_exact_grant(self):
  l.consume_attempt();self.assertFalse((self.root/'READY').exists());self.assertEqual(json.loads((self.root/'CONSUMED/grant.json').read_text()),l.GRANT)
 def test_duplicate_attempt_denied(self):
  l.consume_attempt()
  with self.assertRaises(l.Stop):l.consume_attempt()
 def test_fresh_process_cannot_replay(self):
  a=subprocess.run(child(self.root),capture_output=True,env=ENV);b=subprocess.run(child(self.root),capture_output=True,env=ENV)
  self.assertEqual(a.returncode,0);self.assertEqual(b.returncode,1);self.assertEqual(b.stdout,b'DENIED\n')
 def test_four_concurrent_processes_exactly_one_claim(self):
  children=[subprocess.Popen(child(self.root),stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=ENV) for _ in range(4)]
  outcomes=[(p.communicate(timeout=10),p.returncode) for p in children]
  self.assertEqual(sum(code==0 for _output,code in outcomes),1)
 def test_interrupted_process_remains_consumed(self):
  p=subprocess.Popen(child(self.root,'import time;time.sleep(30)'),stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=ENV)
  try:
   self.assertEqual(p.stdout.readline(),b'CLAIMED\n');p.kill();p.communicate(timeout=5)
  finally:
   if p.poll() is None:p.kill();p.wait()
  retry=subprocess.run(child(self.root),capture_output=True,env=ENV);self.assertEqual(retry.returncode,1)
 def test_deleted_consumed_record_cannot_restore_missing_ready(self):
  l.consume_attempt();shutil.rmtree(self.root/'CONSUMED')
  with self.assertRaises(l.Stop):l.consume_attempt()
  self.assertFalse((self.root/'READY').exists())
 def test_removed_root_cannot_be_automatically_initialized(self):
  shutil.rmtree(self.root)
  with self.assertRaises(l.Stop):l.consume_attempt()
  self.assertFalse(self.root.exists())
 def test_missing_or_malformed_grant_fail_closed(self):
  for text in ('{}','partial',''):
   p=self.root/'READY/grant.json';p.chmod(0o600);p.write_text(text);p.chmod(0o400)
   with self.assertRaises(l.Stop):l.consume_attempt()
   self.assertFalse((self.root/'CONSUMED').exists())
 def test_production_or_wrong_project_grant_denied(self):
  for project in ('bsndfhbemstyrrglajat','sibling'):
   value={**l.GRANT,'project':project};p=self.root/'READY/grant.json';p.chmod(0o600);p.write_text(json.dumps(value));p.chmod(0o400)
   with self.assertRaises(l.Stop):l.consume_attempt()
 def test_ready_symlink_denied(self):
  (self.root/'READY').rename(self.root/'other');(self.root/'READY').symlink_to(self.root/'other')
  with self.assertRaises(l.Stop):l.consume_attempt()
 def test_unsafe_permissions_denied(self):
  self.root.chmod(0o755)
  with self.assertRaises(l.Stop):l.consume_attempt()
 def test_both_ready_and_consumed_is_ambiguous(self):
  (self.root/'CONSUMED').mkdir()
  with self.assertRaises(l.Stop):l.consume_attempt()
 def test_failed_fsync_after_rename_consumes_without_retrieval(self):
  with patch.object(l.os,'fsync',side_effect=OSError('SYNTHETIC-PRIVATE')):
   with self.assertRaises(l.Stop) as err:l.consume_attempt()
  self.assertEqual(err.exception.code,'ATTEMPT_DURABILITY_FAILED');self.assertFalse((self.root/'READY').exists())
  with self.assertRaises(l.Stop):l.consume_attempt()
 def test_unexpected_file_and_hardlinked_grant_denied(self):
  (self.root/'unrelated').write_text('nonsecret')
  with self.assertRaises(l.Stop):l.consume_attempt()
  (self.root/'unrelated').unlink();os.link(self.root/'READY/grant.json',self.root/'extra')
  with self.assertRaises(l.Stop):l.consume_attempt()


class CompositionTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory(prefix='lockliel-wave10ig-test-');self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name)/'attempt';fixture(self.root);self.stack=contextlib.ExitStack();self.addCleanup(self.stack.close);self.stack.enter_context(patch.object(l,'ROOT',self.root));self.stack.enter_context(patch.object(l.sys,'argv',[str(self.root/'kit/recovery_launcher.py'),'--execute-one-authorized-recovery']));self.stack.enter_context(patch.object(l,'verify_runtime'))
  self.worker=types.SimpleNamespace(CODES={'AUTHORIZATION_REQUIRED','PROVIDER_REDIRECT_DENIED','PROVIDER_RESPONSE_REJECTED','PROVIDER_INTERRUPTED','RECOVERY_FAILED'},PHASES={'operator_authorization','branch_config','database_connect'},_guard=None)
  self.worker._load_guard=lambda:types.SimpleNamespace(validate_ca=lambda ca:ca)
  self.calls=[]
  def run(ca):
   self.assertTrue((self.root/'CONSUMED').is_dir());self.assertFalse((self.root/'READY').exists());self.calls.append(ca)
   return {'ok':False,'errorCode':'AUTHORIZATION_REQUIRED','phase':'operator_authorization','safeguardsVerified':False}
  self.worker.run_once=run;self.stack.enter_context(patch.object(l,'_worker',return_value=self.worker))
 def test_offline_readiness_does_not_consume_or_prompt(self):
  result=l.offline_verify();self.assertTrue(result['ok']);self.assertFalse(result['attemptConsumed']);self.assertEqual(self.calls,[])
  self.assertTrue((self.root/'READY').is_dir());self.assertFalse((self.root/'CONSUMED').exists());self.assertFalse((self.root/'result.json').exists())
 def test_consumption_precedes_private_consumer(self):
  value=l.execute();self.assertFalse(value['ok']);self.assertEqual(len(self.calls),1);self.assertTrue((self.root/'result.json').is_file())
  self.assertEqual(l.execute()['attemptStatus'],'CONSUMED_OR_AMBIGUOUS');self.assertEqual(len(self.calls),1)
 def test_correct_protected_transfer_receipt(self):
  expected={'ok':True,'project':l.PROJECT,'branch':l.BRANCH,'credentialRecovered':True,'authenticationVerified':True,'tlsVerifyFull':True,'hostnameVerified':True,'directIPv6':True,'transactionReadOnly':'on','lockTimeout':'5s','statementTimeout':'30s','sameConnectionAndTransaction':True,'inspectionQueries':2,'rolledBack':True,'connectionClosed':True,'migrationCount':280,'safeguardsVerified':True}
  self.worker.run_once=lambda _ca:expected
  self.assertTrue(l.execute()['ok']);self.assertEqual(json.loads((self.root/'result.json').read_text())['transactionReadOnly'],'on')
 def test_failed_claim_never_reaches_input(self):
  with patch.object(l.os,'fsync',side_effect=OSError('SYNTHETIC-PRIVATE')):value=l.execute()
  self.assertEqual(value['attemptStatus'],'CONSUMED_OR_AMBIGUOUS');self.assertFalse(value['retryAllowed']);self.assertEqual(self.calls,[])
 def test_wrong_arguments_or_dependency_change_never_consumes(self):
  with patch.object(l.sys,'argv',['bad']):self.assertEqual(l.execute()['errorCode'],'EXPLICIT_EXECUTION_REQUIRED')
  self.assertTrue((self.root/'READY').is_dir());self.assertEqual(self.calls,[])
  with patch.object(l,'verify_runtime',side_effect=l.Stop('RUNTIME_MISMATCH')):self.assertEqual(l.execute()['errorCode'],'RUNTIME_MISMATCH')
  self.assertTrue((self.root/'READY').is_dir())
 def test_source_mismatch_denies(self):
  with patch.object(l,'_worker',side_effect=l.Stop('SOURCE_MISMATCH')):self.assertEqual(l.execute()['errorCode'],'SOURCE_MISMATCH')
  self.assertTrue((self.root/'READY').is_dir());self.assertEqual(self.calls,[])
 def test_secret_bearing_exception_no_result_leakage(self):
  def broken(_ca):raise RuntimeError('SYNTHETIC-PRIVATE-DO-NOT-PRINT')
  self.worker.run_once=broken;value=l.execute();self.assertNotIn('SYNTHETIC',json.dumps(value));self.assertFalse(value['ok']);self.assertFalse((self.root/'READY').exists())
 def test_malformed_success_and_reflected_error_denied(self):
  for value in ({'ok':True,'password':'SYNTHETIC'}, {'ok':False,'errorCode':'SYNTHETIC-PRIVATE','phase':'branch_config','safeguardsVerified':False}):
   with self.assertRaises(l.Stop):l._safe_result(value,self.worker)
 def test_redirect_and_malformed_and_interruption_sanitized(self):
  for code in ('PROVIDER_REDIRECT_DENIED','PROVIDER_RESPONSE_REJECTED','PROVIDER_INTERRUPTED'):
   value={'ok':False,'errorCode':code,'phase':'branch_config','safeguardsVerified':False}
   self.assertEqual(l._safe_result(value,self.worker)['errorCode'],code)
 def test_guard_auth_and_connection_failures_are_fixed(self):
  self.worker._guard=types.SimpleNamespace(GUARD_CODES=set(),LOCAL_CODES={'DRIVER_OPERATION_FAILED'},NATIVE_CODES={'AUTHENTICATION_FAILED','CONNECT_TIMEOUT'})
  for code in ('AUTHENTICATION_FAILED','DRIVER_OPERATION_FAILED','CONNECT_TIMEOUT'):
   value={'ok':False,'errorCode':code,'phase':'database_connect','safeguardsVerified':False}
   self.assertEqual(l._safe_result(value,self.worker)['errorCode'],code)
 def test_no_runtime_initializer_or_credential_argument(self):
  source=SOURCE.read_text()
  for forbidden in ('mkdir(', 'unlink(', 'rmtree(', 'getenv(', 'getpass(', 'subprocess.', 'socket.', 'AUTHORIZATION='):
   self.assertNotIn(forbidden,source)
 def test_result_file_never_contains_provider_response(self):
  value=l.execute();content=(self.root/'result.json').read_text();self.assertEqual(json.loads(content),value)
  self.assertNotIn('db_pass',content);self.assertNotIn('Authorization',content)


class PinAndTTYTests(unittest.TestCase):
 def test_worker_and_guard_pinned_to_original_review(self):
  for name,digest in [('supabase_recovery.py',l.WORKER_HASH),('database_preflight.py',l.GUARD_HASH),('recovery-runtime-manifest.json',l.RUNTIME_HASH)]:
   self.assertEqual(hashlib.sha256((ROOT/'scripts/member-hosted'/name).read_bytes()).hexdigest(),digest)
 def test_compile_actual_worker_from_verified_bytes(self):
  worker=l._worker(ROOT/'scripts/member-hosted');self.assertEqual(worker.PROJECT,l.PROJECT);self.assertEqual(worker.BRANCH,l.BRANCH)
 def test_modified_source_cannot_execute(self):
  with patch.object(l,'_read_file',return_value=b'raise RuntimeError()'):
   with self.assertRaises(l.Stop):l._worker(ROOT/'scripts/member-hosted')
 def test_actual_runtime_fingerprint_offline(self):
  code=f"import importlib.util,pathlib;s=importlib.util.spec_from_file_location('m',{str(SOURCE)!r});m=importlib.util.module_from_spec(s);s.loader.exec_module(m);m.verify_runtime(pathlib.Path({str(ROOT/'scripts/member-hosted')!r}));print('RUNTIME_PASS')"
  p=subprocess.run([PYTHON,'-I','-B','-S','-c',code],env=ENV,capture_output=True,timeout=20)
  self.assertEqual(p.returncode,0);self.assertEqual(p.stdout,b'RUNTIME_PASS\n')
 def test_synthetic_hidden_tty_transfer_no_echo(self):
  # Fresh child with controlling pseudoTTY; synthetic input only, no API/DB path.
  pid,master=pty.fork()
  if pid==0:
   try:
    worker=l._worker(ROOT/'scripts/member-hosted')
    value=worker._authorization()
    expected=bytearray('sbp_'+'a'*40,'ascii')
    good=value==expected;worker._wipe(value);worker._wipe(expected)
    os.write(1,b'\nSYNTHETIC_HIDDEN_INPUT_PASS\n' if good else b'FAIL\n')
    os._exit(0 if good else 1)
   except BaseException:os._exit(1)
  data=b''
  try:
   deadline=time.monotonic()+5
   while b'(hidden): ' not in data:
    self.assertLess(time.monotonic(),deadline)
    if select.select([master],[],[],0.2)[0]:data+=os.read(master,4096)
   self.assertFalse(termios.tcgetattr(master)[3]&termios.ECHO)
   os.write(master,('sbp_'+'a'*40+'\n').encode())
   while b'SYNTHETIC_HIDDEN_INPUT_PASS' not in data:
    self.assertLess(time.monotonic(),deadline)
    if select.select([master],[],[],0.2)[0]:data+=os.read(master,4096)
   self.assertNotIn(('sbp_'+'a'*40).encode(),data)
   _pid,status=os.waitpid(pid,0);self.assertEqual(status,0)
  finally:
   os.close(master)
   try:os.kill(pid,9);os.waitpid(pid,0)
   except ProcessLookupError:pass
 def test_no_forbidden_network(self):self.assertEqual(ATTEMPTS,[])

if __name__=='__main__':
 result=unittest.main(exit=False)
 if ATTEMPTS:raise SystemExit('Forbidden offline I/O attempt')
 raise SystemExit(not result.result.wasSuccessful())
