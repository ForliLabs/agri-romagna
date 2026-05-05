import Link from "next/link";
import {
  Fuel,
  MapPin,
  Package,
  Route,
  TrendingDown,
  Truck,
  Clock,
  Snowflake,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  harvestDeclarations,
  optimizeRoute,
  vehicles,
} from "@/lib/route-optimizer";
import {
  logisticsDispatchRecommendations,
  logisticsFlowSummary,
} from "@/lib/operations-insights";
import { supplyChainLots } from "@/lib/supply-chain-data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const priorityClasses = {
  urgente: "bg-rose-100 text-rose-800",
  normale: "bg-emerald-50 text-emerald-800",
  flessibile: "bg-sky-100 text-sky-800",
};

const demoRoute = optimizeRoute(harvestDeclarations, vehicles[0]);
const lotsMissingRoute = supplyChainLots.filter((lot) => !lot.logisticsRouteLink);

export default function LogisticsPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Ottimizzazione logistica
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Ritiri ottimizzati per la cooperativa.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          I soci dichiarano i volumi pronti, il sistema calcola le route ottimali considerando
          capacità, distanze e finestre temporali. Iterazione 2: il planner evidenzia anche i lotti non ancora instradati.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Volume pronto"
          value={`${logisticsFlowSummary.readyVolumeTonnes.toLocaleString("it-IT")} t`}
          change="Dichiarazioni raccolto in coda al planner"
          trend="up"
        />
        <StatCard
          label="Capacità disponibile"
          value={`${logisticsFlowSummary.availableCapacityTonnes.toLocaleString("it-IT")} t`}
          change="Mezzi cooperativi subito prenotabili"
          trend="up"
        />
        <StatCard
          label="Lotti senza route"
          value={String(logisticsFlowSummary.pendingRouteLots)}
          change="Da collegare a viaggio o slot hub"
          trend="down"
        />
        <StatCard
          label="Fermate ottimizzate"
          value={String(logisticsFlowSummary.routeStops)}
          change="Stop calcolati sul giro demo principale"
          trend="neutral"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Dispatch board</h2>
              <p className="text-sm text-emerald-950/65">Mezzo consigliato, catena del freddo e motivazione per ogni ritiro</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {logisticsDispatchRecommendations.map((recommendation) => (
              <article key={recommendation.declarationId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-emerald-950">{recommendation.farmName}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          recommendation.status === "assegna-ora"
                            ? "bg-rose-100 text-rose-700"
                            : recommendation.status === "monitorare"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {recommendation.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-emerald-950/70">
                      {recommendation.crop} · {recommendation.volumeTonnes.toLocaleString("it-IT")} t · priorità {recommendation.priority}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-emerald-950/75">{recommendation.reason}</p>
                  </div>
                  <div className="grid gap-2 text-sm text-emerald-950/75 lg:text-right">
                    <p>
                      <span className="font-semibold text-emerald-950">Mezzo:</span> {recommendation.recommendedVehicle}
                    </p>
                    <p className="flex items-center gap-1 lg:justify-end">
                      <Snowflake className="h-3.5 w-3.5" />
                      {recommendation.coldChain ? "Catena del freddo richiesta" : "Carico ambiente"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/supply-chain"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Apri filiera orchestrata
            </Link>
            <Link
              href="/dashboard/harvest"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              Torna al piano raccolta
            </Link>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Lotti da instradare</h2>
              <p className="text-sm text-emerald-950/65">Gap tra filiera e planner viaggi</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {lotsMissingRoute.map((lot) => (
              <article key={lot.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{lot.crop}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 shadow-sm">
                    {lot.qualityGrade}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6">
                  Lotto senza route link attivo: serve un mezzo prima di avanzare oltre “{lot.lifecycle}”.
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-rose-700/80">
                  {dateFormatter.format(new Date(lot.harvestDate))} · {(lot.quantity / 1000).toLocaleString("it-IT")} t
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <p className="text-sm text-emerald-950/60">Distanza totale</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">{demoRoute.totalDistanceKm} km</p>
          <p className="mt-2 text-sm font-medium text-emerald-700">
            <TrendingDown className="mr-1 inline h-4 w-4" />
            -{demoRoute.savings.distanceReductionPercent}% vs route individuali
          </p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <p className="text-sm text-emerald-950/60">Carburante stimato</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">€{demoRoute.estimatedFuelCost}</p>
          <p className="mt-2 text-sm font-medium text-emerald-700">
            Risparmio €{demoRoute.savings.fuelSavedEuros}
          </p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <p className="text-sm text-emerald-950/60">Utilizzo capacità</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">{demoRoute.capacityUtilization}%</p>
          <p className="mt-2 text-sm text-emerald-950/55">
            {demoRoute.totalVolumeTonnes} / {vehicles[0].capacityTonnes} t
          </p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <p className="text-sm text-emerald-950/60">Tempo totale</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">
            {Math.floor(demoRoute.totalTimeMins / 60)}h {demoRoute.totalTimeMins % 60}min
          </p>
          <p className="mt-2 text-sm text-emerald-950/55">
            {demoRoute.stops.length} fermate
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Route className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Route ottimizzata</h2>
              <p className="text-sm text-emerald-950/65">
                {demoRoute.vehicleName} · {dateFormatter.format(new Date(demoRoute.date))}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <div className="flex items-start gap-4 py-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white">
                  H
                </div>
                <div className="h-8 w-0.5 bg-emerald-200" />
              </div>
              <div>
                <p className="font-semibold text-emerald-950">Hub cooperativo Forlì</p>
                <p className="text-sm text-emerald-950/60">Partenza ore 06:00</p>
              </div>
            </div>

            {demoRoute.stops.map((stop, i) => (
              <div key={stop.farmId} className="flex items-start gap-4 py-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                    {stop.order}
                  </div>
                  {i < demoRoute.stops.length - 1 && <div className="h-12 w-0.5 bg-emerald-200" />}
                </div>
                <div className="flex-1 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-emerald-950">{stop.farmName}</p>
                      <p className="mt-1 text-sm text-emerald-950/60">
                        <Clock className="mr-1 inline h-3.5 w-3.5" />
                        Arrivo {stop.arrivalTime} · Partenza {stop.departureTime}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                      {stop.volumeTonnes} t
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-emerald-950/50">
                    <span>
                      <MapPin className="mr-0.5 inline h-3 w-3" />
                      {stop.distanceFromPrevKm} km dal precedente
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white">
                H
              </div>
              <div>
                <p className="font-semibold text-emerald-950">Rientro Hub Forlì</p>
                <p className="text-sm text-emerald-950/60">Fine percorso</p>
              </div>
            </div>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Dichiarazioni raccolto</h2>
                <p className="text-sm text-emerald-950/65">Volumi pronti dai soci</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {harvestDeclarations.map((decl) => (
                <div key={decl.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-emerald-950">{decl.farmName}</p>
                      <p className="mt-1 text-sm text-emerald-950/60">
                        {decl.crop} · {decl.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                        {decl.volumeTonnes} t
                      </span>
                      <span className={`mt-1 block rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityClasses[decl.priority]}`}>
                        {decl.priority}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-emerald-950/50">
                    Finestra: {decl.timeWindowStart}–{decl.timeWindowEnd} · {dateFormatter.format(new Date(decl.readyDate))}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Parco mezzi</h2>
                <p className="text-sm text-emerald-950/65">Veicoli cooperativa</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div>
                    <p className="font-semibold text-emerald-950">{vehicle.name}</p>
                    <p className="mt-1 text-xs text-emerald-950/55">
                      {vehicle.plate} · {vehicle.capacityTonnes} t
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      vehicle.available ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"
                    }`}>
                      {vehicle.available ? "Disponibile" : "In uso"}
                    </span>
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs text-emerald-950/50">
                      <Fuel className="h-3 w-3" />
                      €{vehicle.fuelCostPerKm}/km
                    </p>
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
