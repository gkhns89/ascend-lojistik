import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPortalServer} from '../server.mjs';
import {createTenantStore} from '../tenant-store.mjs';
import {portalOperations,transportNotice} from '../operations.mjs';
import {pdfRecord,renderTransportPdf} from '../transport-pdf.mjs';

// Ic Nakliye'de yeni kayit acilinca, Kullanici Yonetimi'nde isaretlenmis
// kisilere e-posta gider (ekinde kaydin PDF'i). PDF portaldan da indirilir.
// Ikisinde de ucret, doviz ve odeme yer almaz.

async function portal(){
 const server=await createPortalServer({PORTAL_PREVIEW_ENABLED:'true',PORTAL_PREVIEW_REQUIRE_AUTH:'false'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const call=(path,body,cookie)=>fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
 const login=async username=>(await call('/api/tenant/login',{username,password:'AscendDemo!2026'})).headers.get('set-cookie').split(';')[0];
 const data=async cookie=>(await call('/api/tenant/data',null,cookie)).json();
 const sync=async(cookie,body)=>{const {revision}=await data(cookie);return call('/api/tenant/sync',{_revision:revision,...body},cookie);};
 const close=()=>new Promise(r=>server.close(r));
 return {call,login,data,sync,close};
}
const record=(id,extra={})=>({id,company:'ALPİN ÇORAP SAN.VE TİC. A.Ş.',customs:'Ambarlı Gümrük Müdürlüğü',warehouse:'KUMPORT',deliveryAddress:'Beylikdüzü / İstanbul',container:true,createdAt:'2026-11-20T08:00:00.000Z',...extra});

test('a new İç Nakliye record opened by staff is queued to the subscribed administrator',async()=>{
 const p=await portal();
 try{
  const admin=await p.login('yonetici.demo');
  // Yonetici kendi bildirimini acar ve personele Ic Nakliye erisimi verir.
  let users=(await p.data(admin)).users.map(u=>u.username==='yonetici.demo'?{...u,email:'Yonetici@Example.com',notifyTransport:true}:u.username==='personel.demo'?{...u,permissions:{transport:{access:true,finance:false}}}:u);
  assert.equal((await p.sync(admin,{users})).status,200);
  assert.equal((await p.data(admin)).users.find(u=>u.username==='yonetici.demo').notifyTransport,true);
  assert.equal((await p.sync(admin,{users:users.map(u=>({...u,notifyTransport:u.username==='yonetici.demo'?'evet':u.notifyTransport}))})).status,400,'tercih evet/hayir olmali');

  const staff=await p.login('personel.demo');
  assert.equal((await p.sync(staff,{transport:[record('IN-2026-0001')]})).status,200);
  let outbox=await (await p.call('/api/tenant/outbox',null,admin)).json();
  assert.equal(outbox.length,1);
  const notice=outbox[0].payload;
  assert.equal(notice.kind,'transport-new');
  assert.deepEqual(notice.to,['yonetici@example.com']);
  assert.match(notice.subject,/IN-2026-0001/);
  assert.match(notice.text,/Demo Personel İç Nakliye'ye yeni bir kayıt açtı/);
  assert.match(notice.text,/Ambarlı Gümrük Müdürlüğü/);

  // Ayni kaydi duzenlemek yeni bildirim uretmez.
  const current=(await p.data(staff)).transport;
  assert.equal((await p.sync(staff,{transport:current.map(r=>({...r,warehouse:'Başka depo'}))})).status,200);
  assert.equal((await (await p.call('/api/tenant/outbox',null,admin)).json()).length,1);

  // Yoneticinin kendi actigi kayit kendisine bildirilmez.
  const mine=(await p.data(admin)).transport;
  assert.equal((await p.sync(admin,{transport:[...mine,record('IN-2026-0002',{fee:900,currency:'EUR',paid:true})]})).status,200);
  assert.equal((await (await p.call('/api/tenant/outbox',null,admin)).json()).length,1);

  // Isaretli ama Ic Nakliye erisimi olmayan kisi e-posta almaz.
  users=(await p.data(admin)).users.map(u=>u.username==='personel.demo'?{...u,email:'personel@example.com',notifyTransport:true,permissions:{transport:{access:false,finance:false}}}:u);
  assert.equal((await p.sync(admin,{users})).status,200);
  const latest=(await p.data(admin)).transport;
  assert.equal((await p.sync(admin,{transport:[...latest,record('IN-2026-0003')]})).status,200);
  assert.equal((await (await p.call('/api/tenant/outbox',null,admin)).json()).length,1);
 }finally{await p.close();}
});

test('the queued notice is sent with the record as a PDF and carries no money',async()=>{
 const store=await createTenantStore();
 try{
  const ops=portalOperations(store);
  const admin=store.data({role:'Yönetici'}).users.find(u=>u.username==='yonetici.demo');
  const users=store.data(admin).users.map(u=>u.username==='yonetici.demo'?{...u,email:'yonetici@example.com',notifyTransport:true}:u);
  await store.sync(admin,{users});
  const staff={username:'personel.demo',name:'Demo Personel',role:'Operasyon'};
  assert.deepEqual(ops.transportCreated(staff,[record('IN-2026-0009',{fee:2500,currency:'TRY',paid:false})],'https://portal.example.com'),{queued:1});
  assert.deepEqual(ops.transportCreated(staff,[record('IN-2026-0009',{fee:2500,currency:'TRY',paid:false})]),{queued:0},'ayni kayit iki kez kuyruga girmez');
  // Silinen son kaydin numarasi yeni kayda verilebilir; o da bildirilmeli.
  assert.deepEqual(ops.transportCreated(staff,[record('IN-2026-0009',{createdAt:'2026-11-21T08:00:00.000Z'})]),{queued:1});

  const sent=[];
  assert.equal((await ops.deliver(async payload=>{sent.push(payload);})).sent,2);
  const [mail]=sent;
  assert.equal(mail.attachment.name,'IN-2026-0009.pdf');
  assert.equal(mail.attachment.mime,'application/pdf');
  assert.equal(Buffer.from(mail.attachment.body).subarray(0,5).toString(),'%PDF-');
  assert.match(mail.text,/https:\/\/portal\.example\.com\/ic-nakliye\.html/);
  for(const key of ['fee','currency','paid'])assert.equal(key in mail.record,false,key);
  assert.doesNotMatch(mail.text,/2500|2\.500|TRY|Ücret|Ödeme/);
 }finally{store.close();}
});

test('PDF fields are the operational ones only',async()=>{
 const row=pdfRecord(record('IN-2026-0004',{fee:2500,currency:'EUR',paid:true,packages:7,weight:120.5,secret:'x'}));
 assert.deepEqual(Object.keys(row).sort(),['company','container','createdAt','customs','deliveryAddress','id','packages','warehouse','weight']);
 const notice=transportNotice(record('IN-2026-0004',{fee:2500}),{name:'Ayşe'},'');
 assert.doesNotMatch(notice.text,/2500|Portalda görmek/);
 for(const mode of ['record','list']){
  const pdf=await renderTransportPdf([record('IN-2026-0004'),record('IN-2026-0005',{container:false,packages:3,weight:10})],{mode});
  assert.equal(pdf.subarray(0,5).toString(),'%PDF-',mode);
 }
 await assert.rejects(renderTransportPdf([]),/kayıt yok/);
});

test('the PDF download follows İç Nakliye access',async()=>{
 const p=await portal();
 try{
  const admin=await p.login('yonetici.demo');
  assert.equal((await p.sync(admin,{transport:[record('IN-2026-0001'),record('IN-2026-0002',{container:false,packages:4,weight:80})]})).status,200);

  const single=await p.call('/api/tenant/transport/pdf?id=IN-2026-0001',null,admin);
  assert.equal(single.status,200);
  assert.equal(single.headers.get('content-type'),'application/pdf');
  assert.match(single.headers.get('content-disposition'),/IN-2026-0001\.pdf/);
  assert.equal(Buffer.from(await single.arrayBuffer()).subarray(0,5).toString(),'%PDF-');

  const list=await p.call('/api/tenant/transport/pdf',{ids:['IN-2026-0002','IN-2026-0001','yok']},admin);
  assert.equal(list.status,200);
  assert.match(list.headers.get('content-disposition'),/ic-nakliye-\d{4}-\d{2}-\d{2}\.pdf/);

  assert.equal((await p.call('/api/tenant/transport/pdf?id=yok',null,admin)).status,404);
  assert.equal((await p.call('/api/tenant/transport/pdf',{ids:[]},admin)).status,400);

  // Erisimi olmayan personel ve musteri PDF alamaz.
  const staff=await p.login('personel.demo');
  assert.equal((await p.call('/api/tenant/transport/pdf?id=IN-2026-0001',null,staff)).status,403);
  const customer=await p.login('musteri.demo');
  assert.equal((await p.call('/api/tenant/transport/pdf?id=IN-2026-0001',null,customer)).status,403);
  assert.equal((await p.call('/api/tenant/transport/pdf?id=IN-2026-0001')).status,401);

  // Erisim verilince personel de indirir.
  const users=(await p.data(admin)).users.map(u=>u.username==='personel.demo'?{...u,permissions:{transport:{access:true,finance:false}}}:u);
  assert.equal((await p.sync(admin,{users})).status,200);
  assert.equal((await p.call('/api/tenant/transport/pdf?id=IN-2026-0001',null,staff)).status,200);
 }finally{await p.close();}
});
