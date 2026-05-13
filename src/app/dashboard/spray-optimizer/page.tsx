import {
  Crosshair,
  MapPin,
  TrendingDown,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getManagementZones,
  getPrescriptions,
  getSeasonalSavings,
  getSprayOptimizerStats,
  stressClasses,
  prescriptionStatusClasses,
} from "@/lib/spray-optimizer-data";

const stats = getSprayOptimizerStats();
const prescriptions = getPrescriptions();
const zones = getManagementZones();
const savings = getSeasonalSavings();

export default function SprayOptimizerPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Agricoltura di precisione
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Ottimizzatore spray & input a rateo variabile
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Mappe di trattamento a zona variabile basate su NDVI, rischio fitosanitario e condizioni meteo. Riduzione input 20-40% con export ISOBUS.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Prescrizioni totali" value={String(stats.totalPrescriptions)} change={`${stats.appliedPrescriptions} applicate`} trend="up" />
        <StatCard label="Risparmio medio" value={`${stats.avgSavingsPercent}%`} change="Input ridotto vs applicazione uniforme" trend="up" />
        <StatCard label="Risparmio totale" value={`€ ${stats.totalSavingsEur}`} change="Questa stagione" trend="up" />
        <StatCard label="Riduzione p.a." value={`${stats.activeIngredientReductionKg} kg`} change="Principio attivo risparmiato" trend="up" />
      </section>

      {/* Management Zones */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Zone di gestione</h2>
              <p className="text-sm text-emerald-950/65">Cluster NDVI con rischio fitosanitario per zona</p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Campo / Zona</th>
                  <th className="px-4 py-3 font-medium">Area</th>
                  <th className="px-4 py-3 font-medium">NDVI</th>
                  <th className="px-4 py-3 font-medium">Stress</th>
                  <th className="px-4 py-3 font-medium">Rischio pest</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z.id} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-emerald-950">{z.fieldId} / Z{z.zoneIndex}</td>
                    <td className="px-4 py-3 text-emerald-950/75">{z.areaHa} ha</td>
                    <td className="px-4 py-3 text-emerald-950/75">{z.ndviAvg.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${stressClasses[z.stressLevel]}`}>{z.stressLevel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-12 overflow-hidden rounded-full bg-emerald-950/10">
                          <div className={`h-full rounded-full ${z.pestRisk > 60 ? "bg-rose-500" : z.pestRisk > 35 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${z.pestRisk}%` }} />
                        </div>
                        <span className="text-xs text-emerald-950/55">{z.pestRisk}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Seasonal Savings */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Risparmi stagionali</h2>
              <p className="text-sm text-emerald-950/65">Riduzione input per campo vs applicazione uniforme</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {savings.map((s) => (
              <div key={s.fieldId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-emerald-950">{s.fieldName}</h3>
                  <span className="text-lg font-bold text-emerald-700">-{s.savingsPercent}%</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-emerald-950/55">Uniforme</p>
                    <p className="font-medium text-emerald-950">{s.uniformTotalL} L</p>
                  </div>
                  <div>
                    <p className="text-emerald-950/55">Variabile</p>
                    <p className="font-medium text-emerald-700">{s.variableTotalL} L</p>
                  </div>
                  <div>
                    <p className="text-emerald-950/55">Risparmio</p>
                    <p className="font-medium text-emerald-700">€ {s.savingsEur}</p>
                  </div>
                  <div>
                    <p className="text-emerald-950/55">P.A. risparmiato</p>
                    <p className="font-medium text-emerald-700">{s.activeIngredientReductionKg} kg</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Prescriptions */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <Crosshair className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Prescrizioni di trattamento</h2>
            <p className="text-sm text-emerald-950/65">Rateo variabile per zona con confronto vs uniforme</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-emerald-950">{rx.product}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${prescriptionStatusClasses[rx.status]}`}>{rx.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-950/65">{rx.fieldName} — Target: {rx.targetPest}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-700">-{rx.savingsPercent}%</p>
                  <p className="text-xs text-emerald-950/55">€ {rx.savingsEur} risparmiati</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="text-sm">
                  <p className="text-emerald-950/55">Uniforme</p>
                  <p className="font-medium text-emerald-950">{rx.totalUniformL} L ({rx.uniformRateLPerHa} L/ha)</p>
                </div>
                <div className="text-sm">
                  <p className="text-emerald-950/55">Variabile</p>
                  <p className="font-medium text-emerald-700">{rx.totalVariableL} L</p>
                </div>
                <div className="text-sm">
                  <p className="text-emerald-950/55">Finestra spray</p>
                  <p className="font-medium text-emerald-950">{rx.weatherSuitable ? "✓ " : "✗ "}{rx.sprayWindowStart.split("T")[1]} – {rx.sprayWindowEnd.split("T")[1]}</p>
                </div>
              </div>
              {rx.variableRateZones.length > 0 && (
                <div className="mt-4 overflow-x-auto rounded-xl border border-emerald-950/10 bg-white/80">
                  <table className="min-w-full text-xs">
                    <thead className="border-b border-emerald-950/10 text-left text-emerald-950/50">
                      <tr>
                        <th className="px-3 py-2 font-medium">Zona</th>
                        <th className="px-3 py-2 font-medium">Area</th>
                        <th className="px-3 py-2 font-medium">Dose</th>
                        <th className="px-3 py-2 font-medium">Totale</th>
                        <th className="px-3 py-2 font-medium">Motivazione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rx.variableRateZones.map((zone) => (
                        <tr key={zone.zoneId} className="border-b border-emerald-950/5 last:border-b-0">
                          <td className="px-3 py-2 font-semibold text-emerald-950">Z{zone.zoneIndex}</td>
                          <td className="px-3 py-2 text-emerald-950/75">{zone.areaHa} ha</td>
                          <td className="px-3 py-2 text-emerald-950/75">{zone.rateLPerHa} L/ha</td>
                          <td className="px-3 py-2 text-emerald-950/75">{zone.totalL} L</td>
                          <td className="px-3 py-2 text-emerald-950/65">{zone.rationale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
