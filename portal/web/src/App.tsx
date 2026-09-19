import { useCallback, useEffect, useState } from "react";

import { AppShell } from "./app/AppShell";
import { LoginPage } from "./auth/LoginPage";
import { api, ApiError, type User } from "./lib/api";

type SessionState =
  { status: "checking" } | { status: "anonymous" } | { status: "authenticated"; user: User };

export function App() {
  const [session, setSession] = useState<SessionState>({ status: "checking" });

  // Acilista sunucuya sorup acik bir oturum var mi diye bakariz; token
  // HttpOnly cerezde oldugu icin istemci tarafinda kontrol edilemez.
  useEffect(() => {
    let cancelled = false;
    void api
      .session()
      .then(({ user }) => {
        if (!cancelled) setSession({ status: "authenticated", user });
      })
      .catch(() => {
        if (!cancelled) setSession({ status: "anonymous" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      // Oturum sunucuda zaten dusmus olabilir; kullaniciyi yine de cikaririz.
      if (!(error instanceof ApiError)) throw error;
    }
    setSession({ status: "anonymous" });
  }, []);

  if (session.status === "checking") {
    return (
      <div className="grid min-h-dvh place-items-center text-ink-muted" role="status">
        Yükleniyor…
      </div>
    );
  }

  if (session.status === "anonymous") {
    return <LoginPage onSignedIn={(user) => setSession({ status: "authenticated", user })} />;
  }

  return <AppShell user={session.user} onSignOut={handleSignOut} />;
}
