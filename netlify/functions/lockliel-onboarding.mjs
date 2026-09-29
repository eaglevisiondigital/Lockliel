import {withProductionBackend} from '../lib/deployment-safety.mjs';
import {json,requireSession,sessionCookies} from '../lib/lockliel-core.mjs';
import {memberRows} from '../lib/member-journey-data.mjs';
import {onboardingComplete} from '../lib/member-journey.mjs';

const interests=new Set(['biblical-foundations','identity-in-christ','prayer','faith-development','evangelism','discipleship','leadership','healing-wholeness','family-relationships']);
export function onboardingPreferences(body) {
  if(!body||typeof body!=='object'||Array.isArray(body)||body.privacyAcknowledged!==true||!Array.isArray(body.growthInterests)||body.growthInterests.length>20||body.growthInterests.some(value=>typeof value!=='string'||!interests.has(value))||typeof body.newBeliever!=='boolean')return null;
  return {growth_interests:[...new Set(body.growthInterests)],...(body.newBeliever?{faith_stage:'new-believer'}:{})};
}
export function createOnboardingHandler({sessionFor=requireSession,fetcher=globalThis.fetch}={}) {
  return async request=>{
    if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
    // This supplements SameSite cookies; it does not turn an Origin into authorization.
    if(request.method==='POST' && request.headers.get('origin') && request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Request not allowed'},403);
    try {
      const session=await sessionFor(request);
      if(!session.user?.id||!session.access)return json({error:'Unauthorized'},401);
      const uid=encodeURIComponent(session.user.id),rows=memberRows(session.access,fetcher);
      const profiles=await rows('profiles?id=eq.'+uid+'&select=first_name,last_name,phone,city,region,country,locale,timezone,onboarding_status&limit=1');
      if(!profiles[0])return json({error:'Your profile is not available. Please try again.'},503);
      const cookies=session.refreshed?sessionCookies(session.refreshed):[];
      if(request.method==='GET') {
        const faith=await rows('faith_profiles?profile_id=eq.'+uid+'&select=growth_interests,faith_stage&limit=1');
        return json({profile:profiles[0],preferences:{growthInterests:faith[0]?.growth_interests||[],newBeliever:faith[0]?.faith_stage==='new-believer'},complete:onboardingComplete(profiles[0],faith[0])},200,cookies);
      }
      const raw=await request.text();
      if(new TextEncoder().encode(raw).length>4096)return json({error:'Your selections are too large.'},413);
      let body;try{body=JSON.parse(raw);}catch{return json({error:'Choose valid preferences.'},400);}
      const preferences=onboardingPreferences(body);
      if(!preferences)return json({error:'Review your selections and the privacy explanation.'},400);
      if(profiles[0].onboarding_status!=='active')return json({error:'Confirm your profile before continuing.'},409);
      if(!body.newBeliever) {
        const current=await rows('faith_profiles?profile_id=eq.'+uid+'&select=faith_stage&limit=1');
        if(current[0]?.faith_stage==='new-believer')preferences.faith_stage=null;
      }
      // Minimal upsert updates only supplied columns. Existing private background,
      // ministry experience, host preference, connection preference and notes survive.
      const saved=await rows('faith_profiles?on_conflict=profile_id&select=profile_id',{
        method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},
        body:JSON.stringify({profile_id:session.user.id,...preferences})
      });
      if(saved.length!==1||saved[0].profile_id!==session.user.id)throw new Error('Onboarding write not confirmed');
      return json({ok:true,complete:true},200,cookies);
    } catch {
      return json({error:'We could not save or load your welcome steps. Please try again.'},503);
    }
  };
}
export default withProductionBackend(createOnboardingHandler());
export const config={path:'/api/lockliel/onboarding',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
