import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import NotificationsClient from "./notifications-client";
import "../my-lockliel.css";

export const metadata={title:"Notifications | My Lockliel"};

export default function NotificationsPage(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel" className="ml-auth-home"><ArrowLeft size={16}/> My Lockliel</Link>
    <section className="ml-panel">
      <div className="ml-kicker">My Lockliel</div>
      <h1 style={{fontSize:"clamp(36px,5vw,60px)",margin:"10px 0"}}>Notifications</h1>
      <p>Important connection, resource, group, and follow-up updates appear here.</p>
    </section>
    <h2 className="ml-section-title">Recent activity</h2>
    <NotificationsClient/>
  </div></main>;
}