// Offline verifier for read-only psql JSON captures. Never opens a database.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bridgeFile, emailFile, repo, verifyMigrationBytes } from './prepare-migration-release.mjs';

export const baseline = JSON.parse(readFileSync(join(repo, 'supabase/verification/release-live-baseline-20260927.json'), 'utf8'));
export const expectations = JSON.parse(readFileSync(join(repo, 'supabase/verification/release-runner-expectations.json'), 'utf8'));
export const captureNames = ['release-ledger','release-security','release-preflight','email-preflight','review-share-catalog'];

export function checkMigrationPreflight(capture, stage, now = Date.now()) {
  assert([272,273,274].includes(stage), 'STOP: unsupported release checkpoint.');
  const ledger = capture['release-ledger'];
  const p = capture['release-preflight'];
  const email = capture['email-preflight'];
  const observed = Date.parse(p.observed_at_utc);
  assert(Number.isFinite(observed) && now >= observed && now-observed <= 300000, 'STOP: capture must be refreshed within five minutes.');
  const additions = expectations.ledger.filter(x => stage === 274 || (stage === 273 && x.version === bridgeFile.slice(0,14)));
  const expectedLedger = [...baseline['release-ledger'], ...additions].sort((a,b) => a.version.localeCompare(b.version));
  assert.deepEqual(ledger, expectedLedger, 'STOP: migration versions, names or stored statement fingerprints differ.');
  assert.deepEqual(capture['review-share-catalog'], baseline['review-share-catalog'], 'STOP: bridge catalog differs.');
  assert.deepEqual(capture['release-security'], baseline['release-security'], 'STOP: RLS/policy/function/trigger/ACL fingerprint differs.');
  assert.equal(p.ledger_columns_ready, true, 'STOP: ledger structure is not provisioned.');
  assert.equal(p.standard_conforming_strings, 'on');
  assert.equal(p.server_version, baseline['release-preflight'].server_version, 'STOP: database version changed; refresh review.');
  assert.equal(p.profile_fk_dependents, baseline['release-preflight'].profile_fk_dependents);
  assert.deepEqual(p.event_triggers, baseline['release-preflight'].event_triggers);
  assert.equal(p.email_constraint_md5, stage === 274 ? expectations.email_constraint_md5 : baseline['release-preflight'].email_constraint_md5, 'STOP: unexpected email definition.');
  assert.equal(p.current_profiles, 0, 'STOP: renewed review required for a populated profiles table.');
  assert.equal(p.current_auth_users, 0, 'STOP: Auth population changed; refresh the release assessment.');
  for (const value of Object.values(email.profiles)) assert.equal(value, 0, 'STOP: profile email data changed.');
  assert.equal(email.normalization_collision_groups, 0);
  assert.equal(email.auth.total, 0);
  assert.equal(email.auth.normalized_would_fail, 0);
  for (const field of ['orphan_profiles','auth_without_profile','invalid_related_indexes','unvalidated_related_constraints','share_duplicate_slug_groups','share_duplicate_translation_groups']) assert.equal(p[field], 0, `STOP: ${field}`);
  for (const group of ['share_integrity','review_integrity','auth_integrity']) {
    for (const value of Object.values(p[group])) assert.equal(value, 0, `STOP: ${group}`);
  }
  assert.deepEqual(p.counts, baseline['release-preflight'].counts, 'STOP: target population changed.');
  assert.deepEqual(p.share_status_counts, baseline['release-preflight'].share_status_counts);
  assert.deepEqual(p.profile_indexes, baseline['release-preflight'].profile_indexes, 'STOP: profile index changed.');
  const otherConstraints = rows => rows.filter(x => x.name !== 'profiles_email_format');
  assert.deepEqual(otherConstraints(p.constraints), otherConstraints(baseline['release-preflight'].constraints), 'STOP: unrelated profile constraint changed.');
  assert.equal(p.constraints.find(x => x.name === 'profiles_email_format')?.validated, true);
  assert.equal(p.constraints.filter(x => x.name === 'profiles_email_format').length, 1);
  assert.equal(p.lock_snapshot.waiting_locks, 0, 'STOP: lock waiters present.');
  assert.deepEqual(p.lock_snapshot.other_target_locks, [], 'STOP: target relations are in use.');
  assert.equal(p.lock_snapshot.idle_in_transaction, 0);
  assert.equal(p.lock_snapshot.old_transactions_over_5s, 0);
  assert.equal(p.tables.length, baseline['release-preflight'].tables.length);
  for (const table of p.tables) {
    const expected = baseline['release-preflight'].tables.find(x => x.schema === table.schema && x.table === table.table);
    assert(expected && table.heap_bytes <= expected.heap_bytes && table.total_bytes <= expected.total_bytes, 'STOP: unreviewed target relation growth.');
    assert.equal(table.rls, true);
  }
  return { stage, pending: stage === 272 ? [bridgeFile,emailFile] : stage === 273 ? [emailFile] : [], result: 'PASS database snapshot only; manual health/recovery/MFA/authorization gates still required.' };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 4, 'Usage: node scripts/check-migration-preflight.mjs CAPTURE_DIRECTORY 272|273|274');
  verifyMigrationBytes();
  const captures = Object.fromEntries(captureNames.map(name => [name, JSON.parse(readFileSync(join(process.argv[2], name+'.json'), 'utf8'))]));
  console.log(JSON.stringify(checkMigrationPreflight(captures, Number(process.argv[3])), null, 2));
}
