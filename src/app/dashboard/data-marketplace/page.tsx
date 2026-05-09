import { Workflow } from "lucide-react";
import dynamic from "next/dynamic";
import { StatCard } from "@/components/dashboard";
import {
  getActiveConsumers,
  getAPIMetrics,
  getAPIConsumers,
  getAPIEndpoints,
} from "@/lib/marketplace-api-data";

const DataMarketplaceDetails = dynamic(() => import("./data-marketplace-details"));

const metrics = getAPIMetrics();
const endpoints = getAPIEndpoints();
const consumers = getAPIConsumers();
const activeConsumers = getActiveConsumers();

const categoryLabels = {
  supply: "Supply",
  risk: "Risk",
  esg: "ESG",
  yield: "Yield",
  compliance: "Compliance",
};

const categoryClasses = {
  supply: "bg-emerald-100 text-emerald-800",
  risk: "bg-amber-100 text-amber-800",
  esg: "bg-sky-100 text-sky-800",
  yield: "bg-violet-100 text-violet-800",
  compliance: "bg-rose-100 text-rose-800",
};

const pricingLabels = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
};

const pricingClasses = {
  free: "bg-slate-100 text-slate-700",
  basic: "bg-sky-100 text-sky-800",
  premium: "bg-emerald-100 text-emerald-800",
};

export default function DataMarketplacePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Data marketplace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Piattaforma API per dati cooperativi, insight e servizi esterni.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Il marketplace espone dataset aggregati verso assicurazioni, buyer, ricerca e organismi
          di certificazione con modelli tariffari, rate limit e webhook dedicati.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="API call oggi"
          value={metrics.callsToday.toLocaleString("it-IT")}
          change={`${metrics.totalCalls.toLocaleString("it-IT")} chiamate cumulative gestite`}
          trend="up"
        />
        <StatCard
          label="Consumer attivi"
          value={String(activeConsumers.length)}
          change={`${consumers.length} integrazioni registrate nel portale`}
          trend="up"
        />
        <StatCard
          label="Ricavi API"
          value={`€${metrics.revenue.toLocaleString("it-IT")}`}
          change={`Top consumer: ${metrics.topConsumer}`}
          trend="up"
        />
        <StatCard
          label="Latenza media"
          value={`${metrics.avgLatencyMs} ms`}
          change={`${metrics.errorRate.toLocaleString("it-IT")} % error rate complessivo`}
          trend={metrics.errorRate > 2 ? "down" : "neutral"}
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Workflow className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Endpoint API disponibili</h2>
              <p className="text-sm text-emerald-950/65">
                Catalogo endpoint per supply forecast, risk, ESG, rese e compliance.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Path</th>
                <th className="px-6 py-4 font-semibold">Metodo</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold">Rate limit</th>
                <th className="px-6 py-4 font-semibold">Prezzo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {endpoints.map((endpoint) => (
                <tr key={endpoint.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-emerald-950">{endpoint.path}</p>
                    <p className="mt-1 text-xs text-emerald-950/55">
                      {endpoint.description} · {endpoint.version}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{endpoint.method}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${categoryClasses[endpoint.category]}`}
                    >
                      {categoryLabels[endpoint.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{endpoint.rateLimit}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${pricingClasses[endpoint.pricing]}`}
                    >
                      {pricingLabels[endpoint.pricing]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <DataMarketplaceDetails />
    </div>
  );
}
