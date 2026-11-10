// Ic Nakliye kayitlari: firma, gumruk, depo, teslim adresi, tasima ucreti
// ve odemenin alinip alinmadigi. Ucret, odeme ve doviz finans alanidir;
// kimin gorecegi permissions.mjs'te belirlenir.
//
// Gelen satirlar izin listesiyle yeniden kurulur. Bilinmeyen bir alan
// saklanmaz: kayda gizlice eklenen bir alan sonra baska bir ekranda HTML
// olarak basilabilir ya da yetki kontrolunden kacabilir.

export const TRANSPORT_CURRENCIES = ['TRY', 'EUR', 'USD', 'GBP', 'CHF'];

const text = (value, label, max, required) => {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') throw Error(label + ' metin olmalı');
  const trimmed = value.trim();
  if (required && !trimmed) throw Error(label + ' zorunludur');
  if (trimmed.length > max) throw Error(label + ' en fazla ' + max + ' karakter olabilir');
  return trimmed;
};

export function normalizeTransport(rows) {
  if (!Array.isArray(rows)) throw Error('İç nakliye kayıtları liste olmalı');
  const ids = new Set();
  return rows.map((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw Error('İç nakliye kaydı geçersiz');
    const id = text(row.id, 'Kayıt numarası', 40, true);
    if (ids.has(id)) throw Error('Kayıt numarası tekrar ediyor: ' + id);
    ids.add(id);

    const record = {
      id,
      company: text(row.company, 'Firma', 200, true),
      customs: text(row.customs, 'Gümrük adı', 200, false),
      warehouse: text(row.warehouse, 'Depo', 200, false),
      deliveryAddress: text(row.deliveryAddress, 'Teslim adresi', 1000, false),
    };

    // Finans alanlari: finans yetkisi olmayan personelin satirinda bunlar
    // hic gelmez, eski deger birlestirmede korunur. Gelirse dogrulanir.
    if (row.fee !== undefined && row.fee !== null && row.fee !== '') {
      const fee = Number(row.fee);
      if (!Number.isFinite(fee) || fee < 0 || fee > 1e9) throw Error('Taşıma ücreti geçersiz');
      record.fee = Math.round(fee * 100) / 100;
    } else if (row.fee !== undefined) {
      record.fee = null;
    }
    if (row.currency !== undefined && row.currency !== null && row.currency !== '') {
      if (!TRANSPORT_CURRENCIES.includes(row.currency)) throw Error('Döviz geçersiz');
      record.currency = row.currency;
    }
    if (row.paid !== undefined) {
      if (typeof row.paid !== 'boolean') throw Error('Ödeme durumu evet/hayır olmalı');
      record.paid = row.paid;
    }
    if (row.createdAt !== undefined) {
      if (typeof row.createdAt !== 'string' || !Number.isFinite(Date.parse(row.createdAt))) throw Error('Kayıt tarihi geçersiz');
      record.createdAt = row.createdAt;
    }
    return record;
  });
}
