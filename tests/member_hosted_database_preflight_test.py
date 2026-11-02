"""State-machine regressions; synthetic drivers only, no network/passwords."""
import copy
import ctypes as C
import io
import json
import os
from contextlib import redirect_stdout, redirect_stderr
from unittest.mock import patch
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("guard", Path(__file__).parents[1] / "scripts/member-hosted/database_preflight.py")
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)

class Driver:
    def __init__(self):
        self.calls = []; self.closed = False; self.connected_value = True
        self.pid = 1234; self.native = 100; self.sock = 9; self.tx = 0
        self.stamp = "2026-11-02 12:00:00+00"; self.guard_change = {}; self.native_change = {}; self.trigger = None
    def identity(self):
        return {"host": g.HOST, "port": "5432", "database": "postgres", "sslmode": "verify-full", "ca_verified": True, "startup_options": g.OPTIONS, "tls_active": True, "tls_version": "TLSv1.2", "cipher": "synthetic-cipher", "backend_pid": self.pid, "socket": self.sock, "native_handle": self.native, "transaction_status": self.tx, **self.native_change}
    def connected(self): return self.connected_value
    def transaction_status(self): return self.tx
    def command(self, sql):
        self.calls.append(sql)
        if sql == "BEGIN READ ONLY": self.tx = 2
        elif sql == "ROLLBACK": self.tx = 0
        else: raise AssertionError("unapproved command")
    def select(self, sql):
        self.calls.append(sql)
        if self.trigger: self.trigger(self, sql)
        if sql == g.GUARD_SQL:
            return {"database": "postgres", "backend_pid": self.pid, "transaction_started_at": self.stamp, "default_read_only": "on", "read_only": "on", "lock_timeout": "5s", "statement_timeout": "30s", "ssl": True, "tls": "TLSv1.2", "cipher": "synthetic-cipher", **self.guard_change}
        if sql == g.IDENTITY_SQL: return {"database": "postgres", "serverVersion": "17.11"}
        if sql == g.SUMMARY_SQL: return {"migrationCount": 280, "migration280Fingerprint": "a55aead9115d12881650fee9f1bede27", "publicTables": 57, "rlsPublicTables": 57, "notesServiceTablePrivileges": 0, "notesServiceColumnPrivileges": 0}
        raise AssertionError("unapproved query")
    def close(self): self.closed = True; self.connected_value = False

class GuardTests(unittest.TestCase):
    def denied(self, d, code=None, no_inspection=True):
        with self.assertRaises(g.GuardError) as err: g.inspect_guarded(d)
        if code: self.assertEqual(err.exception.code, code)
        self.assertTrue(d.closed)
        if no_inspection:
            self.assertNotIn(g.IDENTITY_SQL, d.calls); self.assertNotIn(g.SUMMARY_SQL, d.calls)
        if "BEGIN READ ONLY" in d.calls and d.connected_value is False and "ROLLBACK" in d.calls and code != "ROLLBACK_NOT_VERIFIED": self.assertEqual(d.tx, 0)
    def test_valid_one_connection_one_transaction_rolled_back(self):
        d = Driver(); r = g.inspect_guarded(d)
        self.assertTrue(r["samePhysicalConnection"] and r["sameTransaction"] and r["rolledBack"])
        self.assertEqual(d.calls[0], "BEGIN READ ONLY"); self.assertEqual(d.calls[-1], "ROLLBACK")
        self.assertEqual(sum(x == g.IDENTITY_SQL for x in d.calls), 1); self.assertTrue(d.closed)
    def test_startup_options_ignored(self):
        d=Driver();d.guard_change={"default_read_only":"off","lock_timeout":"0","statement_timeout":"2min"};self.denied(d,"READ_ONLY_NOT_ON")
    def test_read_only_off(self):
        d=Driver();d.guard_change={"read_only":"off"};self.denied(d,"READ_ONLY_NOT_ON")
    def test_unlimited_lock_timeout(self):
        d=Driver();d.guard_change={"lock_timeout":"0"};self.denied(d,"LOCK_TIMEOUT_NOT_5S")
    def test_wrong_statement_timeout(self):
        d=Driver();d.guard_change={"statement_timeout":"2min"};self.denied(d,"STATEMENT_TIMEOUT_NOT_30S")
    def test_settings_applied_on_different_connection(self):
        d=Driver();d.guard_change={"backend_pid":5678};self.denied(d,"WRONG_PHYSICAL_CONNECTION")
    def test_wrong_project_before_begin(self):
        d=Driver();d.native_change={"host":"db.bsndfhbemstyrrglajat.supabase.co"};self.denied(d,"WRONG_PROJECT_OR_DATABASE");self.assertEqual(d.calls,[])
    def test_wrong_database(self):
        d=Driver();d.guard_change={"database":"other"};self.denied(d,"WRONG_PROJECT_OR_DATABASE")
    def test_tls_downgrade_denied(self):
        for change in ({"sslmode":"require"},{"ca_verified":False},{"tls_active":False}):
            with self.subTest(change=change):
                d=Driver();d.native_change=change;self.denied(d,"TLS_IDENTITY_NOT_VERIFIED")
    def test_native_connection_replaced_before_inspection(self):
        d=Driver();count=[0]
        def change(driver,sql):
            if sql==g.GUARD_SQL:
                count[0]+=1
                if count[0]==2: driver.native=101
        d.trigger=change;self.denied(d,"CONNECTION_REPLACED")
    def test_pool_proxy_changes_backend_during_verification(self):
        d=Driver()
        def change(driver,sql):
            if sql==g.GUARD_SQL: driver.pid=5678
        d.trigger=change;self.denied(d,"WRONG_PHYSICAL_CONNECTION")
    def test_transaction_replaced_same_physical_connection(self):
        d=Driver();count=[0]
        def change(driver,sql):
            if sql==g.GUARD_SQL:
                count[0]+=1
                if count[0]==2: driver.stamp="2026-11-02 12:01:00+00"
        d.trigger=change;self.denied(d,"TRANSACTION_REPLACED")
    def test_transaction_lost_after_initial_verification(self):
        d=Driver();count=[0]
        def change(driver,sql):
            if sql==g.GUARD_SQL:
                count[0]+=1
                if count[0]==1: driver.tx=0
        d.trigger=change;self.denied(d,"CONNECTION_REPLACED")
    def test_failed_guard_rolls_back_and_does_not_expose_error(self):
        d=Driver()
        def change(driver,sql):
            if sql==g.GUARD_SQL: driver.tx=3;raise g.GuardError("QUERY_FAILED")
        d.trigger=change;self.denied(d,"QUERY_FAILED");self.assertIn("ROLLBACK",d.calls)
    def test_lost_connection_never_retries(self):
        d=Driver()
        def change(driver,sql):
            if sql==g.GUARD_SQL: driver.connected_value=False;raise g.GuardError("CONNECTION_LOST")
        d.trigger=change;self.denied(d,"CONNECTION_LOST");self.assertEqual(d.calls.count("BEGIN READ ONLY"),1)
    def test_query_failure_rolls_back_in_error_transaction(self):
        d=Driver()
        def change(driver,sql):
            if sql==g.IDENTITY_SQL: driver.tx=3;raise g.GuardError("QUERY_FAILED")
        d.trigger=change;self.denied(d,"QUERY_FAILED",False);self.assertIn("ROLLBACK",d.calls);self.assertNotIn(g.SUMMARY_SQL,d.calls)
    def test_inspection_connection_replacement_never_returns_receipt(self):
        d=Driver()
        def change(driver,sql):
            if sql==g.IDENTITY_SQL: driver.native=200;driver.sock=11
        d.trigger=change;self.denied(d,"CONNECTION_REPLACED",False);self.assertNotIn(g.SUMMARY_SQL,d.calls)
    def test_startup_parameter_echo_is_not_sufficient(self):
        d=Driver();self.assertEqual(d.identity()["startup_options"],g.OPTIONS);d.guard_change={"read_only":"off"};self.denied(d,"READ_ONLY_NOT_ON")
    def test_query_inventory_cannot_include_writes_or_external_statements(self):
        self.assertEqual(len(g.INSPECTIONS),2)
        for _,sql in g.INSPECTIONS:self.assertTrue(sql.lstrip().lower().startswith("select "))
        self.assertNotIn("PQreset",Path(g.__file__).read_text())
    def test_rollback_failure_does_not_return_success(self):
        d=Driver();original=d.command
        def broken(sql):
            original(sql)
            if sql=="ROLLBACK":d.tx=2
        d.command=broken;self.denied(d,"ROLLBACK_NOT_VERIFIED",False)
    def test_missing_or_extra_private_shape_not_emitted(self):
        d=Driver();original=d.select
        def add(sql):
            r=original(sql)
            if sql==g.IDENTITY_SQL:r["private"]="synthetic-do-not-forward"
            return r
        d.select=add;self.denied(d,"INSPECTION_IDENTITY_MISMATCH",False)

# Never let this test process resolve DNS, open sockets, prompt for a password or
# load a native driver. Individual tests supply explicit fake dependencies only.
def offline_only(*args, **kwargs):
    raise AssertionError("Offline regression attempted forbidden I/O")
g.socket.socket = offline_only
g.socket.create_connection = offline_only
g.socket.getaddrinfo = offline_only
g.getpass.getpass = offline_only
g.C.CDLL = offline_only

DIAGNOSTIC_FIXTURES = (
    (b'FATAL: password authentication failed for user "synthetic"', "AUTHENTICATION_FAILED"),
    (b'SASL authentication failed', "AUTH_NEGOTIATION_FAILED"),
    (b'no pg_hba.conf entry for synthetic test', "SERVER_ACCESS_REJECTED"),
    (b'SSL error: certificate verify failed', "TLS_VERIFY_FAILED"),
    (b'SSL error: tlsv1 alert internal error', "TLS_HANDSHAKE_FAILED"),
    (b'server does not support SSL, but SSL was required', "TLS_REQUIRED_UNAVAILABLE"),
    (b'could not translate host name', "NATIVE_NAME_RESOLUTION_FAILED"),
    (b'Network is unreachable', "IPV6_ROUTE_UNAVAILABLE"),
    (b'Connection refused', "TCP_REFUSED"),
    (b'server closed the connection unexpectedly', "CONNECTION_INTERRUPTED"),
    (b'timeout expired', "CONNECT_TIMEOUT"),
    (b'invalid value for parameter', "SERVER_STARTUP_REJECTED"),
    (b'FATAL: database "synthetic" does not exist', "SERVER_STARTUP_REJECTED"),
)

class DiagnosticTests(unittest.TestCase):
    def setUp(self):
        g._stage = "not-started"; g._native_elapsed_ms = None; g._helper_sha256 = None
    def test_all_known_native_error_families(self):
        for raw, expected in DIAGNOSTIC_FIXTURES:
            with self.subTest(code=expected): self.assertEqual(g.classify_native_diagnostic(raw), expected)
    def test_case_variations_and_repeated_same_family(self):
        self.assertEqual(g.classify_native_diagnostic(b'CONNECTION REFUSED\nConnection refused\n'), "TCP_REFUSED")
    def test_unknown_localized_empty_and_invalid_types(self):
        for raw in (b'', b'unrecognized provider wording', 'connection refused', None, {}, b'Verbindung fehlgeschlagen'):
            self.assertEqual(g.classify_native_diagnostic(raw), "CONNECTION_FAILURE_UNCLASSIFIED")
    def test_exact_maximum_and_oversized_input(self):
        raw = b'Connection refused' + b' ' * (g.MAX_NATIVE_DIAGNOSTIC - len(b'Connection refused'))
        self.assertEqual(g.classify_native_diagnostic(raw), "TCP_REFUSED")
        self.assertEqual(g.classify_native_diagnostic(raw + b' '), "CONNECTION_FAILURE_UNCLASSIFIED")
    def test_mixed_error_families_fail_closed(self):
        for raw in (b'Connection refused\ntimeout expired', b'password authentication failed; Network is unreachable', b'SSL error: certificate verify failed\nSASL authentication failed'):
            self.assertEqual(g.classify_native_diagnostic(raw), "CONNECTION_FAILURE_UNCLASSIFIED")
    def test_known_plus_unknown_line_fails_closed(self):
        self.assertEqual(g.classify_native_diagnostic(b'Connection refused\nsynthetic-secret-token-value'), "CONNECTION_FAILURE_UNCLASSIFIED")
    def test_tls_prefix_is_specific_only_on_same_unambiguous_line(self):
        self.assertEqual(g.classify_native_diagnostic(b'SSL error: certificate verify failed'), "TLS_VERIFY_FAILED")
        for raw in (b'SSL error: certificate verify failed\nSSL error: tls alert', b'SSL error: certificate verify failed; TLS handshake failed'):
            self.assertEqual(g.classify_native_diagnostic(raw), "CONNECTION_FAILURE_UNCLASSIFIED")
    def test_typed_local_errors_are_phase_specific(self):
        for phase,error,expected in (("ipv6_dns",g.socket.gaierror(-2,"synthetic-secret"),"IPV6_DNS_FAILED"),("driver_load",OSError("synthetic-secret"),"DRIVER_LOAD_FAILED"),("driver_load",AttributeError("synthetic-secret"),"DRIVER_LOAD_FAILED"),("native_connect",RuntimeError("synthetic-secret"),"DRIVER_OPERATION_FAILED"),("hidden_input",EOFError("synthetic-secret"),"DIRECT_PREFLIGHT_UNAVAILABLE")):
            g._stage=phase;self.assertEqual(g.failure_result(error)["errorCode"],expected)
    def test_untrusted_guard_codes_and_phases_are_never_reflected(self):
        for code in ("synthetic-password-value",["synthetic-password-value"]):
            g._stage="synthetic-secret-phase";r=g.failure_result(g.GuardError(code))
            self.assertEqual(r["stage"],"unknown");self.assertEqual(r["errorCode"],"CONNECTION_FAILURE_UNCLASSIFIED");self.assertNotIn("synthetic",json.dumps(r))
    def test_failure_result_contains_only_allowlisted_safe_metadata(self):
        g._stage="native_connect";r=g.failure_result(OSError("postgres://synthetic:synthetic-password@foreign/?token=synthetic-token"))
        self.assertEqual(set(r),{"ok","errorCode","stage","helperSha256","nativeConnectElapsedMs","required","safeguardsVerified"})
        self.assertFalse(r["ok"] or r["safeguardsVerified"]);self.assertNotIn("synthetic",json.dumps(r))
        self.assertEqual(r["required"],{"project":g.PROJECT,"transport":"direct-ipv6","tls":"verify-full","readOnly":"on","lockTimeout":"5s","statementTimeout":"30s"})
    def test_elapsed_time_and_digest_reject_invalid_values(self):
        for elapsed in (-1,True,90000000,"synthetic-secret"):
            g._native_elapsed_ms=elapsed;g._helper_sha256="synthetic-secret";r=g.failure_result(RuntimeError())
            self.assertIsNone(r["nativeConnectElapsedMs"]);self.assertIsNone(r["helperSha256"])
        g._native_elapsed_ms=12;g._helper_sha256="a"*64;r=g.failure_result(RuntimeError());self.assertEqual(r["nativeConnectElapsedMs"],12);self.assertEqual(r["helperSha256"],"a"*64)
    def test_cli_never_prints_exception_or_native_diagnostic(self):
        stdout,stderr=io.StringIO(),io.StringIO();g._stage="native_connect"
        def fail():
            g._stage="native_connect"
            raise RuntimeError("synthetic-password token provider-native-text")
        with patch.object(g,"main",side_effect=fail),redirect_stdout(stdout),redirect_stderr(stderr):
            self.assertEqual(g.run_cli(),1)
        self.assertEqual(stderr.getvalue(),"");r=json.loads(stdout.getvalue());self.assertEqual(r["errorCode"],"DRIVER_OPERATION_FAILED");self.assertNotIn("synthetic",stdout.getvalue())


    def test_cli_native_output_is_discarded_and_both_fds_restored(self):
        stdout=io.StringIO();before={fd:os.fstat(fd) for fd in (1,2)}
        def fail():
            g._stage="native_connect"
            os.write(1,b"synthetic-native-secret-stdout");os.write(2,b"synthetic-native-secret-stderr")
            raise g.GuardError("TCP_REFUSED")
        # Capture real fds outside run_cli; bypassing Python streams must not leak.
        pipes={fd:os.pipe() for fd in (1,2)};saved={fd:os.dup(fd) for fd in (1,2)}
        try:
            for fd,(_,write) in pipes.items():os.dup2(write,fd)
            with patch.object(g,"main",side_effect=fail),redirect_stdout(stdout):status=g.run_cli()
            for fd in (1,2):self.assertEqual(os.fstat(fd).st_ino,os.fstat(pipes[fd][1]).st_ino)
        finally:
            for fd in (1,2):os.dup2(saved[fd],fd);os.close(saved[fd]);os.close(pipes[fd][1])
        for read,_ in pipes.values():self.assertEqual(os.read(read,4096),b"");os.close(read)
        self.assertEqual(status,1);self.assertEqual(json.loads(stdout.getvalue())["errorCode"],"TCP_REFUSED")
        for fd in (1,2):self.assertEqual(os.fstat(fd).st_ino,before[fd].st_ino)
    def test_cli_output_setup_failure_stops_before_main(self):
        stdout=io.StringIO()
        with patch.object(g.os,"open",side_effect=OSError("synthetic-private-path")),patch.object(g,"main") as main,redirect_stdout(stdout):
            self.assertEqual(g.run_cli(),1)
        main.assert_not_called();r=json.loads(stdout.getvalue());self.assertEqual(r["errorCode"],"DIAGNOSTIC_OUTPUT_UNAVAILABLE");self.assertNotIn("synthetic",stdout.getvalue())
    def test_cli_restore_failure_cannot_emit_success_or_exception(self):
        stdout=io.StringIO();original=os.dup2;calls=[0];real_saved={fd:os.dup(fd) for fd in (1,2)}
        def replace(*args):
            calls[0]+=1
            if calls[0]==3:raise OSError("synthetic-private-error")
            return original(*args)
        try:
            with patch.object(g.os,"dup2",side_effect=replace),patch.object(g,"main",return_value={"ok":True,"receipt":{}}),redirect_stdout(stdout):self.assertEqual(g.run_cli(),1)
        finally:
            for fd in (1,2):original(real_saved[fd],fd);os.close(real_saved[fd])
        r=json.loads(stdout.getvalue());self.assertFalse(r["ok"]);self.assertEqual(r["errorCode"],"DIAGNOSTIC_OUTPUT_UNAVAILABLE");self.assertNotIn("synthetic",stdout.getvalue())
    def test_all_literal_phase_assignments_are_allowlisted(self):
        import ast
        module=ast.parse(Path(g.__file__).read_text())
        for node in ast.walk(module):
            if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=="_stage" for t in node.targets) and isinstance(node.value,ast.Constant):self.assertIn(node.value.value,g.PHASES)

class NativeFunction:
    def __init__(self, callback): self.callback=callback
    def __call__(self,*args): return self.callback(*args)

class NativeLibrary:
    def __init__(self,error=b'Connection refused',handle=101,exception=None):
        self.error=C.create_string_buffer(error);self.handle=handle;self.exception=exception
        self.calls=[];self.closed=0;self.parameters=None;self.expand=None
    def __getattr__(self,name):
        def call(*args):
            self.calls.append(name)
            if name=="PQlibVersion":return 170011
            if name=="PQconnectdbParams":
                keys,values,self.expand=args;self.parameters={};i=0
                while keys[i]:self.parameters[keys[i].decode()]=C.string_at(values[i]);i+=1
                if self.exception:raise self.exception
                return self.handle
            if name=="PQstatus":return 1
            if name=="PQerrorMessage":return C.addressof(self.error)
            if name=="PQfinish":self.closed+=1;return None
            raise AssertionError("Unexpected native operation in offline test")
        function=NativeFunction(call);setattr(self,name,function);return function

class NativeDiagnosticTests(unittest.TestCase):
    def setUp(self):g._stage="not-started";g._native_elapsed_ms=None;g._helper_sha256=None
    def attempt(self,lib):
        created=[];original=C.create_string_buffer
        def capture(*args,**kwargs):b=original(*args,**kwargs);created.append(b);return b
        with patch.object(g,"validate_ca",return_value="/synthetic/ca.crt"),patch.object(g.C,"CDLL",return_value=lib),patch.object(g.socket,"getaddrinfo",return_value=[(g.socket.AF_INET6,g.socket.SOCK_STREAM,6,"",("2001:db8::1",5432,0,0))]) as dns,patch.object(g.C,"create_string_buffer",side_effect=capture):
            with self.assertRaises(Exception) as err:g.DirectLibpq("/synthetic/ca.crt","synthetic-input-only")
        dns.assert_called_once_with(g.HOST,5432,g.socket.AF_INET6,g.socket.SOCK_STREAM)
        self.assertTrue(created);self.assertTrue(all(not any(b.raw) for b in created))
        self.assertNotIn("PQexec",lib.calls);self.assertLessEqual(lib.calls.count("PQconnectdbParams"),1)
        return err.exception
    def test_null_native_handle_has_distinct_category(self):
        lib=NativeLibrary(handle=None);err=self.attempt(lib);self.assertEqual(err.code,"NATIVE_HANDLE_UNAVAILABLE");self.assertNotIn("PQerrorMessage",lib.calls)
    def test_missing_native_error_pointer_fails_closed(self):
        lib=NativeLibrary();lib.PQerrorMessage=NativeFunction(lambda conn:None)
        self.assertEqual(self.attempt(lib).code,"CONNECTION_FAILURE_UNCLASSIFIED");self.assertEqual(lib.closed,1)
    def test_native_scan_is_bounded_before_copy(self):
        lib=NativeLibrary(error=b'x'*(g.MAX_NATIVE_DIAGNOSTIC+20));calls=[];original=C.string_at
        def scan(pointer,size=None):
            if size is not None:calls.append(size)
            return original(pointer,size) if size is not None else original(pointer)
        with patch.object(g.C,"string_at",side_effect=scan):self.assertEqual(g.native_failure_code(lib,101),"CONNECTION_FAILURE_UNCLASSIFIED")
        self.assertEqual(calls,[1]*(g.MAX_NATIVE_DIAGNOSTIC+1))
    def test_private_native_copy_is_cleared_after_classification(self):
        lib=NativeLibrary();captured=[];original=g.classify_native_diagnostic
        def classify(raw):captured.append(raw);return original(raw)
        with patch.object(g,"classify_native_diagnostic",side_effect=classify):self.assertEqual(g.native_failure_code(lib,101),"TCP_REFUSED")
        self.assertEqual(len(captured),1);self.assertTrue(captured[0]);self.assertFalse(any(captured[0]))
    def test_each_native_category_closes_handle_and_zeroes_owned_input(self):
        for raw,code in DIAGNOSTIC_FIXTURES:
            with self.subTest(code=code):
                lib=NativeLibrary(raw);err=self.attempt(lib);self.assertEqual(err.code,code);self.assertEqual(lib.closed,1);self.assertEqual(g._stage,"native_connect")
    def test_unknown_native_diagnostic_never_enters_output(self):
        lib=NativeLibrary(b'postgres://synthetic:synthetic-password@foreign token=synthetic-token');err=self.attempt(lib)
        self.assertEqual(err.code,"CONNECTION_FAILURE_UNCLASSIFIED");self.assertNotIn("synthetic",json.dumps(g.failure_result(err)))
    def test_native_exception_does_not_retry_and_clears_inputs(self):
        lib=NativeLibrary(exception=RuntimeError("synthetic-secret"));err=self.attempt(lib)
        self.assertEqual(g.failure_result(err)["errorCode"],"DRIVER_OPERATION_FAILED");self.assertEqual(lib.calls.count("PQconnectdbParams"),1)
    def test_classifier_exception_still_closes_and_clears(self):
        lib=NativeLibrary()
        with patch.object(g,"native_failure_code",side_effect=RuntimeError("synthetic-secret")):err=self.attempt(lib)
        self.assertEqual(lib.closed,1);self.assertEqual(g.failure_result(err)["errorCode"],"DRIVER_OPERATION_FAILED")
    def test_driver_load_error_is_not_misreported_as_authentication(self):
        with patch.object(g,"validate_ca",return_value="/synthetic/ca.crt"),patch.object(g.C,"CDLL",side_effect=OSError("synthetic-secret")):
            with self.assertRaises(OSError) as err:g.DirectLibpq("/synthetic/ca.crt","synthetic-input-only")
        self.assertEqual(g._stage,"driver_load");self.assertEqual(g.failure_result(err.exception)["errorCode"],"DRIVER_LOAD_FAILED")
    def test_dns_failure_has_accurate_local_phase_and_no_native_connect(self):
        lib=NativeLibrary()
        with patch.object(g,"validate_ca",return_value="/synthetic/ca.crt"),patch.object(g.C,"CDLL",return_value=lib),patch.object(g.socket,"getaddrinfo",side_effect=g.socket.gaierror(-2,"synthetic-secret")):
            with self.assertRaises(g.socket.gaierror) as err:g.DirectLibpq("/synthetic/ca.crt","synthetic-input-only")
        self.assertEqual(g._stage,"ipv6_dns");self.assertEqual(g.failure_result(err.exception)["errorCode"],"IPV6_DNS_FAILED");self.assertNotIn("PQconnectdbParams",lib.calls)
    def test_native_parameters_safeguards_and_no_success_claim_preserved(self):
        lib=NativeLibrary();err=self.attempt(lib)
        expected={"host":g.HOST.encode(),"hostaddr":b'2001:db8::1',"port":b'5432',"dbname":b'postgres',"user":b'postgres',"sslmode":b'verify-full',"sslrootcert":b'/synthetic/ca.crt',"options":g.OPTIONS.encode(),"passfile":b'/dev/null',"connect_timeout":b'8'}
        for k,v in expected.items():self.assertEqual(lib.parameters[k],v)
        self.assertEqual(lib.expand,0);self.assertIs(lib.PQerrorMessage.restype,C.c_void_p)
        self.assertIs(type(g._native_elapsed_ms),int);self.assertFalse(g.failure_result(err)["safeguardsVerified"])
    def test_cli_import_never_loads_driver_or_prompts(self):
        self.assertIs(g.C.CDLL,offline_only);self.assertIs(g.getpass.getpass,offline_only);self.assertIs(g.socket.getaddrinfo,offline_only)

if __name__ == "__main__": unittest.main()
