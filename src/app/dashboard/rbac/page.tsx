import { Check, Lock } from "lucide-react";
import dynamic from "next/dynamic";
import { StatCard } from "@/components/dashboard";
import {
  checkPermission,
  defaultCooperativeId,
  getActiveSessions,
  getAuditLog,
  getRoleHierarchy,
  permissions,
  type RBACRole,
} from "@/lib/rbac-data";

const RBACDetails = dynamic(() => import("./rbac-details"));

const roles = getRoleHierarchy();
const auditEntries = getAuditLog(defaultCooperativeId);
const sessions = getActiveSessions(defaultCooperativeId);
const permissionMap = new Map(permissions.map((permission) => [permission.id, permission]));

const permissionGroups = [
  {
    label: "Accessi",
    description: "Utenti, ruoli, audit e sessioni",
    items: [
      { id: "users.read", label: "Utenti" },
      { id: "users.write", label: "Modifica utenti" },
      { id: "roles.admin", label: "Ruoli" },
      { id: "audit_log.read", label: "Audit" },
      { id: "sessions.read", label: "Sessioni" },
    ],
  },
  {
    label: "Operazioni",
    description: "Campi, raccolta e logistica",
    items: [
      { id: "fields.read", label: "Campi lettura" },
      { id: "fields.write", label: "Campi scrittura" },
      { id: "harvest.read", label: "Raccolta lettura" },
      { id: "harvest.write", label: "Raccolta scrittura" },
      { id: "logistics.read", label: "Logistica" },
    ],
  },
  {
    label: "Monitoraggio",
    description: "Meteo, satellite, IoT e rischi",
    items: [
      { id: "weather.read", label: "Meteo" },
      { id: "satellite.read", label: "Satellite" },
      { id: "iot.read", label: "IoT" },
      { id: "intelligence.read", label: "Intelligence" },
      { id: "pest_warning.read", label: "Allerte fitosanitarie" },
    ],
  },
  {
    label: "Compliance",
    description: "Conformità, tracciabilità e norme",
    items: [
      { id: "compliance.read", label: "Compliance lettura" },
      { id: "compliance.write", label: "Compliance scrittura" },
      { id: "traceability.read", label: "Tracciabilità" },
      { id: "traceability.delete", label: "Delete lotti" },
      { id: "regulatory.read", label: "Radar normativo" },
    ],
  },
  {
    label: "Business",
    description: "Vendite, supply chain e margine",
    items: [
      { id: "marketplace.read", label: "Marketplace" },
      { id: "marketplace.write", label: "Pubblica catalogo" },
      { id: "financial.read", label: "Finanza" },
      { id: "commercial.read", label: "Commerciale" },
      { id: "supply_chain.read", label: "Supply chain" },
    ],
  },
  {
    label: "Governance",
    description: "Portale soci, forza lavoro e simulazioni",
    items: [
      { id: "governance.read", label: "Governance" },
      { id: "governance.admin", label: "Admin governance" },
      { id: "workforce.read", label: "Workforce lettura" },
      { id: "workforce.write", label: "Workforce scrittura" },
      { id: "simulator.write", label: "Simulatore" },
    ],
  },
] as const;

const roleBadgeClasses: Record<RBACRole, string> = {
  superadmin: "bg-violet-100 text-violet-800",
  cooperative_admin: "bg-emerald-100 text-emerald-800",
  farm_manager: "bg-sky-100 text-sky-800",
  agronomist: "bg-amber-100 text-amber-800",
  seasonal_worker: "bg-slate-100 text-slate-700",
  buyer: "bg-fuchsia-100 text-fuchsia-800",
};

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const auditWindowStart = new Date("2026-07-21T08:30:00+02:00").getTime();
const recentAuditCount = auditEntries.filter(
  (entry) => new Date(entry.timestamp).getTime() >= auditWindowStart
).length;

export default function RBACPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Accessi & ruoli
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Controllo multi-tenant con RBAC e isolamento cooperativo.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Matrice ruoli, audit trail, policy di segregazione dati e sessioni attive per mantenere
          separati tenant, aziende e buyer abilitati.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ruoli governati"
          value={String(roles.length)}
          change="Gerarchia completa da superadmin a stagionale"
          trend="up"
        />
        <StatCard
          label="Permessi gestiti"
          value={String(permissions.length)}
          change="Copertura moduli operativi, business e compliance"
          trend="neutral"
        />
        <StatCard
          label="Sessioni attive"
          value={String(sessions.length)}
          change="Tenant Romagna Unita filtrato lato server"
          trend="up"
        />
        <StatCard
          label="Eventi audit 24h"
          value={String(recentAuditCount)}
          change="Azioni privilegiate tracciate con IP e contesto"
          trend="neutral"
        />
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Matrice ruoli e permessi</h2>
            <p className="text-sm text-emerald-950/65">
              Permessi raggruppati per modulo con verifica puntuale grant per ruolo.
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Ruolo</th>
                {permissionGroups.map((group) => (
                  <th key={group.label} className="min-w-[220px] px-4 py-4 font-semibold">
                    <p className="text-emerald-950">{group.label}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-950/45">
                      {group.description}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {roles.map((role) => (
                <tr key={role.role}>
                  <td className="px-6 py-5 align-top">
                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClasses[role.role]}`}
                      >
                        {role.label}
                      </span>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-emerald-950/70">
                        {role.description}
                      </p>
                    </div>
                  </td>
                  {permissionGroups.map((group) => (
                    <td key={`${role.role}-${group.label}`} className="px-4 py-5 align-top">
                      <ul className="space-y-2">
                        {group.items.map((item) => {
                          const permission = permissionMap.get(item.id);
                          const granted = permission
                            ? checkPermission(role.role, permission.resource, permission.action)
                            : false;

                          return (
                            <li
                              key={`${role.role}-${item.id}`}
                              className="flex items-center gap-2 text-xs text-emerald-950/75"
                            >
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                                  granted
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <RBACDetails />
    </div>
  );
}
