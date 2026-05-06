import {
  getAnalyticsDashboard,
  getAnomalies,
  getCorrelations,
  getFieldPerformanceIndex,
  getModuleHealth,
  getPredictions,
  getTrends,
} from "@/lib/analytics-engine";
import { authorizeRoute } from "@/lib/api-response";
import { validateBody } from "@/lib/api-errors";
import { analyticsEngineActionSchema } from "@/lib/validators/schemas";

export async function GET(request: Request) {
  const { denied } = await authorizeRoute(request, "analytics:read");
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  switch (view) {
    case "health":
      return Response.json({ moduleHealth: getModuleHealth() });
    case "correlations":
      return Response.json({ correlations: getCorrelations() });
    case "anomalies":
      return Response.json({ anomalies: getAnomalies() });
    case "trends":
      return Response.json({ trends: getTrends() });
    case "predictions":
      return Response.json({ predictions: getPredictions() });
    case "performance":
      return Response.json({ fieldPerformance: getFieldPerformanceIndex() });
    default:
      return Response.json(getAnalyticsDashboard());
  }
}

export async function POST(request: Request) {
  const { denied } = await authorizeRoute(request, "analytics:read");
  if (denied) return denied;

  const { data: _payload, error } = await validateBody(request, analyticsEngineActionSchema);
  if (error) return error;

  return Response.json(getAnalyticsDashboard());
}
