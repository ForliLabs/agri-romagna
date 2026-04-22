import {
  cropPhenologyModels,
  getYieldPredictionSummary,
  predictYield,
  yieldPredictions,
} from "@/lib/yield-prediction";

export async function GET() {
  return Response.json({
    summary: getYieldPredictionSummary(),
    predictions: yieldPredictions,
    models: cropPhenologyModels,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { fieldId?: string };

  if (body.fieldId) {
    return Response.json({ prediction: predictYield(body.fieldId) });
  }

  return Response.json({
    summary: getYieldPredictionSummary(),
    predictions: yieldPredictions,
  });
}
