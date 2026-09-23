"use client";
import { useRef, useState, type FormEvent } from "react";

export default function BookReleaseSignup() {
  const [state, setState] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [error, setError] = useState("");
  const busy = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    const attribution: Record<string,string> = {};
    for (const key of ["utm_source","utm_medium","utm_campaign","utm_content","source"]) { const value=params.get(key); if(value) attribution[key]=value; }
    if(document.referrer) { try { attribution.referrer=new URL(document.referrer).hostname; } catch {} }
    busy.current=true; setState("sending");setError("");
    const controller=new AbortController(); const timeout=window.setTimeout(()=>controller.abort(),30000);
    try {
      const response=await fetch("/api/book-release",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({firstName:data.get("first-name"),email:data.get("email"),botField:data.get("bot-field"),releaseConsent:true,attribution}),signal:controller.signal});
      const result=await response.json();
      if(!response.ok || !result.ok) throw new Error(result.message||"We couldn’t save your request. Please try again.");
      setState("success");
    } catch(problem) { setState("error");setError(problem instanceof Error && problem.name!=="AbortError"?problem.message:"Your connection took too long. Your details are still here; please try again."); }
    finally {window.clearTimeout(timeout);busy.current=false;}
  }
  if(state==="success") return <div className="fr-form" role="status"><p className="fr-eyebrow">You’re on the list</p><h3>We’ll keep you in the loop.</h3><p className="fr-form-intro">Your request for the release announcement of <strong>A Heart for the Lost</strong> has been saved.</p><p>While you wait, keep growing with Faith Boost.</p><a className="fr-button fr-primary" href="/#faith-boost" style={{marginTop:24}}>Watch Faith Boost ↗</a></div>;
  return <form className="fr-form" onSubmit={submit} aria-labelledby="release-form-heading" aria-busy={state==="sending"}>
    <p className="fr-eyebrow">Be among the first to know</p><h3 id="release-form-heading">Get the release announcement.</h3><p className="fr-form-intro">Sign up for an email when <em style={{color:"inherit"}}>A Heart for the Lost</em> is available.</p>
    <p className="fr-honeypot" aria-hidden="true"><label>Leave empty<input name="bot-field" autoComplete="off" tabIndex={-1}/></label></p>
    <div className="fr-field"><label htmlFor="release-first-name">First name</label><input id="release-first-name" name="first-name" autoComplete="given-name" required maxLength={80}/></div>
    <div className="fr-field"><label htmlFor="release-email">Email address</label><input id="release-email" name="email" type="email" autoComplete="email" required maxLength={254}/></div>
    <p className="fr-form-note" id="release-consent">By signing up, you agree to receive email notifications about this book’s release. We won’t add you to unrelated mailing lists.</p>
    {state==="error" && <p className="fr-error" role="alert">{error}</p>}
    <button type="submit" className="fr-button fr-primary fr-submit" disabled={state==="sending"} aria-describedby="release-consent" style={{marginTop:20}}>{state==="sending"?"Saving your request…":"Get notified when it releases"}</button>
    <noscript><p>Please enable JavaScript to sign up, or email info@lockliel.com for help.</p></noscript>
  </form>;
}
