# DMARC'ı sıkılaştır, Resend kotasını izle

- **Öncelik:** Orta
- **Kim:** kullanıcı
- **Boyut:** küçük
- **Kaynak:** hafıza `mail-resend.md`

## Durum

DMARC kaydı 19 Eylül'de `p=none` (yalnız izle) olarak eklendi. Plan, birkaç
hafta rapor izledikten sonra sıkılaştırmaktı; yaklaşık yedi hafta geçti.

Resend ücretsiz katmanı günde 100, ayda 3.000 posta. Onay e-postaları, acente
taslakları ve bildirimler arttıkça sınır yaklaşır.

## Yapılacak

- [ ] DMARC raporlarına bak. `portal.ascendlojistik.com` adına başka kaynak
      göndermiyorsa Cloudflare'de `p=quarantine` yap.
- [ ] Resend panelinde aylık kullanımı kontrol et; 3.000'e yaklaşıyorsa
      Pro planı (aylık 20 $) değerlendir.
