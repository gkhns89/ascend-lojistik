import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createPortalServer } from '../server.mjs';

const preview = {
  PORTAL_PREVIEW_ENABLED: 'true',
  PORTAL_PREVIEW_REQUIRE_AUTH: 'false',
};
const bootstrap = 'ilk-kurulum-parolasi-2026';

// Acilis gunlugunu yakalar; jeton oraya yazilir, baska hicbir yere yazilmaz.
async function boot(t, dataFile, extra) {
  const lines = [];
  const original = console.warn;
  console.warn = (...args) => lines.push(args.join(' '));
  let server;
  try {
    server = await createPortalServer({
      ...preview,
      PORTAL_DATA_FILE: dataFile,
      PORTAL_BOOTSTRAP_PASSWORD: bootstrap,
      ...extra,
    });
  } finally {
    console.warn = original;
  }
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const { port } = server.address();
  const post = (path, body, cookie) =>
    fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    });
  const get = (path, cookie) =>
    fetch(`http://127.0.0.1:${port}${path}`, { headers: cookie ? { cookie } : {} }).then((r) =>
      r.json(),
    );
  return { lines, post, get };
}

const login = (post, password, username = 'ascend lojistik') =>
  post('/api/tenant/login', { username, password });

test('a forgotten admin password is recoverable only when recovery is switched on', async (t) => {
  const dataFile = join(await mkdtemp(join(tmpdir(), 'ascend-recovery-')), 'portal.json');

  // Ilk acilis: yonetici bootstrap parolasiyla olusur ve kendi parolasini secer.
  const first = await boot(t, dataFile, {});
  assert.equal(first.lines.length, 0, 'kurtarma kapaliyken gunluge jeton dusmemeli');
  const session = await login(first.post, bootstrap);
  assert.equal(session.status, 200);
  const cookie = session.headers.getSetCookie()[0].split(';')[0];
  const issued = await (
    await first.post('/api/tenant/security/reset-create', { username: 'ascend lojistik' }, cookie)
  ).json();
  await first.post('/api/tenant/security/reset-complete', {
    token: issued.token,
    password: 'kullanicinin-unuttugu-parola',
  });
  // Bootstrap parolasi artik gecersizdir; kullanici disarida kalmistir.
  assert.equal((await login(first.post, bootstrap)).status, 401);

  // Kurtarma acik degilken jeton uretilmez: acik depoya dusen bir arka kapi olmasin.
  const locked = await boot(t, dataFile, {});
  assert.equal(locked.lines.length, 0);

  // PORTAL_RECOVERY=true: jeton yalniz gunluge yazilir, parola hicbir yerde durmaz.
  const rescue = await boot(t, dataFile, { PORTAL_RECOVERY: 'true' });
  const log = rescue.lines.join('\n');
  assert.match(log, /Kullanici adi: ascend lojistik/);
  assert.ok(!log.includes(bootstrap), 'gunluge parola yazilmamali');
  const token = /Jeton \(15 dakika gecerli\): ([0-9a-f]{64})/.exec(log)?.[1];
  assert.ok(token, 'jeton gunluge yazilmali');

  // Kisa parola reddedilir, gecerli parola kabul edilir, eskisi calismaz.
  assert.equal(
    (await rescue.post('/api/tenant/security/reset-complete', { token, password: 'kisa' })).status,
    400,
  );
  assert.equal(
    (
      await rescue.post('/api/tenant/security/reset-complete', {
        token,
        password: 'yeni-guclu-parola-2026',
      })
    ).status,
    200,
  );
  assert.equal((await login(rescue.post, 'yeni-guclu-parola-2026')).status, 200);
  assert.equal((await login(rescue.post, 'kullanicinin-unuttugu-parola')).status, 401);
  // Jeton tek kullanimliktir; gunlugu goren biri sonradan tekrar kullanamaz.
  assert.equal(
    (
      await rescue.post('/api/tenant/security/reset-complete', {
        token,
        password: 'baskasinin-parolasi-2026',
      })
    ).status,
    400,
  );
});

test('recovery refuses to guess when several administrators are active', async (t) => {
  const dataFile = join(await mkdtemp(join(tmpdir(), 'ascend-recovery-')), 'portal.json');
  const first = await boot(t, dataFile, {});
  const session = await login(first.post, bootstrap);
  const cookie = session.headers.getSetCookie()[0].split(';')[0];
  const revision = (await first.get('/api/tenant/data', cookie)).revision;
  const added = await first.post(
    '/api/tenant/sync',
    {
      _revision: revision,
      users: [
        { username: 'ascend lojistik', name: 'Ascend Lojistik', role: 'Yönetici', active: true },
        {
          username: 'ikinci.yonetici',
          name: 'İkinci',
          role: 'Yönetici',
          active: true,
          password: 'ikinci-yonetici-parolasi',
        },
      ],
    },
    cookie,
  );
  assert.equal(added.status, 200);

  const rescue = await boot(t, dataFile, { PORTAL_RECOVERY: 'true' });
  const log = rescue.lines.join('\n');
  assert.match(log, /Hedef secilemedi/);
  assert.ok(!/Jeton/.test(log), 'belirsizken jeton uretilmemeli');
  assert.match(log, /ikinci\.yonetici/);

  // Adi verilince o hesap icin uretir.
  const named = await boot(t, dataFile, {
    PORTAL_RECOVERY: 'true',
    PORTAL_RECOVERY_USERNAME: 'ikinci.yonetici',
  });
  assert.match(named.lines.join('\n'), /Kullanici adi: ikinci\.yonetici/);
});
