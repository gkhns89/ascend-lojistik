import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createPortalServer} from '../server.mjs';

// Finans alaninin kurallari tarayicidaki gibi calistirilir.
const context={};vm.createContext(context);
vm.runInContext(readFileSync(new URL('../prototype/finance-center.js',import.meta.url),'utf8'),context);
const F=context.AscendFinance;
const plain=value=>JSON.parse(JSON.stringify(value));
const keys=user=>plain(F.financeTabs(user)).map(t=>t.key);

test('each tab appears only for the module whose finance the user holds',()=>{
 assert.deepEqual(keys({role:'Yönetici'}),['logistics','ncts','transport','reports']);
 assert.deepEqual(keys({role:'Operasyon',permissions:{ncts:{access:true,finance:true},logistics:{access:true,finance:false}}}),['ncts']);
 assert.deepEqual(keys({role:'Finans',permissions:{logistics:{access:true,finance:true},transport:{access:true,finance:true}}}),['logistics','transport']);
 assert.deepEqual(keys({role:'Operasyon',permissions:{logistics:{access:true,finance:false}}}),[],'finans yetkisi yoksa hic sekme yok');
 assert.equal(keys({role:'Finans',permissions:{logistics:{access:true,finance:true}}}).includes('reports'),false,'Raporlar yalniz yoneticide');
});

test('totals never add one currency to another',()=>{
 const rows=[{c:'EUR',v:500},{c:'USD',v:500},{c:'EUR',v:1000},{c:'TRY',v:null}];
 const groups=plain(F.currencyTotals(rows,r=>r.v==null?null:{currency:r.c,values:{all:r.v}}));
 assert.deepEqual(groups,[{currency:'EUR',values:{all:1500}},{currency:'USD',values:{all:500}}]);
});

test('logistics amounts are computed as the old screen did',()=>{
 const m=plain(F.logisticsMoney({salePrice:'500',purchasePrice:'200',exchangeRate:'45',financeCurrency:'USD'}));
 assert.equal(m.profit,300);assert.equal(m.share,100);assert.equal(m.shareTL,4500);assert.equal(m.currency,'USD');
 const empty=plain(F.logisticsMoney({salePrice:'',purchasePrice:''}));
 assert.equal(empty.priced,false,'tutari olmayan dosya toplama girmez');
 assert.equal(plain(F.logisticsMoney({salePrice:'100'})).currency,'EUR','doviz bos ise eski ekrandaki gibi EUR');
});

test('the finance page opens only for finance holders and embeds only their modules',async()=>{
 const server=await createPortalServer({PORTAL_PREVIEW_ENABLED:'true',PORTAL_PREVIEW_REQUIRE_AUTH:'false'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const call=(path,body,cookie)=>fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
 const login=async u=>(await call('/api/tenant/login',{username:u,password:'AscendDemo!2026'})).headers.get('set-cookie').split(';')[0];
 const sync=async(cookie,body)=>{const {revision}=await (await call('/api/tenant/data',null,cookie)).json();return call('/api/tenant/sync',{_revision:revision,...body},cookie);};
 const embedded=async(cookie)=>JSON.parse(/window\.portalBootstrap=(.*?);<\/script>/s.exec(await (await call('/finans.html',null,cookie)).text())[1]);
 try{
  const admin=await login('yonetici.demo');
  assert.equal((await sync(admin,{shipments:[{fileNo:'ASC-1',shipper:'A',salePrice:'500',purchasePrice:'300',financeCurrency:'EUR'}],ncts:[{no:'N-1',sender:'A',freightFee:120,feeCurrency:'EUR'}]})).status,200);
  assert.equal((await call('/finans.html',null,admin)).status,200);

  const staff=await login('personel.demo');
  assert.equal((await call('/finans.html',null,staff)).status,403,'finans yetkisi yoksa sayfa kapali');

  const users=(await (await call('/api/tenant/data',null,admin)).json()).users.map(u=>u.username==='personel.demo'?{...u,permissions:{ncts:{access:true,finance:true},logistics:{access:true,finance:false}}}:u);
  assert.equal((await sync(admin,{users})).status,200);
  assert.equal((await call('/finans.html',null,staff)).status,200,'tek modulde finans yeterli');
  const data=await embedded(staff);
  assert.equal(data.ncts.find(r=>r.no==='N-1').freightFee,120,'NCTS ucreti gelir');
  const ship=data.shipments.find(r=>r.fileNo==='ASC-1');
  for(const f of ['salePrice','purchasePrice','financeCurrency'])assert.equal(f in ship,false,'Lojistik parasi gelmez: '+f);

  // NCTS finansi olan personel ucreti Finans alanindan yazabilir.
  const rows=data.ncts.map(r=>r.no==='N-1'?{...r,freightFee:150}:r);
  assert.equal((await sync(staff,{ncts:rows})).status,200);
  assert.equal((await (await call('/api/tenant/data',null,admin)).json()).ncts.find(r=>r.no==='N-1').freightFee,150);
 }finally{await new Promise(r=>server.close(r));}
});

test('İç Nakliye screen no longer carries money fields',()=>{
 const html=readFileSync(new URL('../prototype/ic-nakliye.html',import.meta.url),'utf8');
 for(const id of ['fee','currency','paid','totalAll'])assert.equal(html.includes('id="'+id+'"'),false,id+' kaldirilmali');
 assert.match(html,/href="finans\.html#transport"/);
});
