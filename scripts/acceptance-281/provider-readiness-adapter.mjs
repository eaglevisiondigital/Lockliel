/** Offline contract composition only. No live collector or credential access. */
import { createHash, createPublicKey, verify } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { evaluateSemanticLocalReadiness } from '../../lib/readiness-281/fingerprint/compare.mjs';
const PROJECT = 'qjksggxorghaxvpyslip';
const handles = new WeakMap();
const digest = s => createHash('sha256').update(s).digest('hex');
const need = (v, code) => { if (!v) throw Error(code); };
const exact = (v, keys) => v && Object.getPrototypeOf(v) === Object.prototype && Object.keys(v).sort().join() === keys.split(',').sort().join();
const stable = v => Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}' : JSON.stringify(v);
function retained() {
  const raw = readFileSync(new URL('./provider-readiness-source-seal.json', import.meta.url), 'utf8');
  need(digest(raw) === '631fd71cf4c71aa75494d5fa238fa8e6e9d9e5ff66a5ffcc0f8e1bb66ee0ee01', 'SOURCE_CHANGED');
  const pins = JSON.parse(raw);
  for (const [path, hash] of Object.entries(pins)) need(digest(readFileSync(new URL('../../' + path, import.meta.url))) === hash, 'SOURCE_CHANGED');
  return JSON.parse(readFileSync(new URL('../../lib/readiness-281/local-expected.json', import.meta.url), 'utf8'));
}
function binding(b) {
  need(exact(b, 'source,runId,operator') && /^[a-f0-9]{40}$/.test(b.source) && /^[a-f0-9]{32}$/.test(b.runId) && /^[A-Za-z][A-Za-z0-9 ._-]{0,63}$/.test(b.operator), 'INVALID_BINDING');
}
function fresh(observedAt, now) { need(Number.isSafeInteger(now) && Number.isSafeInteger(observedAt) && observedAt >= 0 && observedAt <= now && now - observedAt < 300000, 'STALE_EVIDENCE'); }
/** The caller key is a synthetic test issuer, NEVER an independently established provider trust root. */
export function createOfflineProviderReadinessAdapter({ source, runId, operator, receiptPublicKey }) {
  const bound = {source, runId, operator}; binding(bound);
  let key; try { key = createPublicKey(receiptPublicKey); } catch { throw Error('INVALID_TEST_ISSUER'); }
  need(key.asymmetricKeyType === 'ed25519', 'INVALID_TEST_ISSUER');
  const expected = retained();
  return Object.freeze({verify({envelope, now}) {
    try {
      retained();
      need(exact(envelope, 'payload,signature') && typeof envelope.payload === 'string' && Buffer.byteLength(envelope.payload) <= 2000000 && typeof envelope.signature === 'string' && /^[A-Za-z0-9+/]{86}==$/.test(envelope.signature), 'INVALID_RECEIPT');
      need(verify(null, Buffer.from(envelope.payload), key, Buffer.from(envelope.signature, 'base64')), 'INVALID_SIGNATURE');
      const p = JSON.parse(envelope.payload);
      need(envelope.payload === stable(p), 'NONCANONICAL_RECEIPT');
      need(exact(p, 'kind,synthetic,source,runId,operator,project,branch,branchId,provider,operation,observedAt,version,candidateSha256,ledger,catalog,foreignKeys,sqlResult'), 'INVALID_RECEIPT');
      need(p.synthetic === true && p.kind === 'offline-provider-readiness-281-v1' && p.provider === 'MOCK_SUPABASE' && p.operation === 'MOCK_NATIVE_READ_ONLY_281', 'LIVE_AUTHORITY_UNAVAILABLE');
      need(p.source === source && p.runId === runId && p.operator === operator, 'BINDING_MISMATCH');
      need(p.project === PROJECT && p.branch === expected.branch && p.branchId === expected.branchId, 'PROJECT_MISMATCH');
      fresh(p.observedAt, now);
      need(p.version === 281 && p.candidateSha256 === expected.candidate.sha256 && stable(p.ledger) === stable(expected.ledger) && p.ledger.length === 281, 'LEDGER_MISMATCH');
      const comparison = evaluateSemanticLocalReadiness({catalog:p.catalog, foreignKeys:p.foreignKeys, sqlResult:p.sqlResult});
      need(comparison.localFixtureChecksPass, 'CATALOG_MISMATCH');
      const result = Object.freeze({scope:'OFFLINE_SIGNED_SYNTHETIC_ONLY', localChecksPass:true, hostedReady:false, executionAuthorized:false, project:PROJECT, source, runId, operator, observedAt:p.observedAt, receiptDigest:digest(envelope.payload)});
      handles.set(result, {bound, observedAt:p.observedAt}); return result;
    } catch (e) {
      const allowed = ['SOURCE_CHANGED','INVALID_RECEIPT','INVALID_SIGNATURE','NONCANONICAL_RECEIPT','LIVE_AUTHORITY_UNAVAILABLE','BINDING_MISMATCH','PROJECT_MISMATCH','STALE_EVIDENCE','LEDGER_MISMATCH','CATALOG_MISMATCH'];
      throw Error(allowed.includes(e?.message) ? e.message : 'EVIDENCE_REJECTED');
    }
  }});
}
export function getOfflineReadinessEvidence(receipt, {source,runId,operator,now}) {
  const b = {source,runId,operator}; binding(b);
  const state = handles.get(receipt); need(state && stable(state.bound) === stable(b), 'UNTRUSTED_RECEIPT');
  fresh(state.observedAt, now); retained(); return receipt;
}
/** No caller-supplied key, callback, boolean or local fixture can enable hosted authority. */
export function createHostedProviderReadinessAdapter() { throw Error('INDEPENDENT_PROVIDER_COLLECTOR_AND_AUTHORIZATION_REQUIRED'); }
