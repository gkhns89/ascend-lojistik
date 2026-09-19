import { alternatesFor, hreflangLinks, type Locale, type PageKey } from "@/content";

const OG_IMAGE = "https://www.ascendlojistik.com/og-image.jpg";

interface SeoHeadOptions {
  /** Sayfanin dilden bagimsiz anahtari; adresler buradan cozulur. */
  key: PageKey;
  locale: Locale;
  title: string;
  description: string;
  /** JSON-LD govdesi. Verilmezse yapilandirilmis veri eklenmez. */
  schema?: unknown;
}

/**
 * Sayfa basliklarini, canonical adresi ve hreflang etiketlerini tek yerden
 * uretir. Iki dilin de ayni sayfa anahtarini kullanmasi, alternatif adreslerin
 * elle yazilmasini ve birbirinden sapmasini onler.
 */
export function seoHead({ key, locale, title, description, schema }: SeoHeadOptions) {
  const alternates = alternatesFor(key);
  const url = alternates[locale];

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: locale === "en" ? "en_GB" : "tr_TR" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }, ...hreflangLinks(alternates)],
    ...(schema === undefined
      ? {}
      : { scripts: [{ type: "application/ld+json", children: JSON.stringify(schema) }] }),
  };
}
