import {safeResourcePath} from './member-journey.mjs';
export const shareLanes=[
  {id:'hope',label:'Hope',categories:['hope','faith-development'],types:['faith_boost']},
  {id:'encouragement',label:'Encouragement',categories:['encouragement','prayer'],types:['faith_boost']},
  {id:'new-faith',label:'New to faith',categories:['biblical-foundations','new-believer'],types:[]},
  {id:'identity',label:'Identity in Christ',categories:['identity-in-christ'],types:[]},
  {id:'worry',label:'Fear and worry',categories:['fear-and-worry','peace'],types:[]},
  {id:'healing',label:'Healing encouragement',categories:['healing-wholeness'],types:[]},
  {id:'family',label:'Family and relationships',categories:['family-relationships'],types:[]},
  {id:'bible',label:'Understanding the Bible',categories:['biblical-foundations'],types:[]},
  {id:'growth',label:'Growing spiritually',categories:['faith-development','prayer'],types:[]},
  {id:'discipleship',label:'Ready for discipleship',categories:['discipleship'],types:['course']}
];
export function safeSharePath(value) {
  const path=safeResourcePath(value);
  if(!path)return null;
  let decoded=path;
  try{for(let i=0;i<3;i++)decoded=decodeURIComponent(decoded);}catch{return null;}
  const url=new URL(decoded,'https://lockliel.invalid');
  if(/\.(pdf|epub|zip|mp4|mp3)(\/|$)/i.test(url.pathname)||/(^|\/)(storage|download|read|reader)(\/|$)/i.test(url.pathname)||url.search)return null;
  return path;
}
export function guidedAsset(asset) {
  const href=safeSharePath(asset.destination_path);
  if(!href)return null;
  return {...asset,destination_path:href,lanes:shareLanes.filter(lane=>lane.categories.includes(String(asset.category||'').toLowerCase())||lane.types.includes(asset.asset_type)).map(lane=>lane.id)};
}
