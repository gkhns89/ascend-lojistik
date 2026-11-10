# React Faz 3: büyük ekranlar

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** büyük
- **Kaynak:** hafıza `portal-rewrite-plan.md`

## Durum

NCTS (~187 KB), Lojistik (~390 KB) ve Kullanıcı Yönetimi (~84 KB) prototipte.
Hepsi tüm koleksiyonu gönderen `/api/tenant/sync` ve `tenant-bridge.js`'in
localStorage taklidi üzerinden çalışıyor.

## Prototipte yapılan, React'e taşınırken kaybedilmemesi gerekenler

- [ ] Finans toplamları döviz başına ayrı (EUR ile USD toplanmaz). Pay TL tek
      toplam, çünkü kurla TL'ye çevriliyor.
- [ ] Lojistik finans tablosunda "Ödendi" tiki; ödeme tarihini damgalar.
- [ ] Firma Kartları sekmeleri: Tümü / Yurtiçi / Yurtdışı / Acente-Taşıyıcı.
- [ ] Türkçe `ı/i` katlaması (`ITALYA` = `İtalya`) aramada.
- [ ] Finans görünürlüğü rolden değil yetkiden gelir (`user.permissions`).
- [ ] Kullanıcı Yönetimi'nde modül yetki tablosu.
- [ ] İç Nakliye ekranı (`prototype/ic-nakliye.html`).
- [ ] Ortak Finans alanı (`prototype/finans.html`, `finance-center.js`):
      sekmeler yetkiden; modül ekranlarında para alanı yok.
- [ ] İç Nakliye kap/kilo/konteyner kuralı.
- [ ] Pay sahipleri ve pay aktarımı (Finans → Pay Sahipleri, Lojistik → Pay aktarımı).
- [ ] NCTS ödendi ve tahsilat özeti.
- [ ] Firma/gümrük/depo için aranabilen seçenekler (datalist).
- [ ] Ortak veri tablosu görünümü (`data-table.css`): kısa ad, sabit başlık, kısaltma.

## Yapılacak

- [ ] Kaynak başına API: tüm koleksiyonu tek seferde göndermek yerine kayıt
      ekle/güncelle/sil uçları. Yetki kontrolleri `permissions.mjs`'ten gelir.
- [ ] Ekranları sırayla taşı: Kullanıcı Yönetimi → İç Nakliye → NCTS → Lojistik.
