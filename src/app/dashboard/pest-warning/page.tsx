import { Bug, CloudRain, Droplets, ShieldAlert, Thermometer } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import {
  diseaseModels,
  diseaseRisks,
  getActiveWarnings,
  getFieldDiseaseRisks,
  getTreatmentRecommendations,
} from "@/lib/pest-warning-data";
import { fields } from "@/lib/data";

const gaugeSegments = Array.from({ length: 10 }, (_, index) => index + 1);

const activeWarnings = getActiveWarnings();
const severityCounts = {
  critical: activeWarnings.filter((risk) => risk.riskLevel === "critical").length,
  high: activeWarnings.filter((risk) => risk.riskLevel === "high").length,
  moderate: activeWarnings.filter((risk) => risk.riskLevel === "moderate").length,
};
const riskByField = fields.map((field) => ({
  field,
  risks: getFieldDiseaseRisks(field.id),
}));
const recommendations = getTreatmentRecommendations();
const riskLookup = new Map(diseaseRisks.map((risk) => [risk.id, risk]));

const riskLevelClasses: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800",
  moderate: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-rose-100 text-rose-800",
};

const riskLevelLabels: Record<string, string> = {
  low: "Basso",
  moderate: "Moderato",
  high: "Alto",
  critical: "Critico",
};

const gaugeClasses: Record<string, string> = {
  low: "bg-emerald-500",
  moderate: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-rose-500",
};

export default function PestWarningPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Allerta fitosanitaria
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Rete precoce per parassiti e malattie.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Modelli di rischio per vite e pesco basati sui dati della stazione IoT aziendale,
          con priorità operative, finestre di trattamento e spiegazione delle soglie.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Avvisi attivi"
          value={String(activeWarnings.length)}
          change="Rischi sopra soglia di attenzione"
          trend="neutral"
        />
        <StatCard
          label="Critici"
          value={String(severityCounts.critical)}
          change="Intervento immediato richiesto"
          trend={severityCounts.critical > 0 ? "down" : "up"}
        />
        <StatCard
          label="Alti"
          value={String(severityCounts.high)}
          change="Difesa preventiva da pianificare"
          trend="neutral"
        />
        <StatCard
          label="Moderati"
          value={String(severityCounts.moderate)}
          change={`${recommendations.length} raccomandazioni disponibili`}
          trend="up"
        />
      </section>

      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Rischio per campo</h2>
            <p className="text-sm text-emerald-950/65">
              Gauge di pressione e fattori che stanno attivando i modelli
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {riskByField.map(({ field, risks }) => (
            <article key={field.id} className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-emerald-950">{field.name}</h3>
                  <p className="mt-1 text-sm text-emerald-950/65">
                    {field.crop} · {field.areaHa.toLocaleString("it-IT")} ha
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                  {risks.length} modelli
                </span>
              </div>

              {risks.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4 text-sm text-emerald-950/70">
                  Nessun modello attivo per questa coltura nella release corrente.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {risks.map((risk) => (
                    <article key={risk.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-emerald-950">{risk.disease}</p>
                          <p className="mt-1 text-xs text-emerald-950/55">Pressione {risk.pressureScore}/100</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskLevelClasses[risk.riskLevel]}`}>
                          {riskLevelLabels[risk.riskLevel]}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-1">
                        {gaugeSegments.map((segment) => (
                          <div
                            key={segment}
                            className={`h-2 flex-1 rounded-full ${
                              risk.pressureScore >= segment * 10
                                ? gaugeClasses[risk.riskLevel]
                                : "bg-emerald-950/10"
                            }`}
                          />
                        ))}
                      </div>

                      <ul className="mt-4 space-y-2 text-sm text-emerald-950/70">
                        {risk.triggerFactors.map((trigger) => (
                          <li key={trigger}>• {trigger}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Bug className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Raccomandazioni operative</h2>
              <p className="text-sm text-emerald-950/65">
                Prodotti, dosi e finestre meteo consigliate
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {recommendations.map((recommendation) => {
              const risk = riskLookup.get(recommendation.diseaseRiskId);
              const field = fields.find((item) => item.id === risk?.fieldId);
              return (
                <article key={recommendation.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-emerald-950">{risk?.disease}</p>
                      <p className="mt-1 text-xs text-emerald-950/55">
                        {field?.name} · {risk?.crop}
                      </p>
                    </div>
                    {risk && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskLevelClasses[risk.riskLevel]}`}>
                        {riskLevelLabels[risk.riskLevel]}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                    <div>
                      <p className="text-emerald-950/55">Prodotto</p>
                      <p className="mt-1 font-semibold text-emerald-950">{recommendation.product}</p>
                    </div>
                    <div>
                      <p className="text-emerald-950/55">Dosaggio</p>
                      <p className="mt-1 font-semibold text-emerald-950">{recommendation.dosage}</p>
                    </div>
                    <div>
                      <p className="text-emerald-950/55">Finestra applicativa</p>
                      <p className="mt-1 font-semibold text-emerald-950">{recommendation.applicationWindow}</p>
                    </div>
                    <div>
                      <p className="text-emerald-950/55">Vincoli operativi</p>
                      <p className="mt-1 font-semibold text-emerald-950">
                        {recommendation.constraints.organicCompatible ? "Compatibile BIO" : "Uso integrato"} · REI {recommendation.constraints.reEntryIntervalHours}h
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-emerald-950/70">
                    {recommendation.constraints.weatherRequirements}
                  </p>
                </article>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Thermometer className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Spiegazione dei modelli</h2>
              <p className="text-sm text-emerald-950/65">Soglie usate dalla rete di warning</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {diseaseModels.map((model) => (
              <article key={model.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center gap-2">
                  {model.disease === "Peronospora" && <CloudRain className="h-5 w-5 text-sky-700" />}
                  {model.disease === "Oidio" && <Droplets className="h-5 w-5 text-amber-700" />}
                  {model.disease === "Botrite" && <Bug className="h-5 w-5 text-rose-700" />}
                  {model.disease === "Monilia bruna" && <Thermometer className="h-5 w-5 text-orange-700" />}
                  <div>
                    <h3 className="font-semibold text-emerald-950">{model.disease}</h3>
                    <p className="text-xs text-emerald-950/55">{model.crop}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-emerald-950/70">
                  {model.thresholds.map((threshold) => (
                    <li key={threshold}>• {threshold}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-emerald-950/70">{model.note}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
