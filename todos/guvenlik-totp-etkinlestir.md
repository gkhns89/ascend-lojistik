# TOTP'yi etkinleştir

- **Öncelik:** Yüksek
- **Kim:** kullanıcı
- **Boyut:** küçük
- **Kaynak:** `portal/YAYINA-GECIS.md:17`, 23 Eylül 2026 kurtarma olayı

## Durum

Yönetici hesabında iki adımlı doğrulama (TOTP) açık değil. Parola bir kez
unutuldu (23 Eylül); kurtarma yolu artık var (`PORTAL_RECOVERY`). Ama hesabı
koruyan tek şey hâlâ parola.

## Yapılacak

- [ ] Evrak ve Hesap Merkezi (`control-center.html`) → TOTP kurulumu.
      Telefondaki doğrulayıcı uygulamayla QR kodu okut, kodu onayla.
- [ ] Parolayı bir parola yöneticisine kaydet.
- [ ] TOTP kasa anahtarının (`.key`) yedekte olmadığını unutma: bkz.
      [yedek-guvenlik-ve-geri-yukleme.md](yedek-guvenlik-ve-geri-yukleme.md).
