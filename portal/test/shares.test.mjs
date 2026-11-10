import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createTenantStore} from '../tenant-store.mjs';
import {normalizeShareholders,normalizeShareTransfers,transferTL,SHARE_COUNT} from '../shares.mjs';
import {MODULES,MODULE_KEYS} from '../permissions.mjs';

const login=(store,u='yonetici.demo',p='AscendDemo!2026')=>store.principal({headers:{cookie:'ascend_sid='+store.login(u,p).token}});
const holder=(id,name,over={})=>({id,name,kind:'person',active:true,note:'',...over});
const transfer=(over={})=>{const t={id:'T-1',fileNo:'ASC-2026-0022',holderId:'h1',date:'2026-11-15',currency:'EUR',share:26667,rate:47.2,note:'',...over};return {...t,amountTL:over.amountTL??transferTL(t.share,t.rate)};};
const holders=[holder('h1','Ahmet Yılmaz'),holder('h2','Atakan E.'),holder('h3','ABC Danışmanlık',{kind:'company'})];

test('profit splits three ways, so at most three share holders are active',()=>{
 assert.equal(SHARE_COUNT,3);
 assert.doesNotThrow(()=>normalizeShareholders([...holders,holder('h4','Eski Ortak',{active:false})]));
 assert.throws(()=>normalizeShareholders([...holders,holder('h4','Dördüncü')]),/en fazla 3 aktif/);
 assert.throws(()=>normalizeShareholders([holder('h1','Ahmet'),holder('h2','AHMET')]),/zaten var/);
 assert.throws(()=>normalizeShareholders([holder('h1','A',{kind:'ortak'})]),/şahıs ya da firma/);
 assert.throws(()=>normalizeShareholders([holder('h1','')]),/zorunludur/);
});

test('a transfer is paid in lira at the day\'s rate and the server checks the sum',()=>{
 assert.equal(transferTL(26667,47.2),1258682,'266,67 EUR x 47,20 = 12.586,82 TL');
 const {rows}=normalizeShareTransfers([transfer()],[],holders);
 assert.equal(rows[0].amountTL,1258682);
 assert.throws(()=>normalizeShareTransfers([transfer({amountTL:1})],[],holders),/pay × kur/,'istemcinin tutarina guvenilmez');
 assert.throws(()=>normalizeShareTransfers([transfer({holderId:'yok'})],[],holders),/Tanımsız pay sahibi/);
 assert.throws(()=>normalizeShareTransfers([transfer({rate:0})],[],holders),/Kur/);
 assert.throws(()=>normalizeShareTransfers([transfer({rate:47.1234567})],[],holders),/altı ondalıklı/);
 assert.throws(()=>normalizeShareTransfers([transfer({share:12.5})],[],holders),/sıfırdan büyük/);
 assert.throws(()=>normalizeShareTransfers([transfer({date:'15.11.2026'})],[],holders),/tarihi/);
});

test('each holder\'s share of a file is transferred once, and a transfer is never edited',()=>{
 assert.throws(()=>normalizeShareTransfers([transfer(),transfer({id:'T-2'})],[],holders),/zaten aktarılmış/);
 assert.doesNotThrow(()=>normalizeShareTransfers([transfer(),transfer({id:'T-2',holderId:'h2'})],[],holders));
 const saved=normalizeShareTransfers([transfer()],[],holders).rows;
 assert.throws(()=>normalizeShareTransfers([transfer({rate:48})],saved,holders),/değiştirilemez/);
 assert.deepEqual(normalizeShareTransfers([],saved,holders).removed.map(r=>r.id),['T-1'],'silinen aktarim denetim icin dondurulur');
});

test('only the administrator sees or records shares; transfers survive a restart',async()=>{
 const file=join(mkdtempSync(join(tmpdir(),'ascend-shares-')),'portal.json');
 const first=await createTenantStore(file,{bootstrapPassword:'shares-test-bootstrap-2026'});
 const admin=login(first,'ascend lojistik','shares-test-bootstrap-2026');
 await first.sync(admin,{_revision:first.revision(),shareholders:holders,shareTransfers:[transfer()]});
 first.close();
 const store=await createTenantStore(file,{bootstrapPassword:'shares-test-bootstrap-2026'});
 try{
  const data=store.data(login(store,'ascend lojistik','shares-test-bootstrap-2026'));
  assert.equal(data.shareholders.length,3);assert.equal(data.shareTransfers[0].amountTL,1258682);
 }finally{store.close();}

 const demo=await createTenantStore();
 try{
  const a=login(demo);
  await demo.sync(a,{_revision:demo.revision(),shareholders:holders});
  const users=demo.data(a).users.map(u=>u.username==='personel.demo'?{...u,permissions:{logistics:{access:true,finance:true}}}:u);
  await demo.sync(a,{_revision:demo.revision(),users});
  const staff=login(demo,'personel.demo');
  assert.deepEqual(demo.data(staff).shareholders,[],'Lojistik finansi olan personel bile gormez');
  assert.deepEqual(demo.data(staff).shareTransfers,[]);
  await assert.rejects(demo.sync(staff,{_revision:demo.revision(),shareTransfers:[transfer()]}),e=>e.status===403);
 }finally{demo.close();}
});

test('a holder with transfers cannot be deleted, only made inactive; deletions are audited',async()=>{
 const store=await createTenantStore();
 try{
  const admin=login(store);
  await store.sync(admin,{_revision:store.revision(),shareholders:holders,shareTransfers:[transfer()]});
  await assert.rejects(store.sync(admin,{_revision:store.revision(),shareholders:holders.slice(1)}),/pasife alın/);
  await store.sync(admin,{_revision:store.revision(),shareholders:holders.map(h=>h.id==='h1'?{...h,active:false}:h)});
  await store.sync(admin,{_revision:store.revision(),shareTransfers:[]});
  const removed=store.database.db.prepare("SELECT detail FROM audit WHERE action='state.update'").all().map(r=>JSON.parse(r.detail)).flatMap(d=>d.changes||[]).find(c=>c.collection==='shareTransfers'&&c.removed);
  assert.equal(removed?.removed.amountTL,1258682,'silinen aktarim icerigiyle denetimde');
 }finally{store.close();}
});

// Genel adli alanlar (fee, currency, paid) baska modullerde finansla ilgisi
// olmayan alanlarla ayni ada sahip. Ilk surum sevkiyattaki esya dovizini
// (currency) Ic Nakliye finansi sanip personelden gizliyor, duzeltmesini dusuruyordu.
test('a finance field with a generic name is finance only on its own module',async()=>{
 for(const key of MODULE_KEYS)for(const field of MODULES[key].stray){
  assert.ok(!['fee','currency','paid','amount','value','note','date'].includes(field),key+'.'+field+' genel bir ad; stray olamaz');
  for(const other of MODULE_KEYS)if(other!==key)assert.ok(!MODULES[other].hidden.includes(field),field+' iki modulun finansinda birden');
 }
 const store=await createTenantStore();
 try{
  const admin=login(store);
  await store.sync(admin,{_revision:store.revision(),shipments:[{fileNo:'ASC-1',shipper:'A',value:'125000',currency:'USD'}],ncts:[{no:'N-1',sender:'A',freightFee:100,feeCurrency:'EUR',paid:true}],transport:[{id:'IN-1',company:'A',container:true,fee:50,currency:'TRY',paid:true}]});
  const users=store.data(admin).users.map(u=>u.username==='personel.demo'?{...u,permissions:{transport:{access:true,finance:true}}}:u);
  await store.sync(admin,{_revision:store.revision(),users});
  const staff=login(store,'personel.demo');
  const data=store.data(staff);
  assert.equal(data.shipments[0].currency,'USD','esya dovizi finans degil');
  assert.equal(data.transport[0].paid,true,'Ic Nakliye finansi olan odeme durumunu gorur');
  assert.equal('paid' in data.ncts[0],false,'NCTS finansi yoksa NCTS odeme durumu gizli');
  await store.sync(staff,{_revision:store.revision(),shipments:[{fileNo:'ASC-1',shipper:'A',value:'125000',currency:'EUR'}],transport:[{...data.transport[0],paid:false}]});
  const saved=store.data(admin);
  assert.equal(saved.shipments[0].currency,'EUR','personelin esya dovizi duzeltmesi kaydedilir');
  assert.equal(saved.transport[0].paid,false,'Ic Nakliye finansi olan odemeyi isaretler');
  await store.sync(staff,{_revision:store.revision(),ncts:[{no:'N-1',sender:'A',paid:false}]});
  assert.equal(store.data(admin).ncts[0].paid,true,'NCTS finansi olmayan NCTS odemesini degistiremez');
 }finally{store.close();}
});

// Sayfadaki pay hesaplari tarayicidaki gibi calistirilir.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('the finance page computes each holder\'s share and what is still owed',()=>{
 const context={};vm.createContext(context);
 vm.runInContext(readFileSync(new URL('../prototype/finance-center.js',import.meta.url),'utf8'),context);
 const F=context.AscendFinance,plain=v=>JSON.parse(JSON.stringify(v));
 assert.equal(F.holderShare({salePrice:'2600',purchasePrice:'1800',financeCurrency:'EUR'}),26667,'800 / 3 = 266,67');
 assert.equal(F.holderShare({salePrice:'100',purchasePrice:'300'}),0,'zararda pay yok');
 assert.equal(F.holderShare({salePrice:'',purchasePrice:''}),0,'fiyatsiz dosyada pay yok');
 assert.equal(F.transferTL(26667,47.2),transferTL(26667,47.2),'sayfa ve sunucu ayni TL tutarini hesaplar');
 const shipments=[
  {fileNo:'A',salePrice:'2600',purchasePrice:'1800',financeCurrency:'EUR'},
  {fileNo:'B',salePrice:'500',purchasePrice:'435',financeCurrency:'EUR'},
  {fileNo:'C',salePrice:'2950',purchasePrice:'2100',financeCurrency:'USD'},
  {fileNo:'D',salePrice:'100',purchasePrice:'200',financeCurrency:'EUR'},
 ];
 const transfers=[transfer({fileNo:'A',holderId:'h1'}),transfer({id:'T-2',fileNo:'B',holderId:'h1',share:2167,rate:47.3})];
 const rows=plain(F.shareSummary(shipments,[...holders,holder('h4','Eski',{active:false})],transfers));
 const h1=rows.find(r=>r.holder.id==='h1'),h2=rows.find(r=>r.holder.id==='h2'),old=rows.find(r=>r.holder.id==='h4');
 assert.equal(h1.transfers,2);assert.equal(h1.transferredTL,transferTL(26667,47.2)+transferTL(2167,47.3));
 assert.deepEqual(h1.pending,[{currency:'USD',amount:28333,files:1}],'h1 yalniz C dosyasini bekliyor');
 assert.deepEqual(h2.pending,[{currency:'EUR',amount:26667+2167,files:2},{currency:'USD',amount:28333,files:1}],'zararli D dosyasi bekleyene girmez');
 assert.deepEqual(old.pending,[],'pasif pay sahibine bekleyen hesaplanmaz');
});
