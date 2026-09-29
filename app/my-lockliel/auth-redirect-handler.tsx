"use client";
import {useEffect} from "react";
export default function AuthRedirectHandler(){
 useEffect(()=>{
  const raw=location.hash.startsWith("#")?location.hash.slice(1):"";
  if(!raw)return;
  const p=new URLSearchParams(raw),accessToken=p.get("access_token"),refreshToken=p.get("refresh_token"),type=p.get("type"),expiresIn=Number(p.get("expires_in")||3600);
  if(!accessToken||!refreshToken||type==="recovery")return;
  history.replaceState(null,"",location.pathname+location.search);
  fetch("/api/lockliel-auth/accept-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accessToken,refreshToken,expiresIn})})
   .then(r=>{if(r.ok)location.replace("/my-lockliel");});
 },[]);
 return null;
}