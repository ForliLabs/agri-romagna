import { advisoriesStore, generateChatResponse } from "@/lib/ai-advisor";
import type { ChatMessage, AdvisorFeedback } from "@/lib/ai-advisor";
import { InMemoryStore } from "@/lib/db";
import { fields } from "@/lib/data";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";

// Chat history and feedback stores
const chatHistoryStore = new InMemoryStore<ChatMessage>();
const feedbackStore = new InMemoryStore<AdvisorFeedback & { id: string; timestamp: string }>();

/**
 * GET /api/advisor — Returns advisories, chat history, and feedback stats.
 * POST /api/advisor — Send chat messages or submit feedback.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "advisor:read");
  if (denied) return denied;

  const url = new URL(request.url);
  const fieldId = url.searchParams.get("fieldId");

  const advisories = await advisoriesStore.findAll();
  const chatHistory = await chatHistoryStore.findAll();
  const allFeedback = await feedbackStore.findAll();

  const filteredAdvisories = fieldId
    ? advisories.filter((a) => a.fieldId === fieldId)
    : advisories;

  const feedbackSummary = {
    total: allFeedback.length,
    helpful: allFeedback.filter((f) => f.helpful).length,
    notHelpful: allFeedback.filter((f) => !f.helpful).length,
    helpfulRate: allFeedback.length > 0
      ? Math.round((allFeedback.filter((f) => f.helpful).length / allFeedback.length) * 100)
      : 0,
  };

  return createSuccessResponse(
    {
      advisories: filteredAdvisories,
      chatHistory: chatHistory.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      feedbackSummary,
      stats: {
        totalAdvisories: advisories.length,
        highPriority: advisories.filter((a) => a.priority === "alta").length,
        categories: [...new Set(advisories.map((a) => a.category))],
        averageConfidence: Math.round(
          advisories.reduce((sum, a) => sum + a.confidence, 0) / advisories.length
        ),
      },
    },
    { meta: { domain: "advisor" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "advisor:read");
  if (denied) return denied;

  const body = (await request.json()) as {
    action?: "chat" | "feedback";
    message?: string;
    fieldId?: string;
    advisoryId?: string;
    helpful?: boolean;
    comment?: string;
  };

  const action = body.action ?? "chat";

  if (action === "feedback") {
    if (!body.advisoryId || body.helpful === undefined) {
      return createProblemResponse(
        400,
        "Dati mancanti",
        "Specifica advisoryId e helpful (true/false)."
      );
    }

    const feedback = {
      id: `fb-${Date.now()}`,
      advisoryId: body.advisoryId,
      helpful: body.helpful,
      comment: body.comment,
      timestamp: new Date().toISOString(),
    };
    await feedbackStore.create(feedback);

    return createSuccessResponse(
      {
        feedback,
        message: body.helpful
          ? "Grazie! Il tuo feedback migliora i consigli futuri."
          : "Grazie per la segnalazione. Ricalibreremo i parametri.",
      },
      { status: 201, meta: { domain: "advisor" } }
    );
  }

  // Chat action
  if (!body.message) {
    return createProblemResponse(400, "Messaggio mancante", "Il messaggio è obbligatorio.");
  }

  const field = body.fieldId
    ? fields.find((f) => f.id === body.fieldId)
    : undefined;

  // Store user message
  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}-user`,
    role: "user",
    content: body.message,
    timestamp: new Date().toISOString(),
    relatedFieldId: body.fieldId,
  };
  await chatHistoryStore.create(userMsg);

  // Generate response
  const responseText = generateChatResponse(body.message, field);

  // Store assistant response
  const assistantMsg: ChatMessage = {
    id: `msg-${Date.now()}-assistant`,
    role: "assistant",
    content: responseText,
    timestamp: new Date().toISOString(),
    relatedFieldId: body.fieldId,
  };
  await chatHistoryStore.create(assistantMsg);

  return createSuccessResponse(
    {
      response: assistantMsg,
      fieldContext: field?.name,
      disclaimer:
        "Consiglio agronomico automatizzato basato su regole. Non sostituisce la consulenza professionale di un agronomo abilitato.",
    },
    { meta: { domain: "advisor" } }
  );
});
