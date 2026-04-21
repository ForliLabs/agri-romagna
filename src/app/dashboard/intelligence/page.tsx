import {
  Activity,
  ArrowRight,
  CloudSun,
  Radio,
  Satellite,
  ShieldCheck,
  Tractor,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getIntelligenceOverview,
  type FabricEventType,
} from "@/lib/intelligence-fabric";

const overview = getIntelligenceOverview();

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const eventTypeLabels: Record<FabricEventType, string> = {
  weather_update: "Meteo",
  sensor_reading: "IoT",
  ndvi_change: "NDVI",
  field_status_change: "Campo",
  harvest_event: "Raccolta",
  compliance_event: "Conformità",
};

const statusClasses = {
  ottimo: "bg-emerald-50 text-emerald-800",
  stabile: "bg-sky-100 text-sky-800",
  attenzione: "bg-amber-100 text-amber-800",
  critico: "bg-rose-100 text-rose-800",
};

const producerIcons = {
  "Centro meteo aziendale": CloudSun,
  "Rete sensori IoT": Radio,
  "Copernicus Sentinel-2": Satellite,
  "Registro conformità UE": ShieldCheck,
  "Piano raccolta cooperativa": Tractor,
  "Registro aziendale campi": Activity,
};

export default function IntelligencePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Tessuto intelligente
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Tessuto dati unico tra meteo, sensori, satelliti e conformità.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Il bus eventi coordina produttori e consumatori applicativi per dare una vista continua
          sullo stato di salute di ogni appezzamento.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Produttori attivi"
          value={String(overview.stats.producers.length)}
          change="Meteo, IoT, NDVI, raccolta e conformità"
          trend="up"
        />
        <StatCard
          label="Consumatori connessi"
          value={String(overview.stats.consumers.length)}
          change="Dashboard, API, motore rese e filiera"
          trend="up"
        />
        <StatCard
          label="Eventi tracciati"
          value={String(overview.stats.totalEvents)}
          change="Stream più recente del fabric"
          trend="neutral"
        />
        <StatCard
          label="Salute media campi"
          value={`${overview.healthSummary.averageHealthScore}/100`}
          change={`${overview.healthSummary.ottimo} campi in fascia ottima`}
          trend="up"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Flusso del fabric</h2>
              <p className="text-sm text-emerald-950/65">Produttori → Event bus → consumatori</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_auto_1fr_auto_1fr] xl:items-start">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Produttori
              </p>
              {overview.stats.producers.map((producer) => {
                const Icon = producerIcons[producer.name as keyof typeof producerIcons] ?? Activity;
                return (
                  <article
                    key={producer.name}
                    className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white p-2 shadow-sm">
                        <Icon className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-950">{producer.name}</p>
                        <p className="mt-1 text-sm text-emerald-950/65">
                          {producer.events} eventi · ultimo invio {dateTimeFormatter.format(new Date(producer.lastEventAt))}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden xl:flex items-center justify-center pt-16 text-emerald-600">
              <ArrowRight className="h-6 w-6" />
            </div>

            <article className="rounded-3xl border border-dashed border-emerald-950/15 bg-[#f7f4ec] p-5 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Event bus
              </p>
              <p className="mt-3 text-4xl font-black text-emerald-950">{overview.stats.totalEvents}</p>
              <p className="mt-1 text-sm text-emerald-950/60">messaggi in memoria</p>
              <div className="mt-5 grid gap-2 text-left">
                {Object.entries(overview.stats.byType).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-emerald-950">
                      {eventTypeLabels[type as FabricEventType]}
                    </span>
                    <span className="text-emerald-950/65">{count}</span>
                  </div>
                ))}
              </div>
            </article>

            <div className="hidden xl:flex items-center justify-center pt-16 text-emerald-600">
              <ArrowRight className="h-6 w-6" />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Consumatori
              </p>
              {overview.stats.consumers.map((consumer) => (
                <article
                  key={consumer.name}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                >
                  <p className="font-semibold text-emerald-950">{consumer.name}</p>
                  <p className="mt-1 text-sm text-emerald-950/65">
                    {consumer.deliveries} consegne · {consumer.eventTypes.map((type) => eventTypeLabels[type]).join(", ")}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Stream eventi recente</h2>
              <p className="text-sm text-emerald-950/65">Ultimi segnali ordinati per priorità temporale</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {overview.recentEvents.map((event) => (
              <article key={event.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-950">{event.title}</p>
                    <p className="mt-1 text-sm text-emerald-950/70">{event.detail}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {eventTypeLabels[event.type]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-emerald-950/50">
                  <span>{event.source}</span>
                  <span>{dateTimeFormatter.format(new Date(event.timestamp))}</span>
                  {"fieldId" in event && event.fieldId ? <span>{event.fieldId}</span> : null}
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Satellite className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Snapshot salute per campo</h2>
            <p className="text-sm text-emerald-950/65">Vista combinata meteo, IoT, NDVI, raccolta e conformità</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {overview.fieldSnapshots.map((snapshot) => (
            <article
              key={snapshot.fieldId}
              className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {snapshot.crop}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-emerald-950">{snapshot.fieldName}</h3>
                  <p className="mt-1 text-sm text-emerald-950/65">
                    Aggiornato {dateTimeFormatter.format(new Date(snapshot.updatedAt))}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[snapshot.overallStatus]}`}>
                  {snapshot.overallStatus}
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between text-sm font-medium text-emerald-950">
                  <span>Indice salute</span>
                  <span>{snapshot.healthScore}/100</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                    style={{ width: `${snapshot.healthScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <p className="text-sm text-emerald-950/60">Meteo</p>
                  <p className="mt-2 text-lg font-bold text-emerald-950">{snapshot.weather.temperatureC}°</p>
                  <p className="mt-1 text-sm text-emerald-950/65">{snapshot.weather.condition}</p>
                  <p className="mt-2 text-xs text-emerald-950/55">
                    Pioggia {snapshot.weather.precipitationChance}% · allerte {snapshot.weather.activeAlerts}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <p className="text-sm text-emerald-950/60">IoT</p>
                  <p className="mt-2 text-lg font-bold text-emerald-950">{snapshot.iot.onlineSensors}</p>
                  <p className="mt-1 text-sm text-emerald-950/65">sensori online</p>
                  <p className="mt-2 text-xs text-emerald-950/55">
                    Suolo {snapshot.iot.soilMoisture?.toLocaleString("it-IT") ?? "—"}% · warning {snapshot.iot.warningSensors}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <p className="text-sm text-emerald-950/60">Satellite</p>
                  <p className="mt-2 text-lg font-bold text-emerald-950">
                    {snapshot.satellite.currentNDVI?.toFixed(2) ?? "—"}
                  </p>
                  <p className="mt-1 text-sm text-emerald-950/65">
                    {snapshot.satellite.healthStatus ?? "Dato in attesa"}
                  </p>
                  <p className="mt-2 text-xs text-emerald-950/55">
                    Delta {snapshot.satellite.deltaNDVI?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <p className="text-sm text-emerald-950/60">Conformità</p>
                  <p className="mt-2 text-lg font-bold text-emerald-950">{snapshot.compliance.totalRecords}</p>
                  <p className="mt-1 text-sm text-emerald-950/65">pratiche collegate</p>
                  <p className="mt-2 text-xs text-emerald-950/55">{snapshot.compliance.status}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <p className="text-sm font-semibold text-emerald-950">Finestra operativa</p>
                  <p className="mt-3 text-sm text-emerald-950/70">
                    Raccolta {snapshot.harvest.plannedDate ? dateTimeFormatter.format(new Date(snapshot.harvest.plannedDate)) : "da definire"}
                  </p>
                  <p className="mt-2 text-sm text-emerald-950/70">
                    Volume atteso {snapshot.harvest.estimatedVolume?.toLocaleString("it-IT") ?? "—"} t
                  </p>
                  <p className="mt-2 text-sm text-emerald-950/70">Stato {snapshot.harvest.status ?? "non pianificato"}</p>
                </div>
                <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <p className="text-sm font-semibold text-emerald-950">Eventi chiave</p>
                  <div className="mt-3 space-y-2">
                    {snapshot.recentEvents.map((event) => (
                      <div key={event.id} className="rounded-2xl bg-white px-3 py-2 text-sm text-emerald-950/75 shadow-sm">
                        <span className="font-semibold text-emerald-950">{eventTypeLabels[event.type]}:</span> {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
