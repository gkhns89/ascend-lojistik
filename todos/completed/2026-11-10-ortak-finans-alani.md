# Ortak Finans alanı

- **Commit:** bu dosyayla birlikte
- **İstek:** kullanıcı, 10 Kasım 2026. Finans tüm modüller için tek bir yerde
  olsun ve sekmelerle ayrılsın; yalnız yetkililer görsün.

## Kararlar (kullanıcı)

- Para alanları **yalnız Finans alanında**. Modül ekranları operasyoneldir;
  kaydı operasyon açar, tutarı finans yetkilisi girer.
- Cari ve Raporlar Finans alanında yalnız yönetici sekmesi olarak durur.

## Yapılan

- `portal/prototype/finans.html` ve `finance-center.js`. Sekmeler: Lojistik,
  NCTS, İç Nakliye, Raporlar. Her modül sekmesi yalnız o modülde finans yetkisi
  olana, Raporlar yalnız yöneticiye görünür. Her sekmede tablo, arama, döviz
  başına toplamlar ve düzenleme penceresi var. Lojistik ve İç Nakliye'de
  ödeme durumuna göre süzme ve "Ödendi" tiki var.
- Sunucu `/finans.html`'i yalnız yöneticiye ve en az bir modülde finans yetkisi
  olana açıyor. Veri yine `records()` üzerinden süzülerek geliyor.
- Ana ekrana Finans kartı geldi; yalnız finans yetkilisine görünüyor.
- Lojistik ekranında yük formundaki alış, satış ve para birimi alanları kalktı.
  Yeni yük para taşımıyor. Eski Finans bölümüne giden her yol Finans alanına
  yönleniyor.
- NCTS ekranındaki "NCTS Finans" Finans alanına yönleniyor.
- İç Nakliye ekranından ücret, döviz, ödeme ve toplamlar kalktı. Finans
  yetkilisine Finans alanına giden bağlantı gösteriliyor.

## Bu sırada bulunanlar

- NCTS finans toplamları da dövizleri birbirine ekliyordu. Finans alanında
  döviz başına ayrı toplanıyor.
- Cari hiçbir zaman sunucuya kaydedilmiyordu. Girişi kapatıldı; bkz.
  [../cari-sunucuda.md](../cari-sunucuda.md).

## Doğrulama

- `test/finance-center.test.mjs`: sekme görünürlüğü, döviz ayrımı, Lojistik
  hesaplamaları, HTTP üzerinden sayfa kilidi ve gömülü veri. Yalnız NCTS
  finansı olan personel NCTS ücretlerini alıp yazabiliyor; Lojistik parasını
  almıyor.
- `test/lojistik-finance-access.test.mjs`: eski bölüme giden yollar Finans
  alanına gidiyor; finans yetkisi olmayan hiçbir yere gitmiyor.
- Kasıtlı bozma: sunucu kilidinin kaldırılması, Raporlar'ın herkese açılması
  ve dövizlerin birlikte toplanması yakalandı.
- `node --test`: 102/102. İmaj yerelde çalıştırıldı.
