import test from 'node:test';
import assert from 'node:assert/strict';
import { createVerify, generateKeyPairSync } from 'node:crypto';
import { mkdtemp, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createDriveUploader } from '../drive-backup.mjs';
import { openPortalDatabase } from '../database.mjs';

test('the uploader stays off until every setting is present', () => {
  assert.equal(createDriveUploader({}), null);
  assert.equal(createDriveUploader({ PORTAL_DRIVE_CLIENT_EMAIL: 'a@b.iam.gserviceaccount.com' }), null);
  assert.equal(
    createDriveUploader({ PORTAL_DRIVE_CLIENT_EMAIL: 'a@b', PORTAL_DRIVE_PRIVATE_KEY: 'k' }),
    null,
    'klasor kimligi olmadan acilmamali',
  );
});

test('the signed assertion verifies against the service account key', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });

  let sent;
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    sent = { url: String(url), body: init.body };
    return new Response(JSON.stringify({ error: 'stop' }), { status: 400 });
  };
  try {
    const upload = createDriveUploader({
      PORTAL_DRIVE_CLIENT_EMAIL: 'portal@proje.iam.gserviceaccount.com',
      // Tek satira sikistirilmis anahtardaki kacislar acilmali.
      PORTAL_DRIVE_PRIVATE_KEY: String(pem).replace(/\n/g, '\\n'),
      PORTAL_DRIVE_FOLDER_ID: 'klasor-1',
    });
    await assert.rejects(async () => upload('yedek.sqlite', Buffer.from('x')));
  } finally {
    globalThis.fetch = original;
  }

  assert.equal(sent.url, 'https://oauth2.googleapis.com/token');
  const jwt = new URLSearchParams(sent.body).get('assertion');
  const [header, claims, signature] = jwt.split('.');

  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${header}.${claims}`);
  verifier.end();
  assert.ok(verifier.verify(publicKey, Buffer.from(signature, 'base64url')), 'imza dogrulanmali');

  const decoded = JSON.parse(Buffer.from(claims, 'base64url').toString());
  assert.equal(decoded.iss, 'portal@proje.iam.gserviceaccount.com');
  assert.equal(decoded.scope, 'https://www.googleapis.com/auth/drive.file');
  assert.ok(decoded.exp - decoded.iat <= 3600, 'omur bir saati asmamali');
});

async function backupWith(uploader) {
  const folder = await mkdtemp(join(tmpdir(), 'ascend-drive-'));
  const db = await openPortalDatabase(join(folder, 'portal.json'), { driveUploader: uploader });
  try {
    return { result: await db.makeBackup(), folder };
  } finally {
    db.close();
  }
}

test('without an uploader the backup reports Drive as unconfigured', async () => {
  const { result } = await backupWith(undefined);
  assert.equal(result.drive.status, 'not-configured');
  assert.ok(result.file.endsWith('.sqlite'));
});

test('a successful upload is recorded with the file it received', async () => {
  let received;
  const { result } = await backupWith(async (name, bytes) => {
    received = { name, size: bytes.length };
    return { id: 'drive-1', name };
  });
  assert.equal(result.drive.status, 'uploaded');
  assert.equal(result.drive.id, 'drive-1');
  assert.equal(received.name, result.file);
  assert.ok(received.size > 0, 'gercek baytlar gonderilmeli');
});

test('a failed upload leaves the local backup valid and is audited', async () => {
  const { result, folder } = await backupWith(async () => {
    throw new Error('Drive kotasi dolu');
  });
  assert.equal(result.drive.status, 'failed');
  // Yerel yedek yine olusmus olmali.
  assert.ok((await readdir(join(folder, 'backups'))).some((f) => f === result.file));
});
