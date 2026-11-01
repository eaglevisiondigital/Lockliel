/** Build-time local review gate. This is feature exposure, never authentication. */
export function localMemberReviewEnabled(input: Readonly<{flag?: string; context?: string; netlify?: string}>): boolean {
  return input.flag === 'synthetic-local' && !input.netlify && (!input.context || input.context === 'dev');
}
export type ReviewActor = 'unselected' | 'member-a' | 'member-b';
export type ReviewView = 'dashboard' | 'faith' | 'share' | 'privacy';
export type ReviewState = Readonly<{actor: ReviewActor; view: ReviewView; editionId: string; epoch: number}>;
export type ReviewAction = Readonly<{type:'actor'; value:unknown}> | Readonly<{type:'view'; value:unknown}> |
  Readonly<{type:'edition'; value:unknown}> | Readonly<{type:'reset'}>;
export const initialReviewState = (): ReviewState => ({actor:'unselected',view:'dashboard',editionId:'',epoch:0});
export function reduceReviewState(state:ReviewState, action:ReviewAction):ReviewState {
  if(action.type==='reset') return {...initialReviewState(),epoch:state.epoch+1};
  if(action.type==='actor') return {...initialReviewState(),actor:action.value==='member-a'||action.value==='member-b'?action.value:'unselected',epoch:state.epoch+1};
  if(state.actor==='unselected') return state;
  if(action.type==='view') return action.value==='dashboard'||action.value==='faith'||action.value==='share'||action.value==='privacy'?{...state,view:action.value}:state;
  if(action.type==='edition') return {...state,editionId:typeof action.value==='string'&&['','fixture-only','fixture-alternative','unavailable-edition'].includes(action.value)?action.value:'unavailable-selection'};
  return state;
}
export function reviewIdentity(state:ReviewState):{status:'unknown'}|{status:'synthetic-owner';boundaryKey:string} {
  return state.actor==='member-a'||state.actor==='member-b'
    ?{status:'synthetic-owner',boundaryKey:`local-review-${state.actor}-${state.epoch}`}:{status:'unknown'};
}

/** Independent default-OFF exposure gate; the member review gate must also pass. */
export function localShareReviewEnabled(input: Readonly<{flag?:string; memberFlag?:string; context?:string; netlify?:string}>):boolean {
  return input.flag==='synthetic-local' && localMemberReviewEnabled({flag:input.memberFlag,context:input.context,netlify:input.netlify});
}

/** Privacy education is an independent local exposure, never a settings or Auth adapter. */
export function localPrivacyReviewEnabled(input:Readonly<{flag?:string;memberFlag?:string;context?:string;netlify?:string}>):boolean {
  return input.flag==='synthetic-local' && localMemberReviewEnabled({flag:input.memberFlag,context:input.context,netlify:input.netlify});
}
