import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import vm from 'node:vm';
import {createTenantStore} from '../tenant-store.mjs';
import {normalizeLedger} from '../ledger.mjs';

const entry=(over={})=>({id:'L-1',kind:'customer',company:'Vicem Yapı',currency:'EUR',type:'invoice',reference:'FTR-2026-001',date:'2026-11-10',amount:125050,note:'',...over});
const login=(store,username,password)=>store.principal({headers:{cookie:'ascend_sid='+store.login(username,password).token}});

// Cari eskiden tarayicida tutuluyordu ve sunucuya hic ulasmiyordu: her kayit
// sayfa yenilenince kayboluyordu. Bu test o hatanin geri gelmedigini gosterir.
test('a ledger entry survives closing and reopening the store',async()=>{
 const file=join(mkdtempSync(join(tmpdir(),'ascend-ledger-')),'portal.json');
 const first=await createTenantStore(file,{bootstrapPassword:'ledger-test-bootstrap-2026'});
 const admin=login(first,'ascend lojistik','ledger-test-bootstrap-2026');
 await first.sync(admin,{_revision:first.revision(),ledger:[entry()]});
 first.close();
 const again=await createTenantStore(file,{bootstrapPassword:'ledger-test-bootstrap-2026'});
 try{
  const saved=again.data(login(again,'ascend lojistik','ledger-test-bootstrap-2026')).ledger;
  assert.equal(saved.length,1);assert.equal(saved[0].amount,125050);assert.equal(saved[0].reference,'FTR-2026-001');
 }finally{again.close();}
});

test('only the administrator reads or writes the ledger',async()=>{
 const store=await createTenantStore();
 try{
  const admin=login(store,'yonetici.demo','AscendDemo!2026');
  await store.sync(admin,{_revision:store.revision(),ledger:[entry(),entry({id:'L-2',kind:'carrier',company:'Taşıyıcı A',reference:'ALIS-9'})]});
  // Finans yetkisi verilmis personel bile cariyi goremez: tasiyici carisi alis fiyati icerir.
  const users=store.data(admin).users.map(u=>u.username==='personel.demo'?{...u,permissions:{logistics:{access:true,finance:true},ncts:{access:true,finance:true},transport:{access:true,finance:true}}}:u);
  await store.sync(admin,{_revision:store.revision(),users});
  const staff=login(store,'personel.demo','AscendDemo!2026');
  assert.deepEqual(store.data(staff).ledger,[]);
  await assert.rejects(store.sync(staff,{_revision:store.revision(),ledger:[entry({id:'X'})]}),e=>e.status===403,'reddedilmeli, sessizce dusurulmemeli');
  assert.deepEqual(store.data(login(store,'musteri.demo','AscendDemo!2026')).ledger,[]);
  assert.equal(store.data(admin).ledger.length,2);
 }finally{store.close();}
});

test('entries are immutable; a removed entry is written to the audit log with its content',async()=>{
 const store=await createTenantStore();
 try{
  const admin=login(store,'yonetici.demo','AscendDemo!2026');
  await store.sync(admin,{_revision:store.revision(),ledger:[entry()]});
  await assert.rejects(store.sync(admin,{_revision:store.revision(),ledger:[entry({amount:1})]}),/değiştirilemez/);
  await store.sync(admin,{_revision:store.revision(),ledger:[]});
  assert.deepEqual(store.data(admin).ledger,[]);
  const rows=store.database.db.prepare("SELECT detail FROM audit WHERE action='state.update' ORDER BY id DESC").all();
  const removed=rows.map(r=>JSON.parse(r.detail)).flatMap(d=>d.changes||[]).find(c=>c.collection==='ledger'&&c.removed);
  assert.ok(removed,'silme denetim gunlugunde olmali');
  assert.equal(removed.removed.reference,'FTR-2026-001');assert.equal(removed.removed.amount,125050);
 }finally{store.close();}
});

test('entries are rebuilt from an allowlist and checked',()=>{
 const [row]=normalizeLedger([{...entry(),currency:'eur',secret:'x',onclick:'y'}]).rows;
 assert.equal(row.currency,'EUR');assert.equal('secret' in row,false);assert.equal('onclick' in row,false);
 for(const [bad,why] of [[{amount:12.5},/Tutar/],[{amount:0},/Tutar/],[{amount:'100'},/Tutar/],[{currency:'EURO'},/Üç harfli/],[{date:'10.11.2026'},/tarih/],[{reference:' '},/zorunludur/],[{kind:'supplier'},/Cari türü/],[{type:'refund'},/fatura ya da ödeme/],[{company:''},/Firma/]]){
  assert.throws(()=>normalizeLedger([entry(bad)]),why,JSON.stringify(bad));
 }
 // Ayni firma, doviz ve turde ayni referans iki kez girilemez; buyuk/kucuk harf ve I/i farki onemsiz.
 assert.throws(()=>normalizeLedger([entry(),entry({id:'L-2',company:'VİCEM YAPI',reference:'ftr-2026-001'})]),/zaten kayıtlı/);
 assert.doesNotThrow(()=>normalizeLedger([entry(),entry({id:'L-2',type:'payment'})]),'odeme ayni referansi kullanabilir');
 assert.doesNotThrow(()=>normalizeLedger([entry(),entry({id:'L-2',kind:'carrier'})]),'tasiyici carisi ayri');
});

test('the Cari tab and its arithmetic',()=>{
 const context={};vm.createContext(context);
 vm.runInContext(readFileSync(new URL('../prototype/finance-center.js',import.meta.url),'utf8'),context);
 const F=context.AscendFinance,plain=v=>JSON.parse(JSON.stringify(v));
 assert.ok(plain(F.financeTabs({role:'Yönetici'})).some(t=>t.key==='ledger'));
 assert.equal(plain(F.financeTabs({role:'Finans',permissions:{logistics:{access:true,finance:true}}})).some(t=>t.key==='ledger'),false,'Cari yalniz yoneticide');
 assert.equal(F.minorUnits('1250,50'),125050);assert.equal(F.minorUnits('1.250,50'),null);assert.equal(F.minorUnits('0'),null);
 const shipments=[{consignee:'Alıcı A',agent:'Taşıyıcı B'},{consignee:'ALICI A',agent:'Taşıyıcı B'}];
 const accounts=plain(F.ledgerAccounts(shipments,[{kind:'customer',company:'Yeni Firma',date:'2026-11-01'}],'customer'));
 assert.deepEqual(accounts.map(a=>[a.company,a.count]),[['Alıcı A',2],['Yeni Firma',0]],'ayni firma buyuk harfle de tek hesap');
 const entries=[{currency:'EUR',type:'invoice',amount:10000},{currency:'EUR',type:'payment',amount:3000},{currency:'USD',type:'payment',amount:500}];
 const customer=plain(F.ledgerTotals(entries,'customer'));
 assert.deepEqual(customer.map(t=>[t.currency,t.theyOwe,t.weOwe]),[['EUR',7000,0],['USD',0,500]],'dovizler ayri; musteride fatura fazlasi bize borc');
 const carrier=plain(F.ledgerTotals(entries,'carrier'));
 assert.deepEqual(carrier.map(t=>[t.currency,t.theyOwe,t.weOwe]),[['EUR',0,7000],['USD',500,0]],'tasiyicida fatura fazlasi bizim borcumuz');
});
