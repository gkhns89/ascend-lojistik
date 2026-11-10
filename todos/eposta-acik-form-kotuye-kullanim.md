# Açık teklif formu ve onay e-postası kötüye kullanımı

- **Öncelik:** Yüksek
- **Kim:** karar + kod
- **Boyut:** küçük
- **Kaynak:** commit `64b9bd3`, hafıza `mail-resend.md`

## Durum

Teklif formu herkese açık. Her başarılı talepte portal, formdaki adrese
`info@ascendlojistik.com` adına onay e-postası kuyruğa alıyor. Biri başkasının
adresini yazıp onun kutusuna posta göndertebilir; bu, alan adının itibarını
zedeler. Resend ücretsiz katmanı günde 100 postayla sınırlı; kötüye kullanım
bu kotayı da tüketir.

Tek koruma hız sınırı ve o da şu an bozuk: bkz.
[guvenlik-teklif-formu-hiz-siniri.md](guvenlik-teklif-formu-hiz-siniri.md).

## Karar

- Bal küpü alanı (görünmez alan; dolduran bottur) yeterli mi, yoksa
  doğrulama (Cloudflare Turnstile gibi) mı gerekli?
- Günlük onay e-postası üst sınırı olsun mu?

## Yapılacak

- [ ] Önce hız sınırını düzelt.
- [ ] Bal küpü alanı ekle.
- [ ] Günlük üst sınır: aşılırsa talep kaydedilir, onay e-postası atlanır.
