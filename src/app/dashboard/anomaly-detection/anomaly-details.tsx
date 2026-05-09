import {
  Activity,
  BrainCircuit,
  Siren,
  Waves,
} from "lucide-react";
import {
  getAnomalyCorrelations,
  getAnomalyDigests,
  getAnomalyStreams,
  getDetectionModels,
  type DetectionModelType,
} from "@/lib/anomaly-detection-data";

const streams = getAnomalyStreams();
const correlations = getAnomalyCorrelations();
const models = getDetectionModels();
const digests = getAnomalyDigests();

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

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function AnomalyDetails() {
  return (
    <>
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
    </>
  );
}
