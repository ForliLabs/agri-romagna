import {
  ArrowRight,
  Bot,
  Fingerprint,
  Leaf,
  Network,
  Orbit,
  Rocket,
  ShieldCheck,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { getMoonshotPortfolio, type MoonshotFeatureId } from "@/lib/moonshot-operating-system";

const portfolio = getMoonshotPortfolio();
const featureById = new Map(portfolio.features.map((feature) => [feature.id, feature]));

const featureIcons: Record<MoonshotFeatureId, LucideIcon> = {
  "digital-twin": Orbit,
  "memory-graph": Bot,
  "federation-mesh": Network,
  "climate-hedging": Leaf,
  "provenance-network": Fingerprint,
  "autonomous-market": Store,
};

export default function MoonshotsPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-emerald-950/10 bg-white/90 p-8 shadow-sm shadow-emerald-950/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Moonshot operating system
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Sei mosse per trasformare AgriRomagna in un sistema operativo cooperativo.
            </h1>
            <p className="mt-4 text-sm leading-7 text-emerald-950/70 sm:text-base">
              Questa vista implementa i moonshot come control plane operativi: ogni feature combina i
              moduli già presenti nel repository in un portafoglio unico, con dipendenze, API dedicate
              e sequenza di build.
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-950/10 bg-[#f7f4ec] px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Verdetto strategico
            </p>
            <p className="mt-2 text-4xl font-black text-emerald-950">
              {portfolio.strategicVerdict.score}/100
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-emerald-950/65">
              {portfolio.strategicVerdict.recommendation}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Moonshot attivi"
          value={String(portfolio.features.length)}
          change="Tutti implementati come MVP nel portafoglio"
          trend="up"
        />
        <StatCard
          label="Innovation vectors"
          value={String(portfolio.innovationVectors.length)}
          change="Dati live, mesh federata, trust, hedging, memoria"
          trend="up"
        />
        <StatCard
          label="Dipendenze critiche"
          value={String(portfolio.dependencyGraph.length)}
          change="Catena di build tra twin, trust, mesh e mercato"
          trend="neutral"
        />
        <StatCard
          label="API esposte"
          value={`${portfolio.features.length + 1}`}
          change="Portfolio completo + endpoint per singolo moonshot"
          trend="up"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Innovation vectors</h2>
              <p className="text-sm text-emerald-950/65">
                Assi strutturali che trasformano il prodotto da FMIS a piattaforma di mercato.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {portfolio.innovationVectors.map((vector) => (
              <article key={vector.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {vector.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-950/75">{vector.thesis}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-emerald-950/45">
                  {vector.leverage}
                </p>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <ArrowRight className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Build order</h2>
              <p className="text-sm text-emerald-950/65">Sequenza consigliata per ridurre attrito di piattaforma.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {portfolio.buildSequence.map((id, index) => {
              const feature = featureById.get(id);
              if (!feature) {
                return null;
              }
              const Icon = featureIcons[id];
              return (
                <article key={id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-start gap-4">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                      {index + 1}
                    </span>
                    <div className="rounded-xl bg-white p-2 shadow-sm">
                      <Icon className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-950">{feature.name}</p>
                      <p className="mt-1 text-sm text-emerald-950/65">{feature.tagline}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Scorecard</h2>
            <p className="text-sm text-emerald-950/65">
              Lettura sintetica della prontezza strategica del repository per la prossima decade.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {portfolio.strategicVerdict.scorecard.map((item) => (
            <article key={item.name} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
              <div className="flex items-center justify-between text-sm font-semibold text-emerald-950">
                <span>{item.name}</span>
                <span>{item.score}/100</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-emerald-950/70">{item.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        {portfolio.features.map((feature, index) => {
          const Icon = featureIcons[feature.id];
          return (
            <article
              id={feature.id}
              key={feature.id}
              className="rounded-[2rem] border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-4xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[#f7f4ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      Moonshot {index + 1}
                    </span>
                  </div>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950">{feature.name}</h2>
                  <p className="mt-2 text-base font-medium text-emerald-700">{feature.tagline}</p>
                  <p className="mt-4 text-sm leading-7 text-emerald-950/75">{feature.vision}</p>
                </div>
                <div className="rounded-3xl border border-emerald-950/10 bg-[#f7f4ec] px-5 py-4 lg:w-[22rem]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Perché adesso
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950/75">{feature.whyNow}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-emerald-950/45">
                    <span>{feature.horizon}</span>
                    <span>•</span>
                    <span>{feature.innovationVector}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {feature.kpis.map((kpi) => (
                  <article key={kpi.label} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      {kpi.label}
                    </p>
                    <p className="mt-2 text-3xl font-black text-emerald-950">{kpi.value}</p>
                    <p className="mt-2 text-sm leading-6 text-emerald-950/65">{kpi.hint}</p>
                  </article>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr_1fr]">
                <article className="rounded-3xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Architectural anchors
                  </p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-emerald-950/75">
                    {feature.existingModules.map((modulePath) => (
                      <li key={modulePath}>• {modulePath}</li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    APIs
                  </p>
                  <div className="mt-3 rounded-2xl border border-emerald-950/10 bg-white px-4 py-3 font-mono text-xs text-emerald-950">
                    <p>/api/moonshots</p>
                    <p>{feature.apiRoute}</p>
                  </div>
                </article>

                <article className="rounded-3xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Build plan
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Now</p>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-emerald-950/75">
                        {feature.roadmap.now.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Next</p>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-emerald-950/75">
                        {feature.roadmap.next.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Later</p>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-emerald-950/75">
                        {feature.roadmap.later.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Implementato ora
                  </p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-emerald-950/75">
                    {feature.implementedNow.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Dipendenze
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-950/75">
                    {feature.dependencies.length === 0 ? (
                      <li>• Fondazione indipendente.</li>
                    ) : (
                      feature.dependencies.map((dependency) => (
                        <li key={dependency}>• {featureById.get(dependency)?.name ?? dependency}</li>
                      ))
                    )}
                  </ul>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Rischi
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-950/75">
                    {feature.risks.map((risk) => (
                      <li key={risk}>• {risk}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
