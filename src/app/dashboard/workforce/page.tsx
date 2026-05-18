"use client";

import {
  Users,
  Shield,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { DataTable, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/ui/states";
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

type WorkerRow = {
  id: string;
  fullName: string;
  role: string;
  nationality: string;
  preferredLanguage: string;
  status: string;
  hours: string;
  [key: string]: unknown;
};

const workerColumns: Column<WorkerRow>[] = [
  { key: "fullName", header: "Lavoratore", sortable: true, primary: true },
  { key: "role", header: "Ruolo", sortable: true },
  { key: "nationality", header: "Nazionalità", sortable: true },
  { key: "preferredLanguage", header: "Lingua", hideOnMobile: true },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[row.status] ?? ""}`}>
        {row.status}
      </span>
    ),
  },
  { key: "hours", header: "Ore stagione", hideOnMobile: true },
];

type ShiftRow = {
  id: string;
  workerName: string;
  fieldId: string;
  schedule: string;
  hours: string;
  breakMinutes: number;
  taskDescription: string;
  status: string;
  [key: string]: unknown;
};

const shiftColumns: Column<ShiftRow>[] = [
  { key: "workerName", header: "Lavoratore", sortable: true, primary: true },
  { key: "fieldId", header: "Campo" },
  { key: "schedule", header: "Orario" },
  { key: "hours", header: "Ore", hideOnMobile: true },
  {
    key: "breakMinutes",
    header: "Pausa",
    hideOnMobile: true,
    render: (row) => <>{row.breakMinutes} min</>,
  },
  { key: "taskDescription", header: "Attività", hideOnMobile: true },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${shiftStatusClasses[row.status] ?? ""}`}>
        {row.status}
      </span>
    ),
  },
];

type CertRow = {
  id: string;
  workerName: string;
  certLabel: string;
  provider: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
  [key: string]: unknown;
};

const certColumns: Column<CertRow>[] = [
  { key: "workerName", header: "Lavoratore", sortable: true, primary: true },
  { key: "certLabel", header: "Certificazione", sortable: true },
  { key: "provider", header: "Ente", hideOnMobile: true },
  { key: "issuedDate", header: "Rilascio", hideOnMobile: true },
  { key: "expiryDate", header: "Scadenza" },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${docStatusClasses[row.status] ?? ""}`}>
        {row.status}
      </span>
    ),
  },
];

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
        <article>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Users className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Anagrafica lavoratori</h2>
              <p className="text-sm text-emerald-950/65">Registro completo con status documenti e certificazioni</p>
            </div>
          </div>
          {workers.length === 0 ? (
            <EmptyState
              title="Nessun lavoratore registrato"
              description="Aggiungi il primo lavoratore per iniziare a gestire la forza lavoro."
              icon={<Users className="h-7 w-7" aria-hidden="true" />}
            />
          ) : (
            <DataTable<WorkerRow>
              columns={workerColumns}
              data={workers.map((w) => ({
                id: w.id,
                fullName: `${w.firstName} ${w.lastName}`,
                role: w.role,
                nationality: w.nationality,
                preferredLanguage: w.preferredLanguage,
                status: w.status,
                hours: `${w.hoursWorkedSeason}h (+${w.overtimeHoursSeason}h str.)`,
              }))}
              keyField="id"
              searchable
              searchPlaceholder="Cerca lavoratore, ruolo…"
              caption="Anagrafica lavoratori con ruolo, nazionalità e stato"
              emptyMessage="Nessun lavoratore corrisponde alla ricerca."
            />
          )}
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
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
      <article>
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Calendar className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Turni di oggi — 15 luglio 2025</h2>
            <p className="text-sm text-emerald-950/65">Pianificazione e tracciamento ore con conformità CCNL</p>
          </div>
        </div>
        {todayShifts.length === 0 ? (
          <EmptyState
            title="Nessun turno programmato"
            description="I turni programmati per oggi appariranno qui."
            icon={<Calendar className="h-7 w-7" aria-hidden="true" />}
          />
        ) : (
          <DataTable<ShiftRow>
            columns={shiftColumns}
            data={todayShifts.map((shift) => {
              const worker = workers.find((w) => w.id === shift.workerId);
              return {
                id: shift.id,
                workerName: worker ? `${worker.firstName} ${worker.lastName}` : shift.workerId,
                fieldId: shift.fieldId,
                schedule: `${shift.startTime}–${shift.endTime}`,
                hours: `${shift.hoursWorked}h${shift.overtimeHours > 0 ? ` (+${shift.overtimeHours}h str.)` : ""}`,
                breakMinutes: shift.breakMinutes,
                taskDescription: shift.taskDescription,
                status: shift.status,
              };
            })}
            keyField="id"
            caption="Turni di oggi con orario, ore, pausa e stato"
            emptyMessage="Nessun turno corrisponde alla ricerca."
          />
        )}
      </article>

      {/* Safety Certifications */}
      <article>
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <Shield className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Certificazioni sicurezza</h2>
            <p className="text-sm text-emerald-950/65">Registro D.Lgs 81/2008 — corsi e abilitazioni</p>
          </div>
        </div>
        {(() => {
          const certData: CertRow[] = workers.flatMap((w) =>
            getWorkerCertifications(w.id).map((cert) => ({
              id: cert.id,
              workerName: `${w.firstName} ${w.lastName}`,
              certLabel: getCertificationLabel(cert.type),
              provider: cert.provider,
              issuedDate: cert.issuedDate,
              expiryDate: cert.expiryDate,
              status: cert.status,
            }))
          );
          return certData.length === 0 ? (
            <EmptyState
              title="Nessuna certificazione"
              description="Le certificazioni di sicurezza appariranno qui."
              icon={<Shield className="h-7 w-7" aria-hidden="true" />}
            />
          ) : (
            <DataTable<CertRow>
              columns={certColumns}
              data={certData}
              keyField="id"
              searchable
              searchPlaceholder="Cerca lavoratore, certificazione…"
              caption="Certificazioni sicurezza con ente, date e stato"
              emptyMessage="Nessuna certificazione corrisponde alla ricerca."
            />
          );
        })()}
      </article>
    </div>
  );
}
