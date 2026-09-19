import { useRouterState } from "@tanstack/react-router";
import { useMemo, type ReactNode } from "react";

import {
  getContent,
  locales,
  localeFromPath,
  pagePath,
  type Content,
  type Locale,
  type PageKey,
} from "./content";

type I18nValue = {
  locale: Locale;
  c: Content;
  available: Locale[];
  /** Sayfa anahtarini icinde bulunulan dilin adresine cevirir. */
  path: (key: PageKey) => string;
};

/**
 * Dil, adresten cozulur; ayri bir durum tutulmaz. Boylece sunucuda render
 * edilen HTML ile istemcideki gorunum her zaman ayni dili gosterir ve her
 * dilin kendi indekslenebilir adresi olur.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useI18n(): I18nValue {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return useMemo(() => {
    const locale = localeFromPath(pathname);
    return {
      locale,
      c: getContent(locale),
      available: locales,
      path: (key: PageKey) => pagePath(key, locale),
    };
  }, [pathname]);
}

/** Ziyaretcinin dil tercihini hatirlar; otomatik yonlendirme buna bakar. */
export const LANG_COOKIE = "ascend-lang";

export function rememberLocale(locale: Locale): void {
  // Bir yil; SameSite=Lax cunku yonlendirme ust duzey gezinmede okunur.
  document.cookie = `${LANG_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
