// Prepares verified file copies only. This script never connects to a database.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repo = fileURLToPath(new URL('../', import.meta.url));
export const runnerVersion = '2.118.0';
export const runnerDarwinArm64Sha256 = '8bcf9b109b24094feaf89e35c2d10d01d3dde50cc2a960116bd151537c2908c4';
export const bridgeFile = '20260925035350_lockliel_reconstructed_review_share_history.sql';
export const emailFile = '20260926212002_lockliel_correct_profile_email_pattern.sql';
export const manifest = JSON.parse(readFileSync(join(repo, 'supabase/verification/release-migrations.json'), 'utf8'));
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const config = 'project_id = "lockliel-reviewed-release"\n[db.migrations]\nenabled = true\n[db.seed]\nenabled = false\n';

export function verifyMigrationBytes() {
  const files = readdirSync(join(repo, 'supabase/migrations')).filter(f => f.endsWith('.sql')).sort();
  assert.equal(files.length, 274, 'STOP: migration set changed; obtain a new release review.');
  assert.deepEqual(files, Object.keys(manifest).sort(), 'STOP: migration filenames changed.');
  for (const file of files) {
    assert.equal(sha256(readFileSync(join(repo, 'supabase/migrations', file))), manifest[file], `STOP: migration bytes changed: ${file}`);
  }
  return files;
}

export function prepareRelease(destination) {
  const files = verifyMigrationBytes();
  const root = resolve(destination);
  assert(root !== resolve(repo) && !root.startsWith(resolve(repo) + sep), 'Use a new directory outside the repository.');
  // mkdir without recursive intentionally refuses an existing destination.
  mkdirSync(root, { mode: 0o700 });
  for (const stage of ['all', 'bridge']) {
    const directory = join(root, stage, 'supabase');
    mkdirSync(join(directory, 'migrations'), { recursive: true, mode: 0o700 });
    writeFileSync(join(directory, 'config.toml'), config);
    for (const file of files) {
      if (stage === 'bridge' && file === emailFile) continue;
      const target = join(directory, 'migrations', file);
      copyFileSync(join(repo, 'supabase/migrations', file), target);
      assert.equal(sha256(readFileSync(target)), manifest[file]);
    }
  }
  writeFileSync(join(root, 'manifest.json'), JSON.stringify({ runnerVersion, runnerDarwinArm64Sha256, migrations: manifest }, null, 2) + '\n');
  return root;
}

export function verifyPreparedRelease(root) {
  const files = verifyMigrationBytes();
  const directoryOnly = path => assert(lstatSync(path).isDirectory(), `STOP: expected real directory: ${path}`);
  const fileOnly = path => assert(lstatSync(path).isFile(), `STOP: expected regular file: ${path}`);
  directoryOnly(root);
  assert.deepEqual(readdirSync(root).sort(), ['all', 'bridge', 'manifest.json'], 'STOP: unexpected release package files.');
  fileOnly(join(root, 'manifest.json'));
  assert.equal(readFileSync(join(root, 'manifest.json'), 'utf8'), JSON.stringify({ runnerVersion, runnerDarwinArm64Sha256, migrations: manifest }, null, 2) + '\n', 'STOP: release manifest changed.');
  for (const stage of ['all', 'bridge']) {
    directoryOnly(join(root, stage));
    assert.deepEqual(readdirSync(join(root, stage)), ['supabase'], 'STOP: unexpected stage files.');
    const directory = join(root, stage, 'supabase');
    directoryOnly(directory);
    const expected = files.filter(file => stage !== 'bridge' || file !== emailFile);
    const entries = readdirSync(directory).sort();
    const hasCache = entries.includes('.temp');
    assert.deepEqual(entries, hasCache ? ['.temp', 'config.toml', 'migrations'] : ['config.toml', 'migrations'], 'STOP: unexpected release configuration files.');
    if (hasCache) {
      // CLI update-check metadata only, never migration input. No .temp/** exemption.
      const cache = join(directory, '.temp');
      directoryOnly(cache);
      assert.deepEqual(readdirSync(cache), ['cli-latest'], 'STOP: unexpected CLI cache contents.');
      fileOnly(join(cache, 'cli-latest'));
    }
    fileOnly(join(directory, 'config.toml'));
    assert.equal(readFileSync(join(directory, 'config.toml'), 'utf8'), config);
    directoryOnly(join(directory, 'migrations'));
    assert.deepEqual(readdirSync(join(directory, 'migrations')).sort(), expected, 'STOP: staged migration set differs.');
    for (const file of expected) {
      fileOnly(join(directory, 'migrations', file));
      assert.equal(sha256(readFileSync(join(directory, 'migrations', file))), manifest[file], `STOP: staged bytes changed: ${file}`);
    }
  }
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 3, 'Usage: node scripts/prepare-migration-release.mjs NEW_DIRECTORY_OUTSIDE_REPOSITORY');
  console.log(prepareRelease(process.argv[2]));
}
