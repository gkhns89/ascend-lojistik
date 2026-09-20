import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { createPortalServer } from '../server.mjs';

const preview = {
  PORTAL_PREVIEW_ENABLED: 'true',
  PORTAL_PREVIEW_USER: 'reviewer',
  PORTAL_PREVIEW_PASSWORD: 'test-only-password-with-32-characters',
};
const authorization = `Basic ${Buffer.from(`${preview.PORTAL_PREVIEW_USER}:${preview.PORTAL_PREVIEW_PASSWORD}`).toString('base64')}`;

async function start(t, extra) {
  const folder = await mkdtemp(join(tmpdir(), 'ascend-backup-'));
  const server = await createPortalServer({
    ...preview,
    PORTAL_DATA_FILE: join(folder, 'portal.json'),
    PORTAL_BOOTSTRAP_PASSWORD: 'bootstrap-parolasi-2026',
    ...extra,
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((done) => { server.close(done); server.closeAllConnections(); }));
  return { base: `http://127.0.0.1:${server.address().port}`, folder };
}

const login = (base, password) =>
  fetch(base + '/api/tenant/login', {
    method: 'POST',
    headers: { authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ascend lojistik', password, code: '' }),
  });

test('no backup is written on boot unless an interval is configured', async (t) => {
  const { folder } = await start(t);
  const entries = await readdir(folder);
  assert.equal(entries.includes('backups'), false, 'yedek klasoru olusmamali');
});

test('an interval still enables the scheduled backup', async (t) => {
  const { folder } = await start(t, { PORTAL_BACKUP_INTERVAL_HOURS: '6' });
  assert.ok((await readdir(join(folder, 'backups'))).length > 0);
});

test('an administrator downloads a verifiable database file', async (t) => {
  const { base } = await start(t);
  const session = await login(base, 'bootstrap-parolasi-2026');
  assert.equal(session.status, 200);
  const cookie = session.headers.get('set-cookie').split(';')[0];

  const response = await fetch(base + '/api/tenant/backup/download', {
    headers: { authorization, cookie },
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-disposition') ?? '', /attachment; filename=".*\.sqlite"/);

  // Inen dosya gercekten acilabilir bir veritabani olmali.
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.ok(bytes.length > 0);
  const file = join(await mkdtemp(join(tmpdir(), 'ascend-restore-')), 'restored.sqlite');
  await writeFile(file, bytes);
  const restored = new DatabaseSync(file, { readOnly: true });
  try {
    assert.equal(restored.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    assert.ok(restored.prepare('SELECT COUNT(*) c FROM state').get().c >= 0);
  } finally {
    restored.close();
  }
});

test('the download refuses a session that is not an administrator', async (t) => {
  const { base } = await start(t);
  const response = await fetch(base + '/api/tenant/backup/download', { headers: { authorization } });
  assert.equal(response.status >= 400, true);
});
