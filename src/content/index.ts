import { en } from "./en";
import { tr } from "./tr";

export type Locale = "tr" | "en";
export type Content = typeof tr;

export const dictionaries: Record<Locale, Content> = { tr, en };

export const defaultLocale: Locale = "tr";
export const locales: Locale[] = ["tr", "en"];

/** Ingilizce surumun adres onu. Turkce surum kokte kalir. */
export const EN_PREFIX = "/en";

export const ORIGIN = "https://www.ascendlojistik.com";

export function getContent(locale: Locale): Content {
  return dictionaries[locale];
}

/** Adresten dili cozer; /en ve /en/... Ingilizce, digerleri Turkce. */
export function localeFromPath(pathname: string): Locale {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? "en" : "tr";
}

/**
 * Sayfa anahtarlarinin dile gore adresleri. Turkce adresler degistirilemez:
 * eskiden yayinda olan WordPress sitesinden devralinan ve indekslenmis
 * adreslerdir.
 */
export const pagePaths = {
  home: { tr: "/", en: "/en" },
  about: { tr: "/hakkimizda", en: "/en/about" },
  services: { tr: "/hizmetlerimiz", en: "/en/services" },
  network: { tr: "/global-ag", en: "/en/global-network" },
  digital: { tr: "/dijital-cozumler", en: "/en/digital-solutions" },
  contact: { tr: "/iletisim", en: "/en/contact" },
} as const;

export type PageKey = keyof typeof pagePaths;

export function pagePath<K extends PageKey, L extends Locale>(key: K, locale: L) {
  // Donus tipi bilerek belirtilmez: literal adres birlesimi olarak cikarilir ve
  // TanStack Router'in tipli `Link to` degerleriyle eslesir.
  return pagePaths[key][locale];
}

/** Bir sayfanin her iki dildeki mutlak adresi; hreflang icin kullanilir. */
export function alternatesFor(key: PageKey) {
  return { tr: `${ORIGIN}${pagePaths[key].tr}`, en: `${ORIGIN}${pagePaths[key].en}` };
}

/**
 * hreflang etiketleri. x-default Turkce surumu gosterir: site Turkiye
 * merkezlidir ve Turkce adresler indekslenmis durumdadir.
 */
export function hreflangLinks(alternates: { tr: string; en: string }) {
  // Oznitelik adi kucuk harf yazilir: TanStack head nesnesini oldugu gibi
  // ozniteliklere cevirir, camelCase yazmak ciktida `hrefLang` birakir.
  return [
    { rel: "alternate", hreflang: "tr", href: alternates.tr },
    { rel: "alternate", hreflang: "en", href: alternates.en },
    { rel: "alternate", hreflang: "x-default", href: alternates.tr },
  ];
}
