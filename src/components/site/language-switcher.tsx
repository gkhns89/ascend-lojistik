import { Link, useRouterState } from "@tanstack/react-router";
import { Languages } from "lucide-react";

import { localeFromPath, pagePath, pagePaths, type Locale, type PageKey } from "@/content";
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

export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = localeFromPath(pathname);
  const target: Locale = locale === "tr" ? "en" : "tr";

  // Karsiligi olmayan bir sayfadaysak (ornegin yalniz Turkce olan hizmet
  // detaylari) o dilin ana sayfasina goturulur.
  const key = pageKeyFor(pathname, locale);
  const to = key ? pagePath(key, target) : pagePath("home", target);

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
