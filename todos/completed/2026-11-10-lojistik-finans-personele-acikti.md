# Lojistik finans bölümü finans yetkisi olmayan personele açıktı

- **Commit:** bu dosyayla birlikte
- **Bildiren:** kullanıcı, 10 Kasım 2026

## Sorun

Modül bazlı yetkinin ilk sürümü Lojistik'te eski davranışı korumuştu. Finans
yetkisi olmayan personel Finans bölümüne girebiliyor, satış fiyatını, dövizi ve
navlun toplamını görüyor; ödeme tarihini ve "Ödendi" tikini değiştirebiliyordu.
İç Nakliye'de ödeme durumu finans sayılırken Lojistik'te sayılmıyordu. Bu bir
tutarsızlıktı ve kullanıcıya söylenmemişti.

## Yapılan

- Sunucu: Lojistik finans alanlarına `salePrice`, `financeCurrency`,
  `paymentDate`, `paymentDueDate` eklendi. Finans yetkisi olmayana bu alanlar
  gönderilmiyor ve yazılamıyor (`portal/permissions.mjs`). Müşteri kendi
  satış fiyatını görmeye devam ediyor; bu ayrı bir izdüşüm.
- Ekran: `show()` yönlendiricisi Finans bölümlerini finans yetkisi olmayan
  personele açmıyor. Menüdeki iki Finans düğmesi gizli. Düzenleme ve kaydetme
  fonksiyonlarında ikinci bir kilit var. Personelin ödeme tarihi yazdığı
  "Tarihleri Güncelle" dalı kaldırıldı.
- Varış tarihi operasyon için hâlâ girilebiliyor: yük bilgileri formu ve
  "Varış Bildirimi Yap".

## Doğrulama

- `test/permissions.test.mjs`: dört alan personele gitmiyor, ödeme tarihi
  yazılamıyor.
- `test/lojistik-finance-access.test.mjs`: sayfanın kendi `show()` ve
  `openFinance()` fonksiyonları Node'da çalıştırıldı. Finans yetkisi olmayan
  personelde bölüm açılmıyor; finans yetkili personelde ve yöneticide
  açılıyor.
- Kasıtlı bozma: `show()` kilidinin kaldırılması yakalandı. Yalnız
  `openFinance` kilidi kaldırıldığında `show()` kilidi bölümü tek başına kapalı
  tuttu. Sunucuda alanların yeniden açılması yakalandı.
- `node --test`: 92/92.
