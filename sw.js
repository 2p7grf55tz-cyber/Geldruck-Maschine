/* Kundenlotse – Offline-Speicher für das Programm. Kundendaten liegen nicht hier, sondern im Gerätespeicher der App. */
const APP='kundenlotse-app-v1',FONTS='kundenlotse-fonts';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==APP&&k!==FONTS).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===self.location.origin){
    e.respondWith(caches.open(APP).then(async c=>{
      const hit=await c.match(r,{ignoreSearch:true});
      const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res;}).catch(()=>null);
      if(hit){e.waitUntil(net);return hit;}
      return (await net)||(r.mode==='navigate'?c.match('./index.html'):Response.error());
    }));
  }else if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(FONTS).then(async c=>{
      const hit=await c.match(r);if(hit)return hit;
      try{const res=await fetch(r);c.put(r,res.clone());return res;}catch(_){return Response.error();}
    }));
  }
});
