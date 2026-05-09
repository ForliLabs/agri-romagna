import {
  cropPhenologyModels,
  predictYield,
  yieldPredictionsStore,
} from "@/lib/yield-prediction";
import { withAuth } from "@/lib/api-response";

type PredictionPayload = { fieldId?: string };

async function getPredictions() {
  return yieldPredictionsStore.findAll();
}

export const GET = withAuth("yield:read", async () => {
  const predictions = await getPredictions();

  return Response.json({
    summary: {
      totalFields: predictions.length,
      averageYieldKgHa: Math.round(
        predictions.reduce((sum, prediction) => sum + prediction.predictedYieldKgHa, 0) /
          Math.max(1, predictions.length)
      ),
      harvestReadySoon: predictions.filter((prediction) => prediction.gddProgressPercent >= 85)
        .length,
      fieldsWithElevatedRisk: predictions.filter((prediction) => prediction.riskFactors.length > 1)
        .length,
    },
    predictions,
    models: cropPhenologyModels,
  });
});

export const POST = withAuth("yield:read", async (request: Request) => {
  const body = (await request.json().catch(() => ({}))) as PredictionPayload;

  if (body.fieldId) {
    return Response.json({ prediction: predictYield(body.fieldId) });
  }

  const predictions = await getPredictions();

  return Response.json({
    summary: {
      totalFields: predictions.length,
      averageYieldKgHa: Math.round(
        predictions.reduce((sum, prediction) => sum + prediction.predictedYieldKgHa, 0) /
          Math.max(1, predictions.length)
      ),
      harvestReadySoon: predictions.filter((prediction) => prediction.gddProgressPercent >= 85)
        .length,
      fieldsWithElevatedRisk: predictions.filter((prediction) => prediction.riskFactors.length > 1)
        .length,
    },
    predictions,
  });
});
