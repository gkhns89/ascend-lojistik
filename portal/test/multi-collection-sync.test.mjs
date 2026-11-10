import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTenantStore} from '../tenant-store.mjs';

// Bir istek birden fazla koleksiyonu degistirebilir (NCTS'den Ic Nakliye'ye
// aktarma boyle yapildi: yeni kayitlar eklendi, kaynak kayitlar silindi).
// Ya hepsi uygulanir ya hicbiri.
const login=store=>store.principal({headers:{cookie:'ascend_sid='+store.login('yonetici.demo','AscendDemo!2026').token}});
const ncts=no=>({no,sender:'Avrupa Tedarik',receiver:'Anadolu Dış Ticaret',freightFee:1500,feeCurrency:'EUR'});
const moved=(id,no)=>({id,source:'NCTS '+no,company:'Anadolu Dış Ticaret',container:true,fee:1500,currency:'EUR',paid:false});

test('a request that fails validation changes no collection',async()=>{
 const store=await createTenantStore();
 try{
  const admin=login(store);
  await store.sync(admin,{_revision:store.revision(),ncts:[ncts('A'),ncts('B')]});
  await assert.rejects(store.sync(admin,{_revision:store.revision(),transport:[moved('IN-1','A'),{id:'BAD',company:''}],ncts:[]}));
  const data=store.data(admin);
  assert.equal(data.ncts.length,2);assert.equal(data.transport.length,0);
 }finally{store.close();}
});

// Dogrulama hatasi atamadan once olur. Asil risk atamadan sonraki hatadir:
// kayit sirasinda baska bir oturum veritabanini degistirirse 409 gelir ve
// bellekteki durum geri alinmazsa ekranda kaydedilmemis bir degisiklik gorunur.
test('a request rejected after it was applied in memory leaves no trace',async()=>{
 const store=await createTenantStore();
 try{
  const admin=login(store);
  await store.sync(admin,{_revision:store.revision(),ncts:[ncts('A'),ncts('B')]});
  store.database.save(JSON.parse(store.database.current().body),store.revision(),'baska-oturum',{});
  await assert.rejects(store.sync(admin,{_revision:store.revision(),transport:[moved('IN-1','A'),moved('IN-2','B')],ncts:[]}),e=>e.status===409);
  const data=store.data(admin);
  assert.equal(data.ncts.length,2,'reddedilen istek NCTS kayitlarini silmis gorunmemeli');
  assert.equal(data.transport.length,0,'reddedilen istek Ic Nakliye kaydi eklemis gorunmemeli');
 }finally{store.close();}
});

// Aktarilan kayitlar geldikleri NCTS numarasini tasir. Kaynak kayit silindigi
// icin bu tek izdir; sonraki bir kayitta sessizce dusmemeli.
test('the source of a moved record survives later saves, by staff too',async()=>{
 const store=await createTenantStore();
 try{
  const admin=login(store);
  await store.sync(admin,{_revision:store.revision(),transport:[moved('IN-1','ASC-2026-0007')]});
  await store.sync(admin,{_revision:store.revision(),transport:store.data(admin).transport.map(r=>({...r,warehouse:'Antrepo 2'}))});
  assert.equal(store.data(admin).transport[0].source,'NCTS ASC-2026-0007');
  const users=store.data(admin).users.map(u=>u.username==='personel.demo'?{...u,permissions:{transport:{access:true,finance:false}}}:u);
  await store.sync(admin,{_revision:store.revision(),users});
  const staff=store.principal({headers:{cookie:'ascend_sid='+store.login('personel.demo','AscendDemo!2026').token}});
  const {source,...withoutSource}=store.data(staff).transport[0];
  await store.sync(staff,{_revision:store.revision(),transport:[{...withoutSource,customs:'Halkalı'}]});
  const saved=store.data(admin).transport[0];
  assert.equal(saved.customs,'Halkalı');assert.equal(saved.source,'NCTS ASC-2026-0007','personel kaydi da kaynagi korur');
 }finally{store.close();}
});

test('İç Nakliye offers saved companies, customs and warehouses as you type',()=>{
 const html=readFileSync(new URL('../prototype/ic-nakliye.html',import.meta.url),'utf8');
 for(const [input,list] of [['company','companyOptions'],['customs','customsOptions'],['warehouse','warehouseOptions']]){
  assert.match(html,new RegExp('id="'+input+'" list="'+list+'"'),input+' secenek listesine bagli olmali');
  assert.match(html,new RegExp('<datalist id="'+list+'">'),list);
 }
 assert.equal(html.includes('importCard'),false,'tek seferlik aktarma bolumu kaldirildi');
});
