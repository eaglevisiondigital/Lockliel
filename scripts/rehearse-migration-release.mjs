// Local only: creates its own password-protected socket-only PostgreSQL 17 cluster.
// No connection arguments, caller database variables, linked project, or live credentials.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { bridgeFile, emailFile, manifest, prepareRelease, repo, runnerDarwinArm64Sha256, runnerVersion, sha256, verifyMigrationBytes } from './prepare-migration-release.mjs';

assert.equal(process.argv.length, 2, 'Rehearsal accepts no connection arguments.');
assert(process.platform === 'darwin' && process.arch === 'arm64', 'This pinned binary rehearsal currently supports macOS arm64 only.');
const binary = process.env.LOCKLIEL_SUPABASE_BIN;
assert(binary && binary.startsWith('/'), 'Set LOCKLIEL_SUPABASE_BIN to the pinned absolute binary path.');
assert.equal(sha256(readFileSync(binary)), runnerDarwinArm64Sha256, 'STOP: runner binary checksum differs.');
// Fail closed unless the caller applied OS-level IP egress denial. This documentation
// address is only a sandbox probe, never a production endpoint.
await new Promise((done, reject) => {
  const socket = createConnection({ host: '192.0.2.1', port: 443 });
  socket.setTimeout(1000, () => { socket.destroy(); reject(new Error('OS egress denial is required.')); });
  socket.on('connect', () => { socket.destroy(); reject(new Error('OS egress denial is required.')); });
  socket.on('error', error => ['EPERM', 'EACCES'].includes(error.code) ? done() : reject(new Error('OS egress denial was not verified.')));
});
const root = mkdtempSync(join(tmpdir(), 'lockliel-release-'));
const data = join(root, 'data');
const socket = join(root, 'socket');
mkdirSync(socket, { mode: 0o700 });
const password = randomBytes(24).toString('hex');
writeFileSync(join(root, 'password'), password, { mode: 0o600 });
writeFileSync(join(root, 'empty-pgpass'), '', { mode: 0o600 });
const env = {
  PATH: process.env.PATH, LANG: 'C', LC_ALL: 'C',
  SUPABASE_TELEMETRY_DISABLED: '1', DO_NOT_TRACK: '1',
  PGPASSWORD: password, PGPASSFILE: join(root, 'empty-pgpass'),
};
let started = false;
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { env, cwd: root, encoding: 'utf8', timeout: 120000, ...options });
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${(result.error?.message || result.stderr || result.stdout).slice(-3500)}`);
  return result.stdout;
}
const pgArgs = db => ['-X', '-h', socket, '-p', '5432', '-U', 'postgres', '-d', db, '-v', 'ON_ERROR_STOP=1', '-qAt'];
const sql = (source, db = 'postgres') => run('psql', pgArgs(db), { input: source }).trim();
const quote = value => "'" + value.replaceAll("'", "''") + "'";
function cleanup() {
  if (started) {
    run('pg_ctl', ['-D', data, '-m', 'immediate', '-w', 'stop']);
    started = false;
  }
  rmSync(root, { recursive: true, force: true });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { cleanup(); process.exit(1); });
const ledger = db => JSON.parse(sql("select jsonb_agg(jsonb_build_object('version',version,'name',name,'statements',statements) order by version) from supabase_migrations.schema_migrations;", db));
const email = db => sql("select pg_get_constraintdef(oid) from pg_constraint where conrelid='public.profiles'::regclass and conname='profiles_email_format';", db);
const catalogQuery = readFileSync(join(repo, 'supabase/verification/review-share-catalog.sql'), 'utf8');
const catalog = db => JSON.parse(sql(catalogQuery, db));
const constraints = db => JSON.parse(sql("select jsonb_agg(jsonb_build_object('name',conname,'definition',pg_get_constraintdef(oid),'validated',convalidated) order by conname) from pg_constraint where conrelid='public.profiles'::regclass;", db));
const indexes = db => sql("select jsonb_agg(jsonb_build_object('name',indexname,'def',indexdef) order by indexname) from pg_indexes where schemaname='public' and tablename='profiles';", db);
const security = db => sql(`select jsonb_build_object(
  'functions',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),'def',pg_get_functiondef(p.oid),'acl',p.proacl::text) order by n.nspname,p.proname,pg_get_function_identity_arguments(p.oid)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','app_private') and p.prokind in ('f','p')),
  'policies',(select jsonb_agg(to_jsonb(p) order by schemaname,tablename,policyname) from pg_policies p where schemaname='public'),
  'tables',(select jsonb_agg(jsonb_build_object('name',c.relname,'rls',c.relrowsecurity,'force',c.relforcerowsecurity,'acl',c.relacl::text) order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
  'triggers',(select jsonb_agg(jsonb_build_object('table',c.relname,'name',t.tgname,'def',pg_get_triggerdef(t.oid),'enabled',t.tgenabled) order by c.relname,t.tgname) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth') and not t.tgisinternal)
);`, db);
const applicationData = db => {
  const tables = JSON.parse(sql("select jsonb_agg(c.relname order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r';", db));
  const parts = tables.map(name => `${quote(name)},(select md5(coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text)::text,'[]')) from public."${name.replaceAll('"','""')}" t)`);
  // Split to stay below PostgreSQL's 100-argument function limit.
  return sql('select ' + [parts.slice(0,40), parts.slice(40)].filter(x => x.length).map(x => 'jsonb_build_object('+x.join(',')+')').join(' || ') + ';', db);
};
const preflight = db => JSON.parse(sql(readFileSync(join(repo, 'supabase/verification/email-preflight.sql'), 'utf8'), db));
function testSql(stage, db = 'postgres') {
  const files = ['account_deletion_execution.sql','account_deletion_readiness.sql','authorization_boundaries.sql','deletion_preflight_access.sql','email_constraint_compatibility.sql','integrity_staff_execution.sql','reconciled_review_share.sql'];
  for (const file of files) sql('begin;\n' + readFileSync(join(repo, 'supabase/tests', file), 'utf8') + '\nrollback;', db);
  console.log(`PASS ${stage}: all 7 SQL files (rolled back).`);
}
function cli(stage, db, { dryRun = false, includeAll = true, readonly = dryRun } = {}) {
  const options = '-c lock_timeout=5s -c statement_timeout=30s -c search_path=public,extensions -c lockliel.release_probe=on' + (readonly ? ' -c default_transaction_read_only=on' : '');
  const uri = `postgresql://postgres@localhost:5432/${db}?host=${encodeURIComponent(socket)}&sslmode=disable&options=${encodeURIComponent(options)}`;
  const args = ['db', 'push', '--workdir', stage, '--db-url', uri, '--skip-vault', '--yes', '--output-format', 'json'];
  if (includeAll) args.push('--include-all');
  if (dryRun) args.push('--dry-run');
  return spawnSync(binary, args, { env, cwd: root, encoding: 'utf8', timeout: 60000 });
}
function successful(result) {
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, (result.stderr + result.stdout).slice(-3500));
  const output = JSON.parse(result.stdout.trim());
  return output.data ?? output;
}
const failure = (result, pattern) => {
  assert.notEqual(result.status, 0, 'Runner unexpectedly succeeded.');
  const output = result.stderr + result.stdout;
  if (!pattern.test(output)) throw new Error(`Expected ${pattern}; runner response: ${output.slice(0,900)}`);
};
function assertUnchanged(db, before) {
  assert.deepEqual(ledger(db), before.ledger);
  assert.equal(email(db), before.email);
  assert.equal(sql("select count(*) from rehearsal.observed;", db), before.observations);
}
const state = db => ({ ledger: ledger(db), email: email(db), observations: sql('select count(*) from rehearsal.observed;', db) });
const mode = (db, value) => sql(`update rehearsal.control set mode=${quote(value)};`, db);
function clone(name, template) { sql(`create database ${name} template ${template};`); return name; }

try {
  assert.match(run('initdb', ['--version']), /PostgreSQL\) 17\./);
  assert.equal(run(binary, ['--version']).trim(), runnerVersion);
  run('initdb', ['-D', data, '-U', 'postgres', '-A', 'scram-sha-256', '--pwfile', join(root, 'password'), '--no-locale', '-E', 'UTF8']);
  writeFileSync(join(data, 'postgresql.conf'), readFileSync(join(data, 'postgresql.conf'), 'utf8') + `\nlisten_addresses = ''\nunix_socket_directories = '${socket.replaceAll("'", "''")}'\nunix_socket_permissions = 0700\nport = 5432\n`);
  run('pg_ctl', ['-D', data, '-l', join(root, 'postgres.log'), '-w', '-t', '30', 'start']);
  started = true;
  assert.equal(resolve(sql("select current_setting('data_directory');")), resolve(data));
  assert.equal(sql('select inet_server_addr() is null;'), 't');
  sql(readFileSync(join(repo, 'tests/support/supabase-compat.sql'), 'utf8'));
  sql('create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[]);');
  const files = verifyMigrationBytes();
  for (const file of files) {
    if (file === emailFile) continue;
    let source = readFileSync(join(repo, 'supabase/migrations', file), 'utf8');
    if (file.startsWith('20260925153612_')) {
      // Explicit test-only reconstruction of the inspected live ledger semantics.
      // Never rewrite the immutable historical repository file.
      source = source.replace(String.raw`\\.`, String.raw`\.`);
    }
    const record = file === bridgeFile ? '' : `insert into supabase_migrations.schema_migrations values(${quote(file.slice(0,14))},${quote(file.slice(15,-4))},array[${quote(source)}]);`;
    // The bridge's fresh path reconstructs already-existing uncaptured live DDL;
    // it is NOT entered in this baseline ledger.
    sql('begin;\n' + source + '\n' + record + '\ncommit;');
  }
  assert.equal(ledger('postgres').length, 272);
  assert.deepEqual(ledger('postgres').map(x => x.version), files.filter(f => ![bridgeFile,emailFile].includes(f)).map(f => f.slice(0,14)));
  assert.deepEqual(catalog('postgres'), JSON.parse(readFileSync(join(repo, 'supabase/verification/review-share-live-20260926.json'), 'utf8')));
  assert.equal(sql("select md5(pg_get_constraintdef(oid)) from pg_constraint where conrelid='public.profiles'::regclass and conname='profiles_email_format';"), '94e6b49228249e4f9e0c3b0a9e36c4d0');
  testSql('272 baseline');
  const release = prepareRelease(join(root, 'release'));
  const allStage = join(release, 'all');
  const bridgeStage = join(release, 'bridge');
  const originalLedger = ledger('postgres');
  const discovery = successful(cli(allStage, 'postgres', { dryRun: true }));
  assert.deepEqual(discovery.migrations, [bridgeFile, emailFile]);
  assert.deepEqual(discovery.seeds, []);
  assert.deepEqual(discovery.roles, []);
  assert.deepEqual(ledger('postgres'), originalLedger);
  failure(cli(allStage, 'postgres', { dryRun: true, includeAll: false }), /inserted before|include-all/);
  console.log('PASS read-only discovery: exactly bridge then email; default chronological mode refuses the older gap.');
  sql(`create schema rehearsal;
    create table rehearsal.control(mode text); insert into rehearsal.control values('bridge');
    create table rehearsal.observed(version text,lock_timeout text,statement_timeout text,application_name text);
    create function rehearsal.ledger_probe() returns trigger language plpgsql as $b$
    declare test_mode text;
    begin
      assert current_setting('lock_timeout')='5s', 'lock_timeout not propagated';
      assert current_setting('statement_timeout')='30s', 'statement_timeout not propagated';
      assert new.version in ('20260925035350','20260926212002'), 'Previously applied migration rerun';
      insert into rehearsal.observed values(new.version,current_setting('lock_timeout'),current_setting('statement_timeout'),current_setting('application_name'));
      select mode into test_mode from rehearsal.control;
      if test_mode='ledger_failure' then raise exception 'Injected ledger failure after migration SQL'; end if;
      if test_mode='statement_timeout' then perform pg_sleep(31); end if;
      if test_mode='connection_loss' then perform pg_terminate_backend(pg_backend_pid()); end if;
      return new;
    end; $b$;
    create trigger rehearsal_ledger_probe before insert on supabase_migrations.schema_migrations for each row execute function rehearsal.ledger_probe();
    create function rehearsal.reject_bridge_ddl() returns event_trigger language plpgsql as $b$
    begin if (select mode='bridge' from rehearsal.control) then raise exception 'Bridge attempted DDL'; end if; end; $b$;
    create event trigger rehearsal_reject_bridge_ddl on ddl_command_start execute function rehearsal.reject_bridge_ddl();
  `);
  // The DML probe is active only for the actual CLI connection, not SQL fixtures.
  mode('postgres', 'setup');
  sql(`create function rehearsal.reject_application_write() returns trigger language plpgsql as $b$
    begin if current_setting('lockliel.release_probe',true)='on' then raise exception 'Release attempted application DML'; end if; return coalesce(new,old); end; $b$;`);
  // Do not attach instrumentation to review/share: their exact catalog is the
  // bridge's safety contract. Their unchanged catalog/data are checked separately.
  for (const table of ['profiles','founders50_applications','audit_events']) {
    sql(`create trigger rehearsal_reject_write before insert or update or delete on public.${table} for each row execute function rehearsal.reject_application_write();`);
  }
  mode('postgres', 'setup');
  const baseline = clone('checkpoint272', 'postgres');
  const bridgeFailure = clone('bridge_failure', baseline);
  const beforeBridgeFailure = state(bridgeFailure);
  mode(bridgeFailure, 'ledger_failure');
  failure(cli(bridgeStage, bridgeFailure), /Injected ledger failure/);
  assertUnchanged(bridgeFailure, beforeBridgeFailure);
  assert.deepEqual(catalog(bridgeFailure), catalog(baseline));
  console.log('PASS bridge ledger failure rolls back bookkeeping/probe writes, stays at 272.');
  const drift = clone('bridge_drift', baseline);
  sql('drop index public.founders50_reviews_application_idx;', drift);
  const beforeDrift = state(drift);
  failure(cli(bridgeStage, drift), /Reconciliation refused/);
  assertUnchanged(drift, beforeDrift);
  console.log('PASS bridge catalog drift refuses release and leaves no ledger entry.');
  mode('postgres', 'bridge');
  const beforeCatalog = catalog('postgres');
  const beforeSecurity = security('postgres');
  const beforeEmail = email('postgres');
  const beforeApplicationData = applicationData('postgres');
  const bridgeResult = successful(cli(bridgeStage, 'postgres'));
  assert.deepEqual(bridgeResult.migrations, [bridgeFile]);
  assert.equal(ledger('postgres').length, 273);
  assert.equal(ledger('postgres').find(x => x.version === bridgeFile.slice(0,14)).name, bridgeFile.slice(15,-4));
  assert.deepEqual(ledger('postgres').filter(x => x.version !== bridgeFile.slice(0,14)), originalLedger);
  assert.deepEqual(catalog('postgres'), beforeCatalog);
  assert.equal(email('postgres'), beforeEmail);
  assert.equal(security('postgres'), beforeSecurity);
  assert.equal(applicationData('postgres'), beforeApplicationData);
  console.log('PASS actual CLI bridge checkpoint: 273; no DDL/DML, schema and original ledger unchanged.');
  mode('postgres', 'checks');
  testSql('273 checkpoint');
  mode('postgres', 'setup');
  const checkpoint = clone('checkpoint273', 'postgres');
  for (const failureMode of ['ledger_failure','statement_timeout','connection_loss']) {
    const db = clone('email_' + failureMode, checkpoint);
    mode(db, failureMode);
    const before = state(db);
    const startedAt = Date.now();
    const result = cli(allStage, db);
    failure(result, failureMode === 'ledger_failure' ? /Injected ledger failure/ : failureMode === 'statement_timeout' ? /statement timeout/ : /terminat|connection|closed/i);
    assertUnchanged(db, before);
    console.log(`PASS ${failureMode}: email ALTER and ledger roll back; remains 273 (${Date.now()-startedAt} ms).`);
  }
  const incompatible = clone('email_incompatible', checkpoint);
  sql(readFileSync(join(repo,'supabase/migrations/20260925153612_lockliel_enforce_profile_email_identity.sql'),'utf8'), incompatible);
  sql(String.raw`insert into auth.users(id,email) values(gen_random_uuid(),$email$legacy@domain\xx$email$);`, incompatible);
  assert.equal(preflight(incompatible).profiles.would_fail, 1);
  const incompatibleBefore = state(incompatible);
  failure(cli(allStage, incompatible), /violated by some row|check constraint/);
  assertUnchanged(incompatible, incompatibleBefore);
  console.log('PASS deliberately incompatible legacy fixture aborts validation without schema/ledger partial state.');
  const contended = clone('email_contended', checkpoint);
  const contendedBefore = state(contended);
  const holder = spawn('psql', pgArgs(contended), { env, stdio: ['pipe','pipe','pipe'] });
  holder.stdin.write("begin;\nlock table public.profiles in access share mode;\nselect 'HELD';\n");
  await new Promise((done,reject) => {
    let output = '';
    holder.stdout.on('data', chunk => { output += chunk; if (output.includes('HELD')) done(); });
    holder.on('error', reject);
    holder.on('exit', code => { if (code !== 0) reject(new Error('Local lock holder failed.')); });
  });
  try {
    const startedAt = Date.now();
    failure(cli(allStage, contended), /lock timeout/);
    assertUnchanged(contended, contendedBefore);
    console.log(`PASS lock_timeout=5s: no partial email ALTER/history (${Date.now()-startedAt} ms).`);
  } finally {
    holder.stdin.end('rollback;\n');
    await new Promise(done => holder.exitCode === null ? holder.once('exit', done) : done());
  }
  assert.equal(preflight('postgres').profiles.would_fail, 0);
  assert.equal(preflight('postgres').normalization_collision_groups, 0);
  assert.equal(preflight('postgres').auth.normalized_would_fail, 0);
  mode('postgres', 'email');
  assert.deepEqual(successful(cli(allStage, 'postgres', { dryRun: true })).migrations, [emailFile]);
  const beforeConstraints = constraints('postgres');
  const beforeIndexes = indexes('postgres');
  const beforeHeap = sql("select pg_relation_filenode('public.profiles'::regclass);");
  const emailResult = successful(cli(allStage, 'postgres'));
  assert.deepEqual(emailResult.migrations, [emailFile]);
  assert.equal(ledger('postgres').length, 274);
  assert.equal(ledger('postgres').find(x => x.version === emailFile.slice(0,14)).name, emailFile.slice(15,-4));
  assert.deepEqual(ledger('postgres').filter(x => ![bridgeFile.slice(0,14),emailFile.slice(0,14)].includes(x.version)), originalLedger);
  assert(email('postgres').includes('[.]'));
  assert.deepEqual(constraints('postgres').filter(x => x.name !== 'profiles_email_format'), beforeConstraints.filter(x => x.name !== 'profiles_email_format'));
  assert.equal(indexes('postgres'), beforeIndexes);
  assert.equal(sql("select pg_relation_filenode('public.profiles'::regclass);"), beforeHeap);
  assert.deepEqual(catalog('postgres'), beforeCatalog);
  assert.equal(security('postgres'), beforeSecurity);
  assert.equal(applicationData('postgres'), beforeApplicationData);
  testSql('274 checkpoint');
  const finalPlan = successful(cli(allStage, 'postgres', { dryRun: true }));
  assert.deepEqual(finalPlan.migrations, []);
  console.log('PASS actual CLI email checkpoint: 274; canonical CHECK, unique index, other constraints and security unchanged; no pending migrations.');
  console.log('TIMEOUT OBSERVATIONS ' + sql('select jsonb_agg(to_jsonb(o) order by version) from rehearsal.observed o;'));
  console.log('RELEASE EXPECTATIONS ' + sql("select jsonb_build_object('email_constraint_md5',(select md5(pg_get_constraintdef(oid)) from pg_constraint where conrelid='public.profiles'::regclass and conname='profiles_email_format'),'ledger',(select jsonb_agg(jsonb_build_object('version',version,'name',name,'statements_md5',md5(array_to_string(statements,E'\\n'))) order by version) from supabase_migrations.schema_migrations where version in ('20260925035350','20260926212002')));"));
  console.log('PASS ambiguous-outcome procedure: inspect ledger/catalog/health, determine commit state, never blindly retry. Pre-commit connection termination was tested; post-commit lost acknowledgment is an operational decision tree.');
  verifyMigrationBytes();
  assert.equal(Object.keys(manifest).length, 274);
  console.log('PASS Supabase CLI ' + runnerVersion + ': 272 -> 273 -> 274, eight failure/discovery protections and 21 rolled-back SQL fixture executions; no production connection.');
} finally { cleanup(); }
