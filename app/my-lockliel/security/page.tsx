import Link from "next/link";
import {ArrowLeft,ShieldCheck} from "lucide-react";
import SecurityClient from "./security-client";
import "../my-lockliel.css";

export const metadata={title:"Account Security | My Lockliel"};

export default function SecurityPage(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel/profile" className="ml-auth-home"><ArrowLeft size={16}/> My profile</Link>
    <section className="ml-panel">
      <div className="ml-icon"><ShieldCheck size={21}/></div>
      <div className="ml-kicker" style={{marginTop:16}}>My Lockliel Security</div>
      <h1 style={{fontSize:"clamp(36px,5vw,60px)",margin:"10px 0"}}>Protect your account.</h1>
      <p>Manage your sign-in email and password here, and use an authenticator app for stronger protection. Privileged Lockliel staff access is designed to require this second factor.</p>
    </section>
    <h2 className="ml-section-title">Multi-factor authentication</h2>
    <SecurityClient/>
  </div></main>;
}
