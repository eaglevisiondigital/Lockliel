// Creates its own cluster. Never connects to a caller-supplied database or service.
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (process.argv.length !== 2) throw new Error('SQL tests accept no connection arguments.');
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
  const migrations = readdirSync(join(repo, 'supabase/migrations')).filter(f => f.endsWith('.sql')).sort();
  for (const file of migrations) {
    if (file === '20260925131440_lockliel_harden_product_and_share_identity.sql') {
      console.log('REPLAY GAP: loading explicit test-only share_assets column reconstruction.');
      sql(readFileSync(join(repo, 'tests/support/legacy-share-columns.sql'), 'utf8'));
    }
    if (file === '20260925120958_lockliel_immutable_founders50_review_workflow.sql') {
      console.log('REPLAY GAP: loading explicit test-only founders50_reviews catalog reconstruction.');
      sql(readFileSync(join(repo, 'tests/support/legacy-founders-review.sql'), 'utf8'));
    }
    try { sql('begin;\n' + readFileSync(join(repo, 'supabase/migrations', file), 'utf8') + '\ncommit;'); }
    catch (error) { throw new Error(`Migration replay failed at ${file}: ${error.message}`); }
    if (file === '20260925120958_lockliel_immutable_founders50_review_workflow.sql') {
      sql('create trigger apply_founders50_review_decision_trigger after insert on public.founders50_reviews for each row execute function app_private.apply_founders50_review_decision();');
    }
  }
  console.log(`Replayed ${migrations.length} unchanged migrations in disposable PostgreSQL 17 (TCP disabled).`);
  const tests = readdirSync(join(repo, 'supabase/tests')).filter(f => f.endsWith('.sql')).sort();
  for (const file of tests) {
    try { sql('begin;\n' + readFileSync(join(repo, 'supabase/tests', file), 'utf8') + '\nrollback;'); }
    catch (error) { throw new Error(`SQL test failed at ${file}: ${error.message}`); }
    console.log(`PASS ${file} (rolled back)`);
  }
  console.log(`Passed ${tests.length} SQL test files.`);
} finally { cleanup(); }
