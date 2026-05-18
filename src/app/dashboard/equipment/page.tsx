"use client";

import {
  Wrench,
  Cog,
  Share2,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { DataTable, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/ui/states";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  getEquipment,
  getMaintenanceHistory,
  getBookings,
  getEquipmentUtilization,
  getEquipmentStats,
  categoryLabels,
  statusClasses,
  bookingStatusClasses,
  type Equipment,
  type EquipmentBooking,
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

type EquipmentRow = Equipment & { [key: string]: unknown };
type BookingRow = EquipmentBooking & { [key: string]: unknown };

const equipmentColumns: Column<EquipmentRow>[] = [
  {
    key: "name",
    header: "Macchina",
    sortable: true,
    primary: true,
    render: (row) => (
      <div>
        <p className="font-semibold text-emerald-950">{row.name}</p>
        {row.registrationNumber !== "—" && (
          <p className="text-xs text-emerald-950/50">{row.registrationNumber}</p>
        )}
      </div>
    ),
  },
  {
    key: "category",
    header: "Categoria",
    sortable: true,
    render: (row) => <>{categoryLabels[row.category]}</>,
  },
  { key: "year", header: "Anno", sortable: true, getValue: (row) => row.year },
  {
    key: "operatingHours",
    header: "Ore",
    sortable: true,
    getValue: (row) => row.operatingHours,
    render: (row) => <>{row.operatingHours.toLocaleString("it-IT")}h</>,
  },
  {
    key: "currentValueEur",
    header: "Valore",
    sortable: true,
    getValue: (row) => row.currentValueEur,
    render: (row) => <>€ {row.currentValueEur.toLocaleString("it-IT")}</>,
    hideOnMobile: true,
  },
  { key: "nextMaintenanceDate", header: "Prox. manut.", hideOnMobile: true },
  {
    key: "isSharedInCooperative",
    header: "Condiviso",
    hideOnMobile: true,
    render: (row) => <>{row.isSharedInCooperative ? "✓ Sì" : "—"}</>,
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[row.status]}`}>
        {row.status.replace("_", " ")}
      </span>
    ),
  },
];

const bookingColumns: Column<BookingRow>[] = [
  { key: "equipmentName", header: "Macchina", sortable: true, primary: true },
  { key: "requestingFarmName", header: "Richiedente", sortable: true },
  {
    key: "startDate",
    header: "Periodo",
    render: (row) => <>{row.startDate} → {row.endDate}</>,
  },
  { key: "purpose", header: "Scopo", hideOnMobile: true },
  {
    key: "dailyRentalEur",
    header: "Tariffa",
    hideOnMobile: true,
    render: (row) => <>€ {row.dailyRentalEur}/gg</>,
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${bookingStatusClasses[row.status]}`}>
        {row.status.replace("_", " ")}
      </span>
    ),
  },
];

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
      <article>
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Cog className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Parco macchine</h2>
            <p className="text-sm text-emerald-950/65">Registro completo con status, ore operative e prossima manutenzione</p>
          </div>
        </div>
        {equipment.length === 0 ? (
          <EmptyState
            title="Nessuna attrezzatura registrata"
            description="Aggiungi la prima macchina per iniziare a gestire il parco attrezzature."
            icon={<Cog className="h-7 w-7" aria-hidden="true" />}
          />
        ) : (
          <DataTable<EquipmentRow>
            columns={equipmentColumns}
            data={equipment as EquipmentRow[]}
            keyField="id"
            searchable
            searchPlaceholder="Cerca macchina, categoria…"
            caption="Parco macchine con categoria, ore operative, valore e stato"
            emptyMessage="Nessuna attrezzatura corrisponde alla ricerca."
          />
        )}
      </article>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Maintenance History */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Wrench className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Storico manutenzioni</h2>
              <p className="text-sm text-emerald-950/65">Interventi recenti con costi e ricambi</p>
            </div>
          </div>
          {maintenance.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Nessuna manutenzione registrata"
                description="Gli interventi di manutenzione appariranno qui."
                icon={<Wrench className="h-7 w-7" aria-hidden="true" />}
              />
            </div>
          ) : (
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
          )}
        </article>

        {/* Utilization */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <TrendingUp className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Analisi utilizzo</h2>
              <p className="text-sm text-emerald-950/65">Ore operative, tasso utilizzo e costo/ora</p>
            </div>
          </div>
          {utilization.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Nessun dato di utilizzo"
                description="I dati di utilizzo delle attrezzature appariranno qui."
                icon={<TrendingUp className="h-7 w-7" aria-hidden="true" />}
              />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {utilization.map((u) => (
                <div key={u.equipmentId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-emerald-950">{u.equipmentName}</p>
                    <span className="text-sm font-bold text-emerald-800">{u.utilizationPercent}%</span>
                  </div>
                  <ProgressBar
                    value={u.utilizationPercent}
                    label={`Utilizzo ${u.equipmentName}: ${u.utilizationPercent}%`}
                    className="mt-2"
                  />
                  <div className="mt-2 flex gap-4 text-xs text-emerald-950/55">
                    <span>YTD: {u.currentHoursYTD}h / {u.annualHoursTarget}h</span>
                    <span>Inattivo: {u.idleDaysThisMonth}gg/mese</span>
                    <span>€ {u.costPerOperatingHour}/h</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* Bookings */}
      <article>
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <Share2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Prenotazioni cooperative</h2>
            <p className="text-sm text-emerald-950/65">Condivisione macchine tra soci con calendario prenotazioni</p>
          </div>
        </div>
        {bookings.length === 0 ? (
          <EmptyState
            title="Nessuna prenotazione"
            description="Le prenotazioni cooperative appariranno qui."
            icon={<Share2 className="h-7 w-7" aria-hidden="true" />}
          />
        ) : (
          <DataTable<BookingRow>
            columns={bookingColumns}
            data={bookings as BookingRow[]}
            keyField="id"
            searchable
            searchPlaceholder="Cerca macchina, richiedente…"
            caption="Prenotazioni cooperative con periodo, scopo e stato"
            emptyMessage="Nessuna prenotazione corrisponde alla ricerca."
          />
        )}
      </article>
    </div>
  );
}
