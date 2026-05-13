import {
  Leaf,
  Globe,
  Users,
  Award,
  BarChart3,
  TreePine,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getESGIndicators,
  getBiodiversityMetrics,
  getESGScorecard,
  getStakeholderViews,
  getESGStats,
  trendLabels,
  trendClasses,
} from "@/lib/esg-data";

const stats = getESGStats();
const scorecard = getESGScorecard();
const envIndicators = getESGIndicators("environmental");
const socIndicators = getESGIndicators("social");
const govIndicators = getESGIndicators("governance");
const biodiversity = getBiodiversityMetrics();
const stakeholderViews = getStakeholderViews();

export default function ESGPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Sostenibilità
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Dashboard impatto & ESG cooperativo
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Reporting ambientale, sociale e di governance conforme GRI/ESRS. Bilancio di sostenibilità per CSRD, GDO buyer e stakeholder.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Score ESG complessivo" value={`${stats.overallScore}/100`} change={`${stats.indicatorsImproving} indicatori in miglioramento`} trend="up" />
        <StatCard label="Ambientale" value={`${stats.environmentalScore}/100`} change="Emissioni, acqua, suolo, biodiversità" trend="up" />
        <StatCard label="Sociale" value={`${stats.socialScore}/100`} change="Occupazione, retribuzione, sicurezza" trend="up" />
        <StatCard label="Governance" value={`${stats.governanceScore}/100`} change="Partecipazione, trasparenza, conformità" trend="up" />
      </section>

      {/* ESG Scorecard */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Scorecard ESG</h2>
            <p className="text-sm text-emerald-950/65">
              CSRD: {scorecard.csrdCompliant ? "✅ Pronto per reporting" : "⚠️ Dati incompleti"} — Ultimo aggiornamento: {scorecard.lastUpdated}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Ambientale", score: scorecard.environmentalScore, color: "emerald" },
            { label: "Sociale", score: scorecard.socialScore, color: "sky" },
            { label: "Governance", score: scorecard.governanceScore, color: "violet" },
          ].map((dim) => (
            <div key={dim.label} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5 text-center">
              <p className="text-sm text-emerald-950/55">{dim.label}</p>
              <p className="mt-2 text-4xl font-bold text-emerald-950">{dim.score}</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                <div className={`h-full rounded-full bg-${dim.color}-500`} style={{ width: `${dim.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Environmental Indicators */}
      {[
        { title: "Indicatori ambientali", indicators: envIndicators, icon: <Leaf className="h-6 w-6" />, iconBg: "bg-emerald-100", iconText: "text-emerald-800" },
        { title: "Indicatori sociali", indicators: socIndicators, icon: <Users className="h-6 w-6" />, iconBg: "bg-sky-100", iconText: "text-sky-700" },
        { title: "Indicatori di governance", indicators: govIndicators, icon: <Globe className="h-6 w-6" />, iconBg: "bg-violet-100", iconText: "text-violet-700" },
      ].map((section) => (
        <article key={section.title} className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl ${section.iconBg} p-3 ${section.iconText}`}>
              {section.icon}
            </div>
            <h2 className="text-2xl font-bold text-emerald-950">{section.title}</h2>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Indicatore</th>
                  <th className="px-4 py-3 font-medium">Attuale</th>
                  <th className="px-4 py-3 font-medium">Precedente</th>
                  <th className="px-4 py-3 font-medium">Obiettivo</th>
                  <th className="px-4 py-3 font-medium">Trend</th>
                  <th className="px-4 py-3 font-medium">Progresso</th>
                  <th className="px-4 py-3 font-medium">Riferimento</th>
                </tr>
              </thead>
              <tbody>
                {section.indicators.map((ind) => (
                  <tr key={ind.id} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-emerald-950">{ind.name}</p>
                      <p className="text-xs text-emerald-950/50">{ind.description}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-950">{ind.currentValue} {ind.unit}</td>
                    <td className="px-4 py-3 text-emerald-950/65">{ind.previousValue} {ind.unit}</td>
                    <td className="px-4 py-3 text-emerald-950/65">{ind.target} {ind.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${trendClasses[ind.trend]}`}>{trendLabels[ind.trend]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-emerald-950/10">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (ind.currentValue / ind.target) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-emerald-950/50">
                      {ind.griReference && <span className="block">{ind.griReference}</span>}
                      {ind.esrsReference && <span className="block">{ind.esrsReference}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}

      {/* Biodiversity & Stakeholder Views */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <TreePine className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Indicatori biodiversità</h2>
              <p className="text-sm text-emerald-950/65">Proxy ecologici per habitat e pratiche conservative</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {biodiversity.map((bm) => (
              <div key={bm.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-950">{bm.indicator}</p>
                  <span className="text-sm font-bold text-emerald-800">{bm.score}/100</span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-emerald-950/55">
                  <span>Attuale: <strong className="text-emerald-950">{bm.value} {bm.unit}</strong></span>
                  <span>Benchmark: <strong className="text-emerald-950">{bm.benchmark} {bm.unit}</strong></span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-950/10">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${bm.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Viste stakeholder</h2>
              <p className="text-sm text-emerald-950/65">Reportistica personalizzata per interlocutore</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {stakeholderViews.map((sv) => (
              <div key={sv.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{sv.stakeholderType}</p>
                    <h3 className="mt-1 text-base font-semibold text-emerald-950">{sv.label}</h3>
                    <p className="mt-1 text-sm text-emerald-950/65">{sv.description}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">{sv.overallRating}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {sv.keyMetrics.map((m) => (
                    <span key={m} className="rounded-full bg-white px-2 py-0.5 text-xs text-emerald-950/65 shadow-sm">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
