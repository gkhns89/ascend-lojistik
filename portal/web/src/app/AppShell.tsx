import { useState } from "react";

import type { User } from "../lib/api";
import { MonitorPage } from "../screens/MonitorPage";
import { QuotesPage } from "../screens/QuotesPage";
import { ThemeToggle } from "./ThemeToggle";

type Screen = "quotes" | "monitor";

/** Takip Merkezi yalnız yöneticiye açıktır; sınır sunucuda da uygulanır. */
const SCREENS: { key: Screen; label: string; adminOnly: boolean }[] = [
  { key: "quotes", label: "Hızlı Fiyat Al", adminOnly: false },
  { key: "monitor", label: "Takip Merkezi", adminOnly: true },
];

interface AppShellProps {
  user: User;
  onSignOut: () => void;
}

export function AppShell({ user, onSignOut }: AppShellProps) {
  const isAdmin = user.role === "Yönetici";
  const available = SCREENS.filter((screen) => isAdmin || !screen.adminOnly);
  const [screen, setScreen] = useState<Screen>("quotes");

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-4">
          <div className="mr-auto">
            <p className="font-display text-lg text-ink">Ascend Portal</p>
            <p className="text-sm text-ink-muted">
              {user.name} · {user.role}
              {user.companyName ? ` · ${user.companyName}` : ""}
            </p>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-lg border border-line bg-card px-3 py-2 font-nav text-sm text-ink transition hover:brightness-95"
          >
            Çıkış
          </button>
        </div>
      </header>

      <nav className="border-b border-line bg-card" aria-label="Bölümler">
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          {available.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setScreen(item.key)}
              aria-current={screen === item.key ? "page" : undefined}
              className={
                "border-b-2 px-3 py-3 font-nav text-sm transition " +
                (screen === item.key
                  ? "border-brand text-ink"
                  : "border-transparent text-ink-muted hover:text-ink")
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {screen === "quotes" ? <QuotesPage isAdmin={isAdmin} /> : null}
        {screen === "monitor" && isAdmin ? <MonitorPage /> : null}
      </main>
    </div>
  );
}
