import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createTenantStore} from '../tenant-store.mjs';

// NCTS kaydini Ic Nakliye kaydina ceviren planlayici, tarayicidaki gibi calisir.
const context={};vm.createContext(context);
vm.runInContext(readFileSync(new URL('../prototype/transport-import.js',import.meta.url),'utf8'),context);
const {planNctsTransfer}=context.AscendTransportImport;
const plain=v=>JSON.parse(JSON.stringify(v));
const ids=()=>{let n=0;return ()=>'IN-2026-'+String(++n).padStart(4,'0');};

const nctsRow=(no,over={})=>({no,date:'2026-10-01',sender:'Avrupa Tedarik GmbH',receiver:'Anadolu Dış Ticaret Ltd. Şti.',destCustoms:'Erenköy Gümrük Müdürlüğü',packages:'20',gross:'980',freightFee:1500,guaranteeFee:250,feeCurrency:'EUR',
 fields:{field_30:'Erenköy Antrepo',field_10:'Tuzla, İstanbul',field_5:'Berlin'},...over});

test('an NCTS record becomes a container İç Nakliye record priced at its freight fee',()=>{
 const [p]=plain(planNctsTransfer([nctsRow('ASC-2026-0007')],{nextId:ids(),now:'2026-11-10T00:00:00.000Z'}));
 assert.deepEqual(p.record,{id:'IN-2026-0001',source:'NCTS ASC-2026-0007',company:'Anadolu Dış Ticaret Ltd. Şti.',customs:'Erenköy Gümrük Müdürlüğü',warehouse:'Erenköy Antrepo',deliveryAddress:'Tuzla, İstanbul',container:true,paid:false,createdAt:'2026-11-10T00:00:00.000Z',packages:20,weight:980,fee:1500,currency:'EUR'});
 assert.deepEqual(p.errors,[]);
 assert.ok(p.warnings.some(w=>/Teminat/.test(w)),'teminatin aktarilmadigi soylenir');
});

test('the sender can be chosen as the company, with the sender address',()=>{
 const [p]=plain(planNctsTransfer([nctsRow('ASC-2026-0008')],{party:'sender',nextId:ids()}));
 assert.equal(p.record.company,'Avrupa Tedarik GmbH');assert.equal(p.record.deliveryAddress,'Berlin');
});

test('problems are reported before anything is saved',()=>{
 const plans=plain(planNctsTransfer([
  nctsRow('A',{receiver:'',fields:{}}),
  nctsRow('B',{feeCurrency:'AED'}),
  nctsRow('C',{freightFee:''}),
  nctsRow('D',{feeCurrency:''}),
  nctsRow('E',{packages:'abc',gross:'-3'}),
 ],{nextId:ids()}));
 assert.match(plans[0].errors.join(),/Firma/);
 assert.match(plans[1].errors.join(),/AED/,'Ic Nakliye bu dovizi tutamaz');
 assert.equal('fee' in plans[2].record,false);assert.match(plans[2].warnings.join(),/Navlun ücreti yok/);
 assert.equal(plans[3].record.currency,'TRY');assert.match(plans[3].warnings.join(),/TRY varsayıldı/);
 assert.equal('packages' in plans[4].record,false);assert.equal('weight' in plans[4].record,false);assert.deepEqual(plans[4].errors,[],'konteynerde kap/kilo zorunlu degil');
 assert.deepEqual(plans.map(p=>p.record.id),['IN-2026-0001','IN-2026-0002','IN-2026-0003','IN-2026-0004','IN-2026-0005']);
});

test('the transfer is one request: both collections change together or neither does',async()=>{
 const store=await createTenantStore();
 try{
  const admin=store.principal({headers:{cookie:'ascend_sid='+store.login('yonetici.demo','AscendDemo!2026').token}});
  const all=['ASC-2026-0006','ASC-2026-0007','ASC-2026-0008','ASC-2026-0009','ASC-2026-0010','ASC-2026-0011'].map(no=>nctsRow(no));
  await store.sync(admin,{_revision:store.revision(),ncts:all});
  const wanted=['ASC-2026-0007','ASC-2026-0008','ASC-2026-0009','ASC-2026-0010','ASC-2026-0011'];
  const planned=plain(planNctsTransfer(all.filter(r=>wanted.includes(r.no)),{nextId:ids()}));

  // Gecersiz bir Ic Nakliye kaydi araya girerse NCTS kayitlari silinmemeli.
  const broken=[...planned.map(p=>p.record),{id:'BAD',company:''}];
  await assert.rejects(store.sync(admin,{_revision:store.revision(),transport:broken,ncts:all.filter(r=>!wanted.includes(r.no))}));
  let data=store.data(admin);
  assert.equal(data.ncts.length,6,'basarisiz aktarmada NCTS kayitlari yerinde');
  assert.equal(data.transport.length,0);

  await store.sync(admin,{_revision:store.revision(),transport:planned.map(p=>p.record),ncts:all.filter(r=>!wanted.includes(r.no))});
  data=store.data(admin);
  assert.deepEqual(data.ncts.map(r=>r.no),['ASC-2026-0006'],'yalniz secilenler silinir');
  assert.deepEqual(data.transport.map(r=>[r.source,r.fee,r.currency,r.container]),wanted.map(no=>['NCTS '+no,1500,'EUR',true]));
 }finally{store.close();}
});

// Yukaridaki test dogrulama hatasini sinar: o hata atamadan once olur. Asil
// risk atamadan sonraki hatadir. Ornegin kayit sirasinda baska bir oturum
// veritabanini degistirirse kayit 409 ile reddedilir ve bellekteki durum geri
// alinmazsa ekranda kaydedilmemis bir aktarma gorunur.
test('a transfer rejected after it was applied in memory leaves no trace',async()=>{
 const store=await createTenantStore();
 try{
  const admin=store.principal({headers:{cookie:'ascend_sid='+store.login('yonetici.demo','AscendDemo!2026').token}});
  const all=['ASC-2026-0007','ASC-2026-0008'].map(no=>nctsRow(no));
  await store.sync(admin,{_revision:store.revision(),ncts:all});
  const planned=plain(planNctsTransfer(all,{nextId:ids()}));
  // Baska bir oturum veritabanina yazdi: sunucunun bellekteki surumu geride kaldi.
  const current=JSON.parse(store.database.current().body);
  store.database.save(current,store.revision(),'baska-oturum',{});
  await assert.rejects(store.sync(admin,{_revision:store.revision(),transport:planned.map(p=>p.record),ncts:[]}),e=>e.status===409);
  const data=store.data(admin);
  assert.equal(data.ncts.length,2,'reddedilen aktarma NCTS kayitlarini silmis gorunmemeli');
  assert.equal(data.transport.length,0,'reddedilen aktarma Ic Nakliye kaydi eklemis gorunmemeli');
 }finally{store.close();}
});

test('İç Nakliye offers saved companies, customs and warehouses as you type',()=>{
 const html=readFileSync(new URL('../prototype/ic-nakliye.html',import.meta.url),'utf8');
 for(const [input,list] of [['company','companyOptions'],['customs','customsOptions'],['warehouse','warehouseOptions']]){
  assert.match(html,new RegExp('id="'+input+'" list="'+list+'"'),input+' secenek listesine bagli olmali');
  assert.match(html,new RegExp('<datalist id="'+list+'">'),list);
 }
});
