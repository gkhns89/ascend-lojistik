# İlk yönetici ortam değişkeninden, demo hesaplar kapatıldı

- **Commit:** `e671888`, `bf6cee2`

- Depoda açık duran demo parolası (`AscendDemo!2026`) üretimde artık geçerli
  değil. İlk yönetici `PORTAL_BOOTSTRAP_PASSWORD` ile kuruluyor; yönetici
  kendi parolasını belirleyince bootstrap değeri kendiliğinden geçersizleşiyor.
- Kademeli kilitlenme: beş hatalı denemede kullanıcı adı 15 dakika kilitlenir.
