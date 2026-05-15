import Link from "next/link";
import {
  CloudSun,
  Clock3,
  MapPinned,
  TriangleAlert,
  TrendingUp,
  Leaf,
  ShieldCheck,
  Banknote,
  CalendarClock,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { fields, harvestSchedule, recentActivity, weatherData } from "@/lib/data";
import { getCooperativePL, getCashFlowProjection } from "@/lib/financial-data";
import { getComplianceSummary, getUpcomingDeadlines, complianceRecords } from "@/lib/compliance-data";
import { getYieldPredictionSummary } from "@/lib/yield-prediction";
import { getCooperativeCarbonSummary, getCarbonByCategory, getCarbonComplianceReadiness } from "@/lib/carbon-data";
import { fetchCurrentWeather, fetchForecast, fetchRiverLevels, generateWeatherAlerts } from "@/lib/weather-service";
import { getConfirmedActions } from "@/lib/confirmed-actions";
import { DashboardCharts } from "./dashboard-charts";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const nextHarvest = [...harvestSchedule].sort((a, b) =>
  a.plannedDate.localeCompare(b.plannedDate)
)[0];

export default async function DashboardPage() {
  // Fetch live data in parallel (forecast & rivers first, then derive alerts)
  const [currentWeather, forecast, rivers] = await Promise.all([
    fetchCurrentWeather(),
    fetchForecast(),
    fetchRiverLevels(),
  ]);
  const alerts = await generateWeatherAlerts({ forecast, rivers });

  // Domain summaries (synchronous, from seed data)
  const pl = getCooperativePL();
  const cashFlow = getCashFlowProjection();
  const compliance = getComplianceSummary(complianceRecords);
  const upcomingDeadlines = getUpcomingDeadlines(complianceRecords, 14);
  const yieldSummary = getYieldPredictionSummary();
  const carbonSummary = getCooperativeCarbonSummary();
  const carbonCategories = getCarbonByCategory();
  const carbonReadiness = getCarbonComplianceReadiness();
  const confirmedActions = await getConfirmedActions();

  const activeAlerts = alerts.filter((a) => a.severity !== "bassa");
  const forecastForDisplay = forecast.length > 0 ? forecast : weatherData.forecast;
  const weatherUsingFallback = forecast.length === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Dashboard direzionale
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            Panoramica cooperativa
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
            Sintesi finanziaria, produttiva, ambientale e normativa per la Romagna forlivese.
            Dati meteo aggiornati in tempo reale.
          </p>
        </div>
      </section>

      {/* KPI row */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Margine netto"
          value={euroFormatter.format(pl.netMargin)}
          change={`${pl.netMarginPercent >= 0 ? "+" : ""}${pl.netMarginPercent.toFixed(1)}% sul fatturato`}
          trend={pl.netMargin >= 0 ? "up" : "down"}
          interpretation={
            pl.netMargin >= 0
              ? "Margine sano — valuta investimenti in meccanizzazione o certificazioni."
              : "Margine negativo — rivedi costi operativi e sussidi PAC disponibili."
          }
          actionHref="/dashboard/financial"
          actionLabel="Apri conto economico"
        />
        <StatCard
          label="Resa media prevista"
          value={`${yieldSummary.averageYieldKgHa.toLocaleString("it-IT")} kg/ha`}
          change={`${yieldSummary.harvestReadySoon} campi pronti alla raccolta`}
          trend="up"
          interpretation={
            yieldSummary.fieldsWithElevatedRisk > 0
              ? `${yieldSummary.fieldsWithElevatedRisk} camp${yieldSummary.fieldsWithElevatedRisk === 1 ? "o" : "i"} a rischio — verifica irrigazione e fitosanitario.`
              : "Rese nella norma — nessun intervento urgente richiesto."
          }
          actionHref="/dashboard/fields"
          actionLabel="Vedi campi"
        />
        <StatCard
          label="Bilancio CO₂"
          value={`${(carbonSummary.netCarbonKg / 1000).toFixed(1)} t`}
          change={carbonSummary.netCarbonKg <= 0 ? "Carbon-negative ✓" : `${carbonSummary.intensityKgPerHa.toFixed(0)} kg/ha`}
          trend={carbonSummary.netCarbonKg <= 0 ? "up" : "neutral"}
          interpretation={
            carbonSummary.netCarbonKg <= 0
              ? "Obiettivo carbon-negative raggiunto — idoneo a crediti di carbonio."
              : "Emissioni nette positive — valuta pratiche rigenerative per compensare."
          }
          actionHref="/dashboard/carbon"
          actionLabel="Dettaglio emissioni"
        />
        <StatCard
          label="Conformità normativa"
          value={`${compliance.completionRate}%`}
          change={`${compliance.scaduto} scadut${compliance.scaduto === 1 ? "o" : "i"} · ${compliance.inCorso} in corso`}
          trend={compliance.scaduto === 0 ? "up" : "down"}
          interpretation={
            compliance.scaduto > 0
              ? "Ci sono scadenze superate — intervieni per evitare sanzioni."
              : compliance.inCorso > 0
                ? "Nessuna scadenza superata — completa le pratiche in corso."
                : "Piena conformità — nessuna azione richiesta."
          }
          actionHref="/dashboard/compliance"
          actionLabel="Gestisci scadenze"
        />
      </section>

      {/* Weather + Finance row */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Live weather card */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Meteo operativo
              </p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-950">
                {currentWeather.location} · {currentWeather.condition}
              </h2>
              <p
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  weatherUsingFallback
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {weatherUsingFallback
                  ? "OpenMeteo non disponibile · scenario locale stimato"
                  : "Live · aggiornato in tempo reale"}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <CloudSun className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-emerald-950 p-5 text-white">
              <p className="text-sm text-emerald-50/75">{currentWeather.condition}</p>
              <p className="mt-4 text-5xl font-black tracking-tight">{currentWeather.temperatureC}°</p>
              <p className="mt-2 text-sm text-emerald-50/75">
                Osservazione delle{" "}
                {new Date(currentWeather.observedAt).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Umidità</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{currentWeather.humidity}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Vento</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{currentWeather.windKmh} km/h</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Prob. pioggia</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{currentWeather.precipitationChance}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Pressione</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{currentWeather.pressureHpa} hPa</p>
              </div>
            </div>
          </div>
          {/* Inline alerts */}
          {activeAlerts.length > 0 && (
            <div className="mt-4 space-y-2">
              {activeAlerts.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  role="alert"
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium ${
                    alert.severity === "alta"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <TriangleAlert className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="sr-only">Severità {alert.severity}:</span>
                  {alert.title}
                </div>
              ))}
            </div>
          )}
          {/* River levels compact */}
          {rivers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {rivers.map((river) => (
                <div
                  key={river.name}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    river.status === "normale"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  <Droplets className="h-4 w-4" />
                  {river.name}: {river.levelMeters.toFixed(2)} m · {river.trend}
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Financial summary card */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Finanze cooperativa
              </p>
              <h2 className="text-2xl font-bold text-emerald-950">Conto economico</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <p className="text-sm text-emerald-950/60">Ricavi totali</p>
              <p className="mt-2 text-2xl font-bold text-emerald-950">{euroFormatter.format(pl.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <p className="text-sm text-emerald-950/60">Costi totali</p>
              <p className="mt-2 text-2xl font-bold text-emerald-950">{euroFormatter.format(pl.totalCosts)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <p className="text-sm text-emerald-950/60">Sussidi PAC</p>
              <p className="mt-2 text-2xl font-bold text-emerald-950">{euroFormatter.format(pl.capSubsidies)}</p>
            </div>
            <div className={`rounded-2xl p-4 ${pl.netMargin >= 0 ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
              <p className="text-sm text-emerald-950/60">Margine netto</p>
              <p className={`mt-2 text-2xl font-bold ${pl.netMargin >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {euroFormatter.format(pl.netMargin)}
              </p>
            </div>
          </div>
          {/* Cost breakdown summary */}
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950/50 mb-3">
              Distribuzione costi
            </p>
            <div className="space-y-2">
              {pl.costBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-950/80">{cat.label}</span>
                      <span className="font-medium text-emerald-950">{cat.sharePercent.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-emerald-100">
                      <div
                        role="progressbar"
                        aria-valuenow={Math.round(cat.sharePercent)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${cat.label}: ${cat.sharePercent.toFixed(0)}%`}
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${Math.min(cat.sharePercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* Yield + Carbon + Compliance row */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Yield predictions */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-lime-100 p-3 text-lime-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Produzione</p>
              <h2 className="text-xl font-bold text-emerald-950">Rese previste</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <p className="text-sm text-emerald-950/60">Resa media</p>
              <p className="mt-1 text-3xl font-bold text-emerald-950">
                {yieldSummary.averageYieldKgHa.toLocaleString("it-IT")} <span className="text-lg font-normal text-emerald-950/60">kg/ha</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Campi totali</p>
                <p className="mt-1 text-2xl font-bold text-emerald-950">{yieldSummary.totalFields}</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Pronti alla raccolta</p>
                <p className="mt-1 text-2xl font-bold text-emerald-950">{yieldSummary.harvestReadySoon}</p>
              </div>
            </div>
            {yieldSummary.fieldsWithElevatedRisk > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
                <TriangleAlert className="h-4 w-4" />
                {yieldSummary.fieldsWithElevatedRisk} camp{yieldSummary.fieldsWithElevatedRisk === 1 ? "o" : "i"} con rischio elevato
              </div>
            )}
          </div>
        </article>

        {/* Carbon summary */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Ambiente</p>
              <h2 className="text-xl font-bold text-emerald-950">Bilancio carbonico</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Emissioni</p>
                <p className="mt-1 text-lg font-bold text-amber-700">
                  {(carbonSummary.totalEmissionsKg / 1000).toFixed(1)} t
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Sequestro</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">
                  {(carbonSummary.totalSequestrationKg / 1000).toFixed(1)} t
                </p>
              </div>
            </div>
            <div className={`rounded-2xl p-4 ${carbonSummary.netCarbonKg <= 0 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className="text-sm text-emerald-950/60">Netto CO₂e</p>
              <p className={`mt-1 text-2xl font-bold ${carbonSummary.netCarbonKg <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                {(carbonSummary.netCarbonKg / 1000).toFixed(1)} t
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-950/60">Prontezza compliance</span>
                <span className="font-bold text-emerald-950">{carbonReadiness.readinessPercent}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-emerald-100">
                <div
                  role="progressbar"
                  aria-valuenow={carbonReadiness.readinessPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Prontezza compliance: ${carbonReadiness.readinessPercent}%`}
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${carbonReadiness.readinessPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-emerald-950/50">{carbonReadiness.note}</p>
            </div>
          </div>
        </article>

        {/* Compliance summary */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Normativa</p>
              <h2 className="text-xl font-bold text-emerald-950">Stato conformità</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-emerald-950/60">Tasso di conformità</p>
                <p className="text-2xl font-bold text-emerald-950">{compliance.completionRate}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-emerald-100">
                <div
                  role="progressbar"
                  aria-valuenow={compliance.completionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Tasso di conformità: ${compliance.completionRate}%`}
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${compliance.completionRate}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Conformi</p>
                <p className="mt-1 text-xl font-bold text-emerald-700">{compliance.conforme}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">In corso</p>
                <p className="mt-1 text-xl font-bold text-amber-700">{compliance.inCorso}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                <p className="text-xs text-rose-700">Scaduti</p>
                <p className="mt-1 text-xl font-bold text-rose-700">{compliance.scaduto}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Da completare</p>
                <p className="mt-1 text-xl font-bold text-slate-700">{compliance.daCompletare}</p>
              </div>
            </div>
            {/* Upcoming deadlines */}
            {upcomingDeadlines.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950/50 mb-2">
                  Scadenze prossime 14 giorni
                </p>
                <div className="space-y-2">
                  {upcomingDeadlines.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-emerald-950/10 bg-[#f7f4ec] px-3 py-2 text-sm">
                      <span className="text-emerald-950/80 truncate mr-2">{d.title}</span>
                      <span className="flex-shrink-0 text-xs font-medium text-emerald-950/50">
                        {dateFormatter.format(new Date(d.dueDate))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Charts row */}
      <DashboardCharts
        cashFlow={cashFlow.map((cf) => ({
          month: cf.month,
          inflows: cf.inflows,
          outflows: cf.outflows,
          netCashFlow: cf.netCashFlow,
          cumulativeCash: cf.cumulativeCash,
        }))}
        carbon={carbonCategories.map((cc) => ({
          label: cc.label,
          emissionsKg: cc.emissionsKg,
          sequestrationKg: cc.sequestrationKg,
          netCarbonKg: cc.netCarbonKg,
        }))}
        forecast={forecastForDisplay.map((f) => ({
          day: f.day,
          maxC: f.maxC,
          minC: f.minC,
          rainProbability: f.rainProbability,
        }))}
      />

      {/* Activity feed + Fields */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Clock3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Attività recenti
              </p>
              <h2 className="text-2xl font-bold text-emerald-950">Feed operativo</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-emerald-950">{item.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {item.tag}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-emerald-950/70">{item.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-950/50">
                  <Clock3 className="h-3.5 w-3.5" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <MapPinned className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Prossima raccolta
                </p>
                <h2 className="text-2xl font-bold text-emerald-950">
                  {dateFormatter.format(new Date(nextHarvest.plannedDate))} · {nextHarvest.crop}
                </h2>
              </div>
            </div>
            <Link
              href="/dashboard/fields"
              className="inline-flex rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              Vedi tutti i campi
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {fields.slice(0, 4).map((field) => (
              <article key={field.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">{field.name}</h3>
                    <p className="mt-1 text-sm text-emerald-950/65">
                      {field.crop} · {field.areaHa.toLocaleString("it-IT")} ha
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {field.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-950/75">{field.health}</p>
                <p className="mt-2 text-xs text-emerald-950/50">
                  <CalendarClock className="mr-1 inline h-3.5 w-3.5" />
                  Raccolta stimata: {dateFormatter.format(new Date(field.expectedHarvest))}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>

      {/* Confirmed workflow actions */}
      <section>
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Azioni confermate
              </p>
              <h2 className="text-2xl font-bold text-emerald-950">Workflow operativi attivi</h2>
            </div>
          </div>
          {confirmedActions.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {confirmedActions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-emerald-950">{action.workflow}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        action.status === "pianificata"
                          ? "bg-sky-100 text-sky-800"
                          : action.status === "completata"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {action.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-emerald-950/70">
                    {action.recommendation}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-950/50">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                    {action.recommendedDay} · confermata da {action.confirmedBy}
                  </div>
                  <p className="mt-1 text-xs text-emerald-950/45">
                    Registrata il {dateTimeFormatter.format(new Date(action.confirmedAt))}
                  </p>
                  {action.note && (
                    <p className="mt-2 text-xs italic text-emerald-950/55">{action.note}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-emerald-950/15 bg-[#f7f4ec] p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-950/25" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-emerald-950/60">
                Nessuna azione confermata
              </p>
              <p className="mt-1 text-xs text-emerald-950/45">
                Conferma le azioni raccomandate dalla pagina meteo per vederle qui con operatore e orario di presa in carico.
              </p>
              <Link
                href="/dashboard/weather"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-600"
              >
                <CloudSun className="h-4 w-4" aria-hidden="true" />
                Vai a Meteo e finestre operative
              </Link>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
