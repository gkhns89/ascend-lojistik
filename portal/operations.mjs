import {randomUUID,createHash} from 'node:crypto';
import {permissionsFor} from './permissions.mjs';
import {pdfRecord,renderTransportPdf,trDate} from './transport-pdf.mjs';

// Yeni Ic Nakliye kaydi bildiriminin metni. Yalniz operasyon alanlari:
// ucret, doviz ve odeme finans alanidir, e-postaya da PDF'e de girmez.
export function transportNotice(record,actor,origin){
 const r=pdfRecord(record),or=v=>v===undefined||v===null||String(v).trim()===''?'—':String(v);
 const lines=[
  'Merhaba,','',
  (actor?.name||actor?.username||'Bir kullanıcı')+" İç Nakliye'ye yeni bir kayıt açtı.",'',
  'Kayıt no: '+r.id,
  'Kayıt tarihi: '+trDate(r.createdAt),
  'Firma: '+or(r.company),
  'Gümrük: '+or(r.customs),
  'Depo: '+or(r.warehouse),
  'Konteyner: '+(r.container?'Evet':'Hayır'),
  'Kap: '+(r.packages==null?'—':Number(r.packages).toLocaleString('tr-TR')),
  'Kilo: '+(r.weight==null?'—':Number(r.weight).toLocaleString('tr-TR',{maximumFractionDigits:2})+' kg'),
  'Teslim adresi: '+or(r.deliveryAddress),
 ];
 if(r.source)lines.push('Kaynak: '+r.source);
 lines.push('','Kaydın PDF hâli ektedir.');
 if(origin)lines.push('Portalda görmek için: '+origin+'/ic-nakliye.html');
 lines.push('',"Bu e-postayı, Kullanıcı Yönetimi'nde \"Yeni İç Nakliye kaydında e-posta\" seçeneğiniz açık olduğu için alıyorsunuz.");
 return {subject:'Yeni İç Nakliye kaydı: '+r.id+' · '+or(r.company).slice(0,80),text:lines.join('\n'),record:r};
}
const pdfName=id=>String(id||'kayit').replace(/[^A-Za-z0-9_-]/g,'_')+'.pdf';
export function portalOperations(store){
 const db=store.database.db;db.prepare("UPDATE outbox SET status='needs-review',last_error='Sunucu yeniden başlatıldı; teslim durumu kontrol edilmeli.' WHERE status='sending'").run();
 const requireStaff=u=>{if(!u||['Müşteri','Görüntüleme'].includes(u.role))throw Object.assign(Error('Yetkisiz'),{status:403});};
 const requireAdmin=u=>{if(u?.role!=='Yönetici')throw Object.assign(Error('Yetkisiz'),{status:403});};
 function access(u,module,id){if(!['shipments','ncts'].includes(module))throw Error('Geçersiz modül');const record=store.records(u,module).find(r=>String(r.id||r.fileNo||r.no)===id);if(!record)throw Object.assign(Error('Dosya bulunamadı'),{status:404});return record;}
 const customer=u=>['Müşteri','Görüntüleme'].includes(u.role);
 function recipients(u,module,id,event){requireStaff(u);const record=access(u,module,id);const companyName=record.direction==='İhracat'?record.shipper:record.consignee;const company=store.data(u).companies.find(c=>c.name===companyName);const key=event==='departure'?'notifyDeparture':'notifyArrival';const contacts=company?.contacts||[];const addresses=[...new Set(contacts.filter(c=>c[key]!==false).map(c=>String(c.email||'').trim().toLowerCase()).filter(e=>/^\S+@\S+\.\S+$/.test(e)))];return {company:company?.name||'',to:addresses.slice(0,1),cc:addresses.slice(1)};}
 return {recipients,
 // Yeni acilan Ic Nakliye kayitlari icin bildirim kuyruga alinir. Kayit
 // basina tek satir (unique_key), boylece ayni kayit iki kez bildirilmez.
 // Anahtarda olusturma zamani da var: son kayit silinince numarasi yeniden
 // verilir ve yeni kayit yine bildirilmeli.
 // Gonderim diger e-postalar gibi deliver() ile, SMTP aciksa yapilir.
 transportCreated(u,created,origin=''){
  if(!Array.isArray(created)||!created.length)return {queued:0};
  const to=[...new Set(store.transportSubscribers(u.username).map(x=>x.email))];
  if(!to.length)return {queued:0};
  let queued=0;
  for(const row of created){
   const notice=transportNotice(row,u,origin);
   const result=db.prepare('INSERT OR IGNORE INTO outbox VALUES(?,?,?,0,?,?,NULL)').run(randomUUID(),'transport-new:'+notice.record.id+':'+(notice.record.createdAt||''),'waiting-provider',new Date().toISOString(),JSON.stringify({kind:'transport-new',to,cc:[],subject:notice.subject,text:notice.text,record:notice.record,createdBy:u.username}));
   if(result.changes){queued++;store.database.audit(u.username,'transport.notice-queued',{recordId:notice.record.id,to});}
  }
  return {queued};
 },
 // Ic Nakliye PDF'i. Kayitlar records() uzerinden okunur: erisimi olmayan
 // hicbir kayit goremez, finans alanlari zaten PDF'e girmez.
 async transportPdf(u,ids,mode='record'){
  requireStaff(u);
  if(!permissionsFor(u).transport?.access)throw Object.assign(Error('Yetkisiz'),{status:403});
  if(!Array.isArray(ids)||!ids.length)throw Error('PDF için kayıt seçin');
  if(ids.length>2000)throw Error('Tek PDF en fazla 2000 kayıt içerebilir');
  const visible=new Map(store.records(u,'transport').map(r=>[String(r.id),r]));
  const rows=[...new Set(ids.map(String))].map(id=>visible.get(id)).filter(Boolean);
  if(!rows.length)throw Object.assign(Error('Kayıt bulunamadı'),{status:404});
  const body=await renderTransportPdf(rows,{mode:mode==='list'?'list':'record',generatedBy:u.name||u.username});
  store.database.audit(u.username,'transport.pdf',{count:rows.length,mode});
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul'}).format(new Date());
  return {body,name:rows.length===1&&mode!=='list'?pdfName(rows[0].id):'ic-nakliye-'+today+'.pdf'};
 },
 list(u,module,id){access(u,module,id);const rows=db.prepare('SELECT id,name,version,visible,mime,sha256,created_at FROM documents WHERE module=? AND record_id=? ORDER BY version DESC').all(module,id);if(!customer(u))return rows;const names=new Set();return rows.filter(r=>{if(!r.visible||names.has(r.name))return false;names.add(r.name);return true;}).map(({visible,...r})=>r);},
 upload(u,b){requireStaff(u);access(u,b.module,b.recordId);if(typeof b.base64!=='string'||b.base64.length>4*1024*1024)throw Error('Dosya en fazla 3 MB olabilir');const bytes=Buffer.from(b.base64,'base64');let mime;if(bytes.subarray(0,5).toString()==='%PDF-')mime='application/pdf';else if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))mime='image/png';else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';else throw Error('Yalnız PDF, PNG veya JPEG dosyası yükleyin');const name=String(b.name||'').replace(/[\x00-\x1f/\\]/g,'_').slice(0,160);if(!name)throw Error('Dosya adı gerekli');const version=db.prepare('SELECT MAX(version) AS latest FROM documents WHERE module=? AND record_id=? AND name=?').get(b.module,b.recordId,name).latest||0;if(b.expectedVersion!==undefined&&b.expectedVersion!==version)throw Object.assign(Error('Belge başka kullanıcı tarafından güncellendi.'),{status:409});const id=randomUUID();db.prepare('INSERT INTO documents VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,b.module,b.recordId,name,version+1,0,mime,createHash('sha256').update(bytes).digest('hex'),bytes,new Date().toISOString(),u.username);store.database.audit(u.username,'document.upload',{id,recordId:b.recordId,name,version:version+1});return {id,version:version+1};},
 publish(u,b){requireAdmin(u);if(b.reviewed!==true)throw Error('Müşteriye uygunluk kontrolünü onaylayın');const document=db.prepare('SELECT * FROM documents WHERE id=?').get(b.id);if(!document)throw Object.assign(Error('Belge bulunamadı'),{status:404});access(u,document.module,document.record_id);db.prepare('UPDATE documents SET visible=? WHERE id=?').run(b.visible?1:0,b.id);store.database.audit(u.username,'document.visibility',{id:b.id,visible:!!b.visible});return {};},
 download(u,id){const document=db.prepare('SELECT * FROM documents WHERE id=?').get(id);if(!document)throw Object.assign(Error('Belge bulunamadı'),{status:404});access(u,document.module,document.record_id);if(customer(u)&&!this.list(u,document.module,document.record_id).some(d=>d.id===id))throw Object.assign(Error('Belge bulunamadı'),{status:404});return document;},
 audit(u){requireAdmin(u);return db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 300').all().map(r=>({...r,detail:JSON.parse(r.detail)}));},
 async backup(u){requireAdmin(u);const result=await store.database.makeBackup();store.database.audit(u.username,'backup.verified',result);return result;},
 queue(u,b){requireStaff(u);const record=access(u,b.module,b.recordId);if(!['departure','arrival'].includes(b.event))throw Error('Bildirim türü geçersiz');const recipientsForNotice=recipients(u,b.module,b.recordId,b.event);const extra=(b.extraRecipients||[]).map(x=>String(x).trim().toLowerCase());if(extra.some(x=>!/^\S+@\S+\.\S+$/.test(x)))throw Error('Ek alıcı adresi geçersiz');const excluded=(b.excludedRecipients||[]).map(x=>String(x).trim().toLowerCase());if(excluded.length&&u.role!=='Yönetici')throw Object.assign(Error('Kayıtlı alıcıyı yalnız yönetici çıkarabilir'),{status:403});recipientsForNotice.to=recipientsForNotice.to.filter(x=>!excluded.includes(x));recipientsForNotice.cc=[...new Set([...recipientsForNotice.cc.filter(x=>!excluded.includes(x)),...extra])].filter(x=>!recipientsForNotice.to.includes(x));if(!recipientsForNotice.to.length&&recipientsForNotice.cc.length)recipientsForNotice.to.push(recipientsForNotice.cc.shift());if(!recipientsForNotice.to.length)throw Error('Firma kartına geçerli e-posta ekleyip ilgili bildirim tercihini açın.');const doc=this.download(u,b.documentId);if(!doc.visible||doc.module!==b.module||doc.record_id!==b.recordId||doc.mime!=='application/pdf')throw Error('Müşteriye açılmış ilgili PDF eklenmeli');const date=b.event==='departure'?record.departureDate:record.arrivalDate;if(!date)throw Error('Önce bildirim kaydı oluşturulmalı');const unique=[b.module,b.recordId,b.event,date,doc.id].join(':');const id=randomUUID();const subject=(b.event==='departure'?'Çıkış':'Varış')+' Bildirimi — '+b.recordId;const payload={to:recipientsForNotice.to,cc:recipientsForNotice.cc,subject,text:b.recordId+' numaralı sevkiyatın '+(b.event==='departure'?'çıkış':'varış')+' bildirimi '+date+' tarihinde oluşturulmuştur.'+((record.originalDocs||[]).length?' Orijinal evraklar: '+record.originalDocs.join(', '):''),documentId:doc.id,attachmentInfo:{name:doc.name,version:doc.version,sha256:doc.sha256}};db.prepare('INSERT OR IGNORE INTO outbox VALUES(?,?,?,0,?,?,NULL)').run(id,unique,'waiting-provider',new Date().toISOString(),JSON.stringify(payload));store.database.audit(u.username,'notice.queued',{recordId:b.recordId,event:b.event});return {status:'waiting-provider'};},
 outbox(u){requireAdmin(u);return db.prepare('SELECT id,status,attempts,next_at,last_error,payload FROM outbox ORDER BY next_at DESC LIMIT 100').all().map(r=>({...r,payload:JSON.parse(r.payload)}));},
 async deliver(transport){if(typeof transport!=='function')return {sent:0};let sent=0;for(const row of db.prepare("SELECT * FROM outbox WHERE status IN ('waiting-provider','retry') AND next_at<=? AND attempts<5").all(new Date().toISOString())){const claim=db.prepare("UPDATE outbox SET status='sending', attempts=attempts+1 WHERE id=? AND status IN ('waiting-provider','retry')").run(row.id);if(!claim.changes)continue;try{const payload=JSON.parse(row.payload);let attachment;if(payload.kind==='transport-new'){attachment={name:pdfName(payload.record?.id),mime:'application/pdf',body:await renderTransportPdf([payload.record])};}else if(!['quote','quote-ack'].includes(payload.kind)){const document=db.prepare('SELECT * FROM documents WHERE id=? AND visible=1').get(payload.documentId);if(!document)throw Error('PDF erişime kapatılmış');attachment={name:document.name,mime:document.mime,body:document.body};}await transport({...payload,attachment,idempotencyKey:row.id});db.prepare("UPDATE outbox SET status='sent',last_error=NULL WHERE id=?").run(row.id);store.database.audit('system','mail.sent',{id:row.id,to:payload.to,cc:payload.cc,documentId:payload.documentId||null,attachmentInfo:payload.attachmentInfo||null});sent++;}catch(e){db.prepare("UPDATE outbox SET status=?,next_at=?,last_error=? WHERE id=?").run(e.deliveryUncertain?'needs-review':row.attempts+1>=5?'failed':'retry',new Date(Date.now()+60000*2**row.attempts).toISOString(),'Gönderim başarısız. Hizmet bağlantısını kontrol edin.',row.id);}}return {sent};}
 };
}
