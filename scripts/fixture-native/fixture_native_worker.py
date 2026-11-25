"""Private fixed fixture inventory producer. No default/live entry permission.
Runtime source/approval pins are independently checked before native loading.
Secrets arrive only on inherited stdin, never args/env/files or error output.
"""
import hashlib,json,os,re,resource,stat,sys,time,types
from pathlib import Path
ROOT=Path('/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10ir-fixture-operator')
SOURCE=Path(__file__).resolve().parent
class Denied(Exception):pass
def need(x):
 if not x:raise Denied()
def canonical(x):return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def raw(path,limit=131072,mode=None):
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);need(stat.S_ISREG(a.st_mode) and a.st_uid==os.getuid() and not a.st_mode&0o022 and a.st_nlink==1 and 0<a.st_size<=limit and (mode is None or a.st_mode&0o777==mode));b=os.read(fd,limit+1);z=os.fstat(fd);need(len(b)==a.st_size and (a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns));return b
 finally:os.close(fd)
def execute(payload):
 need(type(payload) is dict and set(payload)=={'nonce','phase','approvalSha256','password','logins','subjects','before'})
 need(re.fullmatch('[a-f0-9]{32}',payload['nonce']) and payload['phase'] in ('before','after'))
 seal=json.loads(raw(SOURCE.parent/'fixture-provision/operator-installation-seal.json'));need(seal['installed'] is True)
 approval=json.loads(raw(ROOT/'approval.json',mode=0o400));need(hashlib.sha256(canonical(approval)).hexdigest()==seal['approvalSha256']==payload['approvalSha256'])
 need(type(approval) is dict and set(approval)=={'schema','project','branch','branchId','scope','generation','sourceSha','ownerApprovalId','issuedAt','expiresAt','maximumCreates','maximumDatabaseConnections','triggerGraphSha256','providerEvidenceSha256','nativeWorkerSha256','nativeInventorySha256','caPath','caSha256','grantSha256','registryRoot','anchorRoot'})
 need(approval['schema']=='lockliel-fixture-operator-approval-v1' and re.fullmatch('[a-f0-9]{32}',approval['generation']) and re.fullmatch('[a-f0-9]{40}',approval['sourceSha']) and approval['maximumCreates']==2 and approval['maximumDatabaseConnections']==2 and 0<approval['expiresAt']-approval['issuedAt']<=300000)
 need(approval['project']=='qjksggxorghaxvpyslip' and approval['branch']=='course-cutover-rehearsal-274' and approval['branchId']=='7091bfd6-83ce-4c11-ac30-8ce85e09be2d' and approval['scope']=='two-new-isolated-fixtures' and approval['issuedAt']<=time.time_ns()//1000000<approval['expiresAt'])
 d=os.lstat(ROOT);need(stat.S_ISDIR(d.st_mode) and not stat.S_ISLNK(d.st_mode) and d.st_uid==os.getuid() and d.st_mode&0o777==0o700 and ROOT.resolve()==ROOT)
 c=os.lstat(ROOT/'CONSUMED');need(stat.S_ISDIR(c.st_mode) and not stat.S_ISLNK(c.st_mode) and c.st_uid==os.getuid() and c.st_mode&0o777==0o700)
 evidence=json.loads(raw(ROOT/'provider-evidence.json',mode=0o400));need(hashlib.sha256(canonical(evidence)).hexdigest()==approval['providerEvidenceSha256']==seal['providerEvidenceSha256'])
 need(evidence['project']==approval['project'] and evidence['branch']==approval['branch'] and evidence['branchId']==approval['branchId'] and approval['issuedAt']<=evidence['observedAt']<=time.time_ns()//1000000 and time.time_ns()//1000000-evidence['observedAt']<=300000 and evidence['source']=='independent-provider-observation' and evidence['collectorSourceSha']==seal['collectorSourceSha'])
 need(all(evidence[k]=='disabled' for k in ('beforeUserCreatedHook','customAccessTokenHook','passwordVerificationHook','sendEmailHook')))
 step=json.loads(raw(ROOT/('step-0.json' if payload['phase']=='before' else 'step-3.json'),mode=0o400));need(set(step)=={'generation','step','at'} and step['generation']==approval['generation'] and step['step']==('PRECHECK' if payload['phase']=='before' else 'POSTCHECK'))
 expected=[hashlib.sha256(('lockliel:qjks:login:lockliel-'+approval['generation']+'-'+label+'@fixture.invalid').encode()).hexdigest() for label in ('a','b')];need(payload['logins']==expected)
 if payload['phase']=='after':need(raw(ROOT/'native-before.consumed',mode=0o400)==b'consumed\n')
 claim=ROOT/('native-'+payload['phase']+'.consumed');fd=os.open(claim,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o400)
 try:os.write(fd,b'consumed\n');os.fsync(fd)
 finally:os.close(fd)
 fd=os.open(ROOT,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:os.fsync(fd)
 finally:os.close(fd)
 need(hashlib.sha256(raw(Path(__file__))).hexdigest()==approval['nativeWorkerSha256'])
 source=raw(SOURCE/'fixture_inventory.py');need(hashlib.sha256(source).hexdigest()==approval['nativeInventorySha256'])
 ca=Path(approval['caPath']);need(ca==ROOT/'supabase-ca.crt' and hashlib.sha256(raw(ca)).hexdigest()==approval['caSha256'])
 m=types.ModuleType('_pinned_fixture_native');m.__file__=str(SOURCE/'fixture_inventory.py');exec(compile(source,m.__file__,'exec'),m.__dict__)
 need(type(payload['password']) is str and 0<len(payload['password'])<=4096);password=bytearray(payload.pop('password').encode())
 try:
  driver=m.create_fixed_driver(str(ca),password,payload['phase'],payload['logins'],payload['subjects']);result=m.inspect_owned(driver,payload['phase'],payload['logins'],payload['subjects'],approval['triggerGraphSha256'],payload['before'])
  return {'ok':True,'nonce':payload['nonce'],'receipt':result['receipt']}
 finally:
  for i in range(len(password)):password[i]=0

def main():
 resource.setrlimit(resource.RLIMIT_CORE,(0,0));need(sys.argv[1:]==['--private-fixture-channel'] and not sys.stdin.isatty())
 data=bytearray(sys.stdin.buffer.read(65537));need(len(data)<=65536)
 try:
  payload=json.loads(data);result=execute(payload);out=canonical(result);need(len(out)<=65536);sys.stdout.buffer.write(out+b'\n')
 finally:
  for i in range(len(data)):data[i]=0
if __name__=='__main__':
 try:main()
 except BaseException:
  sys.stdout.write('{"ok":false,"category":"PREFLIGHT_FAILED"}\n');sys.exit(1)
