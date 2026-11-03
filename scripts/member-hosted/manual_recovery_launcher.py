"""Manual handoff operator; reuses the SAME durable recovery allowance.
No grant initialization, migration or reset operation exists. No I/O on import.
Existing PAT-bound READY intentionally fails this changed grant before input.
"""
import hashlib
import json
import os
from pathlib import Path
import resource
import stat
import sys
import types

ROOT = Path('/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10ie-qjks-recovery')
PROJECT = 'qjksggxorghaxvpyslip'
BRANCH = 'course-cutover-rehearsal-274'
SUPPORT_HASH = 'ceb426d2474cb5678c3e45f7e3b9562b5dfe1b817633129c05e0bc901df6fbc7'
WORKER_HASH = '24c9b04f1a696f6ad089614460842b20826a7f2b632f8bfe8a8589b53f1cb8b5'
GUARD_HASH = 'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba'
RUNTIME_HASH = 'e9c74aa5aca6b71689a649e84d3055f1fcaf242b09c1380991d1e0b7761a5865'
IDENTITY_HASH = 'e41d3b988c3f58cfd4f0feff37d831077f8adf7d6c150aeb390df5305356c5f0'
PRIOR_GRANT_HASH = '433a71b3b4edad86b9d3508a3c46a5516bb1cde40eb5e4de2bacc4a38a9c3e7a'
GRANT = {'authorization':'wave10ie-one-private-recovery','project':PROJECT,'branch':BRANCH,'mode':'owner-controlled-password-handoff','workerSha256':WORKER_HASH,'guardSha256':GUARD_HASH,'runtimeSha256':RUNTIME_HASH,'identitySha256':IDENTITY_HASH,'previousGrantSha256':PRIOR_GRANT_HASH,'maximumRecoveries':0,'maximumDatabaseConnections':1}


class Stop(Exception):
    def __init__(self, code):
        self.code = code
        super().__init__('LOCAL_HANDOFF_STOP')


def need(value):
    if not value:
        raise Stop('SOURCE_MISMATCH')


def _module(name, path, digest):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        info = os.fstat(fd)
        need(stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid() and not info.st_mode & 0o022 and info.st_size <= 200000)
        data = b''
        while True:
            chunk = os.read(fd, 65536)
            if not chunk:
                break
            data += chunk
            need(len(data) <= 200000)
        need(hashlib.sha256(data).hexdigest() == digest)
    finally:
        os.close(fd)
    module = types.ModuleType(name)
    module.__file__ = str(path)
    exec(compile(data, str(path), 'exec'), module.__dict__)
    return module


def _prepare(kit):
    support = _module('_pinned_durable_attempt', kit/'recovery_launcher.py', SUPPORT_HASH)
    need(support.ROOT == ROOT and support.PROJECT == PROJECT and support.BRANCH == BRANCH and support.GUARD_HASH == GUARD_HASH and support.RUNTIME_HASH == RUNTIME_HASH)
    rootfd = support._directory(ROOT)
    os.close(rootfd)
    kitfd = support._directory(kit)
    os.close(kitfd)
    support.verify_runtime(kit)
    # Exact changed grant, SAME root/rename/fsync implementation. No second grant.
    support.GRANT = GRANT
    worker = _module('_pinned_manual_worker', kit/'manual_database_preflight.py', WORKER_HASH)
    need(worker.PROJECT == PROJECT and worker.BRANCH == BRANCH and worker.HOST == 'db.'+PROJECT+'.supabase.co' and worker.GUARD_SHA256 == GUARD_HASH and worker.IDENTITY_SHA256 == IDENTITY_HASH)
    worker.validate_identity()
    boundary = worker.load_boundary()
    guard = boundary._load_guard()
    ca = guard.validate_ca(str(kit/'supabase-ca.crt'))
    return support, worker, ca


def safe_result(value, worker):
    expected = {'ok':True,'project':PROJECT,'branch':BRANCH,'credentialRecovered':False,'manualHandoff':True,'identityEvidence':'historical-provider-metadata-2026-11-02','authenticationVerified':True,'tlsVerifyFull':True,'hostnameVerified':True,'directIPv6':True,'transactionReadOnly':'on','lockTimeout':'5s','statementTimeout':'30s','sameConnectionAndTransaction':True,'inspectionQueries':2,'rolledBack':True,'connectionClosed':True,'migrationCount':280,'safeguardsVerified':True}
    need(type(value) is dict)
    if value.get('ok') is True:
        need(set(value) == set(expected) and all(type(value[k]) is type(v) and value[k] == v for k,v in expected.items()))
        return {**expected,'attemptConsumed':True}
    need(set(value) == {'ok','errorCode','phase','safeguardsVerified'} and value['ok'] is False and value['safeguardsVerified'] is False)
    allowed = worker.CODES
    if worker._guard is not None:
        allowed = allowed | worker._guard.GUARD_CODES | worker._guard.LOCAL_CODES | worker._guard.NATIVE_CODES
    need(type(value['errorCode']) is str and value['errorCode'] in allowed and value['phase'] in worker.PHASES)
    return {'ok':False,'errorCode':value['errorCode'],'phase':value['phase'],'safeguardsVerified':False,'attemptConsumed':True}


def execute():
    support = None
    consumed = False
    try:
        need(sys.argv == [str(ROOT/'kit/manual_recovery_launcher.py'),'--execute-one-authorized-handoff'])
        resource.setrlimit(resource.RLIMIT_CORE, (0,0))
        support, worker, ca = _prepare(ROOT/'kit')
        fd = support._directory(ROOT)
        ready = None
        try:
            if 'CONSUMED' in os.listdir(fd):
                raise Stop('ATTEMPT_ALREADY_CONSUMED')
            need(set(os.listdir(fd)) == {'READY','kit'})
            ready = support._directory(name='READY', parent=fd)
            # Fail before consumption with a meaningful fixed prerequisite code.
            try:
                support._grant(ready)
            except BaseException:
                raise Stop('AUTHORIZATION_RECONCILIATION_REQUIRED') from None
        finally:
            if ready is not None:
                os.close(ready)
            os.close(fd)
        consumed = True
        support.consume_attempt()
        result = safe_result(worker.run_once(ca), worker)
        support._persist_result(result)
        return result
    except BaseException as error:
        allowed = {'SOURCE_MISMATCH','AUTHORIZATION_RECONCILIATION_REQUIRED','ATTEMPT_ALREADY_CONSUMED'}
        if support is not None:
            allowed |= support.LOCAL_CODES
        code = error.code if type(error) is Stop and error.code in allowed else 'LOCAL_HANDOFF_FAILED'
        if support is not None and type(error) is support.Stop and error.code in support.LOCAL_CODES:
            code = error.code
        return {'ok':False,'errorCode':code,'safeguardsVerified':False,'attemptStatus':'CONSUMED_OR_AMBIGUOUS' if consumed else 'NOT_STARTED','retryAllowed':False}


if __name__ == '__main__':
    result = execute()
    try:
        os.write(1,(json.dumps(result,separators=(',',':'))+'\n').encode())
    except BaseException:
        os._exit(1)
    os._exit(0 if result.get('ok') is True else 1)
