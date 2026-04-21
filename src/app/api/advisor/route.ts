import { advisoriesStore, generateChatResponse } from "@/lib/ai-advisor";
import { fields } from "@/lib/data";

export async function GET() {
  const advisories = await advisoriesStore.findAll();
  return Response.json({ advisories });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { message: string; fieldId?: string };

  if (!body.message) {
    return Response.json(
      { error: "Il messaggio è obbligatorio." },
      { status: 400 }
    );
  }

  const field = body.fieldId
    ? fields.find((f) => f.id === body.fieldId)
    : undefined;

  const response = generateChatResponse(body.message, field);

  return Response.json({
    response,
    fieldContext: field?.name,
    timestamp: new Date().toISOString(),
    disclaimer: "Consiglio agronomico automatizzato. Non sostituisce la consulenza professionale.",
  });
}
