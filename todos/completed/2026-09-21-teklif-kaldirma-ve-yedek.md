# Teklif kaldırma ve yedek

- **Commit:** `48968c1`, `5de12e7`, `6324cb0`, `f8f9f7b`, `b70cbe8`

- Yönetici istenmeyen teklif talebini kaldırabiliyor; denetim günlüğüne
  yazılıyor. Teklife dönüşmüş talep korunuyor.
- Otomatik yedek varsayılan kapalı; yönetici "Yedeği indir" ile istediği yere
  kaydediyor.
- Google Drive'a yükleme modülü (ek bağımlılık yok).
- Bu modül imaja girmediği için portal bir süre açılmadı. Dockerfile artık
  `*.mjs` kopyalıyor; `.dockerignore` kaynak dosyaları elemiyor.
