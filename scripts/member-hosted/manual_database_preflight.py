"""Owner-controlled isolated password handoff. No I/O on import or live CLI.
Historical provider identity is hash-pinned. No Management API operation exists.
Run only through the separately reviewed single-attempt source-pinned operator.
"""
import getpass
import hashlib
import json
import locale
import os
from pathlib import Path
import resource
import sys
import threading
import types
import warnings

PROJECT = 'qjksggxorghaxvpyslip'
BRANCH = 'course-cutover-rehearsal-274'
BRANCH_ID = '7091bfd6-83ce-4c11-ac30-8ce85e09be2d'
HOST = 'db.' + PROJECT + '.supabase.co'
GUARD_SHA256 = 'c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba'
BOUNDARY_SHA256 = '9f8991b9e0c390b0790ac1cae2f7d90729e6cbb6aa17964669bcf2764c6697b2'
IDENTITY_SHA256 = 'e41d3b988c3f58cfd4f0feff37d831077f8adf7d6c150aeb390df5305356c5f0'
CODES = frozenset('OPERATOR_ENTRY_REQUIRED ALREADY_USED UNSAFE_PROCESS SOURCE_MISMATCH BRANCH_IDENTITY_REJECTED HIDDEN_PASSWORD_REQUIRED MANUAL_HANDOFF_FAILED OUTPUT_BOUNDARY_UNAVAILABLE'.split())
PHASES = frozenset('local_setup branch_identity hidden_input database_connect database_inspection complete'.split())
_used = False
_guard = None
_phase = 'local_setup'


class HandoffError(Exception):
    def __init__(self, code):
        self.code = code if code in CODES else 'MANUAL_HANDOFF_FAILED'
        super().__init__(self.code)


def need(value, code):
    if not value:
        raise HandoffError(code)


def pinned(path, digest):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        import stat
        info = os.fstat(fd)
        need(stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid() and not info.st_mode & 0o022 and info.st_size <= 200000, 'SOURCE_MISMATCH')
        parts = []
        while True:
            part = os.read(fd, 65536)
            if not part:
                break
            parts.append(part)
            need(sum(map(len, parts)) <= 200000, 'SOURCE_MISMATCH')
        data = b''.join(parts)
        need(hashlib.sha256(data).hexdigest() == digest, 'SOURCE_MISMATCH')
        return data
    finally:
        os.close(fd)


def validate_identity():
    # Independently collected provider metadata, not a new provider receipt.
    # Hash pin makes arbitrary fixture/operator claims unacceptable as evidence.
    value = json.loads(pinned(Path(__file__).with_name('manual-branch-identity.json'), IDENTITY_SHA256))
    expected = {'verified': True, 'isolatedBranch': [{'id': BRANCH_ID, 'name': BRANCH, 'project_ref': PROJECT, 'parent_project_ref': 'bsndfhbemstyrrglajat', 'is_default': False, 'persistent': False, 'status': 'FUNCTIONS_DEPLOYED', 'preview_project_status': 'ACTIVE_HEALTHY'}], 'isError': False, 'secretEndpointCalled': False}
    # Canonical JSON comparison distinguishes bool from integer.
    need(json.dumps(value, sort_keys=True) == json.dumps(expected, sort_keys=True), 'BRANCH_IDENTITY_REJECTED')
    return 'historical-provider-metadata-2026-11-02'


def load_boundary():
    path = Path(__file__).with_name('supabase_recovery.py')
    source = pinned(path, BOUNDARY_SHA256)
    module = types.ModuleType('_pinned_private_output_boundary')
    module.__file__ = str(path)
    exec(compile(source, str(path), 'exec'), module.__dict__)
    need(module.PROJECT == PROJECT and module.BRANCH == BRANCH and module.HOST == HOST and module.GUARD_SHA256 == GUARD_SHA256, 'SOURCE_MISMATCH')
    return module


def hidden_password():
    value = None
    previous_locale = None
    output = None
    try:
        # CLT Python 3.9 getpass creates an internal TextIOWrapper using LC_CTYPE.
        # Explicit process-only UTF-8 preserves opaque non-ASCII passwords. No
        # environment/OS configuration change and no echoed fallback are allowed.
        previous_locale = locale.setlocale(locale.LC_CTYPE)
        locale.setlocale(locale.LC_CTYPE, 'en_US.UTF-8')
        need(locale.getpreferredencoding(False).lower().replace('-', '') == 'utf8', 'HIDDEN_PASSWORD_REQUIRED')
        with open('/dev/tty', 'w', encoding='utf-8', buffering=1) as tty:
            need(tty.isatty(), 'HIDDEN_PASSWORD_REQUIRED')
            with warnings.catch_warnings():
                warnings.simplefilter('error', getpass.GetPassWarning)
                value = getpass.getpass('Isolated qjks PostgreSQL database password (hidden): ', stream=tty)
        need(type(value) is str and 0 < len(value) <= 1024 and not any(c in value for c in ('\0', '\r', '\n')), 'HIDDEN_PASSWORD_REQUIRED')
        output = bytearray(value, 'utf-8')
    finally:
        value = None
        if previous_locale is not None:
            try:
                locale.setlocale(locale.LC_CTYPE, previous_locale)
            except BaseException:
                if output is not None:
                    output[:] = b'\0' * len(output)
                raise
    return output


def _work(ca, boundary):
    global _phase, _guard
    password = plain = driver = None
    try:
        need(sys.flags.isolated == 1 and threading.active_count() == 1 and sys.gettrace() is None and sys.getprofile() is None, 'UNSAFE_PROCESS')
        boundary._safe_tls_environment()
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        _guard = boundary._load_guard()
        ca = _guard.validate_ca(ca)
        _phase = 'branch_identity'
        validate_identity()
        _phase = 'hidden_input'
        password = hidden_password()
        _phase = 'database_connect'
        plain = password.decode('utf-8')
        try:
            driver = _guard.DirectLibpq(ca, plain)
        finally:
            plain = None
            boundary._wipe(password)
            password = None
        _phase = 'database_inspection'
        owned = driver
        driver = None  # inspect_guarded owns rollback/close on every exit.
        result = _guard.inspect_guarded(owned)
        expected = {'project': PROJECT, 'host': HOST, 'database': 'postgres', 'source': 'direct-libpq-same-connection-readonly-transaction', 'startupOptionsVerified': True, 'tlsVerifyFull': True, 'hostnameVerified': True, 'transactionReadOnly': 'on', 'lockTimeout': '5s', 'statementTimeout': '30s', 'samePhysicalConnection': True, 'sameTransaction': True, 'inspectionQueries': 2, 'noReconnect': True, 'noDataWrites': True, 'rolledBack': True}
        need(type(result) is dict and all(type(result.get(k)) is type(v) and result.get(k) == v for k,v in expected.items()), 'MANUAL_HANDOFF_FAILED')
        summary = {'migrationCount':280,'migration280Fingerprint':'a55aead9115d12881650fee9f1bede27','publicTables':57,'rlsPublicTables':57,'notesServiceTablePrivileges':0,'notesServiceColumnPrivileges':0}
        need(json.dumps(result.get('summary'), sort_keys=True) == json.dumps(summary, sort_keys=True), 'MANUAL_HANDOFF_FAILED')
        _phase = 'complete'
        return {'ok':True,'project':PROJECT,'branch':BRANCH,'credentialRecovered':False,'manualHandoff':True,'identityEvidence':'historical-provider-metadata-2026-11-02','authenticationVerified':True,'tlsVerifyFull':True,'hostnameVerified':True,'directIPv6':True,'transactionReadOnly':'on','lockTimeout':'5s','statementTimeout':'30s','sameConnectionAndTransaction':True,'inspectionQueries':2,'rolledBack':True,'connectionClosed':True,'migrationCount':280,'safeguardsVerified':True}
    finally:
        boundary._wipe(password)
        plain = None
        if driver is not None:
            driver.close()


def run_once(ca):
    global _used, _phase
    if _used:
        return {'ok':False,'errorCode':'ALREADY_USED','phase':'local_setup','safeguardsVerified':False}
    _used = True
    _phase = 'local_setup'
    try:
        boundary = load_boundary()
        with boundary._private_output():
            try:
                return _work(ca, boundary)
            except BaseException as error:
                code = error.code if type(error) is HandoffError else 'MANUAL_HANDOFF_FAILED'
                if _guard is not None and type(error) is _guard.GuardError and error.code in (_guard.GUARD_CODES | _guard.LOCAL_CODES | _guard.NATIVE_CODES):
                    code = error.code
                return {'ok':False,'errorCode':code,'phase':_phase if _phase in PHASES else 'local_setup','safeguardsVerified':False}
    except BaseException:
        return {'ok':False,'errorCode':'OUTPUT_BOUNDARY_UNAVAILABLE','phase':'local_setup','safeguardsVerified':False}


if __name__ == '__main__':
    os.write(1, b'{"ok":false,"errorCode":"OPERATOR_ENTRY_REQUIRED","safeguardsVerified":false}\n')
    os._exit(1)
