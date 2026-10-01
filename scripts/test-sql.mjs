// Creates its own cluster. Never connects to a caller-supplied database or service.
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const review275 = process.argv.length === 3 && process.argv[2] === '--review-275';
if (process.argv.length !== 2 && !review275) throw new Error('SQL tests accept only the fixed --review-275 profile, never connection arguments.');
const repo = fileURLToPath(new URL('../', import.meta.url));
// Do not inherit PGHOST, PGSERVICE, PGOPTIONS, DATABASE_URL, secrets or shell startup files.
const env = { PATH: process.env.PATH, LANG: 'C', LC_ALL: 'C' };
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {env, encoding: 'utf8', timeout: 120000, ...options});
  if (result.error || result.status !== 0) {
    throw new Error(`${command} failed: ${result.error?.message || result.stderr || result.stdout}`);
  }
  return result.stdout;
}
const version = run('initdb', ['--version']);
if (!/PostgreSQL\) 17\./.test(version)) throw new Error('PostgreSQL 17 binaries must be on PATH.');
const root = mkdtempSync(join(tmpdir(), 'lockliel-sql-'));
const data = join(root, 'data');
const socket = join(root, 'socket');
mkdirSync(socket, {mode: 0o700});
let started = false;
const args = ['-X', '-h', socket, '-p', '5432', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'];
function sql(source) { return run('psql', [...args, '-qAt'], {input: source}); }
function cleanup() {
  if (started) {
    // Stop only the cluster we initialized, never a machine-wide service.
    run('pg_ctl', ['-D', data, '-m', 'immediate', '-w', 'stop']);
    started = false;
  }
  rmSync(root, {recursive: true, force: true});
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => { cleanup(); process.exit(1); });
}
try {
  run('initdb', ['-D', data, '-U', 'postgres', '-A', 'trust', '--no-locale', '-E', 'UTF8']);
  // Socket directory is unique/private; no TCP listener or remote connection path.
  const config = `\nlisten_addresses = ''\nunix_socket_directories = '${socket.replaceAll("'", "''")}'\nunix_socket_permissions = 0700\nport = 5432\n`;
  writeFileSync(join(data, 'postgresql.conf'), readFileSync(join(data, 'postgresql.conf'), 'utf8') + config);
  run('pg_ctl', ['-D', data, '-l', join(root, 'postgres.log'), '-w', '-t', '30', 'start']);
  started = true;
  const actual = sql("select current_setting('data_directory');").trim();
  if (resolve(actual) !== resolve(data) || sql('select inet_server_addr() is null;').trim() !== 't') {
    throw new Error('Refusing SQL tests: disposable socket-only cluster identity not verified.');
  }
  sql(readFileSync(join(repo, 'tests/support/supabase-compat.sql'), 'utf8'));
  const catalogQuery = readFileSync(join(repo, 'supabase/verification/review-share-catalog.sql'), 'utf8');
  const catalogExpected = JSON.parse(readFileSync(join(repo, 'supabase/verification/review-share-live-20260926.json'), 'utf8'));
  const bridge = readFileSync(join(repo, 'supabase/migrations/20260925035350_lockliel_reconstructed_review_share_history.sql'), 'utf8');
  function verifyReconciliation() {
    const before = JSON.parse(sql(catalogQuery));
    // This compares only two tables and the explicitly listed catalog properties.
    for (const key of Object.keys(catalogExpected)) {
      assert.deepEqual(before[key], catalogExpected[key], `Targeted live catalog differs: ${key}`);
    }
    sql('begin read only;\n' + bridge + '\nrollback;');
    // Reapplying to a completed existing environment must execute no DDL/DML.
    // Event trigger rejects any attempted DDL, even if the end schema is identical.
    sql(`begin;
      create function public.reject_bridge_ddl() returns event_trigger language plpgsql as $body$
      begin raise exception 'Existing-environment bridge attempted DDL'; end; $body$;
      create event trigger reject_bridge_ddl on ddl_command_start execute function public.reject_bridge_ddl();
      ${bridge}
      rollback;`);
    assert.deepEqual(JSON.parse(sql(catalogQuery)), before, 'Bridge changed existing schema');
    // These mutations exist only in rolled-back disposable sessions.
    for (const drift of [
      'alter table public.share_assets drop column share_text cascade;',
      'drop index public.founders50_reviews_application_idx;',
      'alter table public.founders50_reviews disable row level security;',
    ]) {
      assert.throws(() => sql('begin;\n' + drift + '\n' + bridge + '\nrollback;'), /Reconciliation refused/);
    }
    assert.deepEqual(JSON.parse(sql(catalogQuery)), before, 'Drift fixture did not roll back');
    console.log('PASS targeted catalog parity, existing-schema no-DDL replay, and 3 drift rejection cases.');
  }
  function verifyEmailRecovery(pendingMigration) {
    // A legacy value admitted by the broken rule must abort the correction,
    // preserving the old constraint. The entire synthetic scenario is rolled back.
    sql(String.raw`begin;
      do $test$
      declare old_check text; rejected boolean := false;
      begin
        select pg_get_constraintdef(oid) into old_check from pg_constraint
          where conrelid='public.profiles'::regclass and conname='profiles_email_format';
        insert into auth.users(id,email) values(gen_random_uuid(),$email$legacy@domain\xx$email$);
        begin
          execute $pending$${pendingMigration}$pending$;
        exception when check_violation then rejected:=true; end;
        assert rejected, 'Incompatible legacy row did not abort email migration';
        assert (select pg_get_constraintdef(oid)=old_check from pg_constraint
          where conrelid='public.profiles'::regclass and conname='profiles_email_format'),
          'Failed email correction did not restore previous constraint';
      end;
      $test$;
      rollback;`);
    console.log('PASS incompatible legacy email abort and transactional constraint recovery.');
  }
  const migrations = readdirSync(join(repo, 'supabase/migrations')).filter(f => f.endsWith('.sql')).sort();
  for (const file of review275 ? migrations.slice(0, 274) : migrations) {
    if (file === '20260926212002_lockliel_correct_profile_email_pattern.sql') {
      verifyReconciliation();
      verifyEmailRecovery(readFileSync(join(repo, 'supabase/migrations', file), 'utf8'));
    }
    try { sql('begin;\n' + readFileSync(join(repo, 'supabase/migrations', file), 'utf8') + '\ncommit;'); }
    catch (error) { throw new Error(`Migration replay failed at ${file}: ${error.message}`); }

  }
  if (review275) {
    const reviewDir = join(repo, 'tests/fixtures/course-275-review');
    sql('begin;\n' + readFileSync(join(reviewDir, 'old-upsert.sql'), 'utf8') + '\nrollback;');
    console.log('PASS original schema-274 upsert ACL defect reproduced; plain INSERT succeeds.');
    const migration = migrations[274];
    assert.equal(migration, '20260929215159_lockliel_course_engine_standard.sql');
    for (const profile of ['disposable', 'hosted']) {
      // Test-only default ACL simulation, rolled back with the migration and fixtures.
      // Never changes a real branch or the authoritative migration bytes.
      const defaults = profile === 'hosted' ? `alter default privileges for role postgres in schema public revoke all on tables from service_role;
        alter default privileges for role postgres in schema public grant truncate,references,trigger,maintain on tables to service_role;` : '';
      sql('begin;\n' + defaults + '\n' + readFileSync(join(repo, 'supabase/migrations', migration), 'utf8') + '\n' + readFileSync(join(reviewDir, 'notes.sql'), 'utf8') + '\nrollback;');
      console.log(`PASS exact275 ${profile} defaults: inherited-service defect reproduced; controlled notes path works with zero service grants (test-only revocation).`);
    }
    console.log('Passed focused 274/275 review; no CLI release rehearsal or later migrations.');
  } else {
  console.log(`Replayed ${migrations.length} authoritative migrations without historical supplements in disposable PostgreSQL 17 (TCP disabled).`);
  const tests = readdirSync(join(repo, 'supabase/tests')).filter(f => f.endsWith('.sql')).sort();
  for (const file of tests) {
    try { sql('begin;\n' + readFileSync(join(repo, 'supabase/tests', file), 'utf8') + '\nrollback;'); }
    catch (error) { throw new Error(`SQL test failed at ${file}: ${error.message}`); }
    console.log(`PASS ${file} (rolled back)`);
  }
  console.log(`Passed ${tests.length} SQL test files.`);
  }
} finally { cleanup(); }
