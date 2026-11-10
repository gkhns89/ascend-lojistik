// Portalin ortak ust basligi. Oturum acik her sayfaya sunucu tarafindan
// eklenir (server.mjs, tenant-bridge.js ile birlikte) ve sayfanin kendi
// <header>'inin yerine ayni yapiyi kurar:
//
//   [logo] [Ana Sayfa · NCTS / T1 · İç Nakliye · Lojistik · Finans]   [Araçlar v] [Kullanıcı v]
//   (varsa) sayfanin kendi bolum sekmeleri
//
// Moduller ve araclar kullanicinin yetkisine gore gosterilir; asil sinir
// sunucudadir, burada gizlemek yalniz bos ya da reddedilen ekrana
// gondermemek icindir. Telefonda tum baglantilar "Menü" panelinde toplanir.
//
// Kullanici verisi yalniz textContent ile yazilir.
(function(){
  const boot=window.portalBootstrap;
  if(!boot||!boot.user)return;
  const root=document.documentElement;
  // Eski baslik, ortak baslik kurulana kadar gorunmez; bir an eski duzen gorunmesin.
  root.classList.add('shell-pending');

  const user=boot.user;
  const role=user.role||'';
  const admin=role==='Yönetici';
  const customer=['Müşteri','Görüntüleme'].includes(role);
  const perms=user.permissions||{};
  const access=key=>admin||perms[key]?.access===true;
  const anyFinance=admin||Object.values(perms).some(p=>p&&p.finance===true);
  const view=customer?'customer':admin?'':'staff';
  const withView=href=>{if(!view)return href;const u=new URL(href,location.href);u.searchParams.set('view',view);return u.pathname.split('/').pop()+u.search+u.hash;};
  const here=location.pathname.split('/').pop()||'index.html';
  const params=new URLSearchParams(location.search);

  const MODULES=[
    {href:'index.html',label:'Ana Sayfa',show:true},
    {href:'01_NCTS_BRANDED_v15.html',label:'NCTS / T1',show:access('ncts'),view:true},
    {href:'ic-nakliye.html',label:'İç Nakliye',show:access('transport')},
    {href:'02_LOJISTIK_PORTAL_BRANDED_v14.html',label:'Lojistik',show:access('logistics'),view:true,
      // Firma Kartlari ayni sayfada; o bolum acikken Lojistik degil Araclar etkin.
      current:()=>params.get('section')!=='companies'},
    {href:'finans.html',label:'Finans',show:anyFinance},
  ].filter(m=>m.show);
  const TOOLS=[
    {href:view==='staff'?'02_LOJISTIK_PORTAL_BRANDED_v14.html?view=staff&section=companies':'02_LOJISTIK_PORTAL_BRANDED_v14.html?section=companies',page:'02_LOJISTIK_PORTAL_BRANDED_v14.html',label:'Firma Kartları',show:!customer,current:()=>params.get('section')==='companies'},
    {href:'control-center.html',label:'Evrak ve Hesap Merkezi',show:true},
    {href:'quote-center.html',label:'Hızlı Fiyat Al',show:!customer},
    {href:'offer-center.html',label:'Teklif Yönetimi',show:admin},
    {href:'mail-import.html',label:'Mailden Talep / Fiyat',show:admin},
    {href:'monitor-center.html',label:'Takip Merkezi',show:admin,id:'monitor'},
    {href:'03_KULLANICI_YONETIMI.html',label:'Kullanıcı Yönetimi',show:admin},
  ].filter(t=>t.show);
  const isCurrent=item=>(item.page||item.href.split('?')[0])===here&&(item.current?item.current():true);

  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
  function link(item,cls){
    const a=el('a',cls,item.label);
    a.href=item.view?withView(item.href):item.href;
    if(isCurrent(item))a.setAttribute('aria-current','page');
    if(item.id)a.dataset.shellItem=item.id;
    return a;
  }
  const initials=name=>String(name||'?').trim().split(/\s+/).slice(0,2).map(w=>w.charAt(0).toLocaleUpperCase('tr-TR')).join('')||'?';

  // Acilir menu: dugme + panel (aciklama deseni). Esc ve disari tiklama kapatir.
  const menus=[];
  function menu(cls,button,panel){
    const wrap=el('div','shell-menu '+cls);
    const id='shell-menu-'+menus.length;
    panel.id=id;panel.hidden=true;
    button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',id);
    button.addEventListener('click',e=>{e.stopPropagation();const open=panel.hidden;closeMenus();if(open){panel.hidden=false;button.setAttribute('aria-expanded','true');
      // Klavyeyle acildiysa (Enter/bosluk: detail 0) odak ilk ogeye gecer; fareyle acilista odak dugmede kalir.
      if(e.detail===0){const first=panel.querySelector('a,button');first&&first.focus();}}});
    wrap.append(button,panel);
    menus.push({button,panel});
    return wrap;
  }
  function closeMenus(except){for(const m of menus)if(m!==except&&!m.panel.hidden){m.panel.hidden=true;m.button.setAttribute('aria-expanded','false');}}
  document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('.shell-menu'))closeMenus();});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const open=menus.find(m=>!m.panel.hidden);if(open){closeMenus();open.button.focus();}});

  async function logout(){
    // Kopru bekleyen kayitlari bitirip oturumu kapatir; yoksa dogrudan kapat.
    if(typeof window.portalLogout==='function')return window.portalLogout();
    try{await fetch('/api/tenant/logout',{method:'POST'});}finally{location.href='index.html';}
  }

  function build(){
    const old=document.querySelector('body > header, header');
    if(old&&old.hasAttribute('data-shell-skip')){root.classList.remove('shell-pending');return;}

    const bar=el('header','app-bar no-print');
    bar.setAttribute('data-shell','');
    const inner=el('div','app-bar__inner');

    const brand=el('a','app-bar__brand');brand.href='index.html';brand.setAttribute('aria-label','Portal ana ekranı');
    const logo=document.createElement('img');logo.alt='ASCEND Lojistik';logo.src=root.dataset.theme==='dark'?'ascend-logo-dark.svg':'ascend-logo-light.svg';
    brand.append(logo);

    const nav=el('nav','app-bar__nav');nav.setAttribute('aria-label','Modüller');
    for(const m of MODULES)nav.append(link(m,'app-bar__link'));

    const end=el('div','app-bar__end');

    // Araclar
    let toolsWrap=null,badge=null,monitorNote=null;
    if(TOOLS.length){
      const btn=el('button','app-bar__btn');
      btn.append(el('span',null,'Araçlar'));
      badge=el('span','app-bar__badge');badge.hidden=true;btn.append(badge);
      btn.append(el('span','app-bar__caret'));
      if(TOOLS.some(isCurrent))btn.classList.add('is-active');
      const panel=el('div','shell-menu__panel');
      const list=el('ul','shell-menu__list');
      for(const t of TOOLS){const li=el('li');const a=link(t,'shell-menu__item');if(t.id==='monitor'){monitorNote=el('span','shell-menu__note');a.append(monitorNote);}li.append(a);list.append(li);}
      panel.append(list);
      toolsWrap=menu('shell-menu--tools',btn,panel);
      end.append(toolsWrap);
    }

    // Kullanici: ad, rol, tema ve cikis
    const name=user.name||user.username||'';
    const ubtn=el('button','app-bar__user');
    ubtn.setAttribute('aria-label','Hesap menüsü: '+name);
    ubtn.append(el('span','app-bar__avatar',initials(name)));
    const who=el('span','app-bar__who');who.append(el('strong',null,name),el('small',null,role));
    ubtn.append(who,el('span','app-bar__caret'));
    const upanel=el('div','shell-menu__panel shell-menu__panel--end');
    const head=el('div','shell-menu__head');head.append(el('strong',null,name),el('small',null,[role,user.username].filter(Boolean).join(' · ')));
    const themeSlot=el('div','shell-menu__theme');themeSlot.setAttribute('data-theme-slot','');
    const out=el('button','shell-menu__item shell-menu__logout','Çıkış yap');out.type='button';out.addEventListener('click',logout);
    upanel.append(head,themeSlot,out);
    end.append(menu('shell-menu--user',ubtn,upanel));

    // Telefon: tek "Menu" paneli
    const burger=el('button','app-bar__burger');
    burger.append(el('span','app-bar__burger-icon'),el('span',null,'Menü'));
    const drawer=el('div','shell-menu__panel shell-drawer');
    const dmods=el('ul','shell-menu__list');for(const m of MODULES){const li=el('li');li.append(link(m,'shell-menu__item'));dmods.append(li);}
    drawer.append(el('p','shell-menu__label','Modüller'),dmods);
    if(TOOLS.length){const dtools=el('ul','shell-menu__list');for(const t of TOOLS){const li=el('li');li.append(link(t,'shell-menu__item'));dtools.append(li);}drawer.append(el('p','shell-menu__label','Araçlar'),dtools);}
    const dwho=el('div','shell-menu__head');dwho.append(el('strong',null,name),el('small',null,role));
    const dtheme=el('div','shell-menu__theme');dtheme.setAttribute('data-theme-slot','');
    const dout=el('button','shell-menu__item shell-menu__logout','Çıkış yap');dout.type='button';dout.addEventListener('click',logout);
    drawer.append(dwho,dtheme,dout);
    end.append(menu('shell-menu--drawer',burger,drawer));

    inner.append(brand,nav,end);
    bar.append(inner);

    // Sayfanin kendi bolum sekmeleri (Lojistik: Yukleme Takip / Firma Kartlari)
    // ortak basligin altinda ayri bir satira tasinir. Ana Sayfa, Cikis ve
    // Finans dugmeleri ortak baslikta oldugu icin tekrar etmez.
    const pageNav=old&&old.querySelector('.portal-nav');
    if(pageNav){
      for(const b of [...pageNav.querySelectorAll('button')]){
        const text=b.textContent.trim();
        if(!b.dataset.section||b.dataset.section==='finance'||/^(Ana Sayfa|Çıkış)/.test(text))b.remove();
        else if(b.dataset.staffOnly!==undefined&&customer)b.remove();
      }
      if(pageNav.querySelector('button')){
        const sub=el('div','app-bar__sub');
        pageNav.className='portal-nav app-bar__tabs';
        pageNav.setAttribute('aria-label','Bölümler');
        for(const b of pageNav.querySelectorAll('button')){b.className='app-bar__tab';b.type='button';}
        sub.append(pageNav);
        bar.append(sub);
      }
    }

    if(old)old.replaceWith(bar);else document.body.prepend(bar);
    root.classList.remove('shell-pending');

    // Tema degisince logo resmi varyantla degisir (acik/koyu).
    new MutationObserver(()=>{logo.src=root.dataset.theme==='dark'?'ascend-logo-dark.svg':'ascend-logo-light.svg';}).observe(root,{attributes:true,attributeFilter:['data-theme']});

    // Takip Merkezi uyari sayisi (yalniz yonetici)
    if(admin&&monitorNote){
      fetch('/api/tenant/monitor').then(r=>r.ok?r.json():Promise.reject()).then(data=>{
        const count=(data.failures||[]).length+(data.offers||[]).length+(data.payments||[]).length;
        if(count){badge.textContent=String(count);badge.hidden=false;badge.title=count+' uyarı Takip Merkezi\'nde';monitorNote.textContent=count+' uyarı';}
      }).catch(()=>{});
    }
  }

  window.AscendShell={modules:MODULES,tools:TOOLS};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
  // Bir hata baslik kurulmadan kalirsa sayfa gorunmez kalmasin.
  setTimeout(()=>root.classList.remove('shell-pending'),1500);
})();
