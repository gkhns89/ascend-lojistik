# Oturumlar bellekte; her dağıtımda herkes düşüyor

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** orta
- **Kaynak:** `portal/tenant-store.mjs` (`sessions=new Map()`), `docs/DEPLOYMENT.md`

## Durum

Oturumlar ve başarısız giriş sayaçları süreç belleğinde tutuluyor. Her
dağıtımda tüm kullanıcılar oturumdan düşer ve kilitlenme sayaçları sıfırlanır.
Kilitlenme kullanıcı adına göre sayılıyor, adrese göre sayılmıyor.

## Yapılacak

- [ ] Oturumları SQLite'ta sakla (belirteç özeti, kullanıcı, bitiş süresi,
      parmak izi).
- [ ] Başarısız giriş sayaçlarını da kalıcı yap.
- [ ] Adres bazlı bir üst sınır ekle (hız sınırı işiyle aynı başlık sorunu).
- [ ] Test: yeniden başlatmadan sonra oturum geçerli kalıyor, çıkış yapılınca
      geçersiz oluyor.
