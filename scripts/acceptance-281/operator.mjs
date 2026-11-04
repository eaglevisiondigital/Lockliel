// Separate 281 offline composition; never activates the protected 280 operator.
import {createHash} from 'node:crypto';
import {initializeSyntheticJournal,openSyntheticJournal} from '../../lib/durable-281/journal.mjs';
import {createSyntheticAcceptancePlan} from '../../lib/acceptance-281/synthetic-plan.mjs';
import {getOfflineReadinessEvidence} from './provider-readiness-adapter.mjs';
import {assertOfflineCleanupCustody,readOfflineSignedEvidence} from './record-cleanup-adapter.mjs';
const need=v=>{if(!v)throw Error('OFFLINE_OPERATOR_DENIED');};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const offlineScopeDigest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function makeOfflineAcceptanceScope({source,runId}) {
  need(/^[a-f0-9]{40}$/.test(source) && /^[a-f0-9]{32}$/.test(runId));
  return Object.freeze({project:'qjksggxorghaxvpyslip',branch:'course-cutover-rehearsal-274',source,runId,participants:Object.freeze({A:'10000000-0000-4000-8000-000000000001',B:'10000000-0000-4000-8000-000000000002'}),maximumRequests:260,maximumRows:70,maximumPending:4});
}
export function createHostedAcceptanceOperator() {return Object.freeze({enabled:false,executionAuthorized:false,reason:'SEPARATE_281_HOSTED_BINDING_AND_OWNER_AUTHORIZATION_REQUIRED'});}
export function createOfflineAcceptanceOperator({directory,binding,grantPublicKey,evidencePublicKey,scope,cleanupCustody,readiness,initialize=false}) {
  need(same(scope,makeOfflineAcceptanceScope(binding)) && binding.project===scope.project && binding.purpose==='myfive-acceptance' && binding.targetDigest===offlineScopeDigest(scope));
  const fixed=structuredClone(binding),journal=(initialize?initializeSyntheticJournal:openSyntheticJournal)({directory,binding:fixed,grantPublicKey,evidencePublicKey});
  const plan=createSyntheticAcceptancePlan();
  let grantValue=null,stopped=false,lastAt=0;
  const tickets=new WeakSet(),commands=new WeakMap();
  function guard(now) {
    need(!stopped && grantValue && Number.isSafeInteger(now) && now>=lastAt && now<grantValue.expiresAt);
    getOfflineReadinessEvidence(readiness,{source:fixed.source,runId:fixed.runId,operator:fixed.operator,now});
    assertOfflineCleanupCustody(cleanupCustody,fixed,now,grantValue.expiresAt);
    need(journal.inspect().state==='ACTIVE');lastAt=now;
  }
  function stop(){stopped=true;plan.interrupt();}
  return Object.freeze({
    begin({grant,before,now}) {
      try {
        need(!grantValue && !stopped);
        getOfflineReadinessEvidence(readiness,{source:fixed.source,runId:fixed.runId,operator:fixed.operator,now});
        const g=readOfflineSignedEvidence(grant,grantPublicKey);
        need(g.maximumRequests<=scope.maximumRequests && g.maximumRows<=scope.maximumRows);
        assertOfflineCleanupCustody(cleanupCustody,fixed,now,g.expiresAt);
        const result=journal.begin({grant,before,now});grantValue=g;lastAt=now;return result;
      }catch{stop();throw Error('OFFLINE_OPERATOR_DENIED');}
    },
    prepare({label,method,path,query='',body=null,now}) {
      try {
        guard(now);
        const result=plan.prepare(label,method,path,query,body);
        // Fsync operation intent before exposing the command for offline dispatch.
        const reserved=journal.reserve({rows:body?.action==='addReachContact'?1:0,now});
        tickets.add(result.ticket);commands.set(result.ticket,{label,...result.command});
        return Object.freeze({...result,sequence:reserved.sequence,executionAuthorized:false});
      }catch{stop();throw Error('OFFLINE_OPERATOR_DENIED');}
    },
    reconcile({ticket,receipt,now}) {
      try {guard(now);need(tickets.has(ticket));tickets.delete(ticket);return plan.reconcile(ticket,receipt);}
      catch{stop();throw Error('OFFLINE_OPERATOR_DENIED');}
    },
    async reconcileResponse({ticket,response,now}) {
      try {
        guard(now);need(tickets.has(ticket) && response instanceof Response && response.status===200 && response.headers.get('content-type')?.includes('application/json'));
        const command=commands.get(ticket),payload=await response.json();let receipt;
        const keys=(value,expected)=>value && Object.keys(value).sort().join()===expected.split(',').sort().join();
        if(command.body?.action==='addReachContact'||command.body?.action==='updateReachContact') {
          need(keys(payload,'ok,reachContact') && payload.ok===true);
          const row=payload.reachContact;
          const allowed=['id','owner_id','display_name','relationship_context','status','linked_profile_id','last_shared_at','last_follow_up_at','next_follow_up_at','private_notes','created_at','updated_at'];
          need(row && Object.keys(row).every(k=>allowed.includes(k)) && row.owner_id===scope.participants[command.label]);
          receipt={ok:true,reachContact:{id:row.id,owner_id:row.owner_id,status:row.status}};
        } else if(command.body?.action==='note') {need(keys(payload,'ok') && payload.ok===true);receipt={ok:true};}
        else if(command.path.endsWith('/connections')) {
          need(keys(payload,'reachContacts,reachPage') && Array.isArray(payload.reachContacts));
          const page=payload.reachPage;
          need(keys(page,'version,pageSize,hasMore,nextCursor,total,scope,completeness') && page.version===1 && Number.isSafeInteger(page.pageSize) && page.pageSize>0 && page.pageSize<=50 && payload.reachContacts.length<=page.pageSize && typeof page.hasMore==='boolean' && (page.hasMore?typeof page.nextCursor==='string':page.nextCursor===null) && page.total===null && page.scope==='filtered-page' && page.completeness==='unverified');
          need(payload.reachContacts.every(r=>r && typeof r.id==='string' && typeof r.display_name==='string' && typeof r.status==='string'));
          receipt={ok:true};
        } else {
          need(keys(payload,'person') && payload.person?.id===new URLSearchParams(command.query).get('id') && typeof payload.person.name==='string' && typeof payload.person.note==='string' && typeof payload.person.version==='string' && Array.isArray(payload.person.timeline));receipt={ok:true};
        }
        tickets.delete(ticket);return plan.reconcile(ticket,receipt);
      }catch{stop();throw Error('OFFLINE_OPERATOR_DENIED');}
    },
    finish({after,now}) {
      try {guard(now);need(plan.evidence().pending===0);const result=journal.finish({after,now});stop();return result;}
      catch{stop();throw Error('OFFLINE_OPERATOR_DENIED');}
    },
    interrupt(){stop();return Object.freeze({retryAllowed:false,consumed:journal.inspect().consumed});},
    inspect(){return Object.freeze({journal:journal.inspect(),plan:plan.evidence(),stopped,hostedEnabled:false,executionAuthorized:false});}
  });
}
