import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createTenantStore} from '../tenant-store.mjs';
import {quoteService} from '../quotes.mjs';
import {rejectNewMarkup} from '../text-guard.mjs';

const password='AscendDemo!2026';
const as=(store,username)=>store.principal({headers:{cookie:'ascend_sid='+store.login(username,password).token}});
const payload='<img src=x onerror="fetch(`/api/tenant/sync`)">';

test('staff cannot store markup that would run in the administrator screen',async()=>{
 const store=await createTenantStore();
 try{
  const staff=as(store,'personel.demo');
  const companies=store.data(staff).companies;
  await assert.rejects(store.sync(staff,{_revision:store.revision(),companies:[...companies,{id:'kotu',name:payload}]}),e=>e.status===400&&/"<"/.test(e.message));
  await assert.rejects(store.sync(staff,{_revision:store.revision(),companies:[...companies,{id:'kotu2',name:'Temiz Firma',contacts:[{first:payload,email:'a@example.com'}]}]}),e=>e.status===400&&/contacts\[0\]\.first/.test(e.message),'ic ice alanlar da denetlenir');
  await assert.rejects(store.sync(staff,{_revision:store.revision(),shipments:[{fileNo:'ASC-1',shipper:'A',goods:payload}]}),e=>e.status===400);
  assert.equal(store.data(as(store,'yonetici.demo')).companies.some(c=>c.id==='kotu'),false);
 }finally{store.close();}
});

test('administrators are held to the same rule, users included, but not their passwords',async()=>{
 const store=await createTenantStore();
 try{
  const admin=as(store,'yonetici.demo');
  await assert.rejects(store.sync(admin,{_revision:store.revision(),transport:[{id:'IN-1',company:payload}]}),e=>e.status===400);
  const users=store.data(admin).users;
  await assert.rejects(store.sync(admin,{_revision:store.revision(),users:[...users,{username:'yeni',name:payload,role:'Operasyon',active:true,password:'yeterince-uzun-parola'}]}),e=>e.status===400);
  // Parola metin olarak hicbir yere basilmaz; '<' icerebilir.
  await store.sync(admin,{_revision:store.revision(),users:[...users,{username:'yeni',name:'Yeni Personel',role:'Operasyon',active:true,password:'a<b>c-uzun-parola'}]});
  assert.ok(store.login('yeni','a<b>c-uzun-parola'));
 }finally{store.close();}
});

test('quotation marks stay allowed: a two-inch pipe is a real cargo description',async()=>{
 const store=await createTenantStore();
 try{
  const admin=as(store,'yonetici.demo');
  await store.sync(admin,{_revision:store.revision(),shipments:[{fileNo:'ASC-2',shipper:'A',goods:'2" boru, 3 adet'}]});
  assert.equal(store.data(admin).shipments.find(r=>r.fileNo==='ASC-2').goods,'2" boru, 3 adet');
 }finally{store.close();}
});

test('a value already stored with markup does not block every later save',async()=>{
 // Eski bir kayitta '<' kalmis olabilir. O kayit degismedikce yonetici
 // baska alanlari ve baska kayitlari kaydedebilmeli; degeri yeni bir
 // isaretlemeyle degistirmek ise reddedilir.
 const previous=[{fileNo:'ESKI',goods:'eski <not>',shipper:'A'}];
 assert.doesNotThrow(()=>rejectNewMarkup('shipments',[{fileNo:'ESKI',goods:'eski <not>',shipper:'B'},{fileNo:'YENI',goods:'temiz'}],previous));
 assert.throws(()=>rejectNewMarkup('shipments',[{fileNo:'ESKI',goods:'yeni <script>',shipper:'A'}],previous),/"<"/);
 // Kalici dosyayla da: eski veri yeniden acildiginda kayit yapilabiliyor.
 const dir=mkdtempSync(join(tmpdir(),'ascend-guard-'));
 return (async()=>{
  const first=await createTenantStore(join(dir,'portal.json'),{bootstrapPassword:'guard-test-bootstrap-2026'});
  const login=s=>s.principal({headers:{cookie:'ascend_sid='+s.login('ascend lojistik','guard-test-bootstrap-2026').token}});
  const legacy=JSON.parse(first.database.current().body);
  legacy.shipments=[{fileNo:'ESKI',shipper:'A',goods:'eski <not>',customerCompanyIds:[]}];
  first.database.save(legacy,first.revision(),'test',{});
  first.close();
  const again=await createTenantStore(join(dir,'portal.json'),{bootstrapPassword:'guard-test-bootstrap-2026'});
  try{
   const admin=login(again);
   const rows=again.data(admin).shipments.map(r=>({...r,shipper:'B'}));
   await again.sync(admin,{_revision:again.revision(),shipments:rows});
   assert.equal(again.data(admin).shipments[0].shipper,'B');
  }finally{again.close();}
 })();
});

test('the public quote form refuses markup before anything is stored',async()=>{
 const store=await createTenantStore();
 try{
  const request={company:payload,person:'A',email:'a@example.com',phone:'1',direction:'İthalat',mode:'Kara',originCountry:'Almanya',originCity:'Berlin',originAddress:'x',destinationCountry:'Türkiye',destinationCity:'İstanbul',destinationAddress:'y',goods:'z',packages:'1',gross:'10',net:'9',dimensions:'10 x 10 x 10',readyDate:'2026-12-01',incoterm:'FCA'};
  assert.throws(()=>quoteService(store).intake(request),/"<"/);
  assert.equal(quoteService(store).list(as(store,'yonetici.demo')).length,0);
 }finally{store.close();}
});

// Gerileme bekcisi. Prototipte HTML ureten bir sablona, kacirma fonksiyonundan
// gecmeden kayit alani (r.x, c.x, m.x, u.x, x.x) yazilirsa bu test kirilir.
// Bugun kapatilan acik boyle bir satirdan dogmustu.
test('no prototype template writes a record field into HTML unescaped',()=>{
 const dir=new URL('../prototype/',import.meta.url);
 const raw=/^(?:r|m|c|x|u)\.[A-Za-z]+(?:\|\|'[^']*')?$/;
 const findings=[];
 for(const name of readdirSync(dir).filter(f=>/\.(html|js)$/.test(f))){
  const source=readFileSync(new URL(name,dir),'utf8');
  for(const literal of source.match(/`(?:\\.|[^`\\])*`/gs)||[]){
   if(!/<[a-zA-Z/]/.test(literal))continue;
   for(const [,expression] of literal.matchAll(/\$\{\s*([^{}]*?)\s*\}/g)){
    if(raw.test(expression))findings.push(name+': ${'+expression+'}');
   }
  }
 }
 assert.deepEqual(findings,[],'Kacirilmamis kayit alani:\n'+findings.join('\n'));
});
