import {
  Users,
  Shield,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getWorkers,
  getWorkerDocuments,
  getWorkerCertifications,
  getShiftsByDate,
  getWorkforceStats,
  getCertificationLabel,
  type WorkerDocument,
  type SafetyCertification,
} from "@/lib/workforce-data";

const stats = getWorkforceStats();
const workers = getWorkers();
const todayShifts = getShiftsByDate("2025-07-15");

const statusClasses: Record<string, string> = {
  attivo: "bg-emerald-100 text-emerald-800",
  in_onboarding: "bg-sky-100 text-sky-800",
  scaduto: "bg-rose-100 text-rose-800",
  inattivo: "bg-slate-100 text-slate-600",
};

const docStatusClasses: Record<string, string> = {
  valido: "bg-emerald-100 text-emerald-800",
  in_scadenza: "bg-amber-100 text-amber-800",
  scaduto: "bg-rose-100 text-rose-800",
  mancante: "bg-slate-100 text-slate-600",
};

const shiftStatusClasses: Record<string, string> = {
  programmato: "bg-sky-100 text-sky-800",
  in_corso: "bg-amber-100 text-amber-800",
  completato: "bg-emerald-100 text-emerald-800",
  assente: "bg-rose-100 text-rose-800",
};

export default function WorkforcePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Gestione forza lavoro
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Centro comando forza lavoro stagionale
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Gestione completa dei lavoratori stagionali: onboarding, turni, sicurezza, documenti e preparazione buste paga conforme al CCNL Agricoltura.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lavoratori attivi" value={String(stats.activeWorkers)} change={`${stats.totalWorkers} totali registrati`} trend="up" />
        <StatCard label="Turni oggi" value={String(stats.todayShifts)} change="Programmati per il 15/07" trend="neutral" />
        <StatCard label="Documenti in scadenza" value={String(stats.expiringDocuments)} change="Richiedono attenzione" trend={stats.expiringDocuments > 0 ? "down" : "up"} />
        <StatCard label="Compliance sicurezza" value={`${stats.complianceScore}%`} change="Certificazioni valide" trend="up" />
      </section>

      {/* Worker Registry */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Anagrafica lavoratori</h2>
              <p className="text-sm text-emerald-950/65">Registro completo con status documenti e certificazioni</p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Lavoratore</th>
                  <th className="px-4 py-3 font-medium">Ruolo</th>
                  <th className="px-4 py-3 font-medium">Nazionalità</th>
                  <th className="px-4 py-3 font-medium">Lingua</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ore stagione</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-emerald-950">{worker.firstName} {worker.lastName}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{worker.role}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{worker.nationality}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{worker.preferredLanguage}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[worker.status]}`}>{worker.status}</span>
                    </td>
                    <td className="px-4 py-3 text-emerald-950/75">{worker.hoursWorkedSeason}h (+{worker.overtimeHoursSeason}h str.)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Documenti & scadenze</h2>
              <p className="text-sm text-emerald-950/65">Permessi, contratti e certificazioni da monitorare</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {workers.flatMap((w) => {
              const docs = getWorkerDocuments(w.id);
              const certs = getWorkerCertifications(w.id);
              const items: (WorkerDocument | SafetyCertification)[] = [
                ...docs.filter((d) => d.status !== "valido"),
                ...certs.filter((c) => c.status !== "valido"),
              ];
              return items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-emerald-950">
                      {w.firstName} {w.lastName}
                    </p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${docStatusClasses[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-950/65">
                    {"type" in item && typeof item.type === "string" && (item.type === "sicurezza_base" || item.type === "fitosanitario" || item.type === "primo_soccorso" || item.type === "antincendio" || item.type === "trattorista")
                      ? getCertificationLabel(item.type)
                      : "type" in item ? item.type : ""}
                  </p>
                  <p className="mt-1 text-xs text-emerald-950/50">
                    Scadenza: {item.expiryDate}
                  </p>
                </div>
              ));
            })}
            {workers.flatMap((w) => [...getWorkerDocuments(w.id), ...getWorkerCertifications(w.id)]).filter((d) => d.status !== "valido").length === 0 && (
              <p className="py-8 text-center text-sm text-emerald-950/50">
                ✅ Tutti i documenti e le certificazioni sono in regola
              </p>
            )}
          </div>
        </article>
      </section>

      {/* Today's Shifts */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Turni di oggi — 15 luglio 2025</h2>
            <p className="text-sm text-emerald-950/65">Pianificazione e tracciamento ore con conformità CCNL</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Lavoratore</th>
                <th className="px-4 py-3 font-medium">Campo</th>
                <th className="px-4 py-3 font-medium">Orario</th>
                <th className="px-4 py-3 font-medium">Ore</th>
                <th className="px-4 py-3 font-medium">Pausa</th>
                <th className="px-4 py-3 font-medium">Attività</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {todayShifts.map((shift) => {
                const worker = workers.find((w) => w.id === shift.workerId);
                return (
                  <tr key={shift.id} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-emerald-950">{worker ? `${worker.firstName} ${worker.lastName}` : shift.workerId}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{shift.fieldId}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{shift.startTime}–{shift.endTime}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{shift.hoursWorked}h{shift.overtimeHours > 0 ? ` (+${shift.overtimeHours}h str.)` : ""}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{shift.breakMinutes} min</td>
                    <td className="px-4 py-3 text-emerald-950/75">{shift.taskDescription}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${shiftStatusClasses[shift.status]}`}>{shift.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>

      {/* Safety Certifications */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Certificazioni sicurezza</h2>
            <p className="text-sm text-emerald-950/65">Registro D.Lgs 81/2008 — corsi e abilitazioni</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Lavoratore</th>
                <th className="px-4 py-3 font-medium">Certificazione</th>
                <th className="px-4 py-3 font-medium">Ente</th>
                <th className="px-4 py-3 font-medium">Rilascio</th>
                <th className="px-4 py-3 font-medium">Scadenza</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {workers.flatMap((w) =>
                getWorkerCertifications(w.id).map((cert) => (
                  <tr key={cert.id} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-emerald-950">{w.firstName} {w.lastName}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{getCertificationLabel(cert.type)}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{cert.provider}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{cert.issuedDate}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{cert.expiryDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${docStatusClasses[cert.status]}`}>{cert.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
