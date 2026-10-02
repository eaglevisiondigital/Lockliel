"use client";

import Link from "next/link";
import {safeResourcePath} from "../../netlify/lib/member-journey.mjs";
import {useMemo,useState,useSyncExternalStore} from "react";

const subscribeToHydration=()=>()=>{};
const clientReady=()=>true;
const serverReady=()=>false;

export default function LocklielAuthForm({mode}:{mode:"login"|"signup"}){
  const ready=useSyncExternalStore(subscribeToHydration,clientReady,serverReady);
  const [status,setStatus]=useState<"idle"|"loading"|"error"|"confirmation">("idle");
  const [message,setMessage]=useState("");

  const referralCode=useMemo(()=>{
    if(typeof window==="undefined")return "";
    return new URLSearchParams(window.location.search).get("ref")||"";
  },[]);

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!ready||status==="loading")return;
    setStatus("loading");
    setMessage("");

    const data=new FormData(event.currentTarget);
    const payload=mode==="login"
      ? {
          email:data.get("email"),
          password:data.get("password")
        }
      : {
          firstName:data.get("firstName"),
          lastName:data.get("lastName"),
          email:data.get("email"),
          password:data.get("password"),
          referralCode
        };

    try{
      const res=await fetch(
        "/api/lockliel-auth/"+(mode==="login"?"login":"signup"),
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify(payload)
        }
      );

      const body=await res.json();
      if(!res.ok)throw new Error(body.error||"Something went wrong.");

      if(body.needsConfirmation){
        setStatus("confirmation");
        setMessage("Check your email to confirm your account, then come back and sign in.");
        return;
      }

      const intended=safeResourcePath(new URLSearchParams(location.search).get("next"))||"/my-lockliel";
      try{localStorage.setItem("lockliel:auth-change",String(Date.now()));}catch{}
      if(mode==="login"&&body.requiresMfa){
        window.location.assign("/my-lockliel/security?challenge=1&next="+encodeURIComponent(intended));
        return;
      }

      window.location.assign(intended);
    }catch(error){
      setStatus("error");
      setMessage(error instanceof Error?error.message:"Something went wrong.");
    }
  }

  // Static export is visible before React attaches onSubmit. Never allow a native
  // GET submission to put credentials in the URL during that interval.
  return <form className="ml-auth-card" method="post" action={"/api/lockliel-auth/"+(mode==="login"?"login":"signup")} aria-busy={!ready||status==="loading"} onSubmit={submit}>
    {mode==="signup"&&<div className="ml-auth-row">
      <label>
        First name
        <input name="firstName" autoComplete="given-name" maxLength={120} disabled={!ready} required/>
      </label>
      <label>
        Last name
        <input name="lastName" autoComplete="family-name" maxLength={120} disabled={!ready} required/>
      </label>
    </div>}

    <label>
      Email address
      <input name="email" type="email" autoComplete="email" maxLength={254} disabled={!ready} required/>
    </label>

    <label>
      Password
      <input
        name="password"
        type="password"
        autoComplete={mode==="login"?"current-password":"new-password"}
        minLength={8}
        maxLength={128}
        disabled={!ready}
        required
      />
    </label>

    {referralCode&&mode==="signup"&&<p className="ml-referral-note">
      You arrived through a personal Lockliel invitation. We’ll preserve that connection when your account is created.
    </p>}

    {mode==="signup"&&<p className="ml-privacy-note">
      If you joined through a personal invitation, your inviter may see that you joined and can message you inside My Lockliel. We do not give them your email address or phone number.
    </p>}

    {mode==="login"&&<p className="ml-auth-help">
      <Link href="/my-lockliel/forgot-password">Forgot your password?</Link>
    </p>}

    {message&&<p className={status==="error"?"ml-auth-message error":"ml-auth-message"}>
      {message}
    </p>}

    {status!=="confirmation"&&<button className="ml-action" disabled={!ready||status==="loading"}>
      {status==="loading"?"Please wait…":mode==="login"?"Sign in":"Create my account"}
    </button>}

    <p className="ml-auth-switch">
      {mode==="login"
        ? <>New to Lockliel? <Link href="/my-lockliel/sign-up">Create an account</Link></>
        : <>Already have an account? <Link href="/my-lockliel/sign-in">Sign in</Link></>}
    </p>
  </form>;
}
