import { Database, Users, Webhook, Workflow } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getActiveConsumers,
  getAPIMetrics,
  getAPIConsumers,
  getAPIEndpoints,
  getDataCatalog,
  getWebhookSubscriptions,
} from "@/lib/marketplace-api-data";

const metrics = getAPIMetrics();
const endpoints = getAPIEndpoints();
const consumers = getAPIConsumers();
const activeConsumers = getActiveConsumers();
const dataCatalog = getDataCatalog();
const webhookSubscriptions = getWebhookSubscriptions();

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

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

const consumerTypeLabels = {
  insurance: "Assicurazione",
  gdo_buyer: "Buyer GDO",
  research: "Ricerca",
  input_supplier: "Fornitore input",
  certification_body: "Ente certificatore",
};

const consumerStatusLabels = {
  active: "Attivo",
  suspended: "Sospeso",
  pending: "In onboarding",
};

const consumerStatusClasses = {
  active: "bg-emerald-100 text-emerald-800",
  suspended: "bg-rose-100 text-rose-800",
  pending: "bg-amber-100 text-amber-800",
};

const freshnessLabels = {
  real_time: "Real-time",
  hourly: "Oraria",
  daily: "Giornaliera",
  weekly: "Settimanale",
};

const anonymizationLabels = {
  individual: "Individuale",
  cooperative: "Cooperativa",
  zone: "Zona",
  regional: "Regionale",
};

const webhookStatusLabels = {
  active: "Attivo",
  paused: "In pausa",
};

const webhookStatusClasses = {
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
};

const consumerMap = new Map(consumers.map((consumer) => [consumer.id, consumer.name]));

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

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Consumer API</h2>
                <p className="text-sm text-emerald-950/65">
                  Assicurazioni, buyer, università e partner che consumano i dataset cooperativi.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Consumer</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Stato</th>
                  <th className="px-6 py-4 font-semibold">Usage</th>
                  <th className="px-6 py-4 font-semibold">Piano</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {consumers.map((consumer) => (
                  <tr key={consumer.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-emerald-950">{consumer.name}</p>
                      <p className="mt-1 text-xs text-emerald-950/55">{consumer.apiKey}</p>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {consumerTypeLabels[consumer.type]}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${consumerStatusClasses[consumer.status]}`}
                      >
                        {consumerStatusLabels[consumer.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {consumer.requestsToday.toLocaleString("it-IT")} oggi · {consumer.requestsMonth.toLocaleString("it-IT")} mese
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{consumer.plan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Webhook className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Webhook subscriptions</h2>
                <p className="text-sm text-emerald-950/65">
                  Eventi push verso sistemi esterni per supply, compliance e risk refresh.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Consumer</th>
                  <th className="px-6 py-4 font-semibold">Evento</th>
                  <th className="px-6 py-4 font-semibold">Ultima consegna</th>
                  <th className="px-6 py-4 font-semibold">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {webhookSubscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-emerald-950">
                        {consumerMap.get(subscription.consumerId) ?? subscription.consumerId}
                      </p>
                      <p className="mt-1 text-xs text-emerald-950/55">{subscription.url}</p>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{subscription.event}</td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {dateTimeFormatter.format(new Date(subscription.lastDelivered))}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${webhookStatusClasses[subscription.status]}`}
                      >
                        {webhookStatusLabels[subscription.status]}
                      </span>
                      <p className="mt-2 text-xs text-emerald-950/50">
                        {subscription.failureCount} errori consecutivi
                      </p>
                    </td>
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
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Catalogo data products</h2>
              <p className="text-sm text-emerald-950/65">
                Prodotti dati monetizzabili per supply intelligence, ESG, rese e compliance.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-6 lg:grid-cols-2 xl:grid-cols-3">
          {dataCatalog.map((product) => (
            <article key={product.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-emerald-950">{product.name}</h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
                  €{product.pricePerCall.toFixed(2)}/call
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-emerald-950/75">{product.description}</p>
              <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-emerald-950">Freshness:</span> {freshnessLabels[product.freshness]}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Anonimizzazione:</span>{" "}
                  {anonymizationLabels[product.anonymizationLevel]}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Consumer:</span> {product.consumers}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Call totali:</span>{" "}
                  {product.totalCalls.toLocaleString("it-IT")}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-emerald-950/65">
                {product.schema.map((field) => (
                  <span key={`${product.id}-${field}`} className="rounded-full bg-white px-3 py-1 shadow-sm">
                    {field}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
