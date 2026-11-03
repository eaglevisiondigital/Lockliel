/** Member-only observer. Missing dynamic checks remain false, never inferred. */
import {randomBytes} from 'node:crypto';
import {privateIdentityMappingPayload} from './identity-mapping.mjs';
import {requireOfficialOperatorNetwork} from './operator-network.mjs';
const fields=['sameOriginPostOnly','secureHttpOnlyHostOnlyCookies','csrfDenied','redirectDenied','expiryDenied','activeSessionDenied','localLogoutVerified','crossAccountIsolation','mfaUnavailableDenied','aal1PrivilegedDenied','aal2AuthorizedOnly','defaultOffDenied','foreignProjectDenied','missingKeyDenied','noBrowserTokens','maintenancePreserved'];
const need=x=>{if(!x)throw Error('Isolated member acceptance denied.');};
export function acceptanceEvidenceRequirements(){return Object.freeze({scope:'ordinary-ab-only',positiveManagerAal2:'NOT_TESTED',staffRoleAuthorization:'NOT_TESTED',requiresSeparateObservation:Object.freeze(['expiryDenied','activeSessionDenied','mfaUnavailableDenied','defaultOffDenied','foreignProjectDenied','missingKeyDenied']),complete:false});}
export async function observeBoundMembers(network,mappingHandle,pin,manifestSha256){
 requireOfficialOperatorNetwork(network);const mapping=privateIdentityMappingPayload(mappingHandle),observed=Object.fromEntries(fields.map(k=>[k,false]));const reads=[];let cleanup={verified:false};
 try{
  for(const label of ['A','B']){
   const login=await network.member(label,'POST','/api/lockliel-auth/login');const subject=mapping.subjects.find(row=>row.label===label);
   need(login.status===200&&login.subjectSha256===subject.subjectSha256&&login.cookiesSecure===true);observed.secureHttpOnlyHostOnlyCookies=true;
   const nonce=randomBytes(16).toString('hex');const read=await network.member(label,'GET','/api/lockliel/member-read',{headers:{'x-lockliel-read-nonce':nonce,'x-lockliel-read-generation':'1'}});
   need(read.status===200&&read.projection.nonce===nonce&&read.projection.generation===1&&read.projection.validUntil>Date.now()&&read.projection.validUntil<=Date.now()+61000&&read.projection.privateDataExcluded===true&&['source','site','project','deploy'].every(key=>read.projection.binding[key]===pin.binding[key]));reads.push(read.projection);
  }
  need(reads[0].boundary!==reads[1].boundary);observed.crossAccountIsolation=true;observed.noBrowserTokens=true;
  // Login/read success cannot establish CSRF, expiry, inactive-session, MFA,
  // context/default/key or privileged denial. These stay explicitly false.
 }finally{cleanup=await network.cleanupMembers();observed.localLogoutVerified=cleanup.verified;}
 return Object.freeze({source:'authorized-isolated-hosted-acceptance',identity:Object.freeze({...pin.binding,manifestSha256}),observedAt:Date.now(),...observed,ordinaryMembersMatched:reads.length===2,callerRestVerified:reads.length===2&&observed.crossAccountIsolation,missingRequired:Object.freeze(fields.filter(k=>!observed[k])),managerAal2:'NOT_TESTED',staffAuthorization:'NOT_TESTED',cleanupVerified:cleanup.verified});
}
