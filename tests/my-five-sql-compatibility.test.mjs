import test from 'node:test';
import assert from 'node:assert/strict';
import {parseReachPage,reachPageQuery,finishReachPage} from '../netlify/lib/my-five-pagination.mjs';
const owner='10000000-0000-4000-8000-000000000001';
const row=(n,extra={})=>({id:`20000000-0000-4000-8000-${String(n).padStart(12,'0')}`,owner_id:owner,display_name:'Synthetic',status:'praying',created_at:'2026-11-04T12:00:00.000001+00:00',...extra});
const page=()=>parseReachPage(new URLSearchParams(),owner);
for(const [field,max] of [['display_name',120],['relationship_context',500],['private_notes',3000]]){
 test(`database character limit accepted for supplementary Unicode ${field}`,()=>assert.equal(finishReachPage([row(1,{[field]:'😀'.repeat(max)})],page()).contacts[0][field],'😀'.repeat(max)));
 test(`database character limit still rejects overflow ${field}`,()=>assert.throws(()=>finishReachPage([row(1,{[field]:'😀'.repeat(max+1)})],page())));
}
test('timestamp offsets and microsecond cursor values survive actual URL serialization',()=>{
 const p=parseReachPage(new URLSearchParams({reachLimit:'1'}),owner);
 const cursor=finishReachPage([row(2,{created_at:'2026-11-04T06:00:00.000002-06:00'}),row(1)],p).page.nextCursor;
 const next=parseReachPage(new URLSearchParams({reachLimit:'1',reachCursor:cursor}),owner);
 const raw=reachPageQuery(next),q=new URLSearchParams(raw);
 assert.equal(q.get('or'),'(created_at.lt.2026-11-04T06:00:00.000002-06:00,and(created_at.eq.2026-11-04T06:00:00.000002-06:00,id.lt.20000000-0000-4000-8000-000000000002))');
 assert.doesNotThrow(()=>finishReachPage([row(1)],next));
 assert.equal(q.get('owner_id'),'eq.'+owner);
});
test('search apostrophe, Unicode and space survive encoding without extra predicates',()=>{
 const p=parseReachPage(new URLSearchParams({reachSearch:"O'Connor Élodie"}),owner);
 const q=new URLSearchParams(reachPageQuery(p));
 assert.equal(q.get('display_name'),"ilike.*O'Connor Élodie*");assert.equal(q.getAll('owner_id').length,1);assert.equal(q.get('owner_id'),'eq.'+owner);assert.equal(q.get('or'),null);
});
test('short provider response cannot certify complete filtered count',()=>{
 const p=parseReachPage(new URLSearchParams({reachLimit:'50'}),owner);
 assert.equal(new URLSearchParams(reachPageQuery(p)).get('limit'),'51');
 const result=finishReachPage([row(1)],p);
 assert.equal(result.page.hasMore,false);assert.equal(result.page.nextCursor,null);
 assert.equal(result.page.total,null);assert.equal(result.page.completeness,'unverified');
});
