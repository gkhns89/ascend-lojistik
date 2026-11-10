import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../prototype/data-table.js',import.meta.url),'utf8');
const load=(storage)=>{const context={globalThis:{},window:{}};context.globalThis=context;context.window=context;if(storage)context['session'+'Storage']=storage;vm.createContext(context);vm.runInContext(source,context);return context.AscendTable;};

test('Turkish-formatted numbers sort as numbers',()=>{
 const T=load();
 assert.equal(T.parseNumber('1.234,56'),1234.56);
 assert.equal(T.parseNumber('-12,50'),-12.5);
 assert.equal(T.parseNumber('47,2'),47.2);
 assert.equal(T.parseNumber('—'),null);
 assert.equal(T.parseNumber(''),null);
});

test('view preferences live in the browser tab, never in the portal bridge',()=>{
 const memory=new Map();
 const T=load({getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)});
 T.write('finans.filters',{logistics:'wait'});
 assert.deepEqual(JSON.parse(memory.get('ascend.view.finans.filters')),{logistics:'wait'});
 assert.deepEqual(JSON.parse(JSON.stringify(T.read('finans.filters'))),{logistics:'wait'});
 T.write('finans.filters',null);
 assert.equal(memory.size,0);
 // Sunucu sayfadaki depolama adlarini koprüye cevirir; yardimci bu adi duz yazmamali,
 // yoksa gorunum tercihi is verisi koprusune gider ve sayfa yenilenince kaybolur.
 assert.ok(!/\b(local|session)Storage\b/.test(source),'depolama adi duz yazilmamali');
 assert.doesNotThrow(()=>load().write('x',{a:1}),'depo yoksa sessizce gecer');
});

test('finance and İç Nakliye pages load the shared table helper, and the portal serves it',()=>{
 for(const page of ['finans.html','ic-nakliye.html']){
  const html=readFileSync(new URL('../prototype/'+page,import.meta.url),'utf8');
  assert.match(html,/<script src="data-table.js"><\/script>/,page);
  assert.match(html,/AscendTable\.sortable\(/,page);
 }
 assert.match(readFileSync(new URL('../server.mjs',import.meta.url),'utf8'),/\['\/data-table\.js', 'data-table\.js'\]/);
 const css=readFileSync(new URL('../prototype/data-table.css',import.meta.url),'utf8');
 assert.ok(!/nth-child\(even\)/.test(css),'rehber: zebra yok, ince cizgi');
 assert.match(css,/tr>:first-child\{position:sticky;left:0/,'ilk sutun yatay kaymada sabit');
});

test('niche finance headers carry an explanation that survives the sort hint',()=>{
 const html=readFileSync(new URL('../prototype/finans.html',import.meta.url),'utf8');
 for(const label of ['Pay (1/3)','Kur','Pay TL','Teminat','Pay aktarımı','Bakiye']){
  assert.match(html,new RegExp('<th[^>]*data-help="[^"]+"[^>]*>'+label.replace(/[()]/g,c=>'\\'+c)+'</th>'),label);
 }
 // Siralama ipucu aciklamayi ezmemeli; ikisi birlikte yazilir.
 assert.ok(source.includes("th.title=th.dataset.help?th.dataset.help+'\\n'+SORT_HINT:SORT_HINT"));
});

test('search highlight folds Turkish case and never writes markup',()=>{
 const T=load();
 assert.equal(T.fold('İSTANBUL'),'istanbul');
 assert.equal(T.fold('HALKALI'),'halkali');
 assert.equal(T.fold('Halkalı'),'halkali');
 // Hucre metni kullanici verisidir: vurgu yalniz metin dugumlerini boler.
 assert.ok(!/innerHTML|insertAdjacentHTML|outerHTML/.test(source),'yardimci HTML yazmamali');
 for(const [page,inputs] of [['finans.html',['lgSearch','ncSearch','trSearch','ldSearch']],['ic-nakliye.html',['search']]]){
  const html=readFileSync(new URL('../prototype/'+page,import.meta.url),'utf8');
  for(const id of inputs)assert.ok(html.includes("AscendTable.highlight(body,$('"+id+"').value)"),page+' '+id);
 }
});

test('status pills differ in both themes; the theme file paints every pill grey in dark mode',()=>{
 const css=readFileSync(new URL('../prototype/data-table.css',import.meta.url),'utf8');
 assert.match(css,/\.pill\.ok\{background:#/);
 assert.match(css,/\.pill\.wait\{background:#/);
 assert.match(css,/\[data-theme=dark\] \.pill\.ok\{[^}]*!important/);
 assert.match(css,/\[data-theme=dark\] \.pill\.wait\{[^}]*!important/);
});

test('dark theme keeps its zebra off the shared data table',()=>{
 const theme=readFileSync(new URL('../prototype/portal-theme.css',import.meta.url),'utf8');
 for(const rule of theme.match(/[^}]*nth-child\(even\)[^{]*\{/g)||[])assert.match(rule,/table:not\(\.data-table\)/,rule.trim());
});
