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
