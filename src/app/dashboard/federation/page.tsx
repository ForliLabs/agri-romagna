import {
  BarChart3,
  Leaf,
  Network,
  Scale,
  Users2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getCarbonPool,
  getFederatedBenchmarks,
  getFederatedSupply,
  getFederationGovernance,
  getFederationOverview,
  type FederationGovernance,
} from "@/lib/federation-data";

const overview = getFederationOverview();
const federation = overview.federation;
const members = overview.members;
const supplies = getFederatedSupply();
const benchmarks = getFederatedBenchmarks();
const carbonPool = getCarbonPool();
const governanceItems = getFederationGovernance();

const totalFederatedVolume = supplies.reduce((total, supply) => total + supply.totalVolume, 0);

const federationStatusLabels = {
  active: "Attiva",
  forming: "In costituzione",
  suspended: "Sospesa",
};

const federationStatusClasses = {
  active: "bg-emerald-100 text-emerald-800",
  forming: "bg-amber-100 text-amber-800",
  suspended: "bg-rose-100 text-rose-800",
};

const memberStatusLabels = {
  active: "Attivo",
  pending: "In attesa",
  withdrawn: "Ritirato",
};

const memberStatusClasses = {
  active: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  withdrawn: "bg-rose-100 text-rose-800",
};

const negotiationStatusLabels = {
  open: "Aperta",
  negotiating: "In negoziazione",
  agreed: "Accordo raggiunto",
  delivered: "Consegnata",
};

const negotiationStatusClasses = {
  open: "bg-sky-100 text-sky-800",
  negotiating: "bg-amber-100 text-amber-800",
  agreed: "bg-emerald-100 text-emerald-800",
  delivered: "bg-violet-100 text-violet-800",
};

const governanceTypeLabels: Record<FederationGovernance["type"], string> = {
  vote: "Voto",
  agreement: "Accordo",
  policy: "Policy",
};

const governanceStatusLabels: Record<FederationGovernance["status"], string> = {
  proposed: "Proposta",
  voting: "In voto",
  approved: "Approvata",
  rejected: "Respinta",
};

const governanceStatusClasses: Record<FederationGovernance["status"], string> = {
  proposed: "bg-sky-100 text-sky-800",
  voting: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const carbonStatusLabels = {
  accumulating: "In accumulo",
  tradeable: "Pronta al trading",
  listed: "Quotata",
  sold: "Venduta",
};

const carbonStatusClasses = {
  accumulating: "bg-amber-100 text-amber-800",
  tradeable: "bg-emerald-100 text-emerald-800",
  listed: "bg-sky-100 text-sky-800",
  sold: "bg-violet-100 text-violet-800",
};

const consentLabels = {
  supplyVolumes: "Volumi",
  esgScores: "ESG",
  benchmarking: "Benchmark",
  carbonCredits: "Crediti carbonio",
  equipmentSharing: "Attrezzature",
  priceData: "Prezzi",
};

export default function FederationPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Layer consortile
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Federazione multi-cooperativa & livello consortile
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Coordina negoziazioni aggregate, benchmark anonimizzati, pool di crediti carbonio e governance inter-cooperativa.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cooperative aderenti"
          value={String(members.length)}
          change={`${federation.name} · ${federation.region}`}
          trend="up"
        />
        <StatCard
          label="Volume federato"
          value={`${totalFederatedVolume.toLocaleString("it-IT")} t`}
          change="Sangiovese, Albana e pesche in negoziazione aggregata"
          trend="up"
        />
        <StatCard
          label="Carbon pool"
          value={`${carbonPool.currentPoolSize.toLocaleString("it-IT")} crediti`}
          change={`${carbonPool.contributingCoops} cooperative contribuenti`}
          trend="up"
        />
        <StatCard
          label="Pratiche governance"
          value={String(governanceItems.length)}
          change="Voti, accordi e policy federali aperte"
          trend="neutral"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Panoramica federazione</h2>
              <p className="text-sm text-emerald-950/65">
                Stato del consorzio, presidente, anno di fondazione e consenso alla condivisione dati.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {federation.type}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-emerald-950">{federation.name}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${federationStatusClasses[federation.status]}`}>
                {federationStatusLabels[federation.status]}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-emerald-950">Regione:</span> {federation.region}
              </p>
              <p>
                <span className="font-semibold text-emerald-950">Fondazione:</span> {federation.foundedDate}
              </p>
              <p>
                <span className="font-semibold text-emerald-950">Presidente:</span> {federation.president}
              </p>
              <p>
                <span className="font-semibold text-emerald-950">Membri:</span> {federation.memberCount}
              </p>
            </div>
          </article>
          <div className="overflow-x-auto rounded-2xl border border-emerald-950/10">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Cooperativa</th>
                  <th className="px-6 py-4 font-semibold">Data adesione</th>
                  <th className="px-6 py-4 font-semibold">Stato</th>
                  <th className="px-6 py-4 font-semibold">Consensi attivi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {members.map((member) => {
                  const enabledConsents = Object.entries(member.sharingConsent)
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => consentLabels[key as keyof typeof consentLabels]);

                  return (
                    <tr key={member.id}>
                      <td className="px-6 py-4 font-semibold text-emerald-950">{member.cooperativeName}</td>
                      <td className="px-6 py-4 text-emerald-950/75">{member.joinedDate}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${memberStatusClasses[member.status]}`}>
                          {memberStatusLabels[member.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {enabledConsents.map((consent) => (
                            <span
                              key={`${member.id}-${consent}`}
                              className="rounded-full bg-[#f7f4ec] px-3 py-1 text-xs font-medium text-emerald-950/70"
                            >
                              {consent}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Supply federata</h2>
              <p className="text-sm text-emerald-950/65">
                Aggregazione volumi per prodotto con contributi dei soci, buyer target e stato negoziale.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Prodotto</th>
                <th className="px-6 py-4 font-semibold">Volume totale</th>
                <th className="px-6 py-4 font-semibold">Contributi cooperative</th>
                <th className="px-6 py-4 font-semibold">Buyer</th>
                <th className="px-6 py-4 font-semibold">Stato negoziazione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {supplies.map((supply) => (
                <tr key={supply.id}>
                  <td className="px-6 py-4 font-semibold text-emerald-950">{supply.product}</td>
                  <td className="px-6 py-4 text-emerald-950/75">
                    {supply.totalVolume.toLocaleString("it-IT")} {supply.unit}
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">
                    <div className="space-y-1">
                      {supply.cooperativeContributions.map((contribution) => (
                        <p key={`${supply.id}-${contribution.cooperativeId}`}>
                          {contribution.name}: {contribution.volume.toLocaleString("it-IT")} {supply.unit}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{supply.targetBuyer}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${negotiationStatusClasses[supply.negotiationStatus]}`}
                    >
                      {negotiationStatusLabels[supply.negotiationStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Benchmarking federato</h2>
                <p className="text-sm text-emerald-950/65">
                  Confronto anonimizzato tra cooperative su rese, acqua, ESG, carbonio e prezzo.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Metrica</th>
                  <th className="px-6 py-4 font-semibold">Periodo</th>
                  <th className="px-6 py-4 font-semibold">Media</th>
                  <th className="px-6 py-4 font-semibold">Range</th>
                  <th className="px-6 py-4 font-semibold">Coop partecipanti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {benchmarks.map((benchmark) => (
                  <tr key={benchmark.id}>
                    <td className="px-6 py-4 font-semibold text-emerald-950">{benchmark.metric}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{benchmark.period}</td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {benchmark.avgValue.toLocaleString("it-IT")} {benchmark.unit}
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {benchmark.minValue.toLocaleString("it-IT")} → {benchmark.maxValue.toLocaleString("it-IT")} {benchmark.unit}
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{benchmark.participatingCoops}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Carbon credit pool</h2>
                <p className="text-sm text-emerald-950/65">
                  Stato del pool federato, soglia minima di trading e prezzo indicativo per tonnellata.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <article className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Pool federato
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                    {carbonPool.currentPoolSize.toLocaleString("it-IT")} crediti pronti
                  </h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${carbonStatusClasses[carbonPool.status]}`}>
                  {carbonStatusLabels[carbonPool.status]}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-emerald-950">Crediti totali generati:</span> {carbonPool.totalCredits}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Lotto minimo:</span> {carbonPool.tradingLotMinimum} tCO₂e
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Cooperative contribuenti:</span> {carbonPool.contributingCoops}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Prezzo indicativo:</span> € {carbonPool.pricePerTon.toLocaleString("it-IT")}/t
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-emerald-950/75">
                Il pool è sopra la soglia minima di trading e può essere presentato a buyer ESG o piattaforme volontarie con mandato federato unico.
              </p>
            </article>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Governance federale</h2>
              <p className="text-sm text-emerald-950/65">
                Decisioni condivise a livello consortile con stato voto, promotore e conteggio favorevoli/contrari.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Titolo</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Proponente</th>
                <th className="px-6 py-4 font-semibold">Stato</th>
                <th className="px-6 py-4 font-semibold">Voti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {governanceItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-emerald-950">{item.title}</p>
                    <p className="mt-1 text-xs text-emerald-950/55">{item.proposedDate}</p>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{governanceTypeLabels[item.type]}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{item.proposedBy}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${governanceStatusClasses[item.status]}`}>
                      {governanceStatusLabels[item.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">
                    {item.votesFor} favorevoli / {item.votesAgainst} contrari
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
