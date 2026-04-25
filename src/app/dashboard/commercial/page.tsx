import {
  Handshake,
  TrendingUp,
  BarChart3,
  Award,
  Target,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getContracts,
  getDemandForecasts,
  getMarketPrices,
  getQualityPremiums,
  getNegotiationPosition,
  getCommercialStats,
  contractStatusClasses,
  demandTrendLabels,
} from "@/lib/commercial-intelligence-data";

const stats = getCommercialStats();
const contracts = getContracts();
const forecasts = getDemandForecasts();
const marketPrices = getMarketPrices();
const premiums = getQualityPremiums();
const negotiation = getNegotiationPosition();

const strengthClasses: Record<string, string> = {
  forte: "bg-emerald-100 text-emerald-800",
  medio: "bg-amber-100 text-amber-800",
  debole: "bg-rose-100 text-rose-800",
};

export default function CommercialPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Intelligenza commerciale
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Intelligenza commerciale cooperativa
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Contratti GDO, previsioni domanda, prezzi di mercato, premi qualità e posizionamento negoziale della cooperativa.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Contratti attivi" value={String(stats.activeContracts)} change={`Volume impegnato ${(stats.totalCommittedVolumeKg / 1000).toFixed(0)} t`} trend="up" />
        <StatCard label="Ricavo contratti" value={`€ ${stats.revenueFromContractsEur.toLocaleString("it-IT")}`} change="Da consegne effettuate" trend="up" />
        <StatCard label="Fulfillment medio" value={`${stats.avgFulfillmentPercent}%`} change="Tasso di adempimento" trend="up" />
        <StatCard label="Premio qualità medio" value={`+${stats.avgPremiumPercent}%`} change="Su prezzo base di mercato" trend="up" />
      </section>

      {/* Contracts Table */}
      <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Handshake className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Contratti GDO & HORECA</h2>
            <p className="text-sm text-emerald-950/65">Volume impegnato, consegnato e stato adempimento</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
              <tr>
                <th className="px-4 py-3 font-medium">Acquirente</th>
                <th className="px-4 py-3 font-medium">Prodotto</th>
                <th className="px-4 py-3 font-medium">Volume</th>
                <th className="px-4 py-3 font-medium">Prezzo</th>
                <th className="px-4 py-3 font-medium">Fulfillment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-emerald-950/5 last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-emerald-950">{contract.buyerName}</p>
                    <p className="text-xs text-emerald-950/50">{contract.buyerType}</p>
                  </td>
                  <td className="px-4 py-3 text-emerald-950/75">{contract.product}</td>
                  <td className="px-4 py-3 text-emerald-950/75">
                    {(contract.volumeDeliveredKg / 1000).toFixed(1)}t / {(contract.volumeCommittedKg / 1000).toFixed(1)}t
                  </td>
                  <td className="px-4 py-3 text-emerald-950/75">€ {contract.pricePerKgEur.toFixed(2)}/kg</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-emerald-950/10">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${contract.fulfillmentPercent}%` }} />
                      </div>
                      <span className="text-xs text-emerald-950/55">{contract.fulfillmentPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${contractStatusClasses[contract.status]}`}>{contract.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Demand Forecasts */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Previsioni domanda</h2>
              <p className="text-sm text-emerald-950/65">Gap analysis domanda vs offerta disponibile</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {forecasts.map((f) => (
              <div key={f.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-950">{f.product} — {f.month}</p>
                  <span className={`text-xs font-semibold ${f.trend === "crescente" ? "text-emerald-700" : f.trend === "calante" ? "text-rose-700" : "text-amber-700"}`}>
                    {demandTrendLabels[f.trend]}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-emerald-950/55">Domanda</span><p className="font-semibold text-emerald-950">{(f.forecastedDemandKg / 1000).toFixed(1)}t</p></div>
                  <div><span className="text-emerald-950/55">Offerta</span><p className="font-semibold text-emerald-950">{(f.supplyAvailableKg / 1000).toFixed(1)}t</p></div>
                  <div><span className="text-emerald-950/55">Gap</span><p className={`font-semibold ${f.gapKg > 0 ? "text-rose-700" : "text-emerald-700"}`}>{f.gapKg > 0 ? "+" : ""}{(f.gapKg / 1000).toFixed(1)}t</p></div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Market Prices */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Prezzi di mercato</h2>
              <p className="text-sm text-emerald-950/65">Borsa Merci Bologna & ISMEA Mercati</p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Prodotto</th>
                  <th className="px-4 py-3 font-medium">Prezzo</th>
                  <th className="px-4 py-3 font-medium">Sett.</th>
                  <th className="px-4 py-3 font-medium">Anno</th>
                </tr>
              </thead>
              <tbody>
                {marketPrices.map((mp) => (
                  <tr key={mp.id} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-emerald-950">{mp.product}</td>
                    <td className="px-4 py-3 text-emerald-950/75">€ {mp.pricePerKgEur.toFixed(2)}/kg</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${mp.weeklyChangePercent > 0 ? "text-emerald-700" : mp.weeklyChangePercent < 0 ? "text-rose-700" : "text-emerald-950/55"}`}>
                        {mp.weeklyChangePercent > 0 ? "+" : ""}{mp.weeklyChangePercent}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${mp.yearlyChangePercent > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {mp.yearlyChangePercent > 0 ? "+" : ""}{mp.yearlyChangePercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Quality Premiums & Negotiation */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Premi qualità</h2>
              <p className="text-sm text-emerald-950/65">Valore aggiunto da certificazioni DOP, Bio, Km zero</p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-[#f7f4ec]">
            <table className="min-w-full text-sm">
              <thead className="border-b border-emerald-950/10 text-left text-emerald-950/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Designazione</th>
                  <th className="px-4 py-3 font-medium">Premio</th>
                  <th className="px-4 py-3 font-medium">Volume eleggibile</th>
                  <th className="px-4 py-3 font-medium">Ricavo aggiuntivo</th>
                </tr>
              </thead>
              <tbody>
                {premiums.map((p) => (
                  <tr key={p.designation} className="border-b border-emerald-950/5 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-emerald-950">{p.label}</td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold">+{p.premiumPercent}%</td>
                    <td className="px-4 py-3 text-emerald-950/75">{(p.eligibleVolumneKg / 1000).toFixed(1)}t</td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold">€ {p.additionalRevenueEur.toLocaleString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Posizione negoziale</h2>
              <p className="text-sm text-emerald-950/65">Forza contrattuale della cooperativa</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              { label: "Volume totale cooperativa", value: `${(negotiation.cooperativeTotalVolumeKg / 1000).toFixed(0)} t` },
              { label: "Copertura biologico", value: `${negotiation.certifiedOrganicPercent}%` },
              { label: "Copertura DOP", value: `${negotiation.dopCoveredPercent}%` },
              { label: "Affidabilità consegne", value: `${negotiation.deliveryReliabilityScore}/100` },
              { label: "Qualità media", value: `${negotiation.avgQualityScore}/100` },
              { label: "Fulfillment contratti", value: `${negotiation.contractFulfillmentRate}%` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-[#f7f4ec] px-4 py-3">
                <span className="text-sm text-emerald-950/65">{item.label}</span>
                <span className="text-sm font-bold text-emerald-950">{item.value}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between rounded-xl bg-[#f7f4ec] px-4 py-3">
              <span className="text-sm font-semibold text-emerald-950">Forza negoziale</span>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${strengthClasses[negotiation.negotiatingStrength]}`}>
                {negotiation.negotiatingStrength.toUpperCase()}
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
