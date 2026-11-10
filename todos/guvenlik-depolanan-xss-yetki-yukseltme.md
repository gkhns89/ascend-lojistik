# Depolanan XSS ile yetki yükseltme

- **Öncelik:** Yüksek — **personel hesabı açmadan önce yapılmalı**
- **Kim:** kod
- **Boyut:** orta
- **Kaynak:** 10 Kasım 2026 incelemesi (modül bazlı yetki işi sırasında)

## Durum

Prototip ekranları kullanıcıdan gelen metni çoğu yerde `innerHTML` şablonuna
kaçırmadan yazıyor. Örnek: Lojistik ekranında `renderCompanies()` içinde
`<td>${c.name}</td>`. Kullanıcı Yönetimi listesinde ad, kullanıcı adı ve
e-posta da kaçırılmıyor.

Zincir:

1. Yönetici olmayan personel firma kartlarını yazabiliyor
   (`tenant-store.mjs`, `sync()`: `if(body.companies)cleaned.companies=body.companies`).
2. Firma adı sunucuda HTML'e karşı denetlenmiyor.
3. CSP `script-src 'self' 'unsafe-inline'` olduğu için satır içi olay
   işleyicisi (`<img src=x onerror=…>`) çalışıyor (`server.mjs`).
4. Yönetici Firma Kartları'nı açınca betik onun oturumuyla çalışır ve
   `/api/tenant/sync` ile personele finans yetkisi, hatta yönetici rolü
   verebilir.

Bu, modül bazlı yetki sistemini aşmanın yoludur.

**Bugün istismar edilemiyor:** canlıda yalnız yönetici hesapları var, personel
hesabı yok. Herkese açık teklif formu bu zincire girmiyor: teklif ekranları
`textContent` kullanıyor ve teklif sevkiyata dönüşürken firma adı formdan değil
mevcut firma kartından alınıyor.

## Kapsam (10 Kasım ölçümü)

`innerHTML` şablonundaki `${…}` sayısı, kaçırılmış ya da sayı olanlar
düşüldükten sonra incelenecek olanlar:

- Lojistik (`02_LOJISTIK_PORTAL_BRANDED_v14.html`): 43
- NCTS (`01_NCTS_BRANDED_v15.html`): 15
- Kullanıcı Yönetimi (`03_KULLANICI_YONETIMI.html`): 3

## Yapılacak

- [ ] Her `innerHTML` şablonundaki kullanıcı verisini mevcut kaçırma
      fonksiyonuyla (`trackingEscape`, `escapeUser`) sar ya da
      `textContent`/DOM ile kur. Öznitelik içindeki değerlere de bak (`"` ile
      öznitelikten çıkılabilir).
- [ ] Sunucuda savunma katmanı: firma, kullanıcı ve kayıt metin alanlarında
      `<` içeren **yeni ya da değişen** değeri reddet. Mevcut kayıtları
      reddetme; yoksa eski bir kayıt yüzünden yönetici hiçbir şey kaydedemez.
- [ ] Bir test: personel `<img onerror>` adlı firma yazar, yönetici sayfası
      bu adı metin olarak gösterir.
- [ ] Uzun vadeli çözüm React geçişi: JSX metni kendiliğinden kaçırır ve
      `'unsafe-inline'` kaldırılabilir.

## Bitti sayılır

Personel hesabının yazabildiği hiçbir alan, yöneticinin açtığı bir sayfada
HTML olarak yorumlanmıyor ve bunu kanıtlayan test var.
