import { getContent, ORIGIN, pagePath, type Locale } from "./index";

/**
 * Sayfalarin JSON-LD govdeleri. Iki dil de ayni kurum kaydina (@id) isaret
 * eder; boylece arama motorlari tek bir isletme gorur.
 *
 * Buradaki tum kurumsal bilgiler dogrulanmistir. Calisma saati, koordinat,
 * fiyat araligi ve sertifika gibi teyit edilmemis alanlar bilerek yoktur.
 */
export const ORG_ID = `${ORIGIN}/#organization`;

const LEGAL_NAME = "ASCEND LOJİSTİK VE GEMİ ACENTE HİZ. DIŞ TİC. LTD. ŞTİ.";
const PHONE = "+90 212 963 05 53";
const EMAIL = "info@ascendlojistik.com";
const OG_IMAGE = `${ORIGIN}/og-image.jpg`;

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress:
    "Ataköy 7-8-9-10.Kısım Mah. Çobançeşme E-5 Yanyol Cad. No:20/1 Ataköy Towers A Blok Kat:6 İç Kapı No:109",
  postalCode: "34158",
  addressLocality: "Bakırköy",
  addressRegion: "İstanbul",
  addressCountry: "TR",
};

const AREA_SERVED = {
  tr: ["Avrupa", "Kuzey Amerika", "Güney Amerika", "Uzak Doğu", "Orta Doğu", "Afrika"],
  en: ["Europe", "North America", "South America", "Far East", "Middle East", "Africa"],
};

function breadcrumb(locale: Locale, trail: { name: string; path: string }[]) {
  const home = locale === "en" ? "Home" : "Ana Sayfa";
  const items = [{ name: home, path: pagePath("home", locale) }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${ORIGIN}${item.path === "/" ? "/" : item.path}`,
    })),
  };
}

export function homeSchema(locale: Locale) {
  const c = getContent(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: LEGAL_NAME,
    alternateName: locale === "en" ? "Ascend Logistics" : "Ascend Lojistik",
    url: `${ORIGIN}/`,
    logo: OG_IMAGE,
    telephone: PHONE,
    email: EMAIL,
    address: POSTAL_ADDRESS,
    foundingDate: "2022",
    description: c.footer.about,
    areaServed: AREA_SERVED[locale],
  };
}

export function aboutSchema(locale: Locale) {
  const c = getContent(locale);
  const url = `${ORIGIN}${pagePath("about", locale)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: c.about.meta.title,
        description: c.about.meta.description,
        url,
        about: { "@id": ORG_ID },
      },
      breadcrumb(locale, [{ name: c.nav.about, path: pagePath("about", locale) }]),
    ],
  };
}

export function servicesSchema(locale: Locale) {
  const c = getContent(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...c.services.items.map((item) => ({
        "@type": "Service",
        name: item.title,
        description: item.short,
        provider: { "@id": ORG_ID },
      })),
      breadcrumb(locale, [{ name: c.nav.services, path: pagePath("services", locale) }]),
    ],
  };
}

export function networkSchema(locale: Locale) {
  const c = getContent(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [breadcrumb(locale, [{ name: c.nav.network, path: pagePath("network", locale) }])],
  };
}

export function digitalSchema(locale: Locale) {
  const c = getContent(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [breadcrumb(locale, [{ name: c.nav.digital, path: pagePath("digital", locale) }])],
  };
}

export function contactSchema(locale: Locale) {
  const c = getContent(locale);
  const url = `${ORIGIN}${pagePath("contact", locale)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: c.contact.meta.title,
        url,
        mainEntity: { "@id": ORG_ID },
      },
      {
        // LocalBusiness, yerel aramalarda Organization'a gore daha guclu sinyal verir.
        "@type": "LocalBusiness",
        "@id": ORG_ID,
        name: LEGAL_NAME,
        alternateName: locale === "en" ? "Ascend Logistics" : "Ascend Lojistik",
        url: ORIGIN,
        image: OG_IMAGE,
        telephone: PHONE,
        email: EMAIL,
        address: POSTAL_ADDRESS,
      },
      breadcrumb(locale, [{ name: c.nav.contact, path: pagePath("contact", locale) }]),
    ],
  };
}
