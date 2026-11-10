# Pay sahipleri, pay aktarımı, NCTS ödendi, düzenli tablolar

- **Commit:** bu dosyayla birlikte
- **İstek:** kullanıcı, 10 Kasım 2026

## İnceleme: pay nasıl hesaplanıyordu

Pay hiçbir yerde saklanmıyordu; her açılışta yeniden hesaplanıyordu.
Kazanç = satış − alış, Pay = kazanç ÷ 3 (bölen kodda sabit), Pay TL = pay ×
dosyanın kuru. Payın kime ait olduğu ve aktarılıp aktarılmadığı sistemde
yoktu. Atakan'ın Excel'indeki PAY / PAY TL / Ödeme Tarihi / KUR sütunları
aynı işi elle tutuyordu.

## Kararlar (kullanıcı)

- Kâr her dosyada 3 eşit paya bölünür; 3 pay sahibi vardır.
- Aktarım TL olarak, aktarım günündeki kurla yapılır.
- Bir pay sahibinin bir dosyadaki payı tek seferde aktarılır.

## Yapılan

- `portal/shares.mjs`: pay sahipleri (en fazla 3 aktif; şahıs ya da firma) ve
  pay aktarımları (dosya, pay sahibi, tarih, döviz, pay (kuruş), kur, TL
  (kuruş)). TL tutarını sunucu pay × kur ile yeniden hesaplar; istemcinin
  gönderdiği tutara güvenmez. Aynı dosyada aynı pay sahibine ikinci aktarım
  reddedilir. Aktarım değiştirilemez; silinir ve doğrusu eklenir, silme
  denetim günlüğüne içeriğiyle yazılır. Aktarımı olan pay sahibi silinemez,
  pasife alınır. Yalnız yönetici okuyup yazabilir.
- Finans → Pay Sahipleri sekmesi (yönetici): ekleme, düzenleme, pasife
  alma, aktarılan TL ve bekleyen pay.
- Finans → Lojistik: "Pay aktarımı" sütunu (aktarılan/3 ve Aktar), her pay
  sahibi için tarih, kur ve canlı TL hesabı içeren aktarım penceresi. Tablonun
  altında "Aktarılan paylar" özeti: pay sahibi başına aktarılan TL ve henüz
  aktarılmamış pay (döviz başına, dosya sayısıyla). Dosyanın tutarı aktarımdan
  sonra değişirse pencere uyarıyor.
- NCTS'ye "Ödendi" (`paid`, finans alanı) eklendi; özet artık Genel toplam /
  Tahsil edilen / Ödeme bekleyen, döviz başına.
- Tablolar ekran görüntüsüyle düzenlendi:
  - Döviz ayrı bir dar sütunda, tutarlar sade.
  - Dosya + varış, gönderici → alıcı + acente, gümrük + depo iki satırlı
    hücrelerde.
  - Düğmeler satır içinde; kur Türkçe biçimde.
  - 12 sütunlu Lojistik tablosu 1440 pikselde tamamen sığıyor.
  - İç Nakliye formu iki düzenli satırda.
  - Köprünün eklediği menü düğmeleri küçük, tek satırlık bir kısayol
    şeridine dönüştü; finans yetkilisine "Finans" kısayolu eklendi.
  - Telefonda sayfa taşmıyor, tablolar kendi içinde kayıyor (375 pikselde
    ölçüldü).

## Bu sırada bulunan hata

Modüller arası finans koruması genel adlı alanlara da uygulanıyordu.
Sevkiyattaki `currency` (eşya değerinin dövizi, finans değil) İç Nakliye
finansı sayılıyordu. Bu yüzden İç Nakliye finansı olmayan personel (yani
varsayılan olarak tüm personel) bu alanı göremiyordu ve düzeltmesi sessizce
kaydedilmiyordu. Düzeltme: modüller arası koruma yalnız ayırt edici adlı
alanlara (`stray`) uygulanıyor; genel adlar yalnız kendi modülünde finans.
Aynı commit içinde.

## Doğrulama

- `test/shares.test.mjs` aşağıdakileri sınıyor; kasıtlı bozmayla da sınandı:
  - pay sahibi kuralları
  - TL hesabı ve sunucu kontrolü
  - dosya başına tek aktarım ve değiştirilemezlik
  - yalnız yönetici erişimi ve yeniden açılışta kalıcılık
  - aktarımı olan pay sahibinin silinememesi ve denetim
  - genel ad bekçisi
  - sayfanın pay ve bekleyen hesapları

  TL kontrolünün kaldırılması, tek aktarım kuralının kaldırılması ve genel ad
  hatasının geri getirilmesi yakalandı.
- Ekran görüntüleri: Lojistik, NCTS, İç Nakliye, Pay Sahipleri (1440 px) ve
  Lojistik (390 px).
- İmaj gerçek diskle çalıştırıldı. Pay sahibi ve aktarım, konteyner sert
  biçimde silinip yeniden başlatıldıktan sonra yerindeydi.
- `node --test`: 118/118.
