# Yedek güvenliği ve geri yükleme denemesi

- **Öncelik:** Orta
- **Kim:** karar + kod + kullanıcı
- **Boyut:** orta
- **Kaynak:** `portal/drive-backup.mjs`, `portal/YAYINA-GECIS.md:18`

## Durum

- Yedek şifrelenmeden gidiyor. Müşteri ve finans verisi Drive'da düz metin
  olarak duruyor.
- TOTP kasa anahtarı (`.key`) yedeğe dahil değil. Geri yüklemede TOTP
  yeniden kurulmak zorunda kalır.
- Drive'da eski yedekler birikiyor; silme ya da döndürme yok.
- Geri yükleme yalnız yerelde denendi. Drive'dan indirilen bir yedekle
  `restore-backup.mjs` hiç denenmedi.

## Karar

- Yedek şifrelensin mi? Anahtar nerede durmalı?
- Kaç yedek saklanmalı?

## Yapılacak

- [ ] Karara göre şifreleme ve döndürme ekle.
- [ ] `.key` için ayrı ve güvenli bir saklama yeri belirle.
- [ ] Drive'dan bir yedek indirip boş bir portala geri yükle; giriş yap ve
      kayıtları say.
