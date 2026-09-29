"use client";
import {useEffect,useState} from "react";
import {CheckCircle2,Package,Truck} from "lucide-react";

function money(cents:number){return "$"+(Number(cents||0)/100).toFixed(2);}

export default function OrdersClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/lockliel/orders",{cache:"no-store"}).then(async r=>{
      if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
      const d=await r.json().catch(()=>({}));
      if(!r.ok){setError(d.error||"Unable to load orders.");return;}
      setData(d);
    });
  },[]);

  if(error)return <p className="ml-auth-message error">{error}</p>;
  if(!data)return <div className="ml-loading">Loading your orders…</div>;

  if(!data.orders.length)return <section className="ml-card"><Package size={22}/><h2>No orders yet.</h2><p>Your future digital and physical Lockliel orders will appear here after purchase.</p></section>;

  return <section className="ml-member-orders">
    {data.orders.map((order:any)=><article className="ml-panel" key={order.id}>
      <div className="ml-member-order-head">
        <div><div className="ml-kicker">Order</div><h2>{new Date(order.created_at).toLocaleDateString()}</h2></div>
        <div><strong>{money(order.total_cents)}</strong><span>{order.status.replaceAll("_"," ")}</span></div>
      </div>

      <div className="ml-order-items">
        {(order.items||[]).map((item:any)=><span key={item.id}>{item.quantity} × {item.product?.title||"Product"}</span>)}
      </div>

      <div className="ml-member-order-timeline">
        {(order.events||[]).map((event:any)=><div key={event.id}>
          <div className="ml-order-event-icon">{["shipped","delivered","fulfilled"].includes(event.event_type)?<Truck size={14}/>:<CheckCircle2 size={14}/>}</div>
          <div><b>{event.event_type.replaceAll("_"," ")}</b><span>{event.note||""}{event.tracking_number?" • Tracking "+event.tracking_number:""}</span></div>
          <small>{new Date(event.created_at).toLocaleDateString()}</small>
        </div>)}
        {!order.events?.length&&<p className="ml-privacy-note">No fulfillment updates yet.</p>}
      </div>
    </article>)}
  </section>;
}
