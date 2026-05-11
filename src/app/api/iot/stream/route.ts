import { getUserFromRequest } from "@/lib/auth-service";
import { sseHub, startHeartbeat } from "@/lib/sse-hub";

export const dynamic = "force-dynamic";

/**
 * GET /api/iot/stream — Server-Sent Events endpoint for real-time IoT sensor data.
 *
 * Supports optional query params:
 * - `fieldId` — only receive readings for a specific field
 * - `sensorId` — only receive readings for a specific sensor
 *
 * Requires authentication via Bearer token or access_token cookie.
 *
 * Events emitted:
 * - `connected` — initial connection confirmation
 * - `sensor-reading` — new sensor data point
 * - `sensor-alert` — threshold violation alert
 * - `device-status` — device online/offline change
 * - `heartbeat` — periodic keep-alive (simulated sensor data in dev)
 */
export async function GET(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json(
      { error: "Autenticazione richiesta.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const fieldId = url.searchParams.get("fieldId") ?? undefined;
  const sensorId = url.searchParams.get("sensorId") ?? undefined;

  const stream = new ReadableStream({
    start(controller) {
      const clientId = sseHub.addClient(controller, { fieldId, sensorId });

      // Send initial connection event
      const connectMsg = `id: 0\nevent: connected\ndata: ${JSON.stringify({
        clientId,
        userId: user.id,
        filters: { fieldId, sensorId },
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMsg));

      // Start the simulated heartbeat if not already running
      startHeartbeat();

      // Handle client disconnect via AbortSignal
      request.signal.addEventListener("abort", () => {
        sseHub.removeClient(clientId);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
