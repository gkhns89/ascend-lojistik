// NCTS kaydindan Ic Nakliye kaydi uretir. Yalniz plan cikarir; kaydetmez.
// Sayfa plani gosterir, yonetici onaylarsa tek bir istekte hem yeni Ic Nakliye
// kayitlarini ekler hem kaynak NCTS kayitlarini siler (sunucu ikisini birlikte
// uygular ya da hicbirini uygulamaz).
(function (root) {
  const CURRENCIES = ['TRY', 'EUR', 'USD', 'GBP', 'CHF']; // transport.mjs ile ayni
  const clip = (value, max) => String(value ?? '').trim().slice(0, max);
  const amount = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  // ncts: aktarilacak NCTS kayitlari. party: firma olarak 'receiver' (alici)
  // ya da 'sender' (gonderici). nextId: sirayla yeni Ic Nakliye numarasi verir.
  function planNctsTransfer(ncts, { party = 'receiver', nextId, now = new Date().toISOString() }) {
    return ncts.map((r) => {
      const f = r.fields || {};
      const no = String(r.no || r.id || '');
      const warnings = [], errors = [];
      const record = {
        id: nextId(),
        source: clip('NCTS ' + no, 60),
        company: clip(party === 'sender' ? r.sender || f.nSender : r.receiver || f.nReceiver, 200),
        customs: clip(r.destCustoms || f.nDestCustoms, 200),
        warehouse: clip(f.field_30, 200),
        // Alici adresi field_10, gonderici adresi field_5 (NCTS formu).
        deliveryAddress: clip(party === 'sender' ? f.field_5 : f.field_10, 1000),
        container: true, // kullanici karari: hepsi konteyner
        paid: false,
        createdAt: now,
      };
      if (!record.company) errors.push('Firma adı yok');

      const packages = Number(r.packages ?? f.nTotalPackages);
      if (Number.isInteger(packages) && packages > 0) record.packages = packages;
      const weight = Number(r.gross ?? f.nGross);
      if (Number.isFinite(weight) && weight > 0) record.weight = Math.round(weight * 100) / 100;

      // Ucret: NCTS navlun ucreti. Teminat ucreti aktarilmaz.
      const fee = amount(r.freightFee);
      if (fee === null || fee === 0) warnings.push('Navlun ücreti yok; ücret boş kalır');
      else if (fee < 0) errors.push('Navlun ücreti negatif');
      else {
        record.fee = Math.round(fee * 100) / 100;
        const currency = String(r.feeCurrency || '').trim().toUpperCase();
        if (!currency) { record.currency = 'TRY'; warnings.push('Döviz yok; TRY varsayıldı'); }
        else if (!CURRENCIES.includes(currency)) errors.push('İç Nakliye ' + currency + ' dövizini desteklemiyor');
        else record.currency = currency;
      }
      const guarantee = amount(r.guaranteeFee);
      if (guarantee) warnings.push('Teminat ücreti (' + guarantee + ' ' + (r.feeCurrency || '') + ') aktarılmaz');
      if (/</.test(Object.values(record).join(' '))) errors.push('Metinde "<" karakteri var');
      return { no, record, warnings, errors };
    });
  }

  root.AscendTransportImport = { planNctsTransfer, CURRENCIES };
})(typeof window !== 'undefined' ? window : globalThis);
