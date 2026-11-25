/** Nonsecret evidence contracts only. No I/O, collector or live authority. */
import {need,clone,exact,digest,freeze} from './contracts.mjs';
export const AUTH_HOOK_FIELDS=Object.freeze(['beforeUserCreatedHook','afterUserCreatedHook','customAccessTokenHook','passwordVerificationHook','mfaVerificationAttemptHook','sendEmailHook','sendSmsHook']);
export const MECHANISM_STATES=Object.freeze(['configured','disabled','absent','unknown']);
/** Missing/null is unknown, never absent or disabled. Absence requires separate
 * authoritative schema/version evidence and is not accepted by the create gate. */
export function authHookState(enabled){return enabled===true?'configured':enabled===false?'disabled':'unknown';}
const EXPECTED=freeze({
 databaseTriggers:{state:'configured',effects:'reviewed-fixture-bootstrap-only'},
 bootstrapFunctions:{state:'configured',effects:'seven-owned-application-rows-per-user'},
 memberRoleDefaults:{state:'configured',effects:'ordinary-member-no-staff-grants'},
 automaticEnrollment:{state:'absent',effects:'no-enrollments'},
 customClaims:{state:'absent',effects:'no-custom-or-privileged-claims'}
});
/** The native graph hash must be independently reviewed and freshly matched by
 * the unchanged native preflight. These labels do not prove hosted state. */
export function validateCreationMechanisms(raw,expectedGraph){
 const r=clone(raw);exact(r,['triggerGraphSha256','dependencyReview',...Object.keys(EXPECTED)]);
 need(digest(expectedGraph)&&r.triggerGraphSha256===expectedGraph);
 exact(r.dependencyReview,['status','reviewSha256','unresolvedDependencyCount']);
 need(r.dependencyReview.status==='reviewed'&&digest(r.dependencyReview.reviewSha256)&&r.dependencyReview.unresolvedDependencyCount===0);
 for(const [key,expected] of Object.entries(EXPECTED)){
  exact(r[key],['state','effects']);need(MECHANISM_STATES.includes(r[key].state));
  need(r[key].state===expected.state&&r[key].effects===expected.effects);
 }
 return freeze(r);
}
