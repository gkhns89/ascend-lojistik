# Railway altyapısı ve CI

- **Commit:** `c99fa79`, `da266d6`, `43e491e`, `0025a28`, `0c9fc06`, `8dddbfb`

- Site için Node hedefli Railway imajı. `NITRO_PRESET=node-server` ile
  Cloudflare ön ayarı çevrildi.
- Portal kalıcı diske yazıyor (`/data`). `/app`'e bağlanan volume uygulamayı
  gizliyordu; kaldırıldı.
- 16 Eylül'den beri kırmızı olan CI düzeltildi: geri yükleme betiğinin yolu
  test dosyasına göre çözülüyor.
- Portal prettier kapsamından çıkarıldı. Veritabanı servisi gerekmediği
  belgelendi; portal `node:sqlite` kullanıyor.
