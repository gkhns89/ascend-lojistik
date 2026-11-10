// Cari: musteri ve tasiyici hesaplarinin fatura ve odeme kayitlari.
//
// Eskiden tarayicida tutuluyordu ve sunucuya hic ulasmiyordu: kopru anahtari
// tanimadigi icin her kayit sayfa yenilenince kayboluyordu. Simdi sunucuda,
// yalniz yoneticiye acik bir koleksiyondur (tasiyici carisi alis fiyati icerir).
//
// Kayitlar degistirilemez. Yanlis bir kayit silinip dogrusu eklenir; silme
// denetim gunlugune kaydin icerigiyle yazilir (tenant-store sync).

export const LEDGER_KINDS = ['customer', 'carrier'];
export const LEDGER_TYPES = ['invoice', 'payment'];

const FIELDS = ['id', 'kind', 'company', 'currency', 'type', 'reference', 'date', 'amount', 'note'];
const normalize = (value) => String(value || '').trim().toLocaleLowerCase('tr-TR').replace(/ı/g, 'i');

function text(value, label, max, required) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') throw Error(label + ' metin olmalı');
  const trimmed = value.trim();
  if (required && !trimmed) throw Error(label + ' zorunludur');
  if (trimmed.length > max) throw Error(label + ' en fazla ' + max + ' karakter olabilir');
  return trimmed;
}

function entry(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw Error('Cari kaydı geçersiz');
  const record = {
    id: text(row.id, 'Kayıt kimliği', 64, true),
    kind: row.kind,
    company: text(row.company, 'Firma', 200, true),
    currency: String(row.currency || '').trim().toUpperCase(),
    type: row.type,
    reference: text(row.reference, 'Fatura numarası veya ödeme referansı', 120, true),
    date: row.date,
    amount: row.amount,
    note: text(row.note, 'Not', 1000, false),
  };
  if (!LEDGER_KINDS.includes(record.kind)) throw Error('Cari türü geçersiz');
  if (!LEDGER_TYPES.includes(record.type)) throw Error('Kayıt türü fatura ya da ödeme olmalı');
  if (!/^[A-Z]{3}$/.test(record.currency)) throw Error('Üç harfli para birimi kodu girin (EUR, USD, TRY)');
  if (typeof record.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.date) || !Number.isFinite(Date.parse(record.date))) {
    throw Error('İşlem tarihi geçersiz');
  }
  // Tutar kurus cinsinden tam sayidir: kayan nokta yuvarlama hatasi birikmesin.
  if (!Number.isSafeInteger(record.amount) || record.amount <= 0) throw Error('Tutar sıfırdan büyük olmalı');
  return record;
}

const same = (a, b) => FIELDS.every((key) => a[key] === b[key]);

// rows: kaydedilecek liste; previous: sunucudaki su anki liste.
// Dondurur: { rows, removed } — removed denetim gunlugu icindir.
export function normalizeLedger(rows, previous = []) {
  if (!Array.isArray(rows)) throw Error('Cari kayıtları liste olmalı');
  const before = new Map((previous || []).map((row) => [row.id, row]));
  const ids = new Set();
  const references = new Set();
  const result = rows.map((row) => {
    const record = entry(row);
    if (ids.has(record.id)) throw Error('Cari kaydı tekrar ediyor: ' + record.id);
    ids.add(record.id);
    const old = before.get(record.id);
    if (old && !same(old, record)) throw Error('Cari kaydı değiştirilemez; silip doğrusunu ekleyin (' + record.reference + ').');
    const key = [record.kind, normalize(record.company), record.currency, record.type, normalize(record.reference)].join('|');
    if (references.has(key)) throw Error('Bu referans aynı firma, para birimi ve kayıt türü için zaten kayıtlı: ' + record.reference);
    references.add(key);
    return record;
  });
  const removed = (previous || []).filter((row) => !ids.has(row.id));
  return { rows: result, removed };
}

// Doviz basina fatura, odeme ve bakiye (fatura eksi odeme), kurus cinsinden.
export function ledgerBalances(entries) {
  const byCurrency = new Map();
  for (const row of entries) {
    const total = byCurrency.get(row.currency) || { invoiced: 0, paid: 0, balance: 0 };
    if (row.type === 'invoice') total.invoiced += row.amount;
    if (row.type === 'payment') total.paid += row.amount;
    total.balance = total.invoiced - total.paid;
    byCurrency.set(row.currency, total);
  }
  return byCurrency;
}
