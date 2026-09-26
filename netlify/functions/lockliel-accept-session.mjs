import {json,sessionCookies,validatedTokenPair} from "../lib/lockliel-core.mjs";

export default async(request)=>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 const b=await request.json().catch(()=>({}));
 const access=String(b.accessToken||"");
 const refresh=String(b.refreshToken||"");
 if(!access||!refresh)return json({error:"Invalid sign-in confirmation."},400);

 const pair=await validatedTokenPair(access,refresh);
 if(!pair)return json({error:"This confirmation link is invalid or expired."},401);

 return json({ok:true},200,sessionCookies(pair.session));
};

export const config={
 path:"/api/lockliel-auth/accept-session",
 rateLimit:{windowLimit:20,windowSize:60,aggregateBy:["ip"]}
};
