# Yetki tablosuna kalan yönetici ekranları

- **Öncelik:** Orta
- **Kim:** karar
- **Boyut:** orta
- **Kaynak:** `portal/permissions.mjs` (10 Kasım 2026)

## Durum

Modül bazlı yetki NCTS, İç Nakliye ve Lojistik için çalışıyor. Şu ekranlar
hâlâ yalnız yöneticiye açık ve yetki tablosunda yok:

- Raporlar: 10 Kasım'dan beri Finans alanında, yalnız yönetici sekmesi.
- Cari: 10 Kasım'dan beri sunucuda ve Finans alanında, yalnız yönetici.
- Teklif Yönetimi (`offer-center.html`)
- Mailden Talep / Fiyat (`mail-import.html`)
- Takip Merkezi (`monitor-center.html`)
- Kullanıcı Yönetimi

## Karar

Bunlardan hangileri personele açılabilmeli? Cari ve Teklif Yönetimi alış
fiyatı ve kâr içerir. Bunlar finans yetkisine mi bağlanmalı, yoksa ayrı bir
yetki mi olmalı?

## Yapılacak

- [ ] Karara göre `permissions.mjs`'e modül ya da ayrı yetki ekle.
- [ ] Sunucudaki `requireAdmin` çağrılarını ilgili yetki kontrolüyle değiştir
      (`offers.mjs`, `operations.mjs`, `monitoring.mjs`, `mail-import.mjs`).
- [ ] Her biri için yetkisiz kullanıcının 403 aldığını gösteren test.
