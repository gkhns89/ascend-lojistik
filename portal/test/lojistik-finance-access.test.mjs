import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Lojistik finansi ortak Finans alanina (finans.html) tasindi. Lojistik
// ekranindaki eski Finans bolumune giden her yol oraya yonlenir; finans
// yetkisi olmayan hicbir yere gitmez. Sayfanin kendi fonksiyonlari calistirilir.
const html=readFileSync(new URL('../prototype/02_LOJISTIK_PORTAL_BRANDED_v14.html',import.meta.url),'utf8');

function extract(name){
 const start=html.indexOf('function '+name+'(');
 assert.ok(start>=0,name+' bulunamadi');
 let depth=0,i=html.indexOf('{',start);
 for(;i<html.length;i++){if(html[i]==='{')depth++;else if(html[i]==='}'&&--depth===0)break;}
 return html.slice(start,i+1);
}

function page({view,session}){
 const opened=[];
 const location={href:'02_LOJISTIK_PORTAL_BRANDED_v14.html'};
 const context={
  logisticsView:view,logisticsPreview:['staff','customer'].includes(view),location,
  currentSession:()=>session,logisticsReadOnly:()=>view==='customer',
  renderTracking(){},renderFinance(){},applyFinanceRoleVisibility(){},
  document:{querySelectorAll:()=>[],getElementById:id=>({classList:{add(){},remove:cls=>{if(cls==='hidden')opened.push(id);}}})},
 };
 vm.createContext(context);
 vm.runInContext(['isFinanceAdmin','staffNoFinance','show','openFinance'].map(extract).join('\n'),context);
 return {context,opened,location};
}

const staff=finance=>({role:'Operasyon',permissions:{logistics:{access:true,finance}}});

test('staff without logistics finance reach no finance screen by any route',()=>{
 const {context,opened,location}=page({view:'staff',session:staff(false)});
 context.openFinance();context.show('finance');context.show('financeEdit');
 assert.deepEqual(opened,[],'eski Finans bolumu acilmamali');
 assert.equal(location.href,'02_LOJISTIK_PORTAL_BRANDED_v14.html','Finans alanina da gonderilmemeli');
 context.show('tracking');
 assert.deepEqual(opened,['tracking'],'operasyon bolumleri acik kalir');
});

test('finance holders are sent to the shared finance area, never the old section',()=>{
 for(const who of [page({view:'staff',session:staff(true)}),page({view:null,session:{role:'Yönetici'}})]){
  who.context.show('finance');
  assert.deepEqual(who.opened,[],'eski bolum artik acilmaz');
  assert.equal(who.location.href,'finans.html#logistics');
 }
});

test('a new load carries no money: amounts are entered in the finance area',()=>{
 assert.match(html,/purchasePrice:'', salePrice:'', financeCurrency:'',/);
 for(const id of ['purchasePrice','salePrice','loadCurrency']){
  const at=html.indexOf('id="'+id+'"');
  assert.match(html.slice(html.lastIndexOf('<div',at),at),/display:none/,id+' formda gizli olmali');
 }
});
