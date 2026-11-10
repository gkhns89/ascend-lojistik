// Pay sahipleri ve pay aktarimlari.
//
// Kullanici karari (10 Kasim 2026): her Lojistik dosyasinda kar 3 esit paya
// bolunur ve 3 pay sahibi vardir. Bir pay sahibinin bir dosyadaki payi tek
// seferde, aktarim gunundeki kurla TL olarak aktarilir; tarih, kur ve TL
// tutari kaydedilir.
//
// Pay aktarimi ortaklarin gelirine iliskin oldugu icin yalniz yoneticiye
// aciktir (Cari ile ayni). Aktarim kaydi degistirilemez: yanlis kayit
// silinip dogrusu eklenir, silme denetim gunlugune icerigiyle yazilir.

export const SHARE_COUNT = 3;
const KINDS = ['person', 'company'];
const fold = (value) => String(value || '').trim().toLocaleLowerCase('tr-TR').replace(/ı/g, 'i');

function text(value, label, max, required) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') throw Error(label + ' metin olmalı');
  const trimmed = value.trim();
  if (required && !trimmed) throw Error(label + ' zorunludur');
  if (trimmed.length > max) throw Error(label + ' en fazla ' + max + ' karakter olabilir');
  return trimmed;
}

const object = (row, label) => {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw Error(label + ' geçersiz');
  return row;
};

export function normalizeShareholders(rows, previous = []) {
  if (!Array.isArray(rows)) throw Error('Pay sahipleri liste olmalı');
  const ids = new Set(), names = new Set();
  const result = rows.map((input) => {
    const row = object(input, 'Pay sahibi');
    const record = {
      id: text(row.id, 'Pay sahibi kimliği', 64, true),
      name: text(row.name, 'Pay sahibi adı', 200, true),
      kind: row.kind,
      active: row.active,
      note: text(row.note, 'Not', 500, false),
    };
    if (!KINDS.includes(record.kind)) throw Error('Pay sahibi şahıs ya da firma olmalı');
    if (typeof record.active !== 'boolean') throw Error('Pay sahibi durumu evet/hayır olmalı');
    if (ids.has(record.id)) throw Error('Pay sahibi tekrar ediyor');
    if (names.has(fold(record.name))) throw Error('Bu adla bir pay sahibi zaten var: ' + record.name);
    ids.add(record.id); names.add(fold(record.name));
    return record;
  });
  if (result.filter((r) => r.active).length > SHARE_COUNT) {
    throw Error('Kâr ' + SHARE_COUNT + ' eşit paya bölünür; en fazla ' + SHARE_COUNT + ' aktif pay sahibi olabilir. Birini pasife alın.');
  }
  const removed = (previous || []).filter((row) => !ids.has(row.id));
  return { rows: result, removed };
}

// Kur 1 doviz biriminin TL karsiligidir. TL tutari sunucuda yeniden hesaplanir:
// pay (kurus) x kur = TL (kurus). Istemcinin gonderdigi tutar buna esit olmali.
export const transferTL = (share, rate) => Math.round(share * rate);

const FIELDS = ['id', 'fileNo', 'holderId', 'date', 'currency', 'share', 'rate', 'amountTL', 'note'];

export function normalizeShareTransfers(rows, previous = [], holders = []) {
  if (!Array.isArray(rows)) throw Error('Pay aktarımları liste olmalı');
  const before = new Map((previous || []).map((row) => [row.id, row]));
  const holderIds = new Set(holders.map((h) => h.id));
  const ids = new Set(), pairs = new Set();
  const result = rows.map((input) => {
    const row = object(input, 'Pay aktarımı');
    const record = {
      id: text(row.id, 'Aktarım kimliği', 64, true),
      fileNo: text(row.fileNo, 'Dosya numarası', 40, true),
      holderId: text(row.holderId, 'Pay sahibi', 64, true),
      date: row.date,
      currency: String(row.currency || '').trim().toUpperCase(),
      share: row.share,
      rate: row.rate,
      amountTL: row.amountTL,
      note: text(row.note, 'Not', 500, false),
    };
    if (!holderIds.has(record.holderId)) throw Error('Tanımsız pay sahibine aktarım yapılamaz');
    if (typeof record.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.date) || !Number.isFinite(Date.parse(record.date))) {
      throw Error('Aktarım tarihi geçersiz');
    }
    if (!/^[A-Z]{3}$/.test(record.currency)) throw Error('Payın dövizi geçersiz');
    if (!Number.isSafeInteger(record.share) || record.share <= 0) throw Error('Aktarılan pay sıfırdan büyük olmalı');
    if (typeof record.rate !== 'number' || !Number.isFinite(record.rate) || record.rate <= 0 || record.rate > 1e6
      || Math.round(record.rate * 1e6) / 1e6 !== record.rate) {
      throw Error('Kur sıfırdan büyük, en fazla altı ondalıklı olmalı');
    }
    if (record.amountTL !== transferTL(record.share, record.rate)) throw Error('TL tutarı pay × kur ile tutmuyor');
    if (ids.has(record.id)) throw Error('Pay aktarımı tekrar ediyor');
    ids.add(record.id);
    // Kullanici karari: bir pay sahibinin bir dosyadaki payi tek seferde aktarilir.
    const pair = record.fileNo + '|' + record.holderId;
    if (pairs.has(pair)) throw Error(record.fileNo + ' dosyasında bu pay sahibinin payı zaten aktarılmış');
    pairs.add(pair);
    const old = before.get(record.id);
    if (old && !FIELDS.every((key) => old[key] === record[key])) throw Error('Pay aktarımı değiştirilemez; silip doğrusunu ekleyin.');
    return record;
  });
  const removed = (previous || []).filter((row) => !ids.has(row.id));
  return { rows: result, removed };
}
