import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('manual handoff preserves pinned safeguards and one shared durable allowance offline',()=>{
  const python=process.platform==='darwin'?'/Library/Developer/CommandLineTools/usr/bin/python3':'/usr/bin/python3';
  const script=fileURLToPath(new URL('./member_hosted_manual_handoff_test.py',import.meta.url));
  const result=spawnSync(python,['-I','-B','-S',script],{encoding:'utf8',timeout:30000,env:{PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C'}});
  assert.equal(result.status,0,'Offline manual handoff security regressions failed.');
  assert.match(result.stderr,/Ran \d+ tests/);
  assert.match(result.stderr,/OK/);
});
