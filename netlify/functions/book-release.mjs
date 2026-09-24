import { getStore } from "@netlify/blobs";
import { allowedOrigin, bodyJSON, attribution, hash, json } from "../lib/faith-boost-core.mjs";\nimport { SUPABASE_URL } from "../lib/lockliel-core.mjs";
const book="A Heart for the Lost";
const consentText="By signing up, you agree to receive email notifications about this book’s release. We won’t add you to unrelated mailing lists.";
export function createReleaseSignup({storeFor=()=>getStore({name:"book-release-notifications",consistency:"strong"}),post=fetch}={}) {
 return async (request,context={})=>{
  if(request.method!=="POST") return json({ok:false},405,{Allow:"POST"});
  if(!allowedOrigin(request,context)) return json({ok:false,message:"Please sign up through the Lockliel website."},403);
  let lead;
  try {
   const data=await bodyJSON(request);
   const firstName=typeof data?.firstName==="string"?data.firstName.trim():"";
   const email=typeof data?.email==="string"?data.email.trim().toLowerCase():"";
   if(!firstName || firstName.length>80 || /[<>\x00-\x1f]/.test(firstName)) throw Error("Please enter your first name.");
   if(email.length>254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)) throw Error("Please enter a valid email address.");
   if(data.releaseConsent!==true || data.botField) throw Error("Please use the release-notification form to sign up.");
   lead={firstName,email,book,signupAt:new Date().toISOString(),releaseConsent:true,consentText,consentVersion:"heart-release-v1",generalMarketingConsent:false,emailVerified:false,attribution:attribution(data.attribution)};
  }catch(error){return json({ok:false,message:error instanceof SyntaxError?"Please check your details and try again.":error.message},400);}
  try {
   const store=storeFor(),key=`heart-for-the-lost/leads/${hash(lead.email)}`,syncKey=`heart-for-the-lost/form-sync/${hash(lead.email)}`;
   await store.setJSON(key,lead,{onlyIfNew:true});
   const saved=await store.get(key,{type:"json",consistency:"strong"});
   if(!saved || saved.email!==lead.email) throw Error("Capture not confirmed");
   const sync=await store.getWithMetadata(syncKey,{type:"json",consistency:"strong"});
   const retry=!sync || (!sync.data.sent && (!sync.data.pending || Date.now()-sync.data.startedAt>60000));
   const claimed=retry && (await store.setJSON(syncKey,{sent:false,pending:true,startedAt:Date.now()},sync?{onlyIfMatch:sync.etag}:{onlyIfNew:true})).modified;
   if(claimed){
    try {
     const fields=new URLSearchParams({"form-name":"heart-for-the-lost-release","first-name":saved.firstName,email:saved.email,book,"signup-at":saved.signupAt,"release-consent":"yes","consent-version":saved.consentVersion,...saved.attribution});
     const response=await post("https://lockliel.com/__heart-book-release.html",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:fields.toString(),signal:AbortSignal.timeout(10000)});
     if(!response.ok) throw Error("Forms delivery unavailable");
     await store.setJSON(syncKey,{sent:true,at:new Date().toISOString()});
    }catch{await store.setJSON(syncKey,{sent:false,at:new Date().toISOString()});}
   }
   try {
    await fetch(SUPABASE_URL+"/functions/v1/capture-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:saved.firstName,email:saved.email,sourceType:"book_interest",campaign:"a-heart-for-the-lost-release",attribution:saved.attribution,consent:{releaseNotifications:true,generalMarketing:false,version:saved.consentVersion,text:saved.consentText}}),signal:AbortSignal.timeout(5000)});
   } catch { /* CRM mirroring must not block the release signup. */ }
   return json({ok:true});
  }catch{return json({ok:false,message:"We couldn’t confirm your signup. Your details are still here. Please try again, or contact info@lockliel.com."},503);}
 };
}
export default createReleaseSignup();
export const config={path:"/api/book-release",rateLimit:{windowLimit:10,windowSize:60,aggregateBy:["ip","domain"]}};
