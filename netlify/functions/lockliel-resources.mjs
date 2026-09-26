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

function normalizeLocale(value){
  return String(value||"en-US").trim().toLowerCase().replaceAll("_","-")||"en-us";
}

function chooseTranslation(rows,locale,sourceId){
  const exact=normalizeLocale(locale);
  const base=exact.split("-")[0];
  return rows.find(row=>String(row.language_code||"").toLowerCase()===exact)
    ||rows.find(row=>String(row.language_code||"").toLowerCase()===base)
    ||rows.find(row=>String(row.language_code||"").toLowerCase()==="en")
    ||rows.find(row=>row.id===sourceId)
    ||rows[0]
    ||null;
}

function localizedProduct(source,activeProducts,locale){
  if(!source)return null;
  const variants=activeProducts.filter(product=>
    product.translation_key&&
    source.translation_key&&
    product.translation_key===source.translation_key&&
    product.product_type===source.product_type
  );
  const selected=chooseTranslation(
    [...variants,source].filter((row,index,rows)=>rows.findIndex(other=>other.id===row.id)===index),
    locale,
    source.id
  )||source;

  return {
    ...selected,
    id:source.id,
    canonical_product_id:source.id,
    content_product_id:selected.id
  };
}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const [flagRes,profileRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/feature_flags?key=eq.digital_book_delivery&select=enabled&limit=1",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/profiles?id=eq."+uid+"&select=locale&limit=1",
      {headers:h}
    )
  ]);

  const flagRows=flagRes.ok?await flagRes.json():[];
  const digitalBookDelivery=Boolean(flagRows?.[0]?.enabled);
  const profile=(profileRes.ok?await profileRes.json():[])?.[0]||null;
  const locale=normalizeLocale(profile?.locale||"en-US");

  if(request.method==="GET"){
    const er=await fetch(
      SUPABASE_URL+"/rest/v1/entitlements?profile_id=eq."+uid+"&select=id,product_id,reason,granted_at&order=granted_at.desc",
      {headers:h}
    );
    const entitlements=er.ok?await er.json():[];
    const productIds=[...new Set(entitlements.map(e=>e.product_id).filter(Boolean))];

    let sourceProducts=[];
    if(productIds.length){
      const pr=await fetch(
        SUPABASE_URL+"/rest/v1/products?id=in.("+productIds.join(",")+")&select=id,slug,title,product_type,status,storage_path,description,language_code,translation_key",
        {headers:h}
      );
      sourceProducts=pr.ok?await pr.json():[];
    }

    const activeRes=await fetch(
      SUPABASE_URL+"/rest/v1/products?status=eq.active&select=id,slug,title,product_type,status,storage_path,description,language_code,translation_key&limit=2000",
      {headers:h}
    );
    const activeProducts=activeRes.ok?await activeRes.json():[];
    const sourceProductMap=Object.fromEntries(sourceProducts.map(product=>[product.id,product]));

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
        SUPABASE_URL+"/rest/v1/products?id=in.("+orderProductIds.join(",")+")&select=id,slug,title,product_type,language_code,translation_key",
        {headers:h}
      );
      orderProducts=opr.ok?await opr.json():[];
    }
    const orderProductMap=Object.fromEntries(orderProducts.map(p=>[p.id,p]));

    return json({
      preferredLocale:locale,
      digitalBookDelivery,
      resources:entitlements
        .map(entitlement=>{
          const sourceProduct=sourceProductMap[entitlement.product_id]||null;
          if(!sourceProduct)return null;

          const product=localizedProduct(sourceProduct,activeProducts,locale);
          const deliveryAvailable=
            Boolean(product?.storage_path) &&
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
      SUPABASE_URL+"/rest/v1/products?id=eq."+encodeURIComponent(productId)+"&select=id,title,product_type,status,storage_path,description,language_code,translation_key&limit=1",
      {headers:h}
    );
    const sourceProduct=(pr.ok?await pr.json():[])?.[0]||null;
    if(!sourceProduct)return json({error:"This resource is not available."},404);

    let activeProducts=[];
    if(sourceProduct.translation_key){
      const variantsRes=await fetch(
        SUPABASE_URL+"/rest/v1/products?translation_key=eq."+encodeURIComponent(sourceProduct.translation_key)+"&status=eq.active&select=id,title,product_type,status,storage_path,description,language_code,translation_key",
        {headers:h}
      );
      activeProducts=variantsRes.ok?await variantsRes.json():[];
    }

    const product=localizedProduct(sourceProduct,activeProducts,locale);

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

    const contentType=(file.headers.get("content-type")||"application/octet-stream")
      .split(";")[0].trim().toLowerCase();

    if(product.product_type==="digital_book"&&contentType!=="application/pdf"){
      return json({error:"This digital book file failed protected PDF validation."},502);
    }

    const sourceName=String(product.storage_path||"").split("/").pop()||product.title||"resource";
    const downloadName=product.product_type==="digital_book"
      ?safeName(product.title)+".pdf"
      :safeName(sourceName);

    const headers=new Headers({
      "Content-Type":contentType,
      "Content-Disposition":'inline; filename="'+downloadName+'"',
      "Cache-Control":"private, no-store",
      "X-Content-Type-Options":"nosniff"
    });

    return new Response(file.body,{status:200,headers});
  }

  return json({error:"Method not allowed"},405);
};

export const config={path:"/api/lockliel/resources"};
