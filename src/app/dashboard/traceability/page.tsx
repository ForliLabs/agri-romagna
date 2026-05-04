import Link from "next/link";
import {
  Package,
  Shield,
  Leaf,
  Award,
  ExternalLink,
} from "lucide-react";
import { QrBadge } from "@/components/qr-badge";
import {
  productLots,
  traceabilityEvents,
  qualityRecords,
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
          Ogni lotto ha un codice QR che racconta la storia completa dal campo al
          consumatore. Conforme al Digital Product Passport UE (2025–2027).
        </p>
      </section>

      {/* Lot cards */}
      <section className="grid gap-6 md:grid-cols-2">
        {productLots.map((lot) => {
          const events = traceabilityEvents.filter((e) => e.lotId === lot.id);
          const quality = qualityRecords.find((q) => q.lotId === lot.id);
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

              {/* Event timeline mini */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {events.map((evt) => (
                  <span key={evt.id} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${phaseClasses[evt.phase]}`}>
                    {phaseLabels[evt.phase]}
                  </span>
                ))}
              </div>

              {quality && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Shield className={`h-4 w-4 ${quality.passed ? "text-emerald-600" : "text-rose-600"}`} />
                  <span className={quality.passed ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>
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

      {/* Full event log */}
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
              {traceabilityEvents.map((evt) => {
                const lot = productLots.find((l) => l.id === evt.lotId);
                return (
                  <tr key={evt.id}>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-800">{lot?.lotCode}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${phaseClasses[evt.phase]}`}>
                        {phaseLabels[evt.phase]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-950">{evt.title}</td>
                    <td className="px-4 py-3 text-emerald-950/70">
                      {dateFormatter.format(new Date(evt.timestamp))}
                    </td>
                    <td className="px-4 py-3 text-emerald-950/70">{evt.operator}</td>
                    <td className="px-4 py-3">
                      {evt.verified ? (
                        <span className="text-emerald-600 font-medium">✓</span>
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
