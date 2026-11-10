# Tablo tasarım iyileştirmesi (veri tablosu rehberine göre)

- **Öncelik:** Orta
- **Kim:** kod (2. adımdaki toplu işlem için önce karar)
- **Boyut:** orta (adım adım ilerler)
- **Kaynak:** kullanıcı isteği, 11 Kasım 2026. Rehber: Pencil & Paper,
  ["Enterprise Data Tables"](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables)
  ve aynı kaynağın "Data Tables UX Checklist" PDF'i. PDF bilerek depoda yok;
  kullanıcı öyle istedi. Maddeleri aşağıda.

Bu dosya başka bir oturumda kaldığı yerden devam etmek için yazıldı. Her adım
bağımsızdır; bitirdiğin adımı işaretle ve altına ne yapıldığını yaz.

## Rehberin bu projeye uyan kuralları

- **Hizalama:** Metin sola. Tutar, miktar, kilo ve yüzde sağa; aynı ondalık
  sayısı ve `tabular-nums` ile. Tarih ve telefon gibi nitel sayılar sola.
  Ortalama hiç yok. Başlık, sütun içeriğiyle aynı hizada.
- **Tekrar yok:** Ortak kelime başlıkta, hücrede yalnız ayırt eden kalır
  (döviz ayrı sütun, "Ödendi/Bekliyor" rozeti).
- **Satır ayırma:** İnce çizgi. Zebra yok; hover ve seçili durumlarıyla
  çakışır.
- **Dikey hizalama:** En fazla 3 satırlık farkta ortala, daha uzunsa üste.
- **Sabitleme:** Başlık ve ilk sütun (kayıt no) sabit. Toplamlar için sabit
  alt satır düşünülebilir.
- **Varsayılan sıra veriye göre:** Eylem bekleyen önce, sonra en yeni.
- **Eylemler:** Satır içinde sağda ve sade. Toplu işlem yalnız seçim
  yapılınca görünür.
- **Para:** Para alanı modalda düzenlenir. Bu bilinçli bir sürtünmedir, inline
  düzenlemeye çevirme.
- **Doğrulama:** Ekran görüntüsüyle yapılır: masaüstü 1440 px, telefon 390 px.
  Telefon için Playwright headless shell kullan, Chrome değil (Chrome en az
  ~533 px çizer). Sayfa taşmamalı; tablo kendi kabında kayabilir.

## Adım 1: hızlı iyileştirmeler (yapıldı, 11 Kasım 2026)

- [x] Zebra kaldırıldı; satırlar ince çizgi ve hover ile ayrılıyor (`portal/prototype/data-table.css`).
- [x] İlk sütun yatay kaymada sabit. Masaüstünde dar pencerede ve telefonda denendi.
- [x] Başlığa tıklayınca sıralama: ortak yardımcı `portal/prototype/data-table.js` (`AscendTable.sortable`).
  - Metin A-Z, sayı ve tarih büyükten küçüğe; ikinci tıklama tersi, üçüncü tıklama varsayılan sıra.
  - Boş değer ("—") hep sonda. Türkçe sayı biçimi doğru okunuyor.
  - Etkin sütunda ok görünüyor, `aria-sort` set ediliyor; boş ok yalnız üzerine gelince çıkıyor ve hiza kaymıyor.
  - Klavyeyle (Enter/boşluk) de çalışıyor.
- [x] Varsayılan sıra Finans'ın Lojistik, NCTS ve İç Nakliye sekmelerinde "ödeme bekleyen önce, sonra en yeni".
- [x] Ödeme filtresi ve sıralama tarayıcı sekmesinde oturum boyunca korunuyor. Arama metni bilerek saklanmıyor.
  - Bu tercih tarayıcının oturum deposunda tutuluyor; portal köprüsü yalnız iş verisi içindir.
- [x] Siralama İç Nakliye listesinde ve Finans'taki Cari ile Pay Sahipleri tablolarında da var.
  - Anlamsız sütunlar sıralanmıyor: Bakiye, Henüz aktarılmamış pay, Teslim adresi (`data-sortable="false"`).
- [x] Test: `portal/test/data-table.test.mjs`.

## Adım 2: sıradaki işler (önerilen sıra)

1. [x] **Niş başlıklara açıklama** (yapıldı, 11 Kasım 2026).
   - Başlıkta `data-help` var: Pay (1/3), Kur, Pay TL, Ödendi, Pay aktarımı,
     Teminat, Aktarım, Henüz aktarılmamış pay, Bakiye. Kazanç ve Toplam
     bilerek açıklamasız; başlık zaten açık, fazla (?) gürültü olur.
   - Fareyle: başlığın `title`'ı açıklama + sıralama ipucu (ikisi birlikte).
   - Dokunmatik ve klavye: başlıktaki küçük (?) düğmesi tek bir kabarcık
     açar. Kabarcık tablonun kaydırma kabında kırpılmasın diye sayfanın
     üstünde durur. Kaydırmada düğmeyi izler; Esc ya da dışarı tıklama kapatır.
     (?) tıklaması sıralamayı tetiklemez.
   - Açıklamalı başlık noktalı alt çizgiyle belli.
2. [x] **Aramada eşleşmeyi vurgula** (yapıldı, 11 Kasım 2026).
   - Finans'ın Lojistik, NCTS, İç Nakliye ve Cari sekmeleri ile İç Nakliye
     listesi. `AscendTable.highlight` yalnız metin düğümlerini böler,
     `<mark>` öğesi oluşturur; HTML yazmaz.
   - Türkçe büyük/küçük harf eşleşir ("halkalı" → "HALKALI").
   - Düğme, rozet ve başlık metni vurgulanmaz. Arama tam ünvanda eşleşip
     hücrede kısa ad görünüyorsa vurgu çıkmaz; tam ünvan `title`'da.
   - Sıralama, vurgulu hücrenin metnini doğru okuyor (`primaryText`).
   - Bu sırada bulunan iki eski hata da düzeldi:
     - "Ödendi/Bekliyor" rozetleri açık temada renksiz, koyu temada ikisi de
       aynı griydi. Artık Ödendi yeşil, Bekliyor amber; metin aynen duruyor.
     - `portal-theme.css` koyu temada her tabloya `!important` zebra
       veriyordu. Adım 1'deki "zebra yok" yalnız açık temada geçerliydi.
       Kural ortak tabloyu (`.data-table`) hariç tutacak şekilde daraltıldı.
   - Doğrulama: ekran görüntüsü 1440 px açık ve koyu tema, 390 px telefon
     (Playwright shell). Sayfa taşmıyor. Koyu temada satır zeminleri ölçüldü:
     hepsi aynı.
3. [ ] **Toplu "Ödendi" işaretleme** (Lojistik, NCTS, İç Nakliye). Satır
   başında seçim kutusu olacak; seçim varken alta sabit bir çubuk çıkacak:
   "N kayıt seçildi · Ödendi işaretle · Seçimi kaldır".
   - **Önce karar gerek:** Lojistik'te ödeme bir tarihtir (`paymentDate`).
     Toplu işaretlemede bugünün tarihi mi yazılacak, yoksa tarih mi sorulacak?
   - Tek `save()` çağrısı yeterli; sunucu zaten tek seferde yazıyor.
4. [ ] **Toplamları sabit alt satıra taşı.** Lojistik, NCTS ve İç Nakliye'de
   toplamlar şu an tablonun altında ayrı kartlarda.
   - `tfoot` ile sabit alt satır denenebilir.
   - Döviz başına çok satırlı toplam tek satıra sığmayabilir. Ekran görüntüsüyle
     karar ver; kartlar daha okunaklıysa kalsın, nedenini buraya yaz.
5. [ ] **Sütun göster/gizle ve "Varsayılana dön".** Yalnız Lojistik finans
   (12 sütun) için. Örnek: Alış ve Kur dar ekranda gizlenebilir. Seçim oturum
   deposunda tutulur.
6. [ ] **Telefonda dokunma hedefleri.** Onay kutusu 16 px; telefonda en az
   24 px olmalı. Düğmeler de biraz büyümeli (`@media (max-width:640px)`).
7. [ ] **Boş, yükleniyor ve hata durumları.**
   - Her tablonun boş mesajı ne yapılacağını söylemeli.
   - Kayıt hatası durum satırında görünüyor; tabloya yakın mı? Kontrol et.
8. [ ] **Diğer prototip tabloları.** Lojistik operasyon listesi, NCTS listesi,
   Firma Kartları, Kullanıcı Yönetimi ve Teklif Yönetimi ortak
   `data-table.css`'i kullanmıyor.
   - Prototip React'e taşınacağı için ([react-faz3-buyuk-ekranlar.md](react-faz3-buyuk-ekranlar.md))
     buralara büyük yatırım yapma.
   - Yalnız göze batan sorunları düzelt: taşan tablo, ortalanmış sayı, zebra.
9. [ ] **React ortak tablo bileşeni.** Yukarıdaki kurallar ve adım 1'in
   davranışı React'teki tek tablo bileşeninin gereksinimidir: sabit
   başlık ve ilk sütun, sıralama, korunan görünüm, toplu seçim.

## Her tablo işinde geçilecek checklist (PDF'ten)

Tablonun türüne göre ağırlık ver:

- **Eylem odaklı** (Finans sekmeleri, İç Nakliye listesi): önce Sayfa ve Eylemler.
- **Bilgi odaklı** (Cari, Raporlar): önce Bilgi mimarisi, Veri, Görsel hiyerarşi ve Arama.

**Sayfa**
- Sayfanın ne olduğu, doğrudan gelinse bile açık mı?
- En önemli eylem belli mi?
- Farklı roller için varsayılan anlamlı mı?
- Takılan kullanıcı ne yapacağını bulabiliyor mu?

**Veri**
- Varsayılan sütunların yarıdan fazlası bu kullanıcı için anlamlı mı?
- Sütun sırası mantıklı mı?
- Değerlerde tekrar var mı?
- Uzun değerler kısaltılıyor mu (kısa ad, tam ünvan üzerine gelince)?
- Sistemin ürettiği değerler açıklanıyor mu?
- Boş veya "—" değerler kafa karıştırıyor mu?

**Bilgi mimarisi**
- Sayfa başlığı ve sütun başlıkları herkesçe anlaşılır mı?
- Eylem fiilleri bilinen kalıplarda mı (Düzenle, Sil, Aktar)?
- Niş başlıklar açıklanıyor mu?

**Eylemler**
- Önemli eylem öne çıkıyor, ikincil olan geri planda mı?
- Varsayılan sıralama ve görünür sütunlar yararlı mı?
- Toplu işlem gerekiyor mu?

**Düzenleme**
- Düzenlenebilir olduğu belli mi?
- Hata ve tamam durumları ayırt ediliyor mu?

**Görsel hiyerarşi**
- Gözleri kısınca en önemli şey en belirgin mi?
- Üst üste binen metin yok mu?
- Odaklanılan satır belli mi?
- Eylemler statik bilgiden ayrışıyor mu?
- Durumlar rozetle mi gösteriliyor?

**Telefon**
- Duyarlı mı?
- Dokunma hedefleri yeterince büyük mü?
- Gösterilen veri telefondaki işe uygun mu?
- Kaldırılan işlevin alternatifi var mı?

**Arama ve filtre**
- Filtre, sıralama ve arama var mı?
- Eşleşme vurgulanıyor mu?
- Görünüm geri dönünce korunuyor mu?
- Sütun ekleme/çıkarma ve kayıtlı düzen gerekli mi?
