// Kayitlara HTML sokulmasina karsi sunucu tarafindaki ikinci katman.
//
// Asil koruma ekranlardadir: kullanici verisi HTML'e yazilmadan once kacirilir.
// Ama prototip ekranlari buyuk ve satir ici betige izin veren bir CSP ile
// calisiyor; bir yerde kacirma unutulursa, personelin yazdigi bir firma adi
// yoneticinin ekraninda betik olarak calisabilir ve yetki tablosunu degistirebilir.
// Bu yuzden '<' iceren yeni metin hic kaydedilmez.
//
// Yalniz yeni ya da degisen metin denetlenir. Eski bir kayitta '<' kalmissa
// reddedilmez; yoksa o tek kayit yuzunden yonetici hicbir sey kaydedemez.
// Tirnak isareti yasaklanmaz: "2\" boru" gibi gecerli yuk tanimlari vardir;
// oznitelik icindeki degerler ekranda kacirilir.

const SKIP = new Set(['password', 'passwordHash', 'salt', 'totpSecret']);

function strings(value, out = new Set()) {
  if (typeof value === 'string') out.add(value);
  else if (Array.isArray(value)) for (const item of value) strings(item, out);
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) if (!SKIP.has(key)) strings(item, out);
  return out;
}

function offending(value, known, path) {
  if (typeof value === 'string') return value.includes('<') && !known.has(value) ? path : null;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const found = offending(value[i], known, path + '[' + i + ']');
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (SKIP.has(key)) continue;
      const found = offending(item, known, path ? path + '.' + key : key);
      if (found) return found;
    }
  }
  return null;
}

const rowId = (row) => row?.id || row?.fileNo || row?.no || row?.username || row?.name;

// rows: kaydedilecek satirlar; previous: ayni koleksiyonun su anki hali.
export function rejectNewMarkup(collection, rows, previous) {
  if (!Array.isArray(rows)) return;
  const byId = new Map((previous || []).map((row) => [rowId(row), row]));
  for (const row of rows) {
    const known = strings(byId.get(rowId(row)) || {});
    const field = offending(row, known, '');
    if (field) {
      throw Object.assign(Error('Metin alanlarında "<" karakteri kullanılamaz (' + collection + ': ' + field + ').'), { status: 400 });
    }
  }
}

// Herkese acik formdan gelen alanlar: eski deger yoktur, hepsi yenidir.
export function rejectMarkupFields(data, label) {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.includes('<')) throw Error(label + ' alanında "<" karakteri kullanılamaz: ' + key);
  }
}
