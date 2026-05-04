import { CloudRain, CloudSun, ShieldAlert, Waves } from "lucide-react";
import { weatherData } from "@/lib/data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
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

const maxRain = Math.max(...weatherData.historicalRainfall.map((point) => point.mm));

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
        </p>
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
    </div>
  );
}
