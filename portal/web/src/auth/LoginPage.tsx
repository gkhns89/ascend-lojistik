import { useState, type FormEvent } from "react";

import { api, ApiError, type User } from "../lib/api";
import { ThemeToggle } from "../app/ThemeToggle";

interface LoginPageProps {
  onSignedIn: (user: User) => void;
}

export function LoginPage({ onSignedIn }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      onSignedIn(await api.login(username, password, code));
    } catch (caught) {
      // Girilenleri koruruz; kullanici bastan yazmak zorunda kalmasin.
      setError(caught instanceof ApiError ? caught.message : "Beklenmeyen bir hata oluştu.");
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-nav text-sm tracking-wide text-ink-muted">Ascend Portal</p>
          <ThemeToggle />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-card p-6 shadow-sm"
          noValidate
        >
          <h1 className="text-xl font-semibold text-ink">Giriş</h1>
          <p className="mt-1 text-sm text-ink-muted">Bu alan yalnız şirket personeline açıktır.</p>

          <Field label="Kullanıcı adı" htmlFor="username">
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Parola" htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Doğrulama kodu" htmlFor="code" hint="İki adımlı doğrulama açıksa girin.">
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className={`${inputClass} tabular`}
            />
          </Field>

          {error ? (
            <p role="alert" className="mt-4 rounded-lg bg-soft px-3 py-2 text-sm text-ink">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-xl bg-brand px-4 py-3 font-nav text-on-brand transition hover:brightness-95 disabled:opacity-60"
          >
            {pending ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-ink outline-none";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="mt-4">
      <label htmlFor={htmlFor} className="font-nav text-sm text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
