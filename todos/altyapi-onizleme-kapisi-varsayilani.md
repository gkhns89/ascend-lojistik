# Önizleme kapısı değişkeni silinirse portal açılmaz

- **Öncelik:** Yüksek
- **Kim:** kod
- **Boyut:** küçük
- **Kaynak:** `portal/server.mjs` (`requireGate`), hafıza `railway-environment.md` (10 Kasım 2026)

## Durum

Kapı şu kodla kapalı tutuluyor:
`requireGate = env.PORTAL_PREVIEW_REQUIRE_AUTH !== 'false'`.

21 Ekim 2026 Railway güvenlik olayının ardından `PORTAL_PREVIEW_USER` ve
`PORTAL_PREVIEW_PASSWORD` silindi. Bu yüzden `PORTAL_PREVIEW_REQUIRE_AUTH`
panelden silinirse kapı yeniden açılmak ister, kullanıcı adı ve parola
bulamaz ve portal açılışta hata verip başlamaz.

Tek bir değişkenin silinmesi bütün portalı düşürüyor.

## Yapılacak

- [ ] Kapıyı açık seçime çevir: yalnız `PORTAL_PREVIEW_REQUIRE_AUTH=true`
      iken etkin olsun; değişken yoksa kapalı kalsın.
- [ ] Kapının tamamen kaldırılmasını değerlendir. Gerçek kimlik doğrulama
      giriş ekranında; kapı artık kullanılmıyor.
- [ ] "Preview" adlı bayrakları (`PORTAL_PREVIEW_ENABLED`) üretim için
      anlamlı adlara taşı; geçişte eski adı bir süre daha kabul et.
- [ ] Değişken yokken portalın açıldığını gösteren test.

## Bitti sayılır

Railway'de herhangi bir önizleme değişkeninin silinmesi portalın açılmasını
engellemiyor.
