import { createSign } from 'node:crypto';

/**
 * Yedegi Google Drive'a yukler.
 *
 * Amac: yedegi sunucunun diskinden cikarmak. Onceki otomatik yedek verinin
 * yanindaki klasore yaziyordu; o disk kaybedilirse yedek de giderdi.
 *
 * Google kimlik dogrulamasi icin ek paket kullanilmaz. Servis hesabinin
 * ozel anahtariyla RS256 imzali bir JWT uretilip erisim jetonuna cevrilir;
 * ikisi de Node'un crypto ve fetch yetenekleriyle yapilabilir. Portalin
 * bagimlilik listesi bu yuzden degismez.
 *
 * Kurulum notu: servis hesaplarinin kendi Drive alani yoktur. Hedef klasor
 * servis hesabinin e-posta adresiyle **paylasilmis** olmalidir, aksi halde
 * yukleme "File not found" ya da kota hatasi doner.
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

const base64url = (input) =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Ortam degiskenine tek satir halinde yazilan anahtardaki \n kacislari acilir. */
function normalisePrivateKey(value) {
  return String(value ?? '').includes('\\n') ? String(value).replace(/\\n/g, '\n') : String(value ?? '');
}

function assertion(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      // Google bir saatten uzun omur kabul etmez.
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  signer.end();
  return `${header}.${claims}.${signer.sign(privateKey, 'base64url')}`;
}

async function accessToken(clientEmail, privateKey) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertion(clientEmail, privateKey),
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Google'in hata metni anahtar veya saat sorununu tarif eder; saklanir.
    throw new Error(`Google kimlik doğrulaması başarısız: ${payload.error_description ?? payload.error ?? response.status}`);
  }
  return payload.access_token;
}

/**
 * Yapilandirma eksikse null doner; cagiran taraf bunu "Drive kapali" olarak
 * yorumlar ve yedek yalnizca yerelde kalir.
 */
export function createDriveUploader(env = process.env) {
  const clientEmail = env.PORTAL_DRIVE_CLIENT_EMAIL;
  const privateKey = normalisePrivateKey(env.PORTAL_DRIVE_PRIVATE_KEY);
  const folderId = env.PORTAL_DRIVE_FOLDER_ID;
  if (!clientEmail || !privateKey || !folderId) return null;

  return async function uploadBackup(name, bytes) {
    const token = await accessToken(clientEmail, privateKey);
    const boundary = `ascend-${Date.now().toString(36)}`;
    const metadata = JSON.stringify({ name, parents: [folderId] });

    // Coklu parca govde elle kurulur; metadata ve dosya tek istekte gider.
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`),
      Buffer.from(bytes),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`Drive yüklemesi başarısız: ${payload.error?.message ?? response.status}`);
    }
    return { id: payload.id, name: payload.name ?? name };
  };
}
