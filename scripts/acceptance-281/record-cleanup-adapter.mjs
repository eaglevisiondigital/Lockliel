// Offline binding only. No provider transport, callbacks, SQL or credentials.
import {createHash, verify} from 'node:crypto';
import {initializeSyntheticJournal, openSyntheticJournal} from '../../lib/durable-281/journal.mjs';
import {createSyntheticRecordCleanupExecutor} from '../../lib/acceptance-281/cleanup-executor.mjs';
import {prepareSyntheticRecordContainment, verifySyntheticRecordContainment} from '../../lib/acceptance-281/record-containment.mjs';
const custody = new WeakMap();
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const need = value => { if (!value) throw Error('OFFLINE_CLEANUP_DENIED'); };
const exact = (v, keys) => v && Object.keys(v).sort().join() === keys.split(',').sort().join();
export function readOfflineSignedEvidence(envelope, key) {
  try {
    need(exact(envelope,'payload,signature') && typeof envelope.payload === 'string' && Buffer.byteLength(envelope.payload) <= 65536 && typeof envelope.signature === 'string');
    need(verify(null, Buffer.from(envelope.payload), key, Buffer.from(envelope.signature,'base64')));
    return JSON.parse(envelope.payload);
  } catch { throw Error('OFFLINE_CLEANUP_DENIED'); }
}
export function createOfflineCleanupCustody({envelope,publicKey,binding,now}) {
  const value=readOfflineSignedEvidence(envelope,publicKey);
  need(exact(value,'synthetic,kind,binding,observedAt,expiresAt') && value.synthetic===true && value.kind==='cleanup-custody' && same(value.binding,binding));
  need(binding.project==='qjksggxorghaxvpyslip' && binding.purpose==='myfive-acceptance');
  need(Number.isSafeInteger(now) && Number.isSafeInteger(value.observedAt) && value.observedAt>=0 && value.observedAt<=now && now-value.observedAt<=300000 && Number.isSafeInteger(value.expiresAt) && value.expiresAt>now && value.expiresAt-value.observedAt<=1200000);
  const handle=Object.freeze({syntheticOnly:true,hostedEnabled:false});
  custody.set(handle,structuredClone(value)); return handle;
}
export function assertOfflineCleanupCustody(handle,binding,now,dispatchExpiresAt) {
  const value=custody.get(handle);
  need(value && same(value.binding,binding) && Number.isSafeInteger(now) && now>=value.observedAt && now<value.expiresAt && Number.isSafeInteger(dispatchExpiresAt) && value.expiresAt>dispatchExpiresAt);
  return Object.freeze({syntheticOnly:true,hostedEnabled:false,expiresAt:value.expiresAt});
}
export function createHostedRecordCleanupAdapter() { return Object.freeze({enabled:false,reason:'SEPARATE_HOSTED_AUTHORITY_AND_NATIVE_TRANSPORT_REQUIRED'}); }
/** Signed snapshots are offline observer fixtures, never hosted provider evidence. */
export function createOfflineRecordCleanupAdapter({directory,binding,grantPublicKey,evidencePublicKey,initialize=false,input,observationEnvelope,now}) {
  binding=structuredClone(binding);
  need(binding.purpose==='record-cleanup' && binding.runId===input.run.replaceAll('-',''));
  const observed=readOfflineSignedEvidence(observationEnvelope,evidencePublicKey);
  need(exact(observed,'synthetic,kind,binding,input') && observed.synthetic===true && observed.kind==='cleanup-input' && same(observed.binding,binding) && same(observed.input,input));
  const fixed=structuredClone(input);
  const executor=createSyntheticRecordCleanupExecutor({...fixed,now});
  const plan=executor.prepare(now);
  need(binding.targetDigest===plan.targetDigest);
  const journal=(initialize?initializeSyntheticJournal:openSyntheticJournal)({directory,binding,grantPublicKey,evidencePublicKey});
  let begun, consumed=false, outcome='not-started', checked=null;
  return Object.freeze({
    begin({grant,before,now:at}) {
      const beforeValue=readOfflineSignedEvidence(before,evidencePublicKey);
      need(beforeValue.snapshotDigest===digest(executor.observe(at)));
      begun=journal.begin({grant,before,now:at}); return begun;
    },
    execute({now:at,mode='normal'}) {
      need(begun && !consumed); consumed=true;
      journal.reserve({rows:fixed.creation.ids.length,now:at});
      // One memory-only mutation. No transport callback can be substituted.
      try { const result=executor.execute(plan.handle,at,mode); outcome=result.status==='uncertain'?'ambiguous':'awaiting-independent-proof'; return result; }
      catch { outcome='ambiguous'; throw Error('OFFLINE_CLEANUP_DENIED'); }
    },
    reconcile({envelope,now:at}) {
      need(consumed && !checked);
      const proof=readOfflineSignedEvidence(envelope,evidencePublicKey);
      need(exact(proof,'synthetic,kind,binding,snapshot') && proof.synthetic===true && proof.kind==='cleanup-after' && same(proof.binding,binding));
      // Compare against independently signed observer, not executor-generated success.
      const handle=prepareSyntheticRecordContainment({...fixed,now:fixed.before.observedAt}).handle;
      const result=verifySyntheticRecordContainment(handle,proof.snapshot,at);
      need(same(proof.snapshot.records,executor.observe(at).records));
      checked=Object.freeze({snapshotDigest:digest(proof.snapshot),observedAt:proof.snapshot.observedAt});
      outcome='independently-reconciled'; return result;
    },
    finish({after,now:at}) {
      need(checked);
      const proof=readOfflineSignedEvidence(after,evidencePublicKey);
      need(proof.snapshotDigest===checked.snapshotDigest && proof.observedAt===checked.observedAt);
      const result=journal.finish({after,now:at}); outcome='complete'; return result;
    },
    inspect() { return Object.freeze({outcome,journal:journal.inspect(),retryAllowed:false,hostedEnabled:false,deploymentRetirementVerified:false}); }
  });
}
