// Ortak veri tablosu davranisi: sutun basligindan siralama, gorunumun
// oturum boyunca korunmasi, nis basliklarin aciklamasi (data-help) ve
// aramada eslesmenin vurgulanmasi. Rehber: Pencil & Paper "Enterprise Data Tables"
// (todos/tablo-tasarim-iyilestirmesi.md).
//
// Siralama DOM'daki satirlari yeniden dizer; sayfa her cizimden sonra
// view.apply() cagirir. Basliga ilk tiklama metinde A-Z, sayida buyukten
// kucuge; ikinci tiklama tersi; ucuncusu sayfanin varsayilan sirasina doner.
// Bos deger ("—") yonden bagimsiz hep sona gider.
(function(){
  // Sunucu sayfadaki tarayici depolama adlarini portal koprusune cevirir; o
  // kopru yalniz is verisi icindir ve sayfa yenilenince bosalir. Gorunum
  // tercihi (siralama, filtre) is verisi degildir; tarayicinin oturum
  // deposunda tutulur ve yalniz bu sekmede kalir. Arama metni saklanmaz.
  const store=(()=>{try{return globalThis[['session','Storage'].join('')]||null;}catch{return null;}})();
  const PREFIX='ascend.view.';
  function read(key){try{return JSON.parse(store?.getItem(PREFIX+key)||'null');}catch{return null;}}
  function write(key,value){try{if(value==null)store?.removeItem(PREFIX+key);else store?.setItem(PREFIX+key,JSON.stringify(value));}catch{}}

  // Turkce sayi bicimi: 1.234,56 -> 1234.56
  function parseNumber(text){
    const cleaned=String(text).replace(/[^\d,.\-]/g,'').replace(/\./g,'').replace(',','.');
    if(!/\d/.test(cleaned))return null;
    const n=Number.parseFloat(cleaned);
    return Number.isFinite(n)?n:null;
  }
  // Hucrenin ust satirdaki metni: alt satir (.sub) haric. Arama vurgusu metni
  // <mark> parcalarina boldugu icin dogrudan metin ve mark birlikte okunur.
  function primaryText(cell){
    let text='';
    for(const node of cell.childNodes){
      if(node.nodeType===1&&node.classList.contains('sub'))break;
      if(node.nodeType===3||node.nodeName==='MARK')text+=node.textContent;
    }
    return text.trim()||cell.textContent.trim();
  }
  // Hucrenin siralama degeri: data-sort varsa o; onay kutusu varsa isaretli
  // mi; yoksa ust satirdaki metin.
  function cellValue(cell,numeric){
    if(!cell)return null;
    if(cell.dataset.sort!==undefined){
      if(cell.dataset.sort==='')return null;
      return numeric?Number(cell.dataset.sort):cell.dataset.sort;
    }
    // Satir secim kutusu (.row-select) siralama degeri degildir.
    const box=cell.querySelector('input[type=checkbox]:not(.row-select)');
    if(box)return box.checked?1:0;
    const text=primaryText(cell);
    if(!text||text==='—')return null;
    return numeric?parseNumber(text):text;
  }
  const collator=new Intl.Collator('tr',{numeric:true,sensitivity:'base'});

  // ---------- Baslik aciklamasi ----------
  // Nis basliklar (Kur, Pay TL...) data-help ile aciklanir. Fareyle basligin
  // title'i yeter; dokunmatik ve klavye icin basliga kucuk bir (?) dugmesi
  // eklenir. Aciklama tablonun kaydirma kabinda kirpilmasin diye sayfanin
  // ustunde tek bir kabarcikta gosterilir.
  const SORT_HINT='Sıralamak için tıklayın (üçüncü tıklama varsayılan sıraya döner)';
  let bubble=null,owner=null;
  function closeHelp(){
    if(!bubble||bubble.hidden)return;
    bubble.hidden=true;owner?.setAttribute('aria-expanded','false');owner=null;
  }
  function openHelp(button,text){
    if(!bubble){
      bubble=document.createElement('div');
      bubble.id='ascend-th-help';bubble.className='th-help-bubble';bubble.setAttribute('role','status');bubble.hidden=true;
      document.body.append(bubble);
      document.addEventListener('click',e=>{if(!e.target.closest?.('.th-help'))closeHelp();});
      document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHelp();});
      // Sayfa ya da tablo kayinca kabarcik dugmeyi izler; dugme gorunmez olunca kapanir.
      addEventListener('scroll',placeHelp,true);addEventListener('resize',placeHelp);
    }
    if(owner===button){closeHelp();return;}
    closeHelp();
    bubble.textContent=text;bubble.hidden=false;owner=button;button.setAttribute('aria-expanded','true');
    placeHelp();
  }
  function placeHelp(){
    if(!bubble||bubble.hidden||!owner)return;
    const r=owner.getBoundingClientRect(),view=document.documentElement;
    if(!owner.isConnected||r.bottom<0||r.top>innerHeight||r.right<0||r.left>view.clientWidth){closeHelp();return;}
    const width=bubble.offsetWidth,gap=8;
    bubble.style.left=Math.max(gap,Math.min(r.left+r.width/2-width/2,view.clientWidth-width-gap))+'px';
    bubble.style.top=(r.bottom+6)+'px';
  }
  function explain(table){
    for(const th of table.querySelectorAll('thead th[data-help]')){
      if(th.querySelector('.th-help'))continue;
      const label=th.textContent.trim(),text=th.dataset.help;
      th.title=text;
      const b=document.createElement('button');
      b.type='button';b.className='th-help';b.textContent='?';
      b.setAttribute('aria-label',label+' ne demek?');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','ascend-th-help');
      // Dugme basligin icinde: tiklama ve Enter siralamaya gitmesin.
      b.addEventListener('click',e=>{e.stopPropagation();openHelp(b,label+': '+text);});
      b.addEventListener('keydown',e=>e.stopPropagation());
      th.append(b);
    }
  }

  // ---------- Arama vurgusu ----------
  // Eslesen metin <mark> ile isaretlenir. Hucre metni kullanici verisidir:
  // yalniz metin dugumleri bolunur, HTML olarak hicbir sey yazilmaz.
  const fold=s=>String(s??'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i');
  function highlight(root,query){
    const q=fold(String(query??'').trim());
    if(!root||!q)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('button,label,mark,th,.pill')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const text=node.nodeValue,folded=fold(text);
      // Kucuk harfe cevirme uzunlugu degistirirse konumlar kayar; o metin atlanir.
      if(folded.length!==text.length)continue;
      let at=folded.indexOf(q);
      if(at<0)continue;
      const parts=document.createDocumentFragment();let from=0;
      while(at>=0){
        if(at>from)parts.append(text.slice(from,at));
        const mark=document.createElement('mark');mark.textContent=text.slice(at,at+q.length);parts.append(mark);
        from=at+q.length;at=folded.indexOf(q,from);
      }
      if(from<text.length)parts.append(text.slice(from));
      node.replaceWith(parts);
    }
  }

  // ---------- Durum bildirimi ----------
  // Sayfanin durum satiri (.page-status) sayfa kaysa da gorunur kalir (CSS:
  // sticky); kullanici tablonun altindayken de sonucu gorur. Modal pencere
  // acikken sayfa ortulu oldugundan hata pencerenin icine de yazilir. Basari
  // birkac saniye sonra kaybolur; hata tiklanip kapatilana ya da yeni mesaj
  // gelene dek kalir.
  let notifyTimer=0;
  function notify(node,text,kind){
    if(!node)return;
    clearTimeout(notifyTimer);
    node.textContent=text||'';node.dataset.kind=kind;
    if(!node.dataset.dismiss){
      node.dataset.dismiss='1';node.title='Kapatmak için tıklayın';
      node.addEventListener('click',()=>{node.textContent='';});
    }
    if(text&&kind==='ok')notifyTimer=setTimeout(()=>{node.textContent='';},6000);
    const dialog=document.querySelector('dialog[open]');
    if(!dialog)return;
    let box=dialog.querySelector('.dialog-status');
    if(!box){
      box=document.createElement('p');box.className='dialog-status';box.setAttribute('role','alert');
      const actions=dialog.querySelector('div.actions');
      if(actions)actions.before(box);else dialog.append(box);
      dialog.addEventListener('close',()=>{box.textContent='';});
    }
    box.textContent=kind==='error'?(text||''):'';
  }

  function sortable(table,key){
    explain(table);
    const head=table.tHead?.rows[0];
    if(!head)return {apply(){},reset(){}};
    let state=read(key);
    const headers=[...head.cells];
    function paint(){
      headers.forEach((th,i)=>{
        if(!th.classList.contains('sortable'))return;
        if(state&&state.col===i)th.setAttribute('aria-sort',state.dir==='asc'?'ascending':'descending');
        else th.removeAttribute('aria-sort');
      });
    }
    function apply(){
      const body=table.tBodies[0];
      if(!body)return;
      const rows=[...body.rows];
      // Bos-durum satiri (tek hucre, colspan) siralanmaz.
      if(rows.length<2||rows.some(r=>r.cells.length===1&&r.cells[0].colSpan>1))return;
      if(!state)return;
      const th=headers[state.col];
      if(!th)return;
      const numeric=th.classList.contains('num')||th.dataset.sortType==='number';
      const sign=state.dir==='asc'?1:-1;
      const keyed=rows.map((row,index)=>({row,index,value:cellValue(row.cells[state.col],numeric)}));
      keyed.sort((a,b)=>{
        if(a.value===null&&b.value===null)return a.index-b.index;
        if(a.value===null)return 1;
        if(b.value===null)return -1;
        const order=numeric?a.value-b.value:collator.compare(String(a.value),String(b.value));
        return order*sign||a.index-b.index;
      });
      body.append(...keyed.map(k=>k.row));
    }
    function choose(i){
      const th=headers[i];
      // Sayi ve tarihte once en buyuk / en yeni; metinde A-Z.
      const first=th.classList.contains('num')||['number','date'].includes(th.dataset.sortType)?'desc':'asc';
      if(!state||state.col!==i)state={col:i,dir:first};
      else if(state.dir===first)state={col:i,dir:first==='asc'?'desc':'asc'};
      else state=null;
      write(key,state);paint();
      if(state)apply();
      else table.dispatchEvent(new CustomEvent('sortreset'));
    }
    headers.forEach((th,i)=>{
      if(th.classList.contains('actions')||th.dataset.sortable==='false'||!th.textContent.trim())return;
      th.classList.add('sortable');
      th.tabIndex=0;
      th.title=th.dataset.help?th.dataset.help+'\n'+SORT_HINT:SORT_HINT;
      th.addEventListener('click',()=>choose(i));
      th.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);}});
    });
    paint();
    return {apply,reset(){state=null;write(key,null);paint();}};
  }

  window.AscendTable={sortable,explain,highlight,notify,fold,read,write,parseNumber};
})();
