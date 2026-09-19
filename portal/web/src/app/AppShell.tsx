import type { User } from "../lib/api";
import { MonitorPage } from "../screens/MonitorPage";
import { ThemeToggle } from "./ThemeToggle";

interface AppShellProps {
  user: User;
  onSignOut: () => void;
}

export function AppShell({ user, onSignOut }: AppShellProps) {
  const isAdmin = user.role === "Yönetici";

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

      <main className="mx-auto max-w-5xl px-4 py-8">
        {isAdmin ? (
          <MonitorPage />
        ) : (
          /*
           * Bu yalnizca arayuz kisitidir. Gercek sinir sunucudadir:
           * /api/tenant/monitor yonetici olmayan her istegi 403 ile reddeder.
           */
          <p className="rounded-xl border border-line bg-card p-6 text-ink-muted">
            Takip Merkezi yalnız Yönetici rolüne açıktır.
          </p>
        )}
      </main>
    </div>
  );
}
