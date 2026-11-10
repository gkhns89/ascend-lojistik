# Önizleme kapısı kaldırıldı

- **Commit:** `abb35e1`

Çalışanlardan iki kez giriş istemek yerine, Basic auth kapısı
`PORTAL_PREVIEW_REQUIRE_AUTH=false` ile kapatıldı. Tek sınır giriş ekranı ve
API'ler; oturumsuz API 401 veriyor.

Bu değişkenin silinmesi portalı düşürüyor; bkz.
[../altyapi-onizleme-kapisi-varsayilani.md](../altyapi-onizleme-kapisi-varsayilani.md).
