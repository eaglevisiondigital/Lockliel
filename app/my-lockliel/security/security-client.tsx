"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCopy,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import {useEffect,useMemo,useState} from "react";

type Factor={
  id:string;
  status:string;
  factorType:string;
  friendlyName?:string|null;
};

export default function SecurityClient(){
  const [data,setData]=useState<any>(null);
  const [account,setAccount]=useState<any>(null);
  const [enrollment,setEnrollment]=useState<any>(null);
  const [code,setCode]=useState("");
  const [recoveryCode,setRecoveryCode]=useState("");
  const [useRecovery,setUseRecovery]=useState(false);
  const [newRecoveryCodes,setNewRecoveryCodes]=useState<string[]|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [working,setWorking]=useState(false);
  const [newEmail,setNewEmail]=useState("");
  const [newPassword,setNewPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");

  const next=useMemo(()=>{
    if(typeof window==="undefined")return "/my-lockliel";
    const value=new URLSearchParams(window.location.search).get("next")||"/my-lockliel";
    return value.startsWith("/my-lockliel")?value:"/my-lockliel";
  },[]);

  async function load(){
    const [r,sr]=await Promise.all([
      fetch("/api/lockliel-auth/mfa",{cache:"no-store"}),
      fetch("/api/lockliel-auth/session",{cache:"no-store"})
    ]);
    const d=await r.json().catch(()=>({}));
    const sd=await sr.json().catch(()=>({}));

    if(r.status===401||sr.status===401){
      location.replace("/my-lockliel/sign-in");
      return;
    }
    if(!r.ok){
      setError(d.error||"Unable to load account security.");
      return;
    }

    setData(d);
    if(sr.ok)setAccount(sd);
  }

  useEffect(()=>{load();},[]);

  async function changeEmail(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setWorking(true);
    setError("");
    setMessage("");

    const r=await fetch("/api/lockliel-auth/account-security",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"changeEmail",email:newEmail})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(r.status===403&&d.code==="mfa_required"){
      setError(d.error||"Complete MFA before changing your sign-in email.");
      return;
    }
    if(!r.ok){
      setError(d.error||"Unable to request the email change.");
      return;
    }

    setNewEmail("");
    setMessage(d.message||"Email change requested. Check your email for confirmation.");
  }

  async function changePassword(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError("");
    setMessage("");

    if(newPassword!==confirmPassword){
      setError("The new passwords do not match.");
      return;
    }

    setWorking(true);
    const r=await fetch("/api/lockliel-auth/account-security",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"changePassword",password:newPassword})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(r.status===403&&d.code==="mfa_required"){
      setError(d.error||"Complete MFA before changing your password.");
      return;
    }
    if(!r.ok){
      setError(d.error||"Unable to update your password.");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMessage(d.message||"Password updated.");
  }

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

  async function verifyRecovery(){
    setWorking(true);
    setError("");
    setMessage("");

    const r=await fetch("/api/lockliel-auth/mfa",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"verifyRecoveryCode",code:recoveryCode})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(!r.ok){
      setError(d.error||"Recovery code was not accepted.");
      return;
    }

    setRecoveryCode("");
    setMessage("Recovery code accepted. Your current session is secured at AAL2.");
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

    setNewRecoveryCodes(null);
    setMessage("Authenticator removed and the current session was downgraded.");
    await load();
  }

  async function manageRecovery(action:"generateRecoveryCodes"|"regenerateRecoveryCodes"|"revokeRecoveryCodes"){
    if(action==="regenerateRecoveryCodes"&&!confirm("Rotate your recovery codes? Your old unused codes will stop working."))return;
    if(action==="revokeRecoveryCodes"&&!confirm("Revoke all recovery codes?"))return;

    setWorking(true);
    setError("");
    setMessage("");

    const r=await fetch("/api/lockliel-auth/mfa",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);

    if(!r.ok){
      setError(d.error||"Unable to update recovery codes.");
      return;
    }

    if(Array.isArray(d.recoveryCodes?.codes)){
      setNewRecoveryCodes(d.recoveryCodes.codes);
      setMessage("Save these recovery codes now. Lockliel cannot show them again after you leave this screen.");
    }else{
      setNewRecoveryCodes(null);
      setMessage("Recovery codes revoked.");
    }

    await load();
  }

  async function copyRecoveryCodes(){
    if(!newRecoveryCodes?.length)return;
    await navigator.clipboard.writeText(newRecoveryCodes.join("\n"));
    setMessage("Recovery codes copied. Store them somewhere secure and separate from your authenticator.");
  }

  if(!data)return <div className="ml-loading">Opening account security…</div>;

  const verified=(data.factors||[]).filter(
    (f:Factor)=>f.factorType==="totp"&&f.status==="verified"
  );
  const currentFactor=verified[0]||null;
  const needsChallenge=Boolean(currentFactor)&&data.aal!=="aal2";
  const sensitiveChangesAllowed=!currentFactor||data.aal==="aal2";
  const currentEmail=String(account?.user?.email||account?.profile?.email||"");

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
            ?"Your current session has completed password plus second-factor verification."
            : currentFactor
              ?"Complete your second factor to continue with protected Lockliel staff tools."
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

    <section className="ml-panel ml-security-account">
      <div>
        <div className="ml-kicker">Sign-in & password</div>
        <h2>Account credentials</h2>
        <p>Your sign-in email comes from Lockliel authentication. Profile contact details cannot override it.</p>
      </div>

      <div className="ml-security-credential-grid">
        <form onSubmit={changeEmail}>
          <label>
            Current sign-in email
            <input value={currentEmail} readOnly aria-readonly="true"/>
          </label>
          <label>
            New sign-in email
            <input
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={e=>setNewEmail(e.target.value)}
              placeholder="name@example.com"
              maxLength={254}
              required
            />
          </label>
          <button className="ml-action" disabled={working||!sensitiveChangesAllowed||!newEmail.trim()}>
            {working?"Saving…":"Request email change"}
          </button>
          <small>Lockliel will use the authentication confirmation process before the new email becomes active.</small>
        </form>

        <form onSubmit={changePassword}>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={e=>setNewPassword(e.target.value)}
              minLength={8}
              maxLength={128}
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e=>setConfirmPassword(e.target.value)}
              minLength={8}
              maxLength={128}
              required
            />
          </label>
          <button className="ml-action" disabled={working||!sensitiveChangesAllowed||newPassword.length<8||newPassword!==confirmPassword}>
            {working?"Saving…":"Change password"}
          </button>
          <small>Password changes are sent directly to Lockliel authentication and are never stored in the profile database.</small>
        </form>
      </div>

      {!sensitiveChangesAllowed&&<p className="ml-privacy-note">Complete the MFA challenge on this page before changing your sign-in email or password.</p>}
    </section>

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

      {qrSource&&<div className="ml-mfa-qr">
        <img src={qrSource} alt="Lockliel authenticator QR code"/>
      </div>}

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
      <h2>{useRecovery?"Use a recovery code":"Enter your authenticator code"}</h2>
      <p>
        {useRecovery
          ?"Use one of your unused single-use recovery codes. It will be consumed after successful verification."
          :"Your password was accepted. Complete the second factor to open protected Lockliel staff tools."}
      </p>

      {!useRecovery
        ? <div className="ml-mfa-code">
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
        : <div className="ml-mfa-code">
            <label>
              Recovery code
              <input
                value={recoveryCode}
                onChange={e=>setRecoveryCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                autoFocus
              />
            </label>
            <button className="ml-action" disabled={working||!recoveryCode.trim()} onClick={verifyRecovery}>
              {working?"Verifying…":"Use recovery code"}
            </button>
          </div>}

      {data.recoveryCodes?.enrolled&&<button
        className="ml-security-text-button"
        onClick={()=>setUseRecovery(v=>!v)}
      >{useRecovery?"Use authenticator instead":"I can’t access my authenticator"}</button>}
    </section>}

    {currentFactor&&data.aal==="aal2"&&<section className="ml-panel ml-mfa-managed">
      <div className="ml-icon"><CheckCircle2 size={20}/></div>
      <div>
        <h2>Authenticator active</h2>
        <p>{currentFactor.friendlyName||"Lockliel Authenticator"} protects this account. Privileged staff permissions now require an AAL2 session.</p>
      </div>
      <button disabled={working} onClick={()=>remove(currentFactor.id)}>Remove authenticator</button>
    </section>}

    {currentFactor&&data.aal==="aal2"&&<section className="ml-panel ml-recovery-codes">
      <div className="ml-recovery-head">
        <div>
          <div className="ml-kicker">Recovery</div>
          <h2>Recovery codes</h2>
          <p>Single-use recovery codes give you an emergency way to reach AAL2 if your authenticator device is unavailable.</p>
        </div>
        <KeyRound size={24}/>
      </div>

      {newRecoveryCodes?.length
        ? <div className="ml-recovery-once">
            <div className="ml-admin-notice">
              <ShieldCheck size={16}/>
              <span>These codes are shown only now. Save them before leaving this page.</span>
            </div>
            <div className="ml-recovery-code-grid">
              {newRecoveryCodes.map((item,index)=><code key={index}>{item}</code>)}
            </div>
            <button className="ml-action" onClick={copyRecoveryCodes}><ClipboardCopy size={15}/> Copy all codes</button>
          </div>
        : data.recoveryCodes?.enrolled
          ? <div className="ml-recovery-existing">
              <div><b>{data.recoveryCodes.remaining}</b><span>of {data.recoveryCodes.total} unused codes remain</span></div>
              <div className="ml-share-actions">
                <button disabled={working} onClick={()=>manageRecovery("regenerateRecoveryCodes")}><RefreshCw size={14}/> Rotate codes</button>
                <button disabled={working} onClick={()=>manageRecovery("revokeRecoveryCodes")}>Revoke codes</button>
              </div>
            </div>
          : <div className="ml-recovery-existing">
              <p>No recovery codes are enrolled.</p>
              <button className="ml-action" disabled={working} onClick={()=>manageRecovery("generateRecoveryCodes")}>Generate recovery codes</button>
            </div>}
    </section>}

    <section className="ml-security-note">
      <KeyRound size={17}/>
      <p>MFA protects account access. Lockliel still applies database permissions separately, so a second factor never gives someone a role they were not assigned.</p>
    </section>

    <Link className="ml-security-back" href={next}>Return to My Lockliel →</Link>
  </section>;
}
