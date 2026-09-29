import {withProductionBackend} from '../lib/deployment-safety.mjs';
import {json,requireSession,sessionCookies} from '../lib/lockliel-core.mjs';
import {loadMemberJourney} from '../lib/member-journey-data.mjs';
import {buildMemberJourney} from '../lib/member-journey.mjs';

export function createNextStepHandler({sessionFor=requireSession,fetcher=globalThis.fetch,clock=()=>new Date()}={}) {
  return async request=>{
    if(request.method!=='GET')return json({error:'Method not allowed'},405);
    try {
      const session=await sessionFor(request);
      if(!session.user?.id||!session.access)return json({error:'Unauthorized'},401);
      // No caller-supplied member ID, role, priority or recommendation is accepted.
      const now=clock();
      const state=await loadMemberJourney(session,{fetcher,now});
      return json(buildMemberJourney(state,now),200,session.refreshed?sessionCookies(session.refreshed):[]);
    } catch {
      return json({error:'Your next step is temporarily unavailable. Please try again.'},503);
    }
  };
}
export default withProductionBackend(createNextStepHandler());
export const config={path:'/api/lockliel/next-step'};
