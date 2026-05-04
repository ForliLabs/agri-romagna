"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Droplets,
  Eye,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  Sprout,
  Sun,
  ThermometerSun,
  TrendingUp,
} from "lucide-react";
import { EmptyState, ErrorState, SkeletonBlock } from "@/components/ui/states";
import { useToast } from "@/components/toast-provider";
import { readApiError } from "@/lib/api-client";
import type { Advisory, ChatMessage } from "@/lib/ai-advisor";
import { fields } from "@/lib/data";

const fieldMap = new Map(fields.map((field) => [field.id, field]));

const categoryIcons = {
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

const initialMessages: ChatMessage[] = [
  {
    id: "welcome-message",
    role: "assistant",
    content:
      "Buongiorno! Posso aiutarti con irrigazione, trattamenti, raccolta e protezione delle colture. Seleziona un campo per ottenere consigli più pertinenti.",
    timestamp: new Date().toISOString(),
  },
];

export default function AdvisorPage() {
  const { pushToast } = useToast();
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAdvisories() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/advisor");
        if (!response.ok) {
          throw new Error(await readApiError(response));
        }
        const payload = (await response.json()) as { advisories: Advisory[] };
        if (!cancelled) setAdvisories(payload.advisories || []);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Impossibile caricare i consigli agronomici.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAdvisories();
    return () => {
      cancelled = true;
    };
  }, []);

  const groupedCounts = useMemo(
    () => ({
      alta: advisories.filter((item) => item.priority === "alta").length,
      media: advisories.filter((item) => item.priority === "media").length,
      bassa: advisories.filter((item) => item.priority === "bassa").length,
    }),
    [advisories]
  );

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: draft.trim(),
      timestamp: new Date().toISOString(),
      relatedFieldId: selectedFieldId || undefined,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setSending(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, fieldId: selectedFieldId || undefined }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const payload = (await response.json()) as {
        response: string;
        fieldContext?: string;
        timestamp: string;
        disclaimer?: string;
      };

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.response,
          timestamp: payload.timestamp,
          relatedFieldId: selectedFieldId || undefined,
        },
      ]);
    } catch (sendError) {
      pushToast({
        variant: "error",
        title: "Messaggio non inviato",
        message:
          sendError instanceof Error
            ? sendError.message
            : "Impossibile ottenere un consiglio agronomico in questo momento.",
      });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8" aria-hidden="true">
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-10 w-80" />
          <SkeletonBlock className="h-4 w-[32rem] max-w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
              <SkeletonBlock className="h-6 w-6" />
              <SkeletonBlock className="mt-4 h-7 w-20" />
              <SkeletonBlock className="mt-3 h-4 w-28" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <SkeletonBlock className="h-8 w-48" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-32 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <SkeletonBlock className="h-8 w-40" />
            <SkeletonBlock className="mt-6 h-72 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Consulente non disponibile"
        description={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

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
          Raccomandazioni personalizzate basate sui dati dei campi, sulle previsioni meteo e su regole agronomiche locali. Ora puoi anche fare domande in linguaggio naturale.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <TrendingUp className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-emerald-950/60">Priorità alta</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{groupedCounts.alta}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-rose-700">Azione immediata consigliata</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-emerald-950/60">Priorità media</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{groupedCounts.media}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-amber-700">Da pianificare nei prossimi giorni</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Eye className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-emerald-950/60">Monitoraggio</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{groupedCounts.bassa}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-emerald-700">Routine settimanale e controllo continuo</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <Bot className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Raccomandazioni attive</h2>
              <p className="text-sm text-emerald-950/65">Basate su dati campo e meteo cooperativo</p>
            </div>
          </div>

          {advisories.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Nessuna raccomandazione disponibile"
                description="Quando saranno disponibili nuovi dati da campi, meteo e trattamenti, qui troverai i suggerimenti prioritari per la giornata operativa."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {advisories.map((advisory) => {
                const field = fieldMap.get(advisory.fieldId);
                const Icon = categoryIcons[advisory.category] ?? Eye;
                return (
                  <article key={advisory.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2 shadow-sm">
                          <Icon className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityClasses[advisory.priority]}`}>
                              {advisory.priority}
                            </span>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                              {categoryLabels[advisory.category]}
                            </span>
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-emerald-950">{advisory.title}</h3>
                          <p className="mt-1 text-xs text-emerald-950/55">
                            {field?.name} · {field?.crop}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-emerald-950/80">
                      <p className="font-medium text-emerald-950">💡 Consiglio</p>
                      <p className="mt-1">{advisory.recommendation}</p>
                    </div>

                    <div className="mt-3 rounded-xl bg-emerald-50/50 p-3 text-sm text-emerald-950/65">
                      <p className="font-medium text-emerald-800">Ragionamento</p>
                      <p className="mt-1">{advisory.reasoning}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-950/50">
                      <span>🕐 {advisory.actionWindow}</span>
                      <span>📊 Confidenza: {advisory.confidence}%</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Chiedi ad AgriRomagna</h2>
              <p className="text-sm text-emerald-950/65">Assistente agronomico conversazionale</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 rounded-3xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "assistant" ? "rounded-2xl bg-emerald-50 p-4 text-sm" : "rounded-2xl bg-white p-4 text-sm"}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  {message.role === "assistant" ? (
                    <>
                      <Bot className="h-4 w-4" aria-hidden="true" /> AgriRomagna AI
                    </>
                  ) : (
                    <>👨‍🌾 Tu</>
                  )}
                </div>
                <p className="mt-2 leading-6 text-emerald-950/80">{message.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-emerald-950">Campo opzionale</span>
              <select
                value={selectedFieldId}
                onChange={(event) => setSelectedFieldId(event.target.value)}
                className="w-full rounded-xl border border-emerald-950/15 bg-white px-4 py-3 text-sm text-emerald-950"
              >
                <option value="">Nessun campo selezionato</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name} · {field.crop}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Chiedi un consiglio agronomico..."
                className="flex-1 rounded-xl border border-emerald-950/15 bg-white px-4 py-3 text-sm text-emerald-950 placeholder:text-emerald-950/35"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Invio…" : "Invia"}
                {!sending ? <Send className="h-4 w-4" aria-hidden="true" /> : null}
              </button>
            </div>
          </form>

          <p className="mt-3 text-center text-xs text-emerald-950/45">
            ⚠️ Consiglio agronomico automatizzato. Non sostituisce la consulenza professionale.
          </p>
        </article>
      </section>
    </div>
  );
}
