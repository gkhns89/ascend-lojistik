# Dosya numarasını sunucu versin

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** küçük
- **Kaynak:** `portal/prototype/shared-portal.js` (`nextPortalNumber`), 10 Kasım 2026

## Durum

`ASC-YYYY-NNNN` numarası NCTS ve Lojistik arasında ortak bir sıradır ve
tarayıcıda hesaplanır. Hesaplama yalnız kullanıcının **görebildiği** kayıtlara
bakar. Modül bazlı yetkiyle NCTS'ye erişimi olmayan bir personel NCTS
numaralarını göremez. Bu kişi Lojistik'te yeni dosya açarsa, var olan bir NCTS
numarasını yeniden verebilir. `ascend_counter` da yalnız o tarayıcıda tutulur.

Teklif sevkiyata dönüşürken (`offers.mjs`) numara zaten sunucuda veriliyor;
elle açılan dosyalarda verilmiyor.

## Yapılacak

- [ ] Yeni NCTS ve sevkiyat kaydında numarayı sunucuda, iki koleksiyonun
      tamamına bakarak ver (`offers.mjs`'teki hesaplamayı ortak bir
      fonksiyona taşı).
- [ ] Test: NCTS yetkisi olmayan personelin açtığı dosya, var olan bir NCTS
      numarasını almıyor.
