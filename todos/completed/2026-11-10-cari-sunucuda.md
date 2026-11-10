# Cari sunucuda, Finans alanında

- **Commit:** bu dosyayla birlikte

## Sorun

Cari'deki müşteri ve taşıyıcı hesaplarının fatura ve ödeme kayıtları
tarayıcıda tutuluyordu (`ascend_account_entries`,
`ascend_carrier_account_entries`). Sunucuya kaydeden köprü bu anahtarları
tanımıyordu ve sessizce bellekte tutuyordu. Sunucuda Cari için bir saklama
alanı yoktu. Canlıda her kayıt sayfa yenilenince kayboluyor, ekran ise "Kayıt
eklendi" diyordu. Hiçbir kayıt sunucuya ulaşmadığı için taşınacak veri yoktu.

## Yapılan

- `portal/ledger.mjs`: sunucuda `ledger` koleksiyonu. Kayıtlar izin listesiyle
  yeniden kuruluyor. Alanlar: tür (müşteri/taşıyıcı), kayıt türü
  (fatura/ödeme), firma, üç harfli döviz, tarih, referans, kuruş cinsinden
  tam sayı tutar ve not. Aynı firma + döviz + tür için aynı referans iki kez
  girilemiyor; büyük/küçük harf ve I/İ farkı önemsiz.
- **Kayıtlar değiştirilemez.** Yanlış kayıt silinip doğrusu ekleniyor. Silme,
  silinen kaydın içeriğiyle birlikte denetim günlüğüne yazılıyor.
- Yalnız yönetici okuyabiliyor ve yazabiliyor (kullanıcı kararı). Finans
  yetkisi verilmiş personel bile göremiyor, çünkü taşıyıcı carisi alış fiyatı
  içeriyor. Yönetici olmayanın yazma denemesi sessizce düşürülmüyor, 403 ile
  reddediliyor.
- Finans alanında "Cari" sekmesi (yönetici): müşteri ve taşıyıcı carileri,
  arama, hesap listesi, döviz başına fatura / ödeme / borç-alacak, kayıt
  formu, fatura ve ödeme tabloları, silme.
- Hesaplar eskisi gibi sevkiyatlardan oluşuyor: müşteri carisi alıcıdan,
  taşıyıcı carisi acenteden. Cari kaydı olan ama sevkiyatı olmayan firma da
  listeleniyor.

## Doğrulama

- `test/ledger.test.mjs`: kayıt deponun kapatılıp yeniden açılmasından sağ
  çıkıyor (asıl hata). Yalnız yönetici okuyup yazabiliyor. Kayıt
  değiştirilemiyor ve silme denetimde içeriğiyle görünüyor. Doğrulama ve
  bakiye hesapları da sınanıyor.
- Kasıtlı bozma: Cari'nin herkese gönderilmesi, personel yazmasının sessizce
  düşürülmesi, kaydın değiştirilebilmesi ve Cari'nin durum dosyasına
  yazılmaması. Dördü de yakalandı.
- İmaj yerelde gerçek diskle çalıştırıldı. HTTP üzerinden girilen kayıt,
  konteyner sert biçimde silinip aynı diskle yeniden başlatıldıktan sonra
  yerindeydi.
- Bu denemede Git Bash'in `docker run` yollarını bozduğu ortaya çıktı.
  Önceki yerel imaj denemeleri diske yazmayı hiç sınamamıştı (açılış ve HTTP
  sınamaları geçerliydi). Not hafızada; artık `MSYS_NO_PATHCONV=1`
  kullanılıyor.
- `node --test`: 107/107.

## Kalan

Lojistik ekranındaki eski Cari kodu (`account-ledger.js` ve bölümü) devre
dışı. React geçişinde silinecek: [../react-faz4-temizlik.md](../react-faz4-temizlik.md).
