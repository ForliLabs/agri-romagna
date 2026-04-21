import {
  Bot,
  Droplets,
  Shield,
  Sprout,
  Sun,
  ThermometerSun,
  TrendingUp,
  Eye,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { demoAdvisories } from "@/lib/ai-advisor";
import { fields } from "@/lib/data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

const fieldMap = new Map(fields.map((f) => [f.id, f]));

const categoryIcons: Record<string, typeof Sprout> = {
  irrigazione: Droplets,
  trattamento: Shield,
  raccolta: Sprout,
  protezione: ThermometerSun,
  nutrizione: Sun,
  monitoraggio: Eye,
};

const categoryLabels: Record<string, string> = {
  irrigazione: "Irrigazione",
  trattamento: "Trattamento",
  raccolta: "Raccolta",
  protezione: "Protezione",
  nutrizione: "Nutrizione",
  monitoraggio: "Monitoraggio",
};

const priorityClasses: Record<string, string> = {
  alta: "bg-rose-100 text-rose-800",
  media: "bg-amber-100 text-amber-800",
  bassa: "bg-emerald-50 text-emerald-800",
};

// Group advisories by priority
const highPriority = demoAdvisories.filter((a) => a.priority === "alta");
const medPriority = demoAdvisories.filter((a) => a.priority === "media");
const lowPriority = demoAdvisories.filter((a) => a.priority === "bassa");

export default function AdvisorPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Consulente agronomico AI
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Consigli intelligenti per le tue colture.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Raccomandazioni personalizzate basate sui dati dei tuoi campi, previsioni meteo e
          buone pratiche agronomiche. Generato automaticamente per ogni appezzamento.
        </p>
      </section>

      {/* Summary */}
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-emerald-950/60">Priorità alta</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{highPriority.length}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-rose-700 font-medium">Azione immediata consigliata</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-emerald-950/60">Priorità media</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{medPriority.length}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-amber-700 font-medium">Da pianificare</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-emerald-950/60">Monitoraggio</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{lowPriority.length}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-emerald-700 font-medium">Routine settimanale</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Advisory list */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Raccomandazioni attive</h2>
              <p className="text-sm text-emerald-950/65">Basate su dati campo + meteo</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {demoAdvisories.map((adv) => {
              const field = fieldMap.get(adv.fieldId);
              const IconComp = categoryIcons[adv.category] ?? Eye;
              return (
                <article key={adv.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white p-2 shadow-sm">
                        <IconComp className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityClasses[adv.priority]}`}>
                            {adv.priority}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            {categoryLabels[adv.category]}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-emerald-950">{adv.title}</h3>
                        <p className="mt-1 text-xs text-emerald-950/55">
                          {field?.name} · {field?.crop}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-emerald-950/80">
                    <p className="font-medium text-emerald-950">💡 Consiglio:</p>
                    <p className="mt-1">{adv.recommendation}</p>
                  </div>

                  <div className="mt-3 rounded-xl bg-emerald-50/50 p-3 text-sm text-emerald-950/65">
                    <p className="font-medium text-emerald-800">Ragionamento:</p>
                    <p className="mt-1">{adv.reasoning}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-950/50">
                    <span>🕐 {adv.actionWindow}</span>
                    <span>📊 Confidenza: {adv.confidence}%</span>
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        {/* Chat placeholder */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Chiedi ad AgriRomagna</h2>
              <p className="text-sm text-emerald-950/65">Assistente agronomico conversazionale</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Demo conversation */}
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Bot className="h-4 w-4" /> AgriRomagna AI
              </div>
              <p className="mt-2 text-emerald-950/80 leading-6">
                Buongiorno! Sono il consulente agronomico di AgriRomagna. Posso aiutarti con
                consigli su irrigazione, trattamenti, tempistica di raccolta e protezione
                delle colture. Come posso aiutarti oggi?
              </p>
            </div>

            <div className="rounded-2xl bg-[#f7f4ec] p-4 text-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950/60">
                👨‍🌾 Tu
              </div>
              <p className="mt-2 text-emerald-950/80 leading-6">
                Quando dovrei irrigare la Vigna Collina Sud questa settimana?
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4 text-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Bot className="h-4 w-4" /> AgriRomagna AI
              </div>
              <p className="mt-2 text-emerald-950/80 leading-6">
                Per la Vigna Collina Sud (Sangiovese, 3.5 ha), lo stato attuale
                dell&apos;irrigazione è: a goccia con turnazione ogni 48h. Con le piogge
                previste mercoledì (70% probabilità), consiglio di sospendere il turno
                di martedì sera e riprendere venerdì. Il suolo dovrebbe ricevere
                precipitazioni sufficienti per coprire il fabbisogno della settimana.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f7f4ec] p-4 text-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950/60">
                👨‍🌾 Tu
              </div>
              <p className="mt-2 text-emerald-950/80 leading-6">
                Ottimo, e per il trattamento contro l&apos;oidio?
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4 text-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Bot className="h-4 w-4" /> AgriRomagna AI
              </div>
              <p className="mt-2 text-emerald-950/80 leading-6">
                Per il trattamento oidio sul Sangiovese: la finestra migliore è lunedì
                mattina (6:00-9:00) con solo 10% probabilità pioggia e 14-25°C. Consiglio
                zolfo bagnabile a 3 kg/ha per il biologico. Il prossimo passaggio dovrà
                avvenire venerdì dopo l&apos;asciugatura post-pioggia. Tempo di carenza: 5 giorni.
              </p>
            </div>
          </div>

          {/* Input placeholder */}
          <div className="mt-6 flex gap-2">
            <input
              type="text"
              placeholder="Chiedi un consiglio agronomico..."
              disabled
              className="flex-1 rounded-xl border border-emerald-950/15 bg-white px-4 py-3 text-sm text-emerald-950 placeholder:text-emerald-950/35 disabled:opacity-60"
            />
            <button
              disabled
              className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Invia
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-emerald-950/40">
            ⚠️ Consiglio agronomico automatizzato. Non sostituisce la consulenza professionale.
          </p>
        </article>
      </section>
    </div>
  );
}
