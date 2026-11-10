# Gönderim durumu ve gelen posta

- **Öncelik:** Düşük
- **Kim:** karar
- **Boyut:** orta
- **Kaynak:** `portal/notifications/README.md:17`, hafıza `mail-resend.md`

## Durum

- Portal bir postanın Resend'e teslim edildiğini biliyor; alıcıya ulaşıp
  ulaşmadığını ya da geri döndüğünü bilmiyor. Resend anahtarı kısıtlı ve durum
  sorgusu yapamıyor.
- Acente cevapları elle `.eml` olarak yükleniyor.

## Karar

- Teslim ve geri dönme bildirimi için Resend webhook ucu yazılsın mı?
- Gelen posta (Resend Inbound) ile acente cevapları otomatik içeri alınsın mı?
