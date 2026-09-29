import Link from "next/link";
import {ArrowLeft,ShieldCheck} from "lucide-react";
import LeaderToolsClient from "./leader-tools-client";
import "../my-lockliel.css";

export const metadata={title:"Leader Tools | My Lockliel"};

export default function LeaderToolsPage(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel" className="ml-auth-home"><ArrowLeft size={16}/> My Lockliel</Link>
    <section className="ml-panel">
      <div className="ml-icon"><ShieldCheck size={21}/></div>
      <div className="ml-kicker" style={{marginTop:16}}>Leader Tools</div>
      <h1 style={{fontSize:"clamp(36px,5vw,60px)",margin:"10px 0"}}>Love people. Help them move forward.</h1>
      <p>See only the ministry relationships you are responsible for, follow up intentionally, and keep private member information protected.</p>
    </section>
    <h2 className="ml-section-title">Your ministry connections</h2>
    <LeaderToolsClient/>
  </div></main>;
}
