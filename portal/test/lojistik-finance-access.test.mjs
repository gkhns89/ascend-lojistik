import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Finans yetkisi olmayan personel Lojistik'in Finans bolumune girebiliyordu:
// navlun tutarlarini, toplamlari goruyor ve odeme isaretleyebiliyordu. Veri
// artik sunucudan gelmiyor (permissions.test.mjs); bu test ekranin bolumu hic
// acmadigini, sayfanin kendi fonksiyonlarini calistirarak gosterir.
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
 const section=id=>({classList:{add(){},remove:cls=>{if(cls==='hidden')opened.push(id);}}});
 const context={
  logisticsView:view,logisticsPreview:['staff','customer'].includes(view),
  currentSession:()=>session,logisticsReadOnly:()=>view==='customer',
  renderTracking(){},renderFinance(){},applyFinanceRoleVisibility(){},
  document:{querySelectorAll:()=>[],getElementById:section},
 };
 vm.createContext(context);
 vm.runInContext(['isFinanceAdmin','staffNoFinance','show','openFinance'].map(extract).join('\n'),context);
 return {context,opened};
}

const staff=finance=>({role:'Operasyon',permissions:{logistics:{access:true,finance}}});

test('staff without logistics finance cannot open the finance section by any route',()=>{
 const {context,opened}=page({view:'staff',session:staff(false)});
 context.openFinance();
 context.show('finance');
 context.show('financeEdit');
 assert.deepEqual(opened,[],'Finans bolumu acilmamali');
 context.show('tracking');
 assert.deepEqual(opened,['tracking'],'operasyon bolumleri acik kalir');
});

test('finance permission and the administrator open it',()=>{
 const granted=page({view:'staff',session:staff(true)});
 granted.context.openFinance();
 assert.deepEqual(granted.opened,['finance']);
 const admin=page({view:null,session:{role:'Yönetici'}});
 admin.context.openFinance();
 assert.deepEqual(admin.opened,['finance']);
});
