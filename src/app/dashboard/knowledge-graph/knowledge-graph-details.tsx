import {
  CalendarRange,
  MessagesSquare,
  ScrollText,
} from "lucide-react";
import {
  getFieldDossiers,
  getKnowledgeGraph,
  getSeasonalDigests,
} from "@/lib/knowledge-graph-data";

const { queries } = getKnowledgeGraph();
const fieldDossiers = getFieldDossiers();
const seasonalDigests = getSeasonalDigests();
const currentDigest = seasonalDigests[0];

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

export default function KnowledgeGraphDetails() {
  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <MessagesSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Query recenti</h2>
              <p className="text-sm text-emerald-950/65">
                Domande poste in linguaggio naturale con risposta sintetica e fonti richiamate.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Domanda</th>
                <th className="px-6 py-4 font-semibold">Risposta</th>
                <th className="px-6 py-4 font-semibold">Fonti</th>
                <th className="px-6 py-4 font-semibold">Confidenza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {queries.map((query) => (
                <tr key={query.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-emerald-950">{query.question}</p>
                    <p className="mt-1 text-xs text-emerald-950/55">
                      {fullDateFormatter.format(new Date(query.queriedAt))} · {query.queriedBy}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{query.answer}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {query.sources.map((source) => (
                        <span
                          key={`${query.id}-${source}`}
                          className="rounded-full bg-[#f7f4ec] px-3 py-1 text-xs font-medium text-emerald-950/70"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{formatPercent(query.confidence)}</td>
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
                <ScrollText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Dossier di campo</h2>
                <p className="text-sm text-emerald-950/65">
                  Sintesi storica per appezzamento con pratiche chiave, varietà vincenti e rischio operativo.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-6 xl:grid-cols-2">
            {fieldDossiers.map((dossier) => (
              <article key={dossier.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {dossier.yearsOfData} anni di dati
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">{dossier.fieldName}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
                    Mentor: {dossier.mentorFarmer}
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm text-emerald-950/75">
                  <div>
                    <p className="font-semibold text-emerald-950">Pratiche chiave</p>
                    <p>{dossier.keyPractices.join(" · ")}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-950">Varietà migliori</p>
                    <p>{dossier.bestVarieties.join(" · ")}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-950">Fattori di rischio</p>
                    <p>{dossier.riskFactors.join(" · ")}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-emerald-950/55">Ultimo aggiornamento: {dossier.lastUpdated}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <CalendarRange className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Digest stagionale</h2>
                <p className="text-sm text-emerald-950/65">
                  Insight correnti e parallelismi storici per la stagione attiva.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <article className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Stagione corrente
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                    {currentDigest.season} {currentDigest.year}
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
                  {currentDigest.relevantFields.length} campi rilevanti
                </span>
              </div>
              <div className="mt-4 space-y-4 text-sm text-emerald-950/75">
                <div>
                  <p className="font-semibold text-emerald-950">Insight</p>
                  <ul className="mt-2 space-y-2">
                    {currentDigest.insights.map((insight) => (
                      <li key={insight}>• {insight}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-emerald-950">Parallelismi storici</p>
                  <ul className="mt-2 space-y-2">
                    {currentDigest.historicalParallels.map((parallel) => (
                      <li key={parallel}>• {parallel}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-emerald-950">Raccomandazioni</p>
                  <ul className="mt-2 space-y-2">
                    {currentDigest.recommendations.map((recommendation) => (
                      <li key={recommendation}>• {recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </article>
      </section>
    </>
  );
}
