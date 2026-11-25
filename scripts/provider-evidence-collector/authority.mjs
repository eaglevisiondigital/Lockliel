/** No provider-supported pre-secret operator/scope/credential binding adapter is
 * installed. Neither JSON, token possession, digest nor local flag is authority.
 * There is deliberately NO capability mint. All live entry fails before input. */
const verified = new WeakMap(), enteredCredentialBound = new WeakSet();
export function loadInstalledAuthority() { throw new Error('AUTHORITY_UNAVAILABLE'); }
export function inspectVerifiedAuthority(value,now) {
 const row=value&&verified.get(value);
 if(!row||!Number.isSafeInteger(now)||now<row.observedAt||now>=row.expiresAt||now-row.observedAt>300000)throw new Error('AUTHORITY_UNAVAILABLE');
 return row;
}
export function verifyEnteredCredentialBinding() {
 // No documented private verification binding an entered value to prior scoped
 // authority is installed. Never compare/log/hash the live token as evidence.
 throw new Error('CREDENTIAL_BINDING_UNAVAILABLE');
}
export function takeVerifiedAuthority(value) {
 if(!value||!enteredCredentialBound.has(value))throw new Error('AUTHORITY_UNAVAILABLE');
 enteredCredentialBound.delete(value);
 const row=inspectVerifiedAuthority(value,Date.now());verified.delete(value);return row;
}
export function operatorReadiness() {
 return Object.freeze({liveEntryEnabled:false,operatorIdentity:'UNKNOWN',isolatedScope:'UNKNOWN',credentialBinding:'UNKNOWN',fixtureActivationAllowed:false});
}
