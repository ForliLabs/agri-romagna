import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, Truck, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { crewAssignments, fields, harvestSchedule } from "@/lib/data";
import { harvestCrewLoads, harvestReadinessBoard } from "@/lib/operations-insights";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const fieldMap = new Map(fields.map((field) => [field.id, field]));
const averageReadiness = Math.round(
  harvestReadinessBoard.reduce((sum, item) => sum + item.readinessScore, 0) / harvestReadinessBoard.length
);

export default function HarvestPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Gestione raccolta
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Calendario, squadre e qualità dei conferimenti.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Pianificazione delle prossime raccolte con dettaglio operativo per vigneti, frutteto e seminativo.
          Ora ogni lotto mostra prontezza, blocchi e mezzo consigliato.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Volume pianificato"
          value={`${harvestSchedule.reduce((sum, item) => sum + item.estimatedVolume, 0).toLocaleString("it-IT")} t`}
          change="Tutti i lotti in calendario"
          trend="up"
        />
        <StatCard label="Prontezza media" value={`${averageReadiness}%`} change="Indice combinato qualità, squadra e logistica" trend="neutral" />
        <StatCard
          label="Lotti da sbloccare"
          value={String(harvestReadinessBoard.filter((item) => item.blockers.length > 0).length)}
          change="Richiedono conferma prima del via libera"
          trend="down"
        />
        <StatCard label="Squadre attive" value={String(harvestCrewLoads.length)} change="Turni già composti sul piano" trend="up" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Readiness board</h2>
              <p className="text-sm text-emerald-950/65">Per ogni raccolta: stato, blocchi, destinazione e mezzo consigliato</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {harvestReadinessBoard.map((item) => (
              <article key={item.harvestId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-emerald-950">{item.crop}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.readinessScore >= 85
                            ? "bg-emerald-50 text-emerald-800"
                            : item.readinessScore >= 70
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        readiness {item.readinessScore}%
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-emerald-950/70">
                      {item.fieldName} · {dateFormatter.format(new Date(item.plannedDate))} · {item.crew}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-emerald-950/75">{item.nextAction}</p>
                  </div>
                  <div className="grid gap-2 text-sm text-emerald-950/75 lg:text-right">
                    <p>
                      <span className="font-semibold text-emerald-950">Destinazione:</span> {item.destination}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Mezzo:</span> {item.vehiclePlan}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Viaggi:</span> {item.estimatedTrips || 1}
                    </p>
                  </div>
                </div>
                {item.blockers.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm text-rose-800">
                    {item.blockers.map((blocker) => (
                      <li key={blocker} className="rounded-2xl bg-rose-50 px-3 py-2">
                        {blocker}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    Flusso pronto: puoi confermare qualità, squadra e partenza dal planner logistico.
                  </p>
                )}
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/logistics"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Apri dispatch logistico
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/weather"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              Rivedi finestra meteo
            </Link>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Capacità squadre</h2>
              <p className="text-sm text-emerald-950/65">Carico per persona e copertura turni</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {harvestCrewLoads.map((load) => (
              <article key={load.team} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-emerald-950">{load.team}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {load.members} addetti
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-emerald-950/75 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-emerald-950">Volume assegnato:</span> {load.assignedTonnes.toLocaleString("it-IT")} t
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Task aperti:</span> {load.assignmentCount}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="font-semibold text-emerald-950">Indice carico:</span> {load.loadPerPerson.toLocaleString("it-IT")} t per persona
                  </p>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Calendario raccolte</h2>
              <p className="text-sm text-emerald-950/65">Prossimi lotti in finestra operativa</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {harvestSchedule.map((item) => {
              const field = fieldMap.get(item.fieldId);
              const readiness = harvestReadinessBoard.find((candidate) => candidate.harvestId === item.id);
              return (
                <article key={item.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {dateFormatter.format(new Date(item.plannedDate))}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-emerald-950">{item.crop}</h3>
                      <p className="mt-1 text-sm text-emerald-950/70">
                        {field?.name} · {field?.municipality} · {item.estimatedVolume.toLocaleString("it-IT")} t attese
                      </p>
                    </div>
                    <div className="space-y-2 text-sm text-emerald-950/75 md:text-right">
                      <p>
                        <span className="font-semibold text-emerald-950">Squadra:</span> {item.crew}
                      </p>
                      <p>
                        <span className="font-semibold text-emerald-950">Stato:</span> {item.status}
                      </p>
                      <p>
                        <span className="font-semibold text-emerald-950">Readiness:</span> {readiness?.readinessScore ?? 0}%
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Pianificazione squadre</h2>
              <p className="text-sm text-emerald-950/65">Turni e capacità operative</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {crewAssignments.map((assignment) => {
              const field = fieldMap.get(assignment.fieldId);
              const readiness = harvestReadinessBoard.find((candidate) => candidate.fieldId === assignment.fieldId);
              return (
                <article key={assignment.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-emerald-950">{assignment.team}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                      {assignment.members} addetti
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-emerald-950/75">{assignment.task}</p>
                  <div className="mt-3 grid gap-2 text-sm text-emerald-950/65 sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-emerald-950">Data:</span>{" "}
                      {dateFormatter.format(new Date(assignment.date))}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Turno:</span> {assignment.shift}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Campo:</span> {field?.name}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Esito atteso:</span> {readiness?.destination ?? "Hub cooperativo"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Controllo qualità</h2>
            <p className="text-sm text-emerald-950/65">
              Uva: grado zuccherino e acidità · Frutta: calibro e maturazione
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-4 py-3 font-semibold">Coltura</th>
                <th className="px-4 py-3 font-semibold">Appezzamento</th>
                <th className="px-4 py-3 font-semibold">Grado zuccherino</th>
                <th className="px-4 py-3 font-semibold">Acidità</th>
                <th className="px-4 py-3 font-semibold">Calibro</th>
                <th className="px-4 py-3 font-semibold">Maturazione</th>
                <th className="px-4 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {harvestSchedule.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 font-semibold text-emerald-950">{item.crop}</td>
                  <td className="px-4 py-4 text-emerald-950/75">{fieldMap.get(item.fieldId)?.name}</td>
                  <td className="px-4 py-4 text-emerald-950/75">{item.quality.gradeZuccherino ?? "—"}</td>
                  <td className="px-4 py-4 text-emerald-950/75">{item.quality.acidita ?? "—"}</td>
                  <td className="px-4 py-4 text-emerald-950/75">{item.quality.calibro ?? "—"}</td>
                  <td className="px-4 py-4 text-emerald-950/75">{item.quality.maturazione ?? "—"}</td>
                  <td className="px-4 py-4 text-emerald-950/75">{item.quality.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
