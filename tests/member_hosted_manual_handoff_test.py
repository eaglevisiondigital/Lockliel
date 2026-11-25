"""Synthetic-only manual handoff tests. Network/native drivers fail closed."""
import contextlib
import ctypes
import hashlib
import importlib.util
import io
import json
import logging
import locale
import os
from pathlib import Path
import pty
import select
import socket
import subprocess
import sys
import tempfile
import termios
import time
import types
import unittest
import warnings
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT/'scripts/member-hosted'
PYTHON = '/Library/Developer/CommandLineTools/usr/bin/python3' if sys.platform == 'darwin' else sys.executable
ENV = {'PATH':'/usr/bin:/bin','LANG':'C','LC_ALL':'C'}
def load(name, file):
    spec = importlib.util.spec_from_file_location(name, file)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m
m = load('manual_test_worker', SOURCE/'manual_database_preflight.py')
l = load('manual_test_launcher', SOURCE/'manual_recovery_launcher.py')
b = load('boundary_test', SOURCE/'supabase_recovery.py')
a = load('attempt_support', SOURCE/'recovery_launcher.py')
prior = load('guard_test_fixtures', ROOT/'tests/member_hosted_database_preflight_test.py')
g = prior.g
ATTEMPTS = []
def deny(*_args, **_kw):
    ATTEMPTS.append('FORBIDDEN_IO')
    raise AssertionError('Forbidden real I/O')
socket.socket = socket.create_connection = socket.getaddrinfo = deny
ctypes.CDLL = deny
m.getpass.getpass = deny
PASSWORD = 'SYNTHETIC-only-$:quote\'"\\! Ω'


def fixture(root, grant):
    root.mkdir(mode=0o700)
    (root/'kit').mkdir(mode=0o700)
    (root/'READY').mkdir(mode=0o700)
    p = root/'READY/grant.json'
    p.write_text(json.dumps(grant,sort_keys=True,separators=(',',':'))+'\n')
    p.chmod(0o400)


class WorkerTests(unittest.TestCase):
    def setUp(self):
        m._used = False
        m._guard = None
        self.stack = contextlib.ExitStack()
        self.addCleanup(self.stack.close)
        self.password = bytearray(PASSWORD,'utf-8')
        self.driver = prior.Driver()
        self.calls = []
        self.stack.enter_context(patch.object(m,'load_boundary',return_value=b))
        self.stack.enter_context(patch.object(b,'_native_flush'))
        self.stack.enter_context(patch.object(b,'_load_guard',return_value=g))
        self.stack.enter_context(patch.object(g,'validate_ca',return_value='/synthetic/ca.crt'))
        self.input = self.stack.enter_context(patch.object(m,'hidden_password',return_value=self.password))
        def driver(ca,password):
            self.calls.append('CONNECT')
            self.assertEqual(password,PASSWORD)
            return self.driver
        self.connect = self.stack.enter_context(patch.object(g,'DirectLibpq',side_effect=driver))
    def run_worker(self):
        result = m.run_once('/synthetic/ca.crt')
        self.assertNotIn(PASSWORD,json.dumps(result))
        self.assertNotIn('SYNTHETIC',json.dumps(result))
        return result
    def test_success_guard_values_and_no_recovery_claim(self):
        result = self.run_worker()
        self.assertTrue(result['ok'])
        self.assertFalse(result['credentialRecovered'])
        self.assertTrue(result['manualHandoff'])
        self.assertEqual(result['identityEvidence'],'historical-provider-metadata-2026-11-02')
        self.assertEqual((result['transactionReadOnly'],result['lockTimeout'],result['statementTimeout']),('on','5s','30s'))
        self.assertEqual(self.connect.call_count,1)
        self.assertTrue(self.driver.closed)
        self.assertEqual(self.driver.calls[0],'BEGIN READ ONLY')
        self.assertEqual(self.driver.calls[-1],'ROLLBACK')
    def test_mutable_password_wiped_success(self):
        self.run_worker()
        self.assertTrue(self.password and not any(self.password))
    def test_second_call_never_inputs_or_connects(self):
        self.run_worker()
        self.assertEqual(self.run_worker()['errorCode'],'ALREADY_USED')
        self.assertEqual(self.input.call_count,1)
        self.assertEqual(self.connect.call_count,1)
    def test_wrong_identity_denied_before_password(self):
        with patch.object(m,'validate_identity',side_effect=m.HandoffError('BRANCH_IDENTITY_REJECTED')):
            self.assertFalse(self.run_worker()['ok'])
        self.input.assert_not_called()
        self.connect.assert_not_called()
    def test_authentication_failure_no_retry_and_disposal(self):
        self.connect.side_effect = g.GuardError('AUTHENTICATION_FAILED')
        result = self.run_worker()
        self.assertEqual((result['errorCode'],result['phase']),('AUTHENTICATION_FAILED','database_connect'))
        self.assertFalse(any(self.password))
        self.assertEqual(self.run_worker()['errorCode'],'ALREADY_USED')
        self.assertEqual(self.connect.call_count,1)
    def test_connection_failures_sanitized_and_disposed(self):
        for code in ('IPV6_DNS_FAILED','IPV6_ROUTE_UNAVAILABLE','TCP_REFUSED','TLS_VERIFY_FAILED','CONNECT_TIMEOUT','CONNECTION_FAILURE_UNCLASSIFIED'):
            m._used = False
            self.password[:] = PASSWORD.encode()
            self.connect.side_effect = g.GuardError(code)
            result = self.run_worker()
            self.assertEqual(result['errorCode'],code)
            self.assertFalse(any(self.password))
    def test_unexpected_exception_never_reflected(self):
        self.connect.side_effect = RuntimeError(PASSWORD)
        result = self.run_worker()
        self.assertEqual(result['errorCode'],'MANUAL_HANDOFF_FAILED')
        self.assertFalse(any(self.password))
    def test_interrupt_during_input_fail_closed(self):
        self.input.side_effect = KeyboardInterrupt(PASSWORD)
        result = self.run_worker()
        self.assertFalse(result['ok'])
        self.connect.assert_not_called()
    def test_interrupt_during_connection_wipes_password(self):
        self.connect.side_effect = KeyboardInterrupt(PASSWORD)
        self.assertFalse(self.run_worker()['ok'])
        self.assertFalse(any(self.password))
    def test_readonly_off_denied(self):
        self.driver.guard_change['read_only'] = 'off'
        self.assertEqual(self.run_worker()['errorCode'],'READ_ONLY_NOT_ON')
        self.assertTrue(self.driver.closed)
    def test_wrong_lock_timeout_denied(self):
        self.driver.guard_change['lock_timeout'] = '0'
        self.assertEqual(self.run_worker()['errorCode'],'LOCK_TIMEOUT_NOT_5S')
    def test_wrong_statement_timeout_denied(self):
        self.driver.guard_change['statement_timeout'] = '2min'
        self.assertEqual(self.run_worker()['errorCode'],'STATEMENT_TIMEOUT_NOT_30S')
    def test_lost_connection_denied_without_reconnect(self):
        def lost(driver,_sql):
            driver.connected_value = False
            raise g.GuardError('CONNECTION_LOST')
        self.driver.trigger = lost
        self.assertFalse(self.run_worker()['ok'])
        self.assertEqual(self.connect.call_count,1)
    def test_wrong_database_or_host_denied(self):
        self.driver.native_change['host'] = 'db.bsndfhbemstyrrglajat.supabase.co'
        self.assertEqual(self.run_worker()['errorCode'],'WRONG_PROJECT_OR_DATABASE')
    def test_native_and_logging_output_sunk(self):
        def inspect(_driver):
            os.write(1,PASSWORD.encode())
            os.write(2,PASSWORD.encode())
            print(PASSWORD)
            logging.error(PASSWORD)
            raise RuntimeError(PASSWORD)
        with patch.object(g,'inspect_guarded',side_effect=inspect):
            self.assertFalse(self.run_worker()['ok'])
    def test_inspection_failure_rolls_back_and_closes(self):
        def bad_summary(driver,sql):
            if sql == g.SUMMARY_SQL:
                driver.tx = 3
                raise g.GuardError('MIGRATION_BASELINE_MISMATCH')
        self.driver.trigger = bad_summary
        self.assertEqual(self.run_worker()['errorCode'],'MIGRATION_BASELINE_MISMATCH')
        self.assertEqual(self.driver.calls[-1],'ROLLBACK')
        self.assertTrue(self.driver.closed)


class IdentityAndPinTests(unittest.TestCase):
    def test_independent_receipt_matches_prior_provider_evidence(self):
        original = ROOT/'docs/coordination/evidence/2026-11-02-wave10ie/isolated-identity.json'
        self.assertEqual((SOURCE/'manual-branch-identity.json').read_bytes(),original.read_bytes())
        self.assertEqual(m.validate_identity(),'historical-provider-metadata-2026-11-02')
    def test_wrong_production_sibling_name_branch_and_defaults_denied(self):
        original = json.loads((SOURCE/'manual-branch-identity.json').read_bytes())
        for change in ({'project_ref':'bsndfhbemstyrrglajat'},{'project_ref':'sibling'},{'name':'other'},{'id':'other'},{'is_default':True},{'is_default':0},{'parent_project_ref':'other'}):
            value = json.loads(json.dumps(original))
            value['isolatedBranch'][0].update(change)
            with patch.object(m,'pinned',return_value=json.dumps(value).encode()):
                with self.assertRaises(m.HandoffError):m.validate_identity()
    def test_duplicate_or_extra_identity_metadata_denied(self):
        original = json.loads((SOURCE/'manual-branch-identity.json').read_bytes())
        for value in ({**original,'extra':True},{**original,'isolatedBranch':original['isolatedBranch']*2}):
            with patch.object(m,'pinned',return_value=json.dumps(value).encode()):
                with self.assertRaises(m.HandoffError):m.validate_identity()
    def test_changed_receipt_hash_denied(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)/'receipt';p.write_text('{}')
            with self.assertRaises(m.HandoffError):m.pinned(p,m.IDENTITY_SHA256)
    def test_receipt_symlink_denied(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)/'receipt';p.symlink_to(SOURCE/'manual-branch-identity.json')
            with self.assertRaises(OSError):m.pinned(p,m.IDENTITY_SHA256)
    def test_exact_source_pins(self):
        for name,digest in [('manual_database_preflight.py',l.WORKER_HASH),('database_preflight.py',l.GUARD_HASH),('recovery_launcher.py',l.SUPPORT_HASH),('recovery-runtime-manifest.json',l.RUNTIME_HASH),('manual-branch-identity.json',l.IDENTITY_HASH)]:
            self.assertEqual(hashlib.sha256((SOURCE/name).read_bytes()).hexdigest(),digest)
        self.assertEqual(m.load_boundary().GUARD_SHA256,l.GUARD_HASH)
    def test_altered_executable_never_executes(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)/'code';p.write_text('raise Exception("NOT_EXECUTED")')
            with self.assertRaises(l.Stop):l._module('never',p,l.WORKER_HASH)
    def test_bootstrap_verifies_new_and_unchanged_sources(self):
        text = (SOURCE/'manual-recovery-launch.command').read_text()
        self.assertIn(l.WORKER_HASH,text)
        self.assertIn(hashlib.sha256((SOURCE/'manual_recovery_launcher.py').read_bytes()).hexdigest(),text)
        self.assertIn(l.SUPPORT_HASH,text)
        self.assertIn('env -i',text)
        self.assertIn('-I -B -S',text)
        self.assertNotIn('--offline-verify',text)
    def test_no_management_call_in_manual_worker(self):
        text = (SOURCE/'manual_database_preflight.py').read_text()
        for forbidden in ('_request(', 'http.client', 'socket.', 'getenv(', 'os.environ[', 'subprocess.'):
            self.assertNotIn(forbidden,text)


class HiddenInputTests(unittest.TestCase):
    def tty(self):
        t = io.StringIO();t.isatty = lambda:True
        return contextlib.nullcontext(t)
    def test_special_characters_pass_opaque(self):
        with patch('builtins.open',return_value=self.tty()),patch.object(m.getpass,'getpass',return_value=PASSWORD):
            value = m.hidden_password()
        self.assertEqual(value.decode(),PASSWORD)
        b._wipe(value)
    def test_missing_tty_never_falls_back(self):
        with patch('builtins.open',side_effect=OSError('SYNTHETIC')):
            with self.assertRaises(OSError):m.hidden_password()
    def test_no_echo_fallback_warning_is_error(self):
        def warn(*_args,**_kw):warnings.warn('synthetic fallback',m.getpass.GetPassWarning)
        with patch('builtins.open',return_value=self.tty()),patch.object(m.getpass,'getpass',side_effect=warn):
            with self.assertRaises(m.getpass.GetPassWarning):m.hidden_password()
    def test_empty_nul_newline_and_oversize_denied(self):
        for value in ('','x\0y','x\ny','x\ry','a'*1025):
            with patch('builtins.open',return_value=self.tty()),patch.object(m.getpass,'getpass',return_value=value):
                with self.assertRaises(m.HandoffError):m.hidden_password()
    def test_process_locale_restored_after_success(self):
        before = locale.setlocale(locale.LC_CTYPE)
        with patch('builtins.open',return_value=self.tty()),patch.object(m.getpass,'getpass',return_value=PASSWORD):
            value = m.hidden_password()
        b._wipe(value)
        self.assertEqual(locale.setlocale(locale.LC_CTYPE),before)
    def test_process_locale_restored_after_input_exception(self):
        before = locale.setlocale(locale.LC_CTYPE)
        with patch('builtins.open',return_value=self.tty()),patch.object(m.getpass,'getpass',side_effect=KeyboardInterrupt):
            with self.assertRaises(KeyboardInterrupt):m.hidden_password()
        self.assertEqual(locale.setlocale(locale.LC_CTYPE),before)
    def test_process_locale_restored_after_echo_warning(self):
        before = locale.setlocale(locale.LC_CTYPE)
        def warn(*_args,**_kw):warnings.warn('synthetic fallback',m.getpass.GetPassWarning)
        with patch('builtins.open',return_value=self.tty()),patch.object(m.getpass,'getpass',side_effect=warn):
            with self.assertRaises(m.getpass.GetPassWarning):m.hidden_password()
        self.assertEqual(locale.setlocale(locale.LC_CTYPE),before)
    def test_unavailable_utf8_locale_denies_before_input(self):
        before = locale.setlocale(locale.LC_CTYPE)
        real = locale.setlocale
        def unavailable(category,value=None):
            if value == 'en_US.UTF-8':raise locale.Error('SYNTHETIC')
            return real(category) if value is None else real(category,value)
        with patch.object(m.locale,'setlocale',side_effect=unavailable),patch.object(m.getpass,'getpass') as entry:
            with self.assertRaises(locale.Error):m.hidden_password()
            entry.assert_not_called()
        self.assertEqual(locale.setlocale(locale.LC_CTYPE),before)
    def test_restore_failure_wipes_created_buffer(self):
        real_locale = locale.setlocale
        before = real_locale(locale.LC_CTYPE)
        calls = []
        buffers = []
        real_buffer = bytearray
        def track(value,encoding):
            result = real_buffer(value,encoding)
            buffers.append(result)
            return result
        def setting(category,value=None):
            if value is not None:
                calls.append(value)
                if len(calls) == 2:raise locale.Error('SYNTHETIC')
            return real_locale(category) if value is None else real_locale(category,value)
        try:
            with patch('builtins.open',return_value=self.tty()),patch.object(m.getpass,'getpass',return_value=PASSWORD),patch.object(m.locale,'setlocale',side_effect=setting),patch.object(m,'bytearray',side_effect=track,create=True):
                with self.assertRaises(locale.Error):m.hidden_password()
            self.assertEqual(len(buffers),1)
            self.assertFalse(any(buffers[0]))
        finally:
            real_locale(locale.LC_CTYPE,before)
    def test_synthetic_hidden_tty_no_echo(self):
        pid,master = pty.fork()
        if pid == 0:
            # Fork inherits only synthetic data. Fresh isolated Python restores getpass.
            code = "import importlib.util,os; s=importlib.util.spec_from_file_location('m',%r);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);v=m.hidden_password();good=v==bytearray(%r,'utf-8');v[:]=b'\\0'*len(v);os.write(1,b'INPUT_PASS' if good else b'FAIL');os._exit(0 if good else 1)" % (str(SOURCE/'manual_database_preflight.py'),PASSWORD)
            os.execve(PYTHON,[PYTHON,'-I','-B','-S','-c',code],ENV)
        data = b''
        try:
            deadline = time.monotonic()+6
            while b'(hidden): ' not in data:
                self.assertLess(time.monotonic(),deadline)
                if select.select([master],[],[],0.2)[0]:
                    part = os.read(master,4096)
                    self.assertTrue(part, 'Synthetic TTY child closed without success')
                    data += part
            self.assertFalse(termios.tcgetattr(master)[3]&termios.ECHO)
            os.write(master,PASSWORD.encode()+b'\n')
            while b'INPUT_PASS' not in data:
                self.assertLess(time.monotonic(),deadline)
                if select.select([master],[],[],0.2)[0]:
                    part = os.read(master,4096)
                    self.assertTrue(part, 'Synthetic TTY child closed without success')
                    data += part
            self.assertNotIn(PASSWORD.encode(),data)
            self.assertEqual(os.waitpid(pid,0)[1],0)
        finally:
            os.close(master)
            try:os.kill(pid,9);os.waitpid(pid,0)
            except ProcessLookupError:pass


class LauncherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='lockliel-wave10ii-synthetic-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)/'attempt'
        fixture(self.root,l.GRANT)
        self.support = load('support_'+str(id(self)),SOURCE/'recovery_launcher.py')
        self.support.ROOT = self.root
        self.support.GRANT = l.GRANT
        self.stack = contextlib.ExitStack()
        self.addCleanup(self.stack.close)
        self.stack.enter_context(patch.object(l,'ROOT',self.root))
        self.stack.enter_context(patch.object(l.sys,'argv',[str(self.root/'kit/manual_recovery_launcher.py'),'--execute-one-authorized-handoff']))
        self.worker = types.SimpleNamespace(CODES=m.CODES,PHASES=m.PHASES,_guard=None)
        self.calls = []
        def run(_ca):
            self.assertTrue((self.root/'CONSUMED').is_dir())
            self.calls.append('INPUT')
            return {'ok':False,'errorCode':'HIDDEN_PASSWORD_REQUIRED','phase':'hidden_input','safeguardsVerified':False}
        self.worker.run_once = run
        self.stack.enter_context(patch.object(l,'_prepare',return_value=(self.support,self.worker,'/synthetic/ca.crt')))
    def child(self,manual=True,sleep=False):
        code = "import importlib.util,pathlib,sys,time; s=importlib.util.spec_from_file_location('a',%r);a=importlib.util.module_from_spec(s);s.loader.exec_module(a);a.ROOT=pathlib.Path(%r);" % (str(SOURCE/'recovery_launcher.py'),str(self.root))
        if manual:
            code += "s=importlib.util.spec_from_file_location('m',%r);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);a.GRANT=m.GRANT;" % str(SOURCE/'manual_recovery_launcher.py')
        code += "\ntry:\n a.consume_attempt();print('CLAIMED',flush=True);"+('time.sleep(30)' if sleep else 'pass')+"\nexcept BaseException:print('DENIED',flush=True);sys.exit(1)"
        return [PYTHON,'-I','-B','-S','-c',code]
    def test_manual_consumes_once_before_input_and_persists_fixed_result(self):
        result = l.execute()
        self.assertTrue(result['attemptConsumed'])
        self.assertEqual(self.calls,['INPUT'])
        self.assertEqual(json.loads((self.root/'result.json').read_text()),result)
        self.assertFalse(l.execute()['ok'])
        self.assertEqual(self.calls,['INPUT'])
    def test_existing_pat_grant_rejected_without_consumption(self):
        p = self.root/'READY/grant.json';p.chmod(0o600)
        p.write_text(json.dumps(a.GRANT,sort_keys=True,separators=(',',':'))+'\n');p.chmod(0o400)
        self.assertEqual(l.execute()['errorCode'],'AUTHORIZATION_RECONCILIATION_REQUIRED')
        self.assertEqual(self.calls,[])
        self.assertTrue((self.root/'READY').exists())
    def test_old_entry_rejects_new_grant(self):
        p = subprocess.run(self.child(manual=False),capture_output=True,env=ENV)
        self.assertEqual(p.returncode,1)
        self.assertTrue((self.root/'READY').exists())
    def test_new_claim_blocks_old_and_new_process_restart(self):
        p = subprocess.run(self.child(),capture_output=True,env=ENV)
        self.assertEqual(p.returncode,0)
        for manual in (True,False):
            p = subprocess.run(self.child(manual),capture_output=True,env=ENV)
            self.assertEqual(p.returncode,1)
    def test_concurrent_entrypoints_exactly_one_claim(self):
        children = [subprocess.Popen(self.child(manual),stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=ENV) for manual in (True,False,True,True)]
        outcomes = [(p.communicate(timeout=8),p.returncode) for p in children]
        self.assertEqual(sum(code==0 for _,code in outcomes),1)
    def test_interrupt_remains_consumed(self):
        p = subprocess.Popen(self.child(sleep=True),stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=ENV)
        try:
            self.assertEqual(p.stdout.readline(),b'CLAIMED\n')
            p.kill();p.communicate(timeout=5)
        finally:
            if p.poll() is None:p.kill();p.wait()
        retry = subprocess.run(self.child(),capture_output=True,env=ENV)
        self.assertEqual(retry.returncode,1)
    def test_failed_fsync_never_reaches_password(self):
        with patch.object(self.support.os,'fsync',side_effect=OSError('SYNTHETIC')):
            result = l.execute()
        self.assertFalse(result['ok'])
        self.assertFalse((self.root/'READY').exists())
        self.assertEqual(self.calls,[])
    def test_missing_or_ambiguous_state_never_repaired(self):
        (self.root/'READY').rename(self.root/'MISSING')
        self.assertFalse(l.execute()['ok'])
        self.assertFalse((self.root/'READY').exists())
        self.assertEqual(self.calls,[])
    def test_production_sibling_and_wrong_branch_grants_rejected(self):
        p = self.root/'READY/grant.json'
        for change in ({'project':'bsndfhbemstyrrglajat'},{'project':'sibling'},{'branch':'other'}):
            p.chmod(0o600);p.write_text(json.dumps({**l.GRANT,**change},sort_keys=True,separators=(',',':'))+'\n');p.chmod(0o400)
            self.assertEqual(l.execute()['errorCode'],'AUTHORIZATION_RECONCILIATION_REQUIRED')
            self.assertEqual(self.calls,[])
    def test_source_failure_never_consumes_or_inputs(self):
        with patch.object(l,'_prepare',side_effect=l.Stop('SOURCE_MISMATCH')):
            self.assertEqual(l.execute()['errorCode'],'SOURCE_MISMATCH')
        self.assertTrue((self.root/'READY').exists())
        self.assertEqual(self.calls,[])
    def test_extra_argument_denied(self):
        with patch.object(l.sys,'argv',['arbitrary','SYNTHETIC']):self.assertFalse(l.execute()['ok'])
        self.assertTrue((self.root/'READY').exists())
    def test_unexpected_secret_exception_not_reflected(self):
        self.worker.run_once = lambda _ca:(_ for _ in ()).throw(RuntimeError(PASSWORD))
        result = l.execute()
        self.assertNotIn(PASSWORD,json.dumps(result))
        self.assertFalse(result['retryAllowed'])
    def test_result_projection_rejects_arbitrary_keys(self):
        for value in ({'ok':True,'password':PASSWORD},{'ok':False,'errorCode':PASSWORD,'phase':'hidden_input','safeguardsVerified':False}):
            with self.assertRaises(l.Stop):l.safe_result(value,self.worker)
    def test_no_grant_reset_or_initializer(self):
        source = (SOURCE/'manual_recovery_launcher.py').read_text()
        for forbidden in ('mkdir(', 'unlink(', 'rmtree(', 'getpass(', 'socket.', 'subprocess.', 'rename('):
            self.assertNotIn(forbidden,source)
    def test_no_forbidden_live_io(self):self.assertEqual(ATTEMPTS,[])


if __name__ == '__main__':
    result = unittest.main(exit=False)
    if ATTEMPTS:raise SystemExit('Forbidden offline I/O attempt')
    raise SystemExit(not result.result.wasSuccessful())
