import {
  cropPhenologyModels,
  getYieldPredictionSummary,
  predictYield,
  yieldPredictions,
} from "@/lib/yield-prediction";
import { yieldPredictionQueries } from "@/lib/data-layer";

export async function GET() {
  const dbPredictions = (await yieldPredictionQueries.findAll()) as any[];
  return Response.json({
    summary: getYieldPredictionSummary(),
    predictions: dbPredictions.length > 0 ? dbPredictions : yieldPredictions,
    models: cropPhenologyModels,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { fieldId?: string };

  if (body.fieldId) {
    return Response.json({ prediction: predictYield(body.fieldId) });
  }

  const dbPredictions = (await yieldPredictionQueries.findAll()) as any[];
  return Response.json({
    summary: getYieldPredictionSummary(),
    predictions: dbPredictions.length > 0 ? dbPredictions : yieldPredictions,
  });
}
