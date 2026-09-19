import { useEffect, useState } from "react";

import { api, ApiError, type MonitorReport } from "../lib/api";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; report: MonitorReport };

export function MonitorPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void api
      .monitor()
      .then((report) => {
        if (!cancelled) setState({ status: "ready", report });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof ApiError ? error.message : "Takip verisi alınamadı.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <p role="status" className="text-ink-muted">
        Takip Merkezi yükleniyor…
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

  const { report } = state;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Takip Merkezi</h1>
        <p className="mt-1 text-sm text-ink-muted">
          <span className="tabular">{report.today}</span> itibarıyla, önümüzdeki 7 gün.
        </p>
      </div>

      <Panel
        title="Teklif geçerliliği"
        empty="Süresi yaklaşan teklif yok."
        rows={report.offers.map((offer) => ({
          key: offer.id,
          primary: offer.quoteId,
          date: offer.date,
          status: offer.status,
        }))}
      />

      <Panel
        title="Ödeme vadeleri"
        empty="Vadesi yaklaşan ödeme yok."
        note="Uyarılar kaydedilmiş vade ve ödeme tarihlerine dayanır; cari bakiye hakkında sonuç vermez."
        rows={report.payments.map((payment) => ({
          key: payment.fileNo,
          primary: payment.fileNo,
          secondary: payment.company,
          date: payment.date,
          status: payment.status,
        }))}
      />

      <Panel
        title="Gönderim hataları"
        empty="Bekleyen gönderim hatası yok."
        rows={report.failures.map((failure) => ({
          key: failure.id,
          primary: failure.last_error ?? "Ayrıntı yok",
          secondary: `${failure.attempts} deneme`,
          status: failure.status,
        }))}
      />

      <div className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-display text-base text-ink">Son yedek</h2>
        {report.backup ? (
          <p className="mt-2 text-sm text-ink-muted tabular">{report.backup.at}</p>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">Henüz doğrulanmış yedek kaydı yok.</p>
        )}
      </div>
    </section>
  );
}

interface Row {
  key: string;
  primary: string;
  secondary?: string;
  date?: string;
  status: string;
}

interface PanelProps {
  title: string;
  empty: string;
  note?: string;
  rows: Row[];
}

function Panel({ title, empty, note, rows }: PanelProps) {
  return (
    <div className="rounded-xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="font-display text-base text-ink">{title}</h2>
        <span className="font-nav text-sm text-ink-muted tabular">{rows.length}</span>
      </div>
      {note ? <p className="mt-1 text-xs text-ink-muted">{note}</p> : null}

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
              <span className="font-nav text-sm text-ink">{row.primary}</span>
              {row.secondary ? (
                <span className="text-sm text-ink-muted">{row.secondary}</span>
              ) : null}
              {row.date ? <span className="text-sm text-ink-muted tabular">{row.date}</span> : null}
              <span className="ml-auto rounded-full bg-soft px-2.5 py-1 text-xs text-ink">
                {row.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
