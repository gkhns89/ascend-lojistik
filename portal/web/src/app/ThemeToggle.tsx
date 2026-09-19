import { useState } from "react";

import { applyTheme, currentTheme, type Theme } from "../lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme());

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      className="rounded-lg border border-line bg-card px-3 py-2 font-nav text-sm text-ink transition hover:brightness-95"
    >
      {theme === "dark" ? "Açık tema" : "Koyu tema"}
    </button>
  );
}
