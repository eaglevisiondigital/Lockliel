import {
  SUPABASE_URL,
  SUPABASE_KEY,
  json,
  dbHeaders,
  requireSession,
  sessionCookies
} from "../lib/lockliel-core.mjs";

function safeSlug(value){
  return String(value||"resource")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")||"resource";
}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","content_admin"].includes(r))){
    return json({error:"Product administration access required"},403);
  }

  if(request.method==="GET"){
    const [productsRes,flagsRes]=await Promise.all([
      fetch(
        SUPABASE_URL+"/rest/v1/products?select=id,slug,title,product_type,status,price_cents,currency,storage_path,cover_path,description,created_at&order=created_at.asc",
        {headers:h}
      ),
      fetch(
        SUPABASE_URL+"/rest/v1/feature_flags?key=eq.digital_book_delivery&select=key,enabled&limit=1",
        {headers:h}
      )
    ]);
    const flags=flagsRes.ok?await flagsRes.json():[];
    return json({
      roles,
      products:productsRes.ok?await productsRes.json():[],
      digitalDeliveryEnabled:Boolean(flags?.[0]?.enabled)
    },200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const contentType=request.headers.get("content-type")||"";
  if(contentType.includes("multipart/form-data")){
    const form=await request.formData();
    const action=String(form.get("action")||"");
    if(action!=="uploadDigitalFile")return json({error:"Unknown upload action"},400);

    const productId=String(form.get("productId")||"");
    const file=form.get("file");
    if(!productId||!(file instanceof File))return json({error:"Choose a product and PDF file."},400);
    if(file.type!=="application/pdf")return json({error:"Digital book files must be PDF."},400);
    if(file.size<=0||file.size>50*1024*1024)return json({error:"PDF must be between 1 byte and 50 MB."},400);

    const pr=await fetch(
      SUPABASE_URL+"/rest/v1/products?id=eq."+encodeURIComponent(productId)+"&select=id,slug,title,product_type&limit=1",
      {headers:h}
    );
    const products=pr.ok?await pr.json():[];
    const product=products?.[0];
    if(!product)return json({error:"Product not found."},404);
    if(product.product_type!=="digital_book"&&product.product_type!=="resource"){
      return json({error:"Only digital products can receive a protected PDF."},400);
    }

    const storagePath="products/"+safeSlug(product.slug||product.title)+".pdf";
    const bytes=await file.arrayBuffer();
    const uploadPath=storagePath.split("/").map(encodeURIComponent).join("/");
    const upload=await fetch(
      SUPABASE_URL+"/storage/v1/object/member-resources/"+uploadPath,
      {
        method:"POST",
        headers:{
          apikey:SUPABASE_KEY,
          Authorization:"Bearer "+s.access,
          "Content-Type":"application/pdf",
          "x-upsert":"true"
        },
        body:bytes
      }
    );
    if(!upload.ok){
      const detail=await upload.text().catch(()=>"");
      return json({error:"Unable to store digital resource.",detail:detail.slice(0,180)},upload.status);
    }

    const patch=await fetch(
      SUPABASE_URL+"/rest/v1/products?id=eq."+encodeURIComponent(productId),
      {
        method:"PATCH",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({storage_path:storagePath})
      }
    );
    if(!patch.ok)return json({error:"File uploaded but product record could not be updated."},500);

    return json({ok:true,product:(await patch.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  const b=await request.json().catch(()=>({}));
  if(b.action==="updateProduct"){
    const productId=String(b.productId||"");
    const status=String(b.status||"");
    const allowed=["draft","active","archived"];
    const price=String(b.price||"").trim();
    if(!productId||!allowed.includes(status))return json({error:"Choose a valid product and status."},400);

    const amount=price===""?null:Math.max(0,Math.round(Number(price)*100));
    if(price!==""&&!Number.isFinite(amount))return json({error:"Enter a valid price."},400);

    const patch={status,price_cents:amount};
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/products?id=eq."+encodeURIComponent(productId),
      {
        method:"PATCH",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify(patch)
      }
    );
    if(!r.ok)return json({error:"Unable to update product."},r.status);
    return json({ok:true,product:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  return json({error:"Unknown action"},400);
};

export const config={path:"/api/lockliel/admin/products"};