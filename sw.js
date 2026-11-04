/* الشبكة أولًا لملفات الموقع، ولو مفيش إنترنت تفتح آخر نسخة محفوظة.
   وملفات Firebase الخارجية تتخزّن كمان عشان التطبيق يفتح من غير نت. */
const C='mandoobeen-v4';
const EXT=['www.gstatic.com','cdn.jsdelivr.net'];
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===self.location.origin){
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./')||caches.match('./index.html'))));
  }else if(EXT.includes(u.host)&&u.pathname.endsWith('.js')){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res})));
  }
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();const view=(e.notification.data&&e.notification.data.view)||'';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if('focus' in c){c.postMessage({ntfView:view});return c.focus()}}
    if(self.clients.openWindow)return self.clients.openWindow('./');
  }));
});
