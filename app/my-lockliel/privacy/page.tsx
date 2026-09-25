import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import PrivacyClient from "./privacy-client";
import "../my-lockliel.css";

export const metadata={title:"Privacy | My Lockliel"};

export default function PrivacyPage(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel/profile" className="ml-auth-home"><ArrowLeft size={16}/> My profile</Link>
    <section className="ml-panel">
      <div className="ml-kicker">My Lockliel privacy</div>
      <h1 style={{fontSize:"clamp(36px,5vw,60px)",margin:"10px 0"}}>Your information. Your choices.</h1>
      <p>Manage data-access and account-deletion requests without exposing those requests to ordinary leaders, inviters, or group members.</p>
    </section>
    <h2 className="ml-section-title">Privacy controls</h2>
    <PrivacyClient/>
  </div></main>;
}
