import { BarChart3, FileArchive, Link2, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  getAuditPackages,
  getComplianceChains,
  getComplianceMappings,
  getComplianceScores,
} from "@/lib/compliance-chain-data";
import { fields } from "@/lib/data";

const complianceChains = getComplianceChains();
const complianceMappings = getComplianceMappings();
const auditPackages = getAuditPackages();
const complianceScores = getComplianceScores();

const fieldMap = new Map(fields.map((field) => [field.id, field.name]));

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const operationTypeLabels = {
  spray: "Trattamento",
  fertilizer: "Fertilizzazione",
  harvest: "Raccolta",
  irrigation: "Irrigazione",
  worker_assignment: "Assegnazione squadra",
};

const frameworkLabels = {
  pac: "PAC",
  biologico: "Biologico",
  globalg_a_p: "GLOBALG.A.P.",
  sqnpi: "SQNPI",
  dop: "DOP",
};

const frameworkClasses = {
  pac: "bg-sky-100 text-sky-800",
  biologico: "bg-emerald-100 text-emerald-800",
  globalg_a_p: "bg-violet-100 text-violet-800",
  sqnpi: "bg-amber-100 text-amber-800",
  dop: "bg-rose-100 text-rose-800",
};

const chainStatusLabels = {
  complete: "Completa",
  partial: "Parziale",
  pending: "In attesa",
};

const chainStatusClasses = {
  complete: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  pending: "bg-sky-100 text-sky-800",
};

const auditStatusLabels = {
  ready: "Pronto",
  generating: "In generazione",
  expired: "Scaduto",
};

const auditStatusClasses = {
  ready: "bg-emerald-100 text-emerald-800",
  generating: "bg-amber-100 text-amber-800",
  expired: "bg-rose-100 text-rose-800",
};

const averageCompleteness = Math.round(
  complianceChains.reduce((sum, chain) => sum + chain.completeness, 0) / complianceChains.length,
);
const frameworksCovered = new Set(complianceMappings.map((mapping) => mapping.framework)).size;
const readyPackages = auditPackages.filter((auditPackage) => auditPackage.status === "ready").length;

export default function ComplianceChainPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Catena conformità
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Evidenze collegate tra operazioni di campo, audit e framework normativi.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Ogni trattamento, raccolta o intervento irriguo genera una catena hash con prove collegate
          da compliance, workforce, attrezzature, traceability, meteo, carbonio e suolo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Catene totali"
          value={String(complianceChains.length)}
          change="Operazioni recenti con evidenze collegate"
          trend="up"
        />
        <StatCard
          label="Completezza media"
          value={`${averageCompleteness}%`}
          change="Copertura automatica del dossier operativo"
          trend={averageCompleteness >= 90 ? "up" : "neutral"}
        />
        <StatCard
          label="Framework coperti"
          value={String(frameworksCovered)}
          change="PAC, biologico, GLOBALG.A.P., SQNPI e DOP"
          trend="up"
        />
        <StatCard
          label="Audit pronti"
          value={String(readyPackages)}
          change={`${auditPackages.length} pacchetti disponibili nel registro export`}
          trend="up"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Link2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Catene di evidenza recenti</h2>
              <p className="text-sm text-emerald-950/65">
                Vista delle operazioni con numero prove, hash, completezza e stato di verifica.
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Operazione</th>
                <th className="px-6 py-4 font-semibold">Campo</th>
                <th className="px-6 py-4 font-semibold">Evidenze</th>
                <th className="px-6 py-4 font-semibold">Hash</th>
                <th className="px-6 py-4 font-semibold">Completezza</th>
                <th className="px-6 py-4 font-semibold">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {complianceChains.map((chain) => (
                <tr key={chain.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-emerald-950">
                      {operationTypeLabels[chain.operationType]}
                    </p>
                    <p className="mt-1 text-xs text-emerald-950/55">
                      {dateTimeFormatter.format(new Date(chain.timestamp))} · {chain.operationId}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">
                    {fieldMap.get(chain.fieldId) ?? chain.fieldId}
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">{chain.evidenceLinks.length}</td>
                  <td className="px-6 py-4 font-mono text-xs text-emerald-950/70">{chain.hashChain}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{chain.completeness}%</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${chainStatusClasses[chain.status]}`}
                    >
                      {chainStatusLabels[chain.status]}
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
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Mappature compliance</h2>
                <p className="text-sm text-emerald-950/65">
                  Evidenze minime richieste per tipo operazione e framework regolatorio.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            {complianceMappings.map((mapping) => (
              <article key={mapping.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {operationTypeLabels[mapping.operationType]}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                      {mapping.description}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${frameworkClasses[mapping.framework]}`}
                  >
                    {frameworkLabels[mapping.framework]}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-emerald-950/75">
                  {mapping.requiredEvidence.map((evidence) => (
                    <div
                      key={`${mapping.id}-${evidence.module}-${evidence.description}`}
                      className="rounded-2xl border border-emerald-950/10 bg-white p-3"
                    >
                      <p className="font-semibold text-emerald-950">{evidence.module}</p>
                      <p className="mt-1">{evidence.description}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-emerald-950/50">
                        {evidence.mandatory ? "Obbligatoria" : "Opzionale"} · {evidence.autoGenerated ? "Auto-generata" : "Manuale"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
          <div className="border-b border-emerald-950/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <FileArchive className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">Pacchetti audit</h2>
                <p className="text-sm text-emerald-950/65">
                  Export pronti per ente certificatore, SIAN e verifiche interne di cooperativa.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
              <thead className="bg-[#f7f4ec] text-emerald-950/65">
                <tr>
                  <th className="px-6 py-4 font-semibold">Azienda</th>
                  <th className="px-6 py-4 font-semibold">Framework</th>
                  <th className="px-6 py-4 font-semibold">Periodo</th>
                  <th className="px-6 py-4 font-semibold">Completezza</th>
                  <th className="px-6 py-4 font-semibold">Formato</th>
                  <th className="px-6 py-4 font-semibold">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10 bg-white">
                {auditPackages.map((auditPackage) => (
                  <tr key={auditPackage.id}>
                    <td className="px-6 py-4 font-semibold text-emerald-950">{auditPackage.farmName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${frameworkClasses[auditPackage.framework]}`}
                      >
                        {frameworkLabels[auditPackage.framework]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{auditPackage.period}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{auditPackage.completeness}%</td>
                    <td className="px-6 py-4 text-emerald-950/75">{auditPackage.format.toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${auditStatusClasses[auditPackage.status]}`}
                      >
                        {auditStatusLabels[auditPackage.status]}
                      </span>
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
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Score conformità per azienda</h2>
              <p className="text-sm text-emerald-950/65">
                Punteggio complessivo per farm con gap puntuali sui framework monitorati.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-6 lg:grid-cols-2">
          {complianceScores.map((score) => (
            <article key={score.farmId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-950">{score.farmName}</h3>
                  <p className="mt-1 text-sm text-emerald-950/65">{score.period}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
                  Score {score.overall}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {score.byFramework.map((framework) => (
                  <div key={`${score.farmId}-${framework.framework}`} className="rounded-2xl border border-emerald-950/10 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-emerald-950">{framework.framework}</p>
                      <span className="text-sm font-semibold text-emerald-700">{framework.score}/100</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-950/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                        style={{ width: `${framework.score}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-emerald-950/60">
                      {framework.gaps.length > 0 ? (
                        framework.gaps.map((gap) => (
                          <span
                            key={`${score.farmId}-${framework.framework}-${gap}`}
                            className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800"
                          >
                            Gap: {gap}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
                          Nessun gap aperto
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
