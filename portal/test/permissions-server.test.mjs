import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPortalServer} from '../server.mjs';

// Sayfaya gomulen veri (window.portalBootstrap) tarayiciya giden ham veridir.
// Arayuz neyi gizlerse gizlesin, burada olmayan alan kullaniciya hic ulasmaz.
const bootstrapOf=html=>JSON.parse(/window\.portalBootstrap=(.*?);<\/script>/s.exec(html)[1]);

test('module pages and embedded data follow the permission table over HTTP',async()=>{
 const server=await createPortalServer({PORTAL_PREVIEW_ENABLED:'true',PORTAL_PREVIEW_REQUIRE_AUTH:'false'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const call=(path,body,cookie)=>fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
 const login=async username=>(await call('/api/tenant/login',{username,password:'AscendDemo!2026'})).headers.get('set-cookie').split(';')[0];
 const sync=async(cookie,body)=>{const {revision}=await (await call('/api/tenant/data',null,cookie)).json();return call('/api/tenant/sync',{_revision:revision,...body},cookie);};
 try{
  const admin=await login('yonetici.demo');
  assert.equal((await sync(admin,{transport:[{id:'IN-2026-0001',company:'Vicem Yapı',packages:5,weight:1200,fee:2500,currency:'TRY',paid:false}],ncts:[{no:'N-1',sender:'A',freightFee:120,feeCurrency:'EUR'}]})).status,200);

  // Personel: Ic Nakliye kapali; sayfa reddedilir, gomulu veride kayit yok.
  const staff=await login('personel.demo');
  assert.equal((await call('/ic-nakliye.html',null,staff)).status,403);
  const home=bootstrapOf(await (await call('/index.html',null,staff)).text());
  assert.deepEqual(home.transport,[]);
  assert.equal(home.user.permissions.transport.access,false);
  assert.equal('feeCurrency' in home.ncts.find(r=>r.no==='N-1'),false,'NCTS dovizi finans alanidir');
  assert.equal((await sync(staff,{transport:[{id:'IN-2026-0001',company:'X'}]})).status,403);

  // Yonetici erisim verir ama finans vermez: sayfa acilir, ucret gomulmez.
  const users=(await (await call('/api/tenant/data',null,admin)).json()).users.map(u=>u.username==='personel.demo'?{...u,permissions:{transport:{access:true,finance:false}}}:u);
  assert.equal((await sync(admin,{users})).status,200);
  const page=await call('/ic-nakliye.html',null,staff);
  assert.equal(page.status,200,'ayni oturum yeniden giris gerektirmeden acilir');
  const row=bootstrapOf(await page.text()).transport[0];
  assert.equal(row.company,'Vicem Yapı');
  for(const f of ['fee','currency','paid'])assert.equal(f in row,false,f);

  // Musteri: sayfa ve veri kapali.
  const customer=await login('musteri.demo');
  assert.equal((await call('/ic-nakliye.html',null,customer)).status,403);
  assert.deepEqual((await (await call('/api/tenant/data',null,customer)).json()).transport,[]);

  // Yonetici her seyi gorur.
  const own=bootstrapOf(await (await call('/ic-nakliye.html',null,admin)).text());
  assert.equal(own.transport[0].fee,2500);
 }finally{await new Promise(r=>server.close(r));}
});
