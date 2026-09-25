import {
  SUPABASE_URL,
  SUPABASE_KEY,
  json,
  dbHeaders,
  requireSession,
  sessionCookies
} from "../lib/lockliel-core.mjs";

function safeName(value){
  return String(value||"resource.pdf")
    .replace(/[^a-zA-Z0-9._-]+/g,"-")
    .replace(/^-+|-+$/g,"")||"resource.pdf";
}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const flagRes=await fetch(
    SUPABASE_URL+"/rest/v1/feature_flags?key=eq.digital_book_delivery&select=enabled&limit=1",
    {headers:h}
  );
  const flagRows=flagRes.ok?await flagRes.json():[];
  const digitalBookDelivery=Boolean(flagRows?.[0]?.enabled);

  if(request.method==="GET"){
    const er=await fetch(
      SUPABASE_URL+"/rest/v1/entitlements?profile_id=eq."+uid+"&select=id,product_id,reason,granted_at&order=granted_at.desc",
      {headers:h}
    );
    const entitlements=er.ok?await er.json():[];
    const productIds=[...new Set(entitlements.map(e=>e.product_id).filter(Boolean))];

    let products=[];
    if(productIds.length){
      const pr=await fetch(
        SUPABASE_URL+"/rest/v1/products?id=in.("+productIds.join(",")+")&select=id,slug,title,product_type,status,storage_path,description",
        {headers:h}
      );
      products=pr.ok?await pr.json():[];
    }

    const productMap=Object.fromEntries(products.map(p=>[p.id,p]));

    const ordersRes=await fetch(
      SUPABASE_URL+"/rest/v1/orders?profile_id=eq."+uid+"&select=id,status,currency,subtotal_cents,shipping_cents,tax_cents,total_cents,delivery_method,created_at,paid_at,fulfilled_at&order=created_at.desc&limit=50",
      {headers:h}
    );
    const orders=ordersRes.ok?await ordersRes.json():[];
    const orderIds=orders.map(o=>o.id);

    let orderItems=[];
    if(orderIds.length){
      const ir=await fetch(
        SUPABASE_URL+"/rest/v1/order_items?order_id=in.("+orderIds.join(",")+")&select=id,order_id,product_id,quantity,unit_price_cents",
        {headers:h}
      );
      orderItems=ir.ok?await ir.json():[];
    }

    const orderProductIds=[...new Set(orderItems.map(i=>i.product_id).filter(Boolean))];
    let orderProducts=[];
    if(orderProductIds.length){
      const opr=await fetch(
        SUPABASE_URL+"/rest/v1/products?id=in.("+orderProductIds.join(",")+")&select=id,slug,title,product_type",
        {headers:h}
      );
      orderProducts=opr.ok?await opr.json():[];
    }
    const orderProductMap=Object.fromEntries(orderProducts.map(p=>[p.id,p]));

    return json({
      digitalBookDelivery,
      resources:entitlements
        .map(entitlement=>{
          const product=productMap[entitlement.product_id]||null;
          if(!product)return null;

          const deliveryAvailable=
            Boolean(product.storage_path) &&
            product.status==="active" &&
            (
              product.product_type!=="digital_book" ||
              digitalBookDelivery
            );

          return {
            ...entitlement,
            product,
            deliveryAvailable
          };
        })
        .filter(Boolean),
      orders:orders.map(order=>({
        ...order,
        items:orderItems
          .filter(item=>item.order_id===order.id)
          .map(item=>({...item,product:orderProductMap[item.product_id]||null}))
      }))
    },200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const productId=String(b.productId||"");
    if(!productId)return json({error:"Resource required"},400);

    const er=await fetch(
      SUPABASE_URL+"/rest/v1/entitlements?profile_id=eq."+uid+"&product_id=eq."+encodeURIComponent(productId)+"&select=id&limit=1",
      {headers:h}
    );
    const entitlements=er.ok?await er.json():[];
    if(!entitlements.length){
      return json({error:"You do not have access to this resource."},403);
    }

    const pr=await fetch(
      SUPABASE_URL+"/rest/v1/products?id=eq."+encodeURIComponent(productId)+"&select=title,product_type,status,storage_path&limit=1",
      {headers:h}
    );
    const products=pr.ok?await pr.json():[];
    const product=products?.[0];

    if(!product?.storage_path){
      return json({error:"This resource is not ready for download yet."},404);
    }

    if(product.status!=="active"){
      return json({error:"This resource has not been released yet."},403);
    }

    if(product.product_type==="digital_book"&&!digitalBookDelivery){
      return json({error:"Digital book delivery is not live yet."},403);
    }

    const storageUrl=
      SUPABASE_URL+
      "/storage/v1/object/authenticated/member-resources/"+
      product.storage_path.split("/").map(encodeURIComponent).join("/");

    const file=await fetch(storageUrl,{
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:"Bearer "+s.access
      }
    });

    if(!file.ok){
      return json({
        error:file.status===404
          ?"This resource is not available yet."
          :"We couldn't open this resource."
      },file.status===404?404:502);
    }

    const headers=new Headers({
      "Content-Type":file.headers.get("content-type")||"application/pdf",
      "Content-Disposition":'inline; filename="'+safeName(product.title)+'.pdf"',
      "Cache-Control":"private, no-store"
    });

    return new Response(file.body,{status:200,headers});
  }

  return json({error:"Method not allowed"},405);
};

export const config={path:"/api/lockliel/resources"};