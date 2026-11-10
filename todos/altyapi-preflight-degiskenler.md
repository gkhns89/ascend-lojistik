# Açılış kontrolü yeni değişkenleri bilmiyor

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** küçük
- **Kaynak:** `portal/preflight.mjs`

## Durum

`preflight.mjs` şu değişkenleri kontrol etmiyor: `PORTAL_BOOTSTRAP_PASSWORD`,
`PORTAL_DRIVE_*`, `PORTAL_PREVIEW_REQUIRE_AUTH`, `PORTAL_RECOVERY`,
`PORTAL_BACKUP_INTERVAL_HOURS`.

## Yapılacak

- [ ] Her biri için kontrol ekle. `PORTAL_RECOVERY=true` uyarı olarak
      raporlanmalı: açık kalırsa her açılışta günlüğe yeni bir sıfırlama
      belirteci yazılır.
