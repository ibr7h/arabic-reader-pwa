const CACHE="hurufi-v2-alpha15";
const FONT_CACHE="hurufi-v2-fonts-v2";
const AUDIO_CACHE="hurufi-v2-audio-v1";
const VERSION="2.0.0-alpha.15";
const SHELL=[
  ["./index.html","./index.html?v="+VERSION],
  ["./styles.css","./styles.css?v="+VERSION],
  ["./fonts.css","./fonts.css?v="+VERSION],
  ["./app.js","./app.js?v="+VERSION],
  ["./manifest.webmanifest","./manifest.webmanifest?v="+VERSION]
];
const STATIC=["../assets/icons/icon-192.png","../assets/icons/icon-512.png"];
const AUDIO_ASSETS=[
  "./assets/audio/phonics/ma-short.mp3",
  "./assets/audio/phonics/mi-short.mp3",
  "./assets/audio/phonics/mu-short.mp3",
  "./assets/audio/phonics/maa-long.mp3",
  "./assets/audio/phonics/mii-long.mp3",
  "./assets/audio/phonics/muu-long.mp3"
];

const FONT_ASSETS=[
  "./assets/fonts/NotoNaskhArabic-VF.ttf",
  "./assets/fonts/ScheherazadeNew-Regular.ttf",
  "./assets/fonts/Harmattan-Regular.ttf",
  "./assets/fonts/NotoSansArabic-VF.ttf",
  "./assets/fonts/NotoKufiArabic-VF.ttf",
  "./assets/fonts/BalooBhaijaan2-VF.ttf",
  "./assets/fonts/Cairo-VF.ttf",
  "./assets/fonts/ReadexPro-VF.ttf"
];

async function cacheFresh(cache,key,url){
  const response=await fetch(url,{cache:"reload"});
  if(!response.ok)throw new Error("Failed "+url);
  await cache.put(key,response.clone());
  return response;
}

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const [key,url] of SHELL){
      try{await cacheFresh(cache,key,url);}catch{}
    }
    for(const url of STATIC){
      try{await cacheFresh(cache,url,url);}catch{}
    }
    const audioCache=await caches.open(AUDIO_CACHE);
    for(const url of AUDIO_ASSETS){
      try{
        const existing=await audioCache.match(url);
        if(!existing){
          const response=await fetch(url,{cache:"reload"});
          if(response.ok)await audioCache.put(url,response.clone());
        }
      }catch{}
    }

    const fontCache=await caches.open(FONT_CACHE);
    for(const url of FONT_ASSETS){
      try{
        const existing=await fontCache.match(url);
        if(!existing){
          const response=await fetch(url,{cache:"reload"});
          if(response.ok)await fontCache.put(url,response.clone());
        }
      }catch{}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all([
      ...keys.filter(k=>k.startsWith("hurufi-v2-alpha")&&k!==CACHE).map(k=>caches.delete(k)),
      ...keys.filter(k=>k.startsWith("hurufi-v2-fonts-")&&k!==FONT_CACHE).map(k=>caches.delete(k)),
      ...keys.filter(k=>k.startsWith("hurufi-v2-audio-")&&k!==AUDIO_CACHE).map(k=>caches.delete(k))
    ]);
    await self.clients.claim();
  })());
});

self.addEventListener("message",event=>{
  if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting();
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);

  if(url.origin===location.origin&&url.pathname.endsWith("/version.js")){
    event.respondWith(fetch(event.request,{cache:"no-store"}));
    return;
  }

  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:"no-store"});
        if(response.ok){
          const cache=await caches.open(CACHE);
          await cache.put("./index.html",response.clone());
        }
        return response;
      }catch{
        return (await caches.match("./index.html"))||Response.error();
      }
    })());
    return;
  }

  if(url.origin===location.origin&&url.pathname.includes("/hurufi-v2/assets/fonts/")&&url.pathname.endsWith(".ttf")){
    event.respondWith((async()=>{
      const fontCache=await caches.open(FONT_CACHE);
      const cached=await fontCache.match(event.request);
      if(cached)return cached;
      try{
        const response=await fetch(event.request);
        if(response.ok)await fontCache.put(event.request,response.clone());
        return response;
      }catch{return Response.error();}
    })());
    return;
  }

  if(url.origin===location.origin&&url.pathname.includes("/hurufi-v2/assets/audio/phonics/")&&url.pathname.endsWith(".mp3")){
    event.respondWith((async()=>{
      const audioCache=await caches.open(AUDIO_CACHE);
      const cached=await audioCache.match(event.request);
      if(cached)return cached;
      try{
        const response=await fetch(event.request);
        if(response.ok)await audioCache.put(event.request,response.clone());
        return response;
      }catch{return Response.error();}
    })());
    return;
  }

  if(url.origin===location.origin&&/\/(app\.js|styles\.css|fonts\.css|manifest\.webmanifest)$/.test(url.pathname)){
    event.respondWith((async()=>{
      const key=url.pathname.endsWith("/app.js")?"./app.js":url.pathname.endsWith("/fonts.css")?"./fonts.css":url.pathname.endsWith("/styles.css")?"./styles.css":"./manifest.webmanifest";
      try{
        const response=await fetch(event.request,{cache:"no-store"});
        if(response.ok){
          const cache=await caches.open(CACHE);
          await cache.put(key,response.clone());
        }
        return response;
      }catch{
        return (await caches.match(key))||Response.error();
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok||response.type==="opaque"){
        const cache=await caches.open(CACHE);
        await cache.put(event.request,response.clone());
      }
      return response;
    }catch{
      return Response.error();
    }
  })());
});