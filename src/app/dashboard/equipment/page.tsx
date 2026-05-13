import {
  Wrench,
  Cog,
  Share2,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getEquipment,
  getMaintenanceHistory,
  getBookings,
  getEquipmentUtilization,
  getEquipmentStats,
  categoryLabels,
  statusClasses,
  bookingStatusClasses,
} from "@/lib/equipment-data";

const stats = getEquipmentStats();
const equipment = getEquipment();
const maintenance = getMaintenanceHistory();
const bookings = getBookings();
const utilization = getEquipmentUtilization();

const maintenanceTypeLabels: Record<string, string> = {
  tagliando: "Tagliando",
  riparazione: "Riparazione",
  calibrazione: "Calibrazione",
  revisione: "Revisione",
  sostituzione_parte: "Sostituzione parte",
};

export default function EquipmentPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Gestione attrezzature
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Gestione attrezzature & asset agricoli
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Registro macchine, manutenzione programmata, ammortamento, condivisione cooperativa e analisi utilizzo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attrezzature totali" value={String(stats.totalEquipment)} change={`${stats.operativeCount} operative`} trend="up" />
        <StatCard label="Valore patrimoniale" value={`€ ${(stats.totalValueEur / 1000).toFixed(0)}k`} change="Valore attuale netto" trend="neutral" />
        <StatCard label="Costi manutenzione" value={`€ ${stats.maintenanceCostYTD.toLocaleString("it-IT")}`} change="Anno corrente" trend="neutral" />
        <StatCard label="Utilizzo medio" value={`${stats.avgUtilizationPercent}%`} change={`${stats.sharedCount} condivise in cooperativa`} trend="up" />
      </section>

      {/* Equipment Registry */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Cog className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Parco macchine</h2>
            <p className="text-sm text-emerald-950/65">Registro completo con status, ore operative e prossima manutenzione</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Macchina</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Anno</th>
                <th className="px-4 py-3 font-medium">Ore</th>
                <th className="px-4 py-3 font-medium">Valore</th>
                <th className="px-4 py-3 font-medium">Prox. manut.</th>
                <th className="px-4 py-3 font-medium">Condiviso</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => (
                <tr key={eq.id} className="border-b border-emerald-950/5 last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-emerald-950">{eq.name}</p>
                    <p className="text-xs text-emerald-950/50">{eq.registrationNumber !== "—" ? eq.registrationNumber : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-emerald-950/75">{categoryLabels[eq.category]}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{eq.year}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{eq.operatingHours.toLocaleString("it-IT")}h</td>
                  <td className="px-4 py-3 text-emerald-950/75">€ {eq.currentValueEur.toLocaleString("it-IT")}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{eq.nextMaintenanceDate}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{eq.isSharedInCooperative ? "✓ Sì" : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[eq.status]}`}>{eq.status.replace("_", " ")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Maintenance History */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Storico manutenzioni</h2>
              <p className="text-sm text-emerald-950/65">Interventi recenti con costi e ricambi</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {maintenance.sort((a, b) => b.date.localeCompare(a.date)).map((m) => {
              const eq = equipment.find((e) => e.id === m.equipmentId);
              return (
                <div key={m.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-emerald-950">{eq?.name ?? m.equipmentId}</p>
                    <span className="text-sm font-bold text-amber-700">€ {m.costEur.toLocaleString("it-IT")}</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-950/55">
                    {maintenanceTypeLabels[m.type] ?? m.type} — {m.date} — {m.serviceProvider}
                  </p>
                  <p className="mt-1 text-sm text-emerald-950/75">{m.description}</p>
                  {m.partsReplaced.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.partsReplaced.map((part) => (
                        <span key={part} className="rounded-full bg-white px-2 py-0.5 text-xs text-emerald-950/65 shadow-sm">{part}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </article>

        {/* Utilization */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Analisi utilizzo</h2>
              <p className="text-sm text-emerald-950/65">Ore operative, tasso utilizzo e costo/ora</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {utilization.map((u) => (
              <div key={u.equipmentId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-950">{u.equipmentName}</p>
                  <span className="text-sm font-bold text-emerald-800">{u.utilizationPercent}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-950/10">
                  <div className={`h-full rounded-full ${u.utilizationPercent > 70 ? "bg-emerald-500" : u.utilizationPercent > 40 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${u.utilizationPercent}%` }} />
                </div>
                <div className="mt-2 flex gap-4 text-xs text-emerald-950/55">
                  <span>YTD: {u.currentHoursYTD}h / {u.annualHoursTarget}h</span>
                  <span>Inattivo: {u.idleDaysThisMonth}gg/mese</span>
                  <span>€ {u.costPerOperatingHour}/h</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Bookings */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Prenotazioni cooperative</h2>
            <p className="text-sm text-emerald-950/65">Condivisione macchine tra soci con calendario prenotazioni</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Macchina</th>
                <th className="px-4 py-3 font-medium">Richiedente</th>
                <th className="px-4 py-3 font-medium">Periodo</th>
                <th className="px-4 py-3 font-medium">Scopo</th>
                <th className="px-4 py-3 font-medium">Tariffa</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-emerald-950/5 last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-emerald-950">{b.equipmentName}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{b.requestingFarmName}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{b.startDate} → {b.endDate}</td>
                  <td className="px-4 py-3 text-emerald-950/75">{b.purpose}</td>
                  <td className="px-4 py-3 text-emerald-950/75">€ {b.dailyRentalEur}/gg</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${bookingStatusClasses[b.status]}`}>{b.status.replace("_", " ")}</span>
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
