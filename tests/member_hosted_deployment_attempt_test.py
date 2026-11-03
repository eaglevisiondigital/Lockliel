"""Durable attempt primitive tests on exclusively disposable nonsecret fixtures."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
MODULE=ROOT/'scripts/member-hosted/deployment_preflight_attempt.py'
spec=importlib.util.spec_from_file_location('attempt',MODULE);a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
NOW=1762128000000

def grant():return {'authorization':'wave10il-one-deployment-preflight','project':a.PROJECT,'branch':a.BRANCH,'maximumDatabaseConnections':1,'executionEnabled':True,'notBefore':NOW-1000,'expiresAt':NOW+100000,'grantId':'a'*32,'operatorSha256':'0'*64,**a.PINS}

class AttemptTests(unittest.TestCase):
 def setUp(self):
  self.base=Path(tempfile.mkdtemp(prefix='lk-attempt-test-',dir='/private/tmp'));self.root=self.base/'state';self.root.mkdir(mode=0o700);self.ready=self.root/'READY';self.ready.mkdir(mode=0o700)
  self.value=grant();self.file=self.ready/'grant.json';self.file.write_text(json.dumps(self.value));self.file.chmod(0o400);self.ready.chmod(0o500)
  self.clock=patch.object(a.time,'time_ns',return_value=NOW*1000000);self.clock.start()
 def tearDown(self):
  self.clock.stop()
  for p in self.base.rglob('*'):
   if p.is_dir() and not p.is_symlink():p.chmod(0o700)
  shutil.rmtree(self.base)
 def consume(self):return a.consume_at(self.root,self.value)
 def denied(self,code=None):
  with self.assertRaises(a.AttemptError) as e:self.consume()
  if code:self.assertEqual(e.exception.code,code)
 def test_consumed_durable_once_before_any_input(self):
  output=self.consume();self.assertTrue(output['attemptConsumed']);self.assertFalse(output['credentialsRequested']);self.assertEqual(output['connectionsOpened'],0)
  self.assertEqual(set(p.name for p in self.root.iterdir()),{'CONSUMED'});self.assertEqual((self.root/'CONSUMED/grant.json').read_text(),json.dumps(self.value));self.denied('ATTEMPT_ALREADY_CONSUMED')
 def test_consumed_after_new_module_process(self):
  self.consume()
  child="import importlib.util,json,sys;from pathlib import Path;s=importlib.util.spec_from_file_location('a',sys.argv[1]);a=importlib.util.module_from_spec(s);s.loader.exec_module(a);a.time.time_ns=lambda:int(sys.argv[4])*1000000\ntry:a.consume_at(Path(sys.argv[2]),json.loads(sys.argv[3]));print('UNEXPECTED')\nexcept a.AttemptError as e:print(e.code)"
  out=subprocess.run([sys.executable,'-I','-B','-S','-c',child,str(MODULE),str(self.root),json.dumps(self.value),str(NOW)],capture_output=True,text=True,check=True)
  self.assertEqual(out.stdout.strip(),'ATTEMPT_ALREADY_CONSUMED')
 def test_parent_fsync_failure_still_spent(self):
  with patch.object(a.os,'fsync',side_effect=OSError('SYNTHETIC-DO-NOT-EMIT')):self.denied('ATTEMPT_DURABILITY_FAILED')
  self.assertTrue((self.root/'CONSUMED').is_dir());self.assertFalse(self.ready.exists());self.denied('ATTEMPT_ALREADY_CONSUMED')
 def test_interruption_after_rename_is_not_reset(self):
  real=a.os.rename
  def interrupt(*args,**kwargs):real(*args,**kwargs);raise KeyboardInterrupt()
  with patch.object(a.os,'rename',side_effect=interrupt):self.denied('ATTEMPT_UNAVAILABLE')
  self.denied('ATTEMPT_ALREADY_CONSUMED')
 def test_interrupted_before_rename_never_authorizes(self):
  with patch.object(a.os,'rename',side_effect=KeyboardInterrupt()):self.denied('ATTEMPT_UNAVAILABLE')
  self.assertTrue(self.ready.exists())
 def test_concurrent_processes_only_one_can_consume(self):
  child="import importlib.util,json,sys;from pathlib import Path;s=importlib.util.spec_from_file_location('a',sys.argv[1]);a=importlib.util.module_from_spec(s);s.loader.exec_module(a);a.time.time_ns=lambda:int(sys.argv[4])*1000000\ntry:a.consume_at(Path(sys.argv[2]),json.loads(sys.argv[3]));print('SUCCESS')\nexcept a.AttemptError as e:print(e.code)"
  command=[sys.executable,'-I','-B','-S','-c',child,str(MODULE),str(self.root),json.dumps(self.value),str(NOW)]
  processes=[subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True) for _ in range(2)]
  outputs=[p.communicate(timeout=10)[0].strip() for p in processes];self.assertEqual(outputs.count('SUCCESS'),1);self.assertTrue(set(outputs)-{'SUCCESS'}<={'ATTEMPT_BUSY','ATTEMPT_ALREADY_CONSUMED'})
 def test_root_symlink_denied(self):
  alias=self.base/'alias';alias.symlink_to(self.root,target_is_directory=True)
  with self.assertRaises(a.AttemptError):a.consume_at(alias,self.value)
 def test_ready_symlink_denied(self):
  self.ready.chmod(0o700);self.file.unlink();self.ready.rmdir();self.ready.symlink_to(self.base,target_is_directory=True);self.denied()
 def test_grant_symlink_denied(self):
  target=self.base/'grant';target.write_text(json.dumps(self.value));target.chmod(0o400);self.ready.chmod(0o700);self.file.unlink();self.file.symlink_to(target);self.ready.chmod(0o500);self.denied()
 def test_grant_hardlink_denied(self):
  os.link(self.file,self.base/'link');self.denied()
 def test_wrong_owner_denied(self):
  with patch.object(a.os,'getuid',return_value=os.getuid()+1):self.denied()
 def test_root_permissions_denied(self):self.root.chmod(0o755);self.denied()
 def test_ready_permissions_denied(self):self.ready.chmod(0o700);self.denied()
 def test_grant_permissions_denied(self):self.file.chmod(0o600);self.denied()
 def test_extra_file_denied(self):(self.root/'unexpected').write_text('nonsecret');self.denied()
 def test_missing_state_denied(self):self.ready.chmod(0o700);self.file.unlink();self.ready.rmdir();self.denied()
 def test_ready_and_consumed_denied(self):(self.root/'CONSUMED').mkdir();self.denied('ATTEMPT_ALREADY_CONSUMED')
 def test_grant_payload_mismatch_denied(self):
  self.file.chmod(0o600);self.file.write_text('{}');self.file.chmod(0o400);self.denied('ATTEMPT_GRANT_REJECTED')
 def test_production_grant_denied(self):self.value['project']='bsndfhbemstyrrglajat';self.denied('ATTEMPT_GRANT_REJECTED')
 def test_wrong_sibling_denied(self):self.value['project']='different-isolated';self.denied('ATTEMPT_GRANT_REJECTED')
 def test_wrong_source_denied(self):self.value['nativeSha256']='0'*64;self.denied('ATTEMPT_GRANT_REJECTED')
 def test_extra_secret_field_denied(self):self.value['password']='SYNTHETIC-DO-NOT-EMIT';self.denied('ATTEMPT_GRANT_REJECTED')
 def test_disabled_grant_denied(self):self.value['executionEnabled']=False;self.denied('ATTEMPT_GRANT_REJECTED')
 def test_expired_grant_denied(self):self.value['expiresAt']=NOW;self.denied('ATTEMPT_GRANT_REJECTED')
 def test_future_grant_denied(self):self.value['notBefore']=NOW+1;self.denied('ATTEMPT_GRANT_REJECTED')
 def test_silent_ttl_extension_denied(self):self.value['expiresAt']=NOW+300001;self.denied('ATTEMPT_GRANT_REJECTED')
 def test_duplicate_connection_allowance_denied(self):self.value['maximumDatabaseConnections']=2;self.denied('ATTEMPT_GRANT_REJECTED')
 def test_numeric_boolean_denied(self):self.value['executionEnabled']=1;self.denied('ATTEMPT_GRANT_REJECTED')
 def test_expiry_during_validation_denied_before_rename(self):
  with patch.object(a.time,'time_ns',side_effect=[NOW*1000000,(NOW+100001)*1000000]):self.denied('ATTEMPT_GRANT_REJECTED')
  self.assertTrue(self.ready.exists())
 def test_expiry_after_fsync_consumes_but_never_authorizes(self):
  with patch.object(a.time,'time_ns',side_effect=[NOW*1000000,NOW*1000000,(NOW+100001)*1000000]):self.denied('ATTEMPT_GRANT_REJECTED')
  self.assertTrue((self.root/'CONSUMED').exists());self.denied('ATTEMPT_ALREADY_CONSUMED')
 def test_clock_rollback_before_consumption_denied(self):
  with patch.object(a.time,'time_ns',side_effect=[NOW*1000000,(NOW-1)*1000000]):self.denied('ATTEMPT_GRANT_REJECTED')
 def test_busy_owner_lock_denied(self):
  with patch.object(a.fcntl,'flock',side_effect=BlockingIOError()):self.denied('ATTEMPT_BUSY')
 def test_failure_codes_never_include_raw_exceptions(self):
  with patch.object(a.os,'rename',side_effect=OSError('SYNTHETIC-DO-NOT-EMIT')):
   with self.assertRaises(a.AttemptError) as e:self.consume()
  self.assertEqual(str(e.exception),'ATTEMPT_UNAVAILABLE')
 def test_no_initializer_reset_prompt_or_driver(self):
  text=MODULE.read_text()
  for s in ('O_CREAT','mkdir(','getpass','create_native_driver','socket.','wave10ie-qjks-recovery/kit'):
   self.assertNotIn(s,text)

if __name__=='__main__':unittest.main()
