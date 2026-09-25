import Link from "next/link";
import {ArrowLeft,PackageCheck} from "lucide-react";
import OrdersAdminClient from "../admin/orders-admin-client";
import "../my-lockliel.css";

export const metadata={title:"Fulfillment Tools | My Lockliel"};

export default function FulfillmentPage(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel" className="ml-auth-home"><ArrowLeft size={16}/> My Lockliel</Link>
    <section className="ml-panel">
      <div className="ml-icon"><PackageCheck size={21}/></div>
      <div className="ml-kicker" style={{marginTop:16}}>Fulfillment Tools</div>
      <h1 style={{fontSize:"clamp(36px,5vw,60px)",margin:"10px 0"}}>Complete the order. Serve the person well.</h1>
      <p>This workspace is limited to order and shipping information needed for fulfillment. It does not expose giving history, discipleship records, or private ministry notes.</p>
    </section>
    <h2 className="ml-section-title">Order queue</h2>
    <OrdersAdminClient/>
  </div></main>;
}
