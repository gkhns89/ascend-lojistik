# Personel girişinde demo ekranları

- **Commit:** bu dosyayla birlikte

## Sorun

Yönetici olmayan bir kullanıcı (NCTS, İç Nakliye ve Lojistik yetkili
Operasyon) girince bazı ekranlar demo gibi davranıyordu. Prototipin rol
önizlemesi iki şeyi aynı bayrakla taşıyordu: personel/müşteri kısıtları ve
sunucu yokken rolleri göstermek için yazılmış demo. Gerçek personelde:

- NCTS ve Lojistik'te "Ana Sayfa", gerçek ana ekran yerine kurgusal
  `role-preview.html` çalışma alanına götürüyordu.
- Yeni dosyaya gerçek numara yerine `ASC-DEMO-000N` veriliyordu ve bu sahte
  numara sunucuya kaydediliyordu.
- Üstte "Kurgusal demo verileri / kayıtları" bandı çıkıyordu.
- Liste boş gelseydi demo kayıtlara düşebilirdi.
- Giriş ekranı herkese "Denetim demosu" diyordu.

## Yapılan

İki ayrı bayrak var. `logisticsPreview` / `nctsRolePreview` kısıtları taşır
(Cari gizli, müşteri salt okur). `logisticsDemo` / `nctsDemo` yalnız sunucu
oturumu yokken (`window.portalBootstrap` yokken) açılır. Demo davranışlarının
hepsi artık demo bayrağına bağlı. Giriş ekranı metni düzeltildi.

## Doğrulama

`test/demo-mode.test.mjs`: sayfa başındaki bayrak kodu Node'da çalıştırıldı.
Oturumlu personel ve müşteride kısıt açık, demo kapalı; sunucusuz
önizlemede demo açık. Bir bekçi, `ASC-DEMO` numarası, demo yönlendirmesi ve
"Kurgusal" bandının demo bayrağı dışında bir koşula bağlanmasını yakalıyor.
Dört kasıtlı gerilemenin dördünü de yakaladı. `node --test`: 90/90.
