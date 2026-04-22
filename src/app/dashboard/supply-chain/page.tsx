import Link from "next/link";
import {
  ArrowRight,
  Package,
  QrCode,
  Route,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { fields } from "@/lib/data";
import {
  getLotTimeline,
  getSupplyChainSummary,
  lifecycleLabels,
  lifecycleSequence,
  supplyChainLots,
  type LotLifecycle,
} from "@/lib/supply-chain-data";

const summary = getSupplyChainSummary();
const fieldMap = new Map(fields.map((field) => [field.id, field]));

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const statusClasses: Record<LotLifecycle, string> = {
  declared: "bg-stone-100 text-stone-700",
  harvested: "bg-amber-100 text-amber-800",
  quality_checked: "bg-sky-100 text-sky-800",
  routed: "bg-violet-100 text-violet-800",
  in_transit: "bg-cyan-100 text-cyan-800",
  received: "bg-emerald-50 text-emerald-800",
  listed: "bg-emerald-100 text-emerald-900",
};

export default function SupplyChainPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Filiera orchestrata
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Dalla dichiarazione di raccolta fino allo scaffale digitale.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Ogni lotto passa in un flusso validato: raccolta, controllo qualità, instradamento,
          transito, ricevimento e pubblicazione commerciale.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lotti orchestrati"
          value={String(summary.totalLots)}
          change="Tracciati in stato macchina"
          trend="up"
        />
        <StatCard
          label="Quantità in filiera"
          value={`${(summary.totalQuantityKg / 1000).toLocaleString("it-IT")} t`}
          change="Volume aggregato su tutti i lotti"
          trend="up"
        />
        <StatCard
          label="Pronti per lo scaffale"
          value={String(summary.readyForShelf)}
          change="Ricevuti o già pubblicati"
          trend="neutral"
        />
        <StatCard
          label="Link di tracciabilità"
          value={String(summary.withTraceability)}
          change="Lotti con collegamento DPP attivo"
          trend="up"
        />
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Route className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Pipeline di filiera</h2>
            <p className="text-sm text-emerald-950/65">Conteggio lotti per stato e prossime mosse operative</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[980px] grid-cols-7 gap-4">
            {lifecycleSequence.map((status) => {
              const stageLots = supplyChainLots.filter((lot) => lot.lifecycle === status);
              return (
                <article
                  key={status}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-emerald-950">{lifecycleLabels[status]}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[status]}`}>
                      {stageLots.length}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {stageLots.length === 0 ? (
                      <p className="text-sm text-emerald-950/45">Nessun lotto in questo stadio.</p>
                    ) : (
                      stageLots.map((lot) => (
                        <div key={lot.id} className="rounded-2xl bg-white px-3 py-2 text-sm shadow-sm">
                          <p className="font-semibold text-emerald-950">{lot.crop}</p>
                          <p className="mt-1 text-emerald-950/65">
                            {(lot.quantity / 1000).toLocaleString("it-IT")} t · {fieldMap.get(lot.fieldId)?.name}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Dettaglio lotti e viaggio completo</h2>
            <p className="text-sm text-emerald-950/65">Timeline di stato, qualità, logistica e canali shelf-ready</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {supplyChainLots.map((lot) => {
            const timeline = getLotTimeline(lot.id).reverse();
            const currentStep = lifecycleSequence.indexOf(lot.lifecycle);
            const field = fieldMap.get(lot.fieldId);

            return (
              <article
                key={lot.id}
                className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {field?.name}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-emerald-950">{lot.crop}</h3>
                    <p className="mt-1 text-sm text-emerald-950/65">
                      Raccolta {dateFormatter.format(new Date(lot.harvestDate))} · {(lot.quantity / 1000).toLocaleString("it-IT")} t · qualità {lot.qualityGrade}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[lot.lifecycle]}`}>
                    {lifecycleLabels[lot.lifecycle]}
                  </span>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <div className="flex min-w-[640px] items-center gap-2">
                    {lifecycleSequence.map((status, index) => {
                      const completed = index <= currentStep;
                      return (
                        <div key={status} className="flex items-center gap-2">
                          <div
                            className={`rounded-full px-3 py-2 text-xs font-semibold ${
                              completed ? statusClasses[status] : "bg-emerald-950/5 text-emerald-950/45"
                            }`}
                          >
                            {lifecycleLabels[status]}
                          </div>
                          {index < lifecycleSequence.length - 1 ? (
                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <QrCode className="h-4 w-4" />
                      <p className="text-sm font-semibold text-emerald-950">Traceability</p>
                    </div>
                    {lot.traceabilityLotLink ? (
                      <Link href={lot.traceabilityLotLink} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-600">
                        Apri lotto DPP
                      </Link>
                    ) : (
                      <p className="mt-3 text-sm text-emerald-950/45">Link ancora non generato.</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Truck className="h-4 w-4" />
                      <p className="text-sm font-semibold text-emerald-950">Logistica</p>
                    </div>
                    {lot.logisticsRouteLink ? (
                      <Link href={lot.logisticsRouteLink} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-600">
                        Vedi instradamento
                      </Link>
                    ) : (
                      <p className="mt-3 text-sm text-emerald-950/45">Slot di trasporto da assegnare.</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <ShoppingBag className="h-4 w-4" />
                      <p className="text-sm font-semibold text-emerald-950">Shelf link</p>
                    </div>
                    {lot.marketplaceListingLink ? (
                      <Link href={lot.marketplaceListingLink} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-600">
                        Apri canale vendita
                      </Link>
                    ) : (
                      <p className="mt-3 text-sm text-emerald-950/45">Pubblicazione commerciale non ancora attiva.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <p className="text-sm font-semibold text-emerald-950">Timeline transizioni</p>
                  <div className="mt-4 space-y-3">
                    {timeline.map((step) => (
                      <div key={step.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                        <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-700" />
                        <div>
                          <p className="font-medium text-emerald-950">
                            {step.fromStatus ? `${lifecycleLabels[step.fromStatus]} → ` : ""}
                            {lifecycleLabels[step.toStatus]}
                          </p>
                          <p className="mt-1 text-sm text-emerald-950/70">{step.detail}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-emerald-950/45">
                            {dateFormatter.format(new Date(step.timestamp))} · {step.actor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
