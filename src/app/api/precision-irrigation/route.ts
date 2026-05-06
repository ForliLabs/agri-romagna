import { fields } from "@/lib/data";
import {
  generateIrrigationRecommendation,
  getFieldIrrigationProfile,
  getIrrigationDecisionExplanation,
  getPrecisionIrrigationSummary,
} from "@/lib/precision-irrigation";
import { authorizeRoute } from "@/lib/api-response";
import { validateBody } from "@/lib/api-errors";
import { precisionIrrigationActionSchema } from "@/lib/validators/schemas";

export async function GET(request: Request) {
  const { denied } = await authorizeRoute(request, "water:read");
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const fieldId = searchParams.get("fieldId");
  const view = searchParams.get("view");

  if (fieldId) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) {
      return Response.json({ error: "Campo non trovato." }, { status: 404 });
    }

    if (view === "explain") {
      return Response.json({ explanation: getIrrigationDecisionExplanation(fieldId) });
    }

    return Response.json({
      recommendation: generateIrrigationRecommendation(field),
      profile: getFieldIrrigationProfile(field),
    });
  }

  return Response.json(getPrecisionIrrigationSummary());
}

export async function POST(request: Request) {
  const { denied } = await authorizeRoute(request, "water:read");
  if (denied) return denied;

  const { data: payload, error } = await validateBody(request, precisionIrrigationActionSchema);
  if (error) return error;

  if (payload.fieldId) {
    const field = fields.find((f) => f.id === payload.fieldId);
    if (!field) {
      return Response.json({ error: "Campo non trovato." }, { status: 404 });
    }
    return Response.json({
      recommendation: generateIrrigationRecommendation(field),
      profile: getFieldIrrigationProfile(field),
    });
  }

  return Response.json(getPrecisionIrrigationSummary());
}
