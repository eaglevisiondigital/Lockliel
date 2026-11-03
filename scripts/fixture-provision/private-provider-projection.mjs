/** Offline private-boundary primitives. NO transport, credential input, provider
 * authority, installation seal or live execution is implemented here. Raw bytes
 * must never be supplied through a model-visible tool. Synthetic tests only.
 * Parsing proves shape, not origin. Caller data cannot authorize creation. */
import {IDENTITY, exact, need, freeze} from './contracts.mjs';
import AUTH_CONFIG_SCHEMA from './auth-config-schema.json' with {type:'json'};
freeze(AUTH_CONFIG_SCHEMA);

export const PROVIDER_PROJECT_FIELDS = Object.freeze(['id','ref','organization_id','organization_slug','name','region','created_at','status','database']);
export const PROVIDER_HOOK_FIELDS = Object.freeze([
 'hook_before_user_created_enabled','hook_after_user_created_enabled',
 'hook_custom_access_token_enabled','hook_password_verification_attempt_enabled',
 'hook_mfa_verification_attempt_enabled','hook_send_email_enabled','hook_send_sms_enabled',
]);
const STATUSES = new Set(['INACTIVE','ACTIVE_HEALTHY','ACTIVE_UNHEALTHY','COMING_UP','UNKNOWN','GOING_DOWN','INIT_FAILED','REMOVED','RESTORING','UPGRADING','PAUSING','RESTORE_FAILED','RESTARTING','PAUSE_FAILED','RESIZING','PROMOTING']);
const DENIED = Object.freeze({schema:'lockliel-private-projection-v1',ok:false,category:'UNVERIFIED_PROVIDER_RESPONSE',providerIdentity:'UNKNOWN',independentAuthorityVerified:false,activationAllowed:false,rawResponseRetained:false});

/** Bounded JSON decoder rejects duplicate/escaped-duplicate keys before a normal
 * parse could erase ambiguity. No object coercion, getters, revivers or callbacks.
 * Strings are transient immutable runtime values; physical zeroization is not
 * promised. No raw input or exception text is ever returned. */
function decode(raw) {
 need(typeof raw==='string' && raw.length>0 && raw.length<=65536);
 let offset=0, nodes=0;
 const white=()=>{while(/[ \n\r\t]/.test(raw[offset]||'!'))offset++;};
 function string() {
  need(raw[offset]==='"');const start=offset++;
  while(offset<raw.length) {
   const code=raw.charCodeAt(offset);need(code>=32);
   if(raw[offset]==='"'){offset++;return JSON.parse(raw.slice(start,offset));}
   if(raw[offset]==='\\') {offset++;need(offset<raw.length);if(raw[offset]==='u'){need(/^[a-fA-F0-9]{4}$/.test(raw.slice(offset+1,offset+5)));offset+=5;continue;}need('"\\/bfnrt'.includes(raw[offset]));}
   offset++;
  }
  need(false);
 }
 function value(depth=0) {
  need(depth<12 && ++nodes<=512);white();const c=raw[offset];
  if(c==='"')return string();
  if(c==='{') {
   offset++;white();const out={}, seen=new Set();if(raw[offset]==='}'){offset++;return out;}
   for(;;){white();const key=string();need(!seen.has(key)&&!['__proto__','constructor','prototype'].includes(key));seen.add(key);white();need(raw[offset++]===':');out[key]=value(depth+1);white();const sep=raw[offset++];if(sep==='}')return out;need(sep===',');}
  }
  if(c==='[') {
   offset++;white();const out=[];if(raw[offset]===']'){offset++;return out;}
   for(;;){out.push(value(depth+1));white();const sep=raw[offset++];if(sep===']')return out;need(sep===',');}
  }
  for(const [word,result] of [['true',true],['false',false],['null',null]])if(raw.startsWith(word,offset)){offset+=word.length;return result;}
  const number=/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(raw.slice(offset));need(number);offset+=number[0].length;const n=Number(number[0]);need(Number.isFinite(n));return n;
 }
 const out=value();white();need(offset===raw.length);return out;
}
function observedAt(value){need(Number.isSafeInteger(value)&&value>0&&value<=8640000000000000);return value;}
function text(value){need(typeof value==='string'&&value.length>0&&value.length<=1024);}
function project(raw,time) {
 exact(raw,PROVIDER_PROJECT_FIELDS);
 need(raw.id===IDENTITY.project&&raw.ref===IDENTITY.project&&raw.name===IDENTITY.branch);
 for(const k of ['organization_id','organization_slug','region','created_at'])text(raw[k]);
 need(STATUSES.has(raw.status));exact(raw.database,['host','version','postgres_engine','release_channel']);
 need(raw.database.host==='db.'+IDENTITY.project+'.supabase.co');
 for(const k of ['version','postgres_engine','release_channel'])text(raw.database[k]);
 return freeze({...DENIED,ok:true,category:'PROJECT_SHAPE_VALIDATED',observedAt:observedAt(time),project:IDENTITY.project,expectedNameMatch:true,expectedHostMatch:true,status:raw.status,operatorIdentity:'UNKNOWN',branchParentLinkage:'UNKNOWN',authVersion:'UNKNOWN',credentialProvenance:'UNKNOWN'});
}
/** Exact REST JSON contract only. Never accepts wrapper guessing or Auth config. */
export function projectPrivateProjectJson(raw,time){try{return project(decode(raw),time);}catch{return DENIED;}}
/** Two explicit hypothetical connector envelopes tested offline. Their existence
 * does not establish the real connector contract. Mixed/extra representations
 * fail even when superficially consistent. No automatic fallback/unwrapping. */
export function projectPrivateProjectEnvelopeJson(raw,time){try{
 const envelope=decode(raw);need(envelope&&typeof envelope==='object'&&!Array.isArray(envelope));
 const keys=Object.keys(envelope);const payload=Object.hasOwn(envelope,'structuredContent')?'structuredContent':'content';
 exact(envelope,keys.includes('isError')?[payload,'isError']:[payload]);if(keys.includes('isError'))need(envelope.isError===false);
 if(payload==='structuredContent')return project(envelope.structuredContent,time);
 need(Array.isArray(envelope.content)&&envelope.content.length===1);exact(envelope.content[0],['type','text']);need(envelope.content[0].type==='text');return project(decode(envelope.content[0].text),time);
}catch{return DENIED;}}
/** Only the already-minimized seven-field SYNTHETIC shape is supported. This is
 * NOT a filter for the broad secret-bearing Auth endpoint and proves no origin.
 * Full configuration, unknown future hooks and missing flags are rejected. */
export function projectSyntheticHookJson(raw,time){try{
 const value=decode(raw);exact(value,PROVIDER_HOOK_FIELDS);const hooks={};
 for(const key of PROVIDER_HOOK_FIELDS){need(value[key]===true||value[key]===false||value[key]===null);hooks[key]=value[key]===true?'configured':value[key]===false?'disabled':'unknown';}
 return freeze({...DENIED,ok:true,category:'SYNTHETIC_HOOK_SHAPE_VALIDATED',observedAt:observedAt(time),project:IDENTITY.project,syntheticOnly:true,hooks});
}catch{return DENIED;}}
export function privateProviderEvidenceReadiness(){return freeze({offlineProjectionTestable:true,liveTransportImplemented:false,connectorEnvelopeVerified:false,secretBearingResponseBoundaryVerified:false,independentProviderAuthority:false,fixtureActivationAllowed:false,liveReadAuthorized:false});}

/** Full documented Auth configuration response boundary, independently testable
 * with synthetic JSON only. A future private collector must invoke this BEFORE
 * any raw response can enter model-visible tools. No transport is installed.
 * Exact shape prevents silent future hook/config additions; all non-hook values
 * are validated then discarded, never emitted or hashed. This response has no
 * project identity, so even success cannot establish origin/project binding. */
export function projectPrivateAuthConfigJson(raw,time){try{
 const value=decode(raw);exact(value,AUTH_CONFIG_SCHEMA.required);
 for(const [key,rule] of Object.entries(AUTH_CONFIG_SCHEMA.properties)){
  const item=value[key];
  if(item===null){need(rule.nullable===true);if(rule.enum)need(rule.enum.includes(null));continue;}
  if(rule.type==='integer')need(Number.isSafeInteger(item));
  else if(rule.type==='number')need(typeof item==='number'&&Number.isFinite(item));
  else need(typeof item===rule.type);
  if(rule.enum)need(rule.enum.includes(item));
  if(Object.hasOwn(rule,'minimum'))need(item>=rule.minimum);
  if(Object.hasOwn(rule,'maximum'))need(item<=rule.maximum);
  if(rule.pattern)need(new RegExp(rule.pattern).test(item));
 }
 const hooks={};for(const key of PROVIDER_HOOK_FIELDS)hooks[key]=value[key]===true?'configured':value[key]===false?'disabled':'unknown';
 return freeze({...DENIED,ok:true,category:'AUTH_CONFIG_SHAPE_VALIDATED',observedAt:observedAt(time),expectedProject:IDENTITY.project,projectBinding:'UNKNOWN',operatorIdentity:'UNKNOWN',credentialProvenance:'UNKNOWN',hooks});
}catch{return DENIED;}}
