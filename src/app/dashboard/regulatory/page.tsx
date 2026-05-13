import {
  Newspaper,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getRegulatoryUpdates,
  getComplianceCalendar,
  getRegulatoryStats,
  sourceLabels,
  domainLabels,
  impactClasses,
  calendarStatusClasses,
} from "@/lib/regulatory-radar-data";

const stats = getRegulatoryStats();
const updates = getRegulatoryUpdates();
const calendar = getComplianceCalendar();

export default function RegulatoryPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Radar normativo
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Radar normativo & calendario conformità
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Feed normativo curato da Gazzetta Ufficiale, EU Official Journal, ARPAE e Regione. Scadenze, impatti e azioni automatiche per la cooperativa.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aggiornamenti totali" value={String(stats.totalUpdates)} change={`${stats.unreadUpdates} non letti`} trend="neutral" />
        <StatCard label="Alto impatto non letti" value={String(stats.highImpactUnread)} change="Richiedono attenzione immediata" trend={stats.highImpactUnread > 0 ? "down" : "up"} />
        <StatCard label="Scadenze 30 giorni" value={String(stats.upcomingDeadlines30d)} change="Adempimenti in scadenza" trend="neutral" />
        <StatCard label="Compliance score" value={`${stats.complianceScore}%`} change="Adempimenti completati" trend={stats.complianceScore > 50 ? "up" : "down"} />
      </section>

      {/* Regulatory Feed */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Feed normativo</h2>
            <p className="text-sm text-emerald-950/65">Aggiornamenti normativi rilevanti per la cooperativa</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {updates.map((update) => (
            <div key={update.id} className={`rounded-2xl border p-5 ${update.isRead ? "border-emerald-950/10 bg-[#f7f4ec]" : "border-emerald-700/30 bg-emerald-50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${impactClasses[update.impactLevel]}`}>
                      {update.impactLevel}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-emerald-950/65 shadow-sm">
                      {domainLabels[update.domain]}
                    </span>
                    {!update.isRead && (
                      <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-semibold text-white">NUOVO</span>
                    )}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-emerald-950">{update.title}</h3>
                  <p className="mt-1 text-sm text-emerald-950/65">{update.summary}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-950/55">
                <span>📰 {sourceLabels[update.source]}</span>
                <span>📋 {update.sourceRef}</span>
                <span>📅 {update.publicationDate}</span>
                {update.complianceDeadline && <span className="font-semibold text-amber-700">⏰ Scadenza: {update.complianceDeadline}</span>}
              </div>
              {update.actionRequired && (
                <div className="mt-3 rounded-xl bg-white/80 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Azione richiesta</p>
                  <p className="mt-1 text-emerald-950/75">{update.actionRequired}</p>
                </div>
              )}
              {update.affectedCrops.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {update.affectedCrops.map((crop) => (
                    <span key={crop} className="rounded-full bg-white px-2 py-0.5 text-xs text-emerald-950/65 shadow-sm">{crop}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </article>

      {/* Compliance Calendar */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Calendario conformità</h2>
            <p className="text-sm text-emerald-950/65">Scadenze e adempimenti ordinati per urgenza</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Scadenza</th>
                <th className="px-4 py-3 font-medium">Adempimento</th>
                <th className="px-4 py-3 font-medium">Dominio</th>
                <th className="px-4 py-3 font-medium">Campi</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priorità</th>
              </tr>
            </thead>
            <tbody>
              {calendar.map((item) => (
                <tr key={item.id} className="border-b border-emerald-950/5 last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-emerald-950">{item.deadline}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-emerald-950">{item.title}</p>
                    <p className="text-xs text-emerald-950/55">{item.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-emerald-950/65 shadow-sm">
                      {domainLabels[item.domain]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-950/75">{item.affectedFieldIds.length > 0 ? item.affectedFieldIds.length : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${calendarStatusClasses[item.status]}`}>{item.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.priority <= 2 ? "bg-rose-100 text-rose-800" : item.priority <= 4 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                      {item.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
