"use client";
import {useState} from "react";
export default function ForgotPasswordForm(){
 const [status,setStatus]=useState<"idle"|"sending"|"sent"|"error">("idle"),[message,setMessage]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setStatus("sending");setMessage("");const f=new FormData(e.currentTarget);const r=await fetch("/api/lockliel-auth/recover",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:f.get("email")})});const d=await r.json().catch(()=>({}));if(!r.ok){setStatus("error");setMessage(d.error||"Unable to send reset email.");return;}setStatus("sent");setMessage(d.message||"Check your email for a reset link.");}
 return <form className="ml-auth-card" onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>{message&&<p className={status==="error"?"ml-auth-message error":"ml-auth-message"}>{message}</p>}{status!=="sent"&&<button className="ml-action" disabled={status==="sending"}>{status==="sending"?"Sending…":"Send reset link"}</button>}</form>;
}