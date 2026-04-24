import {
  Layers,
  FlaskConical,
  RotateCcw,
  TrendingUp,
  Leaf,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getSoilAnalyses,
  getNutrientBalances,
  getRotationPlans,
  getSoilCarbonTrajectories,
  getSoilHealthScores,
  nutrientStatusClasses,
} from "@/lib/soil-health-data";

const healthScores = getSoilHealthScores();
const soilAnalyses = getSoilAnalyses();
const nutrientBalances = getNutrientBalances();
const rotationPlans = getRotationPlans();
const carbonTrajectories = getSoilCarbonTrajectories();

const latestAnalyses = [...new Map(
  soilAnalyses
    .sort((a, b) => b.sampleDate.localeCompare(a.sampleDate))
    .map((s) => [s.fieldId, s])
).values()];

const avgHealth = healthScores.length > 0
  ? Math.round(healthScores.reduce((sum, s) => sum + s.overallScore, 0) / healthScores.length)
  : 0;

const nonCompliant = nutrientBalances.filter((n) => !n.nitrateDirectiveCompliant).length;

export default function SoilHealthPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Salute del suolo
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Registro salute del suolo & nutrienti
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Analisi del suolo, bilancio nutrienti NPK, pianificazione rotazioni colturali e traiettoria del carbonio organico conforme alla EU Soil Monitoring Law.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Salute media suolo" value={`${avgHealth}/100`} change="Score composito su tutti i campi" trend="up" />
        <StatCard label="Analisi registrate" value={String(soilAnalyses.length)} change={`${latestAnalyses.length} campi con analisi recente`} trend="up" />
        <StatCard label="Conformità Direttiva Nitrati" value={nonCompliant === 0 ? "Conforme" : `${nonCompliant} non conformi`} change="Limite 170 kg N/ha/anno" trend={nonCompliant > 0 ? "down" : "up"} />
        <StatCard label="SOC medio" value={`${(carbonTrajectories.reduce((s, c) => s + c.measurements[c.measurements.length - 1].socPercent, 0) / carbonTrajectories.length).toFixed(2)}%`} change="Trend in crescita" trend="up" />
      </section>

      {/* Soil Health Scores */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Score salute suolo</h2>
              <p className="text-sm text-emerald-950/65">Composito pH, sostanza organica, nutrienti, struttura</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {healthScores.filter((h) => h.overallScore > 0).map((score) => (
              <div key={score.fieldId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-950">{score.fieldName}</p>
                  <span className="text-lg font-bold text-emerald-800">{score.overallScore}/100</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[
                    { label: "pH", value: score.phScore },
                    { label: "Sost. org.", value: score.organicMatterScore },
                    { label: "Nutrienti", value: score.nutrientBalanceScore },
                    { label: "Struttura", value: score.structureScore },
                  ].map((dim) => (
                    <div key={dim.label} className="text-center">
                      <p className="text-xs text-emerald-950/55">{dim.label}</p>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-emerald-950/10">
                        <div className={`h-full rounded-full ${dim.value >= 80 ? "bg-emerald-500" : dim.value >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${dim.value}%` }} />
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-emerald-950">{dim.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Latest Soil Analyses */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Ultime analisi di laboratorio</h2>
              <p className="text-sm text-emerald-950/65">Parametri chimico-fisici per campo</p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Parametro</th>
                  {latestAnalyses.map((a) => (
                    <th key={a.id} className="px-3 py-2.5 font-medium">{a.fieldId.replace("campo-", "C.").replace("vigneto-", "V.")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["pH", "organicMatterPercent", "totalNitrogenPpm", "availablePhosphorusPpm", "exchangeablePotassiumPpm", "cec_meq100g", "textureClass"] as const).map((param) => (
                  <tr key={param} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-3 py-2.5 font-semibold text-emerald-950">
                      {param === "pH" ? "pH" : param === "organicMatterPercent" ? "S.O. %" : param === "totalNitrogenPpm" ? "N tot (ppm)" : param === "availablePhosphorusPpm" ? "P disp (ppm)" : param === "exchangeablePotassiumPpm" ? "K scamb (ppm)" : param === "cec_meq100g" ? "CEC (meq)" : "Tessitura"}
                    </td>
                    {latestAnalyses.map((a) => (
                      <td key={a.id} className="px-3 py-2.5 text-emerald-950/75">
                        {typeof a[param] === "number" ? a[param].toLocaleString("it-IT") : a[param]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Nutrient Balance */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Bilancio nutrienti NPK — Stagione 2025</h2>
            <p className="text-sm text-emerald-950/65">Input vs asporto con conformità Direttiva Nitrati (170 kg N/ha/anno)</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Campo</th>
                <th className="px-4 py-3 font-medium">N input</th>
                <th className="px-4 py-3 font-medium">N export</th>
                <th className="px-4 py-3 font-medium">N bilancio</th>
                <th className="px-4 py-3 font-medium">P bilancio</th>
                <th className="px-4 py-3 font-medium">K bilancio</th>
                <th className="px-4 py-3 font-medium">N/ha</th>
                <th className="px-4 py-3 font-medium">Nitrati</th>
              </tr>
            </thead>
            <tbody>
              {nutrientBalances.map((nb) => (
                <tr key={nb.fieldId} className="border-b border-emerald-950/5 last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-emerald-950">{nb.fieldName}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{nb.nitrogenInputKg} kg</td>
                  <td className="px-4 py-3 text-emerald-950/75">{nb.nitrogenExportKg} kg</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${nutrientStatusClasses[nb.nitrogenStatus]}`}>
                      {nb.nitrogenBalanceKg > 0 ? "+" : ""}{nb.nitrogenBalanceKg} kg
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${nutrientStatusClasses[nb.phosphorusStatus]}`}>
                      {nb.phosphorusBalanceKg > 0 ? "+" : ""}{nb.phosphorusBalanceKg} kg
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${nutrientStatusClasses[nb.potassiumStatus]}`}>
                      {nb.potassiumBalanceKg > 0 ? "+" : ""}{nb.potassiumBalanceKg} kg
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-950/75">{nb.nPerHaKg} kg</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${nb.nitrateDirectiveCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {nb.nitrateDirectiveCompliant ? "✓ Conforme" : "✗ Non conforme"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Crop Rotation & SOC */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Piani di rotazione</h2>
              <p className="text-sm text-emerald-950/65">Rotazione multi-anno con benefici stimati</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {rotationPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-emerald-950">{plan.fieldName}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${plan.capCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                    {plan.capCompliant ? "CAP conforme" : "Non conforme"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {plan.rotationYears.map((ry) => (
                    <div key={ry.year} className="rounded-xl bg-white px-3 py-2 text-center text-xs shadow-sm">
                      <p className="font-bold text-emerald-950">{ry.year}</p>
                      <p className="text-emerald-950/75">{ry.crop}</p>
                      {ry.nitrogenFixationKg > 0 && <p className="text-emerald-600">+{ry.nitrogenFixationKg}kg N</p>}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-emerald-700 font-medium">Impatto resa stimato: +{plan.projectedYieldImpactPercent}%</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Traiettoria carbonio organico</h2>
              <p className="text-sm text-emerald-950/65">SOC % multi-anno con proiezione 2030</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {carbonTrajectories.map((ct) => (
              <div key={ct.fieldId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-emerald-950">{ct.fieldName}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ct.euSoilLawCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                    EU Soil Law {ct.euSoilLawCompliant ? "✓" : "✗"}
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-1">
                  {ct.measurements.map((m) => (
                    <div key={m.year} className="flex-1 text-center">
                      <div className="mx-auto h-16 w-full max-w-[32px] rounded-t-md bg-emerald-500/80" style={{ height: `${(m.socPercent / 2.5) * 64}px` }} />
                      <p className="mt-1 text-xs font-bold text-emerald-950">{m.socPercent}%</p>
                      <p className="text-xs text-emerald-950/50">{m.year}</p>
                    </div>
                  ))}
                  <div className="flex-1 text-center opacity-50">
                    <div className="mx-auto h-16 w-full max-w-[32px] rounded-t-md border-2 border-dashed border-emerald-500" style={{ height: `${(ct.projectedSOC2030 / 2.5) * 64}px` }} />
                    <p className="mt-1 text-xs font-bold text-emerald-950">{ct.projectedSOC2030}%</p>
                    <p className="text-xs text-emerald-950/50">2030</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-emerald-700">Variazione annua: +{ct.annualChangePercent}%</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
