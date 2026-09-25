"use client";

import Link from "next/link";
import {CheckCircle2,KeyRound,LockKeyhole,ShieldCheck,Smartphone} from "lucide-react";
import {useEffect,useMemo,useState} from "react";

type Factor={
  id:string;
  status:string;
  factorType:string;
  friendlyName?:string|null;
};

export default function SecurityClient(){
  const [data,setData]=useState<any>(null);
  const [enrollment,setEnrollment]=useState<any>(null);
  const [code,setCode]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [working,setWorking]=useState(false);

  const next=useMemo(()=>{
    if(typeof window==="undefined")return "/my-lockliel";
    const value=new URLSearchParams(window.location.search).get("next")||"/my-lockliel";
    return value.startsWith("/my-lockliel")?value:"/my-lockliel";
  },[]);

  async function load(){
    const r=await fetch("/api/lockliel-auth/mfa",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===401){location.replace("/my-lockliel/sign-in");return;}
    if(!r.ok){setError(d.error||"Unable to load account security.");return;}
    setData(d);
  }

  useEffect(()=>{load();},[]);

  async function enroll(){
    setWorking(true);
    setError("");
    setMessage("");

    const r=await fetch("/api/lockliel-auth/mfa",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"enroll"})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(!r.ok){
      setError(d.error||"Unable to start authenticator setup.");
      return;
    }

    setEnrollment(d.factor);
    setCode("");
  }

  async function verify(factorId:string){
    setWorking(true);
    setError("");
    setMessage("");

    const r=await fetch("/api/lockliel-auth/mfa",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"verify",factorId,code})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(!r.ok){
      setError(d.error||"Authenticator code was not accepted.");
      return;
    }

    setEnrollment(null);
    setCode("");
    setMessage("Authenticator verified. Your current session is secured with MFA.");
    await load();

    const params=new URLSearchParams(window.location.search);
    if(params.get("next")){
      window.setTimeout(()=>location.replace(next),500);
    }
  }

  async function remove(factorId:string){
    if(!confirm("Remove this authenticator from your Lockliel account?"))return;

    setWorking(true);
    setError("");
    const r=await fetch("/api/lockliel-auth/mfa",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"unenroll",factorId})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(!r.ok){
      setError(d.error||"Unable to remove authenticator.");
      return;
    }

    setMessage("Authenticator removed.");
    await load();
  }

  if(!data)return <div className="ml-loading">Opening account security…</div>;

  const verified=(data.factors||[]).filter((f:Factor)=>f.factorType==="totp"&&f.status==="verified");
  const currentFactor=verified[0]||null;
  const needsChallenge=Boolean(currentFactor)&&data.aal!=="aal2";

  const qrSource=enrollment?.qrCode
    ? String(enrollment.qrCode).startsWith("data:")
      ? enrollment.qrCode
      : String(enrollment.qrCode).trim().startsWith("<svg")
        ? "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(enrollment.qrCode)
        : enrollment.qrCode
    : "";

  return <section className="ml-security-center">
    <section className="ml-panel ml-security-status">
      <div className="ml-icon"><ShieldCheck size={21}/></div>
      <div>
        <div className="ml-kicker">Account security</div>
        <h2>{data.aal==="aal2"?"MFA verified for this session":currentFactor?"MFA challenge required":"Authenticator MFA is not enrolled"}</h2>
        <p>
          {data.aal==="aal2"
            ?"Your current session has completed password plus authenticator verification."
            :currentFactor
              ?"Enter a fresh code from your authenticator app to continue with protected staff tools."
              :"Add an authenticator app to protect your Lockliel account with a second factor."}
        </p>
      </div>
      <div className={data.aal==="aal2"?"ml-security-aal secure":"ml-security-aal"}>
        <LockKeyhole size={15}/>
        <span>{String(data.aal||"aal1").toUpperCase()}</span>
      </div>
    </section>

    {message&&<p className="ml-share-message">{message}</p>}
    {error&&<p className="ml-auth-message error">{error}</p>}

    {!currentFactor&&!enrollment&&<section className="ml-panel ml-security-enroll">
      <Smartphone size={28}/>
      <div>
        <h2>Set up an authenticator app</h2>
        <p>Use Google Authenticator, Microsoft Authenticator, 1Password, Authy, or another TOTP-compatible app.</p>
      </div>
      <button className="ml-action" disabled={working} onClick={enroll}>
        {working?"Starting…":"Set up authenticator"}
      </button>
    </section>}

    {enrollment&&<section className="ml-panel ml-mfa-setup">
      <div className="ml-kicker">Step 1</div>
      <h2>Scan this QR code</h2>
      <p>Open your authenticator app and add a new account. Scan the QR code below, then enter the code it generates.</p>

      {qrSource&&<div className="ml-mfa-qr"><img src={qrSource} alt="Lockliel authenticator QR code"/></div>}

      {enrollment.secret&&<details className="ml-mfa-secret">
        <summary>Can’t scan the QR code?</summary>
        <p>Enter this setup key manually in your authenticator app:</p>
        <code>{enrollment.secret}</code>
      </details>}

      <div className="ml-mfa-code">
        <label>
          Authenticator code
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,8))}
            placeholder="000000"
          />
        </label>
        <button className="ml-action" disabled={working||code.length<6} onClick={()=>verify(enrollment.id)}>
          {working?"Verifying…":"Verify and enable MFA"}
        </button>
      </div>
    </section>}

    {currentFactor&&needsChallenge&&<section className="ml-panel ml-mfa-setup">
      <div className="ml-kicker">MFA challenge</div>
      <h2>Enter your authenticator code</h2>
      <p>Your password was accepted. Complete the second factor to open protected Lockliel staff tools.</p>
      <div className="ml-mfa-code">
        <label>
          Authenticator code
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,8))}
            placeholder="000000"
            autoFocus
          />
        </label>
        <button className="ml-action" disabled={working||code.length<6} onClick={()=>verify(currentFactor.id)}>
          {working?"Verifying…":"Verify code"}
        </button>
      </div>
    </section>}

    {currentFactor&&data.aal==="aal2"&&<section className="ml-panel ml-mfa-managed">
      <div className="ml-icon"><CheckCircle2 size={20}/></div>
      <div>
        <h2>Authenticator active</h2>
        <p>{currentFactor.friendlyName||"Lockliel Authenticator"} protects this account. Staff access can now require MFA for every sensitive session.</p>
      </div>
      <button disabled={working} onClick={()=>remove(currentFactor.id)}>Remove authenticator</button>
    </section>}

    <section className="ml-security-note">
      <KeyRound size={17}/>
      <p>MFA protects account access. Lockliel still applies database permissions separately, so a second factor never gives someone a role they were not assigned.</p>
    </section>

    <Link className="ml-security-back" href={next}>Return to My Lockliel →</Link>
  </section>;
}
