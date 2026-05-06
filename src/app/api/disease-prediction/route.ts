import { fields } from "@/lib/data";
import {
  diseaseAssessmentsStore,
  diseaseAlertsStore,
  getDiseasePredictionSummary,
  getFieldDiseaseSnapshot,
  getDiseaseProfile,
  isDiseaseId,
  diseaseProfiles,
} from "@/lib/crop-disease-prediction";
import { authorizeRoute } from "@/lib/api-response";
import { validateBody } from "@/lib/api-errors";
import { diseasePredictionActionSchema } from "@/lib/validators/schemas";

export async function GET(request: Request) {
  const { denied } = await authorizeRoute(request, "pest-warning:read");
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const fieldId = searchParams.get("fieldId");
  const diseaseId = searchParams.get("diseaseId");

  if (fieldId) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) {
      return Response.json({ error: "Campo non trovato." }, { status: 404 });
    }
    return Response.json(getFieldDiseaseSnapshot(field));
  }

  if (diseaseId) {
    if (!isDiseaseId(diseaseId)) {
      return Response.json({ error: "Patologia non riconosciuta." }, { status: 404 });
    }
    return Response.json(getDiseaseProfile(diseaseId));
  }

  const summary = getDiseasePredictionSummary();
  const assessments = await diseaseAssessmentsStore.findAll();
  const alerts = await diseaseAlertsStore.findAll();

  return Response.json({
    summary,
    assessments,
    alerts: alerts.filter((a) => !a.acknowledged),
    diseaseProfiles,
  });
}

export async function POST(request: Request) {
  const { denied } = await authorizeRoute(request, "pest-warning:read");
  if (denied) return denied;

  const { data: payload, error } = await validateBody(request, diseasePredictionActionSchema);
  if (error) return error;

  if (payload.action === "acknowledge" && payload.alertId) {
    const alert = await diseaseAlertsStore.findById(payload.alertId);
    if (!alert) {
      return Response.json({ error: "Avviso non trovato." }, { status: 404 });
    }
    await diseaseAlertsStore.update(payload.alertId, { acknowledged: true });
    return Response.json({ success: true, alertId: payload.alertId });
  }

  // Refresh all assessments
  const summary = getDiseasePredictionSummary();
  return Response.json({ refreshed: true, summary });
}
