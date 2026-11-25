import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { baseline, expectations, checkMigrationPreflight } from '../scripts/check-migration-preflight.mjs';
import * as currentRelease from '../scripts/prepare-migration-release.mjs';
// Exercise the historical 274-file release package in its own verified source tree.
// The real runner remains fail-closed when this development branch adds migration 275.
const historicalRoot=mkdtempSync(join(tmpdir(),'lockliel-historical-release-'));
for(const folder of ['scripts','supabase/migrations','supabase/verification'])mkdirSync(join(historicalRoot,folder),{recursive:true});
for(const file of Object.keys(currentRelease.manifest))copyFileSync(join(currentRelease.repo,'supabase/migrations',file),join(historicalRoot,'supabase/migrations',file));
for(const file of ['scripts/prepare-migration-release.mjs','supabase/verification/release-migrations.json'])copyFileSync(join(currentRelease.repo,file),join(historicalRoot,file));
const {prepareRelease,verifyPreparedRelease,verifyMigrationBytes,bridgeFile,emailFile,repo}=await import(new URL('file://'+join(historicalRoot,'scripts/prepare-migration-release.mjs')));
after(()=>rmSync(historicalRoot,{recursive:true,force:true}));
test('historical production release runner refuses the new unreviewed development migration',()=>{
 assert.throws(()=>currentRelease.verifyMigrationBytes(),/migration set changed/);
});

const now = Date.parse(baseline['release-preflight'].observed_at_utc);
function checkpoint(stage = 272) {
  const capture = structuredClone(baseline);
  const extra = expectations.ledger.filter(x => stage === 274 || stage === 273 && x.version === bridgeFile.slice(0,14));
  capture['release-ledger'].push(...extra);
  capture['release-ledger'].sort((a,b) => a.version.localeCompare(b.version));
  if (stage === 274) capture['release-preflight'].email_constraint_md5 = expectations.email_constraint_md5;
  return capture;
}

test('release preflight accepts only the reviewed staged ledger states', () => {
  for (const stage of [272,273,274]) {
    assert.equal(checkMigrationPreflight(checkpoint(stage), stage, now).stage, stage);
    assert.throws(() => checkMigrationPreflight(checkpoint(stage), stage === 272 ? 273 : 272, now));
  }
});
test('release preflight rejects stale evidence and unexpected historical ledger edits', () => {
  assert.throws(() => checkMigrationPreflight(checkpoint(), 272, now+300001), /five minutes/);
  assert.throws(() => checkMigrationPreflight(checkpoint(), 272, now-1), /five minutes/);
  const changed = checkpoint(); changed['release-ledger'][0].statements_md5 = 'changed';
  assert.throws(() => checkMigrationPreflight(changed, 272, now), /fingerprints differ/);
});
test('release preflight rejects permission drift and bridge catalog drift', () => {
  for (const key of ['release-security','review-share-catalog']) {
    const changed = checkpoint(); changed[key].unexpected = 'drift';
    assert.throws(() => checkMigrationPreflight(changed, 272, now), /differs/);
  }
});
test('release preflight refuses new data, email failures, row growth and index changes', () => {
  const mutations = [
    x => { x['release-preflight'].current_profiles = 1; },
    x => { x['email-preflight'].profiles.would_fail = 1; },
    x => { x['email-preflight'].normalization_collision_groups = 1; },
    x => { x['release-preflight'].tables[0].total_bytes += 8192; },
    x => { x['release-preflight'].profile_indexes[0].valid = false; },
    x => { x['release-preflight'].email_constraint_md5 = 'different'; },
  ];
  for (const mutate of mutations) { const changed = checkpoint(); mutate(changed); assert.throws(() => checkMigrationPreflight(changed, 272, now)); }
});
test('release preflight refuses lock contention and stale transactions', () => {
  for (const field of ['waiting_locks','idle_in_transaction','old_transactions_over_5s']) {
    const changed = checkpoint(); changed['release-preflight'].lock_snapshot[field] = 1;
    assert.throws(() => checkMigrationPreflight(changed, 272, now));
  }
  const changed = checkpoint(); changed['release-preflight'].lock_snapshot.other_target_locks.push({table:'profiles'});
  assert.throws(() => checkMigrationPreflight(changed, 272, now));
});
test('release packaging copies immutable migrations and refuses existing/repository destinations', () => {
  assert.equal(verifyMigrationBytes().length, 274);
  const parent = mkdtempSync(join(tmpdir(), 'lockliel-release-unit-'));
  try {
    const root = prepareRelease(join(parent, 'package'));
    assert.equal(verifyPreparedRelease(root), true);
    const source = readFileSync(join(repo, 'supabase/migrations', bridgeFile));
    assert.deepEqual(readFileSync(join(root, 'bridge/supabase/migrations', bridgeFile)), source);
    assert.throws(() => readFileSync(join(root, 'bridge/supabase/migrations', emailFile)), /ENOENT/);
    writeFileSync(join(root, 'preserve.txt'), 'existing work');
    assert.throws(() => prepareRelease(root), /EEXIST/);
    assert.equal(readFileSync(join(root, 'preserve.txt'), 'utf8'), 'existing work');
    assert.throws(() => prepareRelease(join(repo, 'release-test-forbidden')), /outside/);
    rmSync(join(root, 'preserve.txt'));
    writeFileSync(join(root, 'bridge/supabase/migrations', bridgeFile), 'tampered');
    assert.throws(() => verifyPreparedRelease(root), /staged bytes changed/);
  } finally { rmSync(parent, {recursive:true, force:true}); }
});

function preparedCase(run) {
  const parent = mkdtempSync(join(tmpdir(), 'lockliel-cache-unit-'));
  try { run(prepareRelease(join(parent, 'package')), parent); }
  finally { rmSync(parent, { recursive: true, force: true }); }
}
function addCache(root, stage) {
  const path = join(root, stage, 'supabase/.temp');
  mkdirSync(path);
  writeFileSync(join(path, 'cli-latest'), 'v2.118.0');
  return path;
}
test('release cache is optional and accepted independently in both stages', () => {
  preparedCase(root => {
    assert.equal(verifyPreparedRelease(root), true);
    addCache(root, 'all');
    assert.equal(verifyPreparedRelease(root), true);
    addCache(root, 'bridge');
    assert.equal(verifyPreparedRelease(root), true);
  });
});
for (const stage of ['all', 'bridge']) {
  const mutations = {
    'extra cache file': (root, cache) => writeFileSync(join(cache, 'project-ref'), 'unexpected'),
    'extra cache directory': (root, cache) => mkdirSync(join(cache, 'nested')),
    'empty cache directory': (root, cache) => rmSync(join(cache, 'cli-latest')),
    'cache path is a directory': (root, cache) => { rmSync(join(cache, 'cli-latest')); mkdirSync(join(cache, 'cli-latest')); },
    'extra hidden config': root => writeFileSync(join(root, stage, 'supabase/.env'), 'unexpected'),
    'extra config directory': root => mkdirSync(join(root, stage, 'supabase/generated')),
    'extra seed': root => writeFileSync(join(root, stage, 'supabase/seed.sql'), 'select 1;'),
    'extra roles': root => writeFileSync(join(root, stage, 'supabase/roles.sql'), 'select 1;'),
    'modified migration': root => writeFileSync(join(root, stage, 'supabase/migrations', bridgeFile), 'tampered'),
    'extra migration': root => writeFileSync(join(root, stage, 'supabase/migrations/unexpected.sql'), 'select 1;'),
    'missing migration': root => rmSync(join(root, stage, 'supabase/migrations', bridgeFile)),
    'modified config': root => writeFileSync(join(root, stage, 'supabase/config.toml'), 'project_id="changed"'),
    'missing config': root => rmSync(join(root, stage, 'supabase/config.toml')),
    'extra stage file': root => writeFileSync(join(root, stage, '.env'), 'unexpected'),
  };
  for (const [name, mutate] of Object.entries(mutations)) {
    test(`release ${stage} cache cannot mask ${name}`, () => preparedCase(root => {
      const cache = addCache(root, stage);
      mutate(root, cache);
      assert.throws(() => verifyPreparedRelease(root));
    }));
  }
  for (const path of ['supabase/.temp/cli-latest', 'supabase/.temp', 'supabase/config.toml', `supabase/migrations/${bridgeFile}`, 'supabase/migrations', 'supabase']) {
    test(`release ${stage} refuses symlink substitution of ${path}`, () => preparedCase((root, parent) => {
      addCache(root, stage);
      const target = join(root, stage, path);
      // Preserve the original bytes/tree so a content-only verifier would accept it.
      const saved = join(parent, 'saved');
      // Rename keeps directory contents intact and avoids following the test symlink.
      renameSync(target, saved);
      symlinkSync(saved, target);
      assert.throws(() => verifyPreparedRelease(root));
    }));
  }
}
for (const [name, mutate] of Object.entries({
  'extra root file': root => writeFileSync(join(root, '.env'), 'unexpected'),
  'extra root directory': root => mkdirSync(join(root, 'generated')),
  'changed manifest': root => writeFileSync(join(root, 'manifest.json'), '{}'),
  'missing manifest': root => rmSync(join(root, 'manifest.json')),
})) {
  test(`release refuses ${name} even with cache present`, () => preparedCase(root => {
    addCache(root, 'all');
    mutate(root);
    assert.throws(() => verifyPreparedRelease(root));
  }));
}
