# Portal — React istemcisi

Portalın yeni arayüzü: React 19 + Vite + TypeScript + Tailwind 4.
Marka renkleri ve tipografisi `packages/ui/tokens.css`'ten gelir; kurumsal site
de aynı dosyayı kullanır.

## Durum

Bu **Faz 1 iskeletidir**. Mevcut `portal/prototype/` HTML arayüzünün yerini
kademeli olarak alacak; ikisi bir süre yan yana çalışacak.

Taşınan ekranlar:

- Giriş
- Takip Merkezi (yalnız Yönetici)

Kalan ekranlar hâlâ `portal/prototype/` altındadır.

## Çalıştırma

Portal sunucusu ayrı bir süreçte çalışmalıdır — bu uygulama onun
`/api/tenant/*` uçlarını kullanır.

```sh
# 1. terminal: portal sunucusu (portal/.env gerekir)
cd portal && bun run dev

# 2. terminal: React istemcisi
cd portal/web && bun install && bun run dev
```

Adres: `http://127.0.0.1:5173`.

Vite, `/api` isteklerini `http://127.0.0.1:3001`'e proxy'ler. `changeOrigin`
bilinçli olarak kapalıdır: portal sunucusu POST'larda `Origin` başlığını
`http://` + `Host` ile karşılaştırır ve açılması hâlinde istekler
`403 Origin denied` döner.

## Doğrulama

```sh
bun run typecheck
bun run build
```

## Sınırlar

Arayüzdeki rol kontrolleri yalnızca görünüm içindir. Yetki sınırı sunucudadır:
`/api/tenant/monitor` yönetici olmayan her isteği 403 ile reddeder. Müşteriye
kapalı finans ve acente alanları sunucu yanıtına hiç girmemelidir; arayüzde
gizlemek yeterli değildir.

Oturum HttpOnly `ascend_sid` çerezindedir; token istemcide tutulmaz.
