import { calculateVolume } from "../../portal/prototype/quote-volume.mjs";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { PageHero, Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { trackLead } from "@/lib/analytics";

const infoIcons = [Phone, Mail, MapPin];

export function ContactPage() {
  const { c } = useI18n();
  const k = c.contact;

  // Basarili kayit ayri tutulur: hata metni gibi kaybolmasin, referans numarasi
  // vurgulu bir kutuda kalsin ve form temizlensin.
  const [quoteStatus, setQuoteStatus] = useState("");
  const [quoteSaved, setQuoteSaved] = useState<{ id: string; email: string } | null>(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const st = k.quoteForm.status;
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    if (formEl.dataset["formType"] === "quote") {
      setQuoteSaved(null);
      const fields = [
        "company",
        "person",
        "email",
        "phone",
        "direction",
        "mode",
        "originCountry",
        "originCity",
        "originAddress",
        "destinationCountry",
        "destinationCity",
        "destinationAddress",
        "goods",
        "packages",
        "gross",
        "net",
        "volume",
        "dimensions",
        "readyDate",
        "incoterm",
      ];
      try {
        form.set(
          "volume",
          String(
            calculateVolume(
              String(form.get("dimensions") || ""),
              String(form.get("packages") || ""),
            ),
          ),
        );
      } catch (error) {
        setQuoteStatus(error instanceof Error ? error.message : st.dimensions);
        return;
      }
      const missing = fields.find((key) => !String(form.get(key) || "").trim());
      if (missing) {
        setQuoteStatus(st.missing);
        document.getElementById(missing)?.focus();
        return;
      }
      if (
        !["packages", "gross", "net", "volume"].every((key) => Number(form.get(key)) > 0) ||
        Number(form.get("net")) > Number(form.get("gross")) ||
        !Number.isInteger(Number(form.get("packages")))
      ) {
        setQuoteStatus(st.numbers);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.get("email") || "").trim())) {
        setQuoteStatus(st.email);
        return;
      }
      const endpoint = import.meta.env["VITE_PORTAL_QUOTE_URL"];
      if (endpoint) {
        const email = String(form.get("email") || "").trim();
        setQuoteBusy(true);
        setQuoteStatus(st.saving);
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(form.entries())),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || st.failed);
          // Once kutuyu goster, sonra formu bosalt: iki kez gonderim olmasin.
          setQuoteStatus("");
          setQuoteSaved({ id: String(result.id), email });
          formEl.reset();
          trackLead("quote_portal_saved");
        } catch (error) {
          setQuoteStatus(error instanceof Error ? error.message : st.offline);
        } finally {
          setQuoteBusy(false);
        }
        return;
      }
      setQuoteStatus(st.mailto);
    }
    const lines = Array.from(form.entries())
      .filter(([, value]) => String(value).trim())
      .map(([key, value]) => `${key}: ${String(value).trim()}`);
    const formType =
      e.currentTarget.dataset["formType"] === "quote" ? "Teklif Talebi" : "İletişim Talebi";
    trackLead(e.currentTarget.dataset["formType"] === "quote" ? "quote_mailto" : "contact_mailto");
    window.location.href = `mailto:info@ascendlojistik.com?subject=${encodeURIComponent(`Ascend Lojistik — ${formType}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <SiteLayout>
      <PageHero eyebrow={k.hero.eyebrow} title={k.hero.title} subtitle={k.hero.subtitle} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-10">
            <form
              onSubmit={onSubmit}
              data-form-type="quote"
              onInput={(event) => {
                const form = event.currentTarget;
                const volume = form.elements.namedItem("volume") as HTMLInputElement | null;
                if (!volume) return;
                try {
                  const data = new FormData(form);
                  volume.value = String(
                    calculateVolume(
                      String(data.get("dimensions") || ""),
                      String(data.get("packages") || ""),
                    ),
                  );
                } catch {
                  volume.value = "";
                }
              }}
              noValidate
              className="rounded-xl border border-border bg-card p-8 card-elevated lg:p-10"
            >
              <h2 className="font-display text-2xl font-bold text-foreground">
                {k.quoteForm.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {import.meta.env["VITE_PORTAL_QUOTE_URL"]
                  ? k.quoteForm.portalSubtitle
                  : k.quoteForm.subtitle}
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field id="company" label={k.quoteForm.fields.company} required />
                <Field id="person" label={k.quoteForm.fields.person} required />
                <Field id="email" label={k.quoteForm.fields.email} type="email" required />
                <Field id="phone" label={k.quoteForm.fields.phone} type="tel" required />
                <Field id="originCity" label={k.quoteForm.fields.origin} required />
                <Field id="destinationCity" label={k.quoteForm.fields.destination} required />
                <div className="grid gap-2">
                  <Label htmlFor="mode">{k.quoteForm.fields.mode}</Label>
                  <select
                    id="mode"
                    required
                    name="mode"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {(["Hava", "Kara", "Deniz", "Demiryolu"] as const).map((m) => (
                      <option key={m} value={m}>
                        {k.quoteForm.modeLabels[m]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="direction">{k.quoteForm.extra.direction} *</Label>
                  <select
                    id="direction"
                    name="direction"
                    required
                    className="rounded-md border border-input bg-background p-3"
                  >
                    {(["İthalat", "İhracat"] as const).map((d) => (
                      <option key={d} value={d}>
                        {k.quoteForm.directionLabels[d]}
                      </option>
                    ))}
                  </select>
                </div>
                <Field id="originCountry" label={`${k.quoteForm.extra.originCountry} *`} required />
                <Field id="originAddress" label={`${k.quoteForm.extra.originAddress} *`} required />
                <Field
                  id="destinationCountry"
                  label={`${k.quoteForm.extra.destinationCountry} *`}
                  required
                />
                <Field
                  id="destinationAddress"
                  label={`${k.quoteForm.extra.destinationAddress} *`}
                  required
                />
                <Field
                  id="packages"
                  label={`${k.quoteForm.extra.packages} *`}
                  type="number"
                  required
                />
                <Field id="gross" label={`${k.quoteForm.extra.gross} *`} type="number" required />
                <Field id="net" label={`${k.quoteForm.extra.net} *`} type="number" required />
                <label>
                  {k.quoteForm.extra.volume}
                  <input id="volume" name="volume" readOnly className="w-full rounded border p-3" />
                </label>
                <Field
                  id="readyDate"
                  label={`${k.quoteForm.extra.readyDate} *`}
                  type="date"
                  required
                />
                <div className="grid gap-2">
                  <Label htmlFor="incoterm">{k.quoteForm.extra.incoterm} *</Label>
                  <select
                    id="incoterm"
                    name="incoterm"
                    required
                    className="rounded-md border border-input bg-background p-3"
                  >
                    {["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"].map(
                      (value) => (
                        <option key={value}>{value}</option>
                      ),
                    )}
                  </select>
                </div>
                <Field id="goods" label={k.quoteForm.fields.cargo} required />
                <div className="sm:col-span-2 grid gap-2">
                  <Label htmlFor="dimensions">
                    Kap/palet ölçüleri (cm). Örnek: 3 adet: 120 x 80 x 150; 2 adet: 100 x 80 x 90 *
                  </Label>
                  <Textarea id="dimensions" name="dimensions" rows={4} required />
                </div>
              </div>

              <div role="status" aria-live="polite">
                {quoteSaved ? (
                  <div
                    ref={(node) => node?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className="mt-6 rounded-xl border-2 border-primary bg-secondary p-6"
                  >
                    <p className="flex items-center gap-2 font-display text-lg font-bold text-primary">
                      <CheckCircle2 className="size-6 shrink-0" aria-hidden="true" />
                      {st.savedTitle}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">{st.savedReference}</p>
                    <p className="font-display text-3xl font-bold tracking-tight text-foreground">
                      {quoteSaved.id}
                    </p>
                    <p className="mt-3 text-sm text-foreground">
                      {st.savedMail.replace("{email}", quoteSaved.email)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{st.savedNext}</p>
                  </div>
                ) : null}
                {quoteStatus ? <p className="mt-4 text-sm text-foreground">{quoteStatus}</p> : null}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={quoteBusy}
                className="mt-8 w-full sm:w-auto"
              >
                {import.meta.env["VITE_PORTAL_QUOTE_URL"]
                  ? k.quoteForm.portalSubmit
                  : k.quoteForm.submit}
              </Button>
            </form>

            <form
              onSubmit={onSubmit}
              data-form-type="contact"
              className="rounded-xl border border-border bg-card p-8 card-elevated lg:p-10"
            >
              <h2 className="font-display text-2xl font-bold text-foreground">
                {k.contactForm.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{k.contactForm.subtitle}</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field id="name" label={k.contactForm.fields.name} required />
                <Field id="c-email" label={k.contactForm.fields.email} type="email" required />
                <div className="sm:col-span-2">
                  <Field id="subject" label={k.contactForm.fields.subject} />
                </div>
                <div className="sm:col-span-2 grid gap-2">
                  <Label htmlFor="c-message">{k.contactForm.fields.message}</Label>
                  <Textarea id="c-message" name="message" rows={5} required />
                </div>
              </div>
              <Button type="submit" size="lg" variant="secondary" className="mt-8 w-full sm:w-auto">
                {k.contactForm.submit}
              </Button>
            </form>
          </div>

          <aside className="h-fit rounded-xl border border-navy-border p-8 surface-navy lg:sticky lg:top-20">
            <h2 className="font-display text-xl font-bold text-navy-foreground">{k.info.title}</h2>
            <ul className="mt-8 space-y-7">
              {k.info.items.map((item, i) => {
                const Icon = infoIcons[i] ?? Mail;
                return (
                  <li key={item.label} className="flex gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <Icon className="h-5 w-5 text-navy-foreground" />
                    </span>
                    <div>
                      <p className="eyebrow text-navy-foreground/75">{item.label}</p>
                      <p className="mt-1.5 break-words text-sm font-medium text-navy-foreground">
                        {item.label === "Telefon" ? (
                          <a href="tel:+902129630553" onClick={() => trackLead("contact_phone")}>
                            {item.value}
                          </a>
                        ) : null}
                        {item.label === "E-posta" ? (
                          <a
                            href="mailto:info@ascendlojistik.com"
                            onClick={() => trackLead("contact_email")}
                          >
                            {item.value}
                          </a>
                        ) : null}
                        {item.label === "Adres" ? item.value : null}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-8 border-t border-navy-border pt-6 text-xs leading-relaxed text-navy-foreground/80">
              {k.info.note}
            </p>
          </aside>
        </div>
      </Section>
    </SiteLayout>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        step={type === "number" ? "any" : undefined}
        required={required}
      />
    </div>
  );
}
