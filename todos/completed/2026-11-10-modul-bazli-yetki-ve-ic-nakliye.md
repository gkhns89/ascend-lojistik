# Modül bazlı yetki ve İç Nakliye

- **Commit:** bu dosyayla birlikte

## Modül bazlı yetki

Yönetici her personel için NCTS / İç Nakliye / Lojistik modüllerinde ayrı ayrı
"erişim" ve "finans bilgisi" yetkisi veriyor (Kullanıcı Yönetimi).

- Kural sunucuda: `portal/permissions.mjs`, `tenant-store.mjs` (`records()`
  okuma, `sync()` yazma). Sayfaya gömülen veri, belgeler ve bildirimler aynı
  noktadan geçiyor.
- Yönetici kısıtlanamaz. Müşteri hiçbir modülde finans göremez ve İç Nakliye'ye
  giremez.
- Varsayılan: önceki davranışın aynısı. Personel NCTS ve Lojistik'i görür,
  finansı görmez; İç Nakliye kapalı.
- Finans yetkisi müşteri bağlantısını (`customerCompanyIds`) ve kaynak teklif
  alanlarını açmaz.
- Bir finans alanını görmek için o alanın sahibi olan modülde finans yetkisi
  gerekir. Eski bir NCTS kaydında Lojistik alış fiyatı kalmışsa, NCTS finansı
  onu açmaz.
- Yetki değişikliği açık oturumda bir sonraki istekte geçerli olur; oturum
  düşmez.

## İç Nakliye

Ana ekranda NCTS / T1 ile Lojistik Operasyon arasında. Alanlar: Firma, Gümrük
adı, Depo, Teslim adresi, Taşıma ücreti (+ döviz, varsayılan TRY), Ödeme
alındı. Arama, ödeme durumuna göre süzme, döviz başına toplam / tahsil edilen /
bekleyen. Varsayılan yalnız yönetici.

## Bu sırada kapanan sızıntı

NCTS ücret dövizi (`feeCurrency`) finans alanı olduğu hâlde personele
gidiyordu ve personel onu değiştirebiliyordu. Kapandı.

## Doğrulama

- 15 birim + 1 HTTP testi (`permissions.test.mjs`,
  `permissions-server.test.mjs`). Kasıtlı bozmayla sınandı: dört farklı
  gerilemenin dördünü de yakalıyor.
- `node --test test/*.test.mjs`: 80/80.
- Eski sürümün yazdığı veri yeni kodla açıldı: veri korunuyor, eski personel
  eski yetkisiyle açılıyor.
- İmaj yerelde boş volume'la çalıştırıldı.

## Açık kalan

- Depolanan XSS aynı gün kapatıldı:
  [2026-11-10-depolanan-xss-yetki-yukseltme.md](2026-11-10-depolanan-xss-yetki-yukseltme.md).
- [../yetki-kalan-yonetici-ekranlari.md](../yetki-kalan-yonetici-ekranlari.md)
- [../ic-nakliye-ek-alanlar.md](../ic-nakliye-ek-alanlar.md)
