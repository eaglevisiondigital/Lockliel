"""Preparation-only deployment preflight verifier. No input, native import or live mode.
This never reads or mutates the spent J kit. The disabled manifest records the
future independent one-connection authorization contract, not a usable grant.
"""
import hashlib
import json
from pathlib import Path
import stat
import sys

PROJECT='qjksggxorghaxvpyslip'
BRANCH='course-cutover-rehearsal-274'
MANIFEST_SHA256='b461561ba1f7d7bf260e3a7f9ab0efd731e286a024bc0ba94f715f69b486693d'
EXPECTED_SOURCES={
 'deployment_database_preflight.py':'c367e660e07d42286ec1be321fd65593a82aa2ad85bd883383b677cd139e75db',
 'database_preflight.py':'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba',
 'deployment-preflight-baseline.json':'1b17b93a1c4d21d19cda04cd62c57785f276797c929fd5906c90b75ecf39e8ae',
 'manual-branch-identity.json':'e41d3b988c3f58cfd4f0feff37d831077f8adf7d6c150aeb390df5305356c5f0'}
GUARDS={'transport':'direct-ipv6','host':'db.'+PROJECT+'.supabase.co','port':5432,'database':'postgres','username':'postgres','tls':'verify-full','hostnameVerification':True,'readOnly':'on','lockTimeout':'5s','statementTimeout':'30s','sameConnectionAndTransaction':True,'pooler':False,'productionFallback':False}
ATTEMPT={'maximumDatabaseConnections':1,'separateFromConsumedRecoveryAllowance':True,'consumeBeforeInput':True,'operation':'atomic-READY-to-CONSUMED-rename-with-directory-fsync','missingOrAmbiguous':'deny','restartAfterConsumption':'deny','rearm':'forbidden','journalContainsSecrets':False}

class Denied(Exception):pass

def require(value):
    if not value:raise Denied('PREPARATION_INTEGRITY_FAILED')

def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False)

def state_decision(snapshot):
    """Pure offline state specification, never filesystem state mutation.
    Even an unused future template cannot execute without separately reviewed
    installation/source-bound owner authority. Ambiguous/missing/consumed denies.
    """
    if type(snapshot) is not dict or set(snapshot) != {'ready','consumed','interrupted','authorizationEnabled'} or any(type(v) is not bool for v in snapshot.values()):return 'DENY_AMBIGUOUS'
    if snapshot['consumed'] or snapshot['interrupted']:return 'DENY_CONSUMED_OR_INTERRUPTED'
    if not snapshot['ready']:return 'DENY_MISSING'
    # This preparation package cannot turn a JSON claim into real authority.
    return 'DENY_EXECUTION_NOT_AUTHORIZED'

def _bytes(path,sha):
    require(not path.is_symlink() and path.is_file())
    info=path.stat();require(stat.S_ISREG(info.st_mode) and info.st_size<=1048576)
    data=path.read_bytes();require(hashlib.sha256(data).hexdigest()==sha);return data

def verify_preparation(root):
    root=Path(root)
    require(not root.is_symlink() and root.is_dir())
    raw=_bytes(root/'deployment-preflight-launcher-manifest.json',MANIFEST_SHA256)
    data=json.loads(raw)
    require(type(data) is dict and set(data)=={'version','project','branch','executionAuthorized','authorizationState','applicationSource','sources','guards','attempt','missingPrerequisites','runtimeManifestSha256','runtimeSumsSha256'})
    require(data['version']=='lockliel-deployment-preflight-launcher-template-v1' and data['project']==PROJECT and data['branch']==BRANCH and data['executionAuthorized'] is False and data['authorizationState']=='NOT_AUTHORIZED')
    require(data['applicationSource']=='327ba098628f70aa65140862b8b14cd709bfd711')
    require(canonical(data['sources'])==canonical(EXPECTED_SOURCES) and canonical(data['guards'])==canonical(GUARDS) and canonical(data['attempt'])==canonical(ATTEMPT))
    require(data['missingPrerequisites']==['independent-exact-A-B-fixture-binding','source-bound-operator-sealing','fresh-provider-and-database-execution-authorization'])
    for name,sha in EXPECTED_SOURCES.items():_bytes(root/name,sha)
    _bytes(root/'recovery-runtime-manifest.json',data['runtimeManifestSha256'])
    _bytes(root/'recovery-runtime-SHA256SUMS',data['runtimeSumsSha256'])
    return {'ok':True,'preparationVerified':True,'executionAuthorized':False,'project':PROJECT,'branch':BRANCH,'credentialsRequested':False,'connectionsOpened':0,'attemptStateTouched':False}

def run(argv):
    # No execution switch or generic module/command path is accepted.
    if argv!=['--offline-verify']:return {'ok':False,'errorCode':'EXECUTION_NOT_AUTHORIZED','executionAuthorized':False}
    try:return verify_preparation(Path(__file__).resolve().parent)
    except BaseException:return {'ok':False,'errorCode':'PREPARATION_INTEGRITY_FAILED','executionAuthorized':False}

if __name__=='__main__':
    result=run(sys.argv[1:]);print(json.dumps(result,separators=(',',':')));raise SystemExit(0 if result['ok'] else 1)
