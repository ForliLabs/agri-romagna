import {
  FlaskConical,
  Lightbulb,
  Dices,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getScenarios,
  getSimulatorStats,
  scenarioStatusClasses,
  changeVariableLabels,
  type DistributionResult,
} from "@/lib/field-simulator-data";

const stats = getSimulatorStats();
const scenarios = getScenarios();
function changeColor(change: number, inverse: boolean = false): string {
  const positive = inverse ? change < 0 : change > 0;
  return positive ? "text-emerald-700" : change === 0 ? "text-emerald-950/55" : "text-rose-700";
}

export default function SimulatorPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Simulazione
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Simulatore digital twin dei campi
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Scenari what-if con simulazione Monte Carlo: resa, ricavo, costi, acqua, carbonio e rischio. 1.000 iterazioni con distribuzione probabilistica.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Scenari totali" value={String(stats.totalScenarios)} change={`${stats.completedScenarios} completati`} trend="up" />
        <StatCard label="Score medio" value={`${stats.avgOverallScore}/100`} change="Scenario medio completato" trend="neutral" />
        <StatCard label="Campi analizzati" value={String(stats.fieldsAnalyzed)} change="Con almeno uno scenario" trend="up" />
        <StatCard label="Miglior scenario" value={stats.bestScenario.length > 30 ? stats.bestScenario.substring(0, 30) + "…" : stats.bestScenario} change="Score più alto" trend="up" />
      </section>

      {/* Scenarios */}
      {scenarios.map((scenario) => (
        <article key={scenario.id} className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                {scenario.results ? <Dices className="h-6 w-6" /> : <FlaskConical className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-emerald-950">{scenario.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scenarioStatusClasses[scenario.status]}`}>{scenario.status}</span>
                </div>
                <p className="mt-1 text-sm text-emerald-950/65">{scenario.fieldName} · Baseline: {scenario.baselineCrop} · {scenario.iterations > 0 ? `${scenario.iterations} iterazioni` : "Non ancora eseguito"}</p>
              </div>
            </div>
            {scenario.results && (
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-950">{scenario.results.overallScore}/100</p>
                <p className="text-xs text-emerald-950/55">Score complessivo</p>
              </div>
            )}
          </div>

          {/* Changes */}
          <div className="mt-4 flex flex-wrap gap-2">
            {scenario.changes.map((change, i) => (
              <div key={i} className="rounded-xl bg-[#f7f4ec] px-3 py-2 text-sm">
                <span className="text-emerald-950/55">{changeVariableLabels[change.variable]}:</span>{" "}
                <span className="text-emerald-950/75 line-through">{change.fromValue}</span>{" "}
                <span className="font-semibold text-emerald-950">→ {change.toValue}</span>
              </div>
            ))}
          </div>

          {/* Results */}
          {scenario.results && (
            <>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">Dimensione</th>
                      <th className="px-4 py-3 font-medium">Baseline</th>
                      <th className="px-4 py-3 font-medium">P10</th>
                      <th className="px-4 py-3 font-medium">P50 (mediana)</th>
                      <th className="px-4 py-3 font-medium">P90</th>
                      <th className="px-4 py-3 font-medium">Variazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      scenario.results.yieldProjection,
                      scenario.results.revenueProjection,
                      scenario.results.costProjection,
                      scenario.results.waterUseProjection,
                      scenario.results.carbonImpactProjection,
                      scenario.results.pestRiskProjection,
                    ] as DistributionResult[]).map((d) => {
                      const inverse = d.dimension === "Costo" || d.dimension === "Acqua" || d.dimension === "Carbonio" || d.dimension === "Rischio fitosanitario";
                      return (
                        <tr key={d.dimension} className="border-b border-emerald-950/5 last:border-b-0">
                          <td className="px-4 py-3 font-semibold text-emerald-950">{d.dimension}</td>
                          <td className="px-4 py-3 text-emerald-950/75">{d.baseline.toLocaleString("it-IT")} {d.unit}</td>
                          <td className="px-4 py-3 text-emerald-950/55">{d.p10.toLocaleString("it-IT")}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-950">{d.p50.toLocaleString("it-IT")}</td>
                          <td className="px-4 py-3 text-emerald-950/55">{d.p90.toLocaleString("it-IT")}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${changeColor(d.changePercent, inverse)}`}>
                              {d.changePercent > 0 ? "+" : ""}{d.changePercent}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Recommendation */}
              <div className="mt-4 rounded-2xl bg-emerald-50 p-5 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-emerald-700" />
                  <p className="text-sm font-semibold text-emerald-800">Raccomandazione</p>
                </div>
                <p className="mt-2 text-sm text-emerald-950/75">{scenario.results.recommendation}</p>
              </div>
            </>
          )}

          {!scenario.results && (
            <div className="mt-6 rounded-2xl bg-[#f7f4ec] p-8 text-center">
              <FlaskConical className="mx-auto h-10 w-10 text-emerald-950/30" />
              <p className="mt-3 text-sm text-emerald-950/55">Scenario in bozza — avvia la simulazione Monte Carlo per ottenere le proiezioni</p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
