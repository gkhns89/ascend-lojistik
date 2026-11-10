# Şifre en az 8 karakter

- **Commit:** bu dosyayla birlikte

Kullanıcı isteğiyle en kısa şifre 12 karakterden 8'e indi. Sınır sunucuda
tek bir sabitte duruyor: `MIN_PASSWORD_LENGTH` (`portal/tenant-store.mjs`).
Kullanıcı kaydı, sıfırlama bağlantısı ve ilk kurulum bu sabiti kullanıyor.
Ekranlardaki kontroller ve `minlength` öznitelikleri de 8'e çekildi
(Kullanıcı Yönetimi, ana sayfa ilk kurulum, Evrak ve Hesap Merkezi).

Mevcut şifreler değişmedi. `PORTAL_BOOTSTRAP_PASSWORD` 16 karakter sınırında
kaldı; o bir kullanıcı şifresi değil, Railway'deki operatör sırrı.

Kaba kuvvete karşı asıl koruma kademeli kilitlenme (beş hatalı denemede 15
dakika) ve scrypt özeti. Yönetici hesabında TOTP açık değil; bkz.
[../guvenlik-totp-etkinlestir.md](../guvenlik-totp-etkinlestir.md).

Doğrulama: `test/password-policy.test.mjs`. 7 karakter reddediliyor, 8 kabul
ediliyor; bu, hem kullanıcı kaydında hem sıfırlamada sınanıyor.
