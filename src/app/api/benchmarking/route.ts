import type { FarmBenchmark } from "@/lib/benchmarking-data";
import { farm } from "@/lib/data";
import {
  farmBenchmarks,
  farmBenchmarksStore,
  getCooperativeBenchmarks,
  getFarmBenchmark,
  getKnowledgeInsights,
  getPerformanceTrends,
} from "@/lib/benchmarking-data";

export async function GET() {
  const benchmarks = await farmBenchmarksStore.findAll();

  return Response.json({
    currentFarm: getFarmBenchmark(farm.id),
    benchmarks: benchmarks.map((item) => ({
      farmId: item.farmId,
      farmLabel: item.farmLabel,
      cropType: item.cropType,
      dimensions: item.dimensions,
    })),
    cooperativeBenchmarks: getCooperativeBenchmarks(),
    insights: getKnowledgeInsights(farm.id),
    performanceTrends: getPerformanceTrends(),
    participantCount: farmBenchmarks.length,
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<FarmBenchmark>;

  if (!payload.farmId || !payload.farmLabel || !payload.cropType || !payload.dimensions) {
    return Response.json(
      {
        error: "Campi richiesti: farmId, farmLabel, cropType, dimensions.",
      },
      { status: 400 }
    );
  }

  const benchmark: FarmBenchmark = {
    farmId: payload.farmId,
    farmLabel: payload.farmLabel,
    cropType: payload.cropType,
    dimensions: payload.dimensions,
  };

  const createdBenchmark = await farmBenchmarksStore.create({
    id: benchmark.farmId,
    ...benchmark,
  });

  return Response.json(
    {
      benchmark: {
        farmId: createdBenchmark.farmId,
        farmLabel: createdBenchmark.farmLabel,
        cropType: createdBenchmark.cropType,
        dimensions: createdBenchmark.dimensions,
      },
    },
    { status: 201 }
  );
}
