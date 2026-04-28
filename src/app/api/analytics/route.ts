import { telemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(telemetry.getDashboardData());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Record client-side page view events
    if (body.type === "page_view" && body.path) {
      telemetry.recordRequest({
        path: body.path,
        method: "VIEW",
        statusCode: 200,
        durationMs: body.durationMs ?? 0,
        timestamp: Date.now(),
        userRole: body.userRole,
      });
    }

    return Response.json({ recorded: true });
  } catch {
    return Response.json({ error: "Invalid telemetry data" }, { status: 400 });
  }
}
