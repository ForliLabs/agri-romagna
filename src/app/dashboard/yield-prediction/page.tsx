import {
  CalendarDays,
  CloudSun,
  Droplets,
  Leaf,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { fields } from "@/lib/data";
import {
  cropPhenologyModels,
  getYieldPredictionSummary,
  yieldPredictions,
} from "@/lib/yield-prediction";

const summary = getYieldPredictionSummary();
const fieldMap = new Map(fields.map((field) => [field.id, field]));

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

export default function YieldPredictionPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Motore predittivo rese
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Previsioni di resa e finestre ottimali di raccolta.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Il modello integra GDD, traiettoria NDVI, meteo e umidità del suolo per suggerire il
          momento migliore di raccolta e il potenziale produttivo per ettaro.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Campi modellati"
          value={String(summary.totalFields)}
          change="Tutti gli appezzamenti principali"
          trend="up"
        />
        <StatCard
          label="Resa media prevista"
          value={`${summary.averageYieldKgHa.toLocaleString("it-IT")} kg/ha`}
          change="Media ponderata dei modelli attivi"
          trend="up"
        />
        <StatCard
          label="Vicini alla raccolta"
          value={String(summary.harvestReadySoon)}
          change="Campi oltre l'85% del target GDD"
          trend="neutral"
        />
        <StatCard
          label="Fattori di rischio elevati"
          value={String(summary.fieldsWithElevatedRisk)}
          change="Campi con più di un rischio nel breve"
          trend="neutral"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {yieldPredictions.map((prediction) => {
          const field = fieldMap.get(prediction.fieldId);
          return (
            <article
              key={prediction.fieldId}
              className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {prediction.crop}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-emerald-950">{field?.name}</h2>
                  <p className="mt-1 text-sm text-emerald-950/65">{prediction.phenologicalStage}</p>
                </div>
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl bg-emerald-950 p-5 text-white">
                  <p className="text-sm text-emerald-50/75">Resa attesa</p>
                  <p className="mt-4 text-4xl font-black tracking-tight">
                    {prediction.predictedYieldKgHa.toLocaleString("it-IT")}
                  </p>
                  <p className="mt-1 text-sm text-emerald-50/70">kg/ha</p>
                  <p className="mt-4 text-sm text-emerald-50/75">
                    Intervallo {prediction.confidenceInterval.min.toLocaleString("it-IT")} – {prediction.confidenceInterval.max.toLocaleString("it-IT")} kg/ha
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CalendarDays className="h-4 w-4" />
                      <p className="text-sm font-semibold text-emerald-950">Finestra raccolta</p>
                    </div>
                    <p className="mt-3 text-lg font-bold text-emerald-950">
                      {dateFormatter.format(new Date(prediction.optimalHarvestWindow.start))} – {dateFormatter.format(new Date(prediction.optimalHarvestWindow.end))}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Leaf className="h-4 w-4" />
                        <p className="text-sm font-semibold text-emerald-950">NDVI</p>
                      </div>
                      <p className="mt-3 text-lg font-bold text-emerald-950">
                        {prediction.ndviTrajectory.currentNDVI.toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm text-emerald-950/65">
                        {prediction.ndviTrajectory.trend.replace("_", " ")} · {prediction.ndviTrajectory.deviationPercent > 0 ? "+" : ""}{prediction.ndviTrajectory.deviationPercent}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Droplets className="h-4 w-4" />
                        <p className="text-sm font-semibold text-emerald-950">Umidità suolo</p>
                      </div>
                      <p className="mt-3 text-lg font-bold text-emerald-950">
                        {prediction.soilMoisturePercent.toLocaleString("it-IT")}%
                      </p>
                      <p className="mt-1 text-sm text-emerald-950/65">Segnale usato nel calcolo finale</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-medium text-emerald-950">
                  <span>Accumulo GDD</span>
                  <span>
                    {prediction.accumulatedGDD} / {prediction.targetGDD} · {prediction.gddProgressPercent}%
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700"
                    style={{ width: `${Math.min(100, prediction.gddProgressPercent)}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CloudSun className="h-4 w-4" />
                  <p className="text-sm font-semibold text-emerald-950">Fattori di rischio</p>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-emerald-950/75">
                  {prediction.riskFactors.map((risk) => (
                    <li key={risk} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Modelli fenologici di riferimento</h2>
            <p className="text-sm text-emerald-950/65">Soglie GDD e stadi BBCH semplificati usati dall&apos;engine</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cropPhenologyModels.map((model) => (
            <article key={model.crop} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <h3 className="text-lg font-semibold text-emerald-950">{model.crop}</h3>
              <p className="mt-2 text-sm text-emerald-950/70">Base termica {model.baseTemp}°C · target {model.targetGDD} GDD</p>
              <p className="mt-2 text-sm text-emerald-950/70">
                Resa tipica {model.typicalYieldKgHa.toLocaleString("it-IT")} kg/ha
              </p>
              <ul className="mt-4 space-y-2 text-sm text-emerald-950/75">
                {model.stages.map((stage) => (
                  <li key={stage.code} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                    <span className="font-semibold text-emerald-950">{stage.code}</span> · {stage.label}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
