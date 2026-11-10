// Modul bazli yetki. Her personel icin, her modulde iki ayri karar tutulur:
// modulu gorebilir mi (access) ve o modulun finans alanlarini gorebilir mi
// (finance). Kararlar sunucuda, kayit sunucudan cikmadan once uygulanir;
// arayuzdeki gizleme yalniz kolaylik icindir.
//
// Kesin kurallar (kayitli yetkiden bagimsiz):
//  - Yonetici her modulu ve her finans alanini gorur. Yonetici kendini
//    kisitlayip disarida kalamasin diye kayitli yetkisi okunmaz.
//  - Musteri rolleri hicbir modulde finans goremez ve Ic Nakliye'ye giremez.
//    NCTS ve Lojistik'te yalniz kendi firmasina bagli kayitlari, izin
//    listesiyle daraltilmis alanlarla gorur (bkz. tenant-store records).
//  - Finans yetkisi modul erisimi olmadan verilemez.

export const customerRoles = new Set(['Müşteri', 'Görüntüleme']);

// collection: tenant-store'daki durum anahtari.
// hidden: finans yetkisi olmayana okunurken silinen alanlar.
// protected: finans yetkisi olmayanin yazamadigi alanlar.
// Lojistik'te satis fiyati, dovizi, odeme tarihi ve vade de finanstir.
// Yetki sisteminin ilk surumu bunlari personele okutmaya devam ediyordu
// (eski davranisi korumak icin); bu yuzden finans yetkisi olmayan personel
// Finans bolumune girip navlun tutarlarini gorebiliyor, odeme isaretleyebiliyordu.
// stray: baska bir modulun kaydina kacmis olabilecek, ADI AYIRT EDICI finans
//   alanlari. Bunlar hangi kayitta gorulurse gorulsun sahibi modulun finans
//   yetkisine baglidir (eski bir NCTS kaydinda kalmis alis fiyati gibi).
//   'fee', 'currency', 'paid' gibi genel adlar buraya girmez: baska modullerde
//   finansla ilgisi olmayan ayni adli alanlar vardir. Sevkiyattaki 'currency'
//   esya degerinin dovizidir; ilk surum onu Ic Nakliye finansi sayip finans
//   yetkisi olmayan personelden gizliyor ve duzeltmesini sessizce dusuruyordu.
export const MODULES = {
  ncts: {
    label: 'NCTS / T1',
    collection: 'ncts',
    hidden: ['freightFee', 'guaranteeFee', 'feeCurrency', 'paid'],
    protected: ['freightFee', 'guaranteeFee', 'feeCurrency', 'paid'],
    stray: ['freightFee', 'guaranteeFee', 'feeCurrency'],
    staffDefault: true,
  },
  transport: {
    label: 'İç Nakliye',
    collection: 'transport',
    hidden: ['fee', 'currency', 'paid'],
    protected: ['fee', 'currency', 'paid'],
    stray: [],
    staffDefault: false,
  },
  logistics: {
    label: 'Lojistik Operasyon',
    collection: 'shipments',
    hidden: ['purchasePrice', 'profit', 'share', 'shareTL', 'exchangeRate', 'salePrice', 'financeCurrency', 'paymentDate', 'paymentDueDate'],
    protected: ['purchasePrice', 'profit', 'share', 'shareTL', 'exchangeRate', 'salePrice', 'financeCurrency', 'paymentDate', 'paymentDueDate'],
    stray: ['purchasePrice', 'profit', 'share', 'shareTL', 'exchangeRate', 'salePrice', 'financeCurrency', 'paymentDate', 'paymentDueDate'],
    staffDefault: true,
  },
};

export const MODULE_KEYS = Object.keys(MODULES);

// Finansla ilgisi olmayan ama kaydin kime gorunecegini veya nereden geldigini
// belirleyen alanlar. Finans yetkisi bunlari acmaz; yalniz yonetici yazar.
export const ADMIN_ONLY_FIELDS = ['sourceQuoteId', 'sourceOfferId', 'customerCompanyIds'];

export function moduleForCollection(collection) {
  return MODULE_KEYS.find((key) => MODULES[key].collection === collection) ?? null;
}

const grant = (access, finance) => ({ access, finance: access && finance });

// Kullanicinin her moduldeki gecerli yetkisi. Kayitli deger yalniz personel
// icin okunur; tanimsiz moduller varsayilana duser. Varsayilanlar, yetki
// sistemi gelmeden onceki davranisin aynisidir: personel NCTS ve Lojistik'e
// girer, finans goremez; Ic Nakliye kapali baslar.
export function permissionsFor(user) {
  const result = {};
  for (const key of MODULE_KEYS) {
    if (user?.role === 'Yönetici') result[key] = grant(true, true);
    else if (customerRoles.has(user?.role)) result[key] = grant(key !== 'transport', false);
    else {
      const stored = user?.permissions?.[key];
      const access = typeof stored?.access === 'boolean' ? stored.access : MODULES[key].staffDefault;
      result[key] = grant(access, stored?.finance === true);
    }
  }
  return result;
}

// Yoneticinin gonderdigi yetki tablosunu dogrular ve saklanacak bicime
// indirger. Bilinmeyen modul veya boolean olmayan deger reddedilir: yanlis
// yazilmis bir anahtar sessizce varsayilana dusup yetki acmasin.
// Yonetici ve musteri icin hicbir sey saklanmaz; onlarin yetkisi rolden gelir.
export function sanitizePermissions(role, input) {
  if (role === 'Yönetici' || customerRoles.has(role) || input === undefined || input === null) return undefined;
  if (typeof input !== 'object' || Array.isArray(input)) throw Error('Yetki tablosu geçersiz');
  const result = {};
  for (const [key, value] of Object.entries(input)) {
    if (!MODULES[key]) throw Error('Bilinmeyen modül: ' + key);
    if (!value || typeof value !== 'object') throw Error('Yetki değeri geçersiz: ' + key);
    for (const flag of Object.keys(value)) if (!['access', 'finance'].includes(flag)) throw Error('Bilinmeyen yetki: ' + flag);
    if (typeof value.access !== 'boolean' || (value.finance !== undefined && typeof value.finance !== 'boolean')) {
      throw Error('Yetki değerleri evet/hayır olmalı: ' + key);
    }
    result[key] = grant(value.access, value.finance === true);
  }
  return result;
}

// Personelin okuyacagi kayit. Kendi modulunun finans alanlari o modulun
// finans yetkisine baglidir. Baska bir modulun AYIRT EDICI finans alani
// (stray) bu kayitta gorulurse, sahibi modulde finans yetkisi yoksa silinir.
// Musteri izdusumu burada degil, tenant-store'daki izin listesiyle yapilir.
export function staffView(record, permissions, moduleKey) {
  const drop = new Set();
  if (moduleKey && !permissions[moduleKey].finance) for (const field of MODULES[moduleKey].hidden) drop.add(field);
  for (const key of MODULE_KEYS) {
    if (key === moduleKey || permissions[key].finance) continue;
    for (const field of MODULES[key].stray) drop.add(field);
  }
  if (!drop.size) return record;
  const safe = { ...record };
  for (const field of drop) delete safe[field];
  return safe;
}

// Yonetici olmayan personelden gelen satir: yazamayacagi alanlar atilir,
// boylece mevcut deger korunur. Baska bir modulun AYIRT EDICI finans alani
// (stray) bu kayda hic yazilamaz; kendi modulunun finans alanlari yalniz
// finans yetkisiyle yazilir. Genel adli alanlar (or. sevkiyattaki currency)
// baska modulun finansi sayilmaz.
export function staffWrite(incoming, moduleKey, permissions) {
  const safe = { ...incoming };
  for (const field of ADMIN_ONLY_FIELDS) delete safe[field];
  if (!permissions[moduleKey].finance) for (const field of MODULES[moduleKey].protected) delete safe[field];
  for (const key of MODULE_KEYS) {
    if (key === moduleKey) continue;
    for (const field of MODULES[key].stray) delete safe[field];
  }
  return safe;
}
