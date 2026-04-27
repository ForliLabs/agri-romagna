import {
  CloudSun,
  Crosshair,
  MessageSquare,
  Radio,
  Shovel,
  Smartphone,
  Tractor,
  Users,
  Wrench,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { fields } from "@/lib/data";
import {
  getDeviceCapabilities,
  getMobileFeatures,
  getOfflineQueue,
  getSyncHistory,
  getSyncStatus,
} from "@/lib/mobile-field-data";

const mobileFeatures = getMobileFeatures();
const offlineQueue = getOfflineQueue();
const deviceCapabilities = getDeviceCapabilities();
const syncStatus = getSyncStatus();
const syncHistory = getSyncHistory();

const fieldMap = new Map(fields.map((field) => [field.id, field.name]));

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const featureIcons = {
  CloudSun,
  Radio,
  Tractor,
  Users,
  Wrench,
  Crosshair,
  Shovel,
  MessageSquare,
};

const syncStatusLabels = {
  synced: "Sincronizzato",
  pending: "In coda",
  offline: "Offline",
};

const syncStatusClasses = {
  synced: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  offline: "bg-rose-100 text-rose-800",
};

const queueStatusLabels = {
  pending: "In attesa",
  retrying: "Nuovo tentativo",
  failed: "Fallito",
};

const queueStatusClasses = {
  pending: "bg-amber-100 text-amber-800",
  retrying: "bg-sky-100 text-sky-800",
  failed: "bg-rose-100 text-rose-800",
};

const queueTypeLabels = {
  clock_in: "Clock-in",
  maintenance_log: "Manutenzione",
  spray_record: "Trattamento",
  soil_sample: "Campione suolo",
  harvest_check: "Check raccolta",
  photo_capture: "Foto rilievo",
};

const permissionLabels = {
  granted: "Consentito",
  denied: "Negato",
  prompt: "Da richiedere",
};

const permissionClasses = {
  granted: "bg-emerald-100 text-emerald-800",
  denied: "bg-rose-100 text-rose-800",
  prompt: "bg-amber-100 text-amber-800",
};

const successRate = Math.round(
  (syncStatus.totalSynced / (syncStatus.totalSynced + syncStatus.totalFailed)) * 100,
);
const storageUsage = Math.round((syncStatus.storageUsedMB / syncStatus.storageQuotaMB) * 100);
const grantedPermissions = deviceCapabilities.filter(
  (capability) => capability.permission === "granted",
).length;

export default function MobilePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Mobile campo
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Esperienza field-first per operatori, capisquadra e tecnici in mobilità.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Presenze, rilievi, trattamenti e controlli qualità restano operativi anche offline, con
          sincronizzazione assistita quando la connettività torna disponibile.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Operazioni offline"
          value={String(syncStatus.totalQueued)}
          change="Form e rilievi in attesa di invio"
          trend={syncStatus.totalQueued > 0 ? "down" : "up"}
        />
        <StatCard
          label="Stato sync"
          value={`${successRate}%`}
          change={`Ultimo allineamento ${dateTimeFormatter.format(new Date(syncStatus.lastSyncAt))}`}
          trend="up"
        />
        <StatCard
          label="Storage usato"
          value={`${syncStatus.storageUsedMB} MB`}
          change={`${storageUsage}% della quota locale disponibile`}
          trend={storageUsage > 80 ? "down" : "neutral"}
        />
        <StatCard
          label="Capacità device"
          value={`${deviceCapabilities.filter((capability) => capability.supported).length}/${deviceCapabilities.length}`}
          change={`${grantedPermissions} permessi già concessi sul dispositivo`}
          trend="up"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Funzioni mobile di campo</h2>
              <p className="text-sm text-emerald-950/65">
                Moduli disponibili per meteo, IoT, raccolta, workforce, attrezzature e registri.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Funzione</th>
                <th className="px-6 py-4 font-semibold">Descrizione</th>
                <th className="px-6 py-4 font-semibold">Offline</th>
                <th className="px-6 py-4 font-semibold">Sync</th>
                <th className="px-6 py-4 font-semibold">Ultimo sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {mobileFeatures.map((feature) => {
                const Icon = featureIcons[feature.icon as keyof typeof featureIcons] ?? Smartphone;
                return (
                  <tr key={feature.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-800">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-emerald-950">{feature.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{feature.description}</td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {feature.offlineCapable ? "Supportato" : "Solo online"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${syncStatusClasses[feature.syncStatus]}`}
                      >
                        {syncStatusLabels[feature.syncStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {dateTimeFormatter.format(new Date(feature.lastSync))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Coda operazioni offline</h2>
                <p className="text-sm text-emerald-950/65">
                  Azioni salvate sul device e in attesa di conferma sul backend cooperativo.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Operazione</th>
                  <th className="px-6 py-4 font-semibold">Campo</th>
                  <th className="px-6 py-4 font-semibold">Creato il</th>
                  <th className="px-6 py-4 font-semibold">GPS</th>
                  <th className="px-6 py-4 font-semibold">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {offlineQueue.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-semibold text-emerald-950">
                      {queueTypeLabels[item.type]}
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {fieldMap.get(item.fieldId) ?? item.fieldId}
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {dateTimeFormatter.format(new Date(item.createdAt))}
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {item.gpsCoords.lat.toFixed(4)}, {item.gpsCoords.lng.toFixed(4)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${queueStatusClasses[item.syncStatus]}`}
                      >
                        {queueStatusLabels[item.syncStatus]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Capacità del dispositivo</h2>
                <p className="text-sm text-emerald-950/65">
                  Permessi e funzionalità hardware disponibili per il lavoro in campo.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Capacità</th>
                  <th className="px-6 py-4 font-semibold">Supporto</th>
                  <th className="px-6 py-4 font-semibold">Permesso</th>
                  <th className="px-6 py-4 font-semibold">Uso previsto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {deviceCapabilities.map((capability) => (
                  <tr key={capability.id}>
                    <td className="px-6 py-4 font-semibold text-emerald-950">{capability.name}</td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {capability.supported ? "Disponibile" : "Non disponibile"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${permissionClasses[capability.permission]}`}
                      >
                        {permissionLabels[capability.permission]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{capability.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Crosshair className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Storico sincronizzazioni</h2>
              <p className="text-sm text-emerald-950/65">
                Ultimi eventi di allineamento con esiti positivi e anomalie residue.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Completato</th>
                <th className="px-6 py-4 font-semibold">Modalità</th>
                <th className="px-6 py-4 font-semibold">Processati</th>
                <th className="px-6 py-4 font-semibold">Successi</th>
                <th className="px-6 py-4 font-semibold">Fallimenti</th>
                <th className="px-6 py-4 font-semibold">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {syncHistory.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 font-semibold text-emerald-950">
                    {dateTimeFormatter.format(new Date(event.completedAt))}
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{event.mode}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{event.queuedProcessed}</td>
                  <td className="px-6 py-4 text-emerald-700">{event.successCount}</td>
                  <td className="px-6 py-4 text-rose-700">{event.failureCount}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{event.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
