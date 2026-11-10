# CI kapsamı

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** küçük
- **Kaynak:** `.github/workflows/ci.yml`, `.github/workflows/railway.yml`

## Durum

- CI `portal/web`'i derlemiyor; React tarafındaki bir tip hatası gözden kaçar.
- CI lint çalıştırmıyor.
- Site duman testi yalnız 6 adres, site haritası ve robots dosyasına bakıyor.
  Hizmet sayfaları, `/en/*`, eski adres yönlendirmeleri ve dil yönlendirmesi
  kapsam dışında.
- Yerelde `bun test`, Windows'ta iki yedek testini `EBUSY` ile düşürüyor.
  Aynı testler `node --test` ile (CI'ın komutu) temiz geçiyor; sorun bun'a
  özgü. Yerelde portal testleri `node --test test/*.test.mjs` ile koşulmalı.

## Yapılacak

- [ ] CI'a `portal/web` için `bun install --frozen-lockfile`, typecheck ve
      build adımı ekle.
- [ ] CI'a `bun run lint` ekle.
- [ ] Duman testine 7 hizmet sayfasını, 13 İngilizce sayfayı,
      `/acentelik` → `/gemi-acenteligi` 301'ini ve `Location` başlığının
      `https` olduğunu ekle.
- [ ] `DEVELOPMENT.md`'ye yerel portal test komutunu yaz.
