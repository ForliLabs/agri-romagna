import { BarChart3, Calendar, Euro, TrendingUp, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  calculateFieldProfitability,
  calculateMemberSettlements,
  getCashFlowProjection,
  getCooperativePL,
} from "@/lib/financial-data";
import { fields } from "@/lib/data";

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
});

const cooperativePL = getCooperativePL();
const fieldProfitability = fields.map((field) => ({
  field,
  profitability: calculateFieldProfitability(field.id),
}));
const memberSettlements = calculateMemberSettlements();
const cashFlowProjection = getCashFlowProjection();
const maxCostShare = Math.max(...cooperativePL.costBreakdown.map((item) => item.sharePercent), 1);

export default function FinancialPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Finanza cooperativa
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Conto economico, marginalità e liquidità.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Dashboard economica per costi colturali, ricavi di canale, preview liquidazioni soci e
          proiezione di cassa sui prossimi sei mesi.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ricavi totali"
          value={currencyFormatter.format(cooperativePL.totalRevenue)}
          change="Marketplace, distribuzione cooperativa e PAC"
          trend="up"
        />
        <StatCard
          label="Costi totali"
          value={currencyFormatter.format(cooperativePL.totalCosts)}
          change="Input, lavoro e mezzi imputati ai campi"
          trend="neutral"
        />
        <StatCard
          label="Margine netto"
          value={currencyFormatter.format(cooperativePL.netMargin)}
          change={`${currencyFormatter.format(cooperativePL.capSubsidies)} da sussidi PAC`}
          trend="up"
        />
        <StatCard
          label="Net margin %"
          value={`${numberFormatter.format(cooperativePL.netMarginPercent)}%`}
          change="Redditività media sulla campagna 2026"
          trend="up"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Redditività per campo</h2>
              <p className="text-sm text-emerald-950/65">
                Margine lordo, costi e ricavi parametrati per ettaro
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Campo</th>
                  <th className="px-4 py-3 text-left font-semibold">Ricavi</th>
                  <th className="px-4 py-3 text-left font-semibold">Costi</th>
                  <th className="px-4 py-3 text-left font-semibold">Margine</th>
                  <th className="px-4 py-3 text-left font-semibold">Margine %</th>
                  <th className="px-4 py-3 text-left font-semibold">Ricavi / ha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10">
                {fieldProfitability.map(({ field, profitability }) => (
                  <tr key={field.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-emerald-950">{field.name}</p>
                      <p className="text-xs text-emerald-950/55">
                        {field.crop} · {numberFormatter.format(field.areaHa)} ha
                      </p>
                    </td>
                    <td className="px-4 py-4 text-emerald-950/75">
                      {currencyFormatter.format(profitability.totalRevenue)}
                    </td>
                    <td className="px-4 py-4 text-emerald-950/75">
                      {currencyFormatter.format(profitability.totalCosts)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-emerald-800">
                      {currencyFormatter.format(profitability.grossMargin)}
                    </td>
                    <td className="px-4 py-4 text-emerald-950/75">
                      {numberFormatter.format(profitability.grossMarginPercent)}%
                    </td>
                    <td className="px-4 py-4 text-emerald-950/75">
                      {currencyFormatter.format(profitability.revenuePerHa)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Euro className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Breakdown costi</h2>
                <p className="text-sm text-emerald-950/65">Incidenza delle categorie sul totale</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {cooperativePL.costBreakdown.map((item) => (
                <article key={item.category} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-emerald-950">{item.label}</p>
                    <span className="text-sm font-semibold text-emerald-800">
                      {currencyFormatter.format(item.totalAmount)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-emerald-950/55">
                    <span>Incidenza</span>
                    <span>{numberFormatter.format(item.sharePercent)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-emerald-950/10">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${(item.sharePercent / maxCostShare) * 100}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-lime-100 p-3 text-lime-800">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Mix ricavi</h2>
                <p className="text-sm text-emerald-950/65">Canali di monetizzazione cooperativi</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {cooperativePL.revenueBreakdown.map((item) => (
                <div
                  key={item.source}
                  className="flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] px-4 py-3"
                >
                  <p className="font-medium text-emerald-950">{item.label}</p>
                  <span className="font-semibold text-emerald-800">
                    {currencyFormatter.format(item.totalAmount)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Preview liquidazioni soci</h2>
              <p className="text-sm text-emerald-950/65">
                Volumi conferiti, qualità e riparto costi condivisi
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {memberSettlements.map((settlement) => (
              <article key={settlement.memberId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-emerald-950">{settlement.name}</h3>
                    <p className="mt-1 text-xs text-emerald-950/55">
                      {numberFormatter.format(settlement.productionVolume)} t · Classe {settlement.qualityGrade}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    Netto {currencyFormatter.format(settlement.netSettlement)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                  <div>
                    <p className="text-emerald-950/55">Ricavo lordo</p>
                    <p className="mt-1 font-semibold text-emerald-950">
                      {currencyFormatter.format(settlement.grossRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-950/55">Costi condivisi</p>
                    <p className="mt-1 font-semibold text-amber-700">
                      {currencyFormatter.format(settlement.sharedCosts)}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-950/55">Liquidazione</p>
                    <p className="mt-1 font-semibold text-emerald-800">
                      {currencyFormatter.format(settlement.netSettlement)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Proiezione di cassa</h2>
              <p className="text-sm text-emerald-950/65">Orizzonte semplificato sui prossimi 6 mesi</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Mese</th>
                  <th className="px-4 py-3 text-left font-semibold">Entrate</th>
                  <th className="px-4 py-3 text-left font-semibold">Uscite</th>
                  <th className="px-4 py-3 text-left font-semibold">Netto</th>
                  <th className="px-4 py-3 text-left font-semibold">Cumulato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10">
                {cashFlowProjection.map((item) => (
                  <tr key={item.month}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-emerald-950">{item.month}</p>
                      <p className="mt-1 text-xs text-emerald-950/50">
                        {item.principalDrivers.join(" · ")}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-emerald-950/75">
                      {currencyFormatter.format(item.inflows)}
                    </td>
                    <td className="px-4 py-4 text-emerald-950/75">
                      {currencyFormatter.format(item.outflows)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-emerald-800">
                      {currencyFormatter.format(item.netCashFlow)}
                    </td>
                    <td className="px-4 py-4 text-emerald-950/75">
                      {currencyFormatter.format(item.cumulativeCash)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
