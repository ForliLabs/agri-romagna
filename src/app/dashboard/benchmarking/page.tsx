import {
  BarChart3,
  Lightbulb,
  Radar,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { farm } from "@/lib/data";
import {
  benchmarkDimensions,
  getCooperativeBenchmarks,
  getFarmBenchmark,
  getKnowledgeInsights,
  getPerformanceTrends,
  type BenchmarkDimension,
} from "@/lib/benchmarking-data";

const farmBenchmark = getFarmBenchmark(farm.id)!;
const cooperativeBenchmarks = getCooperativeBenchmarks();
const cooperativeBenchmarkMap = new Map(
  cooperativeBenchmarks.map((benchmark) => [benchmark.dimension, benchmark])
);
const knowledgeInsights = getKnowledgeInsights(farm.id);
const performanceTrends = getPerformanceTrends();

const dimensionLabels: Record<BenchmarkDimension, string> = {
  yield_per_ha: "Resa per ettaro",
  cost_per_ha: "Costo per ettaro",
  water_use_per_ha: "Acqua per ettaro",
  ndvi_health: "Salute NDVI",
  treatment_frequency: "Frequenza trattamenti",
  carbon_intensity: "Intensità carbonica",
  revenue_per_ha: "Ricavo per ettaro",
  labor_efficiency: "Efficienza del lavoro",
};

function formatDimensionValue(dimension: BenchmarkDimension, value: number): string {
  if (dimension === "yield_per_ha") return `${value.toLocaleString("it-IT")} t/ha`;
  if (dimension === "cost_per_ha") return `€ ${value.toLocaleString("it-IT")}/ha`;
  if (dimension === "water_use_per_ha") return `${value.toLocaleString("it-IT")} m³/ha`;
  if (dimension === "ndvi_health") return value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (dimension === "treatment_frequency") return `${value.toLocaleString("it-IT")} interventi`;
  if (dimension === "carbon_intensity") return `${value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg CO₂e/kg`;
  if (dimension === "revenue_per_ha") return `€ ${value.toLocaleString("it-IT")}/ha`;
  return `${value.toLocaleString("it-IT")} kg/ora`;
}

export default function BenchmarkingPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Benchmarking cooperativo
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Confronta la tua performance con la cooperativa e il territorio.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Dati anonimizzati multi-farm, percentile ranking e suggerimenti operativi per trasformare i numeri in decisioni di campo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Resa media cooperativa"
          value={formatDimensionValue("yield_per_ha", cooperativeBenchmarkMap.get("yield_per_ha")!.cooperativeAvg)}
          change="Confronto rispetto alle aziende aderenti"
          trend="up"
        />
        <StatCard
          label="Ricavo medio"
          value={formatDimensionValue("revenue_per_ha", cooperativeBenchmarkMap.get("revenue_per_ha")!.cooperativeAvg)}
          change="Media netto filiera conferita"
          trend="up"
        />
        <StatCard
          label="Acqua media/ha"
          value={formatDimensionValue("water_use_per_ha", cooperativeBenchmarkMap.get("water_use_per_ha")!.cooperativeAvg)}
          change="Trend in riduzione vs stagione precedente"
          trend="up"
        />
        <StatCard
          label="Carbonio medio"
          value={formatDimensionValue("carbon_intensity", cooperativeBenchmarkMap.get("carbon_intensity")!.cooperativeAvg)}
          change="Intensità per kg conferito"
          trend="neutral"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Radar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Tabella comparativa radar</h2>
              <p className="text-sm text-emerald-950/65">
                {farmBenchmark.farmLabel} · {farmBenchmark.cropType} vs cooperativa e media regionale
              </p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Dimensione</th>
                  <th className="px-4 py-3 font-medium">Azienda</th>
                  <th className="px-4 py-3 font-medium">Media coop</th>
                  <th className="px-4 py-3 font-medium">Media regionale</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkDimensions.map((dimension) => {
                  const cooperative = cooperativeBenchmarkMap.get(dimension)!;
                  return (
                    <tr key={dimension} className="border-b border-emerald-950/5 last:border-b-0">
                      <td className="px-4 py-3 font-semibold text-emerald-950">
                        {dimensionLabels[dimension]}
                      </td>
                      <td className="px-4 py-3 text-emerald-950/75">
                        {formatDimensionValue(dimension, farmBenchmark.dimensions[dimension].value)}
                      </td>
                      <td className="px-4 py-3 text-emerald-950/75">
                        {formatDimensionValue(dimension, cooperative.cooperativeAvg)}
                      </td>
                      <td className="px-4 py-3 text-emerald-950/75">
                        {formatDimensionValue(dimension, cooperative.regionalAvg)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Ranking percentili</h2>
              <p className="text-sm text-emerald-950/65">Posizionamento anonimo rispetto al gruppo</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {benchmarkDimensions.map((dimension) => (
              <article
                key={dimension}
                className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
              >
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-emerald-950">
                  <span>{dimensionLabels[dimension]}</span>
                  <span>{farmBenchmark.dimensions[dimension].percentileRank}° percentile</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700"
                    style={{ width: `${farmBenchmark.dimensions[dimension].percentileRank}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Knowledge hub</h2>
              <p className="text-sm text-emerald-950/65">Suggerimenti operativi ad alto impatto</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {knowledgeInsights.map((insight) => (
              <article
                key={insight.id}
                className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {dimensionLabels[insight.dimension]}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                      {insight.suggestion}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {insight.confidenceLevel}% confidenza
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-emerald-950">Valore attuale:</span>{" "}
                    {formatDimensionValue(insight.dimension, insight.currentValue)}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Media cooperativa:</span>{" "}
                    {formatDimensionValue(insight.dimension, insight.cooperativeAvg)}
                  </p>
                </div>
                <p className="mt-4 text-sm text-emerald-950/70">
                  <span className="font-semibold text-emerald-950">Potenziale:</span>{" "}
                  {insight.potentialImprovement}
                </p>
              </article>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Trend cooperativi</h2>
                <p className="text-sm text-emerald-950/65">Ultima stagione vs precedente</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {performanceTrends.map((trend) => (
                <div
                  key={trend.dimension}
                  className="flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                >
                  <div>
                    <p className="font-semibold text-emerald-950">{dimensionLabels[trend.dimension]}</p>
                    <p className="mt-1 text-sm text-emerald-950/65">
                      {formatDimensionValue(trend.dimension, trend.previousSeason)} → {formatDimensionValue(trend.dimension, trend.currentSeason)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${trend.deltaPercent >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                  >
                    {trend.deltaPercent > 0 ? "+" : ""}
                    {trend.deltaPercent.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Avviso privacy</h2>
                <p className="text-sm text-emerald-950/65">Condivisione dati su base opt-in</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5 text-sm leading-7 text-emerald-950/75">
              I benchmark multi-farm sono anonimizzati e pubblicati solo per aziende che hanno aderito al protocollo di condivisione dati della cooperativa. Nessun nominativo o particella catastale viene esposto in dashboard.
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
