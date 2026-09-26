// @ts-nocheck
Deno.serve((_req:Request)=>{
  return new Response(JSON.stringify({
    error:"This one-time importer has been permanently disabled."
  }),{
    status:410,
    headers:{"content-type":"application/json","cache-control":"no-store"}
  });
});
