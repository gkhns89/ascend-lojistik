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

  root.AscendFinance = { TABS, financeTabs, logisticsMoney, currencyTotals, money, number };
})(typeof window !== 'undefined' ? window : globalThis);
