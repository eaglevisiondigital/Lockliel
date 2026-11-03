"""Independent offline native security tests. No socket, credentials or PostgreSQL."""
import hashlib,importlib.util,json,os,socket,tempfile,types,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
n=load('fixture_native_security',ROOT/'scripts/fixture-native/fixture_inventory.py')
w=load('fixture_worker_security',ROOT/'scripts/fixture-native/fixture_native_worker.py')
LOGINS=['a'*64,'b'*64]
class FakeLib:
 def __init__(self):self.cleared=0;self.data=b'{"safe":true}'
 def PQntuples(self,r):return 1
 def PQnfields(self,r):return 1
 def PQgetisnull(self,r,a,b):return 0
 def PQgetlength(self,r,a,b):return len(self.data)
 def PQgetvalue(self,r,a,b):return self.data
 def PQclear(self,r):self.cleared+=1
class Base:
 calls=[];reject=False
 def __init__(self,ca,password):
  Base.calls.append((ca,type(password),password=='SYNTHETIC-PRIVATE-ONLY'));self.lib=FakeLib();self.status=2;self.queries=[]
  if Base.reject:raise RuntimeError('SYNTHETIC-RAW-NATIVE-CANARY')
 def transaction_status(self):return self.status
 def _exec(self,sql,status):self.queries.append(sql);return object()
def require(x,message):
 if not x:raise n.Denied()
FAKE=types.SimpleNamespace(load_guard=lambda:types.SimpleNamespace(DirectLibpq=Base,GUARD_SQL='select guard',require=require),load_baseline=lambda:{},inspections=lambda a,b:())
class NativeSecurity(unittest.TestCase):
 def setUp(self):
  Base.calls=[];Base.reject=False;self.patches=[patch.object(socket,'socket',side_effect=AssertionError('NO_NETWORK')),patch.object(socket,'getaddrinfo',side_effect=AssertionError('NO_DNS')),patch.object(n,'_load_native',return_value=FAKE)]
  for p in self.patches:p.start()
 def tearDown(self):
  for p in reversed(self.patches):p.stop()
 def driver(self):return n.create_fixed_driver('/private/tmp/SYNTHETIC-CA',bytearray(b'SYNTHETIC-PRIVATE-ONLY'),'before',LOGINS,None)
 def test_exact_mutable_to_ephemeral_string_handoff(self):
  self.driver();self.assertEqual(Base.calls,[('/private/tmp/SYNTHETIC-CA',str,True)])
 def test_bad_password_types_and_invalid_utf8_never_construct_driver(self):
  for value in ('SYNTHETIC',b'SYNTHETIC',None,bytearray(),bytearray(b'x'*4097),bytearray(b'\xff')):
   with self.assertRaisesRegex(n.Denied,'^FIXTURE_NATIVE_DENIED$'):n.create_fixed_driver('/private/tmp/SYNTHETIC-CA',value,'before',LOGINS,None)
  self.assertEqual(Base.calls,[])
 def test_constructor_raw_error_sanitized(self):
  Base.reject=True
  with self.assertRaisesRegex(n.Denied,'^FIXTURE_NATIVE_DENIED$'):self.driver()
 def test_sql_allowlist_and_actual_transaction_required(self):
  d=self.driver()
  for sql in ('select 1','select guard; delete from auth.users','set transaction read write',None):
   with self.assertRaises(n.Denied):d.select(sql)
  self.assertEqual(d.queries,[]);d.status=0
  with self.assertRaises(n.Denied):d.select('select guard')
  self.assertEqual(d.queries,[])
 def test_allowed_query_parses_one_bounded_field_and_clears_result(self):
  d=self.driver();self.assertEqual(d.select('select guard'),{'safe':True});self.assertEqual(d.lib.cleared,1)
  d.lib.data=b'{SYNTHETIC-RAW-CANARY'
  with self.assertRaisesRegex(n.Denied,'^FIXTURE_NATIVE_DENIED$'):d.select('select guard')
  self.assertEqual(d.lib.cleared,2)
 def test_malformed_identity_inputs_stop_before_constructor(self):
  for phase,logins,subjects in [('production',LOGINS,None),('before',[LOGINS[0]]*2,None),('after',LOGINS,['bad','bad'])]:
   with self.assertRaises(n.Denied):n.create_fixed_driver('/private/tmp/SYNTHETIC-CA',bytearray(b'SYNTHETIC'),phase,logins,subjects)
  self.assertEqual(Base.calls,[])
class WorkerFiles(unittest.TestCase):
 def test_nonsecret_private_marker_denies_symlink_hardlink_bad_mode(self):
  with tempfile.TemporaryDirectory(prefix='lockliel-fixture-worker-security-',dir='/private/tmp') as name:
   p=Path(name)/'marker';p.write_bytes(b'consumed\n');p.chmod(0o400);self.assertEqual(w.raw(p,mode=0o400),b'consumed\n')
   link=Path(name)/'link';link.symlink_to(p)
   with self.assertRaises((OSError,w.Denied)):w.raw(link,mode=0o400)
   hard=Path(name)/'hard';os.link(p,hard)
   with self.assertRaises(w.Denied):w.raw(p,mode=0o400)
   hard.unlink();p.chmod(0o600)
   with self.assertRaises(w.Denied):w.raw(p,mode=0o400)
 def test_oversized_private_marker_denies(self):
  with tempfile.TemporaryDirectory(prefix='lockliel-fixture-worker-security-',dir='/private/tmp') as name:
   p=Path(name)/'marker';p.write_bytes(b'x'*20);p.chmod(0o400)
   with self.assertRaises(w.Denied):w.raw(p,limit=10,mode=0o400)
if __name__=='__main__':unittest.main()
