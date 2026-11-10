import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTenantStore,MIN_PASSWORD_LENGTH} from '../tenant-store.mjs';

const as=(store,username,password='AscendDemo!2026')=>store.principal({headers:{cookie:'ascend_sid='+store.login(username,password).token}});

test('passwords need eight characters, and eight is enough',async()=>{
 assert.equal(MIN_PASSWORD_LENGTH,8);
 const store=await createTenantStore();
 try{
  const admin=as(store,'yonetici.demo');
  const users=store.data(admin).users;
  const add=password=>store.sync(admin,{_revision:store.revision(),users:[...users,{username:'yeni',name:'Yeni',role:'Operasyon',active:true,password}]});
  await assert.rejects(add('1234567'),/en az 8 karakter/);
  await add('12345678');
  assert.ok(store.login('yeni','12345678'));

  // Sifirlama baglantisi da ayni siniri uygular.
  const {token}=await store.security('reset-create',admin,{username:'yeni'});
  await assert.rejects(store.security('reset-complete',null,{token,password:'kisa123'}),/en az 8/);
  await store.security('reset-complete',null,{token,password:'yeni1234'});
  assert.ok(store.login('yeni','yeni1234'));
 }finally{store.close();}
});
