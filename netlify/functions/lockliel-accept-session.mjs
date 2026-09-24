import {json,sessionCookies,authUser} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 const b=await request.json().catch(()=>({})),access=String(b.accessToken||""),refresh=String(b.refreshToken||"");
 if(!access||!refresh)return json({error:"Invalid sign-in confirmation."},400);
 const user=await authUser(access);if(!user)return json({error:"This confirmation link is invalid or expired."},401);
 return json({ok:true},200,sessionCookies({access_token:access,refresh_token:refresh,expires_in:Number(b.expiresIn)||3600}));
};
export const config={path:"/api/lockliel-auth/accept-session"};