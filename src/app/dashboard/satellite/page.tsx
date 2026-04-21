import { Map as MapIcon, Satellite, TrendingUp, TrendingDown, Eye, Cloud } from "lucide-react";
import { fields } from "@/lib/data";
import {
  ndviReadings,
  fieldBoundaries,
  cropHealthAlerts,
  upcomingPasses,
  getLatestNDVIByField,
  ndviToColor,
  healthStatusLabel,
} from "@/lib/satellite-data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

const fieldMap = new globalThis.Map(fields.map((f) => [f.id, f]));
const latestNDVI = getLatestNDVIByField(ndviReadings);
const boundaryMap = new globalThis.Map(fieldBoundaries.map((b) => [b.fieldId, b]));

const alertSeverityClasses = {
  info: "bg-sky-100 text-sky-800",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-rose-100 text-rose-800",
};

export default function SatellitePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Monitoraggio satellitare
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Vigore vegetativo e salute delle colture dallo spazio.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Indici NDVI da Copernicus Sentinel-2, mappe catastali e allerte automatiche
          per anomalie vegetative su tutti gli appezzamenti.
        </p>
      </section>

      {/* NDVI overview cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => {
          const ndvi = latestNDVI.get(field.id);
          const boundary = boundaryMap.get(field.id);
          if (!ndvi) return null;
          return (
            <article key={field.id} className="rounded-2xl border border-emerald-950/10 bg-white/90 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-emerald-950/60">{field.name}</p>
                  <p className="mt-1 text-xs text-emerald-950/45">{field.crop} · {field.areaHa} ha</p>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white text-sm font-bold"
                  style={{ backgroundColor: ndviToColor(ndvi.meanNDVI) }}
                >
                  {ndvi.meanNDVI.toFixed(2)}
                </div>
              </div>
              <p className="mt-3 text-sm font-medium" style={{ color: ndviToColor(ndvi.meanNDVI) }}>
                {healthStatusLabel(ndvi.healthStatus)}
              </p>
              <div className="mt-2 text-xs text-emerald-950/50">
                <p>Min: {ndvi.minNDVI.toFixed(2)} · Max: {ndvi.maxNDVI.toFixed(2)}</p>
                <p className="mt-1">
                  {shortDateFormatter.format(new Date(ndvi.date))} · Nuvole {ndvi.cloudCoverPercent}%
                </p>
                {boundary?.cadastralRef && (
                  <p className="mt-1">Catasto: {boundary.cadastralRef}</p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Field map placeholder + NDVI history */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <MapIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Mappa appezzamenti</h2>
              <p className="text-sm text-emerald-950/65">Confini catastali con overlay NDVI</p>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-6 flex h-72 items-center justify-center rounded-3xl border border-dashed border-emerald-700/30 bg-gradient-to-br from-emerald-50 to-lime-50 text-center">
            <div>
              <MapIcon className="mx-auto h-12 w-12 text-emerald-700/50" />
              <p className="mt-3 text-sm font-medium text-emerald-900/70">
                Mappa interattiva MapLibre GL
              </p>
              <p className="mt-1 text-xs text-emerald-900/50">
                Integrazione con catasto e layer Sentinel-2 NDVI
              </p>
              <p className="mt-2 text-xs text-emerald-800/40">
                Centro: 44.1490°N, 12.1340°E · Bertinoro (FC)
              </p>
            </div>
          </div>

          {/* NDVI history per field */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-emerald-950">Andamento NDVI nel tempo</h3>
            <div className="mt-4 space-y-4">
              {fields.map((field) => {
                const history = ndviReadings
                  .filter((r) => r.fieldId === field.id)
                  .sort((a, b) => a.date.localeCompare(b.date));
                if (history.length === 0) return null;
                const maxNDVI = Math.max(...history.map((r) => r.meanNDVI));

                return (
                  <div key={field.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <p className="text-sm font-semibold text-emerald-950">
                      {field.name} <span className="font-normal text-emerald-950/60">· {field.crop}</span>
                    </p>
                    <div className="mt-3 flex items-end gap-2">
                      {history.map((r) => (
                        <div key={r.id} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t-lg"
                            style={{
                              height: `${(r.meanNDVI / (maxNDVI || 1)) * 60}px`,
                              backgroundColor: ndviToColor(r.meanNDVI),
                              minHeight: "8px",
                            }}
                          />
                          <span className="text-[10px] text-emerald-950/50">
                            {shortDateFormatter.format(new Date(r.date))}
                          </span>
                          <span className="text-[10px] font-medium" style={{ color: ndviToColor(r.meanNDVI) }}>
                            {r.meanNDVI.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        {/* Alerts + upcoming passes */}
        <div className="space-y-6">
          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Allerte vegetative</h2>
                <p className="text-sm text-emerald-950/65">Anomalie NDVI rilevate</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {cropHealthAlerts.map((alert) => (
                <article key={alert.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-emerald-950">{alert.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${alertSeverityClasses[alert.severity]}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-950/70">{alert.detail}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-emerald-950/50">
                    <span>{dateFormatter.format(new Date(alert.date))}</span>
                    <span className="flex items-center gap-1">
                      {alert.ndviChange > 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-rose-600" />
                      )}
                      NDVI {alert.ndviChange > 0 ? "+" : ""}{alert.ndviChange.toFixed(2)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Satellite className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Passaggi satellitari</h2>
                <p className="text-sm text-emerald-950/65">Prossime acquisizioni Sentinel-2</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {upcomingPasses.map((pass) => (
                <div key={pass.id} className="flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div>
                    <p className="font-semibold text-emerald-950">{pass.satellite}</p>
                    <p className="mt-1 text-sm text-emerald-950/65">
                      {dateFormatter.format(new Date(pass.date))}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <Cloud className="h-4 w-4 text-emerald-950/50" />
                      <span className="text-sm text-emerald-950/65">{pass.cloudCover}%</span>
                    </div>
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      pass.usable ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"
                    }`}>
                      {pass.usable ? "Utilizzabile" : "Copertura nuvole"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
