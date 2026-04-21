import {
  Route,
  Truck,
  Fuel,
  Clock,
  MapPin,
  TrendingDown,
  Package,
  CircleDot,
} from "lucide-react";
import {
  harvestDeclarations,
  vehicles,
  optimizeRoute,
} from "@/lib/route-optimizer";

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

// Pre-compute optimized routes for demo
const demoRoute = optimizeRoute(harvestDeclarations, vehicles[0]);

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
          capacità, distanze e finestre temporali. Risparmio carburante misurabile.
        </p>
      </section>

      {/* Savings summary */}
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
        {/* Optimized route */}
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
            {/* Start */}
            <div className="flex items-start gap-4 py-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
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

            {/* Return */}
            <div className="flex items-start gap-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">
                H
              </div>
              <div>
                <p className="font-semibold text-emerald-950">Rientro Hub Forlì</p>
                <p className="text-sm text-emerald-950/60">Fine percorso</p>
              </div>
            </div>
          </div>
        </article>

        {/* Declarations + Vehicles */}
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
                    Finestra: {decl.timeWindowStart}–{decl.timeWindowEnd} ·{" "}
                    {dateFormatter.format(new Date(decl.readyDate))}
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
              {vehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div>
                    <p className="font-semibold text-emerald-950">{v.name}</p>
                    <p className="mt-1 text-xs text-emerald-950/55">
                      {v.plate} · {v.capacityTonnes} t
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      v.available ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"
                    }`}>
                      {v.available ? "Disponibile" : "In uso"}
                    </span>
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs text-emerald-950/50">
                      <Fuel className="h-3 w-3" />
                      €{v.fuelCostPerKm}/km
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
