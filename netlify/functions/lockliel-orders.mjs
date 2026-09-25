import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

function inFilter(ids){return "in.("+ids.join(",")+")";}

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const or=await fetch(
    SUPABASE_URL+"/rest/v1/orders?profile_id=eq."+uid+"&select=id,status,currency,subtotal_cents,shipping_cents,tax_cents,total_cents,delivery_method,created_at,paid_at,fulfilled_at&order=created_at.desc&limit=100",
    {headers:h}
  );
  const orders=or.ok?await or.json():[];
  const ids=orders.map(o=>o.id);

  let items=[],events=[];
  if(ids.length){
    const filter=encodeURIComponent(inFilter(ids));
    const [ir,er]=await Promise.all([
      fetch(SUPABASE_URL+"/rest/v1/order_items?order_id="+filter+"&select=id,order_id,product_id,quantity,unit_price_cents",{headers:h}),
      fetch(SUPABASE_URL+"/rest/v1/order_fulfillment_events?order_id="+filter+"&select=id,order_id,event_type,carrier,tracking_number,note,created_at&order=created_at.asc",{headers:h})
    ]);
    items=ir.ok?await ir.json():[];
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

  return json({
    orders:orders.map(order=>({
      ...order,
      items:items.filter(i=>i.order_id===order.id).map(i=>({...i,product:productMap[i.product_id]||null})),
      events:events.filter(e=>e.order_id===order.id)
    }))
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/orders"};