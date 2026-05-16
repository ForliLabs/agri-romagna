import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Leaf,
  Award,
  MapPin,
  Calendar,
  Shield,
  ArrowLeft,
  Sprout,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { QrBadge } from "@/components/qr-badge";
import { buildDPP, productLots } from "@/lib/traceability-data";
import { ShareCopyButton } from "./share-copy-button";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const phaseLabels: Record<string, string> = {
  campo: "🌱 Campo",
  raccolta: "🧺 Raccolta",
  trasporto: "🚛 Trasporto",
  lavorazione: "⚙️ Lavorazione",
  confezionamento: "📦 Confezionamento",
  distribuzione: "🏪 Distribuzione",
};

export function generateStaticParams() {
  return productLots.map((lot) => ({ lotId: lot.id }));
}

export default async function TraceabilityPublicPage({
  params,
}: {
  params: Promise<{ lotId: string }>;
}) {
  const { lotId } = await params;
  const dpp = buildDPP(lotId);
  if (!dpp) notFound();

  // Provenance completeness: farm info, events, quality, certifications
  const allPhases = ["campo", "raccolta", "trasporto", "lavorazione", "confezionamento", "distribuzione"];
  const coveredPhases = new Set(dpp.events.map((e) => e.phase));
  const phaseCoverage = Math.round((coveredPhases.size / allPhases.length) * 100);
  const hasQuality = dpp.quality.length > 0;
  const hasCerts = dpp.certifications.length > 0;
  const verifiedRate = dpp.events.length > 0
    ? Math.round((dpp.events.filter((e) => e.verified).length / dpp.events.length) * 100)
    : 0;
  // Weighted: 40% phase coverage, 30% verified events, 15% quality, 15% certs
  const completenessScore = Math.round(
    phaseCoverage * 0.4 + verifiedRate * 0.3 + (hasQuality ? 100 : 0) * 0.15 + (hasCerts ? 100 : 0) * 0.15
  );
  const completenessLabel = completenessScore >= 90
    ? "Provenienza completa"
    : completenessScore >= 70
      ? "Provenienza parziale"
      : "Provenienza da integrare";
  const completenessColor = completenessScore >= 90
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : completenessScore >= 70
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-rose-700 bg-rose-50 border-rose-200";
  const completenessBarColor = completenessScore >= 90
    ? "bg-emerald-600"
    : completenessScore >= 70
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="min-h-screen bg-[#f4f1e8]">
      {/* Header */}
      <header className="border-b border-emerald-950/10 bg-emerald-950 text-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-100/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            AgriRomagna
          </Link>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/60">
                Passaporto digitale del prodotto
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{dpp.product}</h1>
              <p className="mt-1 text-base text-emerald-100/80">{dpp.variety}</p>
            </div>
            <QrBadge value={dpp.lotCode} className="h-16 w-16 border-white/20 bg-white/10 p-2" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-semibold">
              {dpp.lotCode}
            </span>
            {dpp.farm.organic && (
              <span className="flex items-center gap-1 rounded-full bg-lime-500/20 px-3 py-1 text-xs font-semibold text-lime-200">
                <Leaf className="h-3 w-3" /> Biologico
              </span>
            )}
            {dpp.farm.dop && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                <Award className="h-3 w-3" /> DOP
              </span>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Farm info */}
        <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Sprout className="h-6 w-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-emerald-950">Origine</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="font-semibold text-emerald-950">Azienda:</span> <span className="text-emerald-950/75">{dpp.farm.name}</span></p>
            <p><MapPin className="mr-1 inline h-4 w-4 text-emerald-700" /><span className="text-emerald-950/75">{dpp.farm.location}</span></p>
            <p><Calendar className="mr-1 inline h-4 w-4 text-emerald-700" /><span className="font-semibold text-emerald-950">Raccolta:</span> <span className="text-emerald-950/75">{dateFormatter.format(new Date(dpp.harvestDate))}</span></p>
            {dpp.carbonFootprint && (
              <p><span className="font-semibold text-emerald-950">Impronta CO₂:</span> <span className="text-emerald-950/75">{dpp.carbonFootprint}</span></p>
            )}
          </div>
          {dpp.certifications.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {dpp.certifications.map((cert) => (
                <span key={cert} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <Shield className="h-3 w-3" /> {cert}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Provenance completeness signal */}
        <section className={`mt-6 rounded-3xl border p-5 ${completenessColor}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {completenessScore >= 90 ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm font-semibold">{completenessLabel}</p>
                <p className="mt-0.5 text-xs opacity-80">
                  {coveredPhases.size}/{allPhases.length} fasi · {verifiedRate}% verificato{hasQuality ? " · qualità allegata" : ""}
                </p>
              </div>
            </div>
            <span className="text-lg font-bold">{completenessScore}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/60">
            <div
              className={`h-full rounded-full ${completenessBarColor}`}
              style={{ width: `${completenessScore}%` }}
              role="progressbar"
              aria-valuenow={completenessScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Completezza provenienza: ${completenessScore}%`}
            />
          </div>
        </section>

        {/* Share / Copy action */}
        <div className="mt-6 flex justify-center">
          <ShareCopyButton lotCode={dpp.lotCode} lotId={dpp.lotId} />
        </div>

        {/* Timeline */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-emerald-950">Percorso di filiera</h2>
          <p className="mt-1 text-sm text-emerald-950/60">Ogni passaggio è registrato e verificabile.</p>
          <ol className="mt-6 space-y-1">
            {dpp.events.map((evt, i) => (
              <li key={evt.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    {i + 1}
                  </div>
                  {i < dpp.events.length - 1 ? <div className="h-full w-0.5 bg-emerald-200" /> : null}
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {phaseLabels[evt.phase]}
                  </p>
                  <h3 className="mt-1 font-semibold text-emerald-950">{evt.title}</h3>
                  <p className="mt-1 text-sm text-emerald-950/70">{evt.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-emerald-950/50">
                    <span>{timeFormatter.format(new Date(evt.timestamp))}</span>
                    <span>{evt.operator}</span>
                    {evt.verified ? <span className="font-medium text-emerald-600">✓ Verificato</span> : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Quality */}
        {dpp.quality.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-emerald-950">Controllo qualità</h2>
            {dpp.quality.map((q) => (
              <div key={q.id} className="mt-4 rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Shield className={`h-5 w-5 ${q.passed ? "text-emerald-600" : "text-rose-600"}`} />
                  <span className={`font-semibold ${q.passed ? "text-emerald-700" : "text-rose-700"}`}>
                    {q.passed ? "Conforme" : "Non conforme"}
                  </span>
                  {q.lab && <span className="text-sm text-emerald-950/50">· {q.lab}</span>}
                </div>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {Object.entries(q.metrics).map(([key, value]) => (
                    <p key={key}>
                      <span className="font-semibold text-emerald-950">{key}:</span>{" "}
                      <span className="text-emerald-950/75">{value}</span>
                    </p>
                  ))}
                </div>
                <p className="mt-3 text-sm text-emerald-950/60">{q.notes}</p>
              </div>
            ))}
          </section>
        )}

        {/* EU DPP notice */}
        <section className="mt-8 rounded-2xl border border-emerald-950/10 bg-emerald-50 p-5 text-center">
          <p className="text-sm font-semibold text-emerald-800">
            🇪🇺 Conforme al regolamento EU Digital Product Passport (2025–2027)
          </p>
          <p className="mt-1 text-xs text-emerald-700/70">
            Dati di tracciabilità immutabili · Verificabilità pubblica · Schema DPP v1.0
          </p>
        </section>
      </main>
    </div>
  );
}
