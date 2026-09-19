# Ascend Lojistik — SEO Çalışması ve Yol Haritası

Hazırlanma tarihi: 18 Eylül 2026
Site: https://www.ascendlojistik.com
Bu doküman yalnızca rapor/rehber niteliğindedir; siteye herhangi bir değişiklik uygulanmamıştır.

---

## 1. Özet

Site altı sayfadan oluşuyor: Ana Sayfa, Hakkımızda, Hizmetlerimiz, Global Ağ, Dijital Çözümler, İletişim.
Teknik SEO temeli hazır: her sayfanın kendine ait başlığı, açıklaması, sosyal paylaşım etiketleri, tekil (canonical) adresi var; site haritası ve robots dosyası yayında; Google Analytics 4 ölçümü çalışıyor.

Durum notu: teknik temel iyi, eksik olan taraf **içerik derinliği ve dış bağlantı (backlink) çalışması**.

---

## 2. Sayfa bazlı mevcut başlık ve açıklamalar

| Sayfa | Adres | Başlık | Açıklama |
|---|---|---|---|
| Ana Sayfa | `/` | Ascend Lojistik \| Global Lojistik Çözümleri | Karayolu, denizyolu ve havayolu taşımacılığında global uluslararası lojistik çözümleri. |
| Hakkımızda | `/hakkimizda` | Hakkımızda \| Ascend Lojistik | 2022’de kuruldu; Avrupa, Amerika, Uzak Doğu, Orta Doğu ve Afrika operasyonları. |
| Hizmetlerimiz | `/hizmetlerimiz` | Hizmetlerimiz \| Ascend Lojistik | Karayolu, denizyolu, havayolu, multimodal, proje yükü, parsiyel/komple. |
| Global Ağ | `/global-ag` | Global Ağ \| Ascend Lojistik | Avrupa, Kuzey/Güney Amerika, Uzak Doğu, Orta Doğu ve Afrika iş ortaklığı ağı. |
| Dijital Çözümler | `/dijital-cozumler` | Dijital Çözümler \| Ascend Lojistik | Yükleme takip, finansal görüntüleme, NCTS takibi, otomatik e-posta bildirimleri. |
| İletişim | `/iletisim` | İletişim \| Ascend Lojistik | Teklif talebi ve iletişim formu. |

Kural olarak kullanılan format: `Sayfa Adı | Ascend Lojistik` (60 karakter altı), açıklamalar 150–160 karakter arası.

---

## 3. Yapılan teknik SEO çalışmaları

- **Sayfa başına özgün başlık/açıklama:** Altı sayfanın hepsinde birbirinden farklı, hizmet odaklı metinler.
- **Sosyal paylaşım etiketleri:** Her sayfada `og:title`, `og:description`, `og:type`, `og:url` ve `twitter:card` mevcut.
- **Canonical (tekil adres):** Her sayfa kendi tam adresini işaret ediyor; kopya içerik riski yok.
- **Yapılandırılmış veri (schema.org):**
  - Ana sayfa: Organization (kurum bilgisi)
  - Hizmetlerimiz: Service (her hizmet için ayrı kayıt)
  - İletişim: ContactPage
- **Site haritası:** `sitemap.xml` altı adresi içeriyor ve `robots.txt` içinden gösteriliyor.
- **robots.txt:** Google, Bing, Twitter, Facebook botlarına ve genel botlara tam erişim.
- **Başlık hiyerarşisi:** Her sayfada tek bir H1, alt başlıklar sıralı.
- **Dil işareti:** Sayfa dili Türkçe (`lang="tr"`) olarak tanımlı.
- **Performans:** Ana görsel öncelikli yükleniyor; logo ve görseller optimize edildi (yaklaşık 3,1 MB → 0,8 MB depo yükü).
- **Mobil uyum:** Altı sayfa masaüstü ve mobilde yatay kaymasız, açık/koyu temada okunabilir.
- **Ölçümleme:** Google Analytics 4 (`G-47EHL67FSH`) tek kez yükleniyor; sayfa geçişleri ve teklif/telefon/e-posta tıklamaları (`generate_lead`) ölçülüyor.

---

## 4. Eksikler ve öneriler (öncelik sırasına göre)

### Yüksek öncelik
1. **Google Search Console ve Bing Webmaster Tools kaydı.** Alan adı doğrulanmalı, site haritası elle gönderilmeli. Bu yapılmadan gerçek sıralama/tıklama verisi görülemez.
2. **Google İşletme Profili (Google Business Profile).** Bakırköy/İstanbul adresi, telefon ve çalışma saatleri ile kayıt. "İstanbul uluslararası nakliye firması" gibi yerel aramalarda en hızlı kazanç buradan gelir.
3. **Sosyal paylaşım görseli (1200×630).** Şu anda WhatsApp/LinkedIn’de link paylaşıldığında görsel çıkmıyor. Kurumsal bir kapak görseli hazırlanıp `og:image` olarak eklenmeli.
4. **Hizmet sayfalarının ayrıştırılması.** Şu anda tüm hizmetler tek sayfada. Her hizmet için ayrı adres (ör. `/hizmetlerimiz/karayolu-tasimaciligi`) çok daha fazla arama sorgusunu karşılar.

### Orta öncelik
5. **Blog / bilgi merkezi.** Ayda 2 içerik: "NCTS nedir", "FCL ve LCL farkı", "proje yükü taşımacılığında dikkat edilmesi gerekenler", "ihracat evrakları listesi". Uzun kuyruk aramalarda en büyük etkiyi bu yaratır.
6. **Ek yapılandırılmış veri.** Hakkımızda için AboutPage, alt sayfalar için BreadcrumbList; iletişim bilgileri LocalBusiness olarak işaretlenebilir.
7. **İngilizce sürüm.** Global müşteri hedefi varsa `/en` altında İngilizce içerik + `hreflang` etiketleri. Şu an dil seçici yok.
8. **Referans/vaka çalışmaları.** Gerçek müşteri örnekleri güven ve içerik hacmi sağlar (uydurma veri kullanılmamalı).

### Düşük öncelik / süreklilik
9. **Backlink çalışması:** sektör dernekleri (UTİKAD vb.), ticaret odası dizinleri, lojistik portalları, iş ortağı siteleri.
10. **Dünya haritası görseli hâlâ 813 KB.** Daha hafif bir sürüm sayfa hızını iyileştirir.
11. **İletişim formu** şu anda kullanıcının e-posta uygulamasını açıyor. Gerçek form gönderimi dönüşüm oranını artırır ve dönüşümü ölçmeyi kolaylaştırır.

---

## 5. Anahtar kelime haritası (öneri)

| Sayfa | Birincil | İkincil |
|---|---|---|
| Ana Sayfa | uluslararası lojistik firması | global lojistik çözümleri, nakliye firması İstanbul |
| Hakkımızda | Ascend Lojistik | güvenilir lojistik firması, kurumsal nakliye |
| Hizmetlerimiz | karayolu taşımacılığı | denizyolu taşımacılığı, havayolu kargo, multimodal taşıma, proje yükü, parsiyel taşımacılık, gemi acenteliği |
| Global Ağ | uluslararası nakliye ağı | Avrupa nakliye, Uzak Doğu ithalat, Orta Doğu taşımacılık |
| Dijital Çözümler | yük takip sistemi | NCTS takibi, dijital lojistik platformu |
| İletişim | nakliye teklifi al | lojistik fiyat teklifi |

---

## 6. 90 günlük uygulama planı

**1.–2. hafta**
- Search Console + Bing doğrulaması, site haritası gönderimi
- Google İşletme Profili açılışı
- Sosyal paylaşım görselinin hazırlanması ve eklenmesi

**3.–6. hafta**
- Her hizmet için ayrı sayfa (6–7 sayfa), her biri 400+ kelime özgün metin
- BreadcrumbList ve LocalBusiness işaretlemeleri
- Site haritasının yeni sayfalarla güncellenmesi

**7.–12. hafta**
- Blog bölümü + ilk 4 rehber içerik
- Sektör dizinlerine kayıt (backlink)
- İletişim formunun gerçek gönderime çevrilmesi
- Search Console verisiyle ilk performans değerlendirmesi

---

## 7. Takip edilecek metrikler

- Search Console: gösterim, tıklama, ortalama sıra, indekslenen sayfa sayısı
- GA4: organik oturum, `generate_lead` olay sayısı, sayfa başına dönüşüm
- Sayfa hızı: mobil ve masaüstü Core Web Vitals (LCP, CLS, INP)
- Backlink: yeni referans veren alan adı sayısı

---

## 8. Kaçınılması gerekenler

- Doğrulanmamış istatistik veya uydurma referans yayınlamak
- Aynı metni birden fazla sayfada tekrarlamak
- Anahtar kelime yığmak
- Satın alınmış toplu backlink
- Sayfa başlıklarını gerçek içerikle uyumsuz bırakmak
