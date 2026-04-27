import { Bell, MessageSquare, Network, Sparkles } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  alertRules,
  getActiveAlerts,
  getTopInsights,
  insightResults,
  insightTemplates,
  nlQueries,
  type AlertCondition,
} from "@/lib/insight-engine-data";

const topInsights = getTopInsights(5);
const activeAlerts = getActiveAlerts();
const templateById = new Map(insightTemplates.map((template) => [template.id, template]));
const modulesCovered = new Set(insightTemplates.flatMap((template) => template.modules)).size;
const criticalAlertCount = insightResults.filter((insight) => insight.severity === "critical").length;
const nlQueriesToday = nlQueries.filter((query) => query.timestamp.startsWith("2026-07-22")).length;
const correlationInsights = getTopInsights(3).map((insight) => ({
  insight,
  template: templateById.get(insight.templateId),
}));

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const severityClasses = {
  critical: "bg-rose-100 text-rose-800",
  warning: "bg-amber-100 text-amber-800",
  info: "bg-sky-100 text-sky-800",
};

function formatConditionValue(value: AlertCondition["value"]) {
  return Array.isArray(value) ? value.join(" → ") : String(value);
}

function formatTrend(trend: "up" | "down" | "stable") {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}

function formatQueryResult(result: Record<string, string | number>) {
  return Object.entries(result)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Insight engine
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Correlazioni cross-module per resa, rischio, costi e compliance.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Il motore unifica query template, alert e interrogazioni in linguaggio naturale per
          generare raccomandazioni operative condivise tra cooperative, agronomi e buyer.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Insight attivi"
          value={String(insightResults.length)}
          change={`${insightTemplates.length} template interrogabili nel catalogo`}
          trend="up"
        />
        <StatCard
          label="Alert critici"
          value={String(criticalAlertCount)}
          change={`${activeAlerts.length} regole attive attualmente monitorate`}
          trend={criticalAlertCount > 0 ? "down" : "up"}
        />
        <StatCard
          label="Moduli coperti"
          value={String(modulesCovered)}
          change="Dati condivisi tra operations, finance, risk e compliance"
          trend="neutral"
        />
        <StatCard
          label="NL query oggi"
          value={String(nlQueriesToday)}
          change="Richieste analitiche tradotte in SQL operativo"
          trend="up"
        />
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Top insight generati</h2>
            <p className="text-sm text-emerald-950/65">
              Risultati più recenti e prioritari con campi coinvolti e raccomandazioni operative.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {topInsights.map((insight) => (
            <article key={insight.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {dateTimeFormatter.format(new Date(insight.generatedAt))}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-emerald-950">{insight.templateName}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClasses[insight.severity]}`}
                >
                  {insight.severity}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-950/50">
                {insight.affectedFields.map((field) => (
                  <span key={field} className="rounded-full bg-white px-3 py-1 shadow-sm">
                    {field}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {insight.findings.map((finding) => (
                  <div key={`${insight.id}-${finding.field}-${finding.metric}`} className="rounded-2xl border border-emerald-950/10 bg-white p-4">
                    <p className="font-semibold text-emerald-950">{finding.field}</p>
                    <p className="mt-1 text-sm text-emerald-950/70">{finding.metric}</p>
                    <p className="mt-3 text-sm text-emerald-950/75">
                      {finding.currentValue} vs soglia {finding.threshold}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-emerald-950/45">
                      Deviazione {finding.deviation} {formatTrend(finding.trend)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-emerald-950/10 bg-white p-4 text-sm leading-6 text-emerald-950/75">
                <span className="font-semibold text-emerald-950">Raccomandazione:</span> {insight.recommendation}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Regole di alert</h2>
              <p className="text-sm text-emerald-950/65">
                Condizioni monitorate, canali di notifica e ultimo trigger osservato.
              </p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Regola</th>
                  <th className="px-4 py-3 font-medium">Condizioni</th>
                  <th className="px-4 py-3 font-medium">Canali</th>
                  <th className="px-4 py-3 font-medium">Ultimo trigger</th>
                  <th className="px-4 py-3 font-medium">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {alertRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-4 py-3 font-semibold text-emerald-950">{rule.name}</td>
                    <td className="px-4 py-3 text-emerald-950/70">
                      {rule.conditions.map((condition) => (
                        <p key={`${rule.id}-${condition.module}-${condition.metric}`}>
                          {condition.module}.{condition.metric} {condition.operator} {formatConditionValue(condition.value)} · {condition.timeWindow}
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-emerald-950/70">{rule.channels.join(", ")}</td>
                    <td className="px-4 py-3 text-emerald-950/70">
                      {dateTimeFormatter.format(new Date(rule.lastTriggered))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          rule.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {rule.active ? "Attiva" : "Pausa"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Correlazioni cross-module</h2>
              <p className="text-sm text-emerald-950/65">
                Connessioni chiave tra moduli che accelerano la decisione operativa.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {correlationInsights.map(({ insight, template }) => (
              <article key={insight.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-950/50">
                  {(template?.modules ?? []).map((module) => (
                    <span key={`${insight.id}-${module}`} className="rounded-full bg-white px-3 py-1 shadow-sm">
                      {module}
                    </span>
                  ))}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-emerald-950">{insight.templateName}</h3>
                <p className="mt-2 text-sm text-emerald-950/70">
                  {insight.findings
                    .map((finding) => `${finding.metric} ${formatTrend(finding.trend)}`)
                    .join(" · ")}
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-950/75">{insight.recommendation}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Query in linguaggio naturale</h2>
            <p className="text-sm text-emerald-950/65">
              Esempi reali di domande tradotte in SQL con risultati immediatamente leggibili.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {nlQueries.map((query) => (
            <article key={query.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <p className="font-semibold text-emerald-950">{query.query}</p>
              <p className="mt-2 rounded-2xl bg-white px-3 py-3 text-sm leading-6 text-emerald-950/70 shadow-sm">
                {query.translatedSQL}
              </p>
              <div className="mt-3 space-y-2 text-sm text-emerald-950/75">
                {query.results.map((result, index) => (
                  <div key={`${query.id}-${index}`} className="rounded-2xl border border-emerald-950/10 bg-white px-3 py-2">
                    {formatQueryResult(result as Record<string, string | number>)}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-emerald-950/45">
                {dateTimeFormatter.format(new Date(query.timestamp))} · user {query.userId}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
