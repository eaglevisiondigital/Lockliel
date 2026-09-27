// Browser-local instrumentation only. No persistence, user IDs or transport.
// Existing database/referral events remain the durable source for actual progress.
export const memberJourneyEvents = new Set(['onboarding_started','onboarding_completed','next_step_viewed','next_step_started','next_step_completed','grip_started','lesson_completed','my_five_person_added','local_group_interest','group_joined','host_orientation_started','host_orientation_completed','resource_shared']);
export function journeyEvent(event) {
  if(typeof window==='undefined'||globalThis.navigator?.doNotTrack==='1'||!memberJourneyEvents.has(event))return;
  window.dispatchEvent(new CustomEvent('lockliel:journey-event',{detail:{event}}));
}
