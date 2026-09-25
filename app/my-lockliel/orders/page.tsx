import Link from "next/link";
import {ArrowLeft,Package} from "lucide-react";
import OrdersClient from "./orders-client";
import "../my-lockliel.css";

export const metadata={title:"My Orders | My Lockliel"};

export default function OrdersPage(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel/resources" className="ml-auth-home"><ArrowLeft size={16}/> Books & Resources</Link>
    <section className="ml-panel">
      <div className="ml-icon"><Package size={21}/></div>
      <div className="ml-kicker" style={{marginTop:16}}>My Orders</div>
      <h1 style={{fontSize:"clamp(36px,5vw,60px)",margin:"10px 0"}}>Digital and physical orders in one place.</h1>
      <p>Track purchased resources and future physical book fulfillment from your My Lockliel account.</p>
    </section>
    <h2 className="ml-section-title">Order history</h2>
    <OrdersClient/>
  </div></main>;
}
