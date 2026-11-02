"""State-machine regressions; synthetic drivers only, no network/passwords."""
import copy
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

if __name__ == "__main__": unittest.main()
