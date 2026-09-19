# Railway Deployment Rehberi

Bu depo tek kişilik ve firmaya özeldir. Doğrulama **lokalde** yapılır, `main`'e
push edilen her şey Railway'de **production**'a çıkar. Ayrı bir staging ortamı
bilinçli olarak yoktur: lokalde her iki uygulama da çalıştırılabildiği ve Docker
imajları lokalde derlenebildiği için staging yalnızca ikinci bir container ve disk
maliyeti üretiyordu.

---

## 1. Depo ve remote'lar

```bash
git clone https://github.com/gkhns89/ascend-lojistik.git
cd ascend-lojistik
git remote -v
```

- `origin` → `gkhns89/ascend-lojistik` — çalıştığın depo, Railway buraya bakar
- `upstream` → `erdemergand/ascend-lojistik` — salt okunur; push URL'i bilerek
  `DISABLED_read_only` yapılmıştır

Upstream artık kod kaynağı değildir; oradan yalnızca plan gelir. Bu yüzden düzenli
`fetch upstream` beklentisi yoktur. Yine de çekmek gerekirse:

```bash
git fetch upstream && git merge upstream/main
```

---

## 2. Branch modeli

Tek branch: **`main`**. Production deploy branch'idir.

Küçük işler doğrudan `main`'e gider. Riskli bir işte geçici bir feature branch
açıp bitince `main`'e merge etmek serbesttir, ama zorunlu değildir.

```
lokal doğrulama ──► main ──► Railway production
```

---

## 3. Günlük akış

Push etmeden önce lokalde doğrula. Tümü geçmeden `main`'e gönderme:

```bash
# depo kökünde
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run build

# portal
cd portal && bun install --frozen-lockfile
bun run check
bun run test
```

Uygulamaları gözle görmek için:

```bash
bun run dev --host 127.0.0.1     # site  → http://127.0.0.1:8080
cd portal && bun run dev          # portal → http://127.0.0.1:3001
```

Portal için `portal/.env` gerekir (`.env.example`'dan kopyala,
`PORTAL_PREVIEW_ENABLED=true` ve en az 24 karakter parola). `.env` Git'e girmez.

Canlıya çıkacak imajı birebir denemek istersen:

```bash
docker build -t ascend-site:local .
docker run --rm -p 8080:8080 -e PORT=8080 ascend-site:local

cd portal && docker build -t ascend-portal:local .
docker run --rm -p 3001:3001 -e PORT=3001 --env-file .env ascend-portal:local
```

Hepsi yeşilse:

```bash
git push origin main      # Railway otomatik deploy eder
```

---

## 4. Railway yapılandırması

Proje **ASCEND** (workspace `G.Codes`), tek ortam: **production**.

### 4.1. Site servisi

| Ayar | Değer |
|---|---|
| Root Directory | `/` |
| Config File | `railway.json` |
| Builder | Dockerfile (`Dockerfile`, depo kökü) |
| Healthcheck | `/` |
| Volume | **yok** — site durumsuzdur |

Sitenin varsayılan Nitro preset'i `cloudflare-module`'dur ve Railway'de çalışmaz.
Kök `Dockerfile` bunu `NITRO_PRESET=node-server` ile çevirir. Bu değişken
`@lovable.dev/vite-tanstack-config`'in verdiği `defaultPreset`'i geçersiz kılar,
dolayısıyla `vite.config.ts` değiştirilmez.

> Derleme bağlamı depo köküdür: `src/routes/iletisim.tsx`,
> `portal/prototype/quote-volume.mjs` dosyasını klasör sınırını aşarak import eder.

Build-time değişken (servis değişkeni olarak girilir):

- `VITE_PORTAL_QUOTE_URL` — boşsa teklif formu `mailto:` akışında kalır. Doluysa
  form doğrudan portala POST eder. Değer **derleme anında** gömülür; değiştirince
  yeniden deploy gerekir.

### 4.2. Portal servisi

Henüz oluşturulmadı. Oluşturulunca:

| Ayar | Değer |
|---|---|
| Root Directory | `/portal` |
| Config File | `/portal/railway.json` |
| Builder | Dockerfile (`portal/Dockerfile`) |
| Healthcheck | `/healthz` |
| Volume | **zorunlu** — aşağıya bak |

Oturumlar sunucu belleğindedir; her deploy'da kullanıcılar yeniden giriş yapar.

### 4.3. Volume — nereye bağlanır

Önerilen: mount point `/data`, değişken `PORTAL_DATA_FILE=/data/portal.json`.

| Mount point | Sonuç |
|---|---|
| `/data` (uygulama kodu içermeyen bir yol) | **Önerilen.** Uygulamayla kesişmez. |
| `/app/.data` | Çalışır, ama veri uygulama ağacının içinde kalır. |
| `/app` | **Kullanılamaz.** Container hiç başlamaz. |

`/app` imajın çalışma dizinidir. Üzerine boş disk mount edilince `server.mjs` ve
`node_modules` gizlenir; süreç `Cannot find module` ile ölür. Bu hata bir kez
yaşandı: Railway build'i "SUCCESS" gösterdiği için panelde sağlıklı görünürken
container restart döngüsündeydi. **Build başarısı, uygulamanın ayakta olduğunu
kanıtlamaz.**

Yeni bir kalıcı disk `root` sahipliğiyle bağlanır ve imajdaki `chown`'un üzerini
örter. `portal/docker-entrypoint.sh` açılışta root olarak yalnız veri ve yedek
dizinlerinin sahipliğini düzeltir, sonra sunucuyu `node` kullanıcısına düşürür.

`PORTAL_BACKUP_DIRECTORY` veriyle aynı diski göstermemelidir.

### 4.4. Veritabanı servisi eklenmez

Portal, Node'un yerleşik `node:sqlite` modülünü kullanır ve verisi volume
üzerindeki tek dosyadır. Kodda `DATABASE_URL` veya herhangi bir veritabanı
sürücüsü yoktur; Railway'e PostgreSQL/MySQL eklemek boş ama faturalanan bir
servis yaratır. Gerçek PostgreSQL geçişi `portal/README.md`'deki üretim yol
haritasının 1. maddesidir ve bir kod göçüdür.

### 4.5. Ortam değişkenleri

| Değişken | Değer |
|---|---|
| `PORT` | Railway enjekte eder |
| `PORTAL_PREVIEW_ENABLED` | `true` |
| `PORTAL_PREVIEW_USER` / `_PASSWORD` | parola en az 24 karakter, rastgele |
| `PORTAL_DATA_FILE` | `/data/portal.json` |
| `PORTAL_BACKUP_DIRECTORY` | veriden ayrı hedef |
| `PORTAL_PUBLIC_ORIGIN` | portal domain'i |
| `PORTAL_QUOTE_ORIGIN` | `https://www.ascendlojistik.com` |
| `PORTAL_PUBLIC_QUOTES` | `false` (kabul sonrası `true`) |
| `PORTAL_MAIL_ENABLED` | `false` (kontrollü teslim testinde `true`) |
| `SMTP_*` | Natro'nun doğruladığı değerler |
| `VITE_PORTAL_QUOTE_URL` (site) | portal domain'i |

Parolalar ve SMTP bilgileri yalnız Railway değişkenlerinde tutulur; Git'e, Docker
build argümanlarına veya sohbete girmez.

### 4.6. CI kapısı

İki iş akışı `main`'e her push'ta çalışır:

- `ci.yml` — site typecheck + build, portal `node --check` + testler + portal imajı
- `railway.yml` — Railway'e giden site imajını derler, container'ı kaldırır,
  route'ları ve GA4/canonical/CTA işaretlerini doğrular

Railway'de **Wait for CI** açık tutulmalıdır. Staging olmadığı için `main`'e giden
hatalı bir commit'i durduran tek mekanizma budur.

---

## 5. Geri dönüş

Sorunlu bir sürümde Railway panelinden **önceki başarılı deployment'a dön**.
Git geçmişini force push ile değiştirme.

Portal verisi için: sunucuyu durdur, yedeği yeni bir yola geri yükle, doğrula,
sonra veri yolunu değiştir. Mevcut veritabanının üzerine yazma.

```bash
node portal/restore-backup.mjs Yedek.sqlite YeniKayit.json
```

Site teklif formunu mailto'ya döndürmek için `VITE_PORTAL_QUOTE_URL` değişkenini
kaldırıp yeniden deploy et. Gönderimi durdurmak için `PORTAL_MAIL_ENABLED=false`.

---

## 6. Hızlı referans

```bash
# doğrula
bun run typecheck && bun run lint && bun run build
cd portal && bun run check && bun run test

# canlıya çık
git push origin main
```

| Ortam | Branch | Deploy |
|---|---|---|
| Production | `main` | otomatik (Wait for CI sonrası) |
