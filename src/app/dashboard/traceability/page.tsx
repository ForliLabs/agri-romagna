import Link from "next/link";
import {
  Award,
  ExternalLink,
  Leaf,
  Package,
  Shield,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { QrBadge } from "@/components/qr-badge";
import { traceabilityIntegrityOverview } from "@/lib/operations-insights";
import {
  productLots,
  qualityRecords,
  traceabilityEvents,
} from "@/lib/traceability-data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const phaseLabels: Record<string, string> = {
  campo: "Campo",
  raccolta: "Raccolta",
  trasporto: "Trasporto",
  lavorazione: "Lavorazione",
  confezionamento: "Confezionamento",
  distribuzione: "Distribuzione",
};

const phaseClasses: Record<string, string> = {
  campo: "bg-lime-100 text-lime-800",
  raccolta: "bg-amber-100 text-amber-800",
  trasporto: "bg-sky-100 text-sky-800",
  lavorazione: "bg-violet-100 text-violet-800",
  confezionamento: "bg-orange-100 text-orange-800",
  distribuzione: "bg-emerald-50 text-emerald-800",
};

const overviewByLot = new Map(traceabilityIntegrityOverview.map((item) => [item.lotId, item]));
const solidLots = traceabilityIntegrityOverview.filter((item) => item.integrityScore >= 80).length;
const attentionLots = traceabilityIntegrityOverview.filter((item) => item.integrityScore < 70).length;

export default function TraceabilityPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Tracciabilità & DPP
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Passaporto digitale dei prodotti.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Ogni lotto ha un codice QR che racconta la storia completa dal campo al consumatore.
          In iterazione 2 la dashboard mostra anche copertura di fase, verifiche mancanti e qualità disponibile.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lotti tracciati" value={String(productLots.length)} change="Catalogo DPP attivo" trend="up" />
        <StatCard label="Integrità alta" value={String(solidLots)} change="Score ≥ 80 su filiera e verifiche" trend="up" />
        <StatCard label="Lotti da integrare" value={String(attentionLots)} change="Mancano eventi o verifiche qualità" trend="down" />
        <StatCard
          label="Qualità allegata"
          value={String(qualityRecords.length)}
          change="Referti disponibili collegati ai lotti"
          trend="neutral"
        />
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Integrity board</h2>
            <p className="text-sm text-emerald-950/65">Dove la catena è completa e dove serve ancora un evento o un controllo</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {traceabilityIntegrityOverview.map((item) => {
            const isWeak = item.integrityScore < 70;
            const isModerate = item.integrityScore >= 70 && item.integrityScore < 80;
            return (
            <article
              key={item.lotId}
              className={`rounded-2xl border p-4 ${
                isWeak
                  ? "border-rose-200 bg-rose-50/50"
                  : isModerate
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-emerald-950/10 bg-[#f7f4ec]"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-2">
                  {isWeak && (
                    <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">{item.product}</p>
                    <p className="mt-1 text-xs font-mono text-emerald-700">{item.lotCode}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.integrityScore >= 80
                      ? "bg-emerald-50 text-emerald-800"
                      : item.integrityScore >= 70
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  score {item.integrityScore}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-950/45">Fasi coperte</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-950">{item.phaseCoverage}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-950/45">Eventi verificati</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-950">{item.verifiedRate}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-950/45">Qualità allegata</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-950">{item.qualityCoverage}%</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-emerald-950/70">
                Compliance {item.complianceStatus} ·
                {item.missingPhases.length > 0
                  ? ` Fasi mancanti: ${item.missingPhases.join(", ")}.`
                  : " catena completa su tutte le fasi previste."}
              </p>
              {/* Actionable CTAs for weak and moderate lots */}
              {(isWeak || isModerate) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.missingPhases.length > 0 && (
                    <Link
                      href="/dashboard/supply-chain"
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isWeak
                          ? "bg-rose-700 text-white hover:bg-rose-800"
                          : "bg-amber-600 text-white hover:bg-amber-700"
                      }`}
                    >
                      Registra fasi mancanti
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  )}
                  {item.qualityCoverage === 0 && (
                    <Link
                      href="/dashboard/compliance"
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-950/15 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                      Allega referto qualità
                    </Link>
                  )}
                  {item.complianceStatus === "da integrare" && (
                    <Link
                      href="/dashboard/compliance-chain"
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-950/15 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                      Allinea compliance
                    </Link>
                  )}
                </div>
              )}
            </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {productLots.map((lot) => {
          const events = traceabilityEvents.filter((event) => event.lotId === lot.id);
          const quality = qualityRecords.find((record) => record.lotId === lot.id);
          const overview = overviewByLot.get(lot.id);
          return (
            <article key={lot.id} className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-mono font-semibold text-emerald-800">
                      {lot.lotCode}
                    </span>
                    {lot.organic && (
                      <span className="flex items-center gap-1 rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-semibold text-lime-800">
                        <Leaf className="h-3 w-3" /> BIO
                      </span>
                    )}
                    {lot.dop && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        <Award className="h-3 w-3" /> DOP
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-emerald-950">{lot.product}</h3>
                  <p className="mt-1 text-sm text-emerald-950/65">{lot.variety}</p>
                </div>
                <QrBadge value={lot.lotCode} className="h-20 w-20 flex-shrink-0" />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-emerald-950/75 sm:grid-cols-2">
                <p><span className="font-semibold text-emerald-950">Azienda:</span> {lot.farmName}</p>
                <p><span className="font-semibold text-emerald-950">Campo:</span> {lot.fieldName}</p>
                <p><span className="font-semibold text-emerald-950">Raccolta:</span> {dateFormatter.format(new Date(lot.harvestDate))}</p>
                <p><span className="font-semibold text-emerald-950">Volume:</span> {(lot.volumeKg / 1000).toFixed(1)} t</p>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-emerald-950">Copertura filiera</p>
                  <span className="text-sm font-semibold text-emerald-700">{overview?.integrityScore ?? 0}/100</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${
                      (overview?.integrityScore ?? 0) >= 80
                        ? "bg-emerald-600"
                        : (overview?.integrityScore ?? 0) >= 70
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                    style={{ width: `${overview?.integrityScore ?? 0}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-950/70">
                  {overview?.missingPhases.length
                    ? `Fasi mancanti: ${overview.missingPhases.join(", ")}.`
                    : "Tutte le fasi previste sono coperte."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {events.map((event) => (
                  <span key={event.id} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${phaseClasses[event.phase]}`}>
                    {phaseLabels[event.phase]}
                  </span>
                ))}
              </div>

              {quality && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Shield className={`h-4 w-4 ${quality.passed ? "text-emerald-600" : "text-rose-600"}`} />
                  <span className={quality.passed ? "font-medium text-emerald-700" : "font-medium text-rose-700"}>
                    Qualità {quality.passed ? "conforme" : "non conforme"}
                  </span>
                </div>
              )}

              <Link
                href={`/traceability/${lot.id}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <ExternalLink className="h-4 w-4" />
                Vedi passaporto pubblico
              </Link>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Registro eventi immutabile</h2>
            <p className="text-sm text-emerald-950/65">Tutti i passaggi di filiera tracciati</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Lotto</th>
                <th className="px-4 py-3 text-left font-semibold">Fase</th>
                <th className="px-4 py-3 text-left font-semibold">Evento</th>
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-left font-semibold">Operatore</th>
                <th className="px-4 py-3 text-left font-semibold">Verificato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10">
              {traceabilityEvents.map((event) => {
                const lot = productLots.find((candidate) => candidate.id === event.lotId);
                return (
                  <tr key={event.id}>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-800">{lot?.lotCode}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${phaseClasses[event.phase]}`}>
                        {phaseLabels[event.phase]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-950">{event.title}</td>
                    <td className="px-4 py-3 text-emerald-950/70">
                      {dateFormatter.format(new Date(event.timestamp))}
                    </td>
                    <td className="px-4 py-3 text-emerald-950/70">{event.operator}</td>
                    <td className="px-4 py-3">
                      {event.verified ? (
                        <span className="font-medium text-emerald-600">✓</span>
                      ) : (
                        <span className="text-emerald-950/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
