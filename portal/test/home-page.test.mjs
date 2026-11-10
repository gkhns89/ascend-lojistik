import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const home=readFileSync(new URL('../prototype/index.html',import.meta.url),'utf8');
const bridge=readFileSync(new URL('../prototype/tenant-bridge.js',import.meta.url),'utf8');

test('the home page opens on the workspaces, one card per module plus finance',()=>{
 for(const module of ['ncts','transport','logistics'])assert.match(home,new RegExp('class="workspace[^"]*"[^>]*data-module="'+module+'"'),module);
 assert.match(home,/class="workspace[^"]*"[^>]*data-finance href="finans.html"/);
 // Kart yetkiye gore gizlenir; asil sinir sunucuda, bu yalniz bos ekrana gondermemek icin.
 assert.match(home,/a\.hidden=s\.permissions\?\.\[a\.dataset\.module\]\?\.access!==true/);
 assert.match(home,/a\.hidden=!anyFinance/);
 assert.ok(home.indexOf('id="wsTitle"')<home.indexOf('id="toolsTitle"'),'calisma alanlari hizli erisimden once');
});

test('the home page shares the portal header and keeps the official logo and the world map',()=>{
 assert.match(home,/<header class="home-header">[\s\S]*?<img src="ascend-logo-light.svg" alt="ASCEND Lojistik">/,'tema betigi baslik logosunu acik/koyu resmi varyantla degistirir');
 assert.equal((home.match(/class="portal-map"/g)||[]).length,2,'harita giriste ve karsilamada');
 assert.ok(!/data:image\/png;base64/.test(home),'gomulu logo kopyasi yok');
 assert.match(bridge,/const home=document\.getElementById\('portalShortcuts'\)/,'ana ekranda kisayollar Hizli erisim alaninda');
 assert.match(bridge,/if\(!home&&window\.AscendShell\)return;/,'diger sayfalarda kisayollar ortak basligin Araclar menusunde');
});

test('login is a real form: Enter submits, errors are announced, no fake first-run account',()=>{
 assert.match(home,/<form class="login-form" id="loginForm"/);
 assert.match(home,/id="loginMsg" class="form-msg" role="alert"/);
 assert.match(home,/autocomplete="current-password"/);
 assert.match(home,/autocomplete="one-time-code"/);
 assert.ok(!/createFirstAdmin|ascend_users'\)\|\|'\[\]'\)\]|demoAccounts/.test(home.replace(/if\(result\.role==='Yönetici'[^\n]*/,'')),'tarayicida ilk yonetici olusturma kaldirildi');
 assert.match(home,/fetch\('\/api\/tenant\/login'/);
});
