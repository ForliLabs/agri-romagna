import Link from "next/link";
import {
  Award,
  Euro,
  Gift,
  Leaf,
  Package,
  ShoppingBag,
  Truck,
  Users,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { ProductArtwork } from "@/components/product-artwork";
import {
  marketplaceProducts,
  orders,
  subscriptionBoxes,
  getMarketplaceSummary,
} from "@/lib/marketplace-data";
import {
  marketplaceChannelMix,
  marketplaceFulfillmentQueue,
  marketplaceInventoryAlerts,
} from "@/lib/operations-insights";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const summary = getMarketplaceSummary();

const availabilityClasses: Record<string, string> = {
  disponibile: "bg-emerald-50 text-emerald-800",
  prenotabile: "bg-sky-100 text-sky-800",
  esaurito: "bg-rose-100 text-rose-700",
  stagionale: "bg-amber-100 text-amber-800",
};

const availabilityLabels: Record<string, string> = {
  disponibile: "Disponibile",
  prenotabile: "Prenotabile",
  esaurito: "Esaurito",
  stagionale: "Stagionale",
};

const statusClasses: Record<string, string> = {
  nuovo: "bg-sky-100 text-sky-800",
  confermato: "bg-emerald-50 text-emerald-800",
  in_preparazione: "bg-amber-100 text-amber-800",
  spedito: "bg-violet-100 text-violet-800",
  consegnato: "bg-emerald-50 text-emerald-800",
  annullato: "bg-rose-100 text-rose-700",
};

const statusLabels: Record<string, string> = {
  nuovo: "Nuovo",
  confermato: "Confermato",
  in_preparazione: "In preparazione",
  spedito: "Spedito",
  consegnato: "Consegnato",
  annullato: "Annullato",
};

const deliveryLabels: Record<string, string> = {
  ritiro_cascina: "Ritiro in cascina",
  consegna_locale: "Consegna locale",
  spedizione: "Spedizione",
};

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Vendita diretta
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Mercato dei prodotti cooperativi.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Catalogo prodotti, ordini consumatori e B2B, abbonamenti stagionali.
          Iterazione 2: backlog ordini, stock a rischio e mix di canale nello stesso quadro operativo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Prodotti in catalogo" value={String(summary.totalProducts)} change={`${summary.availableProducts} disponibili ora`} trend="up" />
        <StatCard label="Ordini da gestire" value={String(marketplaceFulfillmentQueue.length)} change="Backlog tra nuovi ordini e preparazioni" trend="down" />
        <StatCard label="Stock da presidiare" value={String(marketplaceInventoryAlerts.length)} change="Disponibilità o shelf life da riallineare" trend="down" />
        <StatCard label="Abbonati cassette" value={String(summary.totalSubscribers)} change={`${subscriptionBoxes.length} formule attive`} trend="up" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Fulfillment queue</h2>
              <p className="text-sm text-emerald-950/65">Ordini da preparare, confermare o instradare al canale corretto</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {marketplaceFulfillmentQueue.map((item) => (
              <article key={item.orderId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-950">{item.customerName}</p>
                    <p className="mt-1 text-sm text-emerald-950/60">{item.summary}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.urgency === "oggi"
                        ? "bg-rose-100 text-rose-700"
                        : item.urgency === "prossimo-slot"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {item.urgency}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-emerald-950/50">
                  <span>{deliveryLabels[item.deliveryMethod]}</span>
                  <span>{statusLabels[item.status]}</span>
                  <span>€{item.totalEur.toFixed(2)}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/traceability"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Verifica filiera ordini
            </Link>
            <Link
              href="/dashboard/logistics"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              Apri logistica
            </Link>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Stock & shelf life</h2>
              <p className="text-sm text-emerald-950/65">Prodotti che richiedono pricing, promo o riallineamento disponibilità</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {marketplaceInventoryAlerts.map((alert) => (
              <article key={alert.productId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-950">{alert.productName}</p>
                    <p className="mt-1 text-sm text-emerald-950/60">{alert.stockLabel}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      alert.severity === "alta" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-950/75">{alert.reason}</p>
                <p className="mt-3 text-sm font-medium text-emerald-700">{alert.action}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Catalogo prodotti</h2>
              <p className="text-sm text-emerald-950/65">Prodotti della cooperativa in vendita</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {marketplaceProducts.map((product) => (
              <article key={product.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <ProductArtwork
                  category={product.category}
                  title={product.name}
                  subtitle={product.imageAlt}
                />
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-emerald-950">{product.name}</h3>
                    <p className="mt-1 text-xs text-emerald-950/55">{product.farmName}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${availabilityClasses[product.availability]}`}>
                    {availabilityLabels[product.availability]}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-emerald-950/70">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-emerald-950">
                    €{product.priceEur.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-emerald-950/50">/{product.unit}</span>
                  </p>
                  <div className="flex gap-1.5">
                    {product.organic && (
                      <span className="flex items-center gap-0.5 rounded-full bg-lime-100 px-2 py-0.5 text-xs font-semibold text-lime-800">
                        <Leaf className="h-3 w-3" /> BIO
                      </span>
                    )}
                    {product.dop && (
                      <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        <Award className="h-3 w-3" /> DOP
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-emerald-950/55">
                  <span>{product.stockKg.toLocaleString("it-IT")} kg stock</span>
                  <Link href="/dashboard/traceability" className="font-semibold text-emerald-700 hover:text-emerald-600">
                    Verifica filiera
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Euro className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Ordini recenti</h2>
                <p className="text-sm text-emerald-950/65">Gestione vendite</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-emerald-950">{order.customerName}</p>
                      <p className="mt-1 text-xs text-emerald-950/55">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {dateFormatter.format(new Date(order.createdAt))}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-emerald-950/70">
                    {order.items.map((item) => (
                      <p key={item.productId}>
                        {item.quantity}× {item.productName} — €{item.subtotalEur.toFixed(2)}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-xs text-emerald-950/50">
                      <Truck className="h-3 w-3" />
                      {deliveryLabels[order.deliveryMethod]}
                    </span>
                    <span className="font-bold text-emerald-950">€{order.totalEur.toFixed(2)}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Mix di canale & abbonamenti</h2>
                <p className="text-sm text-emerald-950/65">Dove la cooperativa vende oggi e quali formule ricorrenti stanno trainando</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {marketplaceChannelMix.map((channel) => (
                <div key={channel.channel} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-emerald-950">{channel.channel}</p>
                    <p className="text-sm font-semibold text-emerald-700">€{channel.revenue.toFixed(0)}</p>
                  </div>
                  <p className="mt-1 text-sm text-emerald-950/65">{channel.orders} ordini nel canale</p>
                </div>
              ))}
              {subscriptionBoxes.map((box) => (
                <article key={box.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-emerald-950">{box.name}</h3>
                      <p className="mt-1 text-sm text-emerald-950/60">{box.description}</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-950">
                      €{box.priceEur}
                      <span className="block text-xs font-normal text-emerald-950/50">/{box.frequency}</span>
                    </p>
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <Users className="h-3 w-3" /> {box.subscribers} abbonati attivi
                  </p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
