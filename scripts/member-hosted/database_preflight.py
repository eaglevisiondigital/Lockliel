"""Direct isolated libpq guard. No I/O on import, no connection pool or reconnect.
The command-line entry point requires a controlling local TTY for hidden input.
Only fixed SELECTs, BEGIN READ ONLY and ROLLBACK can execute in this workflow.
"""
import ctypes as C
import getpass
import hashlib
import json
import os
import resource
import re
import time
from pathlib import Path
import socket
import sys
import warnings

PROJECT = "qjksggxorghaxvpyslip"
HOST = "db." + PROJECT + ".supabase.co"
LIBPQ = "/opt/homebrew/opt/postgresql@17/lib/postgresql/libpq.5.dylib"
CA_SHA256 = "700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7"
OPTIONS = "-c default_transaction_read_only=on -c lock_timeout=5s -c statement_timeout=30s -c search_path="
GUARD_SQL = """select pg_catalog.json_build_object(
 'database',pg_catalog.current_database(),'backend_pid',pg_catalog.pg_backend_pid(),
 'transaction_started_at',pg_catalog.transaction_timestamp()::text,
 'default_read_only',pg_catalog.current_setting('default_transaction_read_only'),
 'read_only',pg_catalog.current_setting('transaction_read_only'),
 'lock_timeout',pg_catalog.current_setting('lock_timeout'),
 'statement_timeout',pg_catalog.current_setting('statement_timeout'),
 'ssl',(select ssl from pg_catalog.pg_stat_ssl where pid=pg_catalog.pg_backend_pid()),
 'tls',(select version from pg_catalog.pg_stat_ssl where pid=pg_catalog.pg_backend_pid()),
 'cipher',(select cipher from pg_catalog.pg_stat_ssl where pid=pg_catalog.pg_backend_pid()));"""
IDENTITY_SQL = "select pg_catalog.json_build_object('database',pg_catalog.current_database(),'serverVersion',pg_catalog.current_setting('server_version'));"
SUMMARY_SQL = """select pg_catalog.json_build_object(
 'migrationCount',(select count(*) from supabase_migrations.schema_migrations),
 'migration280Fingerprint',(select pg_catalog.md5(statements::text) from supabase_migrations.schema_migrations where version='20261001211009'),
 'publicTables',(select count(*) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p')),
 'rlsPublicTables',(select count(*) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') and c.relrowsecurity),
 'notesServiceTablePrivileges',(select count(*) from (values('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER'),('MAINTAIN')) p(privilege) where pg_catalog.has_table_privilege('service_role','public.lesson_private_notes',p.privilege)),
 'notesServiceColumnPrivileges',(select count(*) from (values('SELECT'),('INSERT'),('UPDATE'),('REFERENCES')) p(privilege) where pg_catalog.has_any_column_privilege('service_role','public.lesson_private_notes',p.privilege)));"""
INSPECTIONS = (("identity", IDENTITY_SQL), ("summary", SUMMARY_SQL))
_stage = "not-started"

# Diagnostics never carry native text, exception text, input values or connection strings.
MAX_NATIVE_DIAGNOSTIC = 8192
PHASES = frozenset(("not-started", "local_setup", "ca_validation", "tty_setup", "hidden_input", "driver_load", "ipv6_dns", "connection_config", "credential_validation", "native_connect", "guarded_inspection", "complete"))
NATIVE_CODES = frozenset(("AUTHENTICATION_FAILED", "AUTH_NEGOTIATION_FAILED", "SERVER_ACCESS_REJECTED", "TLS_VERIFY_FAILED", "TLS_HANDSHAKE_FAILED", "TLS_REQUIRED_UNAVAILABLE", "NATIVE_NAME_RESOLUTION_FAILED", "IPV6_ROUTE_UNAVAILABLE", "TCP_REFUSED", "CONNECTION_INTERRUPTED", "CONNECT_TIMEOUT", "SERVER_STARTUP_REJECTED", "NATIVE_HANDLE_UNAVAILABLE", "CONNECTION_FAILURE_UNCLASSIFIED"))
GUARD_CODES = frozenset("TRUSTED_CA_REQUIRED TRUSTED_CA_MISMATCH WRONG_PROJECT_OR_DATABASE TLS_IDENTITY_NOT_VERIFIED STARTUP_OPTIONS_MISMATCH TLS_NOT_VERIFIED CONNECTION_LOST READ_ONLY_NOT_ON LOCK_TIMEOUT_NOT_5S STATEMENT_TIMEOUT_NOT_30S WRONG_PHYSICAL_CONNECTION TRANSACTION_NOT_VERIFIED CONNECTION_NOT_IDLE CONNECTION_REPLACED READ_ONLY_TRANSACTION_LOST TRANSACTION_REPLACED INSPECTION_IDENTITY_MISMATCH INSPECTION_SHAPE_MISMATCH MIGRATION_BASELINE_MISMATCH SECURITY_BASELINE_MISMATCH ROLLBACK_NOT_VERIFIED PREFLIGHT_INCOMPLETE POSTGRES17_DRIVER_REQUIRED DIRECT_IPV6_REQUIRED UNEXPECTED_CLIENT_CREDENTIAL_FILE HIDDEN_PASSWORD_REQUIRED CONNECTION_OPTIONS_UNAVAILABLE QUERY_FAILED UNAPPROVED_COMMAND UNGUARDED_QUERY_DENIED QUERY_SHAPE_DENIED QUERY_RESULT_TOO_LARGE EXPLICIT_ISOLATED_ENTRY_REQUIRED PROTECTED_LOCAL_TTY_REQUIRED".split())
LOCAL_CODES = frozenset(("IPV6_DNS_FAILED", "DRIVER_LOAD_FAILED", "DRIVER_OPERATION_FAILED", "DIRECT_PREFLIGHT_UNAVAILABLE", "DIAGNOSTIC_OUTPUT_UNAVAILABLE"))
_native_elapsed_ms = None
_helper_sha256 = None
NATIVE_PATTERNS = (
    ("AUTHENTICATION_FAILED", (b"password authentication failed",)),
    ("AUTH_NEGOTIATION_FAILED", (b"sasl authentication failed", b"scram authentication failed", b"authentication method not supported", b"authentication requires")),
    ("SERVER_ACCESS_REJECTED", (b"no pg_hba.conf entry", b"pg_hba.conf rejects connection")),
    ("TLS_VERIFY_FAILED", (b"certificate verify failed", b"certificate verification failed", b"does not match host name", b"does not match hostname", b"hostname mismatch", b"root certificate file", b"server certificate could not be verified")),
    ("TLS_HANDSHAKE_FAILED", (b"ssl error:", b"tls handshake failed", b"ssl handshake failed")),
    ("TLS_REQUIRED_UNAVAILABLE", (b"server does not support ssl",)),
    ("NATIVE_NAME_RESOLUTION_FAILED", (b"could not translate host name", b"could not resolve hostname")),
    ("IPV6_ROUTE_UNAVAILABLE", (b"network is unreachable", b"no route to host")),
    ("TCP_REFUSED", (b"connection refused",)),
    ("CONNECTION_INTERRUPTED", (b"connection reset by peer", b"server closed the connection unexpectedly", b"ssl syscall error: eof detected", b"unexpected eof")),
    ("CONNECT_TIMEOUT", (b"timeout expired", b"connection timed out")),
    ("SERVER_STARTUP_REJECTED", (b"invalid value for parameter", b"unrecognized configuration parameter", b"database system is starting up", b"database system is shutting down", b"too many clients already")),
)


def classify_native_diagnostic(raw):
    """Error-family hint only. Unknown/mixed evidence never becomes a success."""
    if type(raw) not in (bytes, bytearray) or not 0 < len(raw) <= MAX_NATIVE_DIAGNOSTIC:
        return "CONNECTION_FAILURE_UNCLASSIFIED"
    matched = set()
    for line in raw.lower().splitlines():
        current = {code for code, patterns in NATIVE_PATTERNS if any(p in line for p in patterns)}
        if re.search(rb'\b(?:database|role) "[^"\r\n]{1,256}" does not exist', line):
            current.add("SERVER_STARTUP_REJECTED")
        # A single certificate error may have the generic SSL error prefix.
        # Separate or contradictory handshake failures remain ambiguous.
        if "TLS_VERIFY_FAILED" in current and "TLS_HANDSHAKE_FAILED" in current and line.count(b"ssl error:") == 1 and not any(p in line for p in (b"tls handshake failed", b"ssl handshake failed")):
            current.remove("TLS_HANDSHAKE_FAILED")
        if line.strip() and not current:
            return "CONNECTION_FAILURE_UNCLASSIFIED"
        matched.update(current)
    return next(iter(matched)) if len(matched) == 1 else "CONNECTION_FAILURE_UNCLASSIFIED"


def native_failure_code(lib, conn):
    """PQerrorMessage returns a pointer, not an unbounded c_char_p copy."""
    if not conn:
        return "NATIVE_HANDLE_UNAVAILABLE"
    pointer = lib.PQerrorMessage(conn)
    if not pointer:
        return "CONNECTION_FAILURE_UNCLASSIFIED"
    private = bytearray()
    try:
        for offset in range(MAX_NATIVE_DIAGNOSTIC + 1):
            value = C.string_at(pointer + offset, 1)[0]
            if value == 0:
                return classify_native_diagnostic(private)
            if offset == MAX_NATIVE_DIAGNOSTIC:
                return "CONNECTION_FAILURE_UNCLASSIFIED"
            private.append(value)
        return "CONNECTION_FAILURE_UNCLASSIFIED"
    finally:
        for i in range(len(private)):
            private[i] = 0


def failure_result(error):
    """Do not interpolate exceptions or trust a dynamically supplied GuardError code."""
    phase = _stage if type(_stage) is str and _stage in PHASES else "unknown"
    if isinstance(error, GuardError):
        code = error.code if type(error.code) is str and error.code in NATIVE_CODES | GUARD_CODES | LOCAL_CODES else "CONNECTION_FAILURE_UNCLASSIFIED"
    elif phase == "ipv6_dns" and isinstance(error, socket.gaierror):
        code = "IPV6_DNS_FAILED"
    elif phase == "driver_load" and isinstance(error, (OSError, AttributeError)):
        code = "DRIVER_LOAD_FAILED"
    elif phase in ("driver_load", "ipv6_dns", "connection_config", "credential_validation", "native_connect", "guarded_inspection"):
        code = "DRIVER_OPERATION_FAILED"
    else:
        code = "DIRECT_PREFLIGHT_UNAVAILABLE"
    digest = _helper_sha256 if isinstance(_helper_sha256, str) and re.fullmatch(r"[0-9a-f]{64}", _helper_sha256) else None
    elapsed = _native_elapsed_ms if type(_native_elapsed_ms) is int and 0 <= _native_elapsed_ms <= 86400000 else None
    return {"ok": False, "errorCode": code, "stage": phase, "helperSha256": digest, "nativeConnectElapsedMs": elapsed, "required": {"project": PROJECT, "transport": "direct-ipv6", "tls": "verify-full", "readOnly": "on", "lockTimeout": "5s", "statementTimeout": "30s"}, "safeguardsVerified": False}


class GuardError(Exception):
    def __init__(self, code):
        self.code = code
        super().__init__(code)

def require(value, code):
    if not value:
        raise GuardError(code)

def validate_ca(path):
    p = Path(path)
    require(p.is_absolute() and not p.is_symlink() and p.is_file(), "TRUSTED_CA_REQUIRED")
    require(hashlib.sha256(p.read_bytes()).hexdigest() == CA_SHA256, "TRUSTED_CA_MISMATCH")
    return str(p)

def validate_native(info):
    require(info.get("host") == HOST and info.get("port") == "5432" and info.get("database") == "postgres", "WRONG_PROJECT_OR_DATABASE")
    require(info.get("sslmode") == "verify-full" and info.get("ca_verified") is True and info.get("tls_active") is True, "TLS_IDENTITY_NOT_VERIFIED")
    require(info.get("startup_options") == OPTIONS, "STARTUP_OPTIONS_MISMATCH")
    require(info.get("tls_version") in ("TLSv1.2", "TLSv1.3") and isinstance(info.get("cipher"), str) and info["cipher"], "TLS_NOT_VERIFIED")
    require(type(info.get("backend_pid")) is int and info["backend_pid"] > 0 and type(info.get("socket")) is int and info["socket"] >= 0 and info.get("native_handle"), "CONNECTION_LOST")
    return (info["native_handle"], info["socket"], info["backend_pid"])

def validate_witness(row, native_pid):
    require(isinstance(row, dict) and row.get("database") == "postgres", "WRONG_PROJECT_OR_DATABASE")
    require(row.get("default_read_only") == "on" and row.get("read_only") == "on", "READ_ONLY_NOT_ON")
    require(row.get("lock_timeout") == "5s", "LOCK_TIMEOUT_NOT_5S")
    require(row.get("statement_timeout") == "30s", "STATEMENT_TIMEOUT_NOT_30S")
    require(row.get("ssl") is True and row.get("tls") in ("TLSv1.2", "TLSv1.3") and isinstance(row.get("cipher"), str) and row["cipher"], "TLS_NOT_VERIFIED")
    require(type(row.get("backend_pid")) is int and row["backend_pid"] == native_pid, "WRONG_PHYSICAL_CONNECTION")
    require(isinstance(row.get("transaction_started_at"), str) and 1 <= len(row["transaction_started_at"]) <= 80, "TRANSACTION_NOT_VERIFIED")
    return (row["backend_pid"], row["transaction_started_at"])

def inspect_guarded(driver):
    """Driver stays owned here, never returned; every exit closes it. No retry."""
    result = None
    try:
        initial = driver.identity()
        connection = validate_native(initial)
        require(initial.get("transaction_status") == 0, "CONNECTION_NOT_IDLE")
        driver.command("BEGIN READ ONLY")
        def witness(anchor=None):
            native = driver.identity()
            require(validate_native(native) == connection, "CONNECTION_REPLACED")
            require(native.get("transaction_status") == 2, "READ_ONLY_TRANSACTION_LOST")
            observed = driver.select(GUARD_SQL)
            current = validate_witness(observed, connection[2])
            after = driver.identity()
            require(validate_native(after) == connection and after.get("transaction_status") == 2, "CONNECTION_REPLACED")
            require(anchor is None or current == anchor, "TRANSACTION_REPLACED")
            return current, observed
        anchor, first = witness()
        inspections = {}
        for name, query in INSPECTIONS:
            witness(anchor)
            inspections[name] = driver.select(query)
            witness(anchor)
        identity, summary = inspections["identity"], inspections["summary"]
        require(isinstance(identity, dict) and set(identity) == {"database", "serverVersion"} and identity["database"] == "postgres" and isinstance(identity["serverVersion"], str) and identity["serverVersion"].startswith("17."), "INSPECTION_IDENTITY_MISMATCH")
        require(isinstance(summary, dict) and set(summary) == {"migrationCount", "migration280Fingerprint", "publicTables", "rlsPublicTables", "notesServiceTablePrivileges", "notesServiceColumnPrivileges"}, "INSPECTION_SHAPE_MISMATCH")
        require(summary["migrationCount"] == 280 and summary["migration280Fingerprint"] == "a55aead9115d12881650fee9f1bede27", "MIGRATION_BASELINE_MISMATCH")
        require(summary["publicTables"] == summary["rlsPublicTables"] == 57 and summary["notesServiceTablePrivileges"] == summary["notesServiceColumnPrivileges"] == 0, "SECURITY_BASELINE_MISMATCH")
        result = {"project": PROJECT, "host": HOST, "database": "postgres", "source": "direct-libpq-same-connection-readonly-transaction", "startupOptionsVerified": True, "tlsVerifyFull": True, "hostnameVerified": True, "tlsVersion": first["tls"], "cipher": first["cipher"], "backendPid": anchor[0], "transactionStartedAt": anchor[1], "transactionReadOnly": "on", "lockTimeout": "5s", "statementTimeout": "30s", "samePhysicalConnection": True, "sameTransaction": True, "inspectionQueries": len(INSPECTIONS), "postgresqlVersion": identity["serverVersion"], "summary": summary, "noReconnect": True, "noDataWrites": True}
    finally:
        try:
            if driver.connected() and driver.transaction_status() in (2, 3):
                driver.command("ROLLBACK")
                require(driver.transaction_status() == 0, "ROLLBACK_NOT_VERIFIED")
                if result is not None:
                    result["rolledBack"] = True
        finally:
            driver.close()
    require(result is not None and result.get("rolledBack") is True, "PREFLIGHT_INCOMPLETE")
    return result

class ConnOption(C.Structure):
    _fields_ = [(name, C.c_char_p) for name in ("keyword", "envvar", "compiled", "val", "label", "dispchar")] + [("dispsize", C.c_int)]

class DirectLibpq:
    def __init__(self, ca, password):
        global _stage, _native_elapsed_ms
        self.conn = None
        _stage = "ca_validation"
        self.ca = validate_ca(ca)
        _stage = "driver_load"
        self.lib = C.CDLL(LIBPQ)
        signatures = {"PQlibVersion": ([], C.c_int), "PQconnectdbParams": ([C.POINTER(C.c_char_p), C.POINTER(C.c_char_p), C.c_int], C.c_void_p), "PQstatus": ([C.c_void_p], C.c_int), "PQfinish": ([C.c_void_p], None), "PQbackendPID": ([C.c_void_p], C.c_int), "PQsocket": ([C.c_void_p], C.c_int), "PQtransactionStatus": ([C.c_void_p], C.c_int), "PQsslInUse": ([C.c_void_p], C.c_int), "PQsslAttribute": ([C.c_void_p, C.c_char_p], C.c_char_p), "PQconninfo": ([C.c_void_p], C.POINTER(ConnOption)), "PQconninfoFree": ([C.POINTER(ConnOption)], None), "PQexec": ([C.c_void_p, C.c_char_p], C.c_void_p), "PQresultStatus": ([C.c_void_p], C.c_int), "PQntuples": ([C.c_void_p], C.c_int), "PQnfields": ([C.c_void_p], C.c_int), "PQgetisnull": ([C.c_void_p, C.c_int, C.c_int], C.c_int), "PQgetlength": ([C.c_void_p, C.c_int, C.c_int], C.c_int), "PQgetvalue": ([C.c_void_p, C.c_int, C.c_int], C.c_char_p), "PQclear": ([C.c_void_p], None), "PQerrorMessage": ([C.c_void_p], C.c_void_p)}
        for name, (args, ret) in signatures.items():
            fn = getattr(self.lib, name); fn.argtypes = args; fn.restype = ret
        require(self.lib.PQlibVersion() // 10000 == 17, "POSTGRES17_DRIVER_REQUIRED")
        # No ambient PG credentials/service/SSL defaults or alternate host address.
        for key in tuple(os.environ):
            if key.startswith("PG"):
                os.environ.pop(key, None)
        _stage = "ipv6_dns"
        addresses = socket.getaddrinfo(HOST, 5432, socket.AF_INET6, socket.SOCK_STREAM)
        require(bool(addresses), "DIRECT_IPV6_REQUIRED")
        _stage = "connection_config"
        params = {"host": HOST, "hostaddr": addresses[0][4][0], "port": "5432", "dbname": "postgres", "user": "postgres", "sslmode": "verify-full", "sslrootcert": self.ca, "gssencmode": "disable", "passfile": "/dev/null", "connect_timeout": "8", "application_name": "lockliel-wave10ia-readonly", "options": OPTIONS, "sslcert": str(Path(self.ca).parent / "unused-client-cert.crt"), "sslkey": str(Path(self.ca).parent / "unused-client-key.key")}
        require(not Path(params["sslcert"]).exists() and not Path(params["sslkey"]).exists(), "UNEXPECTED_CLIENT_CREDENTIAL_FILE")
        _stage = "credential_validation"
        require(isinstance(password, str) and 0 < len(password) <= 1024 and "\0" not in password, "HIDDEN_PASSWORD_REQUIRED")
        keys = [k.encode() for k in params] + [b"password"]
        buffers = [C.create_string_buffer(v.encode()) for v in params.values()] + [C.create_string_buffer(password.encode())]
        password = None
        key_array = (C.c_char_p * (len(keys) + 1))(*keys, None)
        values = (C.c_char_p * (len(buffers) + 1))(*[C.cast(b, C.c_char_p) for b in buffers], None)
        try:
            _stage = "native_connect"
            started = time.monotonic_ns()
            try:
                self.conn = self.lib.PQconnectdbParams(key_array, values, 0)
            finally:
                _native_elapsed_ms = max(0, (time.monotonic_ns() - started) // 1000000)
            if not self.connected():
                raise GuardError(native_failure_code(self.lib, self.conn))
        except BaseException:
            self.close()
            raise
        finally:
            for buf in buffers:
                C.memset(C.addressof(buf), 0, C.sizeof(buf))

    def connected(self):
        return bool(self.conn) and self.lib.PQstatus(self.conn) == 0

    def transaction_status(self):
        return self.lib.PQtransactionStatus(self.conn) if self.conn else 4

    def identity(self):
        require(self.connected(), "CONNECTION_LOST")
        options = self.lib.PQconninfo(self.conn)
        require(bool(options), "CONNECTION_OPTIONS_UNAVAILABLE")
        # Never copy password or any unrelated connection value into Python/output.
        allowed = {"host", "port", "dbname", "sslmode", "sslrootcert", "options"}
        info = {}; index = 0
        try:
            while options[index].keyword:
                key = options[index].keyword.decode()
                if key in allowed:
                    info[key] = (options[index].val or b"").decode()
                index += 1
        finally:
            self.lib.PQconninfoFree(options)
        attr = lambda name: (self.lib.PQsslAttribute(self.conn, name.encode()) or b"").decode()
        return {"host": info.get("host"), "port": info.get("port"), "database": info.get("dbname"), "sslmode": info.get("sslmode"), "ca_verified": info.get("sslrootcert") == self.ca, "startup_options": info.get("options"), "tls_active": self.lib.PQsslInUse(self.conn) == 1, "tls_version": attr("protocol"), "cipher": attr("cipher"), "backend_pid": self.lib.PQbackendPID(self.conn), "socket": self.lib.PQsocket(self.conn), "native_handle": self.conn, "transaction_status": self.transaction_status()}

    def _exec(self, sql, expected):
        require(self.connected(), "CONNECTION_LOST")
        result = self.lib.PQexec(self.conn, sql.encode())
        require(bool(result), "QUERY_FAILED")
        if self.lib.PQresultStatus(result) != expected:
            self.lib.PQclear(result)
            raise GuardError("QUERY_FAILED")
        return result

    def command(self, sql):
        require(sql in ("BEGIN READ ONLY", "ROLLBACK"), "UNAPPROVED_COMMAND")
        result = self._exec(sql, 1)
        self.lib.PQclear(result)

    def select(self, sql):
        require(sql in (GUARD_SQL, IDENTITY_SQL, SUMMARY_SQL) and self.transaction_status() == 2, "UNGUARDED_QUERY_DENIED")
        result = self._exec(sql, 2)
        try:
            require(self.lib.PQntuples(result) == 1 and self.lib.PQnfields(result) == 1 and not self.lib.PQgetisnull(result, 0, 0), "QUERY_SHAPE_DENIED")
            require(self.lib.PQgetlength(result, 0, 0) <= 16000, "QUERY_RESULT_TOO_LARGE")
            return json.loads(self.lib.PQgetvalue(result, 0, 0).decode())
        except (ValueError, UnicodeError):
            raise GuardError("QUERY_SHAPE_DENIED") from None
        finally:
            self.lib.PQclear(result)

    def close(self):
        if self.conn:
            self.lib.PQfinish(self.conn)
            self.conn = None

def main():
    global _stage, _native_elapsed_ms, _helper_sha256
    _stage = "local_setup"
    _native_elapsed_ms = None
    _helper_sha256 = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    require(len(sys.argv) == 3 and sys.argv[1] == "--isolated-readonly", "EXPLICIT_ISOLATED_ENTRY_REQUIRED")
    _stage = "ca_validation"
    ca = validate_ca(sys.argv[2])
    # Never permit getpass's fallback to echoed stdin or an argument/file value.
    _stage = "tty_setup"
    with open("/dev/tty", "w", encoding="utf-8", buffering=1) as tty:
        require(tty.isatty(), "PROTECTED_LOCAL_TTY_REQUIRED")
        with warnings.catch_warnings():
            warnings.simplefilter("error", getpass.GetPassWarning)
            _stage = "hidden_input"
            password = getpass.getpass("Isolated qjks database password (hidden): ", stream=tty)
        driver = None
        try:
            _stage = "ca_validation"
            driver = DirectLibpq(ca, password)
        finally:
            password = None
        _stage = "guarded_inspection"
        result = inspect_guarded(driver)
    _stage = "complete"
    return {"ok": True, "receipt": result}

def run_cli():
    # Native notices bypass Python exception sanitization. Suppress both native
    # output descriptors during work; hidden getpass uses its explicit /dev/tty.
    # No success is emitted before output restoration is independently complete.
    global _stage, _native_elapsed_ms, _helper_sha256
    _stage = "local_setup"; _native_elapsed_ms = None; _helper_sha256 = None
    saved = []; sink = None; result = None; status = 1; output_failed = False
    try:
        for fd in (1, 2):
            saved.append((fd, os.dup(fd)))
        sink = os.open(os.devnull, os.O_WRONLY | os.O_CLOEXEC)
        for fd in (1, 2):
            os.dup2(sink, fd)
        try:
            result = main()
            require(isinstance(result, dict) and result.get("ok") is True, "PREFLIGHT_INCOMPLETE")
            status = 0
        except BaseException as exc:
            result = failure_result(exc)
    except BaseException:
        output_failed = True
    finally:
        for fd, original in reversed(saved):
            try:
                os.dup2(original, fd)
            except BaseException:
                output_failed = True
            finally:
                try:
                    os.close(original)
                except BaseException:
                    output_failed = True
        if sink is not None:
            try:
                os.close(sink)
            except BaseException:
                output_failed = True
    if output_failed:
        result = failure_result(GuardError("DIAGNOSTIC_OUTPUT_UNAVAILABLE")); status = 1
    try:
        print(json.dumps(result, separators=(",", ":")))
    except BaseException:
        return 1
    return status


if __name__ == "__main__":
    sys.exit(run_cli())
