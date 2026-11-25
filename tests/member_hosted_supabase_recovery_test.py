"""Offline synthetic-only private boundary regression. All real I/O is denied."""
import contextlib
import ctypes
import hashlib
import importlib.util
import io
import json
import logging
import os
from pathlib import Path
import socket
import ssl
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

b = load('recovery_under_test', ROOT / 'scripts/member-hosted/supabase_recovery.py')
prior = load('prior_guard_tests', ROOT / 'tests/member_hosted_database_preflight_test.py')
g = prior.g
TOKEN = 'sbp_' + 'a' * 40  # Synthetic only, not a usable operator credential.
PASSWORD = 'SYNTHETIC-only-$:quote\'"\\!'
UNRELATED = 'SYNTHETIC-unrelated-JWT-never-output'

# A mistaken real operation fails even if swallowed. No password input permitted.
ATTEMPTS = []
def deny(*_args, **_kwargs):
    ATTEMPTS.append('forbidden I/O')
    raise AssertionError('Real I/O prohibited')
socket.socket = socket.create_connection = socket.getaddrinfo = deny
ctypes.CDLL = deny
b.getpass.getpass = deny


def identity():
    return [{"id": b.BRANCH_ID, "name": b.BRANCH, "project_ref": b.PROJECT, "parent_project_ref": b.PARENT, "is_default": False, "persistent": False, "status": "FUNCTIONS_DEPLOYED", "preview_project_status": "ACTIVE_HEALTHY"}]


def config():
    return {"ref": b.PROJECT, "postgres_version": "17.11", "postgres_engine": "postgres", "release_channel": "ga", "status": "ACTIVE_HEALTHY", "db_host": b.HOST, "db_port": 5432, "db_user": "postgres", "db_pass": PASSWORD, "jwt_secret": UNRELATED}


class FakeSocket:
    def version(self): return 'TLSv1.3'
    def settimeout(self, value): self.timeout = value


class Response:
    def __init__(self, value=None, raw=None, status=200, headers=None):
        self.body = raw if raw is not None else json.dumps(config() if value is None else value).encode()
        self.status = status
        self.headers = headers if headers is not None else [('Content-Type', 'application/json'), ('Content-Length', str(len(self.body)))]
        self.closed = False
        self.offset = 0
        self.reads = 0
    def getheaders(self): return self.headers
    def read(self, amount):
        self.reads += 1
        data = self.body[self.offset:self.offset+amount]
        self.offset += len(data)
        return data
    def close(self): self.closed = True


class Connection:
    response = None
    failure = None
    calls = []
    instances = []
    def __init__(self, host, port, timeout, context):
        assert host == b.API_HOST and port == 443 and timeout == 8
        assert context.check_hostname and context.verify_mode == ssl.CERT_REQUIRED
        self.host, self.port, self.sock = host, port, FakeSocket()
        self.closed = False
        self.instances.append(self)
    def set_debuglevel(self, value): assert value == 0
    def connect(self):
        if self.failure: raise self.failure
    def request(self, method, path, headers):
        assert method == 'GET' and path in (b.IDENTITY_PATH, b.CONFIG_PATH)
        assert headers['Authorization'] == 'Bearer ' + TOKEN
        self.calls.append(path)  # Do not retain header/token in mock call records.
    def getresponse(self): return self.response
    def close(self): self.closed = True


class BridgeTests(unittest.TestCase):
    def setUp(self):
        b._used = False
        b._guard = None
        self.paths = []
        self.auth = bytearray(TOKEN, 'ascii')
        self.pw = None
        self.driver = prior.Driver()
        self.data = config()
        def request(path, _auth):
            self.paths.append(path)
            return identity() if path == b.IDENTITY_PATH else self.data
        self.context = contextlib.ExitStack()
        self.addCleanup(self.context.close)
        self.context.enter_context(patch.object(b, '_native_flush'))
        self.context.enter_context(patch.object(b, '_load_guard', return_value=g))
        self.context.enter_context(patch.object(g, 'validate_ca', return_value='/synthetic/ca.crt'))
        self.context.enter_context(patch.object(b, '_authorization', return_value=self.auth))
        self.request = self.context.enter_context(patch.object(b, '_request', side_effect=request))
        def driver(ca, password):
            self.assertEqual(password, PASSWORD)
            self.assertTrue(all(x == 0 for x in self.auth))
            return self.driver
        self.native = self.context.enter_context(patch.object(g, 'DirectLibpq', side_effect=driver))
    def run_bridge(self):
        result = b.run_once('/synthetic/ca.crt')
        text = json.dumps(result)
        for secret in (TOKEN, PASSWORD, UNRELATED): self.assertNotIn(secret, text)
        return result
    def test_success_same_connection_guard_and_disposal(self):
        result = self.run_bridge()
        self.assertTrue(result['ok'] and result['safeguardsVerified'])
        self.assertEqual((result['transactionReadOnly'], result['lockTimeout'], result['statementTimeout']), ('on', '5s', '30s'))
        self.assertEqual(self.paths, [b.IDENTITY_PATH, b.CONFIG_PATH])
        self.assertEqual(self.data, {})
        self.assertTrue(self.driver.closed)
        self.assertEqual(self.driver.calls[0], 'BEGIN READ ONLY')
        self.assertEqual(self.driver.calls[-1], 'ROLLBACK')
        self.assertEqual(self.native.call_count, 1)
        self.assertTrue(all(x == 0 for x in self.auth))
    def test_wrong_and_production_branches_stop_before_secret_request(self):
        for change in ({'project_ref':b.PARENT}, {'project_ref':'sibling'}, {'name':'other'}, {'id':'other'}, {'parent_project_ref':'other'}, {'is_default':True}, {'is_default':0}, {'persistent':True}, {'status':'CREATING_PROJECT'}, {'preview_project_status':'INACTIVE'}):
            with self.subTest(change=change):
                b._used = False
                row = identity(); row[0].update(change)
                self.request.side_effect = lambda _p, _a: row
                result = self.run_bridge()
                self.assertEqual(result['errorCode'], 'BRANCH_IDENTITY_REJECTED')
                self.assertEqual(self.native.call_count, 0)
    def test_missing_and_ambiguous_branch_identity(self):
        for rows in ([], {}, [identity()[0], identity()[0]], [{}], [None]):
            with self.subTest(rows=bool(rows)):
                b._used=False; self.request.side_effect=lambda _p,_a:rows
                self.assertEqual(self.run_bridge()['errorCode'], 'BRANCH_IDENTITY_REJECTED')
        self.assertEqual(self.native.call_count, 0)
    def test_missing_authorization_stops_all_provider_calls(self):
        with patch.object(b, '_authorization', side_effect=b.RecoveryError('AUTHORIZATION_REQUIRED')):
            self.assertEqual(self.run_bridge()['errorCode'], 'AUTHORIZATION_REQUIRED')
        self.request.assert_not_called(); self.native.assert_not_called()
    def test_malformed_config_and_unreviewed_format(self):
        cases = [None, [], {}, {'extra':1}]
        for value in cases:
            with self.subTest(shape=type(value).__name__):
                b._used=False; self.data=value
                self.assertEqual(self.run_bridge()['errorCode'], 'CONFIG_IDENTITY_REJECTED')
        for value in ('', 'short', 'bad\npassword', 'bad\0password', 'bad password', 'é'*12, 'a'*257, {'value':PASSWORD}):
            with self.subTest(kind=type(value).__name__):
                b._used=False; self.data=config(); self.data['db_pass']=value
                self.assertEqual(self.run_bridge()['errorCode'], 'CREDENTIAL_FORMAT_REJECTED')
        self.native.assert_not_called()
    def test_wrong_database_destination_never_used(self):
        for change in ({'ref':b.PARENT}, {'db_host':'db.'+b.PARENT+'.supabase.co'}, {'db_host':'evil.example'}, {'db_host':b.HOST+':5432'}, {'db_port':'5432'}, {'db_port':6543}, {'db_user':'other'}, {'postgres_engine':'other'}, {'release_channel':'beta'}, {'postgres_version':'16.1'}, {'status':'INACTIVE'}):
            with self.subTest(change=change):
                b._used=False; self.data=config(); self.data.update(change)
                self.assertEqual(self.run_bridge()['errorCode'], 'CONFIG_IDENTITY_REJECTED')
                self.assertEqual(self.data, {})
        self.native.assert_not_called()
    def test_connection_failure_sanitized(self):
        self.native.side_effect=g.GuardError('AUTHENTICATION_FAILED')
        result=self.run_bridge(); self.assertEqual(result['errorCode'], 'AUTHENTICATION_FAILED')
        self.assertEqual(result['phase'], 'database_connect'); self.assertFalse(result['safeguardsVerified'])
        self.assertTrue(all(x==0 for x in self.auth)); self.assertEqual(self.data,{})
    def test_driver_exception_and_timeout_do_not_leak(self):
        for error in (RuntimeError(PASSWORD), TimeoutError(TOKEN), KeyboardInterrupt(UNRELATED)):
            with self.subTest(kind=type(error).__name__):
                b._used=False; self.data=config(); self.native.side_effect=error
                self.assertEqual(self.run_bridge()['errorCode'], 'RECOVERY_FAILED')
    def test_guard_read_only_and_timeout_failures(self):
        for change,code in [({'read_only':'off'},'READ_ONLY_NOT_ON'),({'lock_timeout':'0'},'LOCK_TIMEOUT_NOT_5S'),({'statement_timeout':'2min'},'STATEMENT_TIMEOUT_NOT_30S')]:
            with self.subTest(code=code):
                b._used=False; self.data=config(); self.driver=prior.Driver(); self.driver.guard_change=change
                result=self.run_bridge(); self.assertEqual(result['errorCode'],code)
                self.assertTrue(self.driver.closed); self.assertNotIn(g.IDENTITY_SQL,self.driver.calls)
    def test_native_wrong_destination_fails_closed(self):
        self.driver.native_change={'host':'db.'+b.PARENT+'.supabase.co'}
        self.assertEqual(self.run_bridge()['errorCode'],'WRONG_PROJECT_OR_DATABASE')
        self.assertEqual(self.driver.calls,[]); self.assertTrue(self.driver.closed)
    def test_transfer_interrupted_disposes_auth(self):
        self.request.side_effect=InterruptedError(PASSWORD)
        self.assertEqual(self.run_bridge()['errorCode'],'RECOVERY_FAILED')
        self.assertTrue(all(x==0 for x in self.auth)); self.native.assert_not_called()
    def test_repeat_call_consumed_on_failure(self):
        self.request.side_effect=ValueError(PASSWORD)
        self.run_bridge(); count=self.request.call_count
        self.assertEqual(self.run_bridge()['errorCode'],'ALREADY_USED')
        self.assertEqual(self.request.call_count,count)
    def test_no_raw_native_python_or_logging_output(self):
        out,err=io.StringIO(),io.StringIO()
        records=[]
        class Capture(logging.Handler):
            def emit(self, record): records.append(record)
        logger=logging.getLogger('private-synthetic-test'); handler=Capture();logger.addHandler(handler)
        self.addCleanup(logger.removeHandler,handler)
        old=self.native.side_effect
        def noisy(ca,password):
            print(password); sys.stderr.write(TOKEN)
            os.write(1,password.encode()); os.write(2,UNRELATED.encode())
            logger.critical(password)
            return old(ca,password)
        self.native.side_effect=noisy
        # Capture actual descriptors using anonymous pipes, never secret files.
        saved=[os.dup(1),os.dup(2)]; pipes=[os.pipe(),os.pipe()]
        try:
            for fd,(_r,w) in zip((1,2),pipes): os.dup2(w,fd)
            with contextlib.redirect_stdout(out),contextlib.redirect_stderr(err): result=self.run_bridge()
        finally:
            for fd,original in zip((1,2),saved):os.dup2(original,fd);os.close(original)
            for _r,w in pipes:os.close(w)
        captured=[os.read(r,4096) for r,_w in pipes]
        for r,_w in pipes:os.close(r)
        self.assertTrue(result['ok']);self.assertEqual(captured,[b'',b''])
        self.assertEqual(out.getvalue()+err.getvalue(),'');self.assertEqual(records,[])
    def test_secret_bearing_exception_never_retains_cause_or_traceback(self):
        self.native.side_effect=RuntimeError(PASSWORD+TOKEN+UNRELATED)
        value=self.run_bridge()
        self.assertEqual(set(value),{'ok','errorCode','phase','safeguardsVerified'})
    def test_unknown_guard_code_cannot_be_output(self):
        self.native.side_effect=g.GuardError(PASSWORD)
        self.assertEqual(self.run_bridge()['errorCode'],'RECOVERY_FAILED')
    def test_password_owned_buffer_disposed_on_success_and_failure(self):
        original=b._password; held=[]
        def track(value):
            result=original(value);held.append(result);return result
        with patch.object(b,'_password',side_effect=track):
            self.run_bridge()
            b._used=False;self.data=config();self.native.side_effect=RuntimeError(PASSWORD)
            self.run_bridge()
        self.assertEqual(len(held),2)
        self.assertTrue(all(all(x==0 for x in value) for value in held))
    def test_output_setup_failure_never_reaches_authorization(self):
        with patch.object(b.os,'dup',side_effect=OSError(PASSWORD)):
            self.assertEqual(self.run_bridge()['errorCode'],'OUTPUT_BOUNDARY_UNAVAILABLE')
        self.request.assert_not_called();self.native.assert_not_called()
    def test_output_restoration_failure_cannot_return_success(self):
        real=os.dup2;count=[0]
        def fail_once(a,c):
            count[0]+=1
            if count[0]==3:raise OSError(PASSWORD)
            return real(a,c)
        saved=[os.dup(1),os.dup(2)]
        try:
            with patch.object(b.os,'dup2',side_effect=fail_once):result=self.run_bridge()
        finally:
            for fd,old in zip((1,2),saved):real(old,fd);os.close(old)
        self.assertFalse(result['ok']);self.assertEqual(result['errorCode'],'OUTPUT_BOUNDARY_UNAVAILABLE')
    def test_debugger_or_multiple_threads_stop_before_auth(self):
        for name,value in (('gettrace',object()),('getprofile',object())):
            b._used=False
            with patch.object(b.sys,name,return_value=value):self.assertEqual(self.run_bridge()['errorCode'],'UNSAFE_PROCESS')
        b._used=False
        with patch.object(b.threading,'active_count',return_value=2):self.assertEqual(self.run_bridge()['errorCode'],'UNSAFE_PROCESS')
        self.request.assert_not_called()

    def test_saved_stream_buffer_flushed_before_output_restored(self):
        raw = os.fdopen(os.dup(1), 'wb', buffering=8192)
        saved = io.TextIOWrapper(raw, encoding='utf-8')
        original=self.native.side_effect
        def noisy(ca,password):
            saved.write(password)
            return original(ca,password)
        self.native.side_effect=noisy
        read,write=os.pipe();backup=os.dup(1)
        # Stream's duplicate must refer to capture pipe, not the test's output.
        old_stdout=sys.__stdout__
        try:
            os.dup2(write,1)
            # Recreate buffered stream on actual fd1, without owning fd1.
            saved.close()
            saved=io.TextIOWrapper(io.FileIO(1,'w',closefd=False),encoding='utf-8')
            sys.__stdout__=saved
            self.assertTrue(self.run_bridge()['ok'])
            saved.flush()
        finally:
            sys.__stdout__=old_stdout;os.dup2(backup,1);os.close(backup);os.close(write)
            saved.detach()
        captured=os.read(read,4096);os.close(read)
        self.assertEqual(captured,b'')
    def test_native_flush_failure_stops_before_any_private_operation(self):
        with patch.object(b,'_native_flush',side_effect=RuntimeError(PASSWORD)):
            self.assertFalse(self.run_bridge()['ok'])
        self.request.assert_not_called();self.native.assert_not_called()

    def test_driver_cleanup_failure_cannot_succeed(self):
        self.driver.close=lambda: (_ for _ in ()).throw(RuntimeError(PASSWORD))
        self.assertFalse(self.run_bridge()['ok'])
    def test_malformed_guard_receipt_fails_closed(self):
        for value in (None, {'rolledBack':True}, {'ok':True,'password':PASSWORD}):
            b._used=False;self.data=config()
            with patch.object(g,'inspect_guarded',return_value=value):
                self.assertEqual(self.run_bridge()['errorCode'],'RECOVERY_FAILED')
    def test_hosted_auth_and_deployment_are_absent(self):
        source=(ROOT/'scripts/member-hosted/supabase_recovery.py').read_text()
        for disallowed in ('api.netlify.com','/auth/v1','subprocess.','os.environ[','os.getenv(','ALTER ROLE','ALTER DATABASE','PATCH'):
            self.assertNotIn(disallowed,source)

    def test_ambient_tls_keylog_and_root_override_stop_before_auth(self):
        for key in ('SSLKEYLOGFILE','SSL_CERT_FILE','SSL_CERT_DIR'):
            b._used=False
            with patch.dict(os.environ,{key:'/synthetic/never-created'}):
                self.assertEqual(self.run_bridge()['errorCode'],'UNSAFE_PROCESS')
        self.request.assert_not_called();self.native.assert_not_called()


class TransportTests(unittest.TestCase):
    def setUp(self):
        self.context=contextlib.ExitStack();self.addCleanup(self.context.close)
        self.context.enter_context(patch.object(b.http.client,'HTTPSConnection',Connection))
        Connection.instances=[];Connection.calls=[];Connection.failure=None;Connection.response=Response()
    def request(self,path=None):return b._request(path or b.CONFIG_PATH,bytearray(TOKEN,'ascii'))
    def denied(self,code):
        with self.assertRaises(b.RecoveryError) as err:self.request()
        self.assertEqual(err.exception.code,code)
        self.assertNotIn(PASSWORD,str(err.exception));self.assertTrue(Connection.instances[-1].closed)
    def test_native_fixed_origin_tls_and_success(self):
        value=self.request();self.assertEqual(value['db_pass'],PASSWORD)
        self.assertEqual(Connection.calls,[b.CONFIG_PATH]);self.assertTrue(Connection.instances[0].closed)
        self.assertTrue(Connection.response.closed)
    def test_reject_unexpected_origin_path_and_auth_before_connect(self):
        for path in ('https://evil.example','/v1/branches/'+b.PARENT,b.CONFIG_PATH+'?x=1'):
            with self.assertRaises(b.RecoveryError):self.request(path)
        for value in (None,bytearray(),bytearray(b'Bearer secret\r\n'),TOKEN):
            with self.assertRaises(b.RecoveryError):b._request(b.CONFIG_PATH,value)
        self.assertEqual(Connection.instances,[])
    def test_redirect_rejected_without_read_or_follow(self):
        for status in (301,302,307,308):
            Connection.response=Response(status=status,raw=PASSWORD.encode(),headers=[('Location','https://evil.example')])
            self.denied('PROVIDER_REDIRECT_DENIED');self.assertEqual(Connection.response.reads,0)
    def test_authorization_and_secret_error_body_not_read(self):
        for status,code in ((401,'PROVIDER_AUTHORIZATION_DENIED'),(403,'PROVIDER_AUTHORIZATION_DENIED'),(429,'PROVIDER_RESPONSE_REJECTED'),(500,'PROVIDER_RESPONSE_REJECTED')):
            Connection.response=Response(status=status,raw=PASSWORD.encode())
            self.denied(code);self.assertEqual(Connection.response.reads,0)
    def test_tls_and_connection_failures_sanitized(self):
        for error,code in ((ssl.SSLError(PASSWORD),'PROVIDER_TLS_FAILED'),(TimeoutError(PASSWORD),'PROVIDER_TIMEOUT'),(ConnectionResetError(PASSWORD),'PROVIDER_INTERRUPTED'),(OSError(PASSWORD),'PROVIDER_UNAVAILABLE')):
            Connection.failure=error;self.denied(code)
            self.assertEqual(Connection.calls,[])
    def test_response_json_rejected(self):
        for raw in (b'{bad',b'{"db_pass":"x","db_pass":"y"}',b'{"x":NaN}',b'{"x":Infinity}',b'\xff'):
            Connection.response=Response(raw=raw);self.denied('PROVIDER_RESPONSE_REJECTED')
    def test_headers_compression_duplicates_and_oversize_rejected(self):
        for headers in ([('Content-Type','text/html')],[('Content-Type','application/json'),('Content-Encoding','gzip')],[('Content-Type','application/json'),('Location','x')],[('Content-Type','application/json'),('Content-Length','999999')],[('Content-Type','application/json'),('Content-Length','1'),('content-length','2')]):
            Connection.response=Response(headers=headers);self.denied('PROVIDER_RESPONSE_REJECTED')
    def test_chunked_oversize_and_content_length_mismatch(self):
        Connection.response=Response(raw=b'x'*(b.MAX_BODY+1),headers=[('Content-Type','application/json')]);self.denied('PROVIDER_RESPONSE_REJECTED')
        Connection.response=Response(raw=b'{}',headers=[('Content-Type','application/json'),('Content-Length','3')]);self.denied('PROVIDER_RESPONSE_REJECTED')
    def test_interrupted_body_closes_everything(self):
        with patch.object(Connection.response,'read',side_effect=ConnectionResetError(PASSWORD)):self.denied('PROVIDER_INTERRUPTED')
        self.assertTrue(Connection.response.closed)
    def test_slow_body_deadline(self):
        with patch.object(b.time,'monotonic',side_effect=[0,21]):self.denied('PROVIDER_TIMEOUT')
    def test_owned_response_buffer_wiped(self):
        held=[];original=b._wipe
        def track(value):
            if isinstance(value,bytearray):held.append(value)
            original(value)
        with patch.object(b,'_wipe',side_effect=track):self.request()
        self.assertTrue(held and all(all(x==0 for x in value) for value in held))
    def test_verified_socket_after_connection_close_semantics(self):
        original=Connection.getresponse
        def close_socket(conn):
            conn.sock=None
            return original(conn)
        with patch.object(Connection,'getresponse',close_socket):self.assertEqual(self.request()['ref'],b.PROJECT)

    def test_provider_close_failure_prevents_success(self):
        with patch.object(Connection.response,'close',side_effect=RuntimeError(PASSWORD)):
            with self.assertRaises(RuntimeError):self.request()
        self.assertTrue(Connection.instances[-1].closed)
    def test_tls_socket_version_and_origin_rejected_before_headers(self):
        with patch.object(FakeSocket,'version',return_value='TLSv1.1'):
            self.denied('PROVIDER_TLS_FAILED')
        self.assertEqual(Connection.calls,[])
        original=Connection.connect
        def change_origin(conn):
            original(conn);conn.host='evil.example'
        with patch.object(Connection,'connect',change_origin):self.denied('PROVIDER_RESPONSE_REJECTED')
        self.assertEqual(Connection.calls,[])
    def test_weak_context_fails_before_connect(self):
        class Weak:
            check_hostname=False
            verify_mode=ssl.CERT_NONE
        with patch.object(b.ssl,'create_default_context',return_value=Weak()):
            with self.assertRaises(b.RecoveryError) as err:self.request()
        self.assertEqual(err.exception.code,'PROVIDER_TLS_FAILED');self.assertEqual(Connection.instances,[])

    def test_tls_keylog_environment_rejected_before_context_creation(self):
        for key in ('SSLKEYLOGFILE','SSL_CERT_FILE','SSL_CERT_DIR'):
            with patch.dict(os.environ,{key:'/synthetic/never-created'}),patch.object(b.ssl,'create_default_context') as create:
                with self.assertRaises(b.RecoveryError) as err:self.request()
                self.assertEqual(err.exception.code,'UNSAFE_PROCESS');create.assert_not_called()
        self.assertEqual(Connection.instances,[])
    def test_context_with_key_logging_enabled_rejected(self):
        class KeyLogging:
            check_hostname=True
            verify_mode=ssl.CERT_REQUIRED
            keylog_filename='/synthetic/never-created'
        with patch.object(b.ssl,'create_default_context',return_value=KeyLogging()):
            with self.assertRaises(b.RecoveryError) as err:self.request()
        self.assertEqual(err.exception.code,'PROVIDER_TLS_FAILED');self.assertEqual(Connection.instances,[])


class SourceTests(unittest.TestCase):
    def test_pinned_existing_guard_unchanged(self):
        path=ROOT/'scripts/member-hosted/database_preflight.py'
        self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),b.GUARD_SHA256)
        self.assertEqual(b._load_guard().HOST,b.HOST)
    def test_tampered_guard_denied_before_load(self):
        with patch.object(b.Path,'read_bytes',return_value=b'altered'):
            with self.assertRaises(b.RecoveryError) as err:b._load_guard()
        self.assertEqual(err.exception.code,'TRUSTED_GUARD_MISMATCH')
    def test_hidden_authorization_format_and_no_echo_fallback(self):
        class TTY:
            def __enter__(self):return self
            def __exit__(self,*_args):pass
            def isatty(self):return True
        with patch('builtins.open',return_value=TTY()),patch.object(b.getpass,'getpass',return_value=TOKEN):
            value=b._authorization();self.assertEqual(value,bytearray(TOKEN,'ascii'));b._wipe(value)
        for token in ('', 'other-format', TOKEN+'\n'):
            with patch('builtins.open',return_value=TTY()),patch.object(b.getpass,'getpass',return_value=token):
                with self.assertRaises(b.RecoveryError):b._authorization()
        def echo_warning(*_args,**_kwargs):
            b.warnings.warn('fallback',b.getpass.GetPassWarning)
            return TOKEN
        with patch('builtins.open',return_value=TTY()),patch.object(b.getpass,'getpass',side_effect=echo_warning):
            with self.assertRaises(b.getpass.GetPassWarning):b._authorization()
    def test_no_real_io_attempts(self):self.assertEqual(ATTEMPTS,[])


if __name__=='__main__':
    result=unittest.main(exit=False)
    if ATTEMPTS:raise SystemExit('Offline network/native/input guard detected an attempt')
    raise SystemExit(not result.result.wasSuccessful())
