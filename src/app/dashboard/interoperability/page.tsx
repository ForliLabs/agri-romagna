import {
  ArrowUpRight,
  Database,
  Download,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { getInteropDashboard } from "@/lib/fmis-interop-data";

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const dashboard = getInteropDashboard();
const connectorCards = dashboard.systems.filter(
  (system) => system.name === "AGEA" || system.name === "SIAN" || system.name === "ARPAE"
);

const connectorStatusClasses = {
  connected: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  error: "bg-rose-100 text-rose-800",
};

const jobStatusClasses = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-sky-100 text-sky-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
};

export default function InteroperabilityPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Interoperabilità dati UE
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Export FMIS, connettori regolatori e standard pronti all&apos;uso.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Layer di interoperabilità per AGEA, SIAN e ARPAE con tracciati conformi ai principali standard agricoli europei.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Export recenti"
          value={String(dashboard.summary.totalJobs)}
          change={`${dashboard.summary.completedJobs} completati con successo`}
          trend="up"
        />
        <StatCard
          label="Connettori attivi"
          value={String(dashboard.summary.activeConnectors)}
          change="AGEA e ARPAE sincronizzati"
          trend="up"
        />
        <StatCard
          label="Export in coda"
          value={String(dashboard.summary.pendingExports)}
          change="Job pending o processing"
          trend="neutral"
        />
        <StatCard
          label="Standard supportati"
          value={String(dashboard.standards.length)}
          change="Copertura FMIS e sistemi pubblici"
          trend="up"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Waypoints className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Connettori sistema</h2>
              <p className="text-sm text-emerald-950/65">AGEA, SIAN e ARPAE</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {connectorCards.map((system) => (
              <article
                key={system.id}
                className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">{system.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-950/75">{system.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${connectorStatusClasses[system.status]}`}
                  >
                    {system.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-emerald-950/70 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-emerald-950">Ultimo sync:</span>{" "}
                    {dateTimeFormatter.format(new Date(system.lastSync))}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Record sincronizzati:</span>{" "}
                    {system.recordsSynced.toLocaleString("it-IT")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Formati export supportati</h2>
              <p className="text-sm text-emerald-950/65">Descrizioni e standard di riferimento</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {dashboard.formats.map((format) => (
              <article
                key={format.format}
                className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">{format.label}</h3>
                    <p className="mt-1 text-sm text-emerald-950/60">{format.standard}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                </div>
                <p className="mt-4 text-sm leading-6 text-emerald-950/75">{format.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-emerald-950/50">
                  {format.supportedEntities.join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Job export recenti</h2>
              <p className="text-sm text-emerald-950/65">Storico invii e generazione file</p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Formato</th>
                  <th className="px-4 py-3 font-medium">Scope</th>
                  <th className="px-4 py-3 font-medium">Stato</th>
                  <th className="px-4 py-3 font-medium">Record</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.jobs.map((job) => (
                  <tr key={job.id} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-emerald-950">{job.id}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{job.format}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{job.scope}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${jobStatusClasses[job.status]}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-950/75">{job.recordCount.toLocaleString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Checklist conformità</h2>
                <p className="text-sm text-emerald-950/65">Standard dati e copertura entità</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {dashboard.standards.map((standard) => (
                <div
                  key={standard.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                >
                  <div>
                    <p className="font-semibold text-emerald-950">{standard.name}</p>
                    <p className="mt-1 text-sm text-emerald-950/65">
                      {standard.standard} · {standard.version}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    OK
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Quick export</h2>
                <p className="text-sm text-emerald-950/65">Azioni rapide verso FMIS e enti</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {dashboard.formats.slice(0, 4).map((format) => (
                <button
                  key={format.format}
                  type="button"
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] px-4 py-4 text-left text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-50"
                >
                  <span className="block">{format.label}</span>
                  <span className="mt-1 block text-xs font-normal text-emerald-950/60">
                    Esporta ora
                  </span>
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
