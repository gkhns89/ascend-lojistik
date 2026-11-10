# PostgreSQL ve dosya deposu

- **Öncelik:** Düşük
- **Kim:** karar
- **Boyut:** büyük
- **Kaynak:** `portal/README.md:47,52`, `docs/DEPLOYMENT.md`

## Durum

Portal `node:sqlite` ile tek dosyada çalışıyor; dosya Railway volume'unda
(`/data`) duruyor. Belgeler (PDF) de bu veritabanında.

## Karar

Tek firma ve az kullanıcı için SQLite yeterli. Geçiş, ham SQL içeren tüm
portal modüllerinin yeniden yazılması demek. Şu sorulara göre karar verilmeli:
müşteri erişimi açılacak mı, eşzamanlı kullanıcı sayısı artacak mı, belgeler
büyüyecek mi?
