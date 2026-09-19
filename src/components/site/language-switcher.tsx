import { Link, useRouterState } from "@tanstack/react-router";
import { Languages } from "lucide-react";

import { localeFromPath, pagePath, pagePaths, type Locale, type PageKey } from "@/content";
import { servicePageFor, servicePages, servicePath } from "@/content/service-pages";
import { rememberLocale } from "@/i18n";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, string> = { tr: "TR", en: "EN" };

/** Bulunulan adresin hangi sayfaya karsilik geldigini bulur. */
function pageKeyFor(pathname: string, locale: Locale): PageKey | undefined {
  const normalised = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return (Object.keys(pagePaths) as PageKey[]).find((key) => {
    const path = pagePaths[key][locale];
    return path === normalised || (path === "/en" && normalised === "/en");
  });
}

/** Hizmet detay sayfasindaysak ayni hizmetin diger dildeki adresini bulur. */
function serviceCounterpart(pathname: string, locale: Locale, target: Locale) {
  const normalised = pathname.replace(/\/+$/, "");
  const current = servicePages(locale).find((page) => servicePath(page, locale) === normalised);
  if (!current) return undefined;
  const other = servicePageFor(current.serviceId, target);
  return other ? servicePath(other, target) : undefined;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = localeFromPath(pathname);
  const target: Locale = locale === "tr" ? "en" : "tr";

  // Once ana sayfalar, sonra hizmet detaylari denenir; hicbiri eslesmezse
  // hedef dilin ana sayfasina goturulur.
  const key = pageKeyFor(pathname, locale);
  const to = key
    ? pagePath(key, target)
    : (serviceCounterpart(pathname, locale, target) ?? pagePath("home", target));

  return (
    <Link
      to={to}
      onClick={() => rememberLocale(target)}
      hrefLang={target}
      aria-label={target === "en" ? "Switch to English" : "Türkçe sürüme geç"}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md border border-header-border px-2.5 text-xs font-semibold text-header-foreground transition-colors hover:bg-header-accent sm:h-10 sm:px-3",
        className,
      )}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {LABELS[target]}
    </Link>
  );
}
