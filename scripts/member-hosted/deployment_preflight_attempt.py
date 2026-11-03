"""Additive single-attempt primitive, not wired to any executable launcher.
No initialization, reset, grant creation, input, database or network operation.
Only a future exact-source operator may supply its separately approved grant.
The caller must independently seal/compare its actual operator SHA; syntax or
a grant JSON claim is never operator authentication.
Offline tests use temporary synthetic directories, never the spent J kit.
"""
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import time

PROJECT='qjksggxorghaxvpyslip'
BRANCH='course-cutover-rehearsal-274'
PINS={'nativeSha256':'c367e660e07d42286ec1be321fd65593a82aa2ad85bd883383b677cd139e75db','guardSha256':'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba','baselineSha256':'1b17b93a1c4d21d19cda04cd62c57785f276797c929fd5906c90b75ecf39e8ae'}
CODES=frozenset('ATTEMPT_GRANT_REJECTED ATTEMPT_ALREADY_CONSUMED ATTEMPT_STATE_AMBIGUOUS ATTEMPT_DURABILITY_FAILED ATTEMPT_UNAVAILABLE ATTEMPT_BUSY'.split())
class AttemptError(Exception):
 def __init__(self,code):self.code=code if code in CODES else 'ATTEMPT_UNAVAILABLE';super().__init__(self.code)
def need(value,code='ATTEMPT_STATE_AMBIGUOUS'):
 if not value:raise AttemptError(code)
def _canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode('utf-8')

def validate_grant(value,now_ms):
 """An exact nonsecret source-bound grant. JSON alone is not operator authority."""
 required={'authorization','project','branch','maximumDatabaseConnections','executionEnabled','notBefore','expiresAt','grantId','operatorSha256',*PINS}
 need(type(value) is dict and set(value)==required,'ATTEMPT_GRANT_REJECTED')
 need(value['authorization']=='wave10il-one-deployment-preflight' and value['project']==PROJECT and value['branch']==BRANCH and value['executionEnabled'] is True and type(value['maximumDatabaseConnections']) is int and value['maximumDatabaseConnections']==1,'ATTEMPT_GRANT_REJECTED')
 need(all(value[k]==v for k,v in PINS.items()),'ATTEMPT_GRANT_REJECTED')
 need(type(value['grantId']) is str and re.fullmatch(r'[0-9a-f]{32}',value['grantId']) is not None,'ATTEMPT_GRANT_REJECTED')
 need(type(value['operatorSha256']) is str and re.fullmatch(r'[0-9a-f]{64}',value['operatorSha256']) is not None,'ATTEMPT_GRANT_REJECTED')
 need(type(now_ms) is int and type(value['notBefore']) is int and type(value['expiresAt']) is int and 0<value['notBefore']<=now_ms<value['expiresAt'] and value['expiresAt']-value['notBefore']<=300000,'ATTEMPT_GRANT_REJECTED')
 return _canonical(value)

def _directory(name,parent=None,mode=0o700):
 fd=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW|os.O_CLOEXEC,dir_fd=parent)
 try:
  info=os.fstat(fd);need(stat.S_ISDIR(info.st_mode) and info.st_uid==os.getuid() and stat.S_IMODE(info.st_mode)==mode)
  return fd
 except BaseException:os.close(fd);raise

def _verify_grant(directory,expected):
 need(set(os.listdir(directory))=={'grant.json'})
 fd=os.open('grant.json',os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC,dir_fd=directory)
 try:
  before=os.fstat(fd)
  need(stat.S_ISREG(before.st_mode) and before.st_uid==os.getuid() and stat.S_IMODE(before.st_mode)==0o400 and before.st_nlink==1 and 0<before.st_size<=8192)
  raw=os.read(fd,8193);after=os.fstat(fd)
  need((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and len(raw)==before.st_size)
  value=json.loads(raw);need(_canonical(value)==expected,'ATTEMPT_GRANT_REJECTED')
  return hashlib.sha256(expected).hexdigest()
 finally:os.close(fd)

def consume_at(root_path,expected_grant):
 """Consume only an existing exact future grant, durably before future input.
 No initialization/rearm path exists. Caller must be a separately approved sealed
 operator; this library is not imported by the disabled preparation launcher.
 Trusted local owner/OS must not deliberately recreate a spent directory.
 """
 root=ready=spent=None
 try:
  now_ms=time.time_ns()//1000000;expected=validate_grant(expected_grant,now_ms)
  path=Path(root_path);need(path.is_absolute() and not path.is_symlink() and path.resolve()==path)
  # The consumed recovery kit is never a deployment-preflight location.
  need('wave10ie-qjks-recovery' not in path.parts)
  root=_directory(str(path));
  try:fcntl.flock(root,fcntl.LOCK_EX|fcntl.LOCK_NB)
  except BlockingIOError:raise AttemptError('ATTEMPT_BUSY') from None
  names=set(os.listdir(root))
  if 'CONSUMED' in names:raise AttemptError('ATTEMPT_ALREADY_CONSUMED')
  need(names=={'READY'})
  ready=_directory('READY',root,0o500);grant_sha=_verify_grant(ready,expected);initial=os.fstat(ready)
  current_ms=time.time_ns()//1000000;need(current_ms>=now_ms,'ATTEMPT_GRANT_REJECTED');validate_grant(expected_grant,current_ms)
  os.rename('READY','CONSUMED',src_dir_fd=root,dst_dir_fd=root)
  try:os.fsync(root)
  except BaseException:raise AttemptError('ATTEMPT_DURABILITY_FAILED') from None
  spent=_directory('CONSUMED',root,0o500);final=os.fstat(spent)
  need((initial.st_dev,initial.st_ino)==(final.st_dev,final.st_ino) and set(os.listdir(root))=={'CONSUMED'})
  need(_verify_grant(spent,expected)==grant_sha)
  final_ms=time.time_ns()//1000000;need(final_ms>=current_ms,'ATTEMPT_GRANT_REJECTED');validate_grant(expected_grant,final_ms)
  # The future caller must verify expiry again immediately before input/connect.
  # No prompt, native driver or worker invocation occurs here or before durability.
  return {'attemptConsumed':True,'grantSha256':grant_sha,'connectionsOpened':0,'credentialsRequested':False}
 except AttemptError:raise
 except BaseException:raise AttemptError('ATTEMPT_UNAVAILABLE') from None
 finally:
  for fd in (spent,ready,root):
   if fd is not None:os.close(fd)

if __name__=='__main__':
 # The primitive has no usable execution CLI, even if a local grant exists.
 print('{"ok":false,"errorCode":"EXECUTION_NOT_AUTHORIZED"}')
 raise SystemExit(1)
