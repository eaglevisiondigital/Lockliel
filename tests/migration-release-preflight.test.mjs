import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { baseline, expectations, checkMigrationPreflight } from '../scripts/check-migration-preflight.mjs';
import { prepareRelease, verifyPreparedRelease, verifyMigrationBytes, bridgeFile, emailFile, repo } from '../scripts/prepare-migration-release.mjs';

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
    writeFileSync(join(root, 'bridge/supabase/migrations', bridgeFile), 'tampered');
    assert.throws(() => verifyPreparedRelease(root), /staged bytes changed/);
  } finally { rmSync(parent, {recursive:true, force:true}); }
});
