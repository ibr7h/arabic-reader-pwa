const CACHE="hurufi-v2-alpha2";
const VERSION="2.0.0-alpha.2";
const SHELL=[
  ["./index.html","./index.html?v="+VERSION],
  ["./styles.css","./styles.css?v="+VERSION],
  ["./app.js","./app.js?v="+VERSION],
  ["./manifest.webmanifest","./manifest.webmanifest?v="+VERSION]
];
const STATIC=["../assets/icons/icon-192.png","../assets/icons/icon-512.png"];

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const [key,url] of SHELL){
      try{const r=await fetch(url,{cache:"reload"});if(r.ok)await cache.put(key,r.clone());}catch{}
    }
    for(const url of STATIC){
      try{const r=await fetch(url,{cache:"reload"});if(r.ok)await cache.put(url,r.clone());}catch{}
    }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith("hurufi-v2-")&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const r=await fetch(event.request,{cache:"no-store"});
        if(r.ok){const c=await caches.open(CACHE);await c.put("./index.html",r.clone());}
        return r;
      }catch{return (await caches.match("./index.html"))||Response.error();}
    })());
    return;
  }
  if(url.origin===location.origin&&/\/(app\.js|styles\.css|manifest\.webmanifest)$/.test(url.pathname)){
    event.respondWith((async()=>{
      try{return await fetch(event.request,{cache:"no-store"});}
      catch{
        const key=url.pathname.endsWith("/app.js")?"./app.js":url.pathname.endsWith("/styles.css")?"./styles.css":"./manifest.webmanifest";
        return (await caches.match(key))||Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);if(cached)return cached;
    try{const r=await fetch(event.request);if(r.ok){const c=await caches.open(CACHE);await c.put(event.request,r.clone());}return r;}
    catch{return Response.error();}
  })());
});