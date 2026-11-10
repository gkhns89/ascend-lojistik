# React istemcisini imaja koy ve sun

- **Öncelik:** Orta
- **Kim:** kod
- **Boyut:** orta
- **Kaynak:** `portal/Dockerfile`, `portal/server.mjs`, `portal/web/`

## Durum

`portal/web` (React + Vite + Tailwind 4) yalnız yerelde `vite dev` ile
çalışıyor. Dockerfile yalnız `*.mjs` ve `prototype/` kopyalıyor; sunucu
`web/dist` sunmuyor; CI da `portal/web`'i derlemiyor. Canlıdaki herkes prototipi
görüyor. Faz 1-2'de yazılan Giriş, Takip Merkezi ve Hızlı Fiyat Al ekranları
canlıda yok.

## Yapılacak

- [ ] Dockerfile'a `portal/web` için bun derleme aşaması ekle.
- [ ] `web/dist`'i imaja kopyala; sunucu bunu ayrı bir yoldan sunsun
      (örneğin `/app/`), prototip yerinde kalsın.
- [ ] CSP'nin derlenmiş varlıklarla çalıştığını doğrula.
- [ ] Yerelde `docker build` + `docker run` ile dene; dağıtımdan sonra
      `/healthz` kontrolü yap.
