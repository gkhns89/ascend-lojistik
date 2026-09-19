const STORAGE_KEY = "ascend-portal-theme";

export type Theme = "light" | "dark";

/** Sayfa acilisinda index.html zaten uygulamistir; buradan sadece okunur. */
export function currentTheme(): Theme {
  return document.documentElement.dataset["theme"] === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset["theme"] = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Gizli sekmede yazilamaz; tema yine de bu oturum boyunca gecerli kalir.
  }
}
