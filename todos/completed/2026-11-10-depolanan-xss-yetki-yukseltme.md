# Depolanan XSS ile yetki yükseltme — kapatıldı

- **Commit:** bu dosyayla birlikte
- **Bulunduğu gün:** 10 Kasım 2026, modül bazlı yetki işi sırasında

## Sorun

Prototip ekranları kullanıcıdan gelen metni `innerHTML` şablonuna kaçırmadan
yazıyordu (`<td>${c.name}</td>` gibi). Personel firma kartlarını yazabiliyor ve
CSP satır içi betiğe izin veriyor (`'unsafe-inline'`). Bu yüzden personel firma
adına betik gömebilirdi. Yönetici Firma Kartları'nı açınca betik yöneticinin
oturumuyla çalışır ve kendine finans, hatta yönetici yetkisi verirdi. Personel
hesabı açılmadan bulunduğu için istismar edilmedi.

Bir ayrıntı yalnız `<` yasaklamanın yetmediğini gösterdi: yetkili kartı
değerleri öznitelik içine yazıyordu (`value="${c.first}"`). Orada `"` ile
öznitelikten çıkıp kod çalıştırmak için `<` gerekmez.

## Yapılan

**Ekranlar (asıl düzeltme).** HTML üreten tüm şablonlar tarandı; yalnız
doğrudan atamalar değil, HTML döndüren fonksiyonlar da (`contactTemplate`,
`cells`) tarandı. Kullanıcı verisi taşıyan her ifade kaçırma fonksiyonundan
geçiyor. Bu fonksiyon `&` `<` `>` `"` `'` karakterlerinin hepsini dönüştürür.

- Lojistik: firma listesi, yetkili kartı (öznitelik içi), evrak etiketleri,
  yük listesi, posta geçmişi, takip tablosu, finans tablosu, bildirim ve
  yazdırma hücreleri.
- NCTS: iki liste. Sayfada kaçırma fonksiyonu yoktu; `nctsEscape` eklendi.
- Kullanıcı Yönetimi: ad, kullanıcı adı, e-posta.

Kalan 29 ifadenin hepsi sabit, boolean ya da içeride zaten kaçırma yapan
`trackingCompany` / `trackingTransport`.

**Sunucu (ikinci katman).** `portal/text-guard.mjs`: yeni ya da değişen
metinde `<` kabul edilmez. Kapsam `sync()` (firma, sevkiyat, NCTS, iç nakliye,
kullanıcı; iç içe alanlar dahil) ve herkese açık teklif formu
(`validateQuote`). Eski bir kayıtta `<` kalmışsa reddedilmez; yoksa o tek kayıt
yüzünden yönetici hiçbir şey kaydedemezdi. Tırnak serbest; `2" boru` gibi
geçerli yük tanımları var. Parolalar denetlenmez.

## Doğrulama

- `test/markup-guard.test.mjs`: 6 test. Biri **gerileme bekçisi**: prototipte
  HTML üreten bir şablona kaçırılmamış kayıt alanı (`r.x`, `c.x`, `m.x`, `u.x`,
  `x.x`) yazılırsa CI kırılır.
- Kasıtlı bozmayla sınandı: firma adındaki kaçırmayı geri almak, sunucu
  kilidini kaldırmak ve teklif formu kilidini kaldırmak. Üçü de yakalandı.
- İmaj yerelde çalıştırıldı. İşaretli firma adı HTTP üzerinden 400 aldı,
  temiz ad 200.

## Kalan risk

CSP hâlâ `'unsafe-inline'`. Prototip satır içi betiğe muhtaç. Kesin çözüm React
geçişi; bkz. [../react-faz4-temizlik.md](../react-faz4-temizlik.md). Bekçi
yalnız basit alan erişimini yakalar. Karmaşık bir ifade yeni bir HTML
şablonuna girerse gözle bakılmalı.
