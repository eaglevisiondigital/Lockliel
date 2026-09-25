"use client";
import {useEffect,useState} from "react";
import {BookOpen,FileUp,PackageCheck} from "lucide-react";

export default function ProductsAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState(false);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/products",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function upload(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setWorking(true);
    setMessage("");
    const form=new FormData(e.currentTarget);
    form.set("action","uploadDigitalFile");
    const r=await fetch("/api/lockliel/admin/products",{method:"POST",body:form});
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to upload digital resource.");return;}
    setMessage("Protected PDF uploaded to Lockliel.");
    e.currentTarget.reset();
    await load();
  }

  async function updateProduct(productId:string,status:string,price:string){
    setWorking(true);
    setMessage("");
    const r=await fetch("/api/lockliel/admin/products",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"updateProduct",productId,status,price})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to update product.");return;}
    setMessage("Product updated.");
    await load();
  }

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading books and digital resources…</div>;

  const digital=data.products.filter((p:any)=>p.product_type!=="physical_book");

  return <section className="ml-products-admin">
    {message&&<p className="ml-share-message">{message}</p>}
    <div className="ml-product-readiness">
      <PackageCheck size={19}/>
      <div><b>Digital delivery</b><span>{data.digitalDeliveryEnabled?"Operationally enabled":"Built but currently off"}</span></div>
    </div>

    <div className="ml-finance-grid">
      <form className="ml-panel ml-admin-form" onSubmit={upload}>
        <div className="ml-icon"><FileUp size={19}/></div>
        <h3>Upload protected PDF</h3>
        <p>The file is stored in Lockliel’s private member-resource bucket. Members only receive it through a valid entitlement.</p>
        <label>Digital product<select name="productId" required defaultValue=""><option value="" disabled>Choose product</option>{digital.map((p:any)=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
        <label>PDF file<input name="file" type="file" accept="application/pdf,.pdf" required/></label>
        <button className="ml-action" disabled={working}>{working?"Uploading…":"Upload private PDF"}</button>
      </form>

      <section className="ml-panel ml-admin-list">
        <div className="ml-icon"><BookOpen size={19}/></div>
        <h3>Books & products</h3>
        {data.products.map((p:any)=><ProductRow key={p.id} product={p} working={working} onSave={updateProduct}/>)}
      </section>
    </div>
  </section>;
}

function ProductRow({product,working,onSave}:{product:any;working:boolean;onSave:(id:string,status:string,price:string)=>void}){
  const [status,setStatus]=useState(product.status);
  const [price,setPrice]=useState(product.price_cents==null?"":(product.price_cents/100).toFixed(2));

  return <div className="ml-product-row">
    <div>
      <b>{product.title}</b>
      <span>{product.product_type.replaceAll("_"," ")} • {product.storage_path?"protected file ready":"file not uploaded"}</span>
    </div>
    <input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal" placeholder="Price"/>
    <select value={status} onChange={e=>setStatus(e.target.value)}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select>
    <button disabled={working} onClick={()=>onSave(product.id,status,price)}>Save</button>
  </div>;
}
