# Yapılacaklar

Projenin açık işleri bu klasörde, her iş ayrı bir dosyada durur. Biten iş
`completed/` altına `YYYY-AA-GG-` önekiyle taşınır; böylece ne zaman ve neden
yapıldığı kaybolmaz.

Her dosyanın başında dört alan vardır:

- **Öncelik:** Yüksek / Orta / Düşük
- **Kim:** `kod` (kod değişikliği), `kullanıcı` (bir panelde ya da hesapta
  yapılacak iş: Railway, Google, Cloudflare…), `karar` (önce ürün kararı)
- **Boyut:** küçük / orta / büyük
- **Kaynak:** işin nereden çıktığı (dosya, satır, commit)

Bir işi bitirince: dosyanın sonuna ne yapıldığını ve doğrulamayı yaz, dosyayı
`completed/` altına taşı, bu tablodan satırını sil.

Son tarama: 10 Kasım 2026.

## Yüksek

| İş | Kim | Boyut |
| --- | --- | --- |
| [Teklif formu hız sınırı proxy adresine bağlı](guvenlik-teklif-formu-hiz-siniri.md) | kod | küçük |
| [Önizleme kapısı değişkeni silinirse portal açılmaz](altyapi-onizleme-kapisi-varsayilani.md) | kod | küçük |
| [TOTP'yi etkinleştir](guvenlik-totp-etkinlestir.md) | kullanıcı | küçük |
| [Drive yedeğini gerçekten aç](yedek-drive-etkinlestir.md) | kullanıcı + kod | küçük |
| [Açık teklif formu ve onay e-postası kötüye kullanımı](eposta-acik-form-kotuye-kullanim.md) | karar + kod | küçük |

## Orta

| İş | Kim | Boyut |
| --- | --- | --- |
| [Teklif zincirini canlıda uçtan uca dene](teklif-zinciri-canli-test.md) — bekletiliyor | kullanıcı | küçük |
| [Oturumlar bellekte; her dağıtımda herkes düşüyor](altyapi-oturumlar-kalici.md) | kod | orta |
| [Dosya numarasını sunucu versin](numaralandirma-sunucuda.md) | kod | küçük |
| [Yetki tablosuna kalan yönetici ekranları](yetki-kalan-yonetici-ekranlari.md) | karar | orta |
| [İç Nakliye için ek alanlar](ic-nakliye-ek-alanlar.md) | karar | küçük |
| [İki paralel yetki politikası](guvenlik-access-policy-birlestir.md) | kod | orta |
| [React istemcisini imaja koy ve sun](react-imajda-sun.md) | kod | orta |
| [React Faz 2: kalan ekranlar](react-faz2-kalan-ekranlar.md) | kod | orta |
| [React Faz 3: büyük ekranlar](react-faz3-buyuk-ekranlar.md) | kod | büyük |
| [CI kapsamı](ci-kapsami.md) | kod | küçük |
| [Hâlâ "e-posta bağlı değil" diyen metinler](arayuz-eskimis-eposta-metinleri.md) | kod | küçük |
| [Açılış kontrolü yeni değişkenleri bilmiyor](altyapi-preflight-degiskenler.md) | kod | küçük |
| [Yedek güvenliği ve geri yükleme denemesi](yedek-guvenlik-ve-geri-yukleme.md) | karar + kod + kullanıcı | orta |
| [DMARC'ı sıkılaştır, Resend kotasını izle](eposta-dmarc-ve-kota.md) | kullanıcı | küçük |
| [Arama motoru ve işletme kayıtları](seo-hesap-kayitlari.md) | kullanıcı | küçük |
| [Eskimiş belgeler](dokumantasyon-eskimis-belgeler.md) | kod | küçük |
| [Kabul testleri](kabul-testleri.md) | kullanıcı | küçük |

## Düşük / karar bekleyen

| İş | Kim | Boyut |
| --- | --- | --- |
| [React Faz 4: prototipi kaldır](react-faz4-temizlik.md) | kod | orta |
| [React Faz 5: monorepo](react-faz5-monorepo.md) | karar | büyük |
| [Gönderim durumu ve gelen posta](eposta-teslim-durumu-ve-gelen-posta.md) | karar | orta |
| [SEO içerik ve bağlantılar](seo-icerik-ve-baglanti.md) | karar + kullanıcı | büyük |
| [İletişim formu ve üst menü düğmesi](site-iletisim-formu-ve-cta.md) | karar | küçük |
| [PostgreSQL ve dosya deposu](altyapi-postgresql-ve-dosya-deposu.md) | karar | büyük |
| [Müşteri erişimini açma](musteri-erisimini-acma.md) | kod + kullanıcı | büyük |
| [Bekleyen ürün kararları](urun-kararlari.md) | karar | orta |
| [Railway bakımı](railway-bakim.md) | kullanıcı + kod | küçük |

## Tamamlananlar

`completed/` klasörüne bakın; dosya adları tarihe göre sıralanır.
