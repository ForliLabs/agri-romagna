import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Leaf,
  Award,
  MapPin,
  Calendar,
  Shield,
  ArrowLeft,
  QrCode,
  Sprout,
} from "lucide-react";
import { buildDPP, productLots } from "@/lib/traceability-data";

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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <QrCode className="h-8 w-8" />
            </div>
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

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
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

        {/* Timeline */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-emerald-950">Percorso di filiera</h2>
          <p className="mt-1 text-sm text-emerald-950/60">Ogni passaggio è registrato e verificabile.</p>
          <div className="mt-6 space-y-1">
            {dpp.events.map((evt, i) => (
              <div key={evt.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    {i + 1}
                  </div>
                  {i < dpp.events.length - 1 && <div className="h-full w-0.5 bg-emerald-200" />}
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
                    {evt.verified && <span className="text-emerald-600 font-medium">✓ Verificato</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
