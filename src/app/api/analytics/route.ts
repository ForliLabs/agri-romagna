import { telemetry } from "@/lib/telemetry";
import { analyticsEventSchema } from "@/lib/validators/schemas";
import { authorizeRoute } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { denied } = await authorizeRoute(request, "analytics:read");
  if (denied) return denied;

  return Response.json(telemetry.getDashboardData());
}

export async function POST(request: Request) {
  const { denied } = await authorizeRoute(request, "analytics:read");
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = analyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Invalid telemetry data" }, { status: 400 });
    }

    telemetry.recordRequest({
      path: parsed.data.path,
      method: "VIEW",
      statusCode: 200,
      durationMs: parsed.data.durationMs ?? 0,
      timestamp: Date.now(),
      userRole: parsed.data.userRole,
    });

    return Response.json({ recorded: true });
  } catch {
    return Response.json({ error: "Invalid telemetry data" }, { status: 400 });
  }
}
