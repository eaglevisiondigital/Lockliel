"""Source-pinned protected native worker, locally prepared and disabled.
No import-time input, state mutation, network or native-library loading. The
concrete private producer below is unavailable without a separately reviewed
source-sealed installation. It never imports or touches the spent J kit.
"""
import ctypes as C
import hashlib
import json
import os
from pathlib import Path
import re
import resource
import stat
import sys
import threading
import time
import types

PROJECT='qjksggxorghaxvpyslip'
BRANCH='course-cutover-rehearsal-274'
BRANCH_ID='7091bfd6-83ce-4c11-ac30-8ce85e09be2d'
HOST='db.'+PROJECT+'.supabase.co'
VERSION='lockliel-deployment-native-preflight-v2'
ROOT=Path(__file__).resolve().parent
MANIFEST_SHA256='3f026b414ea49a182d0ecf50e23bad9998e9b277df0111bddac47e84617cf90c'
PERMIT_PATH=Path('/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10im-deployment-preflight-authorization.json')
ATTEMPT_ROOT=Path('/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10im-deployment-preflight')
CODES=frozenset('SOURCE_MISMATCH EXECUTION_NOT_AUTHORIZED PROTECTED_CHANNEL_REJECTED IDENTITY_MAPPING_REJECTED IDENTITY_MAPPING_EXPIRED SYNTHETIC_PROVENANCE_MISMATCH NATIVE_WORKER_FAILED OUTPUT_BOUNDARY_UNAVAILABLE PREFLIGHT_CLOCK_INVALID'.split())
_used=False

class WorkerError(Exception):
 def __init__(self,code):self.code=code if code in CODES else 'NATIVE_WORKER_FAILED';super().__init__(self.code)
def need(value,code='SOURCE_MISMATCH'):
 if not value:raise WorkerError(code)
def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()
def sha(value):return hashlib.sha256(canonical(value)).hexdigest()
def _raw(path,digest,limit=2000000):
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC)
 try:
  before=os.fstat(fd);need(stat.S_ISREG(before.st_mode) and before.st_uid==os.getuid() and not before.st_mode&0o022 and before.st_nlink==1 and 0<before.st_size<=limit)
  raw=os.read(fd,limit+1);after=os.fstat(fd)
  need(len(raw)==before.st_size and (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and hashlib.sha256(raw).hexdigest()==digest)
  return raw
 finally:os.close(fd)
def _module(name,digest):
 path=ROOT/name;raw=_raw(path,digest);mod=types.ModuleType('_pinned_'+name.replace('.','_'));mod.__file__=str(path);exec(compile(raw,str(path),'exec'),mod.__dict__);return mod

def preparation():
 value=json.loads(_raw(ROOT/'deployment-native-worker-manifest.json',MANIFEST_SHA256))
 need(value['version']=='lockliel-deployment-native-worker-template-v2' and value['project']==PROJECT and value['branch']==BRANCH and value['applicationSource']=='327ba098628f70aa65140862b8b14cd709bfd711')
 need(value['executionAuthorized'] is False and value['authorizationState']=='NOT_AUTHORIZED' and value['operatorSeal'] is None and value['identityApproval'] is None)
 need(value['attemptRoot']==str(ATTEMPT_ROOT) and value['maximumDatabaseConnections']==1 and value['passwordChannel']=='hidden-local-tty-only')
 for name,digest in value['sourceHashes'].items():need('/' not in name and re.fullmatch(r'[0-9a-f]{64}',digest) is not None);_raw(ROOT/name,digest)
 return value

def validate_mapping(value,now_ms):
 need(type(value) is dict and set(value)=={'version','project','branch','branchId','issuedAt','expiresAt','evidence','subjects'},'IDENTITY_MAPPING_REJECTED')
 need(value['version']=='lockliel-synthetic-identity-mapping-v1' and value['project']==PROJECT and value['branch']==BRANCH and value['branchId']==BRANCH_ID,'IDENTITY_MAPPING_REJECTED')
 issued=value['issuedAt'];expires=value['expiresAt'];need(type(now_ms) is int and type(issued) is int and type(expires) is int and 0<issued<=now_ms<expires and expires-issued<=86400000,'IDENTITY_MAPPING_EXPIRED')
 evidence=value['evidence'];need(type(evidence) is dict and set(evidence)=={'source','approvalId','recordSha256','verifiedAt'},'IDENTITY_MAPPING_REJECTED')
 need(evidence['source']=='independent-approved-synthetic-fixture-record' and type(evidence['approvalId']) is str and re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._:-]{0,95}',evidence['approvalId']) is not None and type(evidence['recordSha256']) is str and re.fullmatch(r'[0-9a-f]{64}',evidence['recordSha256']) is not None,'IDENTITY_MAPPING_REJECTED')
 need(type(evidence['verifiedAt']) is int and 0<evidence['verifiedAt']<=issued and issued-evidence['verifiedAt']<=86400000,'IDENTITY_MAPPING_REJECTED')
 subjects=value['subjects'];need(type(subjects) is list and len(subjects)==2,'IDENTITY_MAPPING_REJECTED')
 for index,row in enumerate(subjects):
  need(type(row) is dict and set(row)=={'label','subjectSha256','profileSha256','createdAtSha256','loginSha256'} and row['label']==('A','B')[index],'IDENTITY_MAPPING_REJECTED')
  for key in ('subjectSha256','profileSha256','createdAtSha256','loginSha256'):need(type(row[key]) is str and re.fullmatch(r'[0-9a-f]{64}',row[key]) is not None,'IDENTITY_MAPPING_REJECTED')
 for key in ('subjectSha256','profileSha256','createdAtSha256','loginSha256'):need(subjects[0][key]!=subjects[1][key],'IDENTITY_MAPPING_REJECTED')
 return value

IDENTITY_SQL='''select coalesce(pg_catalog.json_agg(pg_catalog.json_build_object(
 'subjectSha256',pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to('lockliel:qjks:auth:'||u.id::text,'UTF8')),'hex'),
 'profileSha256',pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to('lockliel:qjks:profile:'||u.id::text,'UTF8')),'hex'),
 'createdAtSha256',pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to('lockliel:qjks:created:'||pg_catalog.to_char(u.created_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'UTF8')),'hex'),
 'loginSha256',pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to('lockliel:qjks:login:'||pg_catalog.lower(pg_catalog.btrim(u.email)),'UTF8')),'hex'),
 'profileCount',(select count(*) from public.profiles p where p.id=u.id),
 'confirmed',u.email_confirmed_at is not null,
 'staffRoleCount',(select count(*) from public.staff_roles s where s.profile_id=u.id)) order by u.id),'[]'::json) from auth.users u;'''

def verify_subject_rows(rows,mapping):
 need(type(rows) is list and len(rows)<=100000,'SYNTHETIC_PROVENANCE_MISMATCH')
 seen=set()
 for row in rows:
  need(type(row) is dict and set(row)=={'subjectSha256','profileSha256','createdAtSha256','loginSha256','profileCount','confirmed','staffRoleCount'},'SYNTHETIC_PROVENANCE_MISMATCH')
  for key in ('subjectSha256','profileSha256','createdAtSha256','loginSha256'):need(type(row[key]) is str and re.fullmatch(r'[0-9a-f]{64}',row[key]) is not None,'SYNTHETIC_PROVENANCE_MISMATCH')
  need(row['subjectSha256'] not in seen,'SYNTHETIC_PROVENANCE_MISMATCH');seen.add(row['subjectSha256'])
  need(type(row['profileCount']) is int and type(row['staffRoleCount']) is int and type(row['confirmed']) is bool,'SYNTHETIC_PROVENANCE_MISMATCH')
 for expected in mapping['subjects']:
  matches=[row for row in rows if row['subjectSha256']==expected['subjectSha256']]
  need(len(matches)==1,'SYNTHETIC_PROVENANCE_MISMATCH');actual=matches[0]
  need(all(actual[k]==expected[k] for k in ('subjectSha256','profileSha256','createdAtSha256','loginSha256')) and actual['profileCount']==1 and actual['confirmed'] is True and actual['staffRoleCount']==0,'SYNTHETIC_PROVENANCE_MISMATCH')
 return {'syntheticProvenanceVerified':True,'mappingSha256':sha(mapping),'provenanceRecordSha256':mapping['evidence']['recordSha256'],'subjectsVerified':['A','B']}

def _inspect_owned(driver,native,mapping,nonce):
 """Fixed v2 inventory, exact new statement counters; never reuse J receipt."""
 result=None;started=time.time_ns()//1000000;guard=native.load_guard();baseline=native.load_baseline();queries=(*native.inspections(baseline,guard),('identityMapping',IDENTITY_SQL));counts={'inspection':0,'witness':0}
 try:
  validate_mapping(mapping,started);need(type(nonce) is str and re.fullmatch(r'[0-9a-f]{32}',nonce) is not None,'PROTECTED_CHANNEL_REJECTED')
  initial=driver.identity();connection=guard.validate_native(initial);guard.require(initial.get('transaction_status')==0,'CONNECTION_NOT_IDLE');driver.command('BEGIN READ ONLY')
  def witness(anchor=None):
   guard.require(guard.validate_native(driver.identity())==connection and driver.transaction_status()==2,'CONNECTION_REPLACED');row=driver.select(guard.GUARD_SQL);counts['witness']+=1;current=guard.validate_witness(row,connection[2]);guard.require(guard.validate_native(driver.identity())==connection and driver.transaction_status()==2,'CONNECTION_REPLACED');guard.require(anchor is None or current==anchor,'TRANSACTION_REPLACED');return current,row
  anchor,first=witness();rows={}
  for name,sql in queries:
   witness(anchor);rows[name]=driver.select(sql);counts['inspection']+=1;witness(anchor)
   if name=='catalog':native.need(native.digest(native.catalog_canonical(rows[name]))==baseline['catalogSha256'],'CATALOG_DRIFT')
   if name=='rpcs':native.validate_rpc_rows(rows[name],baseline)
  identity_rows=rows.pop('identityMapping');verified=native.validate_inventory(rows,baseline);verified.update(verify_subject_rows(identity_rows,mapping));verified.pop('blockedReasons',None)
  result={'version':VERSION,'source':'direct-native-deployment-preflight','runNonce':nonce,'project':PROJECT,'host':HOST,'database':'postgres','observedStartedAt':started,'startupOptionsVerified':True,'backendPid':anchor[0],'transactionStartedAt':anchor[1],'tlsVersion':first['tls'],'cipher':first['cipher'],'tlsVerifyFull':True,'hostnameVerified':True,'directIPv6':True,'transactionReadOnly':first['read_only'],'lockTimeout':first['lock_timeout'],'statementTimeout':first['statement_timeout'],'samePhysicalConnection':True,'sameTransaction':True,'noReconnect':True,'noDataWrites':True,'inspectionQueries':counts['inspection'],'witnessQueries':counts['witness'],'totalStatements':counts['inspection']+counts['witness']+2,'ledger':280,'baseline':{k:baseline[k] for k in ('versionsSha256','migration280StatementsArrayTextMd5','migration280SourceSha256')},'paused':True,'schemaReady':True,'protocol':'278-v1','rlsAll':True,'notesServiceTablePrivileges':0,'notesServiceColumnPrivileges':0,'branchIdentity':{'source':'historical-provider-metadata-2026-11-02','branch':BRANCH,'branchId':BRANCH_ID,'fresh':False},'callerRestVerified':False,**verified}
 finally:
  try:
   if driver.connected() and driver.transaction_status() in (2,3):
    driver.command('ROLLBACK');guard.require(driver.transaction_status()==0,'ROLLBACK_NOT_VERIFIED')
    if result is not None:result['rolledBack']=True
  finally:driver.close()
 ended=time.time_ns()//1000000;validate_mapping(mapping,ended);need(type(ended) is int and 0<started<=ended and ended-started<=300000,'PREFLIGHT_CLOCK_INVALID')
 need(result is not None and result.get('rolledBack') is True,'NATIVE_WORKER_FAILED');result.update(observedAt=ended,connectionClosed=True,nativeInventoryVerified=True,deploymentReady=False)
 return {'ok':True,'receipt':result}

def inspect_owned(driver,native,mapping,nonce):
 try:return _inspect_owned(driver,native,mapping,nonce)
 finally:driver.close()

def create_driver(ca,password,native):
 guard=native.load_guard();allowed=frozenset([guard.GUARD_SQL,IDENTITY_SQL]+[sql for _,sql in native.inspections()])
 class FixedWorkerDriver(guard.DirectLibpq):
  def select(self,sql):
   guard.require(type(sql) is str and sql in allowed and self.transaction_status()==2,'UNGUARDED_QUERY_DENIED');result=self._exec(sql,2)
   try:
    guard.require(self.lib.PQntuples(result)==1 and self.lib.PQnfields(result)==1 and not self.lib.PQgetisnull(result,0,0),'QUERY_SHAPE_DENIED');guard.require(self.lib.PQgetlength(result,0,0)<=1048576,'QUERY_RESULT_TOO_LARGE');return json.loads(self.lib.PQgetvalue(result,0,0).decode('utf-8'))
   except (ValueError,UnicodeError):raise guard.GuardError('QUERY_SHAPE_DENIED') from None
   finally:self.lib.PQclear(result)
 return FixedWorkerDriver(ca,password)

def _private_record(path,digest=None):
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC)
 try:
  info=os.fstat(fd);need(stat.S_ISREG(info.st_mode) and info.st_uid==os.getuid() and stat.S_IMODE(info.st_mode)==0o400 and info.st_nlink==1 and 0<info.st_size<=16384,'EXECUTION_NOT_AUTHORIZED')
  raw=os.read(fd,16385);after=os.fstat(fd);need(len(raw)==info.st_size and (info.st_dev,info.st_ino,info.st_size,info.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns),'EXECUTION_NOT_AUTHORIZED')
  if digest is not None:need(hashlib.sha256(raw).hexdigest()==digest,'EXECUTION_NOT_AUTHORIZED')
  return json.loads(raw)
 finally:os.close(fd)

def validate_owner_permit(value,now_ms):
 keys={'version','authorization','project','branch','branchId','applicationSource','workerSha256','manifestSha256','grantSha256','identityMappingSha256','identityApproval','issuedAt','expiresAt','maximumDatabaseConnections'}
 need(type(value) is dict and set(value)==keys,'EXECUTION_NOT_AUTHORIZED')
 need(value['version']=='lockliel-deployment-native-owner-permit-v1' and value['authorization']=='wave10im-one-native-preflight' and value['project']==PROJECT and value['branch']==BRANCH and value['branchId']==BRANCH_ID and value['applicationSource']=='327ba098628f70aa65140862b8b14cd709bfd711','EXECUTION_NOT_AUTHORIZED')
 for key in ('workerSha256','manifestSha256','grantSha256','identityMappingSha256'):need(type(value[key]) is str and re.fullmatch(r'[0-9a-f]{64}',value[key]) is not None,'EXECUTION_NOT_AUTHORIZED')
 need(type(now_ms) is int and type(value['issuedAt']) is int and type(value['expiresAt']) is int and 0<value['issuedAt']<=now_ms<value['expiresAt'] and value['expiresAt']-value['issuedAt']<=300000 and type(value['maximumDatabaseConnections']) is int and value['maximumDatabaseConnections']==1,'EXECUTION_NOT_AUTHORIZED')
 need(value['workerSha256']==hashlib.sha256(Path(__file__).read_bytes()).hexdigest() and value['manifestSha256']==MANIFEST_SHA256,'SOURCE_MISMATCH')
 return value

def _execute_sealed(manifest,channel,permit):
 """Concrete protected implementation. Caller callbacks are not accepted.
 Current pinned template cannot reach this branch: sealing requires separate
 owner-reviewed source/authority installation, not caller JSON booleans.
 """
 password=plain=driver=None;consumed=False;attempt_status='NOT_STARTED';boundary=None;guard=None;phase='local_setup'
 try:
  permit=validate_owner_permit(permit,time.time_ns()//1000000)
  # Owner/OS-private installation is the authority, never caller configuration.
  # Static preparation manifest grants no execution authority of its own.
  need(type(channel) is dict and set(channel)=={'runNonce','identityMapping'},'PROTECTED_CHANNEL_REJECTED');nonce=channel['runNonce'];need(type(nonce) is str and re.fullmatch(r'[0-9a-f]{32}',nonce) is not None,'PROTECTED_CHANNEL_REJECTED')
  mapping=validate_mapping(channel['identityMapping'],time.time_ns()//1000000);need(sha(mapping)==permit['identityMappingSha256'] and canonical(mapping['evidence'])==canonical(permit['identityApproval']),'IDENTITY_MAPPING_REJECTED')
  need(sys.flags.isolated==1 and threading.active_count()==1 and sys.gettrace() is None and sys.getprofile() is None,'EXECUTION_NOT_AUTHORIZED');resource.setrlimit(resource.RLIMIT_CORE,(0,0))
  hashes=manifest['sourceHashes'];manual=_module('manual_database_preflight.py',hashes['manual_database_preflight.py']);boundary=manual.load_boundary();boundary._safe_tls_environment();manual.validate_identity()
  runtime=_module('recovery_launcher.py',hashes['recovery_launcher.py']);runtime.verify_runtime(ROOT)
  native=_module('deployment_database_preflight.py',hashes['deployment_database_preflight.py']);guard=native.load_guard();ca=guard.validate_ca(str(ATTEMPT_ROOT.parent/'wave10im-supabase-ca.crt'));need(guard.CA_SHA256==manifest['caSha256'])
  attempt=_module('deployment_preflight_attempt.py',hashes['deployment_preflight_attempt.py']);grant=_private_record(ATTEMPT_ROOT/'READY/grant.json',permit['grantSha256']);need(grant['operatorSha256']==permit['workerSha256']);attempt.validate_grant(grant,time.time_ns()//1000000)
  # No private input or database attempt before durable consumption.
  phase='attempt_consumption';attempt_status='CONSUMED_OR_AMBIGUOUS';attempt.consume_at(ATTEMPT_ROOT,grant);consumed=True;attempt_status='CONSUMED';attempt.validate_grant(grant,time.time_ns()//1000000);validate_owner_permit(permit,time.time_ns()//1000000)
  with boundary._private_output():
   phase='hidden_input';password=manual.hidden_password();attempt.validate_grant(grant,time.time_ns()//1000000);validate_owner_permit(permit,time.time_ns()//1000000);phase='database_connect';plain=password.decode('utf-8')
   try:driver=create_driver(ca,plain,native)
   finally:plain=None;boundary._wipe(password);password=None
   phase='database_inspection';owned=driver;driver=None;result=inspect_owned(owned,native,mapping,nonce)
  result['attemptConsumed']=True;return result
 except BaseException as error:
  # Never copy exception text/native diagnostic/provider response to output.
  code=error.code if type(error) is WorkerError else 'NATIVE_WORKER_FAILED'
  candidate=getattr(error,'code',None)
  if guard is not None and type(candidate) is str and candidate in (guard.GUARD_CODES|guard.LOCAL_CODES|guard.NATIVE_CODES):code=candidate
  return {'ok':False,'errorCode':code,'phase':phase,'attemptConsumed':consumed if attempt_status!='CONSUMED_OR_AMBIGUOUS' else None,'attemptStatus':attempt_status,'retryAllowed':False}
 finally:
  if boundary is not None:boundary._wipe(password)
  elif password is not None:password[:]=b'\0'*len(password)
  plain=None
  if driver is not None:driver.close()

def run_private_channel():
 global _used
 if _used:return {'ok':False,'errorCode':'EXECUTION_NOT_AUTHORIZED','retryAllowed':False}
 _used=True
 try:
  manifest=preparation()
  # No such permit is installed or created by this preparation. A later exact
  # owner-reviewed installation must independently bind this source and grant.
  permit=validate_owner_permit(_private_record(PERMIT_PATH),time.time_ns()//1000000)
  raw=sys.stdin.buffer.read(16385);need(len(raw)<=16384,'PROTECTED_CHANNEL_REJECTED');channel=json.loads(raw);return _execute_sealed(manifest,channel,permit)
 except BaseException:return {'ok':False,'errorCode':'EXECUTION_NOT_AUTHORIZED','retryAllowed':False}

def run(argv):
 if argv!=['--offline-verify']:return {'ok':False,'errorCode':'EXECUTION_NOT_AUTHORIZED','executionAuthorized':False}
 try:preparation();return {'ok':True,'preparationVerified':True,'executionAuthorized':False,'version':VERSION,'project':PROJECT,'branch':BRANCH,'credentialsRequested':False,'connectionsOpened':0,'attemptStateTouched':False}
 except BaseException:return {'ok':False,'errorCode':'SOURCE_MISMATCH','executionAuthorized':False}

if __name__=='__main__':
 result=run_private_channel() if sys.argv[1:]==['--private-operator-channel'] else run(sys.argv[1:]);os.write(1,(json.dumps(result,separators=(',',':'))+'\n').encode());raise SystemExit(0 if result['ok'] else 1)
