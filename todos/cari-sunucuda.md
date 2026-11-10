# Cari: sunucuda kaydet ve Finans alanına taşı

- **Öncelik:** Yüksek
- **Kim:** kod
- **Boyut:** orta
- **Kaynak:** `portal/prototype/account-ledger.js`, `portal/prototype/tenant-bridge.js`, 10 Kasım 2026

## Durum

Cari (müşteri ve taşıyıcı hesapları; fatura ve ödeme kayıtları)
`ascend_account_entries` ve `ascend_carrier_account_entries` anahtarlarına
yazılıyordu. Sunucuya kaydeden köprü yalnız kullanıcı, firma, sevkiyat ve NCTS
anahtarlarını tanıyor; tanımadığı anahtarı sessizce bellekte tutuyor. Sunucuda
Cari için bir saklama alanı da yok. Yani canlıda Cari'ye girilen her kayıt
**sayfa yenilenince kayboluyordu**, ekran ise "Kayıt eklendi" diyordu.

10 Kasım'da Lojistik ekranındaki Cari girişi kapatıldı. Sunucu destekli Cari
Finans alanına gelene kadar Cari yok. Kaybedilecek kalıcı veri yoktu; hiçbir
kayıt sunucuya ulaşmamıştı.

## Yapılacak

- [ ] Sunucuda `ledger` koleksiyonu: kayıt türü (fatura/ödeme), firma, döviz,
      tutar (kuruş cinsinden tam sayı), tarih, referans, not; müşteri ve
      taşıyıcı ayrımı.
- [ ] Yetki: yalnız yönetici (kullanıcı kararı, 10 Kasım). Taşıyıcı carisi
      alış fiyatı içerir.
- [ ] Doğrulama izin listesiyle; aynı firma + döviz + tür için referans tekrarı
      reddedilir. Denetim günlüğüne yazılır.
- [ ] Finans alanında "Cari" sekmesi (yönetici). Bakiyeler döviz başına.
- [ ] Testler: kayıt yeniden açılışta duruyor; yönetici olmayan 403 alıyor.
