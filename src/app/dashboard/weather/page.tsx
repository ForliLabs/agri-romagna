import Link from "next/link";
import {
  CalendarClock,
  CloudRain,
  CloudSun,
  Route,
  ShieldAlert,
  Tractor,
  Waves,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { weatherData } from "@/lib/data";
import { weatherWorkflowWindows } from "@/lib/operations-insights";
import { WeatherCharts } from "./charts";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
});

const severityClasses = {
  bassa: "bg-emerald-50 text-emerald-800",
  media: "bg-amber-100 text-amber-800",
  alta: "bg-rose-100 text-rose-800",
};

const riverClasses = {
  normale: "bg-emerald-50 text-emerald-800",
  attenzione: "bg-amber-100 text-amber-800",
  preallarme: "bg-rose-100 text-rose-800",
};

const workflowLinkMap: Record<string, string> = {
  "Trattamenti fogliari": "/dashboard/spray-optimizer",
  "Raccolta manuale": "/dashboard/harvest",
  "Logistica cooperativa": "/dashboard/logistics",
  "Irrigazione notturna": "/dashboard/water",
};

const maxRain = Math.max(...weatherData.historicalRainfall.map((point) => point.mm));
const workflowBlocks = weatherWorkflowWindows.filter((window) => window.status === "bloccato").length;
const workflowWarnings = weatherWorkflowWindows.filter((window) => window.status === "monitorare").length;

export default function WeatherPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Meteo & rischi
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Scenario climatico e idrico sulla Romagna forlivese.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Previsioni a 7 giorni, fiumi monitorati e pannello di rischio per proteggere raccolto, accessi e logistica.
          In iterazione 2 il meteo diventa anche una cabina di regia per i workflow.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Osservazione più recente"
          value={timeFormatter.format(new Date(weatherData.current.observedAt))}
          change={`${weatherData.current.condition} · ${weatherData.current.temperatureC}°C`}
          trend="up"
        />
        <StatCard
          label="Workflow da monitorare"
          value={String(workflowWarnings)}
          change="Finestre operative che richiedono conferma"
          trend="down"
        />
        <StatCard
          label="Workflow bloccati"
          value={String(workflowBlocks)}
          change="Da ripianificare con planner e capisquadra"
          trend="down"
        />
        <StatCard
          label="Allerte attive"
          value={String(weatherData.alerts.filter((alert) => alert.severity !== "bassa").length)}
          change="Piena e grandine da presidiare"
          trend="neutral"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Stato corrente</p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-950">Forlì · condizioni correnti</h2>
              <p className="mt-2 text-sm text-emerald-950/65">Ultima lettura alle {timeFormatter.format(new Date(weatherData.current.observedAt))}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <CloudSun className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-emerald-950 p-5 text-white">
              <p className="text-sm text-emerald-50/75">{weatherData.current.condition}</p>
              <p className="mt-4 text-5xl font-black tracking-tight">{weatherData.current.temperatureC}°</p>
              <p className="mt-2 text-sm text-emerald-50/75">Umidità {weatherData.current.humidity}% · Vento {weatherData.current.windKmh} km/h</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Prob. pioggia</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{weatherData.current.precipitationChance}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm text-emerald-950/60">Pressione</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">{weatherData.current.pressureHpa} hPa</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4 sm:col-span-2">
                <p className="text-sm text-emerald-950/60">Focus operativo</p>
                <p className="mt-2 text-sm leading-6 text-emerald-950/75">
                  La cabina meteo segnala una settimana utile per coordinare trattamenti, raccolta e giri cooperativi senza duplicare i controlli su altri moduli.
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Finestre operative</h2>
              <p className="text-sm text-emerald-950/65">Raccomandazioni per squadra, irrigazione, logistica e raccolta</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {weatherWorkflowWindows.map((window) => (
              <article key={window.workflow} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-emerald-950">{window.workflow}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          window.status === "favorevole"
                            ? "bg-emerald-50 text-emerald-800"
                            : window.status === "monitorare"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {window.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-emerald-950">{window.recommendation}</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-950/70">{window.detail}</p>
                  </div>
                  <div className="text-sm text-emerald-950/70 sm:text-right">
                    <p className="font-semibold text-emerald-950">{window.recommendedDay}</p>
                    <Link
                      href={workflowLinkMap[window.workflow]}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600"
                    >
                      Apri modulo collegato
                      <Route className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <CloudSun className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Previsioni 7 giorni</h2>
              <p className="text-sm text-emerald-950/65">Forlì e cintura agricola</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {weatherData.forecast.map((day) => (
              <article key={day.date} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">{day.day}</p>
                    <p className="text-xs text-emerald-950/55">
                      {dateFormatter.format(new Date(day.date))}
                    </p>
                  </div>
                  <CloudRain className="h-5 w-5 text-emerald-700" />
                </div>
                <p className="mt-4 text-lg font-bold text-emerald-950">
                  {day.maxC}° / {day.minC}°
                </p>
                <p className="mt-2 text-sm text-emerald-950/75">{day.condition}</p>
                <p className="mt-1 text-xs text-emerald-950/55">Pioggia {day.rainProbability}%</p>
                <p className="mt-4 text-sm leading-6 text-emerald-950/70">{day.note}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Waves className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Livelli fiumi</h2>
              <p className="text-sm text-emerald-950/65">Montone e Rabbi</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {weatherData.rivers.map((river) => (
              <div key={river.name} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-emerald-950">{river.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riverClasses[river.status]}`}>
                    {river.status}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold text-emerald-950">{river.levelMeters.toFixed(2)} m</p>
                <p className="mt-2 text-sm text-emerald-950/70">
                  Soglia attenzione {river.thresholdMeters.toFixed(2)} m · Trend {river.trend}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Pannello rischi</h2>
              <p className="text-sm text-emerald-950/65">Gelo, grandine e piena</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {weatherData.alerts.map((alert) => (
              <article key={alert.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-emerald-950">{alert.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClasses[alert.severity]}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-950/75">{alert.detail}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-emerald-950/50">
                  {alert.type} · {alert.timeWindow}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/harvest"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              <Tractor className="h-4 w-4" />
              Verifica raccolta
            </Link>
            <Link
              href="/dashboard/logistics"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              <Route className="h-4 w-4" />
              Verifica logistica
            </Link>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <CloudRain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Storico piogge</h2>
              <p className="text-sm text-emerald-950/65">Andamento cumulato delle precipitazioni nelle ultime settimane.</p>
            </div>
          </div>
          <div className="mt-8 flex h-72 items-end justify-between gap-4 rounded-3xl border border-dashed border-emerald-950/15 bg-[#f7f4ec] px-6 py-5" role="img" aria-label="Grafico dello storico piogge espresso in millimetri">
            {weatherData.historicalRainfall.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                <div
                  className="w-full rounded-t-2xl bg-gradient-to-t from-emerald-800 to-emerald-300"
                  style={{ height: `${(point.mm / maxRain) * 180}px` }}
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-emerald-950">{point.label}</p>
                  <p className="text-xs text-emerald-950/55">{point.mm} mm</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <WeatherCharts
        rainfall={weatherData.historicalRainfall}
        forecast={weatherData.forecast}
      />
    </div>
  );
}
