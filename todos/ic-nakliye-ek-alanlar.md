# İç Nakliye için ek alanlar

- **Öncelik:** Orta
- **Kim:** karar
- **Boyut:** küçük
- **Kaynak:** 10 Kasım 2026 isteği; Atakan'ın elle tuttuğu iş tablosundaki iç nakliye sayfası

## Durum

Modül istenen alanlarla açıldı: Firma, Gümrük adı, Depo, Teslim adresi,
Taşıma ücreti (döviziyle), Ödeme alındı.

Döviz alanı istenmemişti; yine de eklendi. Dövizi belli olmayan bir ücret,
23 Eylül'de düzeltilen "EUR ile USD toplanıyor" hatasının aynısına yol açar.
Varsayılan TRY.

Atakan'ın elle tuttuğu iç nakliye tablosunda ayrıca şu sütunlar var: taşıma
tarihi, nakliyeci, alınan fiyat, verilen fiyat, kazanç.

## Karar

- Taşıma tarihi eklensin mi? Kayıtları aya göre süzmek için gerekli.
- Nakliyeci eklensin mi? Eklenirse Firma Kartları'ndaki acente/taşıyıcı
  listesinden mi seçilsin?
- Tek ücret yerine alınan fiyat, verilen fiyat ve kazanç mı tutulsun? Öyleyse
  verilen fiyat ve kazanç da finans alanı olur.
- İç nakliye kaydına belge (PDF) eklenebilsin mi? Belge altyapısı şu an
  yalnız Lojistik ve NCTS'yi kabul ediyor.

## Yapılacak

- [ ] Karara göre şu üç yeri birlikte genişlet: `portal/transport.mjs`
      doğrulaması, `permissions.mjs` finans alanları ve
      `prototype/ic-nakliye.html` formu.
