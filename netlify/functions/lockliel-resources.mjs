import {SUPABASE_URL,SUPABASE_KEY,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
function safeName(value){return String(value||"resource.pdf").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"")||"resource.pdf";}
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 if(request.method==="GET"){
   const er=await fetch(SUPABASE_URL+"/rest/v1/entitlements?profile_id=eq."+uid+"&select=id,product_id,reason,granted_at&order=granted_at.desc",{headers:h});
   const ents=er.ok?await er.json():[],productIds=[...new Set(ents.map(e=>e.product_id).filter(Boolean))];
   let products=[];if(productIds.length){const pr=await fetch(SUPABASE_URL+"/rest/v1/products?id=in.("+productIds.join(",")+")&select=id,slug,title,product_type,status,storage_path,description",{headers:h});products=pr.ok?await pr.json():[];}
   const map=Object.fromEntries(products.map(p=>[p.id,p]));
   const ordersRes=await fetch(SUPABASE_URL+"/rest/v1/orders?profile_id=eq."+uid+"&select=id,status,currency,subtotal_cents,shipping_cents,tax_cents,total_cents,delivery_method,created_at,paid_at,fulfilled_at&order=created_at.desc&limit=50",{headers:h});
   const orders=ordersRes.ok?await ordersRes.json():[];
   const orderIds=orders.map(o=>o.id);
   let orderItems=[];
   if(orderIds.length){
     const ir=await fetch(SUPABASE_URL+"/rest/v1/order_items?order_id=in.("+orderIds.join(",")+")&select=id,order_id,product_id,quantity,unit_price_cents",{headers:h});
     orderItems=ir.ok?await ir.json():[];
   }
   const orderProductIds=[...new Set(orderItems.map(i=>i.product_id).filter(Boolean))];
   let orderProducts=[];
   if(orderProductIds.length){
     const opr=await fetch(SUPABASE_URL+"/rest/v1/products?id=in.("+orderProductIds.join(",")+")&select=id,slug,title,product_type",{headers:h});
     orderProducts=opr.ok?await opr.json():[];
   }
   const orderProductMap=Object.fromEntries(orderProducts.map(p=>[p.id,p]));
   return json({
     resources:ents.map(e=>({...e,product:map[e.product_id]||null})).filter(x=>x.product),
     orders:orders.map(o=>({...o,items:orderItems.filter(i=>i.order_id===o.id).map(i=>({...i,product:orderProductMap[i.product_id]||null}))}))
   },200,s.refreshed?sessionCookies(s.refreshed):[]);
 }
 if(request.method==="POST"){
   const b=await request.json().catch(()=>({})),productId=String(b.productId||"");
   if(!productId)return json({error:"Resource required"},400);
   const er=await fetch(SUPABASE_URL+"/rest/v1/entitlements?profile_id=eq."+uid+"&product_id=eq."+encodeURIComponent(productId)+"&select=id&limit=1",{headers:h});
   const ents=er.ok?await er.json():[];if(!ents.length)return json({error:"You do not have access to this resource."},403);
   const pr=await fetch(SUPABASE_URL+"/rest/v1/products?id=eq."+encodeURIComponent(productId)+"&select=title,storage_path&limit=1",{headers:h});
   const products=pr.ok?await pr.json():[],product=products?.[0];if(!product?.storage_path)return json({error:"This resource is not ready for download yet."},404);
   const storageUrl=SUPABASE_URL+"/storage/v1/object/authenticated/member-resources/"+product.storage_path.split("/").map(encodeURIComponent).join("/");
   const file=await fetch(storageUrl,{headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+s.access}});
   if(!file.ok)return json({error:file.status===404?"This resource is not available yet.":"We couldn't open this resource."},file.status===404?404:502);
   const headers=new Headers({"Content-Type":file.headers.get("content-type")||"application/pdf","Content-Disposition":'inline; filename="'+safeName(product.title)+'.pdf"',"Cache-Control":"private, no-store"});
   return new Response(file.body,{status:200,headers});
 }
 return json({error:"Method not allowed"},405);
};
export const config={path:"/api/lockliel/resources"};