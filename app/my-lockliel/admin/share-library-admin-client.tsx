"use client";
import {useEffect,useState} from "react";
import {LibraryBig,Plus,Save,Star} from "lucide-react";

export default function ShareLibraryAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState(false);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/share-library",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function create(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setWorking(true);setMessage("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/api/lockliel/admin/share-library",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"create",
        slug:f.get("slug"),
        title:f.get("title"),
        assetType:f.get("assetType"),
        category:f.get("category"),
        destinationPath:f.get("destinationPath"),
        description:f.get("description"),
        shareText:f.get("shareText"),
        languageCode:f.get("languageCode"),
        translationKey:f.get("translationKey"),
        sortOrder:f.get("sortOrder"),
        featured:f.get("featured")==="yes",
        status:"draft"
      })
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to create share resource.");return;}
    setMessage("Share resource created as draft.");
    e.currentTarget.reset();
    await load();
  }

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading Share Library…</div>;

  return <section className="ml-share-admin">
    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-finance-grid">
      <form className="ml-panel ml-admin-form" onSubmit={create}>
        <div className="ml-icon"><Plus size={19}/></div>
        <h3>Add share resource</h3>
        <p>Create a draft first. Activate it only after the destination and approved copy are reviewed.</p>

        <div className="ml-auth-row">
          <label>Title<input name="title" required/></label>
          <label>Slug<input name="slug" required placeholder="faith-boost-friday"/></label>
        </div>

        <div className="ml-auth-row">
          <label>Asset type<select name="assetType" defaultValue="graphic"><option value="faith_boost">Faith Boost</option><option value="graphic">Graphic</option><option value="book">Book</option><option value="course">Course</option><option value="invitation">Invitation</option></select></label>
          <label>Category<input name="category" placeholder="faith_boost"/></label>
        </div>

        <label>Destination path<input name="destinationPath" required placeholder="/faith-boost"/></label>

        <div className="ml-auth-row">
          <label>Language code<input name="languageCode" defaultValue="en" placeholder="en"/></label>
          <label>Translation group key<input name="translationKey" placeholder="faith-boost-friday"/></label>
        </div>

        <label>Description<textarea name="description" rows={3}/></label>
        <label>Approved share copy<textarea name="shareText" rows={4} placeholder="I thought this might encourage you today."/></label>

        <div className="ml-auth-row">
          <label>Sort order<input name="sortOrder" type="number" defaultValue="100"/></label>
          <label className="ml-check-line"><input type="checkbox" name="featured" value="yes"/> Featured</label>
        </div>

        <button className="ml-action" disabled={working}>Create draft</button>
      </form>

      <section className="ml-panel ml-admin-list">
        <div className="ml-icon"><LibraryBig size={19}/></div>
        <h3>Approved Share Library</h3>
        <p className="ml-privacy-note">Active items appear automatically in every member’s Share & Invite center.</p>
        <div className="ml-share-admin-list">
          {data.assets.map((asset:any)=><ShareAssetEditor key={asset.id} asset={asset} working={working} setWorking={setWorking} setMessage={setMessage} reload={load}/>)}
        </div>
      </section>
    </div>
  </section>;
}

function ShareAssetEditor({asset,working,setWorking,setMessage,reload}:{asset:any;working:boolean;setWorking:(v:boolean)=>void;setMessage:(v:string)=>void;reload:()=>Promise<void>}){
  const [form,setForm]=useState({
    title:asset.title||"",
    assetType:asset.asset_type||"",
    category:asset.category||"",
    destinationPath:asset.destination_path||"",
    description:asset.description||"",
    shareText:asset.share_text||"",
    languageCode:asset.language_code||"en",
    translationKey:asset.translation_key||asset.slug||"",
    sortOrder:String(asset.sort_order??100),
    featured:Boolean(asset.featured),
    status:asset.status||"draft"
  });

  async function save(){
    setWorking(true);setMessage("");
    const r=await fetch("/api/lockliel/admin/share-library",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"update",id:asset.id,...form})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(false);
    if(!r.ok){setMessage(d.error||"Unable to update share resource.");return;}
    setMessage("Share resource updated.");
    await reload();
  }

  return <article>
    <div className="ml-share-admin-head">
      <div>
        <b>{asset.title}</b>
        <span>{asset.slug} • {String(asset.language_code||"en").toUpperCase()} • {asset.status}</span>
      </div>
      {form.featured&&<Star size={15}/>}
    </div>

    <input value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))}/>
    <div className="ml-auth-row">
      <select value={form.assetType} onChange={e=>setForm(v=>({...v,assetType:e.target.value}))}><option value="faith_boost">Faith Boost</option><option value="graphic">Graphic</option><option value="book">Book</option><option value="course">Course</option><option value="invitation">Invitation</option></select>
      <input value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))} placeholder="Category"/>
    </div>
    <input value={form.destinationPath} onChange={e=>setForm(v=>({...v,destinationPath:e.target.value}))} placeholder="/destination"/>
    <div className="ml-auth-row">
      <input value={form.languageCode} onChange={e=>setForm(v=>({...v,languageCode:e.target.value}))} placeholder="en"/>
      <input value={form.translationKey} readOnly aria-label="Translation group key, locked after creation" title="Translation group key is locked after creation"/>
    </div>
    <textarea rows={2} value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))} placeholder="Description"/>
    <textarea rows={3} value={form.shareText} onChange={e=>setForm(v=>({...v,shareText:e.target.value}))} placeholder="Approved share copy"/>

    <div className="ml-share-admin-controls">
      <input type="number" value={form.sortOrder} onChange={e=>setForm(v=>({...v,sortOrder:e.target.value}))}/>
      <label><input type="checkbox" checked={form.featured} onChange={e=>setForm(v=>({...v,featured:e.target.checked}))}/> Featured</label>
      <select value={form.status} onChange={e=>setForm(v=>({...v,status:e.target.value}))}>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <button disabled={working} onClick={save}><Save size={13}/> Save</button>
    </div>
  </article>;
}
