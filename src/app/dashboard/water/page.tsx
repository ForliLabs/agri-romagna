import {
  Droplets,
  Gauge,
  Sprout,
  Waves,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { fields } from "@/lib/data";
import {
  calculateCropWaterNeed,
  calculateET0,
  getIrrigationRecommendation,
  getWaterEfficiencyMetrics,
  getWaterQuotaStatus,
  irrigationSchedules,
  soilWaterBalances,
} from "@/lib/water-management-data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

const et0 = calculateET0();
const quotaStatus = getWaterQuotaStatus();
const cropWaterNeeds = fields
  .map((field) => calculateCropWaterNeed(field.id))
  .filter((item): item is NonNullable<ReturnType<typeof calculateCropWaterNeed>> => Boolean(item));
const irrigationRecommendations = fields
  .map((field) => getIrrigationRecommendation(field.id))
  .filter((item): item is NonNullable<ReturnType<typeof getIrrigationRecommendation>> => Boolean(item));
const efficiencyMetrics = getWaterEfficiencyMetrics();
const averageNeed = Number(
  (
    cropWaterNeeds.reduce((total, item) => total + item.dailyNeedMm, 0) / cropWaterNeeds.length
  ).toFixed(1)
);
const averageEfficiency = Number(
  (
    efficiencyMetrics.reduce((total, item) => total + item.waterUseEfficiency, 0) /
    efficiencyMetrics.length
  ).toFixed(2)
);

const stressClasses = {
  basso: "bg-emerald-100 text-emerald-800",
  moderato: "bg-sky-100 text-sky-800",
  alto: "bg-amber-100 text-amber-800",
  critico: "bg-rose-100 text-rose-800",
};

const scheduleClasses = {
  scheduled: "bg-sky-100 text-sky-800",
  completed: "bg-emerald-100 text-emerald-800",
  skipped: "bg-amber-100 text-amber-800",
};

const stageLabels = {
  initial: "Iniziale",
  development: "Sviluppo",
  mid_season: "Piena stagione",
  late_season: "Finale",
};

export default function WaterPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Gestione idrica
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Quota acqua, irrigazione e fabbisogno colturale sotto controllo.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Intelligence irrigua con ET₀ giornaliera, coefficienti colturali e bilancio idrico per tutti gli appezzamenti aziendali.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Quota utilizzata"
          value={`${quotaStatus.usedPercent}%`}
          change={`${quotaStatus.usedM3.toLocaleString("it-IT")} m³ su ${quotaStatus.annualAllocationM3.toLocaleString("it-IT")} m³`}
          trend="neutral"
        />
        <StatCard
          label="ET₀ odierna"
          value={`${et0.toLocaleString("it-IT")} mm/g`}
          change="Metodo Hargreaves semplificato"
          trend="up"
        />
        <StatCard
          label="Fabbisogno medio"
          value={`${averageNeed.toLocaleString("it-IT")} mm/g`}
          change="Media su 4 appezzamenti"
          trend="up"
        />
        <StatCard
          label="Efficienza media"
          value={`${averageEfficiency.toLocaleString("it-IT")} kg/m³`}
          change="Riferita alla resa attesa"
          trend="up"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Quota idrica aziendale</h2>
              <p className="text-sm text-emerald-950/65">Consorzio di Bonifica della Romagna</p>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-950/60">Utilizzo corrente</p>
                <p className="mt-2 text-4xl font-black tracking-tight text-emerald-950">
                  {quotaStatus.usedPercent}%
                </p>
              </div>
              <div className="text-right text-sm text-emerald-950/70">
                <p>Residuo {quotaStatus.remainingM3.toLocaleString("it-IT")} m³</p>
                <p className="mt-1">Proiezione fine stagione {quotaStatus.projectedEndSeasonM3.toLocaleString("it-IT")} m³</p>
              </div>
            </div>
            <div className="mt-5 h-4 overflow-hidden rounded-full bg-emerald-950/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-500"
                style={{ width: `${quotaStatus.usedPercent}%` }}
              />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-emerald-950">Usati:</span>{" "}
                {quotaStatus.usedM3.toLocaleString("it-IT")} m³
              </p>
              <p>
                <span className="font-semibold text-emerald-950">Disponibili:</span>{" "}
                {quotaStatus.remainingM3.toLocaleString("it-IT")} m³
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">ET₀ e domanda colturale</h2>
              <p className="text-sm text-emerald-950/65">Coefficiente Kc per stadio fenologico</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {cropWaterNeeds.map((need) => (
              <article
                key={need.fieldId}
                className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">{need.fieldName}</h3>
                    <p className="mt-1 text-sm text-emerald-950/65">{need.crop}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {stageLabels[need.stage]}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-emerald-950">Kc:</span> {need.kc.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">ET₀:</span> {need.et0Mm.toLocaleString("it-IT")} mm/g
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Fabbisogno:</span> {need.dailyNeedMm.toLocaleString("it-IT")} mm/g
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Volume:</span> {need.dailyVolumeM3.toLocaleString("it-IT")} m³/g
                  </p>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Programma irriguo per campo</h2>
            <p className="text-sm text-emerald-950/65">Turni, raccomandazioni e metodo applicativo</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {irrigationRecommendations.map((recommendation) => {
            const schedule = irrigationSchedules.find((item) => item.fieldId === recommendation.fieldId);
            return (
              <article
                key={recommendation.fieldId}
                className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">{recommendation.fieldName}</h3>
                    <p className="mt-1 text-sm text-emerald-950/65">{recommendation.method}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${scheduleClasses[recommendation.scheduleStatus]}`}
                  >
                    {recommendation.scheduleStatus}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-emerald-950">Data:</span>{" "}
                    {schedule ? dateFormatter.format(new Date(schedule.date)) : "Da definire"}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Turno consigliato:</span>{" "}
                    {recommendation.recommendedMm.toLocaleString("it-IT")} mm
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Intervento reale:</span>{" "}
                    {schedule?.actualMm.toLocaleString("it-IT") ?? "0"} mm
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Volume stimato:</span>{" "}
                    {recommendation.estimatedVolumeM3.toLocaleString("it-IT")} m³
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-emerald-950/75">{recommendation.recommendation}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-emerald-950/50">
                  {recommendation.reason}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Waves className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Bilancio idrico del suolo</h2>
              <p className="text-sm text-emerald-950/65">Capacità di campo, deplezione e stress</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {soilWaterBalances.map((balance) => {
              const field = fields.find((item) => item.id === balance.fieldId);
              return (
                <article
                  key={balance.fieldId}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-950">{field?.name}</h3>
                      <p className="mt-1 text-sm text-emerald-950/65">Umidità attuale {balance.currentMoistureMm} mm</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${stressClasses[balance.stressLevel]}`}
                    >
                      {balance.stressLevel}
                    </span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-500"
                      style={{ width: `${100 - balance.depletionPercent}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-emerald-950">Acqua disponibile:</span>{" "}
                      {balance.availableWaterMm} mm
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Deplezione:</span>{" "}
                      {balance.depletionPercent}%
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Efficienza d&apos;uso dell&apos;acqua</h2>
              <p className="text-sm text-emerald-950/65">Kg prodotti per metro cubo impiegato</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {efficiencyMetrics.map((metric) => {
              const field = fields.find((item) => item.id === metric.fieldId);
              return (
                <article
                  key={metric.fieldId}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-950">{field?.name}</h3>
                      <p className="mt-1 text-sm text-emerald-950/65">Resa attesa {metric.yieldKg.toLocaleString("it-IT")} kg</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                      {metric.waterUseEfficiency.toLocaleString("it-IT")} kg/m³
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-emerald-950/75">
                    Acqua impiegata {metric.waterUsedM3.toLocaleString("it-IT")} m³
                  </p>
                </article>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
