import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-errors";
import { config } from "@/lib/config";

/** Whitelist of API path prefixes allowed in sync mutations (prevents SSRF). */
const ALLOWED_SYNC_PATHS = config.SYNC_ALLOWED_PATHS_LIST;

function isAllowedSyncUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "http://localhost");
    return ALLOWED_SYNC_PATHS.some((prefix) => parsed.pathname.startsWith(prefix));
  } catch {
    return false;
  }
}

/**
 * GET /api/sync — Returns sync status and server timestamp for offline reconciliation.
 * POST /api/sync — Accepts batch mutations from offline queue.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "dashboard:view");
  if (denied) return denied;

  return createSuccessResponse(
    {
      serverTime: new Date().toISOString(),
      syncVersion: 2,
      supportedEndpoints: [...ALLOWED_SYNC_PATHS],
    },
    { meta: { domain: "sync" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "dashboard:view");
  if (denied) return denied;

  const body = (await request.json()) as {
    mutations?: { url: string; method: string; body: string; timestamp: number }[];
  };

  if (!body.mutations || !Array.isArray(body.mutations)) {
    return createSuccessResponse({ processed: 0, errors: [] }, { meta: { domain: "sync" } });
  }

  const results: { url: string; success: boolean; error?: string }[] = [];

  for (const mutation of body.mutations) {
    if (!isAllowedSyncUrl(mutation.url)) {
      results.push({
        url: mutation.url,
        success: false,
        error: "URL non consentito per la sincronizzazione",
      });
      continue;
    }

    try {
      const requestOrigin = new URL(request.url).origin;
      const internalUrl = new URL(mutation.url, request.url);

      // Enforce same-origin to prevent SSRF
      if (internalUrl.origin !== requestOrigin) {
        results.push({
          url: mutation.url,
          success: false,
          error: "URL non consentito per la sincronizzazione",
        });
        continue;
      }

      const response = await fetch(internalUrl.toString(), {
        method: mutation.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("Authorization") ?? "",
          Cookie: request.headers.get("Cookie") ?? "",
        },
        body: mutation.body,
      });

      results.push({
        url: mutation.url,
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      });
    } catch (err) {
      results.push({
        url: mutation.url,
        success: false,
        error: err instanceof Error ? err.message : "Errore sconosciuto",
      });
    }
  }

  return createSuccessResponse(
    {
      processed: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
      syncedAt: new Date().toISOString(),
    },
    { meta: { domain: "sync" } }
  );
});
