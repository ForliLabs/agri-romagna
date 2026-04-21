import type { Field, WeatherCurrent, ForecastDay } from "@/lib/data";
import { InMemoryStore } from "@/lib/db";

// --- AI Advisor Types ---

export type AdvisoryCategory =
  | "irrigazione"
  | "trattamento"
  | "raccolta"
  | "protezione"
  | "nutrizione"
  | "monitoraggio";

export type AdvisoryPriority = "alta" | "media" | "bassa";

export interface Advisory {
  id: string;
  fieldId: string;
  date: string;
  category: AdvisoryCategory;
  priority: AdvisoryPriority;
  title: string;
  recommendation: string;
  reasoning: string;
  actionWindow: string;
  confidence: number; // 0-100
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  relatedFieldId?: string;
}

export interface AdvisorFeedback {
  advisoryId: string;
  helpful: boolean;
  comment?: string;
}

// --- Rule-Based Advisory Engine ---
// In production, this would call an LLM API (OpenAI/Anthropic/Mistral)
// with structured prompts combining field data + weather + agronomic rules

interface AdvisoryInput {
  field: Field;
  currentWeather: WeatherCurrent;
  forecast: ForecastDay[];
  date: string;
}

export function generateAdvisories(inputs: AdvisoryInput[]): Advisory[] {
  const advisories: Advisory[] = [];
  let idCounter = 0;

  for (const { field, currentWeather, forecast, date } of inputs) {
    const nextId = () => `adv-${++idCounter}`;

    // Irrigation advisory
    if (currentWeather.temperatureC > 28 && currentWeather.humidity < 50) {
      advisories.push({
        id: nextId(),
        fieldId: field.id,
        date,
        category: "irrigazione",
        priority: "alta",
        title: `Irrigazione urgente per ${field.name}`,
        recommendation: `Con ${currentWeather.temperatureC}°C e umidità al ${currentWeather.humidity}%, attivare irrigazione a goccia per ${field.crop}. Programmare ciclo serale (dopo le 19:00) per ridurre evapotraspirazione.`,
        reasoning: `Temperature elevate e bassa umidità indicano stress idrico imminente per ${field.crop}. L'irrigazione serale massimizza l'assorbimento radicale.`,
        actionWindow: "Oggi, dopo le 19:00",
        confidence: 88,
      });
    }

    // Rain-based irrigation skip
    const rainySoon = forecast.some((d) => d.rainProbability > 60);
    if (rainySoon && field.irrigation.includes("goccia")) {
      advisories.push({
        id: nextId(),
        fieldId: field.id,
        date,
        category: "irrigazione",
        priority: "media",
        title: `Sospendere irrigazione — pioggia prevista`,
        recommendation: `Pioggia prevista nei prossimi giorni (probabilità >60%). Sospendere i turni di irrigazione per ${field.name} per evitare ristagni e sprechi idrici.`,
        reasoning: `Le precipitazioni attese copriranno il fabbisogno idrico. Il suolo potrebbe saturarsi con irrigazione aggiuntiva.`,
        actionWindow: "Prossimi 2-3 giorni",
        confidence: 75,
      });
    }

    // Treatment window advisory
    const clearDays = forecast.filter(
      (d) => d.rainProbability < 25 && d.maxC > 15 && d.maxC < 30
    );
    if (clearDays.length >= 2 && field.crop === "Sangiovese") {
      advisories.push({
        id: nextId(),
        fieldId: field.id,
        date,
        category: "trattamento",
        priority: "media",
        title: `Finestra ideale per trattamento su ${field.name}`,
        recommendation: `Le condizioni di ${clearDays[0].day} e ${clearDays[1].day} sono ottimali per trattamenti fogliari sul Sangiovese: bassa probabilità di pioggia, temperature moderate (${clearDays[0].maxC}–${clearDays[1].maxC}°C). Programmare applicazione al mattino presto (6:00-9:00).`,
        reasoning: `Finestre asciutte con temperature moderate permettono assorbimento ottimale del prodotto. Il trattamento mattutino evita evaporazione rapida.`,
        actionWindow: `${clearDays[0].day}–${clearDays[1].day}, ore 6:00-9:00`,
        confidence: 82,
      });
    }

    // Harvest timing
    if (field.status.includes("Maturazione") || field.status.includes("Granigione")) {
      const dryStretch = forecast.filter((d) => d.rainProbability < 30).length;
      advisories.push({
        id: nextId(),
        fieldId: field.id,
        date,
        category: "raccolta",
        priority: field.status.includes("Maturazione") ? "alta" : "media",
        title: `Pianificazione raccolta — ${field.crop}`,
        recommendation: `${field.crop} in fase "${field.status}". ${
          dryStretch >= 3
            ? `Finestra di ${dryStretch} giorni asciutti disponibile. Condizioni favorevoli per la raccolta.`
            : `Solo ${dryStretch} giorni asciutti previsti. Valutare raccolta anticipata se la qualità lo permette.`
        }`,
        reasoning: `Lo stato vegetativo "${field.status}" indica prossimità alla maturazione commerciale. ${
          dryStretch >= 3 ? "La finestra meteo è favorevole." : "Condizioni meteo instabili richiedono decisione rapida."
        }`,
        actionWindow: `Prossimi ${dryStretch} giorni asciutti`,
        confidence: 70,
      });
    }

    // Frost protection
    const frostDays = forecast.filter((d) => d.minC <= 3);
    if (frostDays.length > 0 && (field.crop === "Sangiovese" || field.crop === "Albana" || field.crop === "Pesche")) {
      advisories.push({
        id: nextId(),
        fieldId: field.id,
        date,
        category: "protezione",
        priority: "alta",
        title: `⚠️ Rischio gelo per ${field.crop}`,
        recommendation: `Temperature fino a ${Math.min(...frostDays.map((d) => d.minC))}°C previste ${frostDays.map((d) => d.day).join(", ")}. Per ${field.crop}: ${
          field.crop === "Pesche"
            ? "attivare ventilatori antigelo se disponibili, o irrigazione antibrina."
            : "verificare teli protettivi e predisporre candele antigelo nelle interfile."
        }`,
        reasoning: `${field.crop} in fase vegetativa è vulnerabile a temperature sotto i 2°C. Danni ai germogli possono compromettere la produzione.`,
        actionWindow: frostDays.map((d) => `${d.day} notte`).join(", "),
        confidence: 90,
      });
    }

    // General crop monitoring
    advisories.push({
      id: nextId(),
      fieldId: field.id,
      date,
      category: "monitoraggio",
      priority: "bassa",
      title: `Monitoraggio settimanale — ${field.name}`,
      recommendation: `Verificare: ${field.health}. Controllare ${field.irrigation}. ${field.notes}`,
      reasoning: `Il monitoraggio regolare permette di anticipare problematiche e ottimizzare le operazioni colturali.`,
      actionWindow: "Questa settimana",
      confidence: 95,
    });
  }

  return advisories.sort((a, b) => {
    const priorityOrder: Record<AdvisoryPriority, number> = { alta: 0, media: 1, bassa: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Chat response generator (rule-based; in production: LLM API)
export function generateChatResponse(message: string, fieldContext?: Field): string {
  const lower = message.toLowerCase();

  if (lower.includes("irrigazione") || lower.includes("acqua")) {
    return fieldContext
      ? `Per ${fieldContext.name} (${fieldContext.crop}), lo stato attuale dell'irrigazione è: ${fieldContext.irrigation}. In base alle condizioni attuali, consiglio di monitorare l'umidità del suolo e regolare i turni in base alle previsioni meteo dei prossimi 3 giorni. Per il ${fieldContext.crop}, il fabbisogno idrico in questa fase ("${fieldContext.status}") è ${fieldContext.crop === "Grano tenero" ? "ridotto" : "moderato-alto"}.`
      : "Per consigli specifici sull'irrigazione, seleziona un campo. In generale, nella Romagna forlivese in questo periodo, consiglio irrigazione serale per ridurre l'evapotraspirazione e turni ogni 48-72h per colture viticole.";
  }

  if (lower.includes("trattamento") || lower.includes("malattia") || lower.includes("fungo")) {
    return fieldContext
      ? `Per ${fieldContext.crop} nel campo ${fieldContext.name}: ${fieldContext.notes}. Consiglio di verificare le previsioni meteo per una finestra asciutta di almeno 24h prima di procedere con trattamenti. Per il biologico, i prodotti rameici sono ammessi con dosaggi massimi di 4 kg Cu/ha/anno.`
      : "Indicami il campo e la problematica specifica. Per i trattamenti, ricorda: finestra asciutta di almeno 24h, applicazione al mattino presto (6-9), e rispetto dei tempi di carenza.";
  }

  if (lower.includes("raccolta") || lower.includes("vendemmia") || lower.includes("maturazione")) {
    return fieldContext
      ? `${fieldContext.name} è in fase "${fieldContext.status}" con volume atteso di ${fieldContext.expectedVolume} tonnellate. La raccolta è programmata per il ${fieldContext.expectedHarvest}. Consiglio di monitorare i parametri qualitativi (°Brix per l'uva, calibro per la frutta) e verificare le condizioni meteo nella settimana della raccolta.`
      : "Per consigli sulla raccolta, seleziona il campo specifico. In generale, per l'uva romagnola: raccolta a 20-22 °Brix per vinificazione standard, 23-25 °Brix per passito.";
  }

  return fieldContext
    ? `Per il campo ${fieldContext.name} (${fieldContext.crop}, ${fieldContext.areaHa} ha a ${fieldContext.municipality}): stato attuale "${fieldContext.status}", salute "${fieldContext.health}". ${fieldContext.notes} Hai una domanda specifica su irrigazione, trattamenti o raccolta?`
    : "Sono l'assistente agronomico di AgriRomagna. Posso consigliarti su irrigazione, trattamenti, tempistica di raccolta e protezione delle colture. Seleziona un campo o fammi una domanda specifica sulla tua attività agricola nella Romagna forlivese.";
}

// Pre-generated advisories for demo
import { fields, weatherData } from "@/lib/data";

export const demoAdvisories = generateAdvisories(
  fields.map((field) => ({
    field,
    currentWeather: weatherData.current,
    forecast: weatherData.forecast,
    date: new Date().toISOString().slice(0, 10),
  }))
);

export const advisoriesStore = new InMemoryStore<Advisory>();
advisoriesStore.seed(demoAdvisories.map((a) => ({ ...a })));
