import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Droplets,
  Bug,
  Radio,
  ShieldCheck,
  TrendingUp,
  CloudSun,
  Satellite,
  CalendarClock,
  Activity,
} from "lucide-react";
import { fields, weatherData } from "@/lib/data";
import { fieldOperationalPriorities, deriveWeatherWorkflowWindows } from "@/lib/operations-insights";
import { generateIrrigationRecommendation, getFieldIrrigationProfile } from "@/lib/precision-irrigation";
import { getFieldDiseaseRisks } from "@/lib/pest-warning-data";
import { sensorDevices, getLatestReadings, sensorTypeLabels } from "@/lib/iot-data";
import { complianceRecords } from "@/lib/compliance-data";
import { predictYield } from "@/lib/yield-prediction";
import { EmptyState } from "@/components/ui/states";
import { getLatestNDVIByField, ndviReadings, ndviToColor, healthStatusLabel } from "@/lib/satellite-data";
import { fetchForecast, fetchRiverLevels } from "@/lib/weather-service";

const fieldMap = new Map(fields.map((f) => [f.id, f]));
const priorityMap = new Map(fieldOperationalPriorities.map((p) => [p.fieldId, p]));
const latestNDVI = getLatestNDVIByField(ndviReadings);
const latestSensorReadings = getLatestReadings();

const fullDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ fieldId: string }>;
}) {
  const { fieldId } = await params;
  const field = fieldMap.get(fieldId);
  if (!field) return notFound();

  const priority = priorityMap.get(fieldId);
  const irrigation = generateIrrigationRecommendation(field);
  const irrigationProfile = getFieldIrrigationProfile(field);
  const diseaseRisks = getFieldDiseaseRisks(fieldId);
  const fieldSensors = sensorDevices.filter((s) => s.fieldId === fieldId);
  const fieldCompliance = complianceRecords.filter((r) => r.fieldId === fieldId);
  const yieldPrediction = predictYield(fieldId);
  const ndviReading = latestNDVI.get(fieldId);

  // Live weather-derived workflow windows
  const [forecast, rivers] = await Promise.all([fetchForecast(), fetchRiverLevels()]);
  const workflowWindows = deriveWeatherWorkflowWindows(
    forecast.length > 0 ? forecast : [],
    rivers,
  );

  const now = new Date(weatherData.current.observedAt);
  const daysUntilHarvest = Math.ceil(
    (new Date(field.expectedHarvest).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <Link
          href="/dashboard/fields"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna all&apos;elenco campi
        </Link>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Cockpit operativo
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          {field.name}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          {field.crop} · {field.municipality} · {field.areaHa.toLocaleString("it-IT")} ha ·{" "}
          {field.status}
        </p>
      </section>

      {/* Executive summary banner */}
      <section
        className={`rounded-3xl border p-5 ${
          priority?.severity === "alta"
            ? "border-rose-200 bg-rose-50"
            : priority?.severity === "media"
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`rounded-2xl p-3 ${
            priority?.severity === "alta"
              ? "bg-rose-100 text-rose-700"
              : priority?.severity === "media"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
          }`}>
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-950">
              Sintesi: {field.name}
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-950/75">
              {daysUntilHarvest > 0
                ? `${daysUntilHarvest} giorni alla raccolta.`
                : "Campo pronto alla raccolta."}{" "}
              Resa prevista {yieldPrediction.predictedYieldKgHa.toLocaleString("it-IT")} kg/ha.{" "}
              {irrigation.decision === "irrigare" || irrigation.decision === "emergenza"
                ? `Irrigazione consigliata (${irrigation.volumeLiters.toLocaleString("it-IT")} L).`
                : "Nessuna irrigazione urgente."}{" "}
              {diseaseRisks.filter((r) => r.riskLevel === "critical" || r.riskLevel === "high").length > 0
                ? `${diseaseRisks.filter((r) => r.riskLevel === "critical" || r.riskLevel === "high").length} rischio/i fitosanitario/i elevato/i.`
                : "Nessun rischio fitosanitario critico."}{" "}
              {priority?.title ?? "Monitoraggio di routine."}
            </p>
          </div>
        </div>
      </section>

      {/* KPI row */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-emerald-950/10 bg-white/90 p-4 shadow-sm shadow-emerald-950/5">
          <p className="text-sm text-emerald-950/60">Giorni alla raccolta</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">
            {daysUntilHarvest > 0 ? daysUntilHarvest : "Pronto"}
          </p>
          <p className="mt-1 text-xs text-emerald-950/55">
            {fullDateFormatter.format(new Date(field.expectedHarvest))}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-950/10 bg-white/90 p-4 shadow-sm shadow-emerald-950/5">
          <p className="text-sm text-emerald-950/60">Resa prevista</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">
            {yieldPrediction.predictedYieldKgHa.toLocaleString("it-IT")}{" "}
            <span className="text-lg font-normal text-emerald-950/60">kg/ha</span>
          </p>
          <p className="mt-1 text-xs text-emerald-950/55">
            Intervallo {yieldPrediction.confidenceInterval.min.toLocaleString("it-IT")}–{yieldPrediction.confidenceInterval.max.toLocaleString("it-IT")} kg/ha
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-950/10 bg-white/90 p-4 shadow-sm shadow-emerald-950/5">
          <p className="text-sm text-emerald-950/60">Sensori attivi</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">
            {fieldSensors.filter((s) => s.status === "online").length}/{fieldSensors.length}
          </p>
          <p className="mt-1 text-xs text-emerald-950/55">
            {fieldSensors.length === 0 ? "Nessun sensore" : "Presidio IoT"}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-950/10 bg-white/90 p-4 shadow-sm shadow-emerald-950/5">
          <p className="text-sm text-emerald-950/60">Irrigazione</p>
          <p className={`mt-2 text-lg font-bold ${
            irrigation.decision === "irrigare" || irrigation.decision === "emergenza"
              ? "text-sky-700"
              : irrigation.decision === "sospendere"
                ? "text-rose-700"
                : "text-emerald-700"
          }`}>
            {irrigation.decision.charAt(0).toUpperCase() + irrigation.decision.slice(1)}
          </p>
          <p className="mt-1 text-xs text-emerald-950/55">
            Risparmio idrico {irrigation.waterSavingsPercent}%
          </p>
        </div>
      </section>

      {/* Priority + NDVI row */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Operational priority */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Priorità operativa</h2>
              <p className="text-sm text-emerald-950/65">Prossima azione raccomandata</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-emerald-950">
                {priority?.title ?? "Monitoraggio di routine"}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  priority?.severity === "alta"
                    ? "bg-rose-100 text-rose-700"
                    : priority?.severity === "media"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {priority?.severity ?? "bassa"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-emerald-950/70">
              {priority?.detail ?? field.health}
            </p>
            <p className="mt-3 text-xs font-semibold text-emerald-950">
              {priority?.dueLabel ?? "Riesame settimanale"}
            </p>
            {priority?.relatedModules && (
              <div className="mt-3 flex flex-wrap gap-2">
                {priority.relatedModules.map((mod) => (
                  <span
                    key={mod}
                    className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-emerald-800 shadow-sm"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* NDVI / Satellite */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Satellite className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Vigore vegetativo</h2>
              <p className="text-sm text-emerald-950/65">NDVI e stato satellite</p>
            </div>
          </div>
          {ndviReading ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 rounded-2xl"
                  style={{ backgroundColor: ndviToColor(ndviReading.meanNDVI) }}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-3xl font-bold text-emerald-950">
                    {ndviReading.meanNDVI.toFixed(2)}
                  </p>
                  <p className="text-sm text-emerald-950/65">
                    {healthStatusLabel(ndviReading.healthStatus)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-3">
                  <p className="text-xs text-emerald-950/60">Min NDVI</p>
                  <p className="mt-1 font-bold text-emerald-950">
                    {ndviReading.minNDVI.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-3">
                  <p className="text-xs text-emerald-950/60">Max NDVI</p>
                  <p className="mt-1 font-bold text-emerald-950">
                    {ndviReading.maxNDVI.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Nessun rilievo NDVI"
              description="Non sono disponibili rilevazioni satellitari recenti per questo appezzamento. Il prossimo passaggio Sentinel-2 aggiornerà i dati."
              icon={<Satellite className="h-7 w-7" aria-hidden="true" />}
            />
          )}
        </article>
      </section>

      {/* Irrigation + Pest/Disease row */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Precision irrigation */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Irrigazione di precisione</h2>
              <p className="text-sm text-emerald-950/65">Raccomandazione e profilo idrico</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-emerald-950/60">Decisione</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  irrigation.decision === "irrigare" ? "bg-sky-100 text-sky-800"
                    : irrigation.decision === "emergenza" ? "bg-rose-100 text-rose-700"
                    : irrigation.decision === "sospendere" ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-800"
                }`}>
                  {irrigation.decision}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-950/70">
                {irrigation.reasoning.soilMoistureStatus}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-3">
                <p className="text-xs text-emerald-950/60">Volume stimato</p>
                <p className="mt-1 font-bold text-emerald-950">
                  {irrigation.volumeLiters.toLocaleString("it-IT")} L
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-3">
                <p className="text-xs text-emerald-950/60">Durata</p>
                <p className="mt-1 font-bold text-emerald-950">
                  {irrigation.durationMinutes} min
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-3">
                <p className="text-xs text-emerald-950/60">Fase coltura</p>
                <p className="mt-1 font-bold text-emerald-950">
                  {irrigationProfile.currentPhase.replace(/_/g, " ")}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-3">
                <p className="text-xs text-emerald-950/60">Confidenza</p>
                <p className="mt-1 font-bold text-emerald-950">{irrigation.confidence}%</p>
              </div>
            </div>
          </div>
        </article>

        {/* Pest & disease */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Bug className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Fitosanitario</h2>
              <p className="text-sm text-emerald-950/65">Rischi patogeni e trattamenti</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {diseaseRisks.length > 0 ? (
              diseaseRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-emerald-950">{risk.disease}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        risk.riskLevel === "critical" || risk.riskLevel === "high"
                          ? "bg-rose-100 text-rose-700"
                          : risk.riskLevel === "moderate"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {risk.riskLevel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-950/70">
                    Pressione: {risk.pressureScore}/100
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {risk.triggerFactors.map((factor) => (
                      <span
                        key={factor}
                        className="rounded-full bg-white px-2 py-0.5 text-xs text-emerald-950/65"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Nessun rischio fitosanitario"
                description="Non sono stati rilevati rischi patogeni significativi per questo campo. Continua il monitoraggio preventivo."
                icon={<Bug className="h-7 w-7" aria-hidden="true" />}
              />
            )}
          </div>
        </article>
      </section>

      {/* IoT + Compliance row */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* IoT sensors */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Sensori IoT</h2>
              <p className="text-sm text-emerald-950/65">
                {fieldSensors.length} dispositiv{fieldSensors.length === 1 ? "o" : "i"} sul campo
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {fieldSensors.length > 0 ? (
              fieldSensors.map((sensor) => {
                const reading = latestSensorReadings.get(sensor.id);
                return (
                  <div
                    key={sensor.id}
                    className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-emerald-950">{sensor.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          sensor.status === "online"
                            ? "bg-emerald-50 text-emerald-800"
                            : sensor.status === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {sensor.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-emerald-950/70">
                      {sensorTypeLabels[sensor.type]} · {sensor.protocol.toUpperCase()} · Batteria{" "}
                      {sensor.batteryPercent}%
                    </p>
                    {reading && (
                      <p className="mt-1 text-sm font-semibold text-emerald-950">
                        Ultimo valore: {reading.value} {reading.unit}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="Nessun sensore installato"
                description="Questo appezzamento non ha ancora dispositivi IoT. Installa sensori per monitorare suolo, microclima e irrigazione."
                icon={<Radio className="h-7 w-7" aria-hidden="true" />}
                action={
                  <Link
                    href="/dashboard/iot"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Gestisci sensori
                  </Link>
                }
              />
            )}
          </div>
        </article>

        {/* Compliance */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Conformità</h2>
              <p className="text-sm text-emerald-950/65">PAC, biologico e certificazioni</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {fieldCompliance.length > 0 ? (
              fieldCompliance.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-emerald-950">{record.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        record.status === "conforme"
                          ? "bg-emerald-50 text-emerald-800"
                          : record.status === "scaduto"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-950/70">{record.description}</p>
                  <p className="mt-2 text-xs text-emerald-950/55">
                    Scadenza: {fullDateFormatter.format(new Date(record.dueDate))} · Tipo:{" "}
                    {record.type.toUpperCase()}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="Nessun obbligo normativo"
                description="Non ci sono obblighi normativi registrati per questo campo. Verifica se servono dichiarazioni PAC o certificazioni."
                icon={<ShieldCheck className="h-7 w-7" aria-hidden="true" />}
                action={
                  <Link
                    href="/dashboard/compliance"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Vai a conformità
                  </Link>
                }
              />
            )}
          </div>
        </article>
      </section>

      {/* Weather workflow windows + Yield row */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Live weather workflow windows */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <CloudSun className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Finestre operative</h2>
              <p className="text-sm text-emerald-950/65">Derivate dal meteo live</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {workflowWindows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-950/15 bg-[#f7f4ec] p-6 text-center">
                <CloudSun className="mx-auto h-8 w-8 text-emerald-950/25" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-emerald-950/60">
                  Nessuna finestra operativa disponibile
                </p>
                <p className="mt-1 text-xs text-emerald-950/45">
                  I dati meteo non sono sufficienti per derivare raccomandazioni.
                </p>
              </div>
            ) : (
              workflowWindows.map((window) => (
                <div
                  key={window.workflow}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-emerald-950">{window.workflow}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        window.status === "favorevole"
                          ? "bg-emerald-50 text-emerald-800"
                          : window.status === "monitorare"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {window.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-emerald-950">
                    {window.recommendedDay}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-950/70">{window.detail}</p>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Yield prediction detail */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-lime-100 p-3 text-lime-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Previsione resa</h2>
              <p className="text-sm text-emerald-950/65">Modello fenologico e NDVI</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <p className="text-sm text-emerald-950/60">Resa prevista</p>
              <p className="mt-1 text-3xl font-bold text-emerald-950">
                {yieldPrediction.predictedYieldKgHa.toLocaleString("it-IT")}{" "}
                <span className="text-lg font-normal text-emerald-950/60">kg/ha</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-3">
                <p className="text-xs text-emerald-950/60">Intervallo</p>
                <p className="mt-1 font-bold text-emerald-950">
                  {yieldPrediction.confidenceInterval.min.toLocaleString("it-IT")}–{yieldPrediction.confidenceInterval.max.toLocaleString("it-IT")}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-3">
                <p className="text-xs text-emerald-950/60">Stadio fenologico</p>
                <p className="mt-1 font-bold text-emerald-700">
                  {yieldPrediction.phenologicalStage}
                </p>
              </div>
            </div>
            {yieldPrediction.riskFactors.length > 0 && (
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="mb-2 text-xs font-semibold text-emerald-950/60">Fattori di rischio</p>
                <div className="flex flex-wrap gap-2">
                  {yieldPrediction.riskFactors.map((factor) => (
                    <span
                      key={factor}
                      className="rounded-full bg-white px-2.5 py-0.5 text-xs text-emerald-950/70 shadow-sm"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Field info footer */}
      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <h2 className="text-xl font-bold text-emerald-950">Dettagli campo</h2>
        <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2 lg:grid-cols-4">
          <p>
            <span className="font-semibold text-emerald-950">Coltura:</span> {field.crop}
          </p>
          <p>
            <span className="font-semibold text-emerald-950">Comune:</span> {field.municipality}
          </p>
          <p>
            <span className="font-semibold text-emerald-950">Impianto:</span>{" "}
            {fullDateFormatter.format(new Date(field.plantingDate))}
          </p>
          <p>
            <span className="font-semibold text-emerald-950">Irrigazione:</span> {field.irrigation}
          </p>
          <p className="sm:col-span-2 lg:col-span-4">
            <span className="font-semibold text-emerald-950">Note:</span> {field.notes}
          </p>
        </div>
      </section>
    </div>
  );
}
