# Teklif formu hız sınırı proxy adresine bağlı

- **Öncelik:** Yüksek
- **Kim:** kod
- **Boyut:** küçük
- **Kaynak:** `portal/server.mjs:152`

## Durum

Herkese açık teklif ucu (`/api/public/quotes`) her adres için saatte 10 talep
sınırı uyguluyor. Anahtar `req.socket.remoteAddress`. Railway'de istek
Railway'in vekil sunucusu üzerinden gelir; bu adres ziyaretçinin değil
vekilin adresidir. Sonuç: tüm ziyaretçiler aynı sayacı paylaşabilir ve
saatte 10 talepten sonra herkes `429 Çok fazla talep` alır.

`intakeLimits` Map'i de hiç temizlenmiyor.

## Yapılacak

- [ ] Railway'in gerçek istemci adresini hangi başlıkta ve nasıl verdiğini
      doğrula (`X-Forwarded-For` ekleniyor mu, üzerine mi yazılıyor).
      Doğrulamadan düzeltme yapma: yanlış başlığa güvenmek, ziyaretçinin
      sahte başlıkla sınırı aşmasına yol açar.
- [ ] Anahtarı vekilin eklediği değerden al.
- [ ] Süresi geçmiş kayıtları Map'ten temizle.
- [ ] İki farklı istemci adresiyle sınırın ayrı sayıldığını gösteren test.

## Bitti sayılır

Bir ziyaretçinin sınırı doldurması başka bir ziyaretçiyi etkilemiyor.
