import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const candidate='20261104142104_lockliel_expand_my_five_relationship_capacity.sql';
test('canonical SQL body is exact validated proposal, old 280 byte-identical',()=>{
 const read=p=>readFileSync(p,'utf8');
 const body=s=>s.slice(s.indexOf('create or replace'));
 assert.equal(body(read('supabase/migrations/'+candidate)),body(read('docs/myfive-backend/proposed-cap-correction.sql')));
 const files=readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();assert.equal(files.length,281);assert.equal(files[280],candidate);
 for(const file of files.slice(0,280))assert.equal(read('supabase/migrations/'+file),execFileSync('git',['show','ecc5e6a:supabase/migrations/'+file],{encoding:'utf8'}));
});
test('280 baseline test remains exact and fresh281 permits sixth',()=>{
 assert.equal(readFileSync('docs/myfive-release-sql/baseline-member-journey-core.sql','utf8'),execFileSync('git',['show','ecc5e6a:supabase/tests/member_journey_core.sql'],{encoding:'utf8'}));
 assert.match(readFileSync('supabase/tests/member_journey_core.sql','utf8'),/count\(\*\)=6/);
});
