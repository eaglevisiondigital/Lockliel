"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

export default function LocklielAuthForm({ mode }: { mode: "login" | "signup" }) {
  const [status,setStatus]=useState<"idle"|"loading"|"error"|"confirmation">("idle");
  const [message,setMessage]=useState("");
  const referralCode=useMemo(()=>typeof window!=="undefined"?new URLSearchParams(window.location.search).get("ref")||"":"",[]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("loading"); setMessage("");
    const data=new FormData(event.currentTarget);
    const payload=mode==="login"
      ? {email:data.get("email"),password:data.get("password")}
      : {firstName:data.get("firstName"),lastName:data.get("lastName"),email:data.get("email"),password:data.get("password"),referralCode};
    try{
      const res=await fetch(`/api/lockliel-auth/${mode==="login"?"login":"signup"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const body=await res.json();
      if(!res.ok) throw new Error(body.error||"Something went wrong.");
      if(body.needsConfirmation){setStatus("confirmation");setMessage("Check your email to confirm your account, then come back and sign in.");return;}
      window.location.assign("/my-lockliel");
    }catch(error){setStatus("error");setMessage(error instanceof Error?error.message:"Something went wrong.");}
  }

  return <form className="ml-auth-card" onSubmit={submit}>
    {mode==="signup"&&<div className="ml-auth-row"><label>First name<input name="firstName" autoComplete="given-name" required/></label><label>Last name<input name="lastName" autoComplete="family-name" required/></label></div>}
    <label>Email address<input name="email" type="email" autoComplete="email" required/></label>
    <label>Password<input name="password" type="password" autoComplete={mode==="login"?"current-password":"new-password"} minLength={8} required/></label>
    {referralCode&&mode==="signup"&&<p className="ml-referral-note">You arrived through a personal Lockliel invitation. We’ll preserve that connection when your account is created.</p>}
    {message&&<p className={status==="error"?"ml-auth-message error":"ml-auth-message"}>{message}</p>}
    {status!=="confirmation"&&<button className="ml-action" disabled={status==="loading"}>{status==="loading"?"Please wait…":mode==="login"?"Sign in":"Create my account"}</button>}
    <p className="ml-auth-switch">{mode==="login"?<>New to Lockliel? <Link href="/my-lockliel/sign-up">Create an account</Link></>:<>Already have an account? <Link href="/my-lockliel/sign-in">Sign in</Link></>}</p>
  </form>;
}
