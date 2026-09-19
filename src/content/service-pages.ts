import { ORIGIN, type Locale } from "./index";
import { servicePagesEn } from "./service-pages-en";
import { servicePagesTr, type ServicePage } from "./service-pages-tr";

/**
 * Hizmet detay sayfalarina dil bagimsiz erisim. Iki dildeki kayitlar ayni
 * `serviceId` uzerinden eslesir; hreflang ve dil secici bu esleme sayesinde
 * dogru karsiligi bulur.
 */
const byLocale: Record<Locale, ServicePage[]> = { tr: servicePagesTr, en: servicePagesEn };

export function servicePages(locale: Locale): ServicePage[] {
  return byLocale[locale];
}

export function servicePageFor(serviceId: string, locale: Locale): ServicePage | undefined {
  return byLocale[locale].find((page) => page.serviceId === serviceId);
}

/** Bir hizmetin adresi: Turkce kokte, Ingilizce /en altinda. */
export function servicePath(page: ServicePage, locale: Locale): string {
  return locale === "en" ? `/en/${page.slug}` : `/${page.slug}`;
}

/** Hizmet detay sayfasinin iki dildeki mutlak adresi. */
export function serviceAlternates(serviceId: string): { tr: string; en: string } | undefined {
  const tr = servicePageFor(serviceId, "tr");
  const en = servicePageFor(serviceId, "en");
  if (!tr || !en) return undefined;
  return { tr: `${ORIGIN}/${tr.slug}`, en: `${ORIGIN}/en/${en.slug}` };
}

export type { ServicePage };
