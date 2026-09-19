import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/**
 * Bu site, ascendlojistik.com'da yayında olan WordPress kurulumunun yerini alır.
 * Eski sitenin indekslenmiş adresleri burada karşılığı olan sayfaya kalıcı
 * olarak yönlendirilir; aksi halde geçiş anında 404'e düşer ve o adreslerin
 * arama motorundaki değeri kaybolur.
 *
 * Kaynak: eski kurulumun wp-sitemap-posts-page-1.xml / -post-1.xml çıktısı.
 */
const LEGACY_REDIRECTS = new Map<string, string>([
  ["/karayolu-tasimaciligi", "/hizmetlerimiz"],
  ["/denizyolu-tasimaciligi", "/hizmetlerimiz"],
  ["/havayolu-tasimaciligi", "/hizmetlerimiz"],
  ["/acentelik", "/hizmetlerimiz"],
  // WordPress'in kurulumla gelen ornek icerikleri; karsiligi yok.
  ["/sample-page", "/"],
  ["/2022/09/19/hello-world", "/"],
]);

function legacyRedirect(request: Request): Response | undefined {
  const url = new URL(request.url);
  // Eski adresler sondaki bolu isaretiyle indekslendi; iki bicimi de karsila.
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const target = LEGACY_REDIRECTS.get(path.toLowerCase());
  if (!target) return undefined;

  const location = new URL(target, url);
  location.search = url.search;
  // TLS Railway'in kenarinda sonlanir, bu yuzden istek uygulamaya http olarak
  // gelir. Protokolu oldugu gibi kullanirsak 301 http'ye isaret eder ve
  // ziyaretci https'e ikinci bir atlamayla doner.
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedProto) location.protocol = `${forwardedProto}:`;
  return Response.redirect(location, 301);
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const redirect = legacyRedirect(request);
      if (redirect) return redirect;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
