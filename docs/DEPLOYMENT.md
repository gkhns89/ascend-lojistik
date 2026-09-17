# Fork + Railway Deployment & Staging Rehberi

Bu doküman, `gkhns89/ascend-lojistik` fork'unun upstream (arkadaşın reposu) ile senkron
tutulmasını ve Railway üzerinde production + staging ortamlarının nasıl kurulacağını anlatır.

---

## 1. Fork ayarı

GitHub fork ekranındaki soruda **"For my own purposes"** seçilir.

Her iki seçenek de teknik olarak aynı fork'u üretir ve ikisinde de upstream'den güncelleme
çekilebilir. Fark, arayüz varsayılanlarındadır:

| Seçenek | PR açarken varsayılan hedef |
|---|---|
| To contribute to the parent project | Arkadaşının reposu (upstream) |
| **For my own purposes** | **Kendi fork'un** |

Kendi main'ine merge edileceği için ikinci seçenek doğru olanı. Sonradan repo ayarlarından
da değiştirilebilir.

---

## 2. Remote kurulumu

```bash
git clone https://github.com/gkhns89/ascend-lojistik.git
cd ascend-lojistik
git remote add upstream https://github.com/erdemergand/ascend-lojistik.git
git remote -v
```

- `origin`   → kendi fork'un (Railway buraya bakar)
- `upstream` → arkadaşının reposu (sadece okunur, push edilmez)

---

## 3. Branch modeli

### 3.1. Basit model (varsayılan öneri)

```
upstream/main ──► staging ──► main
                    │           │
              Railway staging   Railway production
```

- `staging` : hem upstream değişiklikleri hem kendi feature'ların önce buraya gelir
- `main`    : sadece staging'de test edilmiş kod; production deploy branch'i

```bash
git checkout -b staging main
git push -u origin staging
```

### 3.2. Sertleştirilmiş model (conflict çok yorarsa)

| Branch | Rolü | Kural |
|---|---|---|
| `main` | Upstream'in birebir aynası | Üzerine **asla** commit atılmaz, sadece fast-forward merge |
| `staging` | Kendi işlerin + upstream | Railway staging buradan deploy eder |
| `production` | Test edilmiş sürüm | Railway production buradan deploy eder |

Avantajı: upstream sync'i hiç conflict üretmez; conflict sadece `main → staging`
merge'ünde bir kez çözülür.

---

## 4. Günlük akış

### Arkadaşının değişikliklerini almak

```bash
git checkout staging
git fetch upstream
git merge upstream/main        # ya da: git rebase upstream/main
git push origin staging
```

GitHub arayüzünde fork sayfasındaki **Sync fork** butonu da aynı işi yapar.

### Kendi geliştirmelerin

```bash
git checkout staging
git checkout -b feature/xyz
# ... çalış, commit
git push origin feature/xyz
```

Sonra `gkhns89:staging` hedefine PR aç (tek kişi çalışıyorsan doğrudan merge de olur).

### Production'a çıkmak

```bash
git checkout main
git merge staging
git push origin main           # Railway otomatik deploy eder
```

---

## 5. Railway kurulumu

### 5.1. Production ortamı

1. **New Project → Deploy from GitHub repo**
2. **Configure GitHub App** → sadece `ascend-lojistik` reposuna erişim ver
3. Deploy branch: `main`

> Not: Railway'in GitHub App'i, senin hesabında erişim verdiğin repolara bağlanır.
> Arkadaşının kişisel reposuna bu app'i yalnızca o kurabilir — collaborator olsan bile
> kuramazsın. Bu yüzden fork zorunlu.

### 5.2. Staging ortamı

1. Üstteki environment dropdown → **+ New Environment** → **Duplicate Environment**
   (seçilen ortamın servislerini, değişkenlerini ve konfigürasyonunu kopyalar).
   Production'ı kopyala, adını `staging` koy.
2. Kopya oluştuğunda tüm servisler "staged" halde bekler, onaylamadan deploy olmazlar.
   **Onaylamadan önce** aşağıdaki ayarları düzelt.
3. Staging servisinin **Settings → Source** bölümünde deploy branch'ini `staging` yap.
4. Değişkenleri ayrıştır:
   - `NODE_ENV=staging`
   - Ayrı API key'ler / secret'lar
   - Ayrı domain
5. **Veritabanı kesinlikle ayrı olsun.** Duplicate sırasında DB servisi de kopyalanır;
   `${{Postgres.DATABASE_URL}}` gibi referans değişkenler kendi ortamındaki DB'yi gösterir.
   Düz string yapıştırılmış bağlantı dizeleri varsa elle düzelt.

### 5.3. PR ortamları (opsiyonel)

**Project Settings → Environments** sekmesinden açılır. Açıldığında her Pull Request için
geçici bir ortam ayağa kalkar ve PR merge/close edilince silinir. Varsayılan olarak
production'ı baz alır; proje ayarlarından staging'i baz alacak şekilde değiştirmek
daha mantıklı.

Feature başına izole test isteniyorsa: kalıcı staging + PR ortamları birlikte kullanılır.

---

## 6. Dikkat edilecekler

- **Conflict'i azalt:** upstream'den sürekli merge alınacaksa, kendi değişikliklerin
  mümkün olduğunca upstream'in dokunduğu dosyalara girmesin.
- **Config dosyası düzenleme:** ortam ayarları için repo içindeki config dosyalarını
  değiştirmek yerine Railway environment variable'larını kullan. Aksi halde her sync'te
  aynı conflict'i çözersin.
- **Maliyet:** staging = ayrı container + ayrı DB, yani kullanım kabaca ikiye katlanır.
  Sürekli gerekmiyorsa staging servislerinde app sleeping'i açık tut veya sadece PR
  ortamlarıyla idare et.
- **PR deploy sorunu:** Railway, workspace'inde/projende olmayan bir kullanıcının PR
  branch'ini deploy etmez. Arkadaşın senin Railway projende değilse onun PR'ları
  otomatik ortam açmaz.

---

## 7. Hızlı referans

```bash
# upstream'i çek
git checkout staging && git fetch upstream && git merge upstream/main && git push

# feature başlat
git checkout staging && git checkout -b feature/xyz

# production'a çık
git checkout main && git merge staging && git push origin main
```

| Ortam | Branch | Deploy |
|---|---|---|
| Production | `main` | otomatik |
| Staging | `staging` | otomatik |
| PR preview | feature branch'leri | PR açılınca, kapanınca silinir |
