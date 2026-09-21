import { useCallback, useEffect, useState } from "react";

import { api, ApiError, type QuoteDraft, type QuoteRequest } from "../lib/api";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; requests: QuoteRequest[] };

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  "needs-carrier": "Taşıyıcı bekliyor",
  "drafts-ready": "Taslaklar hazır",
  approved: "Onaylandı",
};

export function QuotesPage({ isAdmin }: { isAdmin: boolean }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setState({ status: "ready", requests: await api.quotes() });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof ApiError ? error.message : "Talepler alınamadı.",
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Her eylem aynı biçimde: mesajı göster, listeyi tazele. */
  const run = useCallback(
    async (action: () => Promise<unknown>, done: string) => {
      setNotice(null);
      try {
        await action();
        setNotice(done);
        await load();
      } catch (error) {
        setNotice(error instanceof ApiError ? error.message : "İşlem tamamlanamadı.");
      }
    },
    [load],
  );

  if (state.status === "loading") {
    return (
      <p role="status" className="text-ink-muted">
        Talepler yükleniyor…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="rounded-xl border border-line bg-card p-6 text-ink">
        {state.message}
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Hızlı Fiyat Al</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Siteden ve elden gelen fiyat talepleri. Her acenteye ayrı taslak hazırlanır; gönderim
            onayınızı bekler.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-line bg-card px-3 py-2 font-nav text-sm text-ink transition hover:brightness-95"
        >
          Yenile
        </button>
      </div>

      {notice ? (
        <p role="status" className="rounded-lg bg-soft px-4 py-3 text-sm text-ink">
          {notice}
        </p>
      ) : null}

      {state.requests.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-sm text-ink-muted">
          Henüz talep yok. Site üzerindeki teklif formundan gelenler burada listelenir.
        </p>
      ) : (
        state.requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            isAdmin={isAdmin}
            onPrepare={() => run(() => api.prepareQuote(request.id), "Acente eşleşmesi yenilendi.")}
            onDismiss={() => run(() => api.dismissQuote(request.id), `${request.id} kaldırıldı.`)}
            onApprove={(draft, subject, text) =>
              run(
                () => api.approveDraft({ id: draft.id, subject, text }),
                "Taslak gönderim kuyruğuna alındı.",
              )
            }
          />
        ))
      )}
    </section>
  );
}

interface RequestCardProps {
  request: QuoteRequest;
  isAdmin: boolean;
  onPrepare: () => void;
  onDismiss: () => void;
  onApprove: (draft: QuoteDraft, subject: string, text: string) => void;
}

function RequestCard({ request, isAdmin, onPrepare, onDismiss, onApprove }: RequestCardProps) {
  const { body } = request;

  return (
    <article className="rounded-xl border border-line bg-card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base text-ink">
            {body.originCountry} → {body.destinationCountry} · {body.mode}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            <span className="tabular">{request.id}</span> · {body.company} · {body.direction}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-soft px-2.5 py-1 text-xs text-ink">
            {STATUS_LABELS[request.status] ?? request.status}
          </span>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`${request.id} talebi kaldırılsın mı? Bu işlem geri alınamaz.`)) {
                  onDismiss();
                }
              }}
              className="rounded-lg border border-danger px-3 py-1.5 font-nav text-sm text-danger transition hover:bg-danger hover:text-on-danger"
            >
              Kaldır
            </button>
          ) : null}
        </div>
      </header>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Detail label="Yetkili" value={`${body.person} · ${body.email}`} />
        <Detail label="Yük" value={body.goods} />
        <Detail label="Hazır tarihi" value={body.readyDate} />
        <Detail label="Teslim şekli" value={body.incoterm} />
      </dl>

      {request.status === "needs-carrier" ? (
        <p className="mt-4 rounded-lg bg-soft px-4 py-3 text-sm text-ink">
          {body.direction === "İthalat" ? body.originCountry : body.destinationCountry} /{" "}
          {body.mode} için e-posta adresli temsilci bulunamadı. Firma Kartları bölümünden acente
          ekleyin, sonra eşleşmeyi yenileyin.
        </p>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={onPrepare}
          className="rounded-lg border border-line bg-card px-3 py-2 font-nav text-sm text-ink transition hover:brightness-95"
        >
          Acente eşleşmesini yenile
        </button>
      </div>

      {request.drafts.map((draft) => (
        <DraftEditor
          key={draft.id}
          draft={draft}
          isAdmin={isAdmin}
          onApprove={(subject, text) => onApprove(draft, subject, text)}
        />
      ))}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function DraftEditor({
  draft,
  isAdmin,
  onApprove,
}: {
  draft: QuoteDraft;
  isAdmin: boolean;
  onApprove: (subject: string, text: string) => void;
}) {
  const [subject, setSubject] = useState(draft.body.subject);
  const [text, setText] = useState(draft.body.text);
  const [reviewed, setReviewed] = useState(false);

  return (
    <div className="mt-4 rounded-lg border border-line p-4">
      <p className="text-sm text-ink-muted">
        <span className="font-nav text-ink">{draft.carrier_id}</span> · Kime:{" "}
        {draft.body.to.join(", ") || "—"}
        {draft.body.cc.length ? ` · CC: ${draft.body.cc.join(", ")}` : ""}
      </p>

      <label className="mt-3 block text-sm text-ink">
        Konu
        <input
          value={subject}
          readOnly={!isAdmin}
          onChange={(event) => setSubject(event.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none read-only:text-ink-muted"
        />
      </label>

      <label className="mt-3 block text-sm text-ink">
        Taslak
        <textarea
          value={text}
          readOnly={!isAdmin}
          onChange={(event) => setText(event.target.value)}
          rows={10}
          className="mt-1 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none read-only:text-ink-muted"
        />
      </label>

      {isAdmin ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(event) => setReviewed(event.target.checked)}
            />
            Taslağı kontrol ettim
          </label>
          <button
            type="button"
            disabled={!reviewed}
            onClick={() => onApprove(subject, text)}
            className="rounded-lg bg-brand px-4 py-2 font-nav text-sm text-on-brand transition hover:brightness-95 disabled:opacity-50"
          >
            Onayla ve kuyruğa al
          </button>
          <span className="text-xs text-ink-muted">Durum: {draft.status}</span>
        </div>
      ) : null}
    </div>
  );
}
