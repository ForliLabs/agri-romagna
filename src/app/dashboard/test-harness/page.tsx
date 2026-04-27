import { BarChart3, GitBranch, ShieldCheck, TestTubes, Workflow } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { ciBuilds, getCoverageOverview, getTestSummary, testSuites } from "@/lib/test-harness-data";

const summary = getTestSummary();
const coverageOverview = getCoverageOverview();
const latestBuild = ciBuilds[0];

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const suiteStatusClasses = {
  stabile: "bg-emerald-100 text-emerald-800",
  attenzione: "bg-amber-100 text-amber-800",
  critico: "bg-rose-100 text-rose-800",
};

const buildStatusClasses = {
  success: "bg-emerald-100 text-emerald-800",
  failure: "bg-rose-100 text-rose-800",
  running: "bg-sky-100 text-sky-800",
  pending: "bg-slate-100 text-slate-700",
};

const buildStatusLabels = {
  success: "Successo",
  failure: "Fallita",
  running: "In esecuzione",
  pending: "In coda",
};

const stageStatusClasses = {
  success: "bg-emerald-50 text-emerald-800",
  failure: "bg-rose-100 text-rose-800",
  running: "bg-sky-100 text-sky-800",
  pending: "bg-slate-100 text-slate-700",
};

const typeLabels = {
  unit: "Unit",
  integration: "Integration",
  e2e: "E2E",
};

export default function TestHarnessPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Test & CI/CD
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Qualità continua per dashboard, API e motori decisionali.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Suite di test, pipeline build e copertura codice per verificare ogni modulo cooperativo
          prima del rilascio.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Test eseguiti"
          value={String(summary.totalTests)}
          change={`${summary.totalSuites} suite orchestrate nel harness`}
          trend="up"
        />
        <StatCard
          label="Pass rate"
          value={`${summary.passRate}%`}
          change={`${summary.failing} test falliti su ${summary.totalTests}`}
          trend={summary.failing > 0 ? "down" : "up"}
        />
        <StatCard
          label="Copertura media"
          value={`${summary.coverageAverage}%`}
          change={`${summary.healthySuites} suite in stato stabile`}
          trend="up"
        />
        <StatCard
          label="Stato pipeline"
          value={summary.runningBuilds > 0 ? `${summary.runningBuilds} run` : buildStatusLabels[summary.latestBuildStatus]}
          change={latestBuild ? `${latestBuild.branch} · ${latestBuild.commit}` : "Nessuna build recente"}
          trend={summary.latestBuildStatus === "failure" ? "down" : "neutral"}
        />
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <TestTubes className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Registro suite di test</h2>
            <p className="text-sm text-emerald-950/65">
              Stato per modulo, tipologia, copertura e ultimo run osservato in pipeline.
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Suite</th>
                <th className="px-4 py-4 font-semibold">Modulo</th>
                <th className="px-4 py-4 font-semibold">Tipo</th>
                <th className="px-4 py-4 font-semibold">Test</th>
                <th className="px-4 py-4 font-semibold">Pass/Fail</th>
                <th className="px-4 py-4 font-semibold">Coverage</th>
                <th className="px-4 py-4 font-semibold">Ultimo run</th>
                <th className="px-4 py-4 font-semibold">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {testSuites.map((suite) => (
                <tr key={suite.id}>
                  <td className="px-6 py-4 font-semibold text-emerald-950">{suite.name}</td>
                  <td className="px-4 py-4 text-emerald-950/75">{suite.module}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {typeLabels[suite.type]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-emerald-950/75">{suite.totalTests}</td>
                  <td className="px-4 py-4 text-emerald-950/75">
                    {suite.passing}/{suite.failing}
                    {suite.skipped > 0 ? ` · ${suite.skipped} skip` : ""}
                  </td>
                  <td className="px-4 py-4 text-emerald-950/75">{suite.coverage}%</td>
                  <td className="px-4 py-4 text-emerald-950/75">
                    {dateTimeFormatter.format(new Date(suite.lastRun))} · {suite.duration}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${suiteStatusClasses[suite.status]}`}
                    >
                      {suite.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Workflow className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Pipeline CI/CD recente</h2>
              <p className="text-sm text-emerald-950/65">
                Branch, commit, durata e stage con output sintetico per ogni build.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {ciBuilds.map((build) => (
              <article key={build.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
                      <GitBranch className="h-4 w-4" />
                      {build.branch}
                    </div>
                    <p className="mt-2 text-sm text-emerald-950/70">
                      Commit {build.commit} · avvio {dateTimeFormatter.format(new Date(build.startedAt))}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${buildStatusClasses[build.status]}`}
                    >
                      {buildStatusLabels[build.status]}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">
                      {build.duration ?? "in corso"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {build.stages.map((stage) => (
                    <div
                      key={`${build.id}-${stage.name}`}
                      className="rounded-2xl border border-emerald-950/10 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-emerald-950">{stage.name}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${stageStatusClasses[stage.status]}`}
                          >
                            {buildStatusLabels[stage.status]}
                          </span>
                          <span className="text-xs uppercase tracking-[0.16em] text-emerald-950/45">
                            {stage.duration ?? "pending"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-emerald-950/70">{stage.output}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Trend copertura per modulo</h2>
              <p className="text-sm text-emerald-950/65">
                Barre CSS su copertura aggregata linee, branch, funzioni e statement.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {coverageOverview.map((module) => (
              <article key={module.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-950">{module.module}</p>
                    <p className="mt-1 text-sm text-emerald-950/65">
                      Linee {module.lines}% · Branch {module.branches}% · Funzioni {module.functions}%
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {module.coverage}%
                  </div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                    style={{ width: `${module.coverage}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-emerald-950/45">
                  <span>{module.date}</span>
                  <span>Statement {module.statements}%</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4 text-sm text-emerald-950/70">
            <div className="flex items-center gap-2 font-semibold text-emerald-950">
              <ShieldCheck className="h-4 w-4" />
              Gate qualità
            </div>
            <p className="mt-2 leading-6">
              Il deploy preview si sblocca solo con pass rate &gt; 99%, zero errori TypeScript e build
              conclusa con successo.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
