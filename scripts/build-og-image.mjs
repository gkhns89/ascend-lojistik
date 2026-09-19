/**
 * public/og-image.jpg dosyasini uretir (1200x630, Open Graph / Twitter karti).
 *
 * Calistirmak icin iki paket gerekir; bunlar projeye bagimlilik olarak
 * eklenmez, yalnizca gorsel yeniden uretilecegi zaman gecici olarak kurulur:
 *
 *   bun add --no-save sharp @resvg/resvg-js
 *   node scripts/build-og-image.mjs
 *
 * Kaynaklar depodaki resmi varliklardir: hero gorseli ve acik tema logosu.
 * Logo yeniden cizilmez, orani korunur; yalniz olceklenir.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIDTH = 1200;
const HEIGHT = 630;

const HERO = join(
  root,
  "public/__l5e/assets-v1/46ba7b82-3eb2-4fc3-ae60-948f6522cc33/hero-port.jpg",
);
// "dark" varyanti koyu zemin icindir (src/components/site/wordmark.tsx bu
// varyanti koyu temada ve footer'in lacivert yuzeyinde kullanir).
const LOGO = join(
  root,
  "public/__l5e/assets-v1/34bea9a5-a7da-4011-ae88-d27b572e86de/ascend-logo-dark.svg",
);
const FONT_DIR = join(root, "portal/prototype");
const OUT = join(root, "public/og-image.jpg");

// portal/DESIGN.md'deki marka degerleri.
const INK = "#17243b";
const PURPLE = "#302080";

/** Fotografi karta sigacak sekilde kirp. */
const background = sharp(readFileSync(HERO))
  .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
  .toBuffer();

/** Metnin okunur kalmasi icin koyu gecis + marka vurgusu. */
const scrim = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0%" stop-color="${INK}" stop-opacity="0.94"/>
      <stop offset="55%" stop-color="${INK}" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="${PURPLE}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
  <rect x="72" y="470" width="86" height="5" rx="2.5" fill="#ffffff" opacity="0.85"/>
</svg>`;

const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <text x="72" y="392" font-family="Space Grotesk" font-size="58" font-weight="700" fill="#ffffff">
    Global Uluslararası
  </text>
  <text x="72" y="452" font-family="Space Grotesk" font-size="58" font-weight="700" fill="#ffffff">
    Taşımacılık Çözümleri
  </text>
  <text x="72" y="524" font-family="DM Sans" font-size="26" font-weight="500" fill="#ffffff" opacity="0.92">
    Karayolu · Denizyolu · Havayolu · Proje Yükü · Gemi Acenteliği
  </text>
</svg>`;

function render(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: width ? { mode: "width", value: width } : { mode: "original" },
    font: { fontDirs: [FONT_DIR], loadSystemFonts: false, defaultFontFamily: "Manrope" },
  });
  return resvg.render().asPng();
}

const logoPng = render(readFileSync(LOGO, "utf8"), 300);
const logoMeta = await sharp(logoPng).metadata();

const composed = await sharp(await background)
  .composite([
    { input: render(scrim), top: 0, left: 0 },
    { input: logoPng, top: 72, left: 72 },
    { input: render(text), top: 0, left: 0 },
  ])
  .jpeg({ quality: 86, progressive: true, mozjpeg: true })
  .toBuffer();

writeFileSync(OUT, composed);

const { width, height } = await sharp(composed).metadata();
console.log(`og-image.jpg yazildi: ${width}x${height}, ${(composed.length / 1024).toFixed(0)} KB`);
console.log(`logo olcegi: ${logoMeta.width}x${logoMeta.height}`);
