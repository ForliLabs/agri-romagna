import {
  BrainCircuit,
  GitBranch,
} from "lucide-react";
import dynamic from "next/dynamic";
import { StatCard } from "@/components/dashboard";
import {
  getFieldDossiers,
  getKnowledgeGraph,
  getSeasonalDigests,
  type KnowledgeEntityType,
  type KnowledgeRelationType,
} from "@/lib/knowledge-graph-data";

const KnowledgeGraphDetails = dynamic(() => import("./knowledge-graph-details"));

const { entities, relations, queries, farmers } = getKnowledgeGraph();
const fieldDossiers = getFieldDossiers();
const seasonalDigests = getSeasonalDigests();
const currentDigest = seasonalDigests[0];

const entityTypeLabels: Record<KnowledgeEntityType, string> = {
  practice: "Pratica",
  outcome: "Esito",
  condition: "Condizione",
  crop: "Coltura",
  variety: "Varietà",
  field: "Campo",
  season: "Stagione",
};

const entityTypeClasses: Record<KnowledgeEntityType, string> = {
  practice: "bg-emerald-100 text-emerald-800",
  outcome: "bg-sky-100 text-sky-800",
  condition: "bg-amber-100 text-amber-800",
  crop: "bg-lime-100 text-lime-800",
  variety: "bg-violet-100 text-violet-800",
  field: "bg-rose-100 text-rose-800",
  season: "bg-stone-100 text-stone-700",
};

const relationTypeLabels: Record<KnowledgeRelationType, string> = {
  applied_to: "Applicata a",
  resulted_in: "Ha prodotto",
  under_conditions: "Valida in condizioni",
  correlated_with: "Correlata con",
  contradicts: "In contrasto con",
};

const relationTypeClasses: Record<KnowledgeRelationType, string> = {
  applied_to: "bg-emerald-100 text-emerald-800",
  resulted_in: "bg-sky-100 text-sky-800",
  under_conditions: "bg-amber-100 text-amber-800",
  correlated_with: "bg-violet-100 text-violet-800",
  contradicts: "bg-rose-100 text-rose-800",
};

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function KnowledgeGraphPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Memoria istituzionale
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Grafo della conoscenza cooperativa & memoria condivisa
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Unifica pratiche, risultati, condizioni stagionali e sapere dei soci senior in un patrimonio operativo interrogabile.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Entità mappate"
          value={String(entities.length)}
          change={`${farmers.length} profili agricoltori con contributi attivi`}
          trend="up"
        />
        <StatCard
          label="Relazioni validate"
          value={String(relations.length)}
          change="Connessioni pratica-risultato-condizione"
          trend="up"
        />
        <StatCard
          label="Query risolte"
          value={String(queries.length)}
          change="Domande in linguaggio naturale archiviate"
          trend="neutral"
        />
        <StatCard
          label="Dossier campo"
          value={String(fieldDossiers.length)}
          change={`${currentDigest.season} ${currentDigest.year} con digest attivo`}
          trend="up"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Entità del grafo</h2>
              <p className="text-sm text-emerald-950/65">
                Pratiche, varietà, condizioni, campi ed esiti storicizzati con grado di confidenza.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">Descrizione</th>
                <th className="px-6 py-4 font-semibold">Confidenza</th>
                <th className="px-6 py-4 font-semibold">Data point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {entities.map((entity) => (
                <tr key={entity.id}>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${entityTypeClasses[entity.type]}`}
                    >
                      {entityTypeLabels[entity.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-950">{entity.name}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{entity.description}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{formatPercent(entity.confidence)}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{entity.dataPoints.toLocaleString("it-IT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <GitBranch className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Relazioni chiave</h2>
              <p className="text-sm text-emerald-950/65">
                Connessioni campo-pratica-risultato con forza statistica ed evidenze raccolte.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Connessione</th>
                <th className="px-6 py-4 font-semibold">Tipo relazione</th>
                <th className="px-6 py-4 font-semibold">Forza</th>
                <th className="px-6 py-4 font-semibold">Evidenze</th>
                <th className="px-6 py-4 font-semibold">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {relations.map((relation) => {
                const fromEntity = entities.find((entity) => entity.id === relation.fromId);
                const toEntity = entities.find((entity) => entity.id === relation.toId);

                return (
                  <tr key={relation.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-emerald-950">
                        {fromEntity?.name ?? relation.fromId} → {toEntity?.name ?? relation.toId}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${relationTypeClasses[relation.relationType]}`}
                      >
                        {relationTypeLabels[relation.relationType]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{formatPercent(relation.strength)}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{relation.evidenceCount}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{relation.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <KnowledgeGraphDetails />
    </div>
  );
}
