"""Offline worker denial tests: no credentials, DB, private kit or provider access."""
import importlib.util,json,socket,subprocess,sys,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location('fixture_worker',ROOT/'scripts/fixture-native/fixture_native_worker.py')
w=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(w)
class Worker(unittest.TestCase):
 def setUp(self):
  self.patches=[patch.object(socket,'socket',side_effect=AssertionError('network forbidden')),patch.object(socket,'getaddrinfo',side_effect=AssertionError('DNS forbidden'))]
  for p in self.patches:p.start()
 def tearDown(self):
  for p in self.patches:p.stop()
 def payload(self):return {'nonce':'a'*32,'phase':'before','approvalSha256':'b'*64,'password':'SYNTHETIC-ONLY','logins':['a'*64,'b'*64],'subjects':None,'before':None}
 def test_unsupported_payload_stops_before_files(self):
  for value in ({},[],None,{'password':'SYNTHETIC-ONLY'}):
   with patch.object(w,'raw',side_effect=AssertionError('must not read')):
    with self.assertRaises(w.Denied):w.execute(value)
 def test_disabled_installation_stops_before_native(self):
  reads=[]
  def read(path,*args):reads.append(str(path));return b'{"installed":false}'
  with patch.object(w,'raw',side_effect=read):
   with self.assertRaises(w.Denied):w.execute(self.payload())
  self.assertEqual(len(reads),1)
 def test_malformed_nonce_phase_rejected_before_files(self):
  for k,v in [('nonce','not-a-nonce'),('phase','after-delete'),('phase','production')]:
   p=self.payload();p[k]=v
   with patch.object(w,'raw',side_effect=AssertionError('must not read')):
    with self.assertRaises(w.Denied):w.execute(p)
 def test_cli_denies_without_live_input_and_sanitizes_errors(self):
  for args,data in [([],b''),(['--private-fixture-channel'],b'{}'),(['--private-fixture-channel'],b'INVALID-JSON-SYNTHETIC-SECRET')]:
   r=subprocess.run([sys.executable,'-I','-B','-S',str(ROOT/'scripts/fixture-native/fixture_native_worker.py'),*args],input=data,capture_output=True,env={},timeout=3)
   self.assertEqual(r.returncode,1);self.assertEqual(r.stderr,b'');self.assertEqual(json.loads(r.stdout),{'ok':False,'category':'PREFLIGHT_FAILED'});self.assertNotIn(b'SYNTHETIC-SECRET',r.stdout)
if __name__=='__main__':unittest.main()
