import {
  Activity,
  BrainCircuit,
  ScanSearch,
  ShieldAlert,
  Siren,
  Waves,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getActiveAnomalies,
  getAnomalyCorrelations,
  getAnomalyDigest,
  getAnomalyDigests,
  getAnomalyStreams,
  getDetectionModels,
  type AnomalySeverity,
  type AnomalyStatus,
  type AnomalyTrend,
  type DetectionModelType,
} from "@/lib/anomaly-detection-data";

const activeAnomalies = getActiveAnomalies();
const streams = getAnomalyStreams();
const correlations = getAnomalyCorrelations();
const models = getDetectionModels();
const latestDigest = getAnomalyDigest();
const digests = getAnomalyDigests();

const severityLabels: Record<AnomalySeverity, string> = {
  critical: "Critica",
  high: "Alta",
  medium: "Media",
  low: "Bassa",
};

const severityClasses: Record<AnomalySeverity, string> = {
  critical: "bg-rose-100 text-rose-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-sky-100 text-sky-800",
};

const statusLabels: Record<AnomalyStatus, string> = {
  active: "Attiva",
  acknowledged: "Presa in carico",
  resolved: "Risolta",
  false_positive: "Falso positivo",
};

const statusClasses: Record<AnomalyStatus, string> = {
  active: "bg-rose-100 text-rose-800",
  acknowledged: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
  false_positive: "bg-slate-100 text-slate-700",
};

const trendLabels: Record<AnomalyTrend, string> = {
  rising: "In crescita",
  falling: "In calo",
  spike: "Picco",
  flatline: "Flatline",
};

const modelTypeLabels: Record<DetectionModelType, string> = {
  zscore: "Z-Score",
  iqr: "IQR",
  contextual: "Contestuale",
  cross_stream: "Tra stream",
};

const fullDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const averageFalsePositiveRate =
  models.reduce((total, model) => total + model.falsePositiveRate, 0) / models.length;
const criticalCount = activeAnomalies.filter((anomaly) => anomaly.severity === "critical").length;

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function AnomalyDetectionPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Rete anomalie
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Manutenzione predittiva & rete di rilevamento anomalie
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Monitora scostamenti tra sensori, immagini, meteo, resa e mezzi per intercettare problemi prima che arrivino in campo o in raccolta.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Anomalie attive"
          value={String(activeAnomalies.length)}
          change={`${latestDigest.totalDetected} rilevate nell'ultima settimana`}
          trend="up"
        />
        <StatCard
          label="Criticità elevate"
          value={String(criticalCount)}
          change="Richiedono intervento immediato o supervisione tecnica"
          trend="down"
        />
        <StatCard
          label="Stream monitorati"
          value={String(streams.length)}
          change="IoT, NDVI, meteo, resa, acqua, mezzi e fitofagi"
          trend="up"
        />
        <StatCard
          label="Tasso falsi positivi"
          value={formatPercent(averageFalsePositiveRate)}
          change={`${models.length} modelli in produzione`}
          trend="neutral"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Anomalie correnti</h2>
              <p className="text-sm text-emerald-950/65">
                Eventi aperti o già presi in carico con scostamento, trend e ipotesi causale.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Stream</th>
                <th className="px-6 py-4 font-semibold">Severità</th>
                <th className="px-6 py-4 font-semibold">Descrizione</th>
                <th className="px-6 py-4 font-semibold">Deviazione</th>
                <th className="px-6 py-4 font-semibold">Trend</th>
                <th className="px-6 py-4 font-semibold">Ipotesi</th>
                <th className="px-6 py-4 font-semibold">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {activeAnomalies.map((anomaly) => (
                <tr key={anomaly.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-emerald-950">{anomaly.streamName}</p>
                    <p className="mt-1 text-xs text-emerald-950/55">
                      {anomaly.fieldName} · {fullDateFormatter.format(new Date(anomaly.detectedAt))}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${severityClasses[anomaly.severity]}`}
                    >
                      {severityLabels[anomaly.severity]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{anomaly.description}</td>
                  <td className="px-6 py-4 text-emerald-950/75">
                    {anomaly.deviation > 0 ? "+" : ""}
                    {anomaly.deviation.toLocaleString("it-IT", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{trendLabels[anomaly.trend]}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{anomaly.hypothesis}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[anomaly.status]}`}>
                      {statusLabels[anomaly.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Stream monitorati</h2>
                <p className="text-sm text-emerald-950/65">
                  Baseline operativi per sensori, modelli previsionali, reti irrigue e mezzi cooperativi.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Stream</th>
                  <th className="px-6 py-4 font-semibold">Fonte</th>
                  <th className="px-6 py-4 font-semibold">Corrente vs baseline</th>
                  <th className="px-6 py-4 font-semibold">Risoluzione</th>
                  <th className="px-6 py-4 font-semibold">Ultimo aggiornamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {streams.map((stream) => (
                  <tr key={stream.id}>
                    <td className="px-6 py-4 font-semibold text-emerald-950">{stream.name}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{stream.source}</td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {stream.currentValue.toLocaleString("it-IT")} {stream.unit} / {stream.baselineValue.toLocaleString("it-IT")} {stream.unit}
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{stream.resolution}</td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {fullDateFormatter.format(new Date(stream.lastUpdated))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <Waves className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Correlazioni cross-stream</h2>
                <p className="text-sm text-emerald-950/65">
                  Pattern che emergono quando più segnali divergono contemporaneamente.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            {correlations.map((correlation) => (
              <article key={correlation.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {correlation.anomalyIds.length} anomalie collegate
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
                    {formatPercent(correlation.confidence)} confidenza
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-emerald-950/75">{correlation.description}</p>
                <p className="mt-4 text-sm text-emerald-950/75">
                  <span className="font-semibold text-emerald-950">Causa suggerita:</span> {correlation.suggestedCause}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {correlation.anomalyIds.map((anomalyId) => (
                    <span
                      key={anomalyId}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-950/70 shadow-sm"
                    >
                      {anomalyId}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Modelli di detection</h2>
                <p className="text-sm text-emerald-950/65">
                  Modelli ML e statistici con accuratezza, sensibilità e tasso di falsi positivi.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Modello</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Stream</th>
                  <th className="px-6 py-4 font-semibold">Sensibilità</th>
                  <th className="px-6 py-4 font-semibold">Accuratezza</th>
                  <th className="px-6 py-4 font-semibold">Ultimo training</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {models.map((model) => (
                  <tr key={model.id}>
                    <td className="px-6 py-4 font-semibold text-emerald-950">{model.name}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{modelTypeLabels[model.type]}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{model.streams.length}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{formatPercent(model.sensitivity)}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{formatPercent(model.accuracy)}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{model.lastTrained}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Siren className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Digest settimanale</h2>
                <p className="text-sm text-emerald-950/65">
                  Quadro sintetico delle ultime due settimane di monitoraggio cooperativo.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            {digests.map((digest) => (
              <article key={digest.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {digest.period}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                      {digest.totalDetected} anomalie rilevate
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
                    {digest.critical} critiche
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-3">
                  <p>
                    <span className="font-semibold text-emerald-950">Risolte:</span> {digest.resolved}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Falsi positivi:</span> {digest.falsePositives}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Cooperativa:</span> {digest.cooperativeId}
                  </p>
                </div>
                <div className="mt-4 space-y-2 text-sm text-emerald-950/75">
                  {digest.topAnomalies.map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
