# Drive yedeğini gerçekten aç

- **Öncelik:** Yüksek
- **Kim:** kullanıcı + kod
- **Boyut:** küçük
- **Kaynak:** `portal/drive-backup.mjs`, `portal/.env.example`, commit `f8f9f7b`

## Durum

Drive'a yükleme kodu 21 Eylül'de yazıldı ve test edildi. Railway'de üç
değişken tanımlanmadıkça kapalı. Tanımlandıklarına dair kayıt yok. Bu yüzden
canlıdaki tek yedek, yöneticinin "Yedeği indir" ile bilgisayarına aldığı kopya.

## Yapılacak

- [ ] Google Cloud'da bir servis hesabı aç, JSON anahtarını indir.
- [ ] Drive'da bir yedek klasörü aç ve servis hesabının e-posta adresiyle
      **paylaş**. Paylaşılmazsa Google anlamsız bir "File not found" döner.
- [ ] Railway → ascend-portal → değişkenler: `PORTAL_DRIVE_CLIENT_EMAIL`,
      `PORTAL_DRIVE_PRIVATE_KEY`, `PORTAL_DRIVE_FOLDER_ID`.
      Dağıtmadan önce değişiklik listesini satır satır oku; panel, CLI ile
      yazılmış değişkenleri silme olarak gösterebiliyor (bkz. hafıza
      `railway-environment.md`).
- [ ] İlk gerçek yüklemeyi dene. Servis hesaplarının kendi depolama kotası
      yok; kişisel "Drive'ım" klasörüne yükleme `storageQuotaExceeded`
      verebilir. O durumda Workspace paylaşılan sürücüsü ya da OAuth gerekir
      (kod değişikliği).
- [ ] İstenirse otomatik yedek: `PORTAL_BACKUP_INTERVAL_HOURS`.

## Bitti sayılır

Drive klasöründe portalın yüklediği bir yedek dosyası var, indirilip
açılabiliyor.
