import { fields } from "@/lib/data";
import {
  buildTreatmentRecommendations,
  calculateCurrentFieldDiseaseRisks,
  diseaseModels,
  diseaseRisksStore,
  getActiveWarnings,
  getFieldDiseaseRisks,
  treatmentRecommendationsStore,
} from "@/lib/pest-warning-data";

export async function GET() {
  const risks = await diseaseRisksStore.findAll();
  const recommendations = await treatmentRecommendationsStore.findAll();

  return Response.json({
    risks,
    activeWarnings: getActiveWarnings(risks),
    fieldRisks: fields.map((field) => ({ fieldId: field.id, risks: getFieldDiseaseRisks(field.id, risks) })),
    recommendations,
    models: diseaseModels,
  });
}

export async function POST(request: Request) {
  const payload = ((await request.json().catch(() => ({}))) ?? {}) as { fieldId?: string };
  const targetFields = payload.fieldId
    ? fields.filter((field) => field.id === payload.fieldId)
    : fields;

  if (payload.fieldId && targetFields.length === 0) {
    return Response.json({ error: "Campo non trovato." }, { status: 404 });
  }

  const targetFieldIds = new Set(targetFields.map((field) => field.id));
  const recalculatedRisks = targetFields.flatMap((field) =>
    calculateCurrentFieldDiseaseRisks(field.id)
  );
  const recalculatedRecommendations = buildTreatmentRecommendations(recalculatedRisks);

  const currentRisks = await diseaseRisksStore.findAll();
  const currentRecommendations = await treatmentRecommendationsStore.findAll();
  const nextRiskIds = new Set(recalculatedRisks.map((risk) => risk.id));
  const nextRecommendationIds = new Set(
    recalculatedRecommendations.map((recommendation) => recommendation.id)
  );

  for (const risk of currentRisks.filter((item) => targetFieldIds.has(item.fieldId))) {
    if (!nextRiskIds.has(risk.id)) {
      await diseaseRisksStore.delete(risk.id);
    }
  }

  for (const recommendation of currentRecommendations.filter((item) =>
    Array.from(targetFieldIds).some((fieldId) => item.diseaseRiskId.startsWith(`risk-${fieldId}-`))
  )) {
    if (!nextRecommendationIds.has(recommendation.id)) {
      await treatmentRecommendationsStore.delete(recommendation.id);
    }
  }

  for (const risk of recalculatedRisks) {
    const existingRisk = await diseaseRisksStore.findById(risk.id);
    if (existingRisk) {
      await diseaseRisksStore.update(risk.id, risk);
    } else {
      await diseaseRisksStore.create(risk);
    }
  }

  for (const recommendation of recalculatedRecommendations) {
    const existingRecommendation = await treatmentRecommendationsStore.findById(
      recommendation.id
    );
    if (existingRecommendation) {
      await treatmentRecommendationsStore.update(recommendation.id, recommendation);
    } else {
      await treatmentRecommendationsStore.create(recommendation);
    }
  }

  const risks = await diseaseRisksStore.findAll();
  const recommendations = await treatmentRecommendationsStore.findAll();

  return Response.json({
    refreshedFields: Array.from(targetFieldIds),
    risks: risks.filter((risk) => targetFieldIds.has(risk.fieldId)),
    activeWarnings: getActiveWarnings(risks),
    recommendations: recommendations.filter((item) =>
      Array.from(targetFieldIds).some((fieldId) => item.diseaseRiskId.startsWith(`risk-${fieldId}-`))
    ),
  });
}
