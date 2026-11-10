// Finans alaninin kurallari. Sayfadan ayri tutulur ki test edilebilsin.
// Yetki sunucudan gelir ve sunucuda uygulanir (permissions.mjs): finans
// yetkisi olmayana bu alanlar hic gonderilmez. Buradaki sekme kurali yalniz
// ekrani duzenler.
(function (root) {
  // Her sekme bir modulun finansidir; Raporlar yalniz yoneticidedir.
  const TABS = [
    { key: 'logistics', label: 'Lojistik' },
    { key: 'ncts', label: 'NCTS' },
    { key: 'transport', label: 'İç Nakliye' },
    { key: 'ledger', label: 'Cari', adminOnly: true },
    { key: 'shares', label: 'Pay Sahipleri', adminOnly: true },
    { key: 'reports', label: 'Raporlar', adminOnly: true },
  ];

  function financeTabs(user) {
    const admin = user?.role === 'Yönetici';
    return TABS.filter((tab) => (tab.adminOnly ? admin : admin || user?.permissions?.[tab.key]?.finance === true));
  }

  const number = (value) => {
    const n = Number(value);
    return value === '' || value === null || value === undefined || !Number.isFinite(n) ? null : n;
  };

  // Lojistik satirinin hesaplanan tutarlari. Kazanc satis eksi alis, pay
  // kazancin ucte biri, Pay TL payin kurla carpimi. Lojistik ekranindaki eski
  // hesaplamanin aynisi.
  function logisticsMoney(row) {
    const purchase = number(row.purchasePrice);
    const sale = number(row.salePrice);
    const rate = number(row.exchangeRate);
    const priced = purchase !== null || sale !== null;
    const profit = (sale ?? 0) - (purchase ?? 0);
    const share = profit / 3;
    return { purchase, sale, rate, priced, profit, share, shareTL: rate ? share * rate : 0, currency: String(row.financeCurrency || 'EUR') };
  }

  // Dovizler birbirine eklenmez: her doviz ayri toplanir. pick satirdan
  // {currency, values:{ad:tutar}} dondurur; tutari olmayan satir atlanir.
  function currencyTotals(rows, pick) {
    const buckets = new Map();
    for (const row of rows) {
      const picked = pick(row);
      if (!picked) continue;
      const bucket = buckets.get(picked.currency) || {};
      for (const [name, value] of Object.entries(picked.values)) bucket[name] = (bucket[name] || 0) + (Number(value) || 0);
      buckets.set(picked.currency, bucket);
    }
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([currency, values]) => ({ currency, values }));
  }

  function money(amount, currency) {
    return Number(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (currency ? ' ' + currency : '');
  }

  // ---------- Cari ----------
  const fold = (value) => String(value || '').trim().toLocaleLowerCase('tr-TR').replace(/ı/g, 'i');

  // "1.250,50" gibi binlik ayiricili yazim reddedilir; yalniz 1250.50 / 1250,50.
  // Tutar kurus cinsinden tam sayiya cevrilir: kayan nokta hatasi birikmesin.
  function minorUnits(value) {
    const normalized = String(value ?? '').trim().replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
    const [whole, fraction = ''] = normalized.split('.');
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return Number.isSafeInteger(result) && result > 0 ? result : null;
  }

  // Hesaplar: musteri carisi sevkiyattaki aliciden, tasiyici carisi acenteden
  // olusur; cari kaydi olan ama sevkiyati olmayan firma da listelenir.
  function ledgerAccounts(shipments, entries, kind) {
    const accounts = new Map();
    const ensure = (company) => {
      const key = fold(company);
      if (!accounts.has(key)) accounts.set(key, { company, count: 0, last: '' });
      return accounts.get(key);
    };
    for (const row of shipments) {
      const company = kind === 'carrier' ? row.agent : row.consignee;
      if (company) ensure(company).count++;
    }
    for (const entry of entries) {
      if (entry.kind !== kind) continue;
      const account = ensure(entry.company);
      if (entry.date > account.last) account.last = entry.date;
    }
    return [...accounts.values()].sort((a, b) => a.company.localeCompare(b.company, 'tr'));
  }

  // Doviz basina: fatura, odeme, bakiye (fatura eksi odeme), kurus cinsinden.
  // Musteride pozitif bakiye firmanin bize borcudur; tasiyicida bizim borcumuzdur.
  function ledgerTotals(entries, kind) {
    const byCurrency = new Map();
    for (const entry of entries) {
      const total = byCurrency.get(entry.currency) || { invoiced: 0, paid: 0, balance: 0 };
      if (entry.type === 'invoice') total.invoiced += entry.amount;
      if (entry.type === 'payment') total.paid += entry.amount;
      total.balance = total.invoiced - total.paid;
      byCurrency.set(entry.currency, total);
    }
    return [...byCurrency.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([currency, t]) => ({
      currency, ...t,
      theyOwe: Math.max(0, kind === 'carrier' ? -t.balance : t.balance),
      weOwe: Math.max(0, kind === 'carrier' ? t.balance : -t.balance),
    }));
  }

  const minorMoney = (amount, currency) => money(amount / 100, currency);

  // ---------- Pay ----------
  // Kullanici karari: kar her dosyada 3 esit paya bolunur, 3 pay sahibi vardir.
  // Bir pay sahibinin bir dosyadaki payi (dosyanin dovizinde, kurus) = kar / 3.
  // Kar sifir ya da eksiyse aktarilacak pay yoktur.
  const SHARE_COUNT = 3;
  function holderShare(row) {
    const m = logisticsMoney(row);
    if (!m.priced || !(m.profit > 0)) return 0;
    return Math.round((m.profit / SHARE_COUNT) * 100);
  }
  // Sunucudaki hesapla ayni: pay (kurus) x kur = TL (kurus).
  const transferTL = (share, rate) => Math.round(share * rate);

  // Pay sahibi basina: aktarilan TL toplami, aktarim sayisi ve henuz aktarilmamis
  // paylar (doviz basina). Bekleyen yalniz aktif pay sahipleri icin hesaplanir.
  function shareSummary(shipments, holders, transfers) {
    return holders.map((holder) => {
      const mine = transfers.filter((t) => t.holderId === holder.id);
      const done = new Set(mine.map((t) => t.fileNo));
      const pending = new Map();
      if (holder.active) {
        for (const row of shipments) {
          const fileNo = String(row.fileNo || row.id || '');
          const share = holderShare(row);
          if (!share || done.has(fileNo)) continue;
          const currency = String(row.financeCurrency || 'EUR');
          const p = pending.get(currency) || { amount: 0, files: 0 };
          p.amount += share; p.files += 1;
          pending.set(currency, p);
        }
      }
      return {
        holder,
        transferredTL: mine.reduce((sum, t) => sum + t.amountTL, 0),
        transfers: mine.length,
        pending: [...pending.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([currency, p]) => ({ currency, ...p })),
      };
    });
  }


  root.AscendFinance = { TABS, financeTabs, logisticsMoney, currencyTotals, money, number, fold, minorUnits, ledgerAccounts, ledgerTotals, minorMoney, SHARE_COUNT, holderShare, transferTL, shareSummary };
})(typeof window !== 'undefined' ? window : globalThis);
