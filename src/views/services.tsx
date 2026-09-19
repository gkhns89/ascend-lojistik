import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { ServiceIcon } from "@/components/site/service-icon";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { servicePageFor, servicePath } from "@/content/service-pages";
import { trackLead } from "@/lib/analytics";

export function ServicesPage() {
  const { c, path, locale } = useI18n();
  const s = c.services;

  return (
    <SiteLayout>
      <PageHero eyebrow={s.hero.eyebrow} title={s.hero.title} subtitle={s.hero.subtitle} />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {s.items.map((item) => {
            const detail = servicePageFor(item.id, locale);
            const className =
              "group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 card-elevated";
            const inner = (
              <>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/12">
                  <ServiceIcon name={item.icon} className="h-6 w-6 text-primary" />
                </span>
                <span className="min-w-0 flex-1 font-display text-base font-bold text-foreground">
                  {item.title}
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
                  İncele
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </>
            );

            // Detay sayfasi olan hizmetler kendi adresine gider; olmayanlar
            // sayfa icindeki bolume capa ile iner.
            return detail ? (
              <Link key={item.id} to={servicePath(detail, locale)} className={className}>
                {inner}
              </Link>
            ) : (
              <a key={item.id} href={`#${item.id}`} className={className}>
                {inner}
              </a>
            );
          })}
        </div>
      </Section>

      <Section tone="muted" className="pt-0">
        <div className="space-y-6">
          {s.items.map((item, i) => (
            <article
              key={item.id}
              id={item.id}
              className="scroll-mt-28 grid gap-8 rounded-xl border border-border bg-card p-8 card-elevated lg:grid-cols-[0.9fr_1.1fr] lg:p-12"
            >
              <div>
                <p className="eyebrow text-primary">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-4 text-2xl font-bold text-foreground lg:text-3xl">
                  {item.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{item.body}</p>
                {servicePageFor(item.id, locale) ? (
                  <Link
                    to={servicePath(servicePageFor(item.id, locale)!, locale)}
                    className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    {item.title} hakkında detaylı bilgi
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : null}
              </div>
              <ul className="grid content-start gap-4 border-border lg:border-l lg:pl-10">
                {item.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium text-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="navy">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <SectionHeading tone="navy" title={s.cta.title} subtitle={s.cta.subtitle} />
          <Button asChild size="lg" className="shrink-0">
            <Link to={path("contact")} onClick={() => trackLead("services_quote")}>
              {s.cta.button}
            </Link>
          </Button>
        </div>
      </Section>
    </SiteLayout>
  );
}
