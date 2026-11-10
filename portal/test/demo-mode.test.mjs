import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Prototip ekranlarinin rol onizlemesi, sunucu yokken rolleri gostermek icin
// yazilmis bir demo da tasiyordu. Gercek bir personel girince ekranlar
// "kurgusal demo" bandi gosteriyor, Ana Sayfa onu demo calisma alanina
// goturuyor ve actigi gercek dosya ASC-DEMO numarasiyla kaydediliyordu.
const pages={
 '02_LOJISTIK_PORTAL_BRANDED_v14.html':{preview:'logisticsPreview',demo:'logisticsDemo'},
 '01_NCTS_BRANDED_v15.html':{preview:'nctsRolePreview',demo:'nctsDemo'},
};
const source=name=>readFileSync(new URL('../prototype/'+name,import.meta.url),'utf8');

// Sayfanin bayraklari tanimlayan ilk satirlarini, tarayicidaki gibi calistirir.
function flags(name,{session,bootstrap,search=''}){
 const html=source(name),{preview,demo}=pages[name];
 const start=html.indexOf('const demoLoginSession=');
 const end=html.indexOf(';',html.indexOf('const '+demo+'='))+1;
 const context={
  sessionStorage:{getItem:key=>key==='ascend_session'&&session?JSON.stringify(session):null},
  location:{search},URLSearchParams,JSON,
  window:bootstrap?{portalBootstrap:bootstrap}:{},
 };
 vm.createContext(context);
 vm.runInContext(html.slice(start,end)+`;globalThis.__flags={preview:${preview},demo:${demo}};`,context);
 // vm icinde olusan nesne baska bir alana ait; duz nesneye cevir.
 return JSON.parse(JSON.stringify(context.__flags));
}

test('a signed-in staff member keeps the restrictions but never the demo',()=>{
 const staff={username:'operasyon',role:'Operasyon',permissions:{}};
 for(const name of Object.keys(pages)){
  assert.deepEqual(flags(name,{session:staff,bootstrap:{user:staff}}),{preview:true,demo:false},name);
  const customer={username:'musteri',role:'Görüntüleme'};
  assert.deepEqual(flags(name,{session:customer,bootstrap:{user:customer}}),{preview:true,demo:false},name+' musteri');
 }
});

test('without a server session the role preview still runs as a demo',()=>{
 for(const name of Object.keys(pages)){
  assert.deepEqual(flags(name,{search:'?view=staff'}),{preview:true,demo:true},name);
 }
});

test('every demo-only behaviour is guarded by the demo flag, not the preview flag',()=>{
 for(const [name,{demo}] of Object.entries(pages)){
  const html=source(name);
  for(const marker of ["'ASC-DEMO-'+","'role-preview.html?role='","Kurgusal demo"]){
   let at=html.indexOf(marker);
   assert.ok(at>=0,name+': '+marker+' bulunamadi');
   while(at>=0){
    const before=html.slice(Math.max(0,at-480),at);
    assert.ok(before.includes(demo),name+': '+marker+' demo bayragiyla korunmuyor:\n…'+before.slice(-120));
    at=html.indexOf(marker,at+1);
   }
  }
 }
});
