# İki paralel yetki politikası

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** orta
- **Kaynak:** `portal/access-policy.mjs`, `portal/README.md:3,6`

## Durum

`access-policy.mjs` (`canAccess`, `shipmentFinanceView`) yalnız testlerde
kullanılıyor; sunucuya bağlı değil. Gerçek sınır `tenant-store.mjs`
(`records()`, `sync()`) ve `permissions.mjs` içinde. Bu dosya hâlâ
"finans yalnız yönetici" modelini anlatıyor ve modül bazlı yetkiyi bilmiyor.

Okuyan biri bunu geçerli politika sanabilir.

## Yapılacak

- [ ] Ya `access-policy.mjs`'i `permissions.mjs` üzerine kur ve sunucuya bağla,
      ya da kaldır ve testlerini `permissions.test.mjs`'e taşı.
- [ ] `portal/README.md`'deki açıklamayı buna göre güncelle.
