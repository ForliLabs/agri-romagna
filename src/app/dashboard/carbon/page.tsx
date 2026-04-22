import { BarChart3, Leaf, ShieldCheck, Tractor } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  calculateFieldCarbon,
  getCarbonByCategory,
  getCarbonComplianceReadiness,
  getCooperativeCarbonSummary,
} from "@/lib/carbon-data";
import { fields } from "@/lib/data";

const numberFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
});

const cooperativeSummary = getCooperativeCarbonSummary();
const readiness = getCarbonComplianceReadiness();
const categoryBreakdown = getCarbonByCategory();
const fieldSummaries = fields.map((field) => ({
  field,
  summary: calculateFieldCarbon(field.id),
}));
const maxCategoryValue = Math.max(
  ...categoryBreakdown.map((item) => Math.max(item.emissionsKg, item.sequestrationKg)),
  1
);

export default function CarbonPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Sostenibilità cooperativa
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Ledger carbonico e impronta climatica.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Registro di emissioni e sequestro per gasolio, fertilizzazione, trattamenti e pratiche
          conservative. Una vista unica per cooperative, audit ESG e preparazione ai requisiti UE.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Emissioni lorde"
          value={`${numberFormatter.format(cooperativeSummary.totalEmissionsKg)} kg CO₂e`}
          change="Input e operazioni meccaniche registrati"
          trend="neutral"
        />
        <StatCard
          label="Sequestro stimato"
          value={`${numberFormatter.format(cooperativeSummary.totalSequestrationKg)} kg CO₂e`}
          change="Cover crop, suolo e sostanza organica"
          trend="up"
        />
        <StatCard
          label="Bilancio netto"
          value={`${numberFormatter.format(cooperativeSummary.netCarbonKg)} kg CO₂e`}
          change={`${numberFormatter.format(cooperativeSummary.intensityKgPerHa)} kg/ha medi`}
          trend={cooperativeSummary.netCarbonKg <= 0 ? "up" : "neutral"}
        />
        <StatCard
          label="Intensità media"
          value={`${numberFormatter.format(cooperativeSummary.intensityKgPerTonne)} kg/t`}
          change="Riferita al volume atteso di campagna"
          trend="up"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Quadro cooperativo</h2>
              <p className="text-sm text-emerald-950/65">
                {cooperativeSummary.totalFields} campi · {numberFormatter.format(cooperativeSummary.totalAreaHa)} ha
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <p className="text-sm text-emerald-950/60">Produzione attesa</p>
              <p className="mt-2 text-3xl font-bold text-emerald-950">
                {numberFormatter.format(cooperativeSummary.totalProductionTonnes)} t
              </p>
              <p className="mt-3 text-sm leading-6 text-emerald-950/70">
                L&apos;intensità netta di filiera rimane sotto i 10 kg CO₂e per tonnellata prevista,
                utile per reporting PAC ed ESG di primo livello.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-emerald-950/60">Prontezza compliance UE</p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {readiness.status}
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold text-emerald-950">{readiness.readinessPercent}%</p>
              <div className="mt-4 h-3 rounded-full bg-emerald-950/10">
                <div
                  className="h-3 rounded-full bg-emerald-600"
                  style={{ width: `${readiness.readinessPercent}%` }}
                />
              </div>
              <ul className="mt-4 space-y-2 text-sm text-emerald-950/70">
                <li>• Copertura completa su {readiness.coveredFields}/{fields.length} appezzamenti</li>
                <li>• Fattori ISPRA mappati per input e pratiche conservative</li>
                <li>• {readiness.note}</li>
              </ul>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Breakdown per categoria</h2>
              <p className="text-sm text-emerald-950/65">
                Fuel, fertilizzazioni, trattamenti e sequestro
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {categoryBreakdown.map((item) => (
              <article
                key={item.key}
                className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-emerald-950">{item.label}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    Netto {numberFormatter.format(item.netCarbonKg)} kg
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-emerald-950/55">
                      <span>Emissioni</span>
                      <span>{numberFormatter.format(item.emissionsKg)} kg</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-emerald-950/10">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${(item.emissionsKg / maxCategoryValue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-emerald-950/55">
                      <span>Sequestro</span>
                      <span>{numberFormatter.format(item.sequestrationKg)} kg</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-emerald-950/10">
                      <div
                        className="h-2 rounded-full bg-emerald-600"
                        style={{ width: `${(item.sequestrationKg / maxCategoryValue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Tractor className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Dettaglio per appezzamento</h2>
            <p className="text-sm text-emerald-950/65">
              Emissioni, sequestro e intensità per ettaro e per tonnellata
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {fieldSummaries.map(({ field, summary }) => {
            const totalTracked = summary.totalEmissionsKg + summary.totalSequestrationKg || 1;
            return (
              <article
                key={field.id}
                className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-950">{field.name}</h3>
                    <p className="mt-1 text-sm text-emerald-950/65">
                      {field.crop} · {numberFormatter.format(field.areaHa)} ha · resa attesa {field.expectedVolume} t
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      summary.netCarbonKg <= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Netto {numberFormatter.format(summary.netCarbonKg)} kg
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-950/45">Emissioni</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-950">
                      {numberFormatter.format(summary.totalEmissionsKg)} kg
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-950/45">Sequestro</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-800">
                      {numberFormatter.format(summary.totalSequestrationKg)} kg
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-950/45">Intensità / ha</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-950">
                      {numberFormatter.format(summary.intensityKgPerHa)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-950/45">Intensità / t</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-950">
                      {numberFormatter.format(summary.intensityKgPerTonne)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-center justify-between text-xs text-emerald-950/55">
                    <span>Quota emissioni</span>
                    <span>
                      {numberFormatter.format((summary.totalEmissionsKg / totalTracked) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-emerald-950/10">
                    <div
                      className="h-3 rounded-full bg-amber-500"
                      style={{ width: `${(summary.totalEmissionsKg / totalTracked) * 100}%` }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-emerald-950/55">
                    <span>Quota sequestro</span>
                    <span>
                      {numberFormatter.format((summary.totalSequestrationKg / totalTracked) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-emerald-950/10">
                    <div
                      className="h-3 rounded-full bg-emerald-600"
                      style={{ width: `${(summary.totalSequestrationKg / totalTracked) * 100}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-lime-100 p-3 text-lime-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Indicatori pronti per audit</h2>
            <p className="text-sm text-emerald-950/65">
              Metriche chiave per disclosure di filiera e capitolati sostenibilità
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
            <p className="text-sm text-emerald-950/60">Scope agricolo coperto</p>
            <p className="mt-2 text-3xl font-bold text-emerald-950">100%</p>
            <p className="mt-2 text-sm text-emerald-950/70">Campi e pratiche conservative già mappati</p>
          </article>
          <article className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
            <p className="text-sm text-emerald-950/60">Carbon intensity</p>
            <p className="mt-2 text-3xl font-bold text-emerald-950">
              {numberFormatter.format(cooperativeSummary.intensityKgPerTonne)} kg/t
            </p>
            <p className="mt-2 text-sm text-emerald-950/70">Valore utile per schede prodotto e passaporto digitale</p>
          </article>
          <article className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
            <p className="text-sm text-emerald-950/60">Bilancio netto</p>
            <p className="mt-2 text-3xl font-bold text-emerald-950">
              {numberFormatter.format(cooperativeSummary.netCarbonKg)} kg
            </p>
            <p className="mt-2 text-sm text-emerald-950/70">Pronto per allegato CAP, ESG supplier form e audit clienti UE</p>
          </article>
        </div>
      </section>
    </div>
  );
}
