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

// Yuk bilgisi: kap (tam sayi), kilo ve konteyner. Konteyner isaretliyse kap
// ve kilo istege baglidir; degilse ikisi de zorunludur. Konteyner numarasi
// tutulmaz, yalniz isaret.
const positive = (value, label, integer) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > 1e7 || (integer && !Number.isInteger(number))) {
    throw Error(label + (integer ? ' pozitif bir tam sayı olmalı' : ' pozitif bir sayı olmalı'));
  }
  return integer ? number : Math.round(number * 100) / 100;
};

// previous: koleksiyonun su anki hali. Zorunluluk kurali yalniz yeni kayda ve
// yuk bilgisi degisen kayda uygulanir. Kural sonradan geldi; eski kayitlarda
// kap ve kilo yok ve ekran her kayitta tum listeyi gonderiyor. Kural her
// satira uygulansaydi, tek bir eski kayit yuzunden hicbir sey kaydedilemezdi.
export function normalizeTransport(rows, previous = []) {
  if (!Array.isArray(rows)) throw Error('İç nakliye kayıtları liste olmalı');
  const ids = new Set();
  const before = new Map((previous || []).map((row) => [row.id, row]));
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
    // Kaydin nereden geldigi (or. 'NCTS ASC-2026-0007'). Aktarilan kaynak kayit
    // silindiginde iz kaybolmasin diye tutulur.
    const source = text(row.source, 'Kaynak', 60, false);
    if (source) record.source = source;

    if (row.container !== undefined && typeof row.container !== 'boolean') throw Error('Konteyner evet/hayır olmalı');
    const container = row.container === true;
    const packages = positive(row.packages, 'Kap', true);
    const weight = positive(row.weight, 'Kilo', false);
    const old = before.get(id);
    const cargoChanged = !old || (old.container === true) !== container
      || (old.packages ?? null) !== packages || (old.weight ?? null) !== weight;
    if (cargoChanged && !container && (packages === null || weight === null)) {
      throw Error('Konteyner değilse kap ve kilo zorunludur (' + id + ')');
    }
    if (row.container !== undefined || old?.container !== undefined) record.container = container;
    if (packages !== null) record.packages = packages;
    if (weight !== null) record.weight = weight;

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
