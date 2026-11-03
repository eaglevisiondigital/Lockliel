"""Offline only. Native execution, network and password input are prohibited."""
import copy
import ctypes
import getpass
import importlib.util
import json
import re
import socket
import unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
def load(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
f=load('old_native_fixture',ROOT/'tests/member_hosted_deployment_preflight_test.py')
n=load('fixture_native',ROOT/'scripts/fixture-native/fixture_inventory.py')
LOGINS=['1'*64,'2'*64];SUBJECTS=['3'*64,'4'*64];GRAPH='5'*64;STATE='6'*64

def rows(stage):
 subjects=[]
 if stage=='after':
  for i in range(2):
   subjects.append(dict(subjectSha256=SUBJECTS[i],profileSha256=str(i+7)*64,createdAtSha256=('a','b')[i]*64,loginSha256=LOGINS[i],profileCount=1,confirmed=True,staffRoleCount=0,factorCount=0,sessionCount=0,enrollmentCount=0,progressCount=0,noteCount=0,unexpectedClaimCount=0))
 return dict(triggerGraph=dict(publicTables=list(n.TABLES),graphSha256=GRAPH),collisions=dict(collisionCount=0),protectedState=dict(protectedStateSha256=STATE),bootstrap=[dict(table=k,count=0 if stage=='before' else 2) for k in sorted(n.OWNED)],subjects=subjects)
class Driver(f.Driver):
 def __init__(self,stage='before'):
  super().__init__();self.stage=stage;self.extra=rows(stage);self.queries=dict(n.plan(stage,LOGINS,SUBJECTS if stage=='after' else None))
 def select(self,sql):
  for name,q in self.queries.items():
   if sql==q:
    self.calls.append(sql)
    if self.trigger:self.trigger(self,sql)
    return copy.deepcopy(self.extra[name])
  return super().select(sql)
class Tests(unittest.TestCase):
 def setUp(self):
  self.patches=[]
  for obj,key in [(socket,'socket'),(socket,'getaddrinfo'),(socket,'create_connection'),(getpass,'getpass'),(ctypes,'CDLL')]:
   p=patch.object(obj,key,f.forbidden);p.start();self.patches.append(p)
 def tearDown(self):
  for p in reversed(self.patches):p.stop()
 def inspect(self,d):return n.inspect_owned(d,d.stage,LOGINS,SUBJECTS if d.stage=='after' else None,GRAPH,dict(protectedStateSha256=STATE) if d.stage=='after' else None)
 def denied(self,d):
  with self.assertRaises(n.Denied) as e:self.inspect(d)
  self.assertEqual(str(e.exception),'FIXTURE_NATIVE_DENIED');self.assertTrue(d.closed)
 def test_before_receipt_is_not_authority(self):
  d=Driver();r=self.inspect(d);self.assertFalse(r['authority']);self.assertIn('sql_not_executed_in_wave10iq',r['limitations']);self.assertTrue(r['receipt']['safeguards']['rolledBack']);self.assertEqual(d.calls[-1],'ROLLBACK')
 def test_after_exact_two_comparison_is_not_live_provenance(self):
  r=self.inspect(Driver('after'));self.assertFalse(r['authority']);self.assertEqual([x['label'] for x in r['receipt']['subjects']],['A','B'])
 def test_public_tables_match_historical_ddl_including_numeric_names_and_drops(self):
  tables=set()
  for p in sorted((ROOT/'supabase/migrations').glob('*.sql')):
   for action,name in re.findall(r'\b(create|drop)\s+table\s+(?:if\s+(?:not\s+)?exists\s+)?public\.([a-z0-9_]+)',p.read_text(),re.I):
    if action.lower()=='create':tables.add(name)
    else:tables.discard(name)
  self.assertEqual(list(n.TABLES),sorted(tables));self.assertEqual(len(tables),57)
 def test_only_fixed_selects_no_secret_columns(self):
  for _,sql in n.plan('after',LOGINS,SUBJECTS):
   self.assertTrue(sql.lower().startswith('select '))
   for forbidden in ['encrypted_password','access_token','refresh_token','identity_data','select *','u.raw_user_meta_data'] :self.assertNotIn(forbidden,sql)
 def test_injection_or_duplicate_input_denied_before_begin(self):
  for bad in ["' or true--",'A'*64,LOGINS[0]]:
   d=Driver()
   with self.assertRaises(n.Denied):n.inspect_owned(d,'before',[LOGINS[0],bad],None,GRAPH)
   self.assertTrue(d.closed);self.assertEqual(d.calls,[])
 def test_wrong_project(self):
  d=Driver();d.native_change['host']='db.bsndfhbemstyrrglajat.supabase.co';self.denied(d);self.assertEqual(d.calls,[])
 def test_wrong_sibling(self):
  d=Driver();d.native_change['host']='db.sibling.supabase.co';self.denied(d)
 def test_tls_downgrade(self):
  d=Driver();d.native_change['sslmode']='require';self.denied(d)
 def test_actual_readonly_and_timeouts(self):
  for key,value in [('read_only','off'),('default_read_only','off'),('lock_timeout','0'),('statement_timeout','2min')]:
   d=Driver();d.witness_change[key]=value;self.denied(d)
 def test_connection_replacement(self):
  d=Driver();d.trigger=lambda obj,sql:setattr(obj,'sock',obj.sock+1) if sql==obj.queries['collisions'] else None;self.denied(d)
 def test_transaction_replacement(self):
  d=Driver();d.trigger=lambda obj,sql:setattr(obj,'stamp','other') if sql==obj.queries['collisions'] else None;self.denied(d)
 def test_collision(self):
  d=Driver();d.extra['collisions']['collisionCount']=1;self.denied(d)
 def test_graph_mismatch(self):
  d=Driver();d.extra['triggerGraph']['graphSha256']='0'*64;self.denied(d)
 def test_table_graph_drift(self):
  d=Driver();d.extra['triggerGraph']['publicTables'].pop();self.denied(d)
 def test_old_rows_changed(self):
  d=Driver('after');d.extra['protectedState']['protectedStateSha256']='0'*64;self.denied(d)
 def test_bootstrap_wrong_count(self):
  d=Driver('after');d.extra['bootstrap'][0]['count']=1;self.denied(d)
 def test_privilege_session_course_note_or_claim(self):
  for field in ['staffRoleCount','factorCount','sessionCount','enrollmentCount','progressCount','noteCount','unexpectedClaimCount']:
   d=Driver('after');d.extra['subjects'][0][field]=1;self.denied(d)
 def test_cross_user_or_duplicate(self):
  for field in ['subjectSha256','profileSha256','createdAtSha256','loginSha256']:
   d=Driver('after');d.extra['subjects'][1][field]=d.extra['subjects'][0][field];self.denied(d)
 def test_bool_not_count(self):
  d=Driver();d.extra['collisions']['collisionCount']=False;self.denied(d)
 def test_private_extra_fields_denied(self):
  d=Driver('after');d.extra['subjects'][0]['password']='synthetic-sentinel';self.denied(d)
 def test_wrong_ledger_or_maintenance(self):
  for mutate in [lambda d:d.rows['catalog']['ledger'].pop(),lambda d:d.rows['readiness']['status'].update(paused=False)]:
   d=Driver();mutate(d);self.denied(d)
 def test_readiness_rpc_not_run_after_bad_definition(self):
  d=Driver();d.rows['rpcs'][0]['definitionMd5']='0'*32;self.denied(d);self.assertNotIn(f.n.READINESS_SQL,d.calls)
 def test_rollback_failure_sanitized(self):
  d=Driver();original=d.command
  def cmd(sql):
   if sql=='ROLLBACK':raise RuntimeError('synthetic-secret-never-output')
   return original(sql)
  d.command=cmd;self.denied(d)
 def test_close_failure_sanitized(self):
  d=Driver()
  def close():d.closed=True;raise RuntimeError('synthetic-secret-never-output')
  d.close=close;self.denied(d)
 def test_clock_or_freshness(self):
  for values in [[10_000_000,9_000_000],[1_000_000,300002_000_000]]:
   d=Driver()
   with patch.object(n.time,'time_ns',side_effect=values):self.denied(d)
 def test_unknown_driver_exception_sanitized(self):
  d=Driver();d.trigger=lambda *_:(_ for _ in ()).throw(RuntimeError('synthetic-secret-never-output'));self.denied(d)
 def test_source_pin(self):
  with patch.object(n,'NATIVE_SHA','0'*64):self.denied(Driver())
if __name__=='__main__':unittest.main()
