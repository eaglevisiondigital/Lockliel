"""Exact one-attempt isolated recovery operator. No I/O on import.
No initialization/reset path exists here. Only a prepared durable grant may run.
"""
import hashlib
import json
import os
from pathlib import Path
import resource
import re
import stat
import sys
import sysconfig
import types

ROOT = Path('/Users/davesmacbookpro/Library/Application Support/Lockliel/wave10ie-qjks-recovery')
PROJECT = 'qjksggxorghaxvpyslip'
BRANCH = 'course-cutover-rehearsal-274'
WORKER_HASH = '9f8991b9e0c390b0790ac1cae2f7d90729e6cbb6aa17964669bcf2764c6697b2'
GUARD_HASH = 'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba'
RUNTIME_HASH = 'e9c74aa5aca6b71689a649e84d3055f1fcaf242b09c1380991d1e0b7761a5865'
PYTHON = '/Library/Developer/CommandLineTools/usr/bin/python3'
PYTHON_HASH = 'bdea59019a38eb6600cc9e71e984a97fedadc406448431281e7657030f54987e'
GRANT = {'authorization':'wave10ie-one-private-recovery','project':PROJECT,'branch':BRANCH,'workerSha256':WORKER_HASH,'guardSha256':GUARD_HASH,'runtimeSha256':RUNTIME_HASH,'maximumRecoveries':1,'maximumDatabaseConnections':1}
LOCAL_CODES = frozenset('EXPLICIT_EXECUTION_REQUIRED SOURCE_MISMATCH RUNTIME_MISMATCH UNSAFE_PROCESS ATTEMPT_UNAVAILABLE ATTEMPT_ALREADY_CONSUMED ATTEMPT_STATE_AMBIGUOUS ATTEMPT_DURABILITY_FAILED RESULT_UNAVAILABLE WORKER_RESULT_REJECTED LOCAL_OPERATOR_FAILED'.split())


class Stop(Exception):
    def __init__(self, code):
        self.code = code if code in LOCAL_CODES else 'LOCAL_OPERATOR_FAILED'
        super().__init__(self.code)


def need(value, code):
    if not value:
        raise Stop(code)


def _read_file(path, maximum=2000000):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        info = os.fstat(fd)
        need(stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid() and not info.st_mode & 0o022 and info.st_size <= maximum, 'SOURCE_MISMATCH')
        data = bytearray()
        while True:
            part = os.read(fd, min(65536, maximum + 1 - len(data)))
            if not part:
                break
            data.extend(part)
            need(len(data) <= maximum, 'SOURCE_MISMATCH')
        return bytes(data)
    finally:
        os.close(fd)


def _pinned(path, digest):
    data = _read_file(path)
    need(hashlib.sha256(data).hexdigest() == digest, 'SOURCE_MISMATCH')
    return data


def _directory(path=None, name=None, parent=None):
    fd = os.open(path if path is not None else name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=parent)
    try:
        info = os.fstat(fd)
        need(info.st_uid == os.getuid() and not info.st_mode & 0o077, 'ATTEMPT_STATE_AMBIGUOUS')
        return fd
    except BaseException:
        os.close(fd)
        raise


def _grant(fd):
    need(set(os.listdir(fd)) == {'grant.json'}, 'ATTEMPT_STATE_AMBIGUOUS')
    f = os.open('grant.json', os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=fd)
    try:
        info = os.fstat(f)
        expected = (json.dumps(GRANT, sort_keys=True, separators=(',', ':'))+'\n').encode()
        need(stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid() and stat.S_IMODE(info.st_mode) == 0o400 and info.st_nlink == 1 and info.st_size == len(expected), 'ATTEMPT_STATE_AMBIGUOUS')
        need(os.read(f, len(expected)+1) == expected, 'ATTEMPT_STATE_AMBIGUOUS')
    finally:
        os.close(f)


def consume_attempt():
    """Atomic irreversible READY->CONSUMED rename, fsynced before any input.
    Missing/ambiguous state denies. No O_CREAT/initialization or reset exists.
    The approved local owner/OS is trusted not to deliberately recreate a grant.
    """
    root = ready = spent = None
    try:
        root = _directory(ROOT)
        names = set(os.listdir(root))
        if 'CONSUMED' in names:
            raise Stop('ATTEMPT_ALREADY_CONSUMED')
        need(names == {'READY', 'kit'}, 'ATTEMPT_STATE_AMBIGUOUS')
        ready = _directory(name='READY', parent=root)
        _grant(ready)
        initial = os.fstat(ready)
        os.rename('READY', 'CONSUMED', src_dir_fd=root, dst_dir_fd=root)
        # No provider request or prompt is reachable until durable rename passes.
        try:
            os.fsync(root)
        except BaseException:
            raise Stop('ATTEMPT_DURABILITY_FAILED') from None
        spent = _directory(name='CONSUMED', parent=root)
        now = os.fstat(spent)
        need((initial.st_dev, initial.st_ino) == (now.st_dev, now.st_ino), 'ATTEMPT_STATE_AMBIGUOUS')
        _grant(spent)
        need(set(os.listdir(root)) == {'CONSUMED', 'kit'}, 'ATTEMPT_STATE_AMBIGUOUS')
    except Stop:
        raise
    except BaseException:
        raise Stop('ATTEMPT_UNAVAILABLE') from None
    finally:
        for fd in (spent, ready, root):
            if fd is not None:
                os.close(fd)


def verify_runtime(kit):
    data = json.loads(_pinned(kit/'recovery-runtime-manifest.json', RUNTIME_HASH))
    need(sys.flags.isolated == 1 and sys.flags.no_site == 1 and sys.flags.dont_write_bytecode == 1 and sys.gettrace() is None and sys.getprofile() is None, 'UNSAFE_PROCESS')
    need(sys.executable == PYTHON and sys.version.split()[0] == data['version'] and sys.prefix == data['prefix'] and sysconfig.get_path('stdlib') == data['stdlib'], 'RUNTIME_MISMATCH')
    need(set(os.environ) <= {'PATH','LANG','LC_ALL','__CF_USER_TEXT_ENCODING'} and all(os.environ.get(k) == v for k,v in {'PATH':'/usr/bin:/bin','LANG':'C','LC_ALL':'C'}.items()), 'UNSAFE_PROCESS')
    need('__CF_USER_TEXT_ENCODING' not in os.environ or re.fullmatch(r'0x[0-9a-fA-F]+:0x[0-9a-fA-F]+:0x[0-9a-fA-F]+', os.environ['__CF_USER_TEXT_ENCODING']), 'UNSAFE_PROCESS')
    need(sys.path == data['sysPath'] and all(not Path(p).exists() for p in data['absentImportPaths']), 'RUNTIME_MISMATCH')
    std = Path(data['stdlib'])
    current = {str(p) for p in std.rglob('*') if p.is_file() and p.suffix in data['suffixes']}
    need(current == {p for p in data['files'] if p.startswith(str(std)+'/')}, 'RUNTIME_MISMATCH')
    for filename, expected in data['files'].items():
        path = Path(filename)
        need(str(path.resolve()) == expected['resolved'] and hashlib.sha256(path.read_bytes()).hexdigest() == expected['sha256'], 'RUNTIME_MISMATCH')
    need(hashlib.sha256(Path(PYTHON).read_bytes()).hexdigest() == PYTHON_HASH, 'RUNTIME_MISMATCH')


def _worker(kit):
    source = _pinned(kit/'supabase_recovery.py', WORKER_HASH)
    _pinned(kit/'database_preflight.py', GUARD_HASH)
    module = types.ModuleType('_exact_private_recovery_worker')
    module.__file__ = str(kit/'supabase_recovery.py')
    exec(compile(source, module.__file__, 'exec'), module.__dict__)
    need(module.PROJECT == PROJECT and module.BRANCH == BRANCH and module.GUARD_SHA256 == GUARD_HASH and module.HOST == 'db.'+PROJECT+'.supabase.co' and module.API_HOST == 'api.supabase.com', 'SOURCE_MISMATCH')
    return module


def _safe_result(value, worker):
    need(type(value) is dict, 'WORKER_RESULT_REJECTED')
    if value.get('ok') is True:
        expected = {'ok':True,'project':PROJECT,'branch':BRANCH,'credentialRecovered':True,'authenticationVerified':True,'tlsVerifyFull':True,'hostnameVerified':True,'directIPv6':True,'transactionReadOnly':'on','lockTimeout':'5s','statementTimeout':'30s','sameConnectionAndTransaction':True,'inspectionQueries':2,'rolledBack':True,'connectionClosed':True,'migrationCount':280,'safeguardsVerified':True}
        need(set(value) == set(expected) and all(type(value[k]) is type(v) and value[k] == v for k,v in expected.items()), 'WORKER_RESULT_REJECTED')
        return {**expected, 'attemptConsumed':True}
    need(value.get('ok') is False and value.get('safeguardsVerified') is False and set(value) == {'ok','errorCode','phase','safeguardsVerified'}, 'WORKER_RESULT_REJECTED')
    code = value['errorCode']
    allowed = worker.CODES
    if worker._guard is not None:
        allowed = allowed | worker._guard.GUARD_CODES | worker._guard.LOCAL_CODES | worker._guard.NATIVE_CODES
    need(type(code) is str and code in allowed and value['phase'] in worker.PHASES, 'WORKER_RESULT_REJECTED')
    return {'ok':False,'errorCode':code,'phase':value['phase'],'safeguardsVerified':False,'attemptConsumed':True}


def _persist_result(value):
    # This receipt is already a fixed projection. Never store worker exceptions.
    data = (json.dumps(value, sort_keys=True, separators=(',', ':'))+'\n').encode()
    need(len(data) < 2048, 'RESULT_UNAVAILABLE')
    root = _directory(ROOT)
    fd = None
    try:
        need(set(os.listdir(root)) == {'CONSUMED','kit'}, 'RESULT_UNAVAILABLE')
        fd = os.open('result.json', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o600, dir_fd=root)
        need(os.write(fd, data) == len(data), 'RESULT_UNAVAILABLE')
        os.fsync(fd)
        os.fsync(root)
    finally:
        if fd is not None:
            os.close(fd)
        os.close(root)


def execute():
    """Only fixed reviewed composition. No credentials, URLs or paths as args."""
    consumed = False
    try:
        need(sys.argv == [str(ROOT/'kit/recovery_launcher.py'), '--execute-one-authorized-recovery'], 'EXPLICIT_EXECUTION_REQUIRED')
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        rootfd = _directory(ROOT)
        os.close(rootfd)
        kit = ROOT/'kit'
        fd = _directory(kit)
        os.close(fd)
        verify_runtime(kit)
        worker = _worker(kit)
        # Public CA is part of this sealed kit and the reviewed guard pins it.
        guard = worker._load_guard()
        ca = guard.validate_ca(str(kit/'supabase-ca.crt'))
        consumed = True  # Conservative: a failed claim may already be durable.
        consume_attempt()
        result = _safe_result(worker.run_once(ca), worker)
        _persist_result(result)
        return result
    except BaseException as error:
        code = error.code if type(error) is Stop else 'LOCAL_OPERATOR_FAILED'
        return {'ok':False,'errorCode':code,'safeguardsVerified':False,'attemptStatus':'CONSUMED_OR_AMBIGUOUS' if consumed else 'NOT_STARTED','retryAllowed':False}


def offline_verify():
    """Read-only readiness check: never consume the grant or prompt/connect."""
    try:
        kit = ROOT/'kit'
        verify_runtime(kit)
        worker = _worker(kit)
        worker._load_guard().validate_ca(str(kit/'supabase-ca.crt'))
        root = _directory(ROOT)
        ready = None
        try:
            need(set(os.listdir(root)) == {'READY','kit'}, 'ATTEMPT_STATE_AMBIGUOUS')
            ready = _directory(name='READY', parent=root)
            _grant(ready)
        finally:
            if ready is not None: os.close(ready)
            os.close(root)
        return {'ok':True,'mode':'offline-verify','grant':'READY','credentialInput':False,'providerCalls':0,'databaseConnections':0,'attemptConsumed':False}
    except BaseException as error:
        code = error.code if type(error) is Stop else 'LOCAL_OPERATOR_FAILED'
        return {'ok':False,'errorCode':code,'mode':'offline-verify','credentialInput':False,'providerCalls':0,'databaseConnections':0,'retryAllowed':False}


if __name__ == '__main__':
    # Terminate without atexit handlers, tracebacks or deferred Python output.
    result = offline_verify() if sys.argv == [str(ROOT/'kit/recovery_launcher.py'), '--offline-verify'] else execute()
    try:
        os.write(1, (json.dumps(result, separators=(',', ':'))+'\n').encode())
    except BaseException:
        os._exit(1)
    os._exit(0 if result.get('ok') is True else 1)
