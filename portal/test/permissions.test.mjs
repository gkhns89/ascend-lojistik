import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTenantStore} from '../tenant-store.mjs';
import {portalOperations} from '../operations.mjs';
import {permissionsFor,sanitizePermissions,MODULE_KEYS} from '../permissions.mjs';
import {normalizeTransport} from '../transport.mjs';

const password='AscendDemo!2026';
const as=(store,username)=>store.principal({headers:{cookie:'ascend_sid='+store.login(username,password).token}});
// Acik bir oturum: ayni cerez, her istekte sunucunun yaptigi gibi yeniden cozulur.
const session=(store,username)=>{const cookie='ascend_sid='+store.login(username,password).token;return ()=>store.principal({headers:{cookie}});};

// Her modulde finans alani tasiyan birer kayit. NCTS kaydinda bilerek bir
// Lojistik finans alani da var: eski veride boyle artiklar kalabilir.
const shipment={fileNo:'ASC-2026-0001',shipper:'DEMO Anadolu Dış Ticaret Ltd. Şti.',consignee:'Alıcı',salePrice:500,financeCurrency:'EUR',purchasePrice:300,profit:200,share:66.67,shareTL:3000,exchangeRate:45};
const ncts={no:'ASC-2026-0002',sender:'DEMO Anadolu Dış Ticaret Ltd. Şti.',receiver:'Alıcı',freightFee:120,guaranteeFee:80,feeCurrency:'EUR',purchasePrice:999};
const transport={id:'IN-2026-0001',company:'Vicem Yapı',customs:'Halkalı',warehouse:'Antrepo 3',deliveryAddress:'İstanbul',fee:2500,currency:'TRY',paid:false};

async function seeded(){
 const store=await createTenantStore();
 const admin=as(store,'yonetici.demo');
 await store.sync(admin,{_revision:store.revision(),shipments:[shipment],ncts:[ncts],transport:[transport]});
 return {store,admin};
}
async function grant(store,admin,username,permissions){
 const users=store.data(admin).users.map(u=>u.username===username?{...u,permissions}:u);
 await store.sync(admin,{_revision:store.revision(),users});
}

test('roles resolve to the defaults the portal had before permissions existed',()=>{
 const admin=permissionsFor({role:'Yönetici'}),staff=permissionsFor({role:'Operasyon'}),customer=permissionsFor({role:'Görüntüleme'});
 for(const key of MODULE_KEYS)assert.deepEqual(admin[key],{access:true,finance:true});
 assert.deepEqual(staff.ncts,{access:true,finance:false});
 assert.deepEqual(staff.logistics,{access:true,finance:false});
 assert.deepEqual(staff.transport,{access:false,finance:false},'yeni modul kapali baslar');
 assert.deepEqual(customer.transport,{access:false,finance:false});
 for(const key of MODULE_KEYS)assert.equal(customer[key].finance,false);
});

test('stored grants cannot lift a customer or demote an administrator',()=>{
 const everything=Object.fromEntries(MODULE_KEYS.map(k=>[k,{access:true,finance:true}]));
 for(const key of MODULE_KEYS){
  assert.equal(permissionsFor({role:'Görüntüleme',permissions:everything})[key].finance,false);
  assert.equal(permissionsFor({role:'Müşteri',permissions:everything})[key].finance,false);
 }
 assert.equal(permissionsFor({role:'Müşteri',permissions:everything}).transport.access,false);
 const nothing=Object.fromEntries(MODULE_KEYS.map(k=>[k,{access:false,finance:false}]));
 for(const key of MODULE_KEYS)assert.deepEqual(permissionsFor({role:'Yönetici',permissions:nothing})[key],{access:true,finance:true});
});

test('a permission table is checked before it is stored',()=>{
 assert.throws(()=>sanitizePermissions('Operasyon',{finans:{access:true}}),/Bilinmeyen modül/);
 assert.throws(()=>sanitizePermissions('Operasyon',{ncts:{access:'true'}}),/evet\/hayır/);
 assert.throws(()=>sanitizePermissions('Operasyon',{ncts:{access:true,admin:true}}),/Bilinmeyen yetki/);
 assert.throws(()=>sanitizePermissions('Operasyon',[]),/geçersiz/);
 // Erisim olmadan finans verilemez.
 assert.deepEqual(sanitizePermissions('Operasyon',{ncts:{access:false,finance:true}}),{ncts:{access:false,finance:false}});
 assert.equal(sanitizePermissions('Yönetici',{ncts:{access:false}}),undefined);
 assert.equal(sanitizePermissions('Görüntüleme',{ncts:{access:true,finance:true}}),undefined);
});

test('staff without finance see no finance field in any module, including NCTS currency',async()=>{
 const {store}=await seeded();
 try{
  const staff=as(store,'personel.demo'),data=store.data(staff);
  const s=data.shipments.find(r=>r.fileNo===shipment.fileNo);
  for(const f of ['purchasePrice','profit','share','shareTL','exchangeRate'])assert.equal(f in s,false,f);
  assert.equal(s.salePrice,500,'satis fiyati personele okunur; yetki oncesi davranis');
  const n=data.ncts.find(r=>r.no===ncts.no);
  for(const f of ['freightFee','guaranteeFee','feeCurrency','purchasePrice'])assert.equal(f in n,false,f);
  assert.deepEqual(data.transport,[],'Ic Nakliye varsayilan olarak kapali');
  assert.equal(data.user.permissions.transport.access,false);
 }finally{store.close();}
});

test('finance granted for one module opens that module only',async()=>{
 const {store,admin}=await seeded();
 try{
  await grant(store,admin,'personel.demo',{logistics:{access:true,finance:true}});
  const data=store.data(as(store,'personel.demo'));
  assert.equal(data.shipments.find(r=>r.fileNo===shipment.fileNo).purchasePrice,300);
  const n=data.ncts.find(r=>r.no===ncts.no);
  assert.equal('freightFee' in n,false,'NCTS finansi ayri yetkidir');
  assert.equal('purchasePrice' in n,true,'alis fiyatinin sahibi Lojistik; yetki var');
 }finally{store.close();}
});

test('a stray finance field stays hidden when its owning module is not granted',async()=>{
 const {store,admin}=await seeded();
 try{
  await grant(store,admin,'personel.demo',{ncts:{access:true,finance:true}});
  const n=store.data(as(store,'personel.demo')).ncts.find(r=>r.no===ncts.no);
  assert.equal(n.freightFee,120);
  assert.equal('purchasePrice' in n,false,'NCTS finansi Lojistik alis fiyatini acmaz');
 }finally{store.close();}
});

test('Ic Nakliye shows operations without money until finance is granted',async()=>{
 const {store,admin}=await seeded();
 try{
  await grant(store,admin,'personel.demo',{transport:{access:true,finance:false}});
  let row=store.data(as(store,'personel.demo')).transport[0];
  assert.equal(row.company,'Vicem Yapı');assert.equal(row.customs,'Halkalı');
  for(const f of ['fee','currency','paid'])assert.equal(f in row,false,f);

  await grant(store,admin,'personel.demo',{transport:{access:true,finance:true}});
  row=store.data(as(store,'personel.demo')).transport[0];
  assert.equal(row.fee,2500);assert.equal(row.paid,false);
 }finally{store.close();}
});

test('a module without access refuses writes instead of dropping them',async()=>{
 const {store}=await seeded();
 try{
  const staff=as(store,'personel.demo');
  await assert.rejects(store.sync(staff,{_revision:store.revision(),transport:[{...transport,company:'Değişti'}]}),e=>e.status===403);
  assert.equal(store.data(as(store,'yonetici.demo')).transport[0].company,'Vicem Yapı');
 }finally{store.close();}
});

test('staff without finance cannot change money, and their edit keeps the old value',async()=>{
 const {store,admin}=await seeded();
 try{
  await grant(store,admin,'personel.demo',{transport:{access:true,finance:false}});
  const staff=as(store,'personel.demo');
  await store.sync(staff,{_revision:store.revision(),transport:[{id:transport.id,company:'Vicem Yapı',warehouse:'Antrepo 5',fee:1,paid:true,currency:'USD'}]});
  const row=store.data(as(store,'yonetici.demo')).transport[0];
  assert.equal(row.warehouse,'Antrepo 5','operasyon alani yazilir');
  assert.equal(row.fee,2500);assert.equal(row.paid,false);assert.equal(row.currency,'TRY');

  await store.sync(staff,{_revision:store.revision(),shipments:[{fileNo:shipment.fileNo,purchasePrice:1,salePrice:1}]});
  const s=store.data(as(store,'yonetici.demo')).shipments.find(r=>r.fileNo===shipment.fileNo);
  assert.equal(s.purchasePrice,300);assert.equal(s.salePrice,500);
 }finally{store.close();}
});

test('finance permission writes money but never who a record belongs to',async()=>{
 const {store,admin}=await seeded();
 try{
  await grant(store,admin,'personel.demo',{logistics:{access:true,finance:true},transport:{access:true,finance:true}});
  const staff=as(store,'personel.demo');
  await store.sync(staff,{_revision:store.revision(),shipments:[{fileNo:shipment.fileNo,purchasePrice:310,customerCompanyIds:['baska-firma'],sourceOfferId:'x'}]});
  const s=store.data(as(store,'yonetici.demo')).shipments.find(r=>r.fileNo===shipment.fileNo);
  assert.equal(s.purchasePrice,310);
  assert.ok(!s.customerCompanyIds.includes('baska-firma'),'musteri baglantisi yalniz yoneticinin');
  assert.equal(s.sourceOfferId,undefined);
  // Baska modulun finans alani bu kayda yazilamaz.
  await store.sync(staff,{_revision:store.revision(),shipments:[{fileNo:shipment.fileNo,freightFee:5}]});
  assert.equal('freightFee' in store.data(as(store,'yonetici.demo')).shipments.find(r=>r.fileNo===shipment.fileNo),false);
  await store.sync(staff,{_revision:store.revision(),transport:[{...transport,paid:true}]});
  assert.equal(store.data(as(store,'yonetici.demo')).transport[0].paid,true);
 }finally{store.close();}
});

test('revoking finance takes effect on the next request of an open session',async()=>{
 const {store,admin}=await seeded();
 try{
  await grant(store,admin,'personel.demo',{logistics:{access:true,finance:true}});
  const request=session(store,'personel.demo');
  assert.equal(store.data(request()).shipments.find(r=>r.fileNo===shipment.fileNo).purchasePrice,300);
  await grant(store,admin,'personel.demo',{logistics:{access:true,finance:false}});
  const next=request();
  assert.ok(next,'yetki degisikligi oturumu dusurmez');
  assert.equal('purchasePrice' in store.data(next).shipments.find(r=>r.fileNo===shipment.fileNo),false);
 }finally{store.close();}
});

test('removing module access also closes its documents',async()=>{
 const {store,admin}=await seeded();
 try{
  const ops=portalOperations(store);
  const request=session(store,'personel.demo');
  assert.doesNotThrow(()=>ops.list(request(),'ncts',ncts.no));
  await grant(store,admin,'personel.demo',{ncts:{access:false}});
  assert.throws(()=>ops.list(request(),'ncts',ncts.no),e=>e.status===404);
 }finally{store.close();}
});

test('customers never reach Ic Nakliye nor any finance field',async()=>{
 const {store}=await seeded();
 try{
  const data=store.data(as(store,'musteri.demo'));
  assert.deepEqual(data.transport,[]);
  for(const r of data.shipments)for(const f of ['purchasePrice','profit','share','shareTL','exchangeRate'])assert.equal(f in r,false);
  for(const r of data.ncts)for(const f of ['freightFee','guaranteeFee','feeCurrency','purchasePrice'])assert.equal(f in r,false);
  await assert.rejects(store.sync(as(store,'musteri.demo'),{_revision:store.revision(),transport:[transport]}),e=>e.status===403);
 }finally{store.close();}
});

test('saving a user without the table keeps the stored grants; becoming a customer drops them',async()=>{
 const {store,admin}=await seeded();
 try{
  await grant(store,admin,'personel.demo',{transport:{access:true,finance:true}});
  // Yetki tablosunu bilmeyen eski bir ekran kaydederse yetki silinmemeli.
  const users=store.data(admin).users.map(({permissions,...u})=>u);
  await store.sync(admin,{_revision:store.revision(),users});
  assert.equal(permissionsFor(store.data(admin).users.find(u=>u.username==='personel.demo')).transport.finance,true);

  const demoted=store.data(admin).users.map(u=>u.username==='personel.demo'?{...u,role:'Görüntüleme',companyId:'demo-anadolu'}:u);
  await store.sync(admin,{_revision:store.revision(),users:demoted});
  assert.equal(store.data(admin).users.find(u=>u.username==='personel.demo').permissions,undefined);
 }finally{store.close();}
});

test('Ic Nakliye rows are rebuilt from an allowlist',()=>{
 const [row]=normalizeTransport([{...transport,fee:'1250.555',onclick:'alert(1)',profit:9}]);
 assert.equal(row.fee,1250.56);
 assert.equal('onclick' in row,false);assert.equal('profit' in row,false);
 assert.throws(()=>normalizeTransport([{...transport,company:'  '}]),/Firma zorunludur/);
 assert.throws(()=>normalizeTransport([{...transport,fee:-1}]),/ücreti geçersiz/);
 assert.throws(()=>normalizeTransport([{...transport,fee:'abc'}]),/ücreti geçersiz/);
 assert.throws(()=>normalizeTransport([{...transport,currency:'BTC'}]),/Döviz/);
 assert.throws(()=>normalizeTransport([{...transport,paid:'evet'}]),/evet\/hayır/);
 assert.throws(()=>normalizeTransport([transport,transport]),/tekrar/);
 assert.equal(normalizeTransport([{id:'IN-1',company:'A',fee:''}])[0].fee,null);
});
