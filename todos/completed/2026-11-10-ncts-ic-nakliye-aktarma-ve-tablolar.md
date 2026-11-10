# NCTS'den İç Nakliye'ye aktarma, firma seçimi, düzenli tablolar

- **Commit:** bu dosyayla birlikte
- **İstek:** kullanıcı, 10 Kasım 2026

## NCTS kayıtlarını İç Nakliye'ye aktarma (tek seferlik)

İstek: ASC-2026-0007, 0008, 0009, 0010 ve 0011 İç Nakliye kaydına dönüşsün.
Hepsi konteyner olsun, tutar NCTS navlun ücreti olsun, eski kayıtlar silinsin.

Canlı veri bu ortamdan okunamıyor. Bu yüzden kayıtları körlemesine dönüştüren
bir betik yazılmadı; İç Nakliye ekranının altına yöneticiye özel bir aktarma
bölümü eklendi. İstenen beş kayıt önceden seçili geliyor. Yönetici gerçek
kayıtları, tutarları, oluşacak kayıtları, uyarıları ve kayda bağlı belgeleri
görüp onaylıyor. Aktarma:

1. Sunucuda doğrulanmış bir yedek alır (`/data/backups`); yedek alınamazsa
   durur.
2. Sunucudaki son durumla planı yeniden kurar.
3. Tek istekte yeni İç Nakliye kayıtlarını ekler ve seçili NCTS kayıtlarını
   siler. Sunucu ikisini birlikte uygular ya da hiçbirini uygulamaz.

Eşleme (`prototype/transport-import.js`):

| İç Nakliye | NCTS |
| --- | --- |
| Firma | Alıcı (ekranda Gönderici seçilebilir) |
| Gümrük | Varış gümrük idaresi |
| Depo | Gideceği antrepo / depo |
| Teslim adresi | Alıcının (ya da göndericinin) adresi |
| Kap / Kilo | Toplam kap / brüt kilo |
| Konteyner | evet |
| Ücret / Döviz | Navlun ücreti / finans dövizi |
| Kaynak | `NCTS ASC-2026-000X` |

Teminat ücreti aktarılmıyor; önizleme bunu kayıt bazında söylüyor. İç
Nakliye'nin desteklemediği bir döviz ya da eksik firma kaydı engelliyor.

## Firma, gümrük ve depo seçimi

İç Nakliye formunda üç alan yazarken aranabilen seçenek sunuyor:

- Firma: Firma Kartları ve daha önce İç Nakliye'de kullanılan firmalar.
- Gümrük ve depo: daha önce yazılanlar ve NCTS'deki gümrük/antrepo adları.

Yeni bir ad yazmak da serbest.

## Tablolar

`prototype/data-table.css` Finans ve İç Nakliye'de ortak. Başlık kaydırırken
sabit kalıyor, satırlar zebra deseninde, sayılar sağa hizalı. Uzun ünvan ve
adresler kısaltılıp üzerine gelince tam halleriyle gösteriliyor. Tarihler
gün.ay.yıl biçiminde. Firma sütunlarında Firma Kartları'ndaki **kısa ad**
gösteriliyor, tam ünvan üzerine gelince görünüyor. Raporlar firma ve
taşıyıcı adlarında kısa adı zaten kullanıyordu.

## Doğrulama

- `test/ncts-transfer.test.mjs`: eşleme, alıcı/gönderici seçimi, uyarı ve
  engeller. Geçersiz kayıt araya girerse hiçbir şey değişmiyor. Kayıt
  bellekte uygulandıktan sonra 409 ile reddedilirse durum geri alınıyor; bu
  test geri almayı kaldıran kasıtlı bozmayı yakaladı. Seçenek listeleri de
  sınanıyor.
- İmaj gerçek diskle çalıştırıldı: NCTS kayıtları kuruldu, yedek alındı (diskte
  1 dosya), aktarma yapıldı. Konteyner sert biçimde silinip yeniden
  başlatıldığında NCTS'de yalnız seçilmeyen kayıt kalmıştı ve beş İç Nakliye
  kaydı kaynak, ücret ve konteyner bilgisiyle yerindeydi.
- `node --test`: 113/113.

## Kalan

Aktarma bölümü tek seferlik. Kullanıcı aktarmayı yaptıktan sonra
kaldırılabilir; istenen kayıtlar artık yoksa bölüm yalnız kalan NCTS
kayıtlarını listeler.
