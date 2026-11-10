import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createPortalServer} from '../server.mjs';

const source=readFileSync(new URL('../prototype/portal-shell.js',import.meta.url),'utf8');
// Basligin hangi modul ve araclari gosterdigi, sayfa cizilmeden hesaplanir.
function shellFor(user,page='index.html'){
 const noop=()=>{};
 const context={
  window:{portalBootstrap:{user}},URL,URLSearchParams,setTimeout:noop,
  location:{href:'http://portal.test/'+page,pathname:'/'+page.split('?')[0],search:page.includes('?')?page.slice(page.indexOf('?')):''},
  document:{documentElement:{classList:{add:noop,remove:noop},dataset:{}},readyState:'loading',addEventListener:noop},
 };
 context.window.location=context.location;
 vm.createContext(context);
 vm.runInContext('const window=this.window;'+source.replace(/\(function\(\)\{/,'(function(){const portalBootstrap=window.portalBootstrap;'),context);
 const shell=context.window.AscendShell;
 return JSON.parse(JSON.stringify({modules:shell.modules.map(m=>m.label),tools:shell.tools.map(t=>t.label)}));
}
const all={ncts:{access:true,finance:true},transport:{access:true,finance:true},logistics:{access:true,finance:true}};

test('the header shows each user only the modules and tools they can open',()=>{
 assert.deepEqual(shellFor({role:'Yönetici',name:'Y',permissions:all}),{
  modules:['Ana Sayfa','NCTS / T1','İç Nakliye','Lojistik','Finans'],
  tools:['Firma Kartları','Evrak ve Hesap Merkezi','Hızlı Fiyat Al','Teklif Yönetimi','Mailden Talep / Fiyat','Takip Merkezi','Kullanıcı Yönetimi'],
 });
 assert.deepEqual(shellFor({role:'Operasyon',name:'P',permissions:{ncts:{access:true,finance:false},transport:{access:false,finance:false},logistics:{access:true,finance:false}}}),{
  modules:['Ana Sayfa','NCTS / T1','Lojistik'],tools:['Firma Kartları','Evrak ve Hesap Merkezi','Hızlı Fiyat Al'],
 },'personel: finans ve Ic Nakliye yetkisi yoksa gorunmez, yonetici araclari yok');
 assert.deepEqual(shellFor({role:'Operasyon',name:'P',permissions:{ncts:{access:false,finance:false},transport:{access:true,finance:true},logistics:{access:true,finance:false}}}).modules,
  ['Ana Sayfa','İç Nakliye','Lojistik','Finans'],'bir modulde finans yetkisi Finans alanini acar');
 assert.deepEqual(shellFor({role:'Müşteri',name:'M',permissions:{ncts:{access:true,finance:false},transport:{access:false,finance:false},logistics:{access:true,finance:false}}}),{
  modules:['Ana Sayfa','NCTS / T1','Lojistik'],tools:['Evrak ve Hesap Merkezi'],
 },'musteri: Firma Kartlari, fiyat ve yonetim araclari yok');
});

test('the shared header is added to every signed-in page, never to the sign-in screen',async()=>{
 const server=await createPortalServer({PORTAL_PREVIEW_ENABLED:'true',PORTAL_PREVIEW_REQUIRE_AUTH:'false'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const anonymous=await (await fetch(base+'/')).text();
  assert.ok(!anonymous.includes('<script src="portal-shell.js">'),'giris ekraninda ortak baslik yok');
  const login=await fetch(base+'/api/tenant/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'yonetici.demo',password:'AscendDemo!2026'})});
  const cookie=login.headers.get('set-cookie').split(';')[0];
  for(const page of ['/index.html','/01_NCTS_BRANDED_v15.html','/02_LOJISTIK_PORTAL_BRANDED_v14.html','/finans.html','/ic-nakliye.html','/03_KULLANICI_YONETIMI.html','/offer-center.html']){
   const html=await (await fetch(base+page,{headers:{cookie}})).text();
   assert.match(html,/<script src="tenant-bridge.js"><\/script><link rel="stylesheet" href="portal-shell.css"><script src="portal-shell.js"><\/script>/,page);
  }
  for(const asset of ['/portal-shell.js','/portal-shell.css'])assert.equal((await fetch(base+asset)).status,200,asset);
 }finally{server.close();}
});

test('theme switch goes into the header menus, and the demo preview keeps its own header',()=>{
 assert.match(readFileSync(new URL('../prototype/portal-theme.js',import.meta.url),'utf8'),/querySelectorAll\('\[data-theme-slot\]'\)/);
 assert.match(readFileSync(new URL('../prototype/role-preview.html',import.meta.url),'utf8'),/<header data-shell-skip>/);
 assert.match(source,/old\.hasAttribute\('data-shell-skip'\)/);
 assert.match(source,/window\.portalLogout/,'cikis bekleyen kayitlari bitiren kopru uzerinden');
 assert.ok(!/innerHTML/.test(source),'kullanici verisi yalniz textContent ile');
});
