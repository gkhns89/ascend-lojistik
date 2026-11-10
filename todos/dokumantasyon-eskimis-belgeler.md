# Eskimiş belgeler

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** küçük
- **Kaynak:** açık iş taraması, 10 Kasım 2026

## Durum

Birçok belge Eylül başındaki durumu anlatıyor.

## Yapılacak

- [ ] `docs/DEPLOYMENT.md`: portal servisi kuruldu; değişken tablosunu güncelle.
      `PREVIEW_USER/PASSWORD` silindi; SMTP Resend'de. Eklenecekler:
      `PORTAL_BOOTSTRAP_PASSWORD`, `PORTAL_PREVIEW_REQUIRE_AUTH`, `PORTAL_RECOVERY`,
      `PORTAL_DRIVE_*`, `PORTAL_BACKUP_INTERVAL_HOURS`.
- [ ] `portal/README.md`: staging, `erdemergand` ve önizleme kapısı adımları
      eskidi. "Canlı yayın yapılmadı" artık doğru değil. Modül bazlı yetkiyi
      anlat.
- [ ] `portal/YAYINA-GECIS.md` ve `portal/NATRO-KURULUM.md`: portal Railway'de.
      Natro soruları anlamını yitirdi. Arşivle; kalan kabul adımlarını
      [kabul-testleri.md](kabul-testleri.md)'ye taşı.
- [ ] `portal/notifications/README.md`: "e-posta sağlayıcısı belirlenmedi"
      yazıyor.
- [ ] `portal/web/README.md`: Hızlı Fiyat Al eksik. React istemcisinin canlıda
      sunulmadığını belirt.
- [ ] Kök `README.md` hâlâ Lovable şablonu. `DEVELOPMENT.md` Codex,
      `erdemergand`, Node 22.12, Cloudflare hedefi ve "formlar yalnız mailto"
      diyor.
- [ ] `portal/.env.example`: SMTP örneği Resend'e göre düzeltilmeli
      (`SMTP_USER=resend`). `PORTAL_PREVIEW_REQUIRE_AUTH` ve `PORTAL_RECOVERY`
      belgelenmeli.
- [ ] `docs/ascend-lojistik-seo-raporu.md`: her maddeye durum ekle. Hizmet
      sayfaları, og:image, şemalar, İngilizce sürüm ve site haritası yapıldı.
