"use client";
import {useEffect,useState} from "react";
import {BookOpen,FileText,LockKeyhole,PackageCheck,Truck} from "lucide-react";

export default function ResourcesClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/lockliel/resources",{cache:"no-store"}).then(async r=>{
      if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
      const d=await r.json();
      if(!r.ok){setError(d.error||"Unable to load resources.");return;}
      setData(d);
    });
  },[]);

  async function openResource(productId:string){
    const r=await fetch("/api/lockliel/resources",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({productId})
    });
    if(!r.ok){
      const d=await r.json().catch(()=>({}));
      setError(d.error||"Unable to open resource.");
      return;
    }
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    window.open(url,"_blank","noopener,noreferrer");
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }

  if(error)return <p className="ml-auth-message error">{error}</p>;
  if(!data)return <div className="ml-loading">Loading your resources…</div>;

  const hasResources=data.resources?.length>0;
  const hasOrders=data.orders?.length>0;

  return <>
    {hasResources
      ? <section className="ml-grid">
          {data.resources.map((r:any)=><article className="ml-card" key={r.id}>
            <div className="ml-icon">{r.product.product_type==="digital_book"?<BookOpen size={21}/>:<FileText size={21}/>}</div>
            <div className="ml-kicker">{r.product.product_type.replaceAll("_"," ")}</div>
            <h2>{r.product.title}</h2>
            <p>{r.product.description||"Your Lockliel resource."}</p>
            <small className="ml-resource-grant">Added {new Date(r.granted_at).toLocaleDateString()}</small>
            {r.deliveryAvailable
              ? <button className="ml-action" onClick={()=>openResource(r.product.id)}>Open resource</button>
              : <div className="ml-resource-pending"><LockKeyhole size={14}/> Not released yet</div>}
          </article>)}
        </section>
      : <section className="ml-card">
          <div className="ml-icon"><LockKeyhole size={21}/></div>
          <h2>Your resource library is ready.</h2>
          <p>Digital books and resources you purchase or receive will appear here automatically. A Heart for the Lost is being prepared for its digital release.</p>
        </section>}

    <h2 className="ml-section-title">Physical orders</h2>
    {hasOrders
      ? <section className="ml-order-list">
          {data.orders.map((order:any)=><article className="ml-panel ml-member-order" key={order.id}>
            <div className="ml-order-head">
              <div className="ml-icon">{order.status==="fulfilled"?<PackageCheck size={20}/>:<Truck size={20}/>}</div>
              <div><div className="ml-kicker">Order {order.id.slice(0,8)}</div><h3>{order.items.map((i:any)=>i.product?.title||"Lockliel resource").join(", ")}</h3></div>
              <span className={"ml-order-status "+order.status}>{order.status.replaceAll("_"," ")}</span>
            </div>
            <div className="ml-order-meta">
              <span>Placed {new Date(order.created_at).toLocaleDateString()}</span>
              <span>{"$"+(Number(order.total_cents||0)/100).toFixed(2)}</span>
              {order.fulfilled_at&&<span>Fulfilled {new Date(order.fulfilled_at).toLocaleDateString()}</span>}
            </div>
          </article>)}
        </section>
      : <section className="ml-card"><div className="ml-icon"><Truck size={21}/></div><h2>No physical orders yet.</h2><p>When printed books and physical resources become available, your order and fulfillment status will appear here.</p></section>}
  </>;
}