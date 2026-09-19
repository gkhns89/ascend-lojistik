import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { ServiceIcon } from "@/components/site/service-icon";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { servicePageByServiceId, type ServicePage } from "@/content/service-pages-tr";
import { trackLead } from "@/lib/analytics";

const ORIGIN = "https://www.ascendlojistik.com";

function pageFor(serviceId: string): ServicePage {
  const page = servicePageByServiceId.get(serviceId);
  // Route dosyalari bu id'lerle olusturulur; eslesmeyen bir id yazim hatasidir.
  if (!page) throw new Error(`Hizmet sayfasi bulunamadi: ${serviceId}`);
  return page;
}

function summaryFor(serviceId: string) {
  return tr.services.items.find((item) => item.id === serviceId);
}

/**
 * Hizmet detay route'larinin ortak yapilandirmasi. Her route dosyasi yalniz
 * kendi yolunu ve hizmet id'sini bildirir; basliklar, canonical adres ve
 * yapilandirilmis veri buradan uretilir.
 */
export function serviceRouteOptions(serviceId: string) {
  const page = pageFor(serviceId);
  const summary = summaryFor(serviceId);
  const url = `${ORIGIN}/${page.slug}`;

  return {
    component: () => <ServiceDetailPage serviceId={serviceId} />,
    head: () => ({
      meta: [
        { title: page.meta.title },
        { name: "description", content: page.meta.description },
        { property: "og:title", content: page.meta.title },
        { property: "og:description", content: page.meta.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                name: summary?.title ?? page.hero.eyebrow,
                description: page.meta.description,
                serviceType: summary?.title ?? page.hero.eyebrow,
                provider: { "@type": "Organization", name: "Ascend Lojistik", url: ORIGIN },
                url,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${ORIGIN}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Hizmetlerimiz",
                    item: `${ORIGIN}/hizmetlerimiz`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: summary?.title ?? page.hero.eyebrow,
                    item: url,
                  },
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: page.faq.map((entry) => ({
                  "@type": "Question",
                  name: entry.q,
                  acceptedAnswer: { "@type": "Answer", text: entry.a },
                })),
              },
            ],
          }),
        },
      ],
    }),
  };
}

function ServiceDetailPage({ serviceId }: { serviceId: string }) {
  const page = pageFor(serviceId);
  const summary = summaryFor(serviceId);
  const others = tr.services.items.filter((item) => item.id !== serviceId);

  return (
    <SiteLayout>
      <PageHero eyebrow={page.hero.eyebrow} title={page.hero.title} subtitle={page.hero.subtitle} />

      <Section>
        <nav aria-label="Sayfa yolu" className="mb-10 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-primary">
                Ana Sayfa
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/hizmetlerimiz" className="hover:text-primary">
                Hizmetlerimiz
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">{summary?.title ?? page.hero.eyebrow}</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-lg leading-relaxed text-foreground">{page.intro}</p>

            {page.sections.map((section) => (
              <div key={section.heading} className="mt-12">
                <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
                  {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-base leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            {summary ? (
              <div className="rounded-xl border border-border bg-card p-6 card-elevated">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12">
                  <ServiceIcon name={summary.icon} className="h-6 w-6 text-primary" />
                </span>
                <h2 className="mt-4 font-display text-lg font-bold text-foreground">
                  Öne çıkanlar
                </h2>
                <ul className="mt-4 grid gap-4">
                  {summary.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm font-medium text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link to="/iletisim" onClick={() => trackLead(`service_${serviceId}`)}>
                    Bu hizmet için teklif alın
                  </Link>
                </Button>
              </div>
            ) : null}

            {page.specs ? (
              <div className="mt-6 rounded-xl border border-border bg-card p-6 card-elevated">
                <h2 className="font-display text-lg font-bold text-foreground">
                  {page.specs.heading}
                </h2>
                <dl className="mt-4 grid gap-4">
                  {page.specs.rows.map((row) => (
                    <div key={row.label}>
                      <dt className="text-sm font-semibold text-foreground">{row.label}</dt>
                      <dd className="mt-1 text-sm text-muted-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                {page.specs.note ? (
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    {page.specs.note}
                  </p>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Sık sorulanlar" title="Bu hizmet hakkında merak edilenler" />
        <div className="mt-10 grid gap-4">
          {page.faq.map((entry) => (
            <details
              key={entry.q}
              className="group rounded-xl border border-border bg-card p-6 card-elevated"
            >
              <summary className="cursor-pointer list-none font-display text-base font-bold text-foreground marker:content-none">
                {entry.q}
              </summary>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{entry.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Diğer hizmetler"
          title="İhtiyacınıza uygun başka bir model olabilir"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => {
            const target = servicePageByServiceId.get(item.id);
            if (!target) return null;
            return (
              <Link
                key={item.id}
                to={`/${target.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 card-elevated"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/12">
                  <ServiceIcon name={item.icon} className="h-6 w-6 text-primary" />
                </span>
                <span className="min-w-0 flex-1 font-display text-base font-bold text-foreground">
                  {item.title}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </Section>

      <Section tone="navy">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <SectionHeading
            tone="navy"
            title={tr.services.cta.title}
            subtitle={tr.services.cta.subtitle}
          />
          <Button asChild size="lg" className="shrink-0">
            <Link to="/iletisim" onClick={() => trackLead(`service_${serviceId}_cta`)}>
              {tr.services.cta.button}
            </Link>
          </Button>
        </div>
      </Section>
    </SiteLayout>
  );
}
