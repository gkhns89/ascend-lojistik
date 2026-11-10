# Teklif zincirini canlıda uçtan uca dene

- **Öncelik:** Orta (kullanıcı isteğiyle bekletiliyor)
- **Kim:** kullanıcı
- **Boyut:** küçük
- **Kaynak:** 23 Eylül 2026 oturumu

## Durum

Zincirin parçaları ayrı ayrı test edildi; canlıda baştan sona bir kez
denenmedi. Zincir: site formu → portal kaydı → acente eşleşmesi → taslak →
onay → acenteye e-posta. Talep sahibine de onay e-postası gider.

## Yapılacak

- [ ] Gerçek acenteye dokunmadan test acentesi ekle:
      `TEST ACENTE — SILINECEK`, "Acente / Taşıyıcı hizmeti verir" işaretli,
      hizmet ülkesi `Testland`, temsilci e-postası kendi adresin, `Kara`.
- [ ] Siteden `Testland` çıkışlı, İthalat, Kara bir talep gönder. Formdaki
      e-posta, acente temsilcisininkinden farklı olsun.
- [ ] Sitede kontrol et: referans paneli görünüyor mu, form boşalıyor mu,
      onay e-postası geliyor mu (istenmeyen kutusuna da bak).
- [ ] Portal → Hızlı Fiyat Al (Lojistik ekranı değil): talep "Taslaklar hazır".
- [ ] Onayla → bir dakika içinde test adresine navlun talebi gelmeli.
- [ ] Temizlik: talebi Kaldır, test acentesini sil.
