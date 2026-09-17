# Kurumsal site (TanStack Start) — Railway icin Node hedefli imaj.
#
# Varsayilan Nitro preset'i cloudflare-module'dur; NITRO_PRESET burada
# node-server'a cevrilir, boylece .output/server/index.mjs calistirilabilir bir
# Node sunucusu olur. vite.config.ts degistirilmez, upstream ile catisma olmaz.
#
# Derleme baglami depo kokudur: src/routes/iletisim.tsx
# portal/prototype/quote-volume.mjs dosyasini klasor sinirini asarak import eder.

# --- bagimliliklar ---
FROM oven/bun:1.4.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# --- derleme ---
FROM oven/bun:1.4.2-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock bunfig.toml tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
COPY portal/prototype/quote-volume.mjs portal/prototype/quote-volume.d.mts ./portal/prototype/

# Bos birakilirsa teklif formu mevcut mailto akisinda kalir.
ARG VITE_PORTAL_QUOTE_URL=""
ENV VITE_PORTAL_QUOTE_URL=$VITE_PORTAL_QUOTE_URL
ENV NITRO_PRESET=node-server
RUN bun run build

# --- calisma ---
FROM node:24.19.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Nitro node-server PORT ve HOST degiskenlerini okur; Railway PORT'u enjekte eder.
ENV HOST=0.0.0.0
ENV PORT=3000
# .output tum bagimliliklari icerir; runtime'da node_modules gerekmez.
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
