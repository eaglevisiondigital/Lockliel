import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

function inFilter(ids){return "in.("+ids.join(",")+")";}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  const canRead=roles.some(r=>["super_admin","admin","finance_admin","fulfillment_admin"].includes(r));
  const canFulfill=roles.some(r=>["super_admin","admin","fulfillment_admin"].includes(r));
  if(!canRead)return json({error:"Order access required"},403);

  if(request.method==="POST"){
    if(!canFulfill)return json({error:"Fulfillment access required"},403);

    const b=await request.json().catch(()=>({}));
    const orderId=String(b.orderId||"");
    const eventType=String(b.eventType||"");
    const allowed=["processing","packed","shipped","delivered","fulfilled","note"];

    if(!orderId||!allowed.includes(eventType)){
      return json({error:"Choose an order and valid fulfillment event."},400);
    }

    const r=await fetch(SUPABASE_URL+"/rest/v1/order_fulfillment_events",{
      method:"POST",
      headers:{...h,Prefer:"return=representation"},
      body:JSON.stringify({
        order_id:orderId,
        actor_profile_id:s.user.id,
        event_type:eventType,
        carrier:String(b.carrier||"").trim().slice(0,120)||null,
        tracking_number:String(b.trackingNumber||"").trim().slice(0,240)||null,
        note:String(b.note||"").trim().slice(0,2000)||null
      })
    });
    if(!r.ok)return json({error:"Unable to save fulfillment update."},r.status);

    return json({ok:true,event:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const or=await fetch(
    SUPABASE_URL+"/rest/v1/orders?select=id,profile_id,customer_name,customer_email,provider,status,currency,subtotal_cents,shipping_cents,tax_cents,total_cents,delivery_method,created_at,paid_at,fulfilled_at&order=created_at.desc&limit=500",
    {headers:h}
  );
  const orders=or.ok?await or.json():[];
  const orderIds=orders.map(o=>o.id);

  let items=[],addresses=[],events=[];
  if(orderIds.length){
    const filter=encodeURIComponent(inFilter(orderIds));
    const [ir,ar,er]=await Promise.all([
      fetch(SUPABASE_URL+"/rest/v1/order_items?order_id="+filter+"&select=id,order_id,product_id,quantity,unit_price_cents",{headers:h}),
      fetch(SUPABASE_URL+"/rest/v1/order_shipping_addresses?order_id="+filter+"&select=order_id,recipient_name,line1,line2,city,region,postal_code,country",{headers:h}),
      fetch(SUPABASE_URL+"/rest/v1/order_fulfillment_events?order_id="+filter+"&select=id,order_id,event_type,carrier,tracking_number,note,created_at&order=created_at.asc",{headers:h})
    ]);
    items=ir.ok?await ir.json():[];
    addresses=ar.ok?await ar.json():[];
    events=er.ok?await er.json():[];
  }

  const productIds=[...new Set(items.map(i=>i.product_id))];
  let products=[];
  if(productIds.length){
    const pr=await fetch(
      SUPABASE_URL+"/rest/v1/products?id="+encodeURIComponent(inFilter(productIds))+"&select=id,title,slug,product_type",
      {headers:h}
    );
    products=pr.ok?await pr.json():[];
  }
  const productMap=Object.fromEntries(products.map(p=>[p.id,p]));
  const addressMap=Object.fromEntries(addresses.map(a=>[a.order_id,a]));

  return json({
    roles,
    canFulfill,
    orders:orders.map(order=>({
      ...order,
      items:items.filter(i=>i.order_id===order.id).map(i=>({...i,product:productMap[i.product_id]||null})),
      shippingAddress:addressMap[order.id]||null,
      events:events.filter(e=>e.order_id===order.id)
    }))
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/orders"};