/**
 * Portal sunucusunun mevcut /api/tenant/* uclariyla konusan ince katman.
 *
 * Oturum HttpOnly `ascend_sid` cerezinde tasinir, bu yuzden her istek
 * `credentials: "same-origin"` ile gider ve token istemcide hic tutulmaz.
 * Dev'de istekler Vite proxy'si uzerinden ayni origin'den cikar; sunucunun
 * Origin/Host karsilastirmasi bu sayede gecer (bkz. vite.config.ts).
 */

export type Role = "Yönetici" | "Operasyon" | "Finans" | "Görüntüleme" | "Müşteri";

export interface User {
  username: string;
  name: string;
  role: Role;
  companyId?: string;
  companyName?: string;
  email?: string;
  active?: boolean;
}

/** GET /api/tenant/monitor — yalnız yönetici. */
export interface MonitorOffer {
  id: string;
  quoteId: string;
  date: string;
  status: string;
}

export interface MonitorPayment {
  fileNo: string;
  company: string;
  date: string;
  status: string;
}

export interface MonitorFailure {
  id: string;
  status: string;
  attempts: number;
  last_error: string | null;
}

export interface MonitorBackup {
  at: string;
  [detail: string]: unknown;
}

export interface MonitorReport {
  today: string;
  offers: MonitorOffer[];
  payments: MonitorPayment[];
  failures: MonitorFailure[];
  backup: MonitorBackup | null;
  revision: number;
}

/** GET /api/tenant/quotes — personel; taslaklar yalnız yöneticiye anlamlıdır. */
export interface QuoteDraft {
  id: string;
  quote_id: string;
  carrier_id: string;
  status: string;
  body: { to: string[]; cc: string[]; subject: string; text: string };
}

export interface QuoteBody {
  company: string;
  person: string;
  email: string;
  phone: string;
  direction: string;
  mode: string;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  goods: string;
  readyDate: string;
  incoterm: string;
  [field: string]: string;
}

export interface QuoteRequest {
  id: string;
  created_at: string;
  created_by: string;
  status: string;
  body: QuoteBody;
  drafts: QuoteDraft[];
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "Sunucuya ulaşılamadı. Portal çalışıyor mu?");
  }

  const text = await response.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      // Sunucu HTML hata sayfasi dondurmus olabilir; ham metni gostermeyiz.
      payload = undefined;
    }
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload["error"] === "string"
        ? payload["error"]
        : `İstek başarısız (HTTP ${response.status}).`;
    throw new ApiError(response.status, message);
  }

  return payload as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export const api = {
  /** Kullanıcıyı doğrular; sunucu oturum çerezini kendi ayarlar. */
  login(username: string, password: string, code = ""): Promise<User> {
    return request<User>("/api/tenant/login", {
      method: "POST",
      body: JSON.stringify({ username, password, code }),
    });
  },

  logout(): Promise<unknown> {
    return request("/api/tenant/logout", { method: "POST" });
  },

  /** Açık oturum yoksa 401 döner; açılışta oturumu sınamak için kullanılır. */
  session(): Promise<{ user: User }> {
    return request<{ user: User }>("/api/tenant/data");
  },

  monitor(): Promise<MonitorReport> {
    return request<MonitorReport>("/api/tenant/monitor");
  },
  quotes(): Promise<QuoteRequest[]> {
    return request<QuoteRequest[]>("/api/tenant/quotes");
  },

  /** Kayıtlı taşıyıcılarla yeniden eşleştirip taslakları tazeler. */
  prepareQuote(id: string): Promise<unknown> {
    return request("/api/tenant/quotes/prepare", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  },

  /** Yalnız yönetici; teklife dönüşmüş talep sunucuda reddedilir. */
  dismissQuote(id: string): Promise<unknown> {
    return request("/api/tenant/quotes/dismiss", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  },

  /** Sunucu `reviewed` olmadan onaylamaz; gözden geçirme bilinçli bir adımdır. */
  approveDraft(input: { id: string; subject: string; text: string }): Promise<unknown> {
    return request("/api/tenant/quotes/approve", {
      method: "POST",
      body: JSON.stringify({ ...input, reviewed: true }),
    });
  },
};
