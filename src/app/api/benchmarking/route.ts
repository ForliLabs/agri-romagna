import { farm } from "@/lib/data";
import {
  farmBenchmarks,
  getCooperativeBenchmarks,
  getFarmBenchmark,
  getKnowledgeInsights,
  getPerformanceTrends,
} from "@/lib/benchmarking-data";
import { farmBenchmarkQueries } from "@/lib/data-layer";

type BenchmarkRecord = {
  id: string;
  farmId: string;
  farmLabel?: string | null;
  period: string;
  yieldPerHa: number;
  costPerHa: number;
  waterEfficiency: number;
  carbonPerHa: number;
  overallScore: number;
};

type BenchmarkPayload = Partial<BenchmarkRecord> & { farmId?: string; period?: string };

export async function GET() {
  const benchmarks = (await farmBenchmarkQueries.findAll()) as BenchmarkRecord[];

  return Response.json({
    currentFarm: getFarmBenchmark(farm.id),
    benchmarks: benchmarks.map((item) => ({
      farmId: item.farmId,
      farmLabel: item.farmLabel ?? item.farmId,
      period: item.period,
      yieldPerHa: item.yieldPerHa,
      costPerHa: item.costPerHa,
      waterEfficiency: item.waterEfficiency,
      carbonPerHa: item.carbonPerHa,
      overallScore: item.overallScore,
    })),
    cooperativeBenchmarks: getCooperativeBenchmarks(),
    insights: getKnowledgeInsights(farm.id),
    performanceTrends: getPerformanceTrends(),
    participantCount: farmBenchmarks.length,
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as BenchmarkPayload;

  if (!payload.farmId || !payload.period) {
    return Response.json({ error: "Campi richiesti: farmId, period." }, { status: 400 });
  }

  const benchmark = await farmBenchmarkQueries.create({
    id: payload.id ?? `bench-${crypto.randomUUID()}`,
    farmId: payload.farmId,
    period: payload.period,
    yieldPerHa: payload.yieldPerHa ?? 0,
    costPerHa: payload.costPerHa ?? 0,
    waterEfficiency: payload.waterEfficiency ?? 0,
    carbonPerHa: payload.carbonPerHa ?? 0,
    overallScore: payload.overallScore ?? 0,
  });

  return Response.json({ benchmark }, { status: 201 });
}
