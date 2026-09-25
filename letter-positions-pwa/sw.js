const CACHE = "hurufi-letter-positions-v8";
const APP_VERSION = "1.4.1";
const SHELL = [
  ["./index.html", "./index.html?v="+APP_VERSION],
  ["./styles.css", "./styles.css?v="+APP_VERSION],
  ["./app.js", "./app.js?v="+APP_VERSION],
  ["./manifest.webmanifest", "./manifest.webmanifest?v="+APP_VERSION]
];
const STATIC = [
  "../assets/icons/icon-192.png",
  "../assets/icons/icon-512.png"
];

async function cacheFresh(cache, key, url){
  const response = await fetch(url, {cache:"reload"});
  if(!response.ok) throw new Error("Failed to fetch "+url);
  await cache.put(key, response.clone());
  return response;
}

self.addEventListener("install", event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const [key,url] of SHELL){
      try{ await cacheFresh(cache,key,url); }catch{}
    }
    for(const url of STATIC){
      try{ await cacheFresh(cache,url,url); }catch{}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith("hurufi-letter-positions-") && key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if(event.data && event.data.type==="SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);

  if(url.origin===location.origin && url.pathname.endsWith("/version.js")){
    event.respondWith(fetch(event.request,{cache:"no-store"}));
    return;
  }

  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:"no-store"});
        const cache=await caches.open(CACHE);
        if(response.ok) await cache.put("./index.html",response.clone());
        return response;
      }catch{
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  if(url.origin===location.origin && /\/(app\.js|styles\.css|manifest\.webmanifest)$/.test(url.pathname)){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:"no-store"});
        if(response.ok){
          const cache=await caches.open(CACHE);
          const cleanKey=url.pathname.endsWith("/app.js")?"./app.js":url.pathname.endsWith("/styles.css")?"./styles.css":"./manifest.webmanifest";
          await cache.put(cleanKey,response.clone());
        }
        return response;
      }catch{
        const fallback=url.pathname.endsWith("/app.js")?"./app.js":url.pathname.endsWith("/styles.css")?"./styles.css":"./manifest.webmanifest";
        return (await caches.match(fallback)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached) return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok){
        const cache=await caches.open(CACHE);
        await cache.put(event.request,response.clone());
      }
      return response;
    }catch{
      return Response.error();
    }
  })());
});
