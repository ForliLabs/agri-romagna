import {
  Shield,
  AlertTriangle,
  FileText,
  TrendingUp,
  Eye,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getPolicies,
  getActiveTriggers,
  getLossEvents,
  getPremiumAnalysis,
  getInsuranceStats,
  triggerTypeLabels,
  triggerStatusClasses,
  claimStatusLabels,
} from "@/lib/insurance-data";

const stats = getInsuranceStats();
const policies = getPolicies();
const activeTriggers = getActiveTriggers();
const lossEvents = getLossEvents();
const premiumAnalysis = getPremiumAnalysis();

const policyStatusClasses: Record<string, string> = {
  attiva: "bg-emerald-100 text-emerald-800",
  in_attesa: "bg-amber-100 text-amber-800",
  scaduta: "bg-slate-100 text-slate-600",
  sospesa: "bg-rose-100 text-rose-800",
};

export default function InsurancePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Gestione assicurativa
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Hub assicurazione parametrica
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Polizze, trigger parametrici in tempo reale, documentazione sinistri e ottimizzazione premi con integrazione AGEA/ISMEA.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Polizze attive" value={String(stats.activePolicies)} change={`Copertura totale € ${stats.totalCoverageEur.toLocaleString("it-IT")}`} trend="up" />
        <StatCard label="Premio totale" value={`€ ${stats.totalPremiumEur.toLocaleString("it-IT")}`} change={`Sussidio medio ${stats.avgSubsidyPercent}% AGEA`} trend="neutral" />
        <StatCard label="Trigger attivi" value={String(stats.activeTriggers)} change="In monitoraggio continuo" trend={stats.activeTriggers > 2 ? "down" : "neutral"} />
        <StatCard label="Sinistri pendenti" value={String(stats.pendingClaims)} change="Dossier in lavorazione" trend="neutral" />
      </section>

      {/* Policies */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Polizze assicurative</h2>
            <p className="text-sm text-emerald-950/65">Registro polizze con coperture, premi e trigger parametrici</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {policies.map((policy) => (
            <div key={policy.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-emerald-950">{policy.type}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${policyStatusClasses[policy.status]}`}>{policy.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-950/65">{policy.provider} — {policy.policyNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-950">€ {policy.premiumEur.toLocaleString("it-IT")}</p>
                  <p className="text-xs text-emerald-950/55">Sussidio {policy.subsidyPercent}%</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="text-sm">
                  <p className="text-emerald-950/55">Colture coperte</p>
                  <p className="font-medium text-emerald-950">{policy.coveredCrops.join(", ")}</p>
                </div>
                <div className="text-sm">
                  <p className="text-emerald-950/55">Copertura max</p>
                  <p className="font-medium text-emerald-950">€ {policy.maxCoverageEur.toLocaleString("it-IT")}</p>
                </div>
                <div className="text-sm">
                  <p className="text-emerald-950/55">Franchigia</p>
                  <p className="font-medium text-emerald-950">{policy.deductiblePercent}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Active Triggers */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Trigger parametrici</h2>
              <p className="text-sm text-emerald-950/65">Monitoraggio soglie in tempo reale</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {activeTriggers.map((trigger) => (
              <div key={trigger.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-950">{triggerTypeLabels[trigger.type]}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${triggerStatusClasses[trigger.status]}`}>{trigger.status}</span>
                </div>
                <p className="mt-1 text-sm text-emerald-950/65">{trigger.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-emerald-950/55">
                  <span>Valore attuale: <strong className="text-emerald-950">{trigger.currentValue} {trigger.thresholdUnit}</strong></span>
                  <span>Soglia: <strong className="text-emerald-950">{trigger.thresholdValue} {trigger.thresholdUnit}</strong></span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-950/10">
                  <div
                    className={`h-full rounded-full ${trigger.status === "allerta" ? "bg-amber-500" : trigger.status === "attivato" ? "bg-rose-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(100, (trigger.currentValue / trigger.thresholdValue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {activeTriggers.length === 0 && (
              <p className="py-6 text-center text-sm text-emerald-950/50">Nessun trigger attivo al momento</p>
            )}
          </div>
        </article>

        {/* Loss Events */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Eventi di sinistro</h2>
              <p className="text-sm text-emerald-950/65">Dossier sinistri con evidenze raccolte</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {lossEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Sinistro {event.eventDate}</p>
                    <h3 className="mt-1 text-base font-semibold text-emerald-950">{event.description.substring(0, 80)}…</h3>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{claimStatusLabels[event.claimStatus]}</span>
                </div>
                <p className="mt-2 text-sm text-emerald-950/75">Danno stimato: <strong>€ {event.estimatedDamageEur.toLocaleString("it-IT")}</strong></p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-950/55">Evidenze raccolte ({event.evidenceItems.length})</p>
                  {event.evidenceItems.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-2 text-xs text-emerald-950/65">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{ev.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Premium Analysis */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Analisi premi & ottimizzazione</h2>
            <p className="text-sm text-emerald-950/65">Rischio per campo e potenziale risparmio sul rinnovo</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Campo</th>
                <th className="px-4 py-3 font-medium">Coltura</th>
                <th className="px-4 py-3 font-medium">Rischio</th>
                <th className="px-4 py-3 font-medium">Premio attuale</th>
                <th className="px-4 py-3 font-medium">Premio consigliato</th>
                <th className="px-4 py-3 font-medium">Risparmio</th>
              </tr>
            </thead>
            <tbody>
              {premiumAnalysis.map((pa) => (
                <tr key={pa.fieldId} className="border-b border-emerald-950/5 last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-emerald-950">{pa.fieldName}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{pa.crop}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-emerald-950/10">
                        <div className={`h-full rounded-full ${pa.riskScore > 70 ? "bg-rose-500" : pa.riskScore > 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pa.riskScore}%` }} />
                      </div>
                      <span className="text-xs text-emerald-950/55">{pa.riskScore}/100</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-emerald-950/75">€ {pa.currentPremiumEur.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-3 text-emerald-950/75">€ {pa.recommendedPremiumEur.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{pa.savingPotentialEur > 0 ? `€ ${pa.savingPotentialEur.toLocaleString("it-IT")}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
