(() => {
 const state=window.portalBootstrap;
 if(!state)return;
 const nativeStorage=window['local'+'Storage'];
 const values={ascend_users:state.users,ascend_companies:state.companies,ascend_shipments:state.shipments,ascend_ncts_records:state.ncts};
 const cache=Object.fromEntries(Object.entries(values).map(([k,v])=>[k,JSON.stringify(v)]));
 const session={ascend_session:JSON.stringify(state.user),ascend_logistics_demo_customer:JSON.stringify(state.shipments),ascend_logistics_demo_staff:JSON.stringify(state.shipments),ascend_logistics_demo_companies:JSON.stringify(state.companies),ascend_ncts_role_demo:JSON.stringify(state.ncts)};
 const mapping={ascend_users:'users',ascend_companies:'companies',ascend_shipments:'shipments',ascend_ncts_records:'ncts',ascend_logistics_demo_staff:'shipments',ascend_logistics_demo_companies:'companies',ascend_ncts_role_demo:'ncts'};
 let queue=Promise.resolve(),revision=state.revision,conflicted=false;
 function status(text){let note=document.getElementById('serverSaveStatus');if(!note){note=document.createElement('p');note.id='serverSaveStatus';note.setAttribute('role','status');note.className='no-print';document.body.append(note);}note.textContent=text;}
 function save(key,value){if(!mapping[key])return;if(['Görüntüleme','Müşteri'].includes(state.user.role))return;
 queue=queue.then(async()=>{if(conflicted)throw Error('Kayıt çakışması var. Girdiğiniz verileri koruyup sayfayı yenileyin.');const res=await fetch('/api/tenant/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({_revision:revision,[mapping[key]]:JSON.parse(value)})});const result=await res.json();if(!res.ok){if(res.status===409)conflicted=true;throw Error(result.error||'Sunucu kaydı tamamlanamadı.');}revision=result.revision;status('Sunucuya kaydedildi.');}).catch(e=>status(e.message));}
 window.portalLocal={getItem:k=>k==='ascend-portal-theme'?nativeStorage.getItem(k):cache[k]??null,setItem(k,v){if(k==='ascend-portal-theme'){nativeStorage.setItem(k,v);return;}if(cache[k]===String(v))return;cache[k]=String(v);save(k,v);},removeItem:k=>delete cache[k]};
 window.portalSession={getItem:k=>session[k]??null,setItem(k,v){if(session[k]===String(v))return;session[k]=String(v);save(k,v);},removeItem:k=>delete session[k]};
 window.portalSavePending=()=>queue;
 // Sayfa ust kismina kisayollar. Eskiden her biri iri bir dugme olarak
 // basliga ekleniyor ve iki satira tasiyordu; artik tek, kucuk bir serit.
 window.addEventListener('DOMContentLoaded',()=>{
  const role=state.user.role,customer=['Müşteri','Görüntüleme'].includes(role),admin=role==='Yönetici';
  const anyFinance=admin||Object.values(state.user.permissions||{}).some(p=>p&&p.finance===true);
  if(!document.getElementById('portalShortcutStyle')){
   const style=document.createElement('style');style.id='portalShortcutStyle';
   style.textContent='.portal-shortcuts{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-left:auto}'
    +'.portal-shortcut{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--border,#d0d5dd);border-radius:999px;font-size:13px;font-weight:600;line-height:1.2;text-decoration:none;color:var(--text,inherit);background:var(--card,transparent);white-space:nowrap}'
    +'.portal-shortcut:hover{background:var(--surface-soft,var(--soft,#f2f4f7))}'
    +'.portal-shortcut[aria-current=page]{border-color:var(--primary,#302080);color:var(--primary,#302080)}'
    +'.portal-shortcut .note{font-weight:500;color:var(--muted,#667085);font-size:12px}'
    +'@media print{.portal-shortcuts{display:none}}';
   document.head.append(style);
  }
  const host=document.querySelector('header')||document.querySelector('.topbar')||document.body;
  const nav=document.createElement('nav');nav.className='portal-shortcuts no-print';nav.setAttribute('aria-label','Kısayollar');
  const here=location.pathname.split('/').pop();
  const add=(href,text)=>{const a=document.createElement('a');a.href=href;a.className='portal-shortcut';a.textContent=text;if(here===href)a.setAttribute('aria-current','page');nav.append(a);return a;};
  if(anyFinance)add('finans.html','Finans');
  add('control-center.html','Evrak ve Hesap Merkezi');
  if(!customer)add('quote-center.html','Hızlı Fiyat Al');
  if(admin){
   add('offer-center.html','Teklif Yönetimi');
   add('mail-import.html','Mailden Talep / Fiyat');
   const monitor=add('monitor-center.html','Takip Merkezi');
   const note=document.createElement('span');note.className='note';
   fetch('/api/tenant/monitor').then(r=>r.ok?r.json():Promise.reject()).then(data=>{const count=data.failures.length+data.offers.length+data.payments.length;if(count){note.textContent=count+' uyarı';monitor.append(note);}}).catch(()=>{note.textContent='durum alınamadı';monitor.append(note);});
  }
  host.append(nav);
  for(const b of document.querySelectorAll('button'))if(/^Çıkış(?: Yap)?$/.test(b.textContent.trim()))b.onclick=async()=>{await queue;await fetch('/api/tenant/logout',{method:'POST'});location.href='index.html';};
 });
})();
