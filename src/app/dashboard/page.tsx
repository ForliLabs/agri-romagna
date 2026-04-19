import { CloudSun, Clock3, MapPinned, TriangleAlert } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { fields, harvestSchedule, recentActivity, weatherData } from "@/lib/data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

const nextHarvest = [...harvestSchedule].sort((a, b) =>
  a.plannedDate.localeCompare(b.plannedDate)
)[0];
const expectedVolume = fields.reduce((sum, field) => sum + field.expectedVolume, 0);
const activeAlerts = weatherData.alerts.filter(
  (alert) => alert.type !== "gelo" || alert.severity !== "bassa"
).length;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Dashboard aziendale
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            Centro di controllo per la giornata agricola.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
            Monitoraggio rapido di campi, raccolta e allerta meteo per l&apos;operatività quotidiana su Bertinoro e dintorni.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Campi attivi" value={String(fields.length)} change="Tutti presidiati oggi" trend="up" />
        <StatCard
          label="Raccolto previsto"
          value={`${expectedVolume.toLocaleString("it-IT")} t`}
          change="Somma stimata dei lotti in piano"
          trend="up"
        />
        <StatCard
          label="Allerte meteo"
          value={String(activeAlerts)}
          change="2 scenari da monitorare nelle prossime 72h"
          trend="neutral"
        />
        <StatCard
          label="Prossima raccolta"
          value={dateFormatter.format(new Date(nextHarvest.plannedDate))}
          change={`${nextHarvest.crop} · ${nextHarvest.crew}`}
          trend="up"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Meteo attuale
              </p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-950">Forlì · condizioni correnti</h2>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <CloudSun className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-emerald-950 p-5 text-white">
              <p className="text-sm text-emerald-50/75">{weatherData.current.condition}</p>
              <p className="mt-4 text-5xl font-black tracking-tight">{weatherData.current.temperatureC}°</p>
              <p className="mt-2 text-sm text-emerald-50/75">
                Osservazione delle{" "}
                {new Date(weatherData.current.observedAt).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Umidità</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{weatherData.current.humidity}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Vento</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{weatherData.current.windKmh} km/h</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Prob. pioggia</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{weatherData.current.precipitationChance}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Pressione</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{weatherData.current.pressureHpa} hPa</p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Attività recenti
              </p>
              <h2 className="text-2xl font-bold text-emerald-950">Feed operativo</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-emerald-950">{item.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {item.tag}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-emerald-950/70">{item.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-950/50">
                  <Clock3 className="h-3.5 w-3.5" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <MapPinned className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Stato dei campi</p>
            <h2 className="text-2xl font-bold text-emerald-950">Appezzamenti sotto controllo</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {fields.map((field) => (
            <article key={field.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-950">{field.name}</h3>
                  <p className="mt-1 text-sm text-emerald-950/65">
                    {field.crop} · {field.areaHa.toLocaleString("it-IT")} ha · {field.municipality}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                  {field.status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-emerald-950/75">{field.health}</p>
              <div className="mt-4 grid gap-3 text-sm text-emerald-950/70 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-emerald-950">Irrigazione:</span> {field.irrigation}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Raccolta stimata:</span>{" "}
                  {dateFormatter.format(new Date(field.expectedHarvest))}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
