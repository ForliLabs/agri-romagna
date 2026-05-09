import { History, Shield, Users2 } from "lucide-react";
import {
  dataIsolationRules,
  defaultCooperativeId,
  getActiveSessions,
  getAuditLog,
  type RBACRole,
} from "@/lib/rbac-data";

const auditEntries = getAuditLog(defaultCooperativeId);
const sessions = getActiveSessions(defaultCooperativeId);

const roleBadgeClasses: Record<RBACRole, string> = {
  superadmin: "bg-violet-100 text-violet-800",
  cooperative_admin: "bg-emerald-100 text-emerald-800",
  farm_manager: "bg-sky-100 text-sky-800",
  agronomist: "bg-amber-100 text-amber-800",
  seasonal_worker: "bg-slate-100 text-slate-700",
  buyer: "bg-fuchsia-100 text-fuchsia-800",
};

const roleLabels: Record<RBACRole, string> = {
  superadmin: "Superadmin",
  cooperative_admin: "Admin cooperativa",
  farm_manager: "Farm manager",
  agronomist: "Agronomo",
  seasonal_worker: "Stagionale",
  buyer: "Buyer",
};

const sessionStatusClasses = {
  active: "bg-emerald-100 text-emerald-800",
  idle: "bg-amber-100 text-amber-800",
  reauth_required: "bg-rose-100 text-rose-800",
};

const sessionStatusLabels = {
  active: "Attiva",
  idle: "Idle",
  reauth_required: "Re-auth richiesta",
};

const isolationClasses = {
  strict: "bg-emerald-50 text-emerald-800",
  flexible: "bg-sky-100 text-sky-800",
};

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function RBACDetails() {
  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Audit log recente</h2>
              <p className="text-sm text-emerald-950/65">
                Eventi ordinati per timestamp con dettaglio risorsa e contesto di sicurezza.
              </p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Data/ora</th>
                  <th className="px-4 py-3 font-medium">Utente</th>
                  <th className="px-4 py-3 font-medium">Azione</th>
                  <th className="px-4 py-3 font-medium">Risorsa</th>
                  <th className="px-4 py-3 font-medium">Dettaglio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {auditEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-emerald-950/75">
                      {dateTimeFormatter.format(new Date(entry.timestamp))}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-950">{entry.userName}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{entry.action}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{entry.resource}</td>
                    <td className="px-4 py-3 text-emerald-950/65">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Regole di isolamento dati</h2>
              <p className="text-sm text-emerald-950/65">
                Enforcement tenant-aware su utenti, lotti, insight e workforce.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {dataIsolationRules.map((rule) => (
              <article key={rule.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-950">{rule.resource}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-emerald-950/45">
                      Campo di enforcement: {rule.field}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${isolationClasses[rule.enforcement]}`}
                  >
                    {rule.enforcement === "strict" ? "Strict" : "Flexible"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-950/70">{rule.description}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Users2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Sessioni attive</h2>
            <p className="text-sm text-emerald-950/65">
              Utenti online del tenant con ruolo effettivo, IP e ultima attività osservata.
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Utente</th>
                <th className="px-4 py-3 font-medium">Ruolo</th>
                <th className="px-4 py-3 font-medium">Ultima attività</th>
                <th className="px-4 py-3 font-medium">Pagina</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-4 py-3 font-semibold text-emerald-950">{session.userName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClasses[session.role]}`}
                    >
                      {roleLabels[session.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-950/75">
                    {dateTimeFormatter.format(new Date(session.lastActivity))}
                  </td>
                  <td className="px-4 py-3 text-emerald-950/75">{session.currentPage}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{session.ipAddress}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${sessionStatusClasses[session.status]}`}
                    >
                      {sessionStatusLabels[session.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
