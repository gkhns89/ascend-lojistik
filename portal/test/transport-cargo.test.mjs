import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTransport} from '../transport.mjs';
import {createTenantStore} from '../tenant-store.mjs';

const row={id:'IN-2026-0001',company:'Vicem Yapı'};

test('without a container both package count and weight are required',()=>{
 assert.throws(()=>normalizeTransport([row]),/Konteyner değilse kap ve kilo zorunludur/);
 assert.throws(()=>normalizeTransport([{...row,packages:5}]),/zorunludur/);
 assert.throws(()=>normalizeTransport([{...row,weight:1200}]),/zorunludur/);
 assert.throws(()=>normalizeTransport([{...row,container:false,packages:5}]),/zorunludur/);
 const [saved]=normalizeTransport([{...row,packages:'5',weight:'1200.456'}]);
 assert.equal(saved.packages,5);assert.equal(saved.weight,1200.46);
});

test('a container needs neither, and no container number is kept',()=>{
 const [saved]=normalizeTransport([{...row,container:true,containerNo:'MSCU1234567'}]);
 assert.equal(saved.container,true);
 assert.equal('packages' in saved,false);assert.equal('weight' in saved,false);
 assert.equal('containerNo' in saved,false,'yalniz isaret tutulur');
 const [filled]=normalizeTransport([{...row,container:true,packages:2,weight:30}]);
 assert.equal(filled.packages,2);assert.equal(filled.weight,30,'konteynerde de girilebilir');
});

test('package count and weight are checked when given',()=>{
 assert.throws(()=>normalizeTransport([{...row,packages:2.5,weight:10}]),/Kap pozitif bir tam sayı/);
 assert.throws(()=>normalizeTransport([{...row,packages:0,weight:10}]),/Kap pozitif/);
 assert.throws(()=>normalizeTransport([{...row,packages:3,weight:-1}]),/Kilo pozitif/);
 assert.throws(()=>normalizeTransport([{...row,packages:3,weight:'abc'}]),/Kilo pozitif/);
 assert.throws(()=>normalizeTransport([{...row,container:'evet'}]),/Konteyner evet\/hayır/);
});

test('records saved before the rule are not blocked until their cargo changes',async()=>{
 // Kural sonradan geldi: eski kayitlarda kap ve kilo yok. Ekran her kayitta tum
 // listeyi gonderdigi icin, kural eski satira uygulansaydi hicbir sey kaydedilemezdi.
 const legacy=[{id:'IN-2026-0001',company:'Eski Firma'}];
 assert.doesNotThrow(()=>normalizeTransport([{...legacy[0],warehouse:'Yeni depo'},{...row,id:'IN-2026-0002',packages:1,weight:5}],legacy));
 assert.throws(()=>normalizeTransport([{...legacy[0],container:false,packages:4}],legacy),/zorunludur/,'yuk bilgisine dokunan eski kayit kurala uyar');
 assert.doesNotThrow(()=>normalizeTransport([{...legacy[0],container:true}],legacy));

 const store=await createTenantStore();
 try{
  const admin=store.principal({headers:{cookie:'ascend_sid='+store.login('yonetici.demo','AscendDemo!2026').token}});
  await assert.rejects(store.sync(admin,{_revision:store.revision(),transport:[row]}),/zorunludur/);
  await store.sync(admin,{_revision:store.revision(),transport:[{...row,container:true}]});
  assert.equal(store.data(admin).transport[0].container,true);
 }finally{store.close();}
});
