"use client";
import {useEffect,useMemo,useState} from "react";
import {CheckCircle2,PackageCheck,Truck} from "lucide-react";

function money(cents:number){return "$"+(Number(cents||0)/100).toFixed(2);}

export default function OrdersAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [filter,setFilter]=useState("open");

  async function load(){
    const r=await fetch("/api/lockliel/admin/orders",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function update(orderId:string,eventType:string,carrier:string,trackingNumber:string,note:string){
    setWorking(orderId);setMessage("");
    const r=await fetch("/api/lockliel/admin/orders",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({orderId,eventType,carrier,trackingNumber,note})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);
    if(!r.ok){setMessage(d.error||"Unable to save fulfillment update.");return;}
    setMessage("Fulfillment update saved.");
    await load();
  }

  const orders=useMemo(()=>{
    const all=data?.orders||[];
    if(filter==="all")return all;
    if(filter==="fulfilled")return all.filter((o:any)=>o.status==="fulfilled");
    return all.filter((o:any)=>!["fulfilled","cancelled","refunded"].includes(o.status));
  },[data,filter]);

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading order fulfillment…</div>;

  return <section className="ml-panel ml-orders-admin">
    <div className="ml-system-head">
      <div><div className="ml-kicker">Order fulfillment</div><h2>Books, resources and shipping</h2></div>
      <PackageCheck size={27}/>
    </div>
    <p className="ml-privacy-note">Fulfillment staff can see only the order and shipping information needed to complete delivery. This role does not grant finance or discipleship access.</p>

    <div className="ml-order-filter">
      <button className={filter==="open"?"active":""} onClick={()=>setFilter("open")}>Open</button>
      <button className={filter==="fulfilled"?"active":""} onClick={()=>setFilter("fulfilled")}>Fulfilled</button>
      <button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>All</button>
    </div>

    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-order-admin-list">
      {orders.map((order:any)=><OrderCard key={order.id} order={order} canFulfill={data.canFulfill} working={working===order.id} onUpdate={update}/>)}
      {!orders.length&&<div className="ml-empty-ops"><CheckCircle2 size={22}/><div><b>No orders in this view.</b><span>New paid physical orders will appear here automatically when checkout is connected.</span></div></div>}
    </div>
  </section>;
}

function OrderCard({order,canFulfill,working,onUpdate}:{order:any;canFulfill:boolean;working:boolean;onUpdate:(id:string,event:string,carrier:string,tracking:string,note:string)=>void}){
  const latest=order.events?.[order.events.length-1];
  const [eventType,setEventType]=useState("processing");
  const [carrier,setCarrier]=useState(latest?.carrier||"");
  const [tracking,setTracking]=useState(latest?.tracking_number||"");
  const [note,setNote]=useState("");

  return <article className="ml-order-admin-card">
    <div className="ml-order-admin-head">
      <div>
        <b>{order.customer_name||order.shippingAddress?.recipient_name||order.customer_email||"Order"}</b>
        <span>{order.customer_email||""}{order.created_at?" • "+new Date(order.created_at).toLocaleDateString():""}</span>
      </div>
      <div><strong>{money(order.total_cents)}</strong><span>{order.status.replaceAll("_"," ")}</span></div>
    </div>

    <div className="ml-order-items">
      {(order.items||[]).map((item:any)=><span key={item.id}>{item.quantity} × {item.product?.title||"Product"}</span>)}
    </div>

    {order.shippingAddress&&<div className="ml-order-address">
      <Truck size={14}/>
      <span>{order.shippingAddress.recipient_name} • {order.shippingAddress.line1}{order.shippingAddress.line2?" "+order.shippingAddress.line2:""} • {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postal_code} • {order.shippingAddress.country}</span>
    </div>}

    {order.events?.length>0&&<div className="ml-order-events">
      {order.events.slice(-4).map((event:any)=><span key={event.id}>{event.event_type.replaceAll("_"," ")}{event.tracking_number?" • "+event.tracking_number:""} • {new Date(event.created_at).toLocaleDateString()}</span>)}
    </div>}

    {canFulfill&&order.status!=="fulfilled"&&<div className="ml-order-update">
      <select value={eventType} onChange={e=>setEventType(e.target.value)}>
        <option value="processing">Processing</option>
        <option value="packed">Packed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="fulfilled">Fulfilled</option>
        <option value="note">Note only</option>
      </select>
      <input value={carrier} onChange={e=>setCarrier(e.target.value)} placeholder="Carrier"/>
      <input value={tracking} onChange={e=>setTracking(e.target.value)} placeholder="Tracking number"/>
      <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Internal fulfillment note"/>
      <button disabled={working} onClick={()=>onUpdate(order.id,eventType,carrier,tracking,note)}>Save update</button>
    </div>}
  </article>;
}
