"""One-shot private Supabase recovery worker. No I/O on import.

Execute only from a separately reviewed, exclusive short-lived local operator.
No connector/CLI response, injected transport, ambient token or secret IPC is used.
The CLI is intentionally absent: this local package does not start live recovery.
"""
import contextlib
import getpass
import hashlib
import http.client
import ctypes
import types
import json
import logging
import os
from pathlib import Path
import re
import resource
import socket
import ssl
import sys
import threading
import time
import warnings

PROJECT = "qjksggxorghaxvpyslip"
BRANCH = "course-cutover-rehearsal-274"
BRANCH_ID = "7091bfd6-83ce-4c11-ac30-8ce85e09be2d"
PARENT = "bsndfhbemstyrrglajat"  # Identity listing only, never a database destination.
API_HOST = "api.supabase.com"
IDENTITY_PATH = "/v1/projects/" + PARENT + "/branches"
CONFIG_PATH = "/v1/branches/" + PROJECT
HOST = "db." + PROJECT + ".supabase.co"
GUARD_SHA256 = "c426f5b4ad719082255c40165ba2e64f156ffb0f7397c83ff36a7ab7734174ba"
MAX_BODY = 65536
CODES = frozenset("OPERATOR_ENTRY_REQUIRED ALREADY_USED OUTPUT_BOUNDARY_UNAVAILABLE UNSAFE_PROCESS TRUSTED_GUARD_MISMATCH AUTHORIZATION_REQUIRED PROVIDER_TLS_FAILED PROVIDER_TIMEOUT PROVIDER_INTERRUPTED PROVIDER_UNAVAILABLE PROVIDER_AUTHORIZATION_DENIED PROVIDER_REDIRECT_DENIED PROVIDER_RESPONSE_REJECTED BRANCH_IDENTITY_REJECTED CONFIG_IDENTITY_REJECTED CREDENTIAL_FORMAT_REJECTED RECOVERY_FAILED".split())
PHASES = frozenset("local_setup operator_authorization branch_identity branch_config database_connect database_inspection complete".split())
_used = False
_phase = "local_setup"
_guard = None


class RecoveryError(Exception):
    """Only fixed codes, never exception/provider text or a cause chain."""
    def __init__(self, code):
        self.code = code if code in CODES else "RECOVERY_FAILED"
        super().__init__(self.code)


def _need(value, code):
    if not value:
        raise RecoveryError(code)


def _wipe(value):
    if isinstance(value, bytearray):
        value[:] = b"\0" * len(value)


class _Discard:
    def write(self, _value):
        return 0
    def flush(self):
        pass


def _native_flush():
    # System C stdio can buffer beneath Python; flush only while fd1/2 are sunk.
    libc = ctypes.CDLL("/usr/lib/libSystem.B.dylib")
    libc.fflush.argtypes = [ctypes.c_void_p]
    libc.fflush.restype = ctypes.c_int
    _need(libc.fflush(None) == 0, "OUTPUT_BOUNDARY_UNAVAILABLE")


@contextlib.contextmanager
def _private_output():
    """Own the whole boundary, including C fd writes and existing log handlers.

    Exclusive trusted process required. Not a sandbox against hostile Python code,
    a debugger, privileged OS observer or an already compromised native library.
    """
    saved = []
    sink = None
    old_out, old_err, old_disable = sys.stdout, sys.stderr, logging.root.manager.disable
    failed = False
    try:
        for fd in (1, 2):
            saved.append((fd, os.dup(fd)))
        sink = os.open(os.devnull, os.O_WRONLY | os.O_CLOEXEC)
        for fd in (1, 2):
            os.dup2(sink, fd)
        sys.stdout = sys.stderr = _Discard()
        logging.disable(sys.maxsize)
        _native_flush()
        yield
    except BaseException:
        raise
    finally:
        # A saved stream reference can buffer despite redirected sys.stdout.
        # Drain standard/logging streams and C stdio while descriptors are sunk.
        if sink is not None and len(saved) == 2:
            streams = [old_out, old_err, sys.__stdout__, sys.__stderr__]
            for handler in tuple(logging._handlerList):
                item = handler()
                if item is not None and hasattr(item, "stream"):
                    streams.append(item.stream)
            for stream in streams:
                try:
                    if stream is not None:
                        stream.flush()
                except BaseException:
                    failed = True
            try:
                _native_flush()
            except BaseException:
                failed = True
        # Keep Python and logging suppressed until native output is restored.
        for fd, original in reversed(saved):
            try:
                os.dup2(original, fd)
            except BaseException:
                failed = True
            finally:
                try:
                    os.close(original)
                except BaseException:
                    failed = True
        if sink is not None:
            try:
                os.close(sink)
            except BaseException:
                failed = True
        sys.stdout, sys.stderr = old_out, old_err
        logging.disable(old_disable)
        if failed:
            raise RecoveryError("OUTPUT_BOUNDARY_UNAVAILABLE") from None


def _load_guard():
    path = Path(__file__).with_name("database_preflight.py")
    _need(not path.is_symlink() and path.is_file(), "TRUSTED_GUARD_MISMATCH")
    source = path.read_bytes()
    _need(hashlib.sha256(source).hexdigest() == GUARD_SHA256, "TRUSTED_GUARD_MISMATCH")
    module = types.ModuleType("_lockliel_reviewed_direct_guard")
    module.__file__ = str(path)
    exec(compile(source, str(path), "exec"), module.__dict__)
    _need(module.PROJECT == PROJECT and module.HOST == HOST, "TRUSTED_GUARD_MISMATCH")
    return module


def _authorization():
    # Only a future owner-operated hidden TTY entry. No env/keychain/CLI/config
    # discovery and no token/DB password arguments to the worker.
    value = None
    try:
        with open("/dev/tty", "w", encoding="utf-8", buffering=1) as tty:
            _need(tty.isatty(), "AUTHORIZATION_REQUIRED")
            with warnings.catch_warnings():
                warnings.simplefilter("error", getpass.GetPassWarning)
                value = getpass.getpass("Isolated Supabase read-authorized operator token (hidden): ", stream=tty)
        # Deliberately supports only classic PAT format. Other token formats need
        # separate review; do not guess a fallback or accept arbitrary headers.
        _need(type(value) is str and re.fullmatch(r"sbp_[0-9a-f]{40}", value), "AUTHORIZATION_REQUIRED")
        return bytearray(value, "ascii")
    finally:
        value = None


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        _need(key not in result, "PROVIDER_RESPONSE_REJECTED")
        result[key] = value
    return result


def _invalid_constant(_value):
    raise RecoveryError("PROVIDER_RESPONSE_REJECTED")


def _safe_tls_environment():
    # Reject ambient key logging or substitute roots before context construction.
    # Do not print values or mutate the owner's environment.
    _need(not any(os.environ.get(k) for k in ("SSLKEYLOGFILE", "SSL_CERT_FILE", "SSL_CERT_DIR")), "UNSAFE_PROCESS")


def _request(path, authorization):
    """Fixed origin native HTTPS. No proxies, redirects, retries or caller URL.

    Return stays in this process; never returned via a tool/connector protocol.
    Errors are not read or reflected. Owned mutable buffers are wiped in finally.
    Python/http.client/TLS necessarily create immutable/native transient copies.
    """
    _safe_tls_environment()
    _need(path in (IDENTITY_PATH, CONFIG_PATH), "PROVIDER_RESPONSE_REJECTED")
    _need(type(authorization) is bytearray and re.fullmatch(rb"sbp_[0-9a-f]{40}", authorization), "AUTHORIZATION_REQUIRED")
    conn = response = None
    body = bytearray()
    headers = {}
    try:
        context = ssl.create_default_context()
        _need(context.check_hostname and context.verify_mode == ssl.CERT_REQUIRED and getattr(context, "keylog_filename", None) is None, "PROVIDER_TLS_FAILED")
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        conn = http.client.HTTPSConnection(API_HOST, 443, timeout=8, context=context)
        conn.set_debuglevel(0)
        conn.connect()
        tls_socket = conn.sock
        _need(conn.host == API_HOST and conn.port == 443 and tls_socket is not None, "PROVIDER_RESPONSE_REJECTED")
        _need(tls_socket.version() in ("TLSv1.2", "TLSv1.3"), "PROVIDER_TLS_FAILED")
        deadline = time.monotonic() + 20
        headers = {"Authorization": "Bearer " + authorization.decode("ascii"), "Accept": "application/json", "Accept-Encoding": "identity", "Connection": "close"}
        conn.request("GET", path, headers=headers)
        headers.clear()
        response = conn.getresponse()
        if 300 <= response.status < 400:
            raise RecoveryError("PROVIDER_REDIRECT_DENIED")
        if response.status in (401, 403):
            raise RecoveryError("PROVIDER_AUTHORIZATION_DENIED")
        _need(response.status == 200, "PROVIDER_RESPONSE_REJECTED")
        meta = response.getheaders()
        def header(name):
            values = [v for k, v in meta if k.lower() == name]
            _need(len(values) <= 1, "PROVIDER_RESPONSE_REJECTED")
            return values[0] if values else None
        _need(header("content-type") in ("application/json", "application/json; charset=utf-8"), "PROVIDER_RESPONSE_REJECTED")
        _need(header("content-encoding") in (None, "identity") and header("location") is None, "PROVIDER_RESPONSE_REJECTED")
        length = header("content-length")
        if length is not None:
            _need(bool(re.fullmatch(r"[0-9]{1,6}", length)) and 0 < int(length) <= MAX_BODY, "PROVIDER_RESPONSE_REJECTED")
        while True:
            remaining = deadline - time.monotonic()
            _need(remaining > 0, "PROVIDER_TIMEOUT")
            tls_socket.settimeout(min(8, remaining))
            chunk = response.read(min(4096, MAX_BODY + 1 - len(body)))
            if not chunk:
                break
            body.extend(chunk)
            chunk = None
            _need(len(body) <= MAX_BODY, "PROVIDER_RESPONSE_REJECTED")
        _need(length is None or len(body) == int(length), "PROVIDER_RESPONSE_REJECTED")
        return json.loads(body, object_pairs_hook=_unique_object, parse_constant=_invalid_constant)
    except RecoveryError:
        raise
    except ssl.SSLError:
        raise RecoveryError("PROVIDER_TLS_FAILED") from None
    except (TimeoutError, socket.timeout):
        raise RecoveryError("PROVIDER_TIMEOUT") from None
    except (ConnectionError, http.client.IncompleteRead):
        raise RecoveryError("PROVIDER_INTERRUPTED") from None
    except (ValueError, UnicodeError, RecursionError):
        raise RecoveryError("PROVIDER_RESPONSE_REJECTED") from None
    except BaseException:
        raise RecoveryError("PROVIDER_UNAVAILABLE") from None
    finally:
        headers.clear()
        _wipe(body)
        # Closing is mandatory; a close failure also prevents success.
        try:
            if response is not None:
                response.close()
        finally:
            if conn is not None:
                conn.close()


def _identity(value):
    _need(type(value) is list and 1 <= len(value) <= 100 and all(type(r) is dict for r in value), "BRANCH_IDENTITY_REJECTED")
    candidates = [r for r in value if r.get("project_ref") == PROJECT or r.get("name") == BRANCH or r.get("id") == BRANCH_ID]
    _need(len(candidates) == 1, "BRANCH_IDENTITY_REJECTED")
    row = candidates[0]
    _need(row.get("project_ref") == PROJECT and row.get("name") == BRANCH and row.get("id") == BRANCH_ID and row.get("parent_project_ref") == PARENT and row.get("is_default") is False and row.get("persistent") is False and row.get("status") == "FUNCTIONS_DEPLOYED" and row.get("preview_project_status") == "ACTIVE_HEALTHY", "BRANCH_IDENTITY_REJECTED")


def _password(value):
    password = None
    try:
        _need(type(value) is dict and set(value) == {"ref", "postgres_version", "postgres_engine", "release_channel", "status", "db_host", "db_port", "db_user", "db_pass", "jwt_secret"}, "CONFIG_IDENTITY_REJECTED")
        _need(value["ref"] == PROJECT and value["db_host"] == HOST and type(value["db_port"]) is int and value["db_port"] == 5432 and value["db_user"] == "postgres" and value["status"] == "ACTIVE_HEALTHY", "CONFIG_IDENTITY_REJECTED")
        _need(type(value["postgres_version"]) is str and re.fullmatch(r"17\.[0-9.]{1,30}", value["postgres_version"]) and value["postgres_engine"] == "postgres" and value["release_channel"] == "ga", "CONFIG_IDENTITY_REJECTED")
        password = value.pop("db_pass")
        _need(type(password) is str and re.fullmatch(r"[\x21-\x7e]{8,256}", password), "CREDENTIAL_FORMAT_REJECTED")
        return bytearray(password, "ascii")
    finally:
        password = None
        if type(value) is dict:
            value.clear()  # Discard unrelated JWT material; never inspect or emit it.


def _work(ca):
    global _phase, _guard
    auth = password = config = identity = None
    plain = driver = None
    try:
        _need(sys.flags.isolated == 1 and threading.active_count() == 1 and sys.gettrace() is None and sys.getprofile() is None, "UNSAFE_PROCESS")
        _safe_tls_environment()
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        _guard = _load_guard()
        ca = _guard.validate_ca(ca)
        _phase = "operator_authorization"
        auth = _authorization()
        _phase = "branch_identity"
        identity = _request(IDENTITY_PATH, auth)
        _identity(identity)
        identity.clear()
        _phase = "branch_config"
        config = _request(CONFIG_PATH, auth)
        password = _password(config)
        _wipe(auth)
        auth = None
        # Destination is compiled into the pinned guard, never taken from JSON.
        _phase = "database_connect"
        plain = password.decode("ascii")
        try:
            driver = _guard.DirectLibpq(ca, plain)
        finally:
            plain = None
            _wipe(password)
            password = None
        _phase = "database_inspection"
        result = _guard.inspect_guarded(driver)
        # No provider-derived strings, passwords, raw errors or arbitrary receipt
        # fields cross the private boundary. Guard's actual checks establish these.
        expected = {"project": PROJECT, "host": HOST, "database": "postgres", "source": "direct-libpq-same-connection-readonly-transaction", "startupOptionsVerified": True, "tlsVerifyFull": True, "hostnameVerified": True, "transactionReadOnly": "on", "lockTimeout": "5s", "statementTimeout": "30s", "samePhysicalConnection": True, "sameTransaction": True, "inspectionQueries": 2, "noReconnect": True, "noDataWrites": True, "rolledBack": True}
        _need(type(result) is dict and all(type(result.get(k)) is type(v) and result.get(k) == v for k, v in expected.items()), "RECOVERY_FAILED")
        _need(result.get("summary") == {"migrationCount": 280, "migration280Fingerprint": "a55aead9115d12881650fee9f1bede27", "publicTables": 57, "rlsPublicTables": 57, "notesServiceTablePrivileges": 0, "notesServiceColumnPrivileges": 0}, "RECOVERY_FAILED")
        driver = None  # inspect_guarded owns rollback/close on all exits.
        _phase = "complete"
        return {"ok": True, "project": PROJECT, "branch": BRANCH, "credentialRecovered": True, "authenticationVerified": True, "tlsVerifyFull": True, "hostnameVerified": True, "directIPv6": True, "transactionReadOnly": "on", "lockTimeout": "5s", "statementTimeout": "30s", "sameConnectionAndTransaction": True, "inspectionQueries": 2, "rolledBack": True, "connectionClosed": True, "migrationCount": 280, "safeguardsVerified": True}
    finally:
        _wipe(auth)
        _wipe(password)
        plain = None
        if type(config) is dict:
            config.clear()
        if type(identity) is list:
            identity.clear()
        if driver is not None:
            driver.close()


def run_once(ca):
    """Trusted future operator entry, not a connector. Fixed safe result only.

    One use per exclusive process, consumed even on failure. A later reviewed
    execution launcher must also consume a nonsecret atomic allowance before
    starting this worker, so restarting Python cannot repeat the owner's attempt.
    No live launcher, credential source discovery or CLI activation in this package.
    """
    global _used, _phase
    if _used:
        return {"ok": False, "errorCode": "ALREADY_USED", "phase": "local_setup", "safeguardsVerified": False}
    _used = True
    _phase = "local_setup"
    result = None
    try:
        with _private_output():
            try:
                result = _work(ca)
            except BaseException as error:
                code = error.code if type(error) is RecoveryError else "RECOVERY_FAILED"
                if _guard is not None and type(error) is _guard.GuardError and error.code in (_guard.GUARD_CODES | _guard.LOCAL_CODES | _guard.NATIVE_CODES):
                    code = error.code
                # Exact types and fixed allowlists only. No str(error), repr,
                # cause, traceback, native/provider text or application echoes.
                result = {"ok": False, "errorCode": code, "phase": _phase if _phase in PHASES else "local_setup", "safeguardsVerified": False}
    except BaseException:
        result = {"ok": False, "errorCode": "OUTPUT_BOUNDARY_UNAVAILABLE", "phase": "local_setup", "safeguardsVerified": False}
    return result


if __name__ == "__main__":
    # No live entry in the offline implementation assignment.
    print('{"ok":false,"errorCode":"OPERATOR_ENTRY_REQUIRED","safeguardsVerified":false}')
    sys.exit(1)
