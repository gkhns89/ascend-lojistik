# İç Nakliye: yeni kayıt e-postası ve PDF

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** orta
- **Kaynak:** 20 Kasım 2026 isteği. Yönetici, personel İç Nakliye'ye yeni
  kayıt açınca e-posta almak ve kayıtların PDF hâlini portaldan indirmek
  istiyor.

## Ne yapıldı

**E-posta bildirimi**

- Kullanıcı Yönetimi'nde yeni bir seçenek var: "Yeni İç Nakliye kaydı
  açıldığında e-posta gönder" (`users[].notifyTransport`, varsayılan kapalı).
  Yalnız yönetici ve İç Nakliye erişimi olan personel için açılabilir;
  müşteri rollerinde kapalıdır.
- Sunucu, `sync` sonrasında yeni açılan İç Nakliye kayıtlarını bulur
  (`tenant-store.mjs` → `sync()` dönüşü) ve `operations.transportCreated()`
  ile mevcut gönderim kuyruğuna (`outbox`) `transport-new` türünde birer
  satır ekler. Gönderim, diğer e-postalar gibi dakikada bir `deliver()` ile
  yapılır.
- Alıcılar (`transportSubscribers`): aktif, seçeneği açık, geçerli e-postası
  olan ve İç Nakliye erişimi **gönderim anında da** süren kullanıcılar.
  Kaydı açan kişiye kendi kaydı bildirilmez.
- Kayıt düzenlemek bildirim üretmez. Aynı kayıt iki kez kuyruğa girmez
  (`unique_key` = numara + oluşturma zamanı; son kayıt silinip numarası yeni
  kayda verilirse yeni kayıt yine bildirilir).
- Bildirim kuyruğa alınamazsa kayıt geri alınmaz; denetim günlüğüne
  `transport.notice-failed` yazılır.
- E-posta metni kaydın operasyon özetini, portal bağlantısını
  (`PORTAL_PUBLIC_ORIGIN` varsa) içerir; kaydın PDF'i ektedir.

**PDF**

- `portal/transport-pdf.mjs` (pdfkit, Manrope fontu gömülü, resmî logo).
  Tek kayıt: A4 dikey, etiket/değer. Liste: A4 yatay tablo, başlık her
  sayfada tekrarlanır, sonda kayıt / kap / kilo toplamı, sayfa numarası.
- Uçlar: `GET /api/tenant/transport/pdf?id=…` (tek kayıt) ve
  `POST /api/tenant/transport/pdf {ids}` (liste). Kayıtlar `records()`
  üzerinden okunur; İç Nakliye erişimi yoksa 403. İndirme denetim günlüğüne
  `transport.pdf` olarak yazılır.
- İç Nakliye ekranında her satırda **PDF** düğmesi, araç çubuğunda
  **Listeyi PDF indir** (ekranda görünen satırlar, arama ve seçilen sıralama
  dahil).

**Finans:** Ücret, döviz ve ödeme ne PDF'e ne e-postaya girer
(`TRANSPORT_PDF_FIELDS` izin listesi). PDF bir sürücüye ya da depoya
iletilebilir; bu yüzden indiren yönetici olsa bile para alanı basılmaz.

**Bağımlılık:** `portal/package.json`'a `pdfkit@0.17.2` eklendi;
`portal/bun.lock` bu yüzden değişti.

## Doğrulama

- `portal`: `npm test` → 139/139 (yeni: `test/transport-notify.test.mjs`).
  Personelin açtığı kayıt aboneye kuyruğa giriyor; düzenleme, yöneticinin
  kendi kaydı ve erişimi olmayan abone bildirim üretmiyor; gönderilen
  e-postanın eki `%PDF-` ile başlıyor ve ücret içermiyor; PDF ucu erişimsiz
  personel ve müşteriye 403, oturumsuz 401.
- PDF görsel olarak kontrol edildi (Türkçe karakterler, uzun adres, 40 kayıtlı
  çok sayfalı liste).
- İç Nakliye ve Kullanıcı Yönetimi ekranları masaüstü ve telefon genişliğinde
  ekran görüntüsüyle kontrol edildi.
- Kök: `bun run typecheck` ve `bun run build` temiz.

## Kullanıcının yapacağı

- Kullanıcı Yönetimi'nde bildirimi alacak hesabı düzenle: e-posta adresi
  doğru olsun ve "Yeni İç Nakliye kaydı açıldığında e-posta gönder" işaretli
  olsun.
- Resend ücretsiz katmanı günde 100 e-postadır; İç Nakliye hacmi bunu
  zorlarsa bkz. [eposta-dmarc-ve-kota.md](../eposta-dmarc-ve-kota.md).
