# Hâlâ "e-posta bağlı değil" diyen metinler

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** küçük
- **Kaynak:** açık iş taraması, 10 Kasım 2026

## Durum

E-posta (Resend) 20 Eylül'den beri bağlı. Benzer iki metin 21 ve 23 Eylül'de
düzeltildi; şunlar kaldı:

- `prototype/control-center.html:7` — "Gönderim hizmeti henüz bağlı değil…"
- `prototype/control-center.html:25` — "…Henüz gönderilmedi."
- `prototype/index.html:46` — "Otomatik e-posta servisi henüz bağlı değildir."
- `prototype/offer-center.html:16,24,54` — "SMTP bağlı değilse bekler"

Kullanıcıyı özelliğin bitmemiş olduğuna inandırıyorlar.

## Yapılacak

- [ ] Her metni gerçek davranışa göre yeniden yaz: kuyruğa alınır, en geç bir
      dakika içinde gönderilir.
