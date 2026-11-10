// Ortak veri tablosu davranisi: sutun basligindan siralama ve gorunumun
// oturum boyunca korunmasi. Rehber: Pencil & Paper "Enterprise Data Tables"
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
  // Hucrenin siralama degeri: data-sort varsa o; onay kutusu varsa isaretli
  // mi; yoksa ust satirdaki metin (alt satir .sub haric).
  function cellValue(cell,numeric){
    if(!cell)return null;
    if(cell.dataset.sort!==undefined){
      if(cell.dataset.sort==='')return null;
      return numeric?Number(cell.dataset.sort):cell.dataset.sort;
    }
    const box=cell.querySelector('input[type=checkbox]');
    if(box)return box.checked?1:0;
    const first=cell.firstChild;
    const text=(first&&first.nodeType===3?first.textContent:cell.textContent).trim();
    if(!text||text==='—')return null;
    return numeric?parseNumber(text):text;
  }
  const collator=new Intl.Collator('tr',{numeric:true,sensitivity:'base'});

  function sortable(table,key){
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
      th.title='Sıralamak için tıklayın (üçüncü tıklama varsayılan sıraya döner)';
      th.addEventListener('click',()=>choose(i));
      th.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);}});
    });
    paint();
    return {apply,reset(){state=null;write(key,null);paint();}};
  }

  window.AscendTable={sortable,read,write,parseNumber};
})();
