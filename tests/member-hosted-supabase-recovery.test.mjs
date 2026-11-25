import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('private Supabase recovery boundary passes synthetic-only Python security regressions',()=>{
  const python=process.platform==='darwin'?'/Library/Developer/CommandLineTools/usr/bin/python3':'/usr/bin/python3';
  const script=fileURLToPath(new URL('./member_hosted_supabase_recovery_test.py',import.meta.url));
  const result=spawnSync(python,['-I','-B',script],{encoding:'utf8',timeout:20000,env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'}});
  assert.equal(result.status,0,'Private recovery offline regressions failed.');
  assert.match(result.stderr,/Ran 46 tests/);
  assert.match(result.stderr,/OK/);
});
